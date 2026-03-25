import { EstatusInfraccion, SituacionVehiculoInfraccion } from '../entities/Infraccion.entity';

export interface InfraccionDetalleResponseDto {
  id: string;
  claveOficial: string;
  numeroParteInformativo?: string;
  nombreOperativo: string;
  sitioServicioPublico?: string;
}

export interface InfraccionResponseDto {
  id: string;
  folioInfraccion: string;
  fecha: string;
  hora: string;
  fechaHora: Date;
  situacionVehiculo: SituacionVehiculoInfraccion;
  estatus: EstatusInfraccion;
  monto: number;
  encierro?: string;
  servicioGrua?: string;
  claveOficial?: string;
  numeroParteInformativo?: string;
  nombreOperativo?: string;
  sitioServicioPublico?: string;
  infractor: {
    id: string;
    nombre: string;
    genero: string;
    numeroLicencia: string;
  };
  vehiculo: {
    id: string;
    servicio: string;
    clase: string;
    tipo: string;
    marca: string;
    modelo: string;
    color: string;
    placas: string;
    estadoPlacas: string;
    serie: string;
    motor: string;
  };
  ubicacion: {
    id: string;
    municipio: string;
    agencia: string;
    colonia: string;
    calle: string;
    m1?: string;
    m2?: string;
    m3?: string;
    m4?: string;
  };
  detalles: InfraccionDetalleResponseDto[];
  createdBy: {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    role: string;
  };
  nombreInfractor: string;
  genero: string;
  numeroLicencia: string;
  servicio: string;
  clase: string;
  tipo: string;
  marca: string;
  modelo: string;
  color: string;
  placas: string;
  estadoPlacas: string;
  serie: string;
  motor: string;
  municipio: string;
  agencia: string;
  colonia: string;
  calle: string;
  m1?: string;
  m2?: string;
  m3?: string;
  m4?: string;
}
