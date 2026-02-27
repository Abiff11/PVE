import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { UpdateInfraccionDto } from './dto/UpdateInfraccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Infraccion, EstatusInfraccion } from './entities/Infraccion.entity';
import { Repository } from 'typeorm';
import { QueryInfraccionDto } from './dto/QueryInfraccion.dto';
import { KpiInfraccionDto } from './dto/KpiInfraccion.dto';
import { UsersService } from '../users/users.service';
import { BitacoraService } from '../bitacora/bitacora.service';

/**
 * Contiene la logica de negocio para crear, filtrar y mantener infracciones.
 * Se apoya de TypeORM y de UsersService para relacionar cada registro con su creador.
 */
@Injectable()
export class InfraccionesService {
  constructor(
    @InjectRepository(Infraccion)
    private readonly infraccionRepository: Repository<Infraccion>,
    private readonly usersService: UsersService,
    private readonly bitacoraService: BitacoraService,
  ) {}

  private readonly logger = new Logger(InfraccionesService.name);

  /* =====================================================
     CREATE
     ===================================================== */

  /**
   * Registra una infraccion validando folio unico y asociando el usuario creador.
   */
  async create(
    createDto: CreateInfraccionDto,
    userId: number,
  ): Promise<Infraccion> {
    const { fecha, hora, ...rest } = createDto;

    // Validamos duplicado por folio en DB
    const existe = await this.infraccionRepository.findOne({
      where: { folio: createDto.folio },
    });

    if (existe) {
      throw new BadRequestException('El folio ya existe');
    }

    const fechaHora = new Date(`${fecha}T${hora}:00`);

    if (isNaN(fechaHora.getTime())) {
      throw new BadRequestException('Fecha u hora inválida');
    }

    const creador = await this.usersService.findById(userId);

    if (!creador) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validación de coherencia de negocio:
    // soloInfraccion = true significa que NO hubo consignación de ningún tipo.
    // Si hay consignaciones (> 0), el campo soloInfraccion debe ser false.
    // Persistir soloInfraccion = true junto con consignaciones generaría datos contradictorios.
    if (
      rest.soloInfraccion === true &&
      ((rest.consignacionVehiculo ?? 0) > 0 ||
        (rest.consignacionMotocicleta ?? 0) > 0)
    ) {
      throw new BadRequestException(
        'soloInfraccion no puede ser true si hay consignaciones registradas',
      );
    }

    const nueva = this.infraccionRepository.create({
      ...rest,
      fechaHora,
      estatus: EstatusInfraccion.PENDIENTE,
      createdBy: creador,
    });

    const guardada = await this.infraccionRepository.save(nueva);

    this.logger.log(
      `Infracción creada folio=${guardada.folio} monto=${guardada.monto}`,
    );

    await this.bitacoraService.log('INFRACCION_CREADA', {
      description: `Se registró la infracción ${guardada.folio}`,
      userId: creador.id,
      username: creador.username,
      metadata: { infraccionId: guardada.id },
    });

    return guardada;
  }

  /* =====================================================
     FIND ALL
     ===================================================== */

