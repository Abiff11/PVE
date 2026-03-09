export const ENCIERRO_OPTIONS = ['San Sebastian Tutla', 'La Joya'] as const;
export type EncierroOption = (typeof ENCIERRO_OPTIONS)[number];

export const SERVICIO_GRUA_OPTIONS = [
  'Varo',
  'Santa teresa',
  'Vesco',
  'Gale',
  'sin grua',
] as const;
export type ServicioGruaOption = (typeof SERVICIO_GRUA_OPTIONS)[number];

export const DEFAULT_ENCIERRO: EncierroOption = ENCIERRO_OPTIONS[0];
export const DEFAULT_SERVICIO_GRUA: ServicioGruaOption =
  SERVICIO_GRUA_OPTIONS[0];

