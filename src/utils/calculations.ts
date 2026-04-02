import type {
  AmbienteVentilacion,
  AccesorioTramo,
  DatosEdificio,
  FilaEdificio,
  FormData,
  MetodoLongitudEquivalente,
  ResultadosCalculos,
  ResultadoTramo,
  ResultadoEdificio,
  ResultadoVentilacion,
  MaterialItem,
  ArtefactoInstalado,
  Tramo,
  TipoGas,
} from '../types';
import { getDiametros } from '../data/cañerias';
import { ACCESORIOS_DATA } from '../data/accesorios';
import { getPlantillaUnidad } from '../data/edificios';

// Densidad relativa según tipo de gas
const DENSIDAD_RELATIVA: Record<string, number> = {
  natural: 0.65,
  glp: 1.52,
};

// Poder calorífico (kcal/m³)
const PODER_CALORIFICO: Record<string, number> = {
  natural: 9300,
  glp: 11000,
};

const MAX_CAIDA_PRESION = 1.0; // mbar
const MAX_VELOCIDAD = 7.0; // m/s
const KW_POR_KCAL_H = 1 / 860; // 1 kcal/h = 1/860 kW
const FACTOR_ALTURA_MBAR_POR_METRO = 0.06;
const AREA_MINIMA_REJILLA = 100;
const POTENCIA_MINIMA_AMBIENTE_KW = 2;
const POTENCIA_REFERENCIA_POR_M3 = 0.12;

function getMetodoLongitudLabel(metodo: MetodoLongitudEquivalente): string {
  return metodo === 'accesorios_detallados' ? 'Accesorios detallados' : 'Factor 1.2'
}

function calcularLongitudAccesorio(acc: AccesorioTramo, diametroInterno: number): number {
  const accData = ACCESORIOS_DATA.find(item => item.tipo === acc.tipo)
  if (!accData || acc.cantidad <= 0) return 0
  return accData.factor * diametroInterno * acc.cantidad
}

function calcularDetalleAccesorios(tramo: Tramo, diametroInterno: number) {
  return tramo.accesorios
    .filter(acc => acc.cantidad > 0)
    .map(acc => ({
      tipo: acc.tipo,
      nombre: acc.nombre,
      cantidad: acc.cantidad,
      longitudEquivalente: calcularLongitudAccesorio(acc, diametroInterno),
    }))
}

/**
 * Calcula el caudal con criterio de simultaneidad NAG-200:
 * - Los 2 artefactos de mayor consumo al 100%
 * - El resto al 50%
 */
export function aplicarSimultaneidad(consumos: number[]): number {
  if (consumos.length === 0) return 0;
  if (consumos.length === 1) return consumos[0];

  const sorted = [...consumos].sort((a, b) => b - a);
  const top2 = sorted.slice(0, 2).reduce((s, v) => s + v, 0);
  const resto = sorted.slice(2).reduce((s, v) => s + v * 0.5, 0);
  return top2 + resto;
}

function getUnitLabels(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    if (index < 26) return String.fromCharCode(65 + index)
    return `U${index + 1}`
  })
}

function getFloorLabel(index: number): string {
  return index === 0 ? 'PB' : `Piso ${index}`
}

