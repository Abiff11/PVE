import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { Encierro } from '../encierro/entities/encierro.entity';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { UpdateInfraccionDto } from './dto/UpdateInfraccion.dto';
import { QueryInfraccionDto } from './dto/QueryInfraccion.dto';
import { KpiInfraccionDto } from './dto/KpiInfraccion.dto';
import {
  Infraccion,
  EstatusInfraccion,
  SituacionVehiculoInfraccion,
} from './entities/Infraccion.entity';
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from '../catalogos';

/**
 * Contiene la lógica de negocio para crear, filtrar y mantener infracciones.
 * Se apoya de TypeORM y de UsersService para relacionar cada registro con su creador.
 */
@Injectable()
export class InfraccionesService {
  constructor(
    @InjectRepository(Infraccion)
    private readonly infraccionRepository: Repository<Infraccion>,
    @InjectRepository(Encierro)
    private readonly encierroRepository: Repository<Encierro>,
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

  private async syncEncierroRecord(infraccion: Infraccion): Promise<void> {
    const isDetenido =
      infraccion.situacionVehiculo ===
        SituacionVehiculoInfraccion.VEHICULO_DETENIDO &&
      infraccion.encierro &&
      infraccion.encierro !== 'No aplica';

    if (!isDetenido) {
      return;
    }

    const existente = await this.encierroRepository.findOne({
      where: { folioInfraccion: infraccion.folioInfraccion },
    });

    const payload: Partial<Encierro> = {
      folioInfraccion: infraccion.folioInfraccion,
      fechaIngreso: infraccion.fecha,
      encierro: infraccion.encierro,
      nombreQuienRecibe: infraccion.nombreOperativo ?? 'SIN DATO',
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

    const nuevo = this.encierroRepository.create(payload);
    await this.encierroRepository.save(nuevo);
  }

  /* =====================================================
     CREATE
     ===================================================== */

  async create(
    createDto: CreateInfraccionDto,
    userId: number,
  ): Promise<Infraccion> {
    const { fecha, hora, ...rest } = createDto;

    const existe = await this.infraccionRepository.findOne({
      where: { folioInfraccion: createDto.folioInfraccion },
    });

    if (existe) {
      throw new BadRequestException('El folio ya existe');
    }

    const fechaHora = this.parseFechaHora(fecha, hora);

    const creador = await this.usersService.findById(userId);
    if (!creador) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const isSoloInfraccion =
      rest.situacionVehiculo === SituacionVehiculoInfraccion.SOLO_INFRACCION;

    const nueva = this.infraccionRepository.create({
      ...rest,
      encierro: isSoloInfraccion
        ? 'No aplica'
        : (rest.encierro ?? DEFAULT_ENCIERRO),
      servicioGrua: isSoloInfraccion
        ? 'No aplica'
        : (rest.servicioGrua ?? DEFAULT_SERVICIO_GRUA),
      fecha,
      hora,
      fechaHora,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: creador,
    });

    const guardada = await this.infraccionRepository.save(nueva);

    this.logger.log(`Infracción creada folio=${guardada.folioInfraccion}`);

    await this.bitacoraService.log('INFRACCION_CREADA', {
      description: `Se registró la infracción ${guardada.folioInfraccion}`,
      userId: creador.id,
      username: creador.username,
      metadata: { infraccionId: guardada.id },
    });

    await this.syncEncierroRecord(guardada);

    return guardada;
  }

  /* =====================================================
     FIND ALL
     ===================================================== */

  async findAll(query?: QueryInfraccionDto): Promise<{
    data: Infraccion[];
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

    const qb = this.infraccionRepository.createQueryBuilder('infraccion');

    if (folio) {
      qb.andWhere('LOWER(infraccion.folioInfraccion) LIKE :folio', {
        folio: `%${folio.toLowerCase()}%`,
      });
    }

    if (municipio) {
      qb.andWhere('LOWER(infraccion.municipio) LIKE :municipio', {
        municipio: `%${municipio.toLowerCase()}%`,
      });
    }

    if (claveOficial) {
      qb.andWhere('LOWER(infraccion.claveOficial) LIKE :claveOficial', {
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
      data,
      total,
      page: pageNumber,
      pageSize: take,
    };
  }

  /* =====================================================
     KPIs
     ===================================================== */

  async getKpis(filters: KpiInfraccionDto) {
    const { fechaInicio, fechaFin, agencia } = filters ?? {};

    const baseQb = this.infraccionRepository.createQueryBuilder('infraccion');

    if (agencia) {
      baseQb.andWhere('LOWER(infraccion.agencia) LIKE :agenciaKpi', {
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
      .select('infraccion.agencia', 'delegacion')
      .addSelect('COUNT(*)', 'total')
      .groupBy('infraccion.agencia')
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

    return {
      filtros: filters,
      totalInfracciones,
      montoTotal,
      conteoPorEstatus,
      montoPorEstatus,
      topDelegaciones,
      vehiculosEnResguardo,
    };
  }

  /* =====================================================
     FIND BY FOLIO
     ===================================================== */

  async findByFolio(folio: string): Promise<Infraccion> {
    const infraccion = await this.infraccionRepository.findOne({
      where: { folioInfraccion: folio },
      relations: { encierroRegistro: true },
    });

    if (!infraccion) {
      throw new BadRequestException(`No existe infracción con folio ${folio}`);
    }

    return infraccion;
  }

  /* =====================================================
     UPDATE
     ===================================================== */

  async update(
    folio: string,
    cambios: UpdateInfraccionDto,
    actor?: { id?: number; username?: string },
  ): Promise<Infraccion> {
    const infraccion = await this.findByFolio(folio);

    const { fecha, hora, ...rest } = cambios;

    const fechaFinal = fecha ?? infraccion.fecha;
    const horaFinal = hora ?? infraccion.hora;

    const shouldRecalc = Boolean(fecha || hora);
    const fechaHora = shouldRecalc
      ? this.parseFechaHora(fechaFinal, horaFinal)
      : infraccion.fechaHora;

    const finalSituacionVehiculo =
      rest.situacionVehiculo ?? infraccion.situacionVehiculo;

    const isSoloInfraccion =
      finalSituacionVehiculo === SituacionVehiculoInfraccion.SOLO_INFRACCION;

    const encierro = isSoloInfraccion
      ? 'No aplica'
      : (rest.encierro ?? infraccion.encierro ?? DEFAULT_ENCIERRO);
    const servicioGrua = isSoloInfraccion
      ? 'No aplica'
      : (rest.servicioGrua ?? infraccion.servicioGrua ?? DEFAULT_SERVICIO_GRUA);

    const actualizada = await this.infraccionRepository.save({
      ...infraccion,
      ...rest,
      ...(fecha ? { fecha } : {}),
      ...(hora ? { hora } : {}),
      ...(shouldRecalc ? { fechaHora } : {}),
      encierro,
      servicioGrua,
    });

    this.logger.log(`Infracción actualizada folio=${folio}`);

    await this.bitacoraService.log('INFRACCION_ACTUALIZADA', {
      description: `Se actualizó la infracción ${folio}`,
      userId: actor?.id,
      username: actor?.username,
      metadata: { infraccionId: actualizada.id },
    });

    await this.syncEncierroRecord(actualizada);

    return actualizada;
  }

  /* =====================================================
     DELETE
     ===================================================== */

  async deleteInfra(
    folio: string,
    actor?: { id?: number; username?: string },
  ): Promise<Infraccion> {
    const infraccion = await this.findByFolio(folio);

    await this.infraccionRepository.remove(infraccion);

    this.logger.log(`Infracción eliminada folio=${folio}`);

    await this.bitacoraService.log('INFRACCION_ELIMINADA', {
      description: `Se eliminó la infracción ${folio}`,
      userId: actor?.id,
      username: actor?.username,
      metadata: { infraccionId: infraccion.id },
    });

    return infraccion;
  }
}
