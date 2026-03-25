import { apiRequest } from './apiClient';

function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    }),
  );
}

function serializeInfraccionPayload(payload = {}) {
  const details = [
    cleanObject({
      claveOficial: payload.claveOficial,
      numeroParteInformativo: payload.numeroParteInformativo,
      nombreOperativo: payload.nombreOperativo,
      sitioServicioPublico: payload.sitioServicioPublico,
    }),
  ].filter((item) => Object.keys(item).length > 0);

  const serialized = cleanObject({
    folioInfraccion: payload.folioInfraccion,
    fecha: payload.fecha,
    hora: payload.hora,
    situacionVehiculo: payload.situacionVehiculo,
    encierro:
      payload.situacionVehiculo === 'SOLO_INFRACCION' ? undefined : payload.encierro,
    servicioGrua:
      payload.situacionVehiculo === 'SOLO_INFRACCION'
        ? undefined
        : payload.servicioGrua,
    monto:
      payload.monto === '' || payload.monto === undefined
        ? undefined
        : Number(payload.monto),
    estatus: payload.estatus,
    infractor: cleanObject({
      nombre: payload.nombreInfractor,
      genero: payload.genero,
      numeroLicencia: payload.numeroLicencia,
    }),
    vehiculo: cleanObject({
      servicio: payload.servicio,
      clase: payload.clase,
      tipo: payload.tipo,
      marca: payload.marca,
      modelo: payload.modelo,
      color: payload.color,
      placas: payload.placas,
      estadoPlacas: payload.estadoPlacas,
      serie: payload.serie,
      motor: payload.motor,
    }),
    ubicacion: cleanObject({
      municipio: payload.municipio,
      agencia: payload.agencia,
      colonia: payload.colonia,
      calle: payload.calle,
      m1: payload.m1,
      m2: payload.m2,
      m3: payload.m3,
      m4: payload.m4,
    }),
    detalles: details.length > 0 ? details : undefined,
  });

  return serialized;
}

function normalizeInfraccion(item) {
  if (!item) return item;

  const firstDetail = item.detalles?.[0] ?? null;

  return {
    ...item,
    nombreInfractor: item.nombreInfractor ?? item.infractor?.nombre ?? '',
    genero: item.genero ?? item.infractor?.genero ?? '',
    numeroLicencia: item.numeroLicencia ?? item.infractor?.numeroLicencia ?? '',
    servicio: item.servicio ?? item.vehiculo?.servicio ?? '',
    clase: item.clase ?? item.vehiculo?.clase ?? '',
    tipo: item.tipo ?? item.vehiculo?.tipo ?? '',
    marca: item.marca ?? item.vehiculo?.marca ?? '',
    modelo: item.modelo ?? item.vehiculo?.modelo ?? '',
    color: item.color ?? item.vehiculo?.color ?? '',
    placas: item.placas ?? item.vehiculo?.placas ?? '',
    estadoPlacas: item.estadoPlacas ?? item.vehiculo?.estadoPlacas ?? '',
    serie: item.serie ?? item.vehiculo?.serie ?? '',
    motor: item.motor ?? item.vehiculo?.motor ?? '',
    municipio: item.municipio ?? item.ubicacion?.municipio ?? '',
    agencia: item.agencia ?? item.ubicacion?.agencia ?? '',
    colonia: item.colonia ?? item.ubicacion?.colonia ?? '',
    calle: item.calle ?? item.ubicacion?.calle ?? '',
    m1: item.m1 ?? item.ubicacion?.m1 ?? '',
    m2: item.m2 ?? item.ubicacion?.m2 ?? '',
    m3: item.m3 ?? item.ubicacion?.m3 ?? '',
    m4: item.m4 ?? item.ubicacion?.m4 ?? '',
    claveOficial: item.claveOficial ?? firstDetail?.claveOficial ?? '',
    numeroParteInformativo:
      item.numeroParteInformativo ?? firstDetail?.numeroParteInformativo ?? '',
    nombreOperativo: item.nombreOperativo ?? firstDetail?.nombreOperativo ?? '',
    sitioServicioPublico:
      item.sitioServicioPublico ?? firstDetail?.sitioServicioPublico ?? '',
    encierroRegistro:
      item.encierroRegistro ??
      (item.situacionVehiculo === 'VEHICULO_DETENIDO' ? { folioInfraccion: item.folioInfraccion } : null),
  };
}

export const infraccionesService = {
  async list(params = {}, token) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && value.trim() === '') return;
      queryParams.append(key, value);
    });

    const query = queryParams.toString();
    const path = query ? `/infracciones?${query}` : '/infracciones';
    const response = await apiRequest(path, { token });

    return {
      ...response,
      data: Array.isArray(response?.data)
        ? response.data.map(normalizeInfraccion)
        : [],
    };
  },

  async getByFolio(folio, token) {
    const response = await apiRequest(`/infracciones/${folio}`, { token });
    return normalizeInfraccion(response?.data ?? response);
  },

  async create(payload, token) {
    const response = await apiRequest('/infracciones', {
      method: 'POST',
      body: serializeInfraccionPayload(payload),
      token,
    });
    return normalizeInfraccion(response?.data ?? response);
  },

  async update(folio, payload, token) {
    const response = await apiRequest(`/infracciones/${folio}`, {
      method: 'PATCH',
      body: serializeInfraccionPayload(payload),
      token,
    });
    return normalizeInfraccion(response?.data ?? response);
  },

  async remove(folio, token) {
    return await apiRequest(`/infracciones/${folio}`, {
      method: 'DELETE',
      token,
    });
  },

  async getKpis(filters = {}, token) {
    const query = new URLSearchParams(filters).toString();
    const path = query
      ? `/infracciones/kpis/resumen?${query}`
      : '/infracciones/kpis/resumen';
    return await apiRequest(path, { token });
  },
};
