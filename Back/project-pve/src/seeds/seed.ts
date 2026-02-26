import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { environment } from '../config/environment';
import { User, UserRole } from '../users/entities/user.entity';
import {
  Infraccion,
  EstatusInfraccion,
} from '../infracciones/entities/Infraccion.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [User, Infraccion],
  synchronize: true,
  logging: false,
});

/**
 * Inserta los usuarios base (uno por rol) y devuelve un mapa por username.
 */
async function seedUsers(): Promise<Record<string, User>> {
  const usersRepository = dataSource.getRepository(User);
  const defaultPassword = 'P@ssw0rd!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const users: Array<Partial<User> & { username: string; role: UserRole }> = [
    { nombre: 'Ana', apellido: 'Admin', username: 'admin', role: UserRole.ADMIN, telefono: '555-1000', delegacion: 'Centro' },
    { nombre: 'Diego', apellido: 'Director', username: 'director', role: UserRole.DIRECTOR, telefono: '555-2000', delegacion: 'Norte' },
    { nombre: 'Carmen', apellido: 'Capturista', username: 'capturista', role: UserRole.CAPTURISTA, telefono: '555-3000', delegacion: 'Sur' },
    { nombre: 'Alberto', apellido: 'Actualizador', username: 'actualizador', role: UserRole.ACTUALIZADOR, telefono: '555-4000', delegacion: 'Este' },
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

/**
 * Crea las infracciones de ejemplo utilizando los usuarios como foreign key.
 */
async function seedInfracciones(users: Record<string, User>) {
  const infraccionesRepository = dataSource.getRepository(Infraccion);
  const defaultCreator =
    users['capturista'] ||
    users['admin'] ||
    Object.values(users)[0];

  const infracciones: Array<Partial<Infraccion>> = [
    {
      folio: 'INF-001',
      nombreInfractor: 'Luis Paredes',
      nombreOficial: 'Oficial Herrera',
      delegacion: 'Alcoholimetro',
      detalleInfraccion: 'Conducir con nivel de alcohol superior al permitido',
      fechaHora: new Date('2026-02-01T08:15:00'),
      monto: 1800,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-002',
      nombreInfractor: 'Sofia Nunez',
      nombreOficial: 'Oficial Medina',
      delegacion: 'Oaxaca Camina',
      detalleInfraccion: 'Invadir carril confinado para peatones',
      fechaHora: new Date('2026-02-02T09:40:00'),
      monto: 1200,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-003',
      nombreInfractor: 'Marcos Ibarra',
      nombreOficial: 'Oficial Rios',
      delegacion: 'Guppa Yoo',
      detalleInfraccion: 'Circular sin casco de seguridad',
      fechaHora: new Date('2026-02-03T11:10:00'),
      monto: 950,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-004',
      nombreInfractor: 'Elena Vazquez',
      nombreOficial: 'Oficial Sosa',
      delegacion: 'Motocicletas',
      detalleInfraccion: 'Transportar pasajero sin equipo de proteccion',
      fechaHora: new Date('2026-02-04T14:25:00'),
      monto: 1600,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-005',
      nombreInfractor: 'Daniel Ortega',
      nombreOficial: 'Oficial Camacho',
      delegacion: 'Patrulleros',
      detalleInfraccion: 'No respetar instrucciones de patrulla en operativo',
      fechaHora: new Date('2026-02-05T07:55:00'),
      monto: 2100,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['actualizador'] ?? defaultCreator,
    },
    {
      folio: 'INF-006',
      nombreInfractor: 'Laura Rangel',
      nombreOficial: 'Oficial Beltran',
      delegacion: 'Foraneos Valles Norte',
      detalleInfraccion: 'Circular con placas foraneas sin permiso temporal',
      fechaHora: new Date('2026-02-05T16:20:00'),
      monto: 1750,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-007',
      nombreInfractor: 'Erick Torres',
      nombreOficial: 'Oficial Padilla',
      delegacion: 'Foraneos Valles Sur',
      detalleInfraccion: 'Vehiculo con verificacion vencida',
      fechaHora: new Date('2026-02-06T10:05:00'),
      monto: 1350,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['actualizador'] ?? defaultCreator,
    },
    {
      folio: 'INF-008',
      nombreInfractor: 'Itzel Marquez',
      nombreOficial: 'Oficial Luna',
      delegacion: 'Foraneos Mixteca',
      detalleInfraccion: 'Transportar mercancia sin documentacion',
      fechaHora: new Date('2026-02-06T12:50:00'),
      monto: 2400,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-009',
      nombreInfractor: 'Rogelio Cruz',
      nombreOficial: 'Oficial Esparza',
      delegacion: 'Foraneos Istmo Sur',
      detalleInfraccion: 'Circular en sentido contrario',
      fechaHora: new Date('2026-02-07T18:30:00'),
      monto: 900,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-010',
      nombreInfractor: 'Pamela Uriarte',
      nombreOficial: 'Oficial Meza',
      delegacion: 'Foraneos Istmo Norte',
      detalleInfraccion: 'Exceso de velocidad en tramo carretero',
      fechaHora: new Date('2026-02-08T06:45:00'),
      monto: 1900,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-011',
      nombreInfractor: 'Gustavo Soria',
      nombreOficial: 'Oficial Palma',
      delegacion: 'Foraneos Canada',
      detalleInfraccion: 'Falta de seguro vigente',
      fechaHora: new Date('2026-02-08T13:05:00'),
      monto: 1100,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-012',
      nombreInfractor: 'Fernanda Ruiz',
      nombreOficial: 'Oficial Cabrera',
      delegacion: 'Foraneos Costa Oriente',
      detalleInfraccion: 'Invadir carril de contraflujo',
      fechaHora: new Date('2026-02-09T09:55:00'),
      monto: 1450,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-013',
      nombreInfractor: 'Victor Solis',
      nombreOficial: 'Oficial Aguilar',
      delegacion: 'Foraneos Costa Poniente',
      detalleInfraccion: 'No portar licencia de manejo',
      fechaHora: new Date('2026-02-09T15:40:00'),
      monto: 1000,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-014',
      nombreInfractor: 'Lucero Juarez',
      nombreOficial: 'Oficial Zamora',
      delegacion: 'Director Operativo',
      detalleInfraccion: 'Estacionar unidad en zona restringida',
      fechaHora: new Date('2026-02-10T08:05:00'),
      monto: 800,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['director'] ?? defaultCreator,
    },
    {
      folio: 'INF-015',
      nombreInfractor: 'Mauricio Gil',
      nombreOficial: 'Oficial Rosales',
      delegacion: 'Foraneos Cuenca',
      detalleInfraccion: 'Circular con luces apagadas de noche',
      fechaHora: new Date('2026-02-10T22:20:00'),
      monto: 950,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-016',
      nombreInfractor: 'Yesenia Bonilla',
      nombreOficial: 'Oficial Duarte',
      delegacion: 'Alcoholimetro',
      detalleInfraccion: 'Negarse a prueba de alcoholimetro',
      fechaHora: new Date('2026-02-11T01:15:00'),
      monto: 2500,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-017',
      nombreInfractor: 'Hector Molina',
      nombreOficial: 'Oficial Serrano',
      delegacion: 'Oaxaca Camina',
      detalleInfraccion: 'Obstruir cruce peatonal con vehiculo',
      fechaHora: new Date('2026-02-11T17:35:00'),
      monto: 700,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-018',
      nombreInfractor: 'Beatriz Avila',
      nombreOficial: 'Oficial Cortes',
      delegacion: 'Motocicletas',
      detalleInfraccion: 'Circular entre carriles a alta velocidad',
      fechaHora: new Date('2026-02-12T12:10:00'),
      monto: 1650,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-019',
      nombreInfractor: 'Ricardo Olvera',
      nombreOficial: 'Oficial Acosta',
      delegacion: 'Foraneos Mixteca',
      detalleInfraccion: 'Carga excedente sin autorizacion',
      fechaHora: new Date('2026-02-12T18:05:00'),
      monto: 2300,
      estatus: EstatusInfraccion.PAGADA,
      createdBy: users['capturista'] ?? defaultCreator,
    },
    {
      folio: 'INF-020',
      nombreInfractor: 'Valeria Casillas',
      nombreOficial: 'Oficial Pineda',
      delegacion: 'Director Operativo',
      detalleInfraccion: 'Uso indebido de sirena particular',
      fechaHora: new Date('2026-02-13T07:25:00'),
      monto: 1550,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: users['capturista'] ?? defaultCreator,
    },
  ];

  for (const infraccionData of infracciones) {
    const exists = await infraccionesRepository.findOne({
      where: { folio: infraccionData.folio },
    });

    if (exists) {
      continue;
    }

    const infraccion = infraccionesRepository.create(infraccionData);
    await infraccionesRepository.save(infraccion);
  }
}

/**
 * Punto de entrada: abre la conexion, ejecuta seeds y cierra el DataSource.
 */
async function seed() {
  try {
    await dataSource.initialize();
    const users = await seedUsers();
    await seedInfracciones(users);
    // eslint-disable-next-line no-console
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
