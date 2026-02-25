import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { InfraccionesService } from './infracciones.service';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import type { Infraccion } from './interfaces/infracciones.interface';



@Controller('infracciones')
export class InfraccionesController {
  constructor(private readonly infraccionesService: InfraccionesService) {}

  @Post()
  create(@Body() createInfraccionDto: CreateInfraccionDto) {
    return this.infraccionesService.create(createInfraccionDto);
  }

  @Get()
  findAll() {
    return this.infraccionesService.findAll();
  }

  @Get(':folio')
  findByFolio(@Param('folio')folio: string): Infraccion{
    return this.infraccionesService.findByFolio(folio)
  }

  @Delete(':folio')
  delete(@Param('folio') folio:string){
    const infraccion = this.infraccionesService.delete(folio)
    return { message: 'Infracción eliminada con éxito', data: infraccion };
  }
}
