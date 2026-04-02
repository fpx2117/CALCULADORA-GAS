import type { MaterialCañeria } from '../types';

export interface DiametroComercial {
  nominal: string;    // ej: "1/2\""
  dn: string;         // ej: "DN15"
  diametroInterno: number; // mm
}

// Hierro negro IRAM 2502 (Schedule 40)
export const DIAMETROS_HIERRO: DiametroComercial[] = [
  { nominal: '1/2"', dn: 'DN15', diametroInterno: 15.8 },
  { nominal: '3/4"', dn: 'DN20', diametroInterno: 21.3 },
  { nominal: '1"',   dn: 'DN25', diametroInterno: 26.6 },
  { nominal: '1 1/4"', dn: 'DN32', diametroInterno: 35.1 },
  { nominal: '1 1/2"', dn: 'DN40', diametroInterno: 40.9 },
  { nominal: '2"',   dn: 'DN50', diametroInterno: 52.5 },
];

// Cobre (tipo K)
export const DIAMETROS_COBRE: DiametroComercial[] = [
  { nominal: '3/8"', dn: '3/8"', diametroInterno: 9.52 },
  { nominal: '1/2"', dn: '1/2"', diametroInterno: 12.7 },
  { nominal: '3/4"', dn: '3/4"', diametroInterno: 19.1 },
  { nominal: '1"',   dn: '1"',   diametroInterno: 25.4 },
  { nominal: '1 1/4"', dn: '1 1/4"', diametroInterno: 31.8 },
  { nominal: '1 1/2"', dn: '1 1/2"', diametroInterno: 38.1 },
  { nominal: '2"',   dn: '2"',   diametroInterno: 50.8 },
];

// Acero inoxidable (similar Schedule 40)
export const DIAMETROS_ACERO_INOX: DiametroComercial[] = [
  { nominal: '1/2"', dn: 'DN15', diametroInterno: 15.8 },
  { nominal: '3/4"', dn: 'DN20', diametroInterno: 21.3 },
  { nominal: '1"',   dn: 'DN25', diametroInterno: 26.6 },
  { nominal: '1 1/4"', dn: 'DN32', diametroInterno: 35.1 },
  { nominal: '1 1/2"', dn: 'DN40', diametroInterno: 40.9 },
  { nominal: '2"',   dn: 'DN50', diametroInterno: 52.5 },
];

export function getDiametros(material: MaterialCañeria): DiametroComercial[] {
  switch (material) {
    case 'hierro': return DIAMETROS_HIERRO;
    case 'cobre': return DIAMETROS_COBRE;
    case 'acero_inox': return DIAMETROS_ACERO_INOX;
  }
}

export const NOMBRES_MATERIAL: Record<MaterialCañeria, string> = {
  hierro: 'Hierro negro/epoxi IRAM 2502',
  cobre: 'Cobre (soldadura capilar)',
  acero_inox: 'Acero inoxidable NAG-250',
};
