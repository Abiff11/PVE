import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { environment } from '../config/environment';
import { BitacoraEntry } from '../bitacora/entities/bitacora-entry.entity';
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from '../catalogos';
import { Encierro } from '../encierro/entities/encierro.entity';
import { CatalogoInfraccion } from '../infracciones/entities/CatalogoInfraccion.entity';
import { InfraccionDetalle } from '../infracciones/entities/InfraccionDetalle.entity';
import { Infractor } from '../infracciones/entities/Infractor.entity';
import {
  EstatusInfraccion,
  Infraccion,
  SituacionVehiculoInfraccion,
} from '../infracciones/entities/Infraccion.entity';
import { UbicacionInfraccion } from '../infracciones/entities/UbicacionInfraccion.entity';
import { Vehiculo } from '../infracciones/entities/Vehiculo.entity';
import { User, UserRole } from '../users/entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [
    User,
    Infraccion,
    Infractor,
    Vehiculo,
    UbicacionInfraccion,
    CatalogoInfraccion,
    InfraccionDetalle,
    Encierro,
    BitacoraEntry,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

async function seedUsers(): Promise<Record<string, User>> {
  const usersRepository = dataSource.getRepository(User);
  const defaultPassword = 'admin';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const users: Array<Partial<User> & { username: string; role: UserRole }> = [
    {
      nombre: 'Ana',
      apellido: 'Admin',
      username: 'admin',
      role: UserRole.ADMIN,
      telefono: '555-1000',
      delegacion: 'PLAZA',
    },
    {
      nombre: 'Diego',
      apellido: 'Director',
      username: 'director',
      role: UserRole.DIRECTOR,
      telefono: '555-2000',
      delegacion: 'PLAZA',
    },
    {
      nombre: 'Carmen',
      apellido: 'Capturista',
      username: 'capturista',
      role: UserRole.CAPTURISTA,
      telefono: '555-3000',
      delegacion: 'PLAZA',
    },
    {
      nombre: 'Alberto',
      apellido: 'Actualizador',
      username: 'actualizador',
      role: UserRole.ACTUALIZADOR,
      telefono: '555-4000',
      delegacion: 'FVN',
    },
    {
      nombre: 'Ernesto',
      apellido: 'Encierro',
      username: 'encierro',
      role: UserRole.ENCIERRO,
      telefono: '555-5000',
      delegacion: 'FVS',
    },
  ];

  for (const userData of users) {
    const exists = await usersRepository.findOne({
      where: { username: userData.username },
    });

    if (exists) {
      continue;
    }

    await usersRepository.save(
      usersRepository.create({
        ...userData,
        password: passwordHash,
      }),
    );
  }

  const storedUsers = await usersRepository.find();
  return storedUsers.reduce<Record<string, User>>((acc, user) => {
    acc[user.username] = user;
    return acc;
  }, {});
}

async function findOrCreateInfractor(
  nombre: string,
  numeroLicencia: string,
) {
  const repository = dataSource.getRepository(Infractor);
  const existing = await repository.findOne({
    where: { nombre, genero: 'NO_ESPECIFICADO', numeroLicencia },
  });

  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      nombre,
      genero: 'NO_ESPECIFICADO',
      numeroLicencia,
    }),
  );
}

async function findOrCreateVehiculo(placas: string) {
  const repository = dataSource.getRepository(Vehiculo);
  const existing = await repository.findOne({
    where: { placas, serie: `SER-${placas}`, motor: `MOT-${placas}` },
  });

  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      servicio: 'Particular',
      clase: 'Sedan',
      tipo: 'Automovil',
      marca: 'Nissan',
      modelo: 'Versa',
      color: 'Blanco',
      placas,
      estadoPlacas: 'OAX',
      serie: `SER-${placas}`,
      motor: `MOT-${placas}`,
    }),
  );
}

async function findOrCreateUbicacion() {
  const repository = dataSource.getRepository(UbicacionInfraccion);
  const existing = await repository.findOne({
    where: {
      municipio: 'Oaxaca de Juarez',
      agencia: 'Centro',
      colonia: 'Centro',
      calle: 'S/N',
      m1: null as unknown as undefined,
      m2: null as unknown as undefined,
      m3: null as unknown as undefined,
      m4: null as unknown as undefined,
    },
  });

  if (existing) {
    return existing;
  }

  return repository.save(
    repository.create({
      municipio: 'Oaxaca de Juarez',
      agencia: 'Centro',
      colonia: 'Centro',
      calle: 'S/N',
    }),
  );
}

