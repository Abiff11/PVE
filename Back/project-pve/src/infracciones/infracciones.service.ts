import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraService } from '../bitacora/bitacora.service';
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from '../catalogos';
import { Encierro } from '../encierro/entities/encierro.entity';
import { UsersService } from '../users/users.service';
import {
  CreateInfraccionDetalleDto,
  CreateInfraccionDto,
  CreateInfractorDto,
  CreateUbicacionInfraccionDto,
  CreateVehiculoDto,
} from './dto/CreateInfraccion.dto';
import { InfraccionResponseDto } from './dto/InfraccionResponse.dto';
import { KpiInfraccionDto } from './dto/KpiInfraccion.dto';
import { QueryInfraccionDto } from './dto/QueryInfraccion.dto';
import { UpdateInfraccionDto } from './dto/UpdateInfraccion.dto';
import { mapInfraccionToResponse } from './mappers/infraccion.mapper';
import { CatalogoInfraccion } from './entities/CatalogoInfraccion.entity';
import { InfraccionDetalle } from './entities/InfraccionDetalle.entity';
import { Infractor } from './entities/Infractor.entity';
import {
  EstatusInfraccion,
  Infraccion,
  SituacionVehiculoInfraccion,
} from './entities/Infraccion.entity';
import { UbicacionInfraccion } from './entities/UbicacionInfraccion.entity';
import { Vehiculo } from './entities/Vehiculo.entity';

type Actor = { id?: number; username?: string };

type NormalizedInfraccionPayload = {
  infractor: CreateInfractorDto;
  vehiculo: CreateVehiculoDto;
  ubicacion: CreateUbicacionInfraccionDto;
  detalles: CreateInfraccionDetalleDto[];
};

@Injectable()
export class InfraccionesService {
  constructor(
    @InjectRepository(Infraccion)
    private readonly infraccionRepository: Repository<Infraccion>,
    @InjectRepository(Encierro)
    private readonly encierroRepository: Repository<Encierro>,
    @InjectRepository(Infractor)
    private readonly infractorRepository: Repository<Infractor>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(UbicacionInfraccion)
    private readonly ubicacionRepository: Repository<UbicacionInfraccion>,
    @InjectRepository(CatalogoInfraccion)
    private readonly catalogoRepository: Repository<CatalogoInfraccion>,
    private readonly usersService: UsersService,
    private readonly bitacoraService: BitacoraService,
  ) {}

  private readonly logger = new Logger(InfraccionesService.name);

