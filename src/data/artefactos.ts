import type { Artefacto } from '../types';

// Consumos según NAG-200 Anexo E.1
export const ARTEFACTOS: Artefacto[] = [
  // Cocinas
  {
    id: 'cocina_4h_horno',
    nombre: 'Cocina 4 hornallas con horno',
    consumoNatural: 0.70,
    consumoGLP: 0.33,
    categoria: 'Cocción',
  },
  {
    id: 'cocina_4h_sin_horno',
    nombre: 'Cocina 4 hornallas sin horno',
    consumoNatural: 0.50,
    consumoGLP: 0.24,
    categoria: 'Cocción',
  },
  {
    id: 'cocina_2h_horno',
    nombre: 'Cocina 2 hornallas con horno',
    consumoNatural: 0.42,
    consumoGLP: 0.20,
    categoria: 'Cocción',
  },
  {
    id: 'anafe_2h',
    nombre: 'Anafe 2 hornallas',
    consumoNatural: 0.30,
    consumoGLP: 0.14,
    categoria: 'Cocción',
  },
  {
    id: 'horno_ind',
    nombre: 'Horno independiente',
    consumoNatural: 0.35,
    consumoGLP: 0.17,
    categoria: 'Cocción',
  },
  // Calefones y termotanques
  {
    id: 'calefon_14',
    nombre: 'Calefón instantáneo 14 l/min',
    consumoNatural: 0.93,
    consumoGLP: 0.44,
    categoria: 'Agua Caliente',
  },
  {
    id: 'calefon_10',
    nombre: 'Calefón instantáneo 10 l/min',
    consumoNatural: 0.70,
    consumoGLP: 0.33,
    categoria: 'Agua Caliente',
  },
  {
    id: 'calefon_7',
    nombre: 'Calefón instantáneo 7 l/min',
    consumoNatural: 0.50,
    consumoGLP: 0.24,
    categoria: 'Agua Caliente',
  },
  {
    id: 'termotanque_40',
    nombre: 'Termotanque 40 litros',
    consumoNatural: 0.35,
    consumoGLP: 0.17,
    categoria: 'Agua Caliente',
  },
  {
    id: 'termotanque_60',
    nombre: 'Termotanque 60 litros',
    consumoNatural: 0.50,
    consumoGLP: 0.24,
    categoria: 'Agua Caliente',
  },
  {
    id: 'termotanque_80',
    nombre: 'Termotanque 80 litros',
    consumoNatural: 0.70,
    consumoGLP: 0.33,
    categoria: 'Agua Caliente',
  },
  // Estufas
  {
    id: 'estufa_2000',
    nombre: 'Estufa tiro balanceado 2000 kcal/h',
    consumoNatural: 0.22,
    consumoGLP: 0.10,
    categoria: 'Calefacción',
  },
  {
    id: 'estufa_3000',
    nombre: 'Estufa tiro balanceado 3000 kcal/h',
    consumoNatural: 0.32,
    consumoGLP: 0.15,
    categoria: 'Calefacción',
  },
  {
    id: 'estufa_4000',
    nombre: 'Estufa tiro balanceado 4000 kcal/h',
    consumoNatural: 0.43,
    consumoGLP: 0.20,
    categoria: 'Calefacción',
  },
  {
    id: 'estufa_6000',
    nombre: 'Estufa tiro balanceado 6000 kcal/h',
    consumoNatural: 0.65,
    consumoGLP: 0.30,
    categoria: 'Calefacción',
  },
  // Calderas
  {
    id: 'caldera_15000',
    nombre: 'Caldera calefacción 15.000 kcal/h',
    consumoNatural: 1.61,
    consumoGLP: 0.76,
    categoria: 'Calefacción',
  },
  {
    id: 'caldera_20000',
    nombre: 'Caldera calefacción 20.000 kcal/h',
    consumoNatural: 2.15,
    consumoGLP: 1.02,
    categoria: 'Calefacción',
  },
  {
    id: 'caldera_30000',
    nombre: 'Caldera calefacción 30.000 kcal/h',
    consumoNatural: 3.23,
    consumoGLP: 1.53,
    categoria: 'Calefacción',
  },
  {
    id: 'caldera_40000',
    nombre: 'Caldera calefacción 40.000 kcal/h',
    consumoNatural: 4.30,
    consumoGLP: 2.04,
    categoria: 'Calefacción',
  },
  // Otros
  {
    id: 'secadora',
    nombre: 'Secadora de ropa',
    consumoNatural: 0.70,
    consumoGLP: 0.33,
    categoria: 'Otros',
  },
  {
    id: 'parrilla',
    nombre: 'Parrilla a gas',
    consumoNatural: 0.50,
    consumoGLP: 0.24,
    categoria: 'Otros',
  },
];

export const CATEGORIAS = ['Cocción', 'Agua Caliente', 'Calefacción', 'Otros'];
