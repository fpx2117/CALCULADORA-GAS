export type TipoGas = 'natural' | 'glp';
export type TipoInstalacion = 'unifamiliar' | 'edificio';
export type RatioVentilacion = 4 | 6;
export type MaterialCañeria = 'hierro' | 'cobre' | 'acero_inox';
export type MetodoLongitudEquivalente = 'factor_1_2' | 'accesorios_detallados';
export type TipoEdificacion = 'ph' | 'edificio' | 'torre';
export type TipoRegulacion = 'colectivo' | 'individual';

export interface DatosGenerales {
  nombreInstalador: string;
  matricula: string;
  direccion: string;
  tipoGas: TipoGas;
  tipoInstalacion: TipoInstalacion;
}

export interface PlantillaUnidad {
  id: string;
  nombre: string;
  descripcion: string;
  artefactos: string[];
  caudalNatural: number;
  caudalGLP: number;
}

export interface DatosEdificio {
  tipoEdificacion: TipoEdificacion;
  cantidadPisos: number;
  alturaPorPiso: number;
  unidadesPorPiso: number;
  plantillaId: string;
  tipoRegulacion: TipoRegulacion;
}

export interface FilaEdificio {
  piso: string;
  unidades: string[];
  caudalPorPiso: number;
  artefactosPorUnidad: number;
}

export interface AmbienteVentilacion {
  id: string;
  nombre: string;
  largo: number;
  ancho: number;
  alto: number;
  volumen: number;
  artefactoPrincipal: string;
  consumoEstimadoKW: number;
  criterioCalculo: string;
  areaRejillaInferior: number;
  areaRejillaSuperior: number;
  diametroConducto: number;
}

export interface ResultadoEdificio {
  tipoEdificacion: TipoEdificacion;
  tipoRegulacion: TipoRegulacion;
  plantillaId: string;
  plantillaNombre: string;
  plantillaArtefactos: string[];
  totalUnidades: number;
  factorSimultaneidad: number;
  caudalUnitario: number;
  caudalPorPiso: number;
  caudalTotalSimultaneidad: number;
  alturaTotal: number;
  perdidaColumna: number;
  presionDisponible: number;
  filas: FilaEdificio[];
}

export interface Artefacto {
  id: string;
  nombre: string;
  consumoNatural: number; // m³/h
  consumoGLP: number;     // m³/h
  categoria: string;
}

export interface ArtefactoInstalado {
  id: string;
  artefactoId: string;
  nombre: string;
  consumo: number; // m³/h según tipo de gas
  cantidad: number;
}

export interface Accesorio {
  tipo: string;
  nombre: string;
}

export interface AccesorioTramo {
  tipo: string;
  nombre: string;
  cantidad: number;
}

export interface Tramo {
  id: string;
  nombre: string;
  longitud: number; // metros reales
  caudal: number; // m3/h efectivo del tramo
  metodoLongitudEquivalente: MetodoLongitudEquivalente;
  accesorios: AccesorioTramo[];
  artefactosIds: string[]; // IDs de ArtefactoInstalado servidos por este tramo
  material: MaterialCañeria;
}

// Resultado calculado para un tramo
export interface ResultadoTramo {
  tramoId: string;
  nombre: string;
  caudal: number;        // m³/h
  longitudReal: number;        // m
  longitudEquivalente: number; // m
  longitudAccesorios: number;  // m
  metodoLongitudEquivalente: MetodoLongitudEquivalente;
  metodoLongitudEquivalenteLabel: string;
  accesoriosDetalle: Array<{
    tipo: string;
    nombre: string;
    cantidad: number;
    longitudEquivalente: number;
  }>;
  diametroCalculado: number;   // mm (interno)
  diametroComercial: string;   // ej: "DN20 (3/4\")"
  diametroInternoReal: number; // mm
  velocidad: number;           // m/s
  caida_presion: number;       // mbar (verificación)
  ok: boolean;
  advertencias: string[];
}

export interface ResultadoVentilacion {
  consumoTotalKW: number;
  areaRequerida: number;       // cm²
  areaRejillaInferior: number; // cm²
  areaRejillaSuperior: number; // cm²
  cantidadRejillas: number;
  ok: boolean;
}

export interface ResultadosCalculos {
  tramos: ResultadoTramo[];
  ventilacion: ResultadoVentilacion;
  consumoTotalConSimultaneidad: number;
  factorSimultaneidad: number;
  listaMaterieles: MaterialItem[];
  edificio?: ResultadoEdificio;
}

export interface MaterialItem {
  descripcion: string;
  cantidad: number;
  unidad: string;
}

export interface FormData {
  datosGenerales: DatosGenerales;
  datosEdificio: DatosEdificio;
  artefactosInstalados: ArtefactoInstalado[];
  tramos: Tramo[];
  ambientesVentilacion: AmbienteVentilacion[];
  ratioVentilacion: RatioVentilacion;
  resultados?: ResultadosCalculos;
}
