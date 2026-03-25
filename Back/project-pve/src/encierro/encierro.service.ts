import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraService } from '../bitacora/bitacora.service';
import { Infraccion } from '../infracciones/entities/Infraccion.entity';
import { CreateEncierroDto } from './dto/create-encierro.dto';
import { QueryEncierroDto } from './dto/query-encierro.dto';
import { UpdateEncierroDto } from './dto/update-encierro.dto';
import { Encierro } from './entities/encierro.entity';

interface Actor {
  id?: number;
  username?: string;
}

type EncierroLookupVehiculo = {
  clase: string;
  tipo: string;
  marca: string;
  modelo: string;
  color: string;
  placas: string;
  estadoPlacas: string;
  serie: string;
  motor: string;
  servicio: string;
};

export type EncierroLookupResponse = {
  folioInfraccion: string;
  encierro: string | null;
  servicioGrua: string | null;
  fechaInfraccion: string;
  horaInfraccion: string;
  vehiculo: EncierroLookupVehiculo;
  propietario: {
    nombre: string;
    genero: string;
    numeroLicencia: string;
  };
  ubicacion: {
    municipio: string;
    agencia: string;
    colonia: string;
    calle: string;
    m1?: string;
    m2?: string;
    m3?: string;
    m4?: string;
  };
  infraccion: {
    situacionVehiculo: string;
    estatus: string;
    monto: number;
    claveOficial?: string;
    numeroParteInformativo?: string;
    nombreOperativo?: string;
    sitioServicioPublico?: string;
  };
  detalles: Array<{
    id: string;
    claveOficial: string;
    numeroParteInformativo?: string;
    nombreOperativo: string;
    sitioServicioPublico?: string;
  }>;
  createdBy: {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    role: string;
  };
  registro: Encierro | null;
};

@Injectable()
export class EncierroService {
  constructor(
    @InjectRepository(Encierro)
    private readonly encierroRepository: Repository<Encierro>,
    @InjectRepository(Infraccion)
    private readonly infraccionRepository: Repository<Infraccion>,
    private readonly bitacoraService: BitacoraService,
  ) {}

  private readonly logger = new Logger(EncierroService.name);

  async create(dto: CreateEncierroDto, actor?: Actor): Promise<Encierro> {
    const existe = await this.encierroRepository.findOne({
      where: { folioInfraccion: dto.folioInfraccion },
    });

    if (existe) {
      throw new BadRequestException('Ya existe un encierro para este folio');
    }

    const infraccion = await this.infraccionRepository.findOne({
      where: { folioInfraccion: dto.folioInfraccion },
      relations: { vehiculo: true },
    });

    if (!infraccion) {
      throw new BadRequestException(`No existe infraccion con folio ${dto.folioInfraccion}`);
    }

    const nuevo = this.encierroRepository.create({
      ...dto,
      infraccion,
    });

    const guardado = await this.encierroRepository.save(nuevo);
    this.logger.log(`Encierro creado folio=${guardado.folioInfraccion}`);

    await this.bitacoraService.log('ENCIERRO_CREATED', {
      description: `Se creo el encierro con folio ${guardado.folioInfraccion}`,
      userId: actor?.id,
      infraccionId: infraccion.id,
      metadata: {
        encierroId: guardado.id,
        folioInfraccion: guardado.folioInfraccion,
      },
    });

    return guardado;
  }

  async lookupByFolio(folio: string): Promise<EncierroLookupResponse> {
    const infraccion = await this.infraccionRepository.findOne({
      where: { folioInfraccion: folio },
      relations: {
        vehiculo: true,
        infractor: true,
        ubicacion: true,
        detalles: { catalogoInfraccion: true },
        createdBy: true,
      },
    });

    if (!infraccion) {
      throw new BadRequestException(`No existe infraccion con folio ${folio}`);
    }

    const registro = await this.encierroRepository.findOne({
      where: { folioInfraccion: folio },
    });

    const primerDetalle = infraccion.detalles?.[0];

    return {
      folioInfraccion: infraccion.folioInfraccion,
      encierro: infraccion.encierro ?? null,
      servicioGrua: infraccion.servicioGrua ?? null,
      fechaInfraccion: infraccion.fecha,
      horaInfraccion: infraccion.hora,
      vehiculo: {
        clase: infraccion.vehiculo.clase,
        tipo: infraccion.vehiculo.tipo,
        marca: infraccion.vehiculo.marca,
        modelo: infraccion.vehiculo.modelo,
        color: infraccion.vehiculo.color,
        placas: infraccion.vehiculo.placas,
        estadoPlacas: infraccion.vehiculo.estadoPlacas,
        serie: infraccion.vehiculo.serie,
        motor: infraccion.vehiculo.motor,
        servicio: infraccion.vehiculo.servicio,
      },
      propietario: {
        nombre: infraccion.infractor.nombre,
        genero: infraccion.infractor.genero,
        numeroLicencia: infraccion.infractor.numeroLicencia,
      },
      ubicacion: {
        municipio: infraccion.ubicacion.municipio,
        agencia: infraccion.ubicacion.agencia,
        colonia: infraccion.ubicacion.colonia,
        calle: infraccion.ubicacion.calle,
        m1: infraccion.ubicacion.m1,
        m2: infraccion.ubicacion.m2,
        m3: infraccion.ubicacion.m3,
        m4: infraccion.ubicacion.m4,
      },
      infraccion: {
        situacionVehiculo: infraccion.situacionVehiculo,
        estatus: infraccion.estatus,
        monto: infraccion.monto,
        claveOficial: primerDetalle?.catalogoInfraccion?.claveOficial,
        numeroParteInformativo: primerDetalle?.numeroParteInformativo,
        nombreOperativo: primerDetalle?.nombreOperativo,
        sitioServicioPublico: primerDetalle?.sitioServicioPublico,
      },
      detalles:
        infraccion.detalles?.map((detalle) => ({
          id: detalle.id,
          claveOficial: detalle.catalogoInfraccion.claveOficial,
          numeroParteInformativo: detalle.numeroParteInformativo,
          nombreOperativo: detalle.nombreOperativo,
          sitioServicioPublico: detalle.sitioServicioPublico,
        })) ?? [],
      createdBy: {
        id: infraccion.createdBy.id,
        username: infraccion.createdBy.username,
        nombre: infraccion.createdBy.nombre,
        apellido: infraccion.createdBy.apellido,
        role: infraccion.createdBy.role,
      },
      registro: registro ?? null,
    };
  }