export function calcularEdificio(datosEdificio: DatosEdificio, tipoGas: TipoGas): ResultadoEdificio {
  const plantilla = getPlantillaUnidad(datosEdificio.plantillaId)
  const caudalUnitario =
    tipoGas === 'natural' ? plantilla.caudalNatural : plantilla.caudalGLP
  const totalUnidades = datosEdificio.cantidadPisos * datosEdificio.unidadesPorPiso
  const factorSimultaneidad =
    totalUnidades <= 1
      ? 1
      : Math.max(0.2, Math.min(1, Number(Math.pow(totalUnidades, -0.32).toFixed(2))))
  const caudalPorPiso = caudalUnitario * datosEdificio.unidadesPorPiso
  const caudalTotalSimultaneidad = Number(
    (caudalUnitario * totalUnidades * factorSimultaneidad).toFixed(3)
  )
  const alturaTotal = Number(
    (datosEdificio.cantidadPisos * datosEdificio.alturaPorPiso).toFixed(2)
  )
  const perdidaColumna = Number((alturaTotal * FACTOR_ALTURA_MBAR_POR_METRO).toFixed(3))
  const presionDisponible = Number(Math.max(0.2, 1 - perdidaColumna).toFixed(3))

  const filas: FilaEdificio[] = Array.from({ length: datosEdificio.cantidadPisos }, (_, index) => ({
    piso: getFloorLabel(index),
    unidades: getUnitLabels(datosEdificio.unidadesPorPiso),
    caudalPorPiso: Number(caudalPorPiso.toFixed(3)),
    artefactosPorUnidad: plantilla.artefactos.length,
  }))

  return {
    tipoEdificacion: datosEdificio.tipoEdificacion,
    tipoRegulacion: datosEdificio.tipoRegulacion,
    plantillaId: plantilla.id,
    plantillaNombre: plantilla.nombre,
    plantillaArtefactos: plantilla.artefactos,
    totalUnidades,
    factorSimultaneidad,
    caudalUnitario: Number(caudalUnitario.toFixed(3)),
    caudalPorPiso: Number(caudalPorPiso.toFixed(3)),
    caudalTotalSimultaneidad,
    alturaTotal,
    perdidaColumna,
    presionDisponible,
    filas,
  }
}

/**
 * Fórmula de Renouard (baja presión):
 * ΔP = 23200 × δ × Le × Q^1.82 / d^4.82
 * Despejando d:
 * d = (23200 × δ × Le × Q^1.82 / ΔP)^(1/4.82)
 */
export function calcularDiametroRenouard(
  delta: number,
  le: number,
  Q: number,
  deltaP: number = MAX_CAIDA_PRESION
): number {
  if (Q <= 0 || le <= 0) return 0;
  const d = Math.pow((23200 * delta * le * Math.pow(Q, 1.82)) / deltaP, 1 / 4.82);
  return d; // mm
}

/**
 * Calcula la caída de presión real con Renouard
 */
export function calcularCaidaPresion(
  delta: number,
  le: number,
  Q: number,
  d: number
): number {
  if (d <= 0 || Q <= 0) return 0;
  return (23200 * delta * le * Math.pow(Q, 1.82)) / Math.pow(d, 4.82);
}

/**
 * Calcula velocidad del gas: v = 358.36 × Q / d²
 */
export function calcularVelocidad(Q: number, d: number): number {
  if (d <= 0) return 0;
  return (358.36 * Q) / (d * d);
}

/**
 * Obtiene el diámetro comercial siguiente (mayor o igual) al calculado
 */
export function seleccionarDiametroComercial(
  dCalculado: number,
  material: 'hierro' | 'cobre' | 'acero_inox'
): { nominal: string; dn: string; diametroInterno: number } | null {
  const diametros = getDiametros(material);
  const seleccionado = diametros.find(d => d.diametroInterno >= dCalculado);
  return seleccionado || diametros[diametros.length - 1]; // el mayor disponible si supera todos
}

/**
 * Calcula la longitud equivalente de un tramo
 * Le = L_real + suma(Le_accesorios)
 */
export function calcularLongitudEquivalente(
  tramo: Tramo,
  diametroInterno: number
): number {
  if ((tramo.metodoLongitudEquivalente ?? 'factor_1_2') === 'factor_1_2') {
    return tramo.longitud * 1.2;
  }

  let leAcc = 0;
  for (const acc of tramo.accesorios) {
    const accData = ACCESORIOS_DATA.find(a => a.tipo === acc.tipo);
    if (accData) {
      leAcc += accData.factor * diametroInterno * acc.cantidad;
    }
  }
  return tramo.longitud + leAcc;
}

/**
 * Cálculo iterativo: primero estima Le con L real × 1.2,
 * luego itera con el diámetro real seleccionado
 */
