import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from '../../catalogos';
import { SituacionVehiculoInfraccion } from '../entities/Infraccion.entity';

export class CreateInfractorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsString()
  @IsNotEmpty()
  numeroLicencia: string;
}

export class CreateVehiculoDto {
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
}

export class CreateUbicacionInfraccionDto {
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
}

export class CreateInfraccionDetalleDto {
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

  @IsEnum(SituacionVehiculoInfraccion)
  situacionVehiculo: SituacionVehiculoInfraccion;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInfractorDto)
  infractor?: CreateInfractorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVehiculoDto)
  vehiculo?: CreateVehiculoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUbicacionInfraccionDto)
  ubicacion?: CreateUbicacionInfraccionDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInfraccionDetalleDto)
  detalles?: CreateInfraccionDetalleDto[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombreInfractor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  genero?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  numeroLicencia?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  servicio?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clase?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tipo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  marca?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  modelo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  placas?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  estadoPlacas?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serie?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  motor?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  municipio?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  agencia?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  colonia?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  calle?: string;

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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  claveOficial?: string;

  @IsOptional()
  @IsString()
  numeroParteInformativo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombreOperativo?: string;

  @IsOptional()
  @IsString()
  sitioServicioPublico?: string;
}
