import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { UpdateInfraccionDto } from './dto/UpdateInfraccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Infraccion, EstatusInfraccion } from './entities/Infraccion.entity';
import { Repository } from 'typeorm';
import { QueryInfraccionDto } from './dto/QueryInfraccion.dto';
import { UsersService } from '../users/users.service';

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

    return guardada;
  }

  /* =====================================================
     FIND ALL
     ===================================================== */

  /**
   * Retorna una pagina de infracciones con filtros opcionales por delegacion,
   * oficial o fecha exacta (rango dentro del mismo dia).
   */
  async findAll(
    query?: QueryInfraccionDto,
  ): Promise<{ data: Infraccion[]; total: number; page: number; pageSize: number }> {
    const {
      delegacion,
      nombreOficial,
      fecha,
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

    const actualizada = await this.infraccionRepository.save({
      ...infraccion,
      ...rest,
      fechaHora,
    });

    this.logger.log(`Infracción actualizada folio=${folio}`);

    return actualizada;
  }

  /* =====================================================
     DELETE
     ===================================================== */

  /**
   * Elimina una infraccion por folio y retorna el registro borrado.
   */
  async deleteInfra(folio: string): Promise<Infraccion> {
    const infraccion = await this.findByFolio(folio);

    await this.infraccionRepository.remove(infraccion);

    this.logger.log(`Infracción eliminada folio=${folio}`);

    return infraccion;
  }
}