  async findByFolio(folio: string): Promise<Encierro> {
    const encierro = await this.encierroRepository.findOne({
      where: { folioInfraccion: folio },
      relations: { infraccion: true },
    });

    if (!encierro) {
      throw new BadRequestException(`No existe encierro con folio ${folio}`);
    }

    return encierro;
  }

  async findAll(query?: QueryEncierroDto): Promise<{
    data: Encierro[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { folio, encierro, fechaInicio, fechaFin, page = 1, pageSize = 10 } = query ?? {};

    const pageNumber = page > 0 ? page : 1;
    const take = pageSize > 0 ? pageSize : 10;

    const qb = this.encierroRepository
      .createQueryBuilder('encierro')
      .leftJoinAndSelect('encierro.infraccion', 'infraccion')
      .leftJoinAndSelect('infraccion.vehiculo', 'vehiculo');

    if (folio) {
      qb.andWhere('LOWER(encierro.folioInfraccion) LIKE :folio', {
        folio: `%${folio.toLowerCase()}%`,
      });
    }

    if (encierro) {
      qb.andWhere('LOWER(encierro.encierro) LIKE :encierroName', {
        encierroName: `%${encierro.toLowerCase()}%`,
      });
    }

    if (fechaInicio && fechaFin) {
      const inicio = new Date(`${fechaInicio}T00:00:00`);
      const fin = new Date(`${fechaFin}T23:59:59.999`);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        throw new BadRequestException('Rango de fechas invalido');
      }

      if (inicio.getTime() > fin.getTime()) {
        throw new BadRequestException('fechaInicio no puede ser mayor a fechaFin');
      }

      qb.andWhere('encierro.fechaIngreso BETWEEN :start AND :end', {
        start: fechaInicio,
        end: fechaFin,
      });
    } else {
      if (fechaInicio) {
        const inicio = new Date(`${fechaInicio}T00:00:00`);
        if (isNaN(inicio.getTime())) {
          throw new BadRequestException('fechaInicio invalida');
        }
        qb.andWhere('encierro.fechaIngreso >= :start', { start: fechaInicio });
      }
      if (fechaFin) {
        const fin = new Date(`${fechaFin}T00:00:00`);
        if (isNaN(fin.getTime())) {
          throw new BadRequestException('fechaFin invalida');
        }
        qb.andWhere('encierro.fechaIngreso <= :end', { end: fechaFin });
      }
    }

    qb.orderBy('encierro.fechaIngreso', 'DESC');
    qb.skip((pageNumber - 1) * take).take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: pageNumber,
      pageSize: take,
    };
  }

  async update(folio: string, cambios: UpdateEncierroDto, actor?: Actor): Promise<Encierro> {
    const actual = await this.findByFolio(folio);
    const actualizado = await this.encierroRepository.save({
      ...actual,
      ...cambios,
    });
    this.logger.log(`Encierro actualizado folio=${folio}`);

    await this.bitacoraService.log('ENCIERRO_UPDATED', {
      description: `Se actualizo el encierro con folio ${folio}`,
      userId: actor?.id,
      infraccionId: actual.infraccion?.id,
      metadata: {
        encierroId: actualizado.id,
        folioInfraccion: actualizado.folioInfraccion,
        changes: cambios,
      },
    });

    return actualizado;
  }

  async remove(folio: string, actor?: Actor): Promise<Encierro> {
    const actual = await this.findByFolio(folio);
    await this.encierroRepository.remove(actual);
    this.logger.log(`Encierro eliminado folio=${folio}`);

    await this.bitacoraService.log('ENCIERRO_DELETED', {
      description: `Se elimino el encierro con folio ${folio}`,
      userId: actor?.id,
      infraccionId: actual.infraccion?.id,
      metadata: {
        encierroId: actual.id,
        folioInfraccion: actual.folioInfraccion,
      },
    });

    return actual;
  }
}