  /**
   * Retorna una pagina de infracciones con filtros opcionales por delegacion,
   * oficial o fecha exacta (rango dentro del mismo dia).
   */
  async findAll(query?: QueryInfraccionDto): Promise<{
    data: Infraccion[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      delegacion,
      nombreOficial,
      fecha,
      fechaInicio,
      fechaFin,
      page = 1,
      pageSize = 5,
    } = query ?? {};

    const pageNumber = page > 0 ? page : 1;
    const take = pageSize > 0 ? pageSize : 10;

    const qb = this.infraccionRepository.createQueryBuilder('infraccion');

    if (delegacion) {
      qb.andWhere('LOWER(infraccion.delegacion) LIKE :delegacion', {
        delegacion: `%${delegacion.toLowerCase()}%`,
      });
    }

    if (nombreOficial) {
      qb.andWhere('LOWER(infraccion.nombreOficial) LIKE :nombreOficial', {
        nombreOficial: `%${nombreOficial.toLowerCase()}%`,
      });
    }

    if (fecha) {
      const start = new Date(`${fecha}T00:00:00`);
      const end = new Date(`${fecha}T23:59:59.999`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Fecha inválida');
      }

      qb.andWhere('infraccion.fechaHora BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (fechaInicio) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      if (isNaN(inicio.getTime())) {
        throw new BadRequestException('fechaInicio inválida');
      }
      qb.andWhere('infraccion.fechaHora >= :fechaInicioFiltro', {
        fechaInicioFiltro: inicio,
      });
    }

    if (fechaFin) {
      const fin = new Date(`${fechaFin}T23:59:59.999`);
      if (isNaN(fin.getTime())) {
        throw new BadRequestException('fechaFin inválida');
      }
      qb.andWhere('infraccion.fechaHora <= :fechaFinFiltro', {
        fechaFinFiltro: fin,
      });
    }

    if (fechaInicio && fechaFin) {
      const inicioDate = new Date(fechaInicio);
      const finDate = new Date(fechaFin);
      if (inicioDate > finDate) {
        throw new BadRequestException(
          'fechaInicio no puede ser mayor a fechaFin',
        );
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

  /**
   * Calcula los KPIs principales usados por el director para monitorear infracciones.
   */
  async getKpis(filters: KpiInfraccionDto) {
    const qb = this.infraccionRepository.createQueryBuilder('infraccion');

    if (filters.delegacion) {
      qb.andWhere('LOWER(infraccion.delegacion) LIKE :delegacionKpi', {
        delegacionKpi: `%${filters.delegacion.toLowerCase()}%`,
      });
    }

    if (filters.fechaInicio) {
      const inicio = new Date(`${filters.fechaInicio}T00:00:00`);
      if (isNaN(inicio.getTime())) {
        throw new BadRequestException('fechaInicio invalida');
      }
      qb.andWhere('infraccion.fechaHora >= :inicio', { inicio });
    }

    if (filters.fechaFin) {
      const fin = new Date(`${filters.fechaFin}T23:59:59.999`);
      if (isNaN(fin.getTime())) {
        throw new BadRequestException('fechaFin invalida');
      }
      qb.andWhere('infraccion.fechaHora <= :fin', { fin });
    }

    if (filters.fechaInicio && filters.fechaFin) {
      const inicio = new Date(filters.fechaInicio);
      const fin = new Date(filters.fechaFin);
      if (inicio > fin) {
        throw new BadRequestException(
          'fechaInicio no puede ser mayor a fechaFin',
        );
      }
    }

    const total = await qb.getCount();

    const conteoPorEstatusRaw = await qb
      .clone()
      .select('infraccion.estatus', 'estatus')
      .addSelect('COUNT(*)', 'total')
      .groupBy('infraccion.estatus')
      .getRawMany<{ estatus: EstatusInfraccion; total: string }>();

    const montoPorEstatusRaw = await qb
      .clone()
      .select('infraccion.estatus', 'estatus')
      .addSelect('SUM(infraccion.monto)', 'monto')
      .groupBy('infraccion.estatus')
      .getRawMany<{ estatus: EstatusInfraccion; monto: string }>();

    const topDelegacionesRaw = await qb
      .clone()
      .select('infraccion.delegacion', 'delegacion')
      .addSelect('COUNT(*)', 'total')
      .groupBy('infraccion.delegacion')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany<{ delegacion: string; total: string }>();

    const conteoPorEstatus = conteoPorEstatusRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.estatus] = Number(item.total);
        return acc;
      },
      {},
    );

    const montoPorEstatus = montoPorEstatusRaw.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.estatus] = Number(item.monto ?? 0);
        return acc;
      },
      {},
    );

    const montoTotal = Object.values(montoPorEstatus).reduce(
      (acc, value) => acc + value,
      0,
    );

    const topDelegaciones = topDelegacionesRaw.map((item) => ({
      delegacion: item.delegacion,
      total: Number(item.total),
    }));

    return {
      filtros: filters,
      totalInfracciones: total,
      conteoPorEstatus,
      montoPorEstatus,
      montoTotal,
      topDelegaciones,
    };
  }

  /* =====================================================
     FIND BY FOLIO
     ===================================================== */

  /**
   * Busca una infraccion especifica y lanza error si no existe el folio solicitado.
   */
  async findByFolio(folio: string): Promise<Infraccion> {
    const infraccion = await this.infraccionRepository.findOne({
      where: { folio },
    });

    if (!infraccion) {
      throw new BadRequestException(`No existe infracción con folio ${folio}`);
    }

    return infraccion;
  }

  /* =====================================================
     UPDATE
     ===================================================== */

  /**
   * Actualiza campos permitidos y recalcula la fecha/hora cuando se modifica
   * cualquiera de los componentes por separado.
   */
  async update(
    folio: string,
    cambios: UpdateInfraccionDto,
    actor?: { id?: number; username?: string },
  ): Promise<Infraccion> {
    const infraccion = await this.findByFolio(folio);

    const { fecha, hora, ...rest } = cambios;

    let fechaHora = infraccion.fechaHora;

    if (fecha || hora) {
      const fechaBase =
        fecha ?? infraccion.fechaHora.toISOString().split('T')[0];

      const horaBase =
        hora ??
        infraccion.fechaHora.toISOString().split('T')[1].substring(0, 5);

      const nuevaFecha = new Date(`${fechaBase}T${horaBase}:00`);

      if (isNaN(nuevaFecha.getTime())) {
        throw new BadRequestException('Fecha u hora inválida');
      }

      fechaHora = nuevaFecha;
    }

    // Validación de coherencia de negocio en actualización:
    // Calculamos los valores finales combinando los datos existentes con los cambios entrantes.
    // Si soloInfraccion queda en true pero hay consignaciones, los datos serían contradictorios.
    const soloInfraccionFinal =
      rest.soloInfraccion ?? infraccion.soloInfraccion;
    const consignacionVehiculoFinal =
      rest.consignacionVehiculo ?? infraccion.consignacionVehiculo;
    const consignacionMotocicletaFinal =
      rest.consignacionMotocicleta ?? infraccion.consignacionMotocicleta;

    if (
      soloInfraccionFinal === true &&
      (consignacionVehiculoFinal > 0 || consignacionMotocicletaFinal > 0)
    ) {
      throw new BadRequestException(
        'soloInfraccion no puede ser true si hay consignaciones registradas',
      );
    }

    const actualizada = await this.infraccionRepository.save({
      ...infraccion,
      ...rest,
      fechaHora,
    });

    this.logger.log(`Infracción actualizada folio=${folio}`);

    await this.bitacoraService.log('INFRACCION_ACTUALIZADA', {
      description: `Se actualizó la infracción ${folio}`,
      userId: actor?.id,
      username: actor?.username,
      metadata: { infraccionId: actualizada.id },
    });

    return actualizada;
  }

  /* =====================================================
     DELETE
     ===================================================== */

  /**
   * Elimina una infraccion por folio y retorna el registro borrado.
   */
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
