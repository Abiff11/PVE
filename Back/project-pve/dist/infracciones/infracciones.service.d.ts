import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { Infraccion } from './interfaces/infracciones.interface';
export declare class InfraccionesService {
    private infracciones;
    create(createInfraccionDto: CreateInfraccionDto): Infraccion;
    findAll(): Infraccion[];
    findByFolio(folio: string): Infraccion;
    delete(folio: string): Infraccion;
}
