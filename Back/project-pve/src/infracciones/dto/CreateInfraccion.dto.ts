import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsEnum,
  IsIn,
} from 'class-validator';
import { SituacionVehiculoInfraccion } from '../entities/Infraccion.entity';
import { ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from '../../catalogos';

export class CreateInfraccionDto {
  @IsString()
  @IsNotEmpty()
  folioInfraccion: string;

  @IsOptional()
  @IsString()
  @IsIn(ENCIERRO_OPTIONS)
  encierro?: string;

  @IsOptional()
  @IsString()
  @IsIn(SERVICIO_GRUA_OPTIONS)
  servicioGrua?: string;

  @IsDateString()
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hora: string;

  @IsString()
  @IsNotEmpty()
  nombreInfractor: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsString()
  @IsNotEmpty()
  numeroLicencia: string;

  @IsString()
  @IsNotEmpty()
  servicio: string;

  @IsString()
  @IsNotEmpty()
  clase: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  placas: string;

  @IsString()
  @IsNotEmpty()
  estadoPlacas: string;

  @IsString()
  @IsNotEmpty()
  serie: string;

  @IsString()
  @IsNotEmpty()
  motor: string;

  @IsString()
  @IsNotEmpty()
  municipio: string;

  @IsString()
  @IsNotEmpty()
  agencia: string;

  @IsString()
  @IsNotEmpty()
  colonia: string;

  @IsString()
  @IsNotEmpty()
  calle: string;

  @IsOptional()
  @IsString()
  m1?: string;

  @IsOptional()
  @IsString()
  m2?: string;

  @IsOptional()
  @IsString()
  m3?: string;

  @IsOptional()
  @IsString()
  m4?: string;

  @IsEnum(SituacionVehiculoInfraccion)
  situacionVehiculo: SituacionVehiculoInfraccion;

  @IsString()
  @IsNotEmpty()
  claveOficial: string;

  @IsOptional()
  @IsString()
  numeroParteInformativo?: string;

  @IsString()
  @IsNotEmpty()
  nombreOperativo: string;

  @IsOptional()
  @IsString()
  sitioServicioPublico?: string;
}
