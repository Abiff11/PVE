import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { environment } from '../config/environment';
import { User, UserRole } from '../users/entities/user.entity';
import { Encierro } from '../encierro/entities/encierro.entity';
import {
  Infraccion,
  EstatusInfraccion,
  SituacionVehiculoInfraccion,
} from '../infracciones/entities/Infraccion.entity';
import {
  DEFAULT_ENCIERRO,
  DEFAULT_SERVICIO_GRUA,
  ENCIERRO_OPTIONS,
  EncierroOption,
  SERVICIO_GRUA_OPTIONS,
  ServicioGruaOption,
} from '../catalogos';

const SERVICIOS_GRUA_POR_ENCIERRO: Record<
  EncierroOption,
  ServicioGruaOption[]
> = {
  'San Sebastian Tutla': ['Varo', 'Gale'],
  'La Joya': ['Vesco', 'Santa teresa'],
};

const isEncierroOption = (value: unknown): value is EncierroOption =>
  ENCIERRO_OPTIONS.includes(value as EncierroOption);

const isServicioGruaOption = (value: unknown): value is ServicioGruaOption =>
  SERVICIO_GRUA_OPTIONS.includes(value as ServicioGruaOption);

const dataSource = new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [User, Infraccion, Encierro],
  synchronize: true,
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

    const user = usersRepository.create({
      ...userData,
      password: passwordHash,
    });

    await usersRepository.save(user);
  }

  const storedUsers = await usersRepository.find();
  return storedUsers.reduce<Record<string, User>>((acc, user) => {
    acc[user.username] = user;
    return acc;
  }, {});
}