export function calcularTramo(
  tramo: Tramo,
  artefactos: ArtefactoInstalado[],
  tipoGas: TipoGas
): ResultadoTramo {
  const delta = DENSIDAD_RELATIVA[tipoGas];
  const advertencias: string[] = [];
  const metodoLongitudEquivalente = tramo.metodoLongitudEquivalente ?? 'factor_1_2'
  const metodoLongitudEquivalenteLabel = getMetodoLongitudLabel(metodoLongitudEquivalente)

  // Obtener consumos de los artefactos del tramo
  const consumos = artefactos
    .filter(a => tramo.artefactosIds.includes(a.id))
    .map(a => a.consumo * a.cantidad);

  const caudalCalculado = aplicarSimultaneidad(consumos);
  const caudal = tramo.caudal > 0 ? tramo.caudal : caudalCalculado;

  if (caudal === 0) {
    return {
      tramoId: tramo.id,
      nombre: tramo.nombre,
      caudal: 0,
      longitudReal: tramo.longitud,
      longitudEquivalente: tramo.longitud,
      longitudAccesorios: 0,
      metodoLongitudEquivalente,
      metodoLongitudEquivalenteLabel,
      accesoriosDetalle: [],
      diametroCalculado: 0,
      diametroComercial: '-',
      diametroInternoReal: 0,
      velocidad: 0,
      caida_presion: 0,
      ok: false,
      advertencias: ['Sin artefactos asignados a este tramo'],
    };
  }

  // Estimación inicial para seleccionar diámetro comercial preliminar
  const leEstimada = tramo.longitud * 1.2;
  const dCalcEstimado = calcularDiametroRenouard(delta, leEstimada, caudal);
  const comercialEstimado = seleccionarDiametroComercial(dCalcEstimado, tramo.material);

  // Iteración con diámetro real
  const dIntReal = comercialEstimado?.diametroInterno ?? dCalcEstimado;
  const leReal = calcularLongitudEquivalente(tramo, dIntReal);
  const dCalculadoFinal = calcularDiametroRenouard(delta, leReal, caudal);
  const comercialFinal = seleccionarDiametroComercial(dCalculadoFinal, tramo.material);

  if (!comercialFinal) {
    advertencias.push('Caudal excede diámetros comerciales disponibles');
    return {
      tramoId: tramo.id,
      nombre: tramo.nombre,
      caudal,
      longitudReal: tramo.longitud,
      longitudEquivalente: leReal,
      longitudAccesorios: Number(Math.max(0, leReal - tramo.longitud).toFixed(3)),
      metodoLongitudEquivalente,
      metodoLongitudEquivalenteLabel,
      accesoriosDetalle: calcularDetalleAccesorios(tramo, dIntReal),
      diametroCalculado: dCalculadoFinal,
      diametroComercial: 'SUPERA MÁXIMO',
      diametroInternoReal: 0,
      velocidad: 0,
      caida_presion: 0,
      ok: false,
      advertencias,
    };
  }

  const dReal = comercialFinal.diametroInterno;
  const accesoriosDetalle =
    metodoLongitudEquivalente === 'accesorios_detallados'
      ? calcularDetalleAccesorios(tramo, dReal)
      : []
  const longitudAccesorios =
    metodoLongitudEquivalente === 'factor_1_2'
      ? Math.max(0, leReal - tramo.longitud)
      : accesoriosDetalle.reduce((acc, item) => acc + item.longitudEquivalente, 0)
  const velocidad = calcularVelocidad(caudal, dReal);
  const caidaPresion = calcularCaidaPresion(delta, leReal, caudal, dReal);

  if (velocidad > MAX_VELOCIDAD) {
    advertencias.push(`Velocidad ${velocidad.toFixed(2)} m/s supera el máximo de 7 m/s`);
  }
  if (caidaPresion > MAX_CAIDA_PRESION) {
    advertencias.push(`Caída de presión ${caidaPresion.toFixed(3)} mbar supera el máximo de 1 mbar`);
  }
  if (caudal > 8) {
    advertencias.push('Caudal > 8 m³/h: verificar si aplica normativa comercial');
  }

  const nominalDisplay = `${comercialFinal.dn} (${comercialFinal.nominal})`;

  return {
    tramoId: tramo.id,
    nombre: tramo.nombre,
    caudal,
    longitudReal: tramo.longitud,
    longitudEquivalente: leReal,
    longitudAccesorios: Number(longitudAccesorios.toFixed(3)),
    metodoLongitudEquivalente,
    metodoLongitudEquivalenteLabel,
    accesoriosDetalle: accesoriosDetalle.map(item => ({
      ...item,
      longitudEquivalente: Number(item.longitudEquivalente.toFixed(3)),
    })),
    diametroCalculado: dCalculadoFinal,
    diametroComercial: nominalDisplay,
    diametroInternoReal: dReal,
    velocidad,
    caida_presion: caidaPresion,
    ok: advertencias.length === 0,
    advertencias,
  };
}

