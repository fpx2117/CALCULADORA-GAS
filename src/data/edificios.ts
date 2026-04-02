import type { PlantillaUnidad, TipoEdificacion } from '../types'

export const PLANTILLAS_UNIDAD: PlantillaUnidad[] = [
  {
    id: 'monoambiente',
    nombre: 'Monoambiente',
    descripcion: 'Cocina (2 hornallas), Calefón 8L, Estufa tiro balanceado 2.4kW',
    artefactos: ['Cocina 2 hornallas', 'Calefón 8L', 'Estufa TB 2.4kW'],
    caudalNatural: 1.68,
    caudalGLP: 1.43,
  },
  {
    id: '1d-basica',
    nombre: '1 dormitorio',
    descripcion: 'Cocina (4 hornallas), Calefón 12L, Estufa tiro balanceado 5kW',
    artefactos: ['Cocina 4 hornallas', 'Calefón 12L', 'Estufa TB 5kW'],
    caudalNatural: 2.45,
    caudalGLP: 2.095,
  },
  {
    id: '2d-familiar',
    nombre: '2 dormitorios',
    descripcion:
      'Cocina (4 hornallas), Calefón 12L, Estufa tiro balanceado 5kW, Estufa tiro balanceado 2.4kW',
    artefactos: ['Cocina 4 hornallas', 'Calefón 12L', 'Estufa TB 5kW', 'Estufa TB 2.4kW'],
    caudalNatural: 3.08,
    caudalGLP: 2.62,
  },
  {
    id: '3d-premium',
    nombre: '3 dormitorios',
    descripcion: 'Cocina (4 hornallas), Calefón 16L, Caldera 24kW',
    artefactos: ['Cocina 4 hornallas', 'Calefón 16L', 'Caldera 24kW'],
    caudalNatural: 4.35,
    caudalGLP: 3.7,
  },
  {
    id: 'ph-tipico',
    nombre: 'PH típico',
    descripcion:
      'Cocina (4 hornallas), Calefón 16L, Estufa tiro balanceado 5kW, Estufa tiro balanceado 2.4kW, Termotanque',
    artefactos: [
      'Cocina 4 hornallas',
      'Calefón 16L',
      'Estufa TB 5kW',
      'Estufa TB 2.4kW',
      'Termotanque',
    ],
    caudalNatural: 4.86,
    caudalGLP: 4.13,
  },
  {
    id: 'local-comercial',
    nombre: 'Local comercial',
    descripcion: 'Calefón 8L, Estufa tiro balanceado 5kW',
    artefactos: ['Calefón 8L', 'Estufa TB 5kW'],
    caudalNatural: 1.92,
    caudalGLP: 1.63,
  },
]

export const TIPOS_EDIFICACION: Array<{
  id: TipoEdificacion
  nombre: string
  descripcion: string
}> = [
  { id: 'ph', nombre: 'PH (2-3 pisos)', descripcion: 'Propiedad horizontal baja' },
  { id: 'edificio', nombre: 'Edificio (4-10)', descripcion: 'Departamentos mediana altura' },
  { id: 'torre', nombre: 'Torre (10+)', descripcion: 'Edificio en altura' },
]

export function getPlantillaUnidad(id: string) {
  return PLANTILLAS_UNIDAD.find(plantilla => plantilla.id === id) ?? PLANTILLAS_UNIDAD[0]
}
