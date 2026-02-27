import 'reflect-metadata';
import { DataSource, IsNull } from 'typeorm';
import { environment } from '../config/environment';
import { User } from '../users/entities/user.entity';
import { Infraccion } from '../infracciones/entities/Infraccion.entity';

/**
 * Script de utilidad para asignar un createdBy a las infracciones antiguas
 * que se migraron antes de tener la FK. Evita errores al volver obligatoria la relacion.
 */

const dataSource = new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [User, Infraccion],
  synchronize: false,
  logging: false,
});

async function backfillCreatedBy() {
  await dataSource.initialize();

  const usersRepo = dataSource.getRepository(User);
  const infraccionesRepo = dataSource.getRepository(Infraccion);

  // Elegimos un usuario existente para asignarlo como autor (prioridad: capturista -> admin -> cualquiera)
  const defaultUser =
    (await usersRepo.findOne({ where: { username: 'capturista' } })) ??
    (await usersRepo.findOne({ where: { username: 'admin' } })) ??
    (await usersRepo.findOne({ where: {} }));

  if (!defaultUser) {
    throw new Error('No se encontró un usuario para asignar como creador.');
  }

  const sinCreador = await infraccionesRepo.find({
    where: { createdBy: IsNull() },
  });

  if (sinCreador.length === 0) {
    console.log('No hay infracciones pendientes de asignar.');
    await dataSource.destroy();
    return;
  }

  for (const infraccion of sinCreador) {
    infraccion.createdBy = defaultUser;
  }

  await infraccionesRepo.save(sinCreador);

  console.log(
    `Asignadas ${sinCreador.length} infracciones al usuario ${defaultUser.username}.`,
  );

  await dataSource.destroy();
}

backfillCreatedBy().catch(async (error) => {
  console.error('Error al asignar createdBy:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