async function seedInfracciones(users: Record<string, User>) {
  const infraccionesRepository = dataSource.getRepository(Infraccion);
  const defaultCreator =
    users['capturista'] || users['admin'] || Object.values(users)[0];

  const base: Partial<Infraccion> = {
    genero: 'NO_ESPECIFICADO',
    numeroLicencia: 'S/N',
    servicio: 'Particular',
    clase: 'Sedán',
    tipo: 'Automóvil',
    marca: 'Nissan',
    modelo: 'Versa',
    color: 'Blanco',
    estadoPlacas: 'OAX',
    serie: 'S/N',
    motor: 'S/N',
    municipio: 'Oaxaca de Juárez',
    agencia: 'Centro',
    colonia: 'Centro',
    calle: 'S/N',
    m1: undefined,
    m2: undefined,
    m3: undefined,
    m4: undefined,
    situacionVehiculo: SituacionVehiculoInfraccion.VEHICULO_DETENIDO,
    claveOficial: 'OF-000',
    numeroParteInformativo: undefined,
    nombreOperativo: 'Operativo Base',
    sitioServicioPublico: undefined,
    encierro: DEFAULT_ENCIERRO,
    servicioGrua: DEFAULT_SERVICIO_GRUA,
  };

  const make = (
    data: Partial<Infraccion> & {
      folioInfraccion: string;
      nombreInfractor: string;
      fechaHora: Date;
      placas: string;
    },
  ): Partial<Infraccion> => {
    const iso = data.fechaHora.toISOString();
    const fecha = iso.slice(0, 10);
    const hora = iso.slice(11, 16);

    const encierro = data.encierro ?? base.encierro;
    const servicioGrua = data.servicioGrua ?? base.servicioGrua;

    if (encierro && !isEncierroOption(encierro)) {
      throw new Error(
        `Seed inválida: encierro "${encierro}" no existe en catálogo`,
      );
    }

    if (servicioGrua && !isServicioGruaOption(servicioGrua)) {
      throw new Error(
        `Seed inválida: servicio de grúa "${servicioGrua}" no existe en catálogo`,
      );
    }

    if (
      encierro &&
      servicioGrua &&
      servicioGrua !== 'sin grua' &&
      !SERVICIOS_GRUA_POR_ENCIERRO[encierro].includes(servicioGrua)
    ) {
      throw new Error(
        `Seed inválida: encierro "${encierro}" no coincide con servicio de grúa "${servicioGrua}"`,
      );
    }

    return {
      ...base,
      ...data,
      fecha,
      hora,
      encierro,
      servicioGrua,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: data.createdBy ?? defaultCreator,
    };
  };

  const infracciones: Array<Partial<Infraccion>> = [
    make({
      folioInfraccion: 'INF-001',
      nombreInfractor: 'Luis Paredes',
      fechaHora: new Date('2026-02-01T08:15:00'),
      placas: 'ABC-123',
      situacionVehiculo: SituacionVehiculoInfraccion.VEHICULO_DETENIDO,
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Varo',
    }),
    make({
      folioInfraccion: 'INF-002',
      nombreInfractor: 'Sofía Núñez',
      fechaHora: new Date('2026-02-02T09:40:00'),
      placas: 'DEF-456',
      encierro: 'La Joya',
      servicioGrua: 'Vesco',
    }),
    make({
      folioInfraccion: 'INF-003',
      nombreInfractor: 'Carlos Ríos',
      fechaHora: new Date('2026-02-03T11:05:00'),
      placas: 'GHI-789',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Gale',
    }),
    make({
      folioInfraccion: 'INF-004',
      nombreInfractor: 'Mariana Soto',
      fechaHora: new Date('2026-02-04T13:20:00'),
      placas: 'JKL-012',
      encierro: 'La Joya',
      servicioGrua: 'Santa teresa',
    }),
    make({
      folioInfraccion: 'INF-005',
      nombreInfractor: 'Héctor Cid',
      fechaHora: new Date('2026-02-05T07:55:00'),
      placas: 'MNO-345',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Varo',
    }),
    make({
      folioInfraccion: 'INF-006',
      nombreInfractor: 'Ana Márquez',
      fechaHora: new Date('2026-02-06T10:30:00'),
      placas: 'PQR-678',
      encierro: 'La Joya',
      servicioGrua: 'Vesco',
    }),
    make({
      folioInfraccion: 'INF-007',
      nombreInfractor: 'Diego López',
      fechaHora: new Date('2026-02-07T14:10:00'),
      placas: 'STU-901',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Gale',
    }),
    make({
      folioInfraccion: 'INF-008',
      nombreInfractor: 'Carmen Ruiz',
      fechaHora: new Date('2026-02-08T16:25:00'),
      placas: 'VWX-234',
      encierro: 'La Joya',
      servicioGrua: 'Santa teresa',
    }),
    make({
      folioInfraccion: 'INF-009',
      nombreInfractor: 'Alberto Medina',
      fechaHora: new Date('2026-02-09T08:50:00'),
      placas: 'YZA-567',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Varo',
    }),
    make({
      folioInfraccion: 'INF-010',
      nombreInfractor: 'Ernesto Vázquez',
      fechaHora: new Date('2026-02-10T12:15:00'),
      placas: 'BCD-890',
      encierro: 'La Joya',
      servicioGrua: 'Vesco',
    }),
    make({
      folioInfraccion: 'INF-011',
      nombreInfractor: 'Verónica Salas',
      fechaHora: new Date('2026-02-11T09:05:00'),
      placas: 'EFG-123',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Gale',
    }),
    make({
      folioInfraccion: 'INF-012',
      nombreInfractor: 'Raúl Ortiz',
      fechaHora: new Date('2026-02-12T15:40:00'),
      placas: 'HIJ-456',
      encierro: 'La Joya',
      servicioGrua: 'Santa teresa',
    }),
    make({
      folioInfraccion: 'INF-013',
      nombreInfractor: 'Mariana Gil',
      fechaHora: new Date('2026-02-13T11:55:00'),
      placas: 'KLM-789',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Varo',
    }),
    make({
      folioInfraccion: 'INF-014',
      nombreInfractor: 'José Carrillo',
      fechaHora: new Date('2026-02-14T13:35:00'),
      placas: 'NOP-012',
      encierro: 'La Joya',
      servicioGrua: 'Vesco',
    }),
    make({
      folioInfraccion: 'INF-015',
      nombreInfractor: 'Lucía Molina',
      fechaHora: new Date('2026-02-15T10:20:00'),
      placas: 'QRS-345',
      encierro: 'San Sebastian Tutla',
      servicioGrua: 'Gale',
    }),
  ];

  for (const infraccionData of infracciones) {
    const folio = infraccionData.folioInfraccion;
    if (!folio) {
      throw new Error('Seed inválida: folioInfraccion requerido');
    }

    const exists = await infraccionesRepository.findOne({
      where: { folioInfraccion: folio },
    });

    if (exists) {
      await infraccionesRepository.save({
        ...exists,
        ...infraccionData,
        createdBy:
          exists.createdBy ?? infraccionData.createdBy ?? defaultCreator,
        estatus: EstatusInfraccion.PENDIENTE,
      });
      continue;
    }

    const infraccion = infraccionesRepository.create({
      ...infraccionData,
      estatus: EstatusInfraccion.PENDIENTE,
    });
    await infraccionesRepository.save(infraccion);
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
      fechaLiberacion: null as unknown as string,
      fechaSalida: null as unknown as string,
      nombreQuienEntrega: null as unknown as string,
      infraccion,
    };

    const exists = await encierrosRepository.findOne({
      where: { folioInfraccion: infraccion.folioInfraccion },
    });

    if (exists) {
      await encierrosRepository.save({
        ...exists,
        ...payload,
      });
      continue;
    }

    const encierro = encierrosRepository.create(payload);
    await encierrosRepository.save(encierro);
  }
}

async function seed() {
  try {
    await dataSource.initialize();
    const users = await seedUsers();
    await seedInfracciones(users);
    await seedEncierros();
    // eslint-disable-next-line no-console
    console.log('Seed completed successfully');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Seed failed', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