/**
 * Calcula ventilación según NAG-200 Capítulo 6
 * Área (cm²) = consumo total (kW) × ratio (4 o 6 cm²/kW)
 */
export function calcularVentilacion(
  artefactos: ArtefactoInstalado[],
  tipoGas: TipoGas,
  ratio: 4 | 6
): ResultadoVentilacion {
  const pc = PODER_CALORIFICO[tipoGas];
  const kwhPorM3 = pc * KW_POR_KCAL_H;

  const consumos = artefactos.map(a => a.consumo * a.cantidad);
  const caudalTotal = aplicarSimultaneidad(consumos);
  const consumoKW = caudalTotal * kwhPorM3;

  const areaRequerida = consumoKW * ratio;
  const areaMinima = AREA_MINIMA_REJILLA; // cm² mínimo por rejilla

  // NAG-200: al menos una rejilla inferior (< 30cm piso) y una superior (> 1.80m)
  // Se reparte 50/50 entre inferior y superior
  const areaInferior = Math.max(areaRequerida / 2, areaMinima);
  const areaSuperior = Math.max(areaRequerida / 2, areaMinima);

  return {
    consumoTotalKW: consumoKW,
    areaRequerida,
    areaRejillaInferior: areaInferior,
    areaRejillaSuperior: areaSuperior,
    cantidadRejillas: 2,
    ok: true,
  };
}

function calcularDiametroConducto(area: number): number {
  const diametro = Math.ceil(Math.sqrt((area * 4) / Math.PI) * 10)
  return Math.max(100, diametro)
}

export function calcularAmbienteVentilacion(
  ambiente: Pick<AmbienteVentilacion, 'volumen' | 'artefactoPrincipal'>,
  artefactos: ArtefactoInstalado[],
  tipoGas: TipoGas,
  ratio: 4 | 6
): Pick<
  AmbienteVentilacion,
  'consumoEstimadoKW' | 'criterioCalculo' | 'areaRejillaInferior' | 'areaRejillaSuperior' | 'diametroConducto'
> {
  const potenciaPorVolumen = Math.max(
    POTENCIA_MINIMA_AMBIENTE_KW,
    ambiente.volumen * POTENCIA_REFERENCIA_POR_M3
  )
  const consumoArtefacto = artefactos.find(
    artefacto => artefacto.nombre === ambiente.artefactoPrincipal
  )
  const potenciaArtefacto = consumoArtefacto
    ? consumoArtefacto.consumo * (PODER_CALORIFICO[tipoGas] * KW_POR_KCAL_H)
    : 0
  const consumoEstimadoKW = Math.max(potenciaPorVolumen, potenciaArtefacto)
  const areaTotal = consumoEstimadoKW * ratio
  const areaRejillaInferior = Math.max(areaTotal / 2, AREA_MINIMA_REJILLA)
  const areaRejillaSuperior = Math.max(areaTotal / 2, AREA_MINIMA_REJILLA)

  let criterioCalculo = `Reserva por volumen (${ambiente.volumen.toFixed(1)} m3)`
  if (potenciaArtefacto > 0 && potenciaArtefacto >= potenciaPorVolumen) {
    criterioCalculo = `Artefacto principal: ${ambiente.artefactoPrincipal}`
  } else if (potenciaArtefacto > 0) {
    criterioCalculo = `Volumen dominante + ${ambiente.artefactoPrincipal} de referencia`
  }

  return {
    consumoEstimadoKW: Number(consumoEstimadoKW.toFixed(2)),
    criterioCalculo,
    areaRejillaInferior: Number(areaRejillaInferior.toFixed(1)),
    areaRejillaSuperior: Number(areaRejillaSuperior.toFixed(1)),
    diametroConducto: calcularDiametroConducto(Math.max(areaRejillaInferior, areaRejillaSuperior)),
  }
}

