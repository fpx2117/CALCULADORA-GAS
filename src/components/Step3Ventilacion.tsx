import { useEffect, useMemo, useState } from 'react'
import type {
  AmbienteVentilacion,
  ArtefactoInstalado,
  RatioVentilacion,
  TipoGas,
  TipoInstalacion,
} from '../types'
import { aplicarSimultaneidad, calcularAmbienteVentilacion } from '../utils/calculations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { cn } from '@/lib/utils'
import { ChevronLeft, Info, ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { useAppToast } from '../hooks/use-app-toast'

interface Props {
  tipoGas: TipoGas
  tipoInstalacion: TipoInstalacion
  artefactos: ArtefactoInstalado[]
  ambientes: AmbienteVentilacion[]
  ratio: RatioVentilacion
  onRatioChange: (r: RatioVentilacion) => void
  onAmbientesChange: (ambientes: AmbienteVentilacion[]) => void
  onBack: () => void
  onNext: () => void
}

const PODER_CALORIFICO: Record<TipoGas, number> = { natural: 9300, glp: 11000 }

function sugerirDim(area: number) {
  const lado = Math.ceil(Math.sqrt(area))
  return `${lado} x ${Math.ceil(area / lado)} cm`
}

function formatDimension(value: number) {
  return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

export default function Step3Ventilacion({
  tipoGas,
  tipoInstalacion,
  artefactos,
  ambientes,
  ratio,
  onRatioChange,
  onAmbientesChange,
  onBack,
  onNext,
}: Props) {
  const { toast } = useAppToast()
  const [nombreAmbiente, setNombreAmbiente] = useState('')
  const [largoAmbiente, setLargoAmbiente] = useState('')
  const [anchoAmbiente, setAnchoAmbiente] = useState('')
  const [altoAmbiente, setAltoAmbiente] = useState('')
  const [artefactoPrincipal, setArtefactoPrincipal] = useState('')

  const consumos = artefactos.map(a => a.consumo * a.cantidad)
  const caudalTotal = aplicarSimultaneidad(consumos)
  const kwhPorM3 = PODER_CALORIFICO[tipoGas] / 860
  const consumoKW = caudalTotal * kwhPorM3
  const areaTotal = consumoKW * ratio
  const areaInferior = Math.max(areaTotal / 2, 100)
  const areaSuperior = Math.max(areaTotal / 2, 100)

  const artefactosDisponibles = useMemo(
    () => Array.from(new Set(artefactos.map(artefacto => artefacto.nombre))),
    [artefactos]
  )

  useEffect(() => {
    if (artefactoPrincipal && !artefactosDisponibles.includes(artefactoPrincipal)) {
      setArtefactoPrincipal('')
    }
  }, [artefactoPrincipal, artefactosDisponibles])

  const volumenCalculado = useMemo(() => {
    const largo = Number(largoAmbiente)
    const ancho = Number(anchoAmbiente)
    const alto = Number(altoAmbiente)

    if (largo <= 0 || ancho <= 0 || alto <= 0) {
      return 0
    }

    return Number((largo * ancho * alto).toFixed(2))
  }, [altoAmbiente, anchoAmbiente, largoAmbiente])

  const addAmbiente = () => {
    const largo = Number(largoAmbiente)
    const ancho = Number(anchoAmbiente)
    const alto = Number(altoAmbiente)

    if (!nombreAmbiente.trim() || volumenCalculado <= 0 || largo <= 0 || ancho <= 0 || alto <= 0) {
      toast({
        title: 'Ambiente incompleto',
        description: 'Complete nombre y dimensiones validas antes de agregar el ambiente.',
        variant: 'warning',
      })
      return
    }

    const calculo = calcularAmbienteVentilacion(
      {
        volumen: volumenCalculado,
        artefactoPrincipal,
      },
      artefactos,
      tipoGas,
      ratio
    )

    const nuevo: AmbienteVentilacion = {
      id: `amb-${Date.now()}`,
      nombre: nombreAmbiente.trim(),
      largo,
      ancho,
      alto,
      volumen: volumenCalculado,
      artefactoPrincipal,
      consumoEstimadoKW: calculo.consumoEstimadoKW,
      criterioCalculo: calculo.criterioCalculo,
      areaRejillaInferior: calculo.areaRejillaInferior,
      areaRejillaSuperior: calculo.areaRejillaSuperior,
      diametroConducto: calculo.diametroConducto,
    }

    onAmbientesChange([...ambientes, nuevo])
    setNombreAmbiente('')
    setLargoAmbiente('')
    setAnchoAmbiente('')
    setAltoAmbiente('')
    setArtefactoPrincipal('')
  }

  const removeAmbiente = (id: string) =>
    onAmbientesChange(ambientes.filter(ambiente => ambiente.id !== id))

  if (tipoInstalacion === 'edificio') {
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800">
              Requisitos de ventilación (NAG-200 Cap. 6)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert variant="warning">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Todo ambiente con artefactos a gas de tiro natural debe contar con ventilación
                permanente. Los artefactos de tiro balanceado no computan como exigencia de
                ventilación del ambiente.
              </AlertDescription>
            </Alert>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 sm:px-5 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-sky-900">
                  Ratio de ventilación (NAG-200 Cap. 6) - elegir criterio:
                </p>
                <p className="text-xs text-sky-700">
                  Mínimo absoluto: 100 cm2 por rejilla. Verificar siempre la ficha técnica del
                  artefacto.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
                {([4, 6] as RatioVentilacion[]).map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer text-sky-950">
                    <input
                      type="radio"
                      checked={ratio === r}
                      onChange={() => onRatioChange(r)}
                      className="h-4 w-4"
                    />
                    <span>
                      <strong>{r} cm²/kW</strong>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-ambiente">Nombre del ambiente</Label>
                <Input
                  id="nombre-ambiente"
                  value={nombreAmbiente}
                  onChange={e => setNombreAmbiente(e.target.value)}
                  placeholder="Ej: Cocina"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Volumen (m3) - largo x ancho x alto</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto] sm:items-center">
                  <Input
                    value={largoAmbiente}
                    onChange={e => setLargoAmbiente(e.target.value)}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Largo"
                    className="bg-white"
                  />
                  <span className="hidden sm:inline text-center text-sm text-gray-500">x</span>
                  <Input
                    value={anchoAmbiente}
                    onChange={e => setAnchoAmbiente(e.target.value)}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ancho"
                    className="bg-white"
                  />
                  <span className="hidden sm:inline text-center text-sm text-gray-500">x</span>
                  <Input
                    value={altoAmbiente}
                    onChange={e => setAltoAmbiente(e.target.value)}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Alto"
                    className="bg-white"
                  />
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                    {volumenCalculado > 0 ? `${volumenCalculado.toFixed(2)} m3` : '0.00 m3'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Artefacto principal en este ambiente (opcional)</Label>
                <Select
                  value={artefactoPrincipal || '__none__'}
                  onValueChange={value => setArtefactoPrincipal(value === '__none__' ? '' : value)}
                >
                  <SelectTrigger className="min-h-11 bg-white">
                    <SelectValue placeholder="Seleccionar artefacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin artefacto principal</SelectItem>
                    {artefactosDisponibles.map(artefacto => (
                      <SelectItem key={artefacto} value={artefacto}>
                        {artefacto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-blue-700">
                  Mostrando solo los artefactos seleccionados en el paso anterior.
                </p>
              </div>

              <Button
                onClick={addAmbiente}
                className="w-full border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300"
                variant="outline"
              >
                + Agregar Ambiente
              </Button>
            </div>

            {ambientes.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800">Ambientes agregados</p>
                {ambientes.map(ambiente => (
                  <div
                    key={ambiente.id}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{ambiente.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {formatDimension(ambiente.largo)} x {formatDimension(ambiente.ancho)} x{' '}
                          {formatDimension(ambiente.alto)} m = {ambiente.volumen.toFixed(2)} m3
                        </p>
                        <p className="text-xs text-gray-500">{ambiente.criterioCalculo}</p>
                      </div>
                      <button
                        onClick={() => removeAmbiente(ambiente.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Quitar
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-4">
                      <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                        Potencia estimada: <strong>{ambiente.consumoEstimadoKW.toFixed(2)} kW</strong>
                      </div>
                      <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                        Rejilla inferior: <strong>{ambiente.areaRejillaInferior.toFixed(0)} cm2</strong>
                      </div>
                      <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                        Rejilla superior: <strong>{ambiente.areaRejillaSuperior.toFixed(0)} cm2</strong>
                      </div>
                      <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                        Conducto sugerido: <strong>O{ambiente.diametroConducto} mm</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col items-stretch justify-between pt-1 gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button variant="outline" onClick={onBack} className="gap-1.5 w-full sm:w-auto text-gray-700">
            <ChevronLeft className="h-4 w-4" />
            ← Volver
          </Button>
          <Button onClick={onNext} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            Calcular instalación
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800">Ventilación</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cálculo según NAG-200 Capítulo 6. El local debe tener aberturas permanentes para
            garantizar combustión segura.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Ratio de ventilación</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([4, 6] as RatioVentilacion[]).map(r => (
                <button
                  key={r}
                  onClick={() => onRatioChange(r)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-4 rounded-xl border-2 transition-all cursor-pointer',
                    ratio === r
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                  )}
                >
                  <span
                    className={cn('text-lg font-bold', ratio === r ? 'text-blue-800' : 'text-gray-700')}
                  >
                    {r} cm²/kW
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r === 4 ? 'Ventilación natural directa' : 'Ventilación con conducto'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-blue-900">Resultados del cálculo</h3>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center px-3 py-2.5 border-b border-blue-200 text-sm">
                <span className="text-gray-700">Caudal total (con simultaneidad)</span>
                <span className="font-bold text-blue-800">{caudalTotal.toFixed(3)} m³/h</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2.5 border-b border-blue-200 text-sm">
                <span className="text-gray-700">
                  Potencia ({PODER_CALORIFICO[tipoGas].toLocaleString('es-AR')} kcal/m³ ÷ 860)
                </span>
                <span className="font-bold text-blue-800">{consumoKW.toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold mt-1">
                <span>Área total requerida ({consumoKW.toFixed(2)} kW × {ratio} cm²/kW)</span>
                <span className="font-bold">{areaTotal.toFixed(1)} cm²</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                {
                  label: 'Rejilla Inferior',
                  pos: 'A menos de 30 cm del piso',
                  Icon: ArrowDown,
                  area: areaInferior,
                },
                {
                  label: 'Rejilla Superior',
                  pos: 'A más de 1,80 m del piso',
                  Icon: ArrowUp,
                  area: areaSuperior,
                },
              ].map(v => (
                <div
                  key={v.label}
                  className="bg-white rounded-xl border border-blue-200 p-4 text-center space-y-1.5"
                >
                  <v.Icon className="h-6 w-6 text-blue-500 mx-auto" />
                  <h4 className="text-sm font-bold text-blue-900">{v.label}</h4>
                  <p className="text-xs text-muted-foreground">{v.pos}</p>
                  <div className="text-3xl font-bold text-blue-600">{v.area.toFixed(0)} cm²</div>
                  <p className="text-xs text-muted-foreground">
                    Dim. sugerida: {sugerirDim(v.area)}
                  </p>
                  {v.area === 100 && (
                    <span className="inline-block mt-1 text-[11px] font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      Mínimo normativo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong className="block mb-1 text-blue-800">Requisitos NAG-200 Cap. 6:</strong>
          <ul className="list-disc pl-4 space-y-0.5 text-sm text-blue-700">
            <li>Área mínima por rejilla: 100 cm²</li>
            <li>Rejilla inferior: menos de 30 cm del nivel del piso</li>
            <li>Rejilla superior: más de 1,80 m del nivel del piso</li>
            <li>Las rejillas no pueden estar obstruidas ni con cierre hermético</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-stretch justify-between pt-1 gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button variant="outline" onClick={onBack} className="gap-1.5 w-full sm:w-auto">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} className="gap-1.5 w-full sm:w-auto">
          Calcular y ver Resultados →
        </Button>
      </div>
    </div>
  )
}