  private parseFechaHora(fecha: string, hora: string) {
    const date = new Date(`${fecha}T${hora}:00`);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Fecha u hora inválida');
    }
    return date;
  }

  private normalizePayload(
    payload: Pick<
      CreateInfraccionDto,
      | 'infractor'
      | 'vehiculo'
      | 'ubicacion'
      | 'detalles'
      | 'nombreInfractor'
      | 'genero'
      | 'numeroLicencia'
      | 'servicio'
      | 'clase'
      | 'tipo'
      | 'marca'
      | 'modelo'
      | 'color'
      | 'placas'
      | 'estadoPlacas'
      | 'serie'
      | 'motor'
      | 'municipio'
      | 'agencia'
      | 'colonia'
      | 'calle'
      | 'm1'
      | 'm2'
      | 'm3'
      | 'm4'
      | 'claveOficial'
      | 'numeroParteInformativo'
      | 'nombreOperativo'
      | 'sitioServicioPublico'
    >,
  ): NormalizedInfraccionPayload {
    const infractor = payload.infractor ?? {
      nombre: payload.nombreInfractor,
      genero: payload.genero,
      numeroLicencia: payload.numeroLicencia,
    };

    const vehiculo = payload.vehiculo ?? {
      servicio: payload.servicio,
      clase: payload.clase,
      tipo: payload.tipo,
      marca: payload.marca,
      modelo: payload.modelo,
      color: payload.color,
      placas: payload.placas,
      estadoPlacas: payload.estadoPlacas,
      serie: payload.serie,
      motor: payload.motor,
    };

    const ubicacion = payload.ubicacion ?? {
      municipio: payload.municipio,
      agencia: payload.agencia,
      colonia: payload.colonia,
      calle: payload.calle,
      m1: payload.m1,
      m2: payload.m2,
      m3: payload.m3,
      m4: payload.m4,
    };

    const detalles =
      payload.detalles && payload.detalles.length > 0
        ? payload.detalles
        : [
            {
              claveOficial: payload.claveOficial,
              numeroParteInformativo: payload.numeroParteInformativo,
              nombreOperativo: payload.nombreOperativo,
              sitioServicioPublico: payload.sitioServicioPublico,
            },
          ];

    if (
      !infractor.nombre ||
      !infractor.genero ||
      !infractor.numeroLicencia ||
      !vehiculo.servicio ||
      !vehiculo.clase ||
      !vehiculo.tipo ||
      !vehiculo.marca ||
      !vehiculo.modelo ||
      !vehiculo.color ||
      !vehiculo.placas ||
      !vehiculo.estadoPlacas ||
      !vehiculo.serie ||
      !vehiculo.motor ||
      !ubicacion.municipio ||
      !ubicacion.agencia ||
      !ubicacion.colonia ||
      !ubicacion.calle ||
      !detalles.length ||
      detalles.some((detalle) => !detalle.claveOficial || !detalle.nombreOperativo)
    ) {
      throw new BadRequestException(
        'La infracción debe incluir infractor, vehículo, ubicación y al menos un detalle válido',
      );
    }

    return {
      infractor: infractor as CreateInfractorDto,
      vehiculo: vehiculo as CreateVehiculoDto,
      ubicacion: ubicacion as CreateUbicacionInfraccionDto,
      detalles: detalles as CreateInfraccionDetalleDto[],
    };
  }

  private async resolveInfractor(data: CreateInfractorDto): Promise<Infractor> {
    const existente = await this.infractorRepository.findOne({
      where: {
        nombre: data.nombre,
        genero: data.genero,
        numeroLicencia: data.numeroLicencia,
      },
    });

    if (existente) {
      return existente;
    }

    return this.infractorRepository.save(this.infractorRepository.create(data));
  }

  private async resolveVehiculo(data: CreateVehiculoDto): Promise<Vehiculo> {
    const existente = await this.vehiculoRepository.findOne({
      where: {
        placas: data.placas,
        serie: data.serie,
        motor: data.motor,
      },
    });

    if (existente) {
      return this.vehiculoRepository.save({ ...existente, ...data });
    }

    return this.vehiculoRepository.save(this.vehiculoRepository.create(data));
  }

  private async resolveUbicacion(
    data: CreateUbicacionInfraccionDto,
  ): Promise<UbicacionInfraccion> {
    const existente = await this.ubicacionRepository.findOne({
      where: {
        municipio: data.municipio,
        agencia: data.agencia,
        colonia: data.colonia,
        calle: data.calle,
        m1: data.m1,
        m2: data.m2,
        m3: data.m3,
        m4: data.m4,
      },
    });

    if (existente) {
      return existente;
    }

    return this.ubicacionRepository.save(this.ubicacionRepository.create(data));
  }

  private async resolveCatalogo(claveOficial: string): Promise<CatalogoInfraccion> {
    const existente = await this.catalogoRepository.findOne({
      where: { claveOficial },
    });

    if (existente) {
      return existente;
    }

    return this.catalogoRepository.save(
      this.catalogoRepository.create({ claveOficial }),
    );
  }

  private async buildDetalles(
    detalles: CreateInfraccionDetalleDto[],
  ): Promise<InfraccionDetalle[]> {
    return Promise.all(
      detalles.map(async (detalle) => {
        const catalogoInfraccion = await this.resolveCatalogo(detalle.claveOficial);
        return this.infraccionRepository.manager.create(InfraccionDetalle, {
          catalogoInfraccion,
          numeroParteInformativo: detalle.numeroParteInformativo,
          nombreOperativo: detalle.nombreOperativo,
          sitioServicioPublico: detalle.sitioServicioPublico,
        });
      }),
    );
  }

  private async loadInfraccionOrFail(folio: string): Promise<Infraccion> {
    const infraccion = await this.infraccionRepository.findOne({
      where: { folioInfraccion: folio },
      relations: {
        infractor: true,
        vehiculo: true,
        ubicacion: true,
        detalles: { catalogoInfraccion: true },
        encierroRegistro: true,
        createdBy: true,
      },
    });

    if (!infraccion) {
      throw new BadRequestException(`No existe infracción con folio ${folio}`);
    }

    return infraccion;
  }

  private async syncEncierroRecord(infraccion: Infraccion): Promise<void> {
    const isDetenido =
      infraccion.situacionVehiculo ===
        SituacionVehiculoInfraccion.VEHICULO_DETENIDO &&
      infraccion.encierro &&
      infraccion.encierro !== 'No aplica';

    const existente = await this.encierroRepository.findOne({
      where: { folioInfraccion: infraccion.folioInfraccion },
    });

    if (!isDetenido) {
      if (existente) {
        await this.encierroRepository.remove(existente);
      }
      return;
    }

    const primerDetalle = infraccion.detalles?.[0];

    const payload: Partial<Encierro> = {
      folioInfraccion: infraccion.folioInfraccion,
      fechaIngreso: infraccion.fecha,
      encierro: infraccion.encierro,
      nombreQuienRecibe: primerDetalle?.nombreOperativo ?? 'SIN DATO',
      servicioGrua: infraccion.servicioGrua,
      fechaLiberacion: null as unknown as string,
      fechaSalida: null as unknown as string,
      nombreQuienEntrega: null as unknown as string,
      infraccion,
    };

    if (existente) {
      await this.encierroRepository.save({ ...existente, ...payload });
      return;
    }

    await this.encierroRepository.save(this.encierroRepository.create(payload));
  }

  async create(
    createDto: CreateInfraccionDto,
    userId: number,
  ): Promise<InfraccionResponseDto> {
    const existe = await this.infraccionRepository.findOne({
      where: { folioInfraccion: createDto.folioInfraccion },
    });

    if (existe) {
      throw new BadRequestException('El folio ya existe');
    }

    const fechaHora = this.parseFechaHora(createDto.fecha, createDto.hora);
    const creador = await this.usersService.findById(userId);

    if (!creador) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const normalized = this.normalizePayload(createDto);
    const infractor = await this.resolveInfractor(normalized.infractor);
    const vehiculo = await this.resolveVehiculo(normalized.vehiculo);
    const ubicacion = await this.resolveUbicacion(normalized.ubicacion);
    const detalles = await this.buildDetalles(normalized.detalles);

    const isSoloInfraccion =
      createDto.situacionVehiculo ===
      SituacionVehiculoInfraccion.SOLO_INFRACCION;

    const nueva = this.infraccionRepository.create({
      folioInfraccion: createDto.folioInfraccion,
      fecha: createDto.fecha,
      hora: createDto.hora,
      fechaHora,
      situacionVehiculo: createDto.situacionVehiculo,
      encierro: isSoloInfraccion
        ? 'No aplica'
        : (createDto.encierro ?? DEFAULT_ENCIERRO),
      servicioGrua: isSoloInfraccion
        ? 'No aplica'
        : (createDto.servicioGrua ?? DEFAULT_SERVICIO_GRUA),
      monto: 0,
      estatus: EstatusInfraccion.PENDIENTE,
      claveOficial: detalles[0]?.catalogoInfraccion?.claveOficial,
      numeroParteInformativo: detalles[0]?.numeroParteInformativo,
      nombreOperativo: detalles[0]?.nombreOperativo,
      sitioServicioPublico: detalles[0]?.sitioServicioPublico,
      infractor,
      vehiculo,
      ubicacion,
      detalles,
      createdBy: creador,
    });

    const guardada = await this.infraccionRepository.save(nueva);
    const hydrated = await this.loadInfraccionOrFail(guardada.folioInfraccion);

    this.logger.log(`Infracción creada folio=${guardada.folioInfraccion}`);

    await this.bitacoraService.log('INFRACCION_CREADA', {
      description: `Se registró la infracción ${guardada.folioInfraccion}`,
      userId: creador.id,
      infraccionId: guardada.id,
      metadata: { folioInfraccion: guardada.folioInfraccion },
    });

    await this.syncEncierroRecord(hydrated);

    return mapInfraccionToResponse(hydrated);
  }

  async findAll(query?: QueryInfraccionDto): Promise<{
    data: InfraccionResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      folio,
      municipio,
      claveOficial,
      fechaInicio,
      fechaFin,
      page = 1,
      pageSize = 5,
    } = query ?? {};

    const pageNumber = page > 0 ? page : 1;
    const take = pageSize > 0 ? pageSize : 10;

    const qb = this.infraccionRepository
      .createQueryBuilder('infraccion')
      .leftJoinAndSelect('infraccion.infractor', 'infractor')
      .leftJoinAndSelect('infraccion.vehiculo', 'vehiculo')
      .leftJoinAndSelect('infraccion.ubicacion', 'ubicacion')
      .leftJoinAndSelect('infraccion.detalles', 'detalle')
      .leftJoinAndSelect('detalle.catalogoInfraccion', 'catalogo')
      .leftJoinAndSelect('infraccion.createdBy', 'createdBy')
      .leftJoinAndSelect('infraccion.encierroRegistro', 'encierroRegistro');

    if (folio) {
      qb.andWhere('LOWER(infraccion.folioInfraccion) LIKE :folio', {
        folio: `%${folio.toLowerCase()}%`,
      });
    }

    if (municipio) {
      qb.andWhere('LOWER(ubicacion.municipio) LIKE :municipio', {
        municipio: `%${municipio.toLowerCase()}%`,
      });
    }

    if (claveOficial) {
      qb.andWhere('LOWER(catalogo.claveOficial) LIKE :claveOficial', {
        claveOficial: `%${claveOficial.toLowerCase()}%`,
      });
    }

    if (fechaInicio && fechaFin) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      const fin = new Date(`${fechaFin}T23:59:59.999`);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        throw new BadRequestException('Rango de fechas inválido');
      }

      if (inicio.getTime() > fin.getTime()) {
        throw new BadRequestException(
          'fechaInicio no puede ser mayor a fechaFin',
        );
      }

      qb.andWhere('infraccion.fechaHora BETWEEN :start AND :end', {
        start: inicio,
        end: fin,
      });
    } else {
      if (fechaInicio) {
        qb.andWhere('infraccion.fecha >= :fechaInicio', { fechaInicio });
      }

      if (fechaFin) {
        qb.andWhere('infraccion.fecha <= :fechaFin', { fechaFin });
      }
    }

    qb.orderBy('infraccion.fechaHora', 'DESC')
      .skip((pageNumber - 1) * take)
      .take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map(mapInfraccionToResponse),
      total,
      page: pageNumber,
      pageSize: take,
    };
  }

  async getKpis(filters: KpiInfraccionDto) {
    const { fechaInicio, fechaFin, agencia } = filters ?? {};

    const baseQb = this.infraccionRepository
      .createQueryBuilder('infraccion')
      .leftJoin('infraccion.ubicacion', 'ubicacion');

    if (agencia) {
      baseQb.andWhere('LOWER(ubicacion.agencia) LIKE :agenciaKpi', {
        agenciaKpi: `%${agencia.toLowerCase()}%`,
      });
    }

    if (fechaInicio) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      if (isNaN(inicio.getTime())) {
        throw new BadRequestException('fechaInicio inválida');
      }
      baseQb.andWhere('infraccion.fechaHora >= :inicio', { inicio });
    }

    if (fechaFin) {
      const fin = new Date(`${fechaFin}T23:59:59.999`);
      if (isNaN(fin.getTime())) {
        throw new BadRequestException('fechaFin inválida');
      }
      baseQb.andWhere('infraccion.fechaHora <= :fin', { fin });
    }

    const totalInfracciones = await baseQb.clone().getCount();

    const conteoPorEstatusRaw = await baseQb
      .clone()
      .select('infraccion.estatus', 'estatus')
      .addSelect('COUNT(*)', 'total')
      .groupBy('infraccion.estatus')
      .getRawMany<{ estatus: EstatusInfraccion; total: string }>();

    const conteoPorEstatus = conteoPorEstatusRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.estatus] = Number(item.total ?? 0);
        return acc;
      },
      {},
    );

    const montoTotalRaw = await baseQb
      .clone()
      .select('COALESCE(SUM(infraccion.monto), 0)', 'monto')
      .andWhere('infraccion.estatus = :estatusPagada', {
        estatusPagada: EstatusInfraccion.PAGADA,
      })
      .getRawOne<{ monto: string }>();

    const montoTotal = Number(montoTotalRaw?.monto ?? 0);

    const montoPorEstatusRaw = await baseQb
      .clone()
      .select('infraccion.estatus', 'estatus')
      .addSelect('COALESCE(SUM(infraccion.monto), 0)', 'monto')
      .groupBy('infraccion.estatus')
      .getRawMany<{ estatus: EstatusInfraccion; monto: string }>();

    const montoPorEstatus = montoPorEstatusRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.estatus] = Number(item.monto ?? 0);
        return acc;
      },
      {},
    );

    const topDelegacionesRaw = await baseQb
      .clone()
      .select('ubicacion.agencia', 'delegacion')
      .addSelect('COUNT(*)', 'total')
      .groupBy('ubicacion.agencia')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany<{ delegacion: string; total: string }>();

    const topDelegaciones = topDelegacionesRaw.map((item) => ({
      delegacion: item.delegacion,
      total: Number(item.total),
    }));

    const resguardoQb = this.encierroRepository.createQueryBuilder('encierro');
    resguardoQb.andWhere('encierro.fechaSalida IS NULL');
    resguardoQb.andWhere('encierro.fechaLiberacion IS NULL');

    if (fechaInicio) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      if (isNaN(inicio.getTime())) {
        throw new BadRequestException('fechaInicio inválida');
      }
      resguardoQb.andWhere('encierro.fechaIngreso >= :encierroInicio', {
        encierroInicio: fechaInicio,
      });
    }

    if (fechaFin) {
      const fin = new Date(`${fechaFin}T00:00:00`);
      if (isNaN(fin.getTime())) {
        throw new BadRequestException('fechaFin inválida');
      }
      resguardoQb.andWhere('encierro.fechaIngreso <= :encierroFin', {
        encierroFin: fechaFin,
      });
    }

    const resguardoRaw = await resguardoQb
      .select('encierro.encierro', 'encierro')
      .addSelect('COUNT(*)', 'total')
      .groupBy('encierro.encierro')
      .getRawMany<{ encierro: string; total: string }>();

    const normalize = (value: string) =>
      (value ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const vehiculosEnResguardo = resguardoRaw.reduce<{
      laJoya: number;
      sanSebastianTutla: number;
    }>(
      (acc, item) => {
        const encierroName = normalize(item.encierro);
        const total = Number(item.total ?? 0);

        if (encierroName.includes('la joya')) {
          acc.laJoya += total;
        }

        if (encierroName.includes('san sebastian')) {
          acc.sanSebastianTutla += total;
        }

        return acc;
      },
      { laJoya: 0, sanSebastianTutla: 0 },
    );

    const usuariosPorRolRaw = await this.usersService.getConteoPorRol();
    const usuariosPorRol = usuariosPorRolRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.role] = item.total;
        return acc;
      },
      {},
    );

    const usuariosDelegacionRaw = await this.usersService.getConteoPorDelegacion();
    const usuariosPorDelegacion = usuariosDelegacionRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.delegacion] = item.total;
        return acc;
      },
      {},
    );

    return {
      filtros: filters,
      totalInfracciones,
      montoTotal,
      conteoPorEstatus,
      montoPorEstatus,
      topDelegaciones,
      vehiculosEnResguardo,
      usuariosPorRol,
      usuariosPorDelegacion,
    };
  }

  async findByFolio(folio: string): Promise<InfraccionResponseDto> {
    const infraccion = await this.loadInfraccionOrFail(folio);
    return mapInfraccionToResponse(infraccion);
  }

  async update(
    folio: string,
    cambios: UpdateInfraccionDto,
    actor?: Actor,
  ): Promise<InfraccionResponseDto> {
    const infraccion = await this.loadInfraccionOrFail(folio);
    const fechaFinal = cambios.fecha ?? infraccion.fecha;
    const horaFinal = cambios.hora ?? infraccion.hora;
    const shouldRecalc = Boolean(cambios.fecha || cambios.hora);

    const normalized = this.normalizePayload({
      ...mapInfraccionToResponse(infraccion),
      ...cambios,
    });

    const finalSituacionVehiculo =
      cambios.situacionVehiculo ?? infraccion.situacionVehiculo;
    const isSoloInfraccion =
      finalSituacionVehiculo === SituacionVehiculoInfraccion.SOLO_INFRACCION;

    infraccion.fecha = fechaFinal;
    infraccion.hora = horaFinal;
    infraccion.fechaHora = shouldRecalc
      ? this.parseFechaHora(fechaFinal, horaFinal)
      : infraccion.fechaHora;
    infraccion.situacionVehiculo = finalSituacionVehiculo;
    infraccion.encierro = isSoloInfraccion
      ? 'No aplica'
      : (cambios.encierro ?? infraccion.encierro ?? DEFAULT_ENCIERRO);
    infraccion.servicioGrua = isSoloInfraccion
      ? 'No aplica'
      : (cambios.servicioGrua ??
          infraccion.servicioGrua ??
          DEFAULT_SERVICIO_GRUA);
    infraccion.monto = cambios.monto ?? infraccion.monto;
    infraccion.estatus = cambios.estatus ?? infraccion.estatus;
    infraccion.infractor = await this.resolveInfractor(normalized.infractor);
    infraccion.vehiculo = await this.resolveVehiculo(normalized.vehiculo);
    infraccion.ubicacion = await this.resolveUbicacion(normalized.ubicacion);
    infraccion.detalles = await this.buildDetalles(normalized.detalles);
    infraccion.claveOficial =
      infraccion.detalles[0]?.catalogoInfraccion?.claveOficial;
    infraccion.numeroParteInformativo =
      infraccion.detalles[0]?.numeroParteInformativo;
    infraccion.nombreOperativo = infraccion.detalles[0]?.nombreOperativo;
    infraccion.sitioServicioPublico =
      infraccion.detalles[0]?.sitioServicioPublico;

    await this.infraccionRepository.save(infraccion);
    const actualizada = await this.loadInfraccionOrFail(folio);

    this.logger.log(`Infracción actualizada folio=${folio}`);

    await this.bitacoraService.log('INFRACCION_ACTUALIZADA', {
      description: `Se actualizó la infracción ${folio}`,
      userId: actor?.id,
      infraccionId: actualizada.id,
      metadata: { folioInfraccion: actualizada.folioInfraccion },
    });

    await this.syncEncierroRecord(actualizada);

    return mapInfraccionToResponse(actualizada);
  }

  async deleteInfra(
    folio: string,
    actor?: Actor,
  ): Promise<InfraccionResponseDto> {
    const infraccion = await this.loadInfraccionOrFail(folio);
    await this.infraccionRepository.remove(infraccion);

    this.logger.log(`Infracción eliminada folio=${folio}`);

    await this.bitacoraService.log('INFRACCION_ELIMINADA', {
      description: `Se eliminó la infracción ${folio}`,
      userId: actor?.id,
      infraccionId: infraccion.id,
      metadata: { folioInfraccion: infraccion.folioInfraccion },
    });

    return mapInfraccionToResponse(infraccion);
  }
}
