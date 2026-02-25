import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { Infraccion } from './interfaces/infracciones.interface';

@Injectable()
export class InfraccionesService {
  private infracciones: Infraccion[] = [];

  //*con este metodo Verificamos que el folio de la infraccion no se repita o que la infraccion no exista
  create(createInfraccionDto: CreateInfraccionDto): Infraccion {
    const existe = this.infracciones.find(
      (i) => i.folio === createInfraccionDto.folio,
    );
    if (existe) {
      throw new BadRequestException(`El folio ya existe`);
    }

    const fechaHora = new Date(
      `${createInfraccionDto.fecha}T${createInfraccionDto.hora}:00`,
    );

    const nuevaInfraccion: Infraccion = { ...createInfraccionDto, fechaHora };
    this.infracciones.push(nuevaInfraccion);
    return nuevaInfraccion;
  }

  //* Este metodo trae todas las infracciones que existen
  findAll(): Infraccion[] {
    return this.infracciones;
  }

  //*Este metodo es para buscar por folio de infraccion
  findByFolio(folio: string): Infraccion {
    //*Validamos si existe
    const infraccion = this.infracciones.find((item) => item.folio === folio);

    if (!infraccion)
      throw new BadRequestException(`No existe infraccion con folio ${folio}`);

    return infraccion;
  }

  //*Metodo para eliminar infraccion por folio
  delete(folio : string): Infraccion{
   const index = this.infracciones.findIndex((item) => item.folio === folio)
   if(index === -1) throw new BadRequestException(`No existe infraccion con folio ${folio}`)
    const [eliminada] = this.infracciones.splice(index, 1)
    return eliminada;
  }
}