export function calcularVentilacionEdificio(
  ambientes: AmbienteVentilacion[]
): ResultadoVentilacion {
  const areaInferior = ambientes.reduce((acc, ambiente) => acc + ambiente.areaRejillaInferior, 0)
  const areaSuperior = ambientes.reduce((acc, ambiente) => acc + ambiente.areaRejillaSuperior, 0)
  const areaRequerida = areaInferior + areaSuperior
  const consumoTotalKW = ambientes.reduce((acc, ambiente) => acc + ambiente.consumoEstimadoKW, 0)

  return {
    consumoTotalKW: Number(consumoTotalKW.toFixed(2)),
    areaRequerida: Number(areaRequerida.toFixed(1)),
    areaRejillaInferior: Number(areaInferior.toFixed(1)),
    areaRejillaSuperior: Number(areaSuperior.toFixed(1)),
    cantidadRejillas: ambientes.length * 2,
    ok: ambientes.length > 0,
  }
}

/**
 * Genera lista de materiales con 10-15% de desperdicio
 */
export function generarListaMateriales(
  tramos: Tramo[],
  resultados: ResultadoTramo[]
): MaterialItem[] {
  const materiales: MaterialItem[] = [];
  const DESPERDICIO = 1.12; // 12% desperdicio

  // Cañerías por tramo
  for (const tramo of tramos) {
    const res = resultados.find(r => r.tramoId === tramo.id);
    if (!res || res.diametroComercial === '-') continue;

    const longConDesperdicio = Math.ceil(tramo.longitud * DESPERDICIO);
    materiales.push({
      descripcion: `Cañería ${res.diametroComercial} (Tramo: ${tramo.nombre})`,
      cantidad: longConDesperdicio,
      unidad: 'm',
    });

    // Accesorios del tramo
    for (const acc of tramo.accesorios) {
      if (acc.cantidad > 0) {
        materiales.push({
          descripcion: `${acc.nombre} ${res.diametroComercial}`,
          cantidad: acc.cantidad,
          unidad: 'u',
        });
      }
    }
  }

  return materiales;
}

/**
 * Función principal que ejecuta todos los cálculos
 */
export function calcularTodo(formData: FormData): ResultadosCalculos {
  const {
    datosGenerales,
    datosEdificio,
    artefactosInstalados,
    tramos,
    ratioVentilacion,
    ambientesVentilacion,
  } = formData;
  const { tipoGas, tipoInstalacion } = datosGenerales;

  const resultadosTramos = tramos.map(tramo =>
    calcularTramo(tramo, artefactosInstalados, tipoGas)
  );

  const ventilacion =
    tipoInstalacion === 'edificio' && ambientesVentilacion.length > 0
      ? calcularVentilacionEdificio(ambientesVentilacion)
      : calcularVentilacion(artefactosInstalados, tipoGas, ratioVentilacion);

  const consumos = artefactosInstalados.map(a => a.consumo * a.cantidad);
  const consumoTotal = aplicarSimultaneidad(consumos);
  const consumoSinSim = consumos.reduce((s, v) => s + v, 0);
  const factor = consumoSinSim > 0 ? consumoTotal / consumoSinSim : 1;

  const listaMateriales = generarListaMateriales(tramos, resultadosTramos);

  return {
    tramos: resultadosTramos,
    ventilacion,
    consumoTotalConSimultaneidad: consumoTotal,
    factorSimultaneidad: factor,
    listaMaterieles: listaMateriales,
    edificio: tipoInstalacion === 'edificio' ? calcularEdificio(datosEdificio, tipoGas) : undefined,
  };
}
