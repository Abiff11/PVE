import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class NormalizeInfraccionesModel1742860800000
  implements MigrationInterface
{
  name = 'NormalizeInfraccionesModel1742860800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "infractores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying NOT NULL,
        "genero" character varying NOT NULL,
        "numero_licencia" character varying NOT NULL,
        CONSTRAINT "PK_infractores_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_infractores_numero_licencia" ON "infractores" ("numero_licencia")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehiculos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "servicio" character varying NOT NULL,
        "clase" character varying NOT NULL,
        "tipo" character varying NOT NULL,
        "marca" character varying NOT NULL,
        "modelo" character varying NOT NULL,
        "color" character varying NOT NULL,
        "placas" character varying NOT NULL,
        "estado_placas" character varying NOT NULL,
        "serie" character varying NOT NULL,
        "motor" character varying NOT NULL,
        CONSTRAINT "PK_vehiculos_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_vehiculos_placas" ON "vehiculos" ("placas")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_vehiculos_serie" ON "vehiculos" ("serie")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ubicacion_inf" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "municipio" character varying NOT NULL,
        "agencia" character varying NOT NULL,
        "colonia" character varying NOT NULL,
        "calle" character varying NOT NULL,
        "m1" character varying,
        "m2" character varying,
        "m3" character varying,
        "m4" character varying,
        CONSTRAINT "PK_ubicacion_inf_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_ubicacion_inf_municipio" ON "ubicacion_inf" ("municipio")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_ubicacion_inf_agencia" ON "ubicacion_inf" ("agencia")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "catalogo_infraccion" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clave_oficial" character varying NOT NULL,
        CONSTRAINT "PK_catalogo_infraccion_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_catalogo_infraccion_clave_oficial" ON "catalogo_infraccion" ("clave_oficial")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "infraccion_detalle" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "numero_parte_informativo" character varying,
        "nombre_operativo" character varying NOT NULL,
        "sitio_servicio_publico" character varying,
        "infraccion_id" uuid NOT NULL,
        "catalogo_infraccion_id" uuid NOT NULL,
        CONSTRAINT "PK_infraccion_detalle_id" PRIMARY KEY ("id")
      )
    `);

    if (!(await queryRunner.hasColumn('infracciones', 'infractor_id'))) {
      await queryRunner.addColumn(
        'infracciones',
        new TableColumn({
          name: 'infractor_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('infracciones', 'vehiculo_id'))) {
      await queryRunner.addColumn(
        'infracciones',
        new TableColumn({
          name: 'vehiculo_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('infracciones', 'ubicacion_id'))) {
      await queryRunner.addColumn(
        'infracciones',
        new TableColumn({
          name: 'ubicacion_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      INSERT INTO "infractores" ("nombre", "genero", "numero_licencia")
      SELECT DISTINCT
        COALESCE("nombreInfractor", 'SIN DATO'),
        COALESCE("genero", 'NO_ESPECIFICADO'),
        COALESCE("numeroLicencia", 'SIN LICENCIA')
      FROM "infracciones" inf
      WHERE NOT EXISTS (
        SELECT 1
        FROM "infractores" i
        WHERE i."nombre" = COALESCE(inf."nombreInfractor", 'SIN DATO')
          AND i."genero" = COALESCE(inf."genero", 'NO_ESPECIFICADO')
          AND i."numero_licencia" = COALESCE(inf."numeroLicencia", 'SIN LICENCIA')
      )
    `);

    await queryRunner.query(`
      UPDATE "infracciones" inf
      SET "infractor_id" = i."id"
      FROM "infractores" i
      WHERE i."nombre" = COALESCE(inf."nombreInfractor", 'SIN DATO')
        AND i."genero" = COALESCE(inf."genero", 'NO_ESPECIFICADO')
        AND i."numero_licencia" = COALESCE(inf."numeroLicencia", 'SIN LICENCIA')
        AND inf."infractor_id" IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO "vehiculos" (
        "servicio", "clase", "tipo", "marca", "modelo", "color",
        "placas", "estado_placas", "serie", "motor"
      )
      SELECT DISTINCT
        COALESCE("servicio", 'SIN DATO'),
        COALESCE("clase", 'SIN DATO'),
        COALESCE("tipo", 'SIN DATO'),
        COALESCE("marca", 'SIN DATO'),
        COALESCE("modelo", 'SIN DATO'),
        COALESCE("color", 'SIN DATO'),
        COALESCE("placas", 'SIN DATO'),
        COALESCE("estadoPlacas", 'SIN DATO'),
        COALESCE("serie", 'SIN DATO'),
        COALESCE("motor", 'SIN DATO')
      FROM "infracciones" inf
      WHERE NOT EXISTS (
        SELECT 1
        FROM "vehiculos" v
        WHERE v."servicio" = COALESCE(inf."servicio", 'SIN DATO')
          AND v."clase" = COALESCE(inf."clase", 'SIN DATO')
          AND v."tipo" = COALESCE(inf."tipo", 'SIN DATO')
          AND v."marca" = COALESCE(inf."marca", 'SIN DATO')
          AND v."modelo" = COALESCE(inf."modelo", 'SIN DATO')
          AND v."color" = COALESCE(inf."color", 'SIN DATO')
          AND v."placas" = COALESCE(inf."placas", 'SIN DATO')
          AND v."estado_placas" = COALESCE(inf."estadoPlacas", 'SIN DATO')
          AND v."serie" = COALESCE(inf."serie", 'SIN DATO')
          AND v."motor" = COALESCE(inf."motor", 'SIN DATO')
      )
    `);

    await queryRunner.query(`
      UPDATE "infracciones" inf
      SET "vehiculo_id" = v."id"
      FROM "vehiculos" v
      WHERE v."servicio" = COALESCE(inf."servicio", 'SIN DATO')
        AND v."clase" = COALESCE(inf."clase", 'SIN DATO')
        AND v."tipo" = COALESCE(inf."tipo", 'SIN DATO')
        AND v."marca" = COALESCE(inf."marca", 'SIN DATO')
        AND v."modelo" = COALESCE(inf."modelo", 'SIN DATO')
        AND v."color" = COALESCE(inf."color", 'SIN DATO')
        AND v."placas" = COALESCE(inf."placas", 'SIN DATO')
        AND v."estado_placas" = COALESCE(inf."estadoPlacas", 'SIN DATO')
        AND v."serie" = COALESCE(inf."serie", 'SIN DATO')
        AND v."motor" = COALESCE(inf."motor", 'SIN DATO')
        AND inf."vehiculo_id" IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO "ubicacion_inf" ("municipio", "agencia", "colonia", "calle", "m1", "m2", "m3", "m4")
      SELECT DISTINCT
        COALESCE("municipio", 'SIN DATO'),
        COALESCE("agencia", 'SIN DATO'),
        COALESCE("colonia", 'SIN DATO'),
        COALESCE("calle", 'SIN DATO'),
        "m1", "m2", "m3", "m4"
      FROM "infracciones" inf
      WHERE NOT EXISTS (
        SELECT 1
        FROM "ubicacion_inf" u
        WHERE u."municipio" = COALESCE(inf."municipio", 'SIN DATO')
          AND u."agencia" = COALESCE(inf."agencia", 'SIN DATO')
          AND u."colonia" = COALESCE(inf."colonia", 'SIN DATO')
          AND u."calle" = COALESCE(inf."calle", 'SIN DATO')
          AND u."m1" IS NOT DISTINCT FROM inf."m1"
          AND u."m2" IS NOT DISTINCT FROM inf."m2"
          AND u."m3" IS NOT DISTINCT FROM inf."m3"
          AND u."m4" IS NOT DISTINCT FROM inf."m4"
      )
    `);

    await queryRunner.query(`
      UPDATE "infracciones" inf
      SET "ubicacion_id" = u."id"
      FROM "ubicacion_inf" u
      WHERE u."municipio" = COALESCE(inf."municipio", 'SIN DATO')
        AND u."agencia" = COALESCE(inf."agencia", 'SIN DATO')
        AND u."colonia" = COALESCE(inf."colonia", 'SIN DATO')
        AND u."calle" = COALESCE(inf."calle", 'SIN DATO')
        AND u."m1" IS NOT DISTINCT FROM inf."m1"
        AND u."m2" IS NOT DISTINCT FROM inf."m2"
        AND u."m3" IS NOT DISTINCT FROM inf."m3"
        AND u."m4" IS NOT DISTINCT FROM inf."m4"
        AND inf."ubicacion_id" IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO "catalogo_infraccion" ("clave_oficial")
      SELECT DISTINCT COALESCE("claveOficial", 'SIN DATO')
      FROM "infracciones" inf
      WHERE NOT EXISTS (
        SELECT 1
        FROM "catalogo_infraccion" c
        WHERE c."clave_oficial" = COALESCE(inf."claveOficial", 'SIN DATO')
      )
    `);

    await queryRunner.query(`
      INSERT INTO "infraccion_detalle" (
        "numero_parte_informativo",
        "nombre_operativo",
        "sitio_servicio_publico",
        "infraccion_id",
        "catalogo_infraccion_id"
      )
      SELECT
        inf."numeroParteInformativo",
        COALESCE(inf."nombreOperativo", 'SIN DATO'),
        inf."sitioServicioPublico",
        inf."id",
        cat."id"
      FROM "infracciones" inf
      INNER JOIN "catalogo_infraccion" cat
        ON cat."clave_oficial" = COALESCE(inf."claveOficial", 'SIN DATO')
      WHERE NOT EXISTS (
        SELECT 1
        FROM "infraccion_detalle" det
        WHERE det."infraccion_id" = inf."id"
      )
    `);

    if (!(await queryRunner.hasColumn('bitacora', 'user_id'))) {
      await queryRunner.addColumn(
        'bitacora',
        new TableColumn({
          name: 'user_id',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('bitacora', 'infraccion_id'))) {
      await queryRunner.addColumn(
        'bitacora',
        new TableColumn({
          name: 'infraccion_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('bitacora', 'created_at'))) {
      await queryRunner.addColumn(
        'bitacora',
        new TableColumn({
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        }),
      );
    }

    if (await queryRunner.hasColumn('bitacora', 'userId')) {
      await queryRunner.query(`
        UPDATE "bitacora"
        SET "user_id" = "userId"
        WHERE "user_id" IS NULL AND "userId" IS NOT NULL
      `);
    }

    if (await queryRunner.hasColumn('bitacora', 'createdAt')) {
      await queryRunner.query(`
        UPDATE "bitacora"
        SET "created_at" = "createdAt"
        WHERE "createdAt" IS NOT NULL
      `);
    }

    await queryRunner.query(`
      UPDATE "bitacora"
      SET "infraccion_id" = ("metadata"->>'infraccionId')::uuid
      WHERE "infraccion_id" IS NULL
        AND "metadata" ? 'infraccionId'
        AND ("metadata"->>'infraccionId') IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "bitacora" b
      SET "infraccion_id" = inf."id"
      FROM "infracciones" inf
      WHERE b."infraccion_id" IS NULL
        AND b."metadata" ? 'folioInfraccion'
        AND inf."folio_infraccion" = b."metadata"->>'folioInfraccion'
    `);

    await queryRunner.query(`
      ALTER TABLE "infracciones"
      ALTER COLUMN "infractor_id" SET NOT NULL,
      ALTER COLUMN "vehiculo_id" SET NOT NULL,
      ALTER COLUMN "ubicacion_id" SET NOT NULL
    `);

    await this.ensureForeignKey(
      queryRunner,
      'infracciones',
      new TableForeignKey({
        name: 'FK_infracciones_infractor',
        columnNames: ['infractor_id'],
        referencedTableName: 'infractores',
        referencedColumnNames: ['id'],
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'infracciones',
      new TableForeignKey({
        name: 'FK_infracciones_vehiculo',
        columnNames: ['vehiculo_id'],
        referencedTableName: 'vehiculos',
        referencedColumnNames: ['id'],
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'infracciones',
      new TableForeignKey({
        name: 'FK_infracciones_ubicacion',
        columnNames: ['ubicacion_id'],
        referencedTableName: 'ubicacion_inf',
        referencedColumnNames: ['id'],
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'infraccion_detalle',
      new TableForeignKey({
        name: 'FK_infraccion_detalle_infraccion',
        columnNames: ['infraccion_id'],
        referencedTableName: 'infracciones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'infraccion_detalle',
      new TableForeignKey({
        name: 'FK_infraccion_detalle_catalogo',
        columnNames: ['catalogo_infraccion_id'],
        referencedTableName: 'catalogo_infraccion',
        referencedColumnNames: ['id'],
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'bitacora',
      new TableForeignKey({
        name: 'FK_bitacora_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'bitacora',
      new TableForeignKey({
        name: 'FK_bitacora_infraccion',
        columnNames: ['infraccion_id'],
        referencedTableName: 'infracciones',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await this.ensureForeignKey(
      queryRunner,
      'encierros',
      new TableForeignKey({
        name: 'FK_encierros_folio_infraccion',
        columnNames: ['folio_infraccion'],
        referencedTableName: 'infracciones',
        referencedColumnNames: ['folio_infraccion'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropForeignKeyIfExists(
      queryRunner,
      'encierros',
      'FK_encierros_folio_infraccion',
    );
    await this.dropForeignKeyIfExists(
      queryRunner,
      'bitacora',
      'FK_bitacora_infraccion',
    );
    await this.dropForeignKeyIfExists(queryRunner, 'bitacora', 'FK_bitacora_user');
    await this.dropForeignKeyIfExists(
      queryRunner,
      'infraccion_detalle',
      'FK_infraccion_detalle_catalogo',
    );
    await this.dropForeignKeyIfExists(
      queryRunner,
      'infraccion_detalle',
      'FK_infraccion_detalle_infraccion',
    );
    await this.dropForeignKeyIfExists(
      queryRunner,
      'infracciones',
      'FK_infracciones_ubicacion',
    );
    await this.dropForeignKeyIfExists(
      queryRunner,
      'infracciones',
      'FK_infracciones_vehiculo',
    );
    await this.dropForeignKeyIfExists(
      queryRunner,
      'infracciones',
      'FK_infracciones_infractor',
    );

    if (await queryRunner.hasColumn('bitacora', 'infraccion_id')) {
      await queryRunner.dropColumn('bitacora', 'infraccion_id');
    }
    if (await queryRunner.hasColumn('bitacora', 'user_id')) {
      await queryRunner.dropColumn('bitacora', 'user_id');
    }
    if (await queryRunner.hasColumn('bitacora', 'created_at')) {
      await queryRunner.dropColumn('bitacora', 'created_at');
    }
    if (await queryRunner.hasColumn('infracciones', 'ubicacion_id')) {
      await queryRunner.dropColumn('infracciones', 'ubicacion_id');
    }
    if (await queryRunner.hasColumn('infracciones', 'vehiculo_id')) {
      await queryRunner.dropColumn('infracciones', 'vehiculo_id');
    }
    if (await queryRunner.hasColumn('infracciones', 'infractor_id')) {
      await queryRunner.dropColumn('infracciones', 'infractor_id');
    }

    await queryRunner.query('DROP TABLE IF EXISTS "infraccion_detalle"');
    await queryRunner.query('DROP TABLE IF EXISTS "catalogo_infraccion"');
    await queryRunner.query('DROP TABLE IF EXISTS "ubicacion_inf"');
    await queryRunner.query('DROP TABLE IF EXISTS "vehiculos"');
    await queryRunner.query('DROP TABLE IF EXISTS "infractores"');
  }

  private async ensureForeignKey(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKey: TableForeignKey,
  ) {
    const table = await queryRunner.getTable(tableName);
    const exists = table?.foreignKeys.find((fk) => fk.name === foreignKey.name);

    if (!exists) {
      await queryRunner.createForeignKey(tableName, foreignKey);
    }
  }

  private async dropForeignKeyIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKeyName: string,
  ) {
    const table = await queryRunner.getTable(tableName);
    const foreignKey = table?.foreignKeys.find((fk) => fk.name === foreignKeyName);

    if (foreignKey) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
    }
  }
}
