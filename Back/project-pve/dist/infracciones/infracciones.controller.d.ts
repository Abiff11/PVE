import { InfraccionesService } from './infracciones.service';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import type { Infraccion } from './interfaces/infracciones.interface';
export declare class InfraccionesController {
    private readonly infraccionesService;
    constructor(infraccionesService: InfraccionesService);
    create(createInfraccionDto: CreateInfraccionDto): Infraccion;
    findAll(): Infraccion[];
    findByFolio(folio: string): Infraccion;
    delete(folio: string): {
        message: string;
        data: Infraccion;
    };
}
