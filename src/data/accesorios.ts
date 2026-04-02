// Longitudes equivalentes de accesorios según NAG-200 (metros)
// Para cañería de hierro negro IRAM 2502

export interface AccesorioData {
  tipo: string;
  nombre: string;
  // Longitudes equivalentes por diámetro nominal (mm de diámetro interno)
  le: {
    15.8: number;  // 1/2"
    21.3: number;  // 3/4"
    26.6: number;  // 1"
    35.1: number;  // 1-1/4"
    40.9: number;  // 1-1/2"
    52.5: number;  // 2"
  };
  // Factor genérico: Le = factor * d (d en mm)
  factor: number;
}

export const ACCESORIOS_DATA: AccesorioData[] = [
  {
    tipo: 'codo_90',
    nombre: 'Codo 90°',
    factor: 0.030,
    le: { 15.8: 0.5, 21.3: 0.6, 26.6: 0.8, 35.1: 1.1, 40.9: 1.3, 52.5: 1.7 },
  },
  {
    tipo: 'codo_45',
    nombre: 'Codo 45°',
    factor: 0.018,
    le: { 15.8: 0.3, 21.3: 0.4, 26.6: 0.5, 35.1: 0.7, 40.9: 0.8, 52.5: 1.0 },
  },
  {
    tipo: 'tee_directo',
    nombre: 'Tee paso directo',
    factor: 0.020,
    le: { 15.8: 0.3, 21.3: 0.4, 26.6: 0.5, 35.1: 0.7, 40.9: 0.8, 52.5: 1.0 },
  },
  {
    tipo: 'tee_lateral',
    nombre: 'Tee paso lateral',
    factor: 0.065,
    le: { 15.8: 1.0, 21.3: 1.3, 26.6: 1.7, 35.1: 2.3, 40.9: 2.7, 52.5: 3.4 },
  },
  {
    tipo: 'valvula_esclusa',
    nombre: 'Válvula esclusa',
    factor: 0.007,
    le: { 15.8: 0.1, 21.3: 0.2, 26.6: 0.2, 35.1: 0.3, 40.9: 0.4, 52.5: 0.5 },
  },
  {
    tipo: 'valvula_paso',
    nombre: 'Válvula de paso (bola)',
    factor: 0.020,
    le: { 15.8: 0.3, 21.3: 0.4, 26.6: 0.5, 35.1: 0.7, 40.9: 0.8, 52.5: 1.0 },
  },
  {
    tipo: 'reduccion',
    nombre: 'Reducción / Unión',
    factor: 0.025,
    le: { 15.8: 0.4, 21.3: 0.5, 26.6: 0.7, 35.1: 0.9, 40.9: 1.0, 52.5: 1.3 },
  },
];

// Obtiene la longitud equivalente para un accesorio dado el diámetro interno
export function getLongitudEquivalente(tipoAccesorio: string, dInt: number): number {
  const acc = ACCESORIOS_DATA.find(a => a.tipo === tipoAccesorio);
  if (!acc) return 0;
  return acc.factor * dInt;
}