async function findOrCreateCatalogo(claveOficial: string) {
  const repository = dataSource.getRepository(CatalogoInfraccion);
  const existing = await repository.findOne({ where: { claveOficial } });

  if (existing) {
    return existing;
  }

  return repository.save(repository.create({ claveOficial }));
}

async function seedInfracciones(users: Record<string, User>) {
  const infraccionesRepository = dataSource.getRepository(Infraccion);
  const defaultCreator =
    users['capturista'] || users['admin'] || Object.values(users)[0];
  const ubicacion = await findOrCreateUbicacion();

  const data = [
    ['INF-001', 'Luis Paredes', 'LIC-001', 'ABC-123', '2026-02-01T08:15:00', 'OF-001', 'Varo', 'San Sebastian Tutla'],
    ['INF-002', 'Sofia Nunez', 'LIC-002', 'DEF-456', '2026-02-02T09:40:00', 'OF-002', 'Vesco', 'La Joya'],
    ['INF-003', 'Carlos Rios', 'LIC-003', 'GHI-789', '2026-02-03T11:05:00', 'OF-003', 'Gale', 'San Sebastian Tutla'],
  ] as const;

  for (const item of data) {
    const [folioInfraccion, nombre, numeroLicencia, placas, fechaIso, claveOficial, servicioGrua, encierro] =
      item;
    const fechaHora = new Date(fechaIso);
    const fecha = fechaIso.slice(0, 10);
    const hora = fechaIso.slice(11, 16);
    const existing = await infraccionesRepository.findOne({
      where: { folioInfraccion },
      relations: { detalles: true },
    });

    const infractor = await findOrCreateInfractor(nombre, numeroLicencia);
    const vehiculo = await findOrCreateVehiculo(placas);
    const catalogo = await findOrCreateCatalogo(claveOficial);
    const detalle = dataSource.getRepository(InfraccionDetalle).create({
      catalogoInfraccion: catalogo,
      nombreOperativo: 'Operativo Base',
    });

    if (existing) {
      existing.fecha = fecha;
      existing.hora = hora;
      existing.fechaHora = fechaHora;
      existing.situacionVehiculo =
        SituacionVehiculoInfraccion.VEHICULO_DETENIDO;
      existing.estatus = EstatusInfraccion.PENDIENTE;
      existing.encierro = encierro ?? DEFAULT_ENCIERRO;
      existing.servicioGrua = servicioGrua ?? DEFAULT_SERVICIO_GRUA;
      existing.infractor = infractor;
      existing.vehiculo = vehiculo;
      existing.ubicacion = ubicacion;
      existing.detalles = [detalle];
      existing.claveOficial = claveOficial;
      existing.nombreOperativo = 'Operativo Base';
      existing.createdBy = existing.createdBy ?? defaultCreator;
      await infraccionesRepository.save(existing);
      continue;
    }

    await infraccionesRepository.save(
      infraccionesRepository.create({
        folioInfraccion,
        fecha,
        hora,
        fechaHora,
        situacionVehiculo: SituacionVehiculoInfraccion.VEHICULO_DETENIDO,
        claveOficial,
        nombreOperativo: 'Operativo Base',
        encierro,
        servicioGrua,
        monto: 0,
        estatus: EstatusInfraccion.PENDIENTE,
        infractor,
        vehiculo,
        ubicacion,
        detalles: [detalle],
        createdBy: defaultCreator,
      }),
    );
  }
}

async function seedEncierros() {
  const encierrosRepository = dataSource.getRepository(Encierro);
  const infraccionesRepository = dataSource.getRepository(Infraccion);
  const infracciones = await infraccionesRepository.find();

  for (const infraccion of infracciones) {
    if (!infraccion.encierro || infraccion.encierro === 'No aplica') {
      continue;
    }

    const payload: Partial<Encierro> = {
      folioInfraccion: infraccion.folioInfraccion,
      fechaIngreso: infraccion.fecha,
      encierro: infraccion.encierro,
      nombreQuienRecibe: 'SEED',
      servicioGrua: infraccion.servicioGrua,
      fechaLiberacion: null as unknown as string,
      fechaSalida: null as unknown as string,
      nombreQuienEntrega: null as unknown as string,
      infraccion,
    };

    const exists = await encierrosRepository.findOne({
      where: { folioInfraccion: infraccion.folioInfraccion },
    });

    if (exists) {
      await encierrosRepository.save({ ...exists, ...payload });
      continue;
    }

    await encierrosRepository.save(encierrosRepository.create(payload));
  }
}

async function seed() {
  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    const users = await seedUsers();
    await seedInfracciones(users);
    await seedEncierros();
    console.log('Seed completed successfully');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
