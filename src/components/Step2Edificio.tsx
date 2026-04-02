import { useEffect, useMemo, useRef, useState } from 'react'
import type { DatosEdificio, TipoEdificacion, TipoGas, TipoRegulacion } from '../types'
import { calcularEdificio } from '../utils/calculations'
import { PLANTILLAS_UNIDAD, TIPOS_EDIFICACION } from '../data/edificios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Alert, AlertDescription } from './ui/alert'
import { cn } from '@/lib/utils'
import { Building2, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useAppToast } from '../hooks/use-app-toast'

interface Props {
  tipoGas: TipoGas
  datos: DatosEdificio
  onChange: (datos: DatosEdificio) => void
}

const FLOW_UNIT: Record<TipoGas, string> = {
  natural: 'm³/h',
  glp: 'kg/h',
}

const BUILDING_LABELS: Record<TipoEdificacion, string> = {
  ph: 'PH',
  edificio: 'Edificio',
  torre: 'Torre',
}

const REGULATION_LABELS: Record<TipoRegulacion, string> = {
  colectivo: 'Regulador colectivo',
  individual: 'Reguladores individuales',
}

export default function Step2Edificio({ tipoGas, datos, onChange }: Props) {
  const { toast } = useAppToast()
  const [generated, setGenerated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const set = <K extends keyof DatosEdificio,>(field: K, value: DatosEdificio[K]) => {
    setGenerated(false)
    setShowResults(false)
    onChange({ ...datos, [field]: value })
  }

  const resultado = useMemo(() => calcularEdificio(datos, tipoGas), [datos, tipoGas])
  const isValid = datos.cantidadPisos >= 2 && datos.unidadesPorPiso >= 1 && datos.alturaPorPiso > 0

  useEffect(() => {
    setGenerated(false)
    setShowResults(false)
  }, [tipoGas])

  useEffect(() => {
    if (showResults) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showResults])

  const handleGenerate = () => {
    if (!isValid) {
      toast({
        title: 'Datos de edificio incompletos',
        description: 'Complete pisos, altura por piso y unidades por piso con valores validos.',
        variant: 'warning',
      })
      return
    }
    setGenerated(true)
    setShowResults(false)
  }

  const totalMbar = resultado.perdidaColumna + 0.406

  return (
    <div className="space-y-5">
      <div className="rounded-2xl sm:rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-1 shadow-sm overflow-hidden">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-700" />
                <CardTitle className="text-base sm:text-lg text-blue-900">Calculadora adicional: Edificios / Unidades</CardTitle>
              </div>
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Modulo independiente
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta calculadora dimensiona el montante colectivo del edificio y no reemplaza el flujo principal de 4 pasos.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 space-y-4">
              <div className="space-y-2">
                <Label>Tipo de edificación</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TIPOS_EDIFICACION.map(tipo => (
                    <button
                      key={tipo.id}
                      onClick={() => set('tipoEdificacion', tipo.id)}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-center transition-all min-h-[84px] sm:min-h-0',
                        datos.tipoEdificacion === tipo.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      )}
                    >
                      <div className="text-sm font-semibold text-gray-800">{tipo.nombre}</div>
                      <div className="text-xs text-muted-foreground">{tipo.descripcion}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cantidadPisos">Cantidad de pisos</Label>
                  <Input
                    id="cantidadPisos"
                    type="number"
                    min="2"
                    value={datos.cantidadPisos || ''}
                    onChange={e => set('cantidadPisos', Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Ej: 6"
                  />
                  <p className="text-xs text-muted-foreground">Incluye PB como piso</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alturaPorPiso">Altura por piso (m)</Label>
                  <Input
                    id="alturaPorPiso"
                    type="number"
                    min="2"
                    step="0.1"
                    value={datos.alturaPorPiso || ''}
                    onChange={e => set('alturaPorPiso', Number(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Estándar: 2.60-2.80 m</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="unidadesPorPiso">Unidades por piso</Label>
                  <Input
                    id="unidadesPorPiso"
                    type="number"
                    min="1"
                    value={datos.unidadesPorPiso || ''}
                    onChange={e => set('unidadesPorPiso', Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Ej: 4"
                  />
                  <p className="text-xs text-muted-foreground">Deptos/unidades funcionales</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de unidad funcional (plantilla)</Label>
                <Select value={datos.plantillaId} onValueChange={value => set('plantillaId', value)}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANTILLAS_UNIDAD.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nombre} - {item.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Se aplica a todas las unidades. Después se puede refinar tramo por tramo si hace falta.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de regulación</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  {(['colectivo', 'individual'] as const).map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="tipoRegulacionEdificio"
                        checked={datos.tipoRegulacion === item}
                        onChange={() => set('tipoRegulacion', item)}
                      />
                      <span>
                        <strong>{REGULATION_LABELS[item]}</strong>
                        {item === 'colectivo'
                          ? ' - 1 regulador para todo el edificio'
                          : ' - 1 regulador por unidad'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="button" onClick={handleGenerate} className="w-full gap-2" disabled={!isValid}>
                <Calculator className="h-4 w-4" />
                Generar unidades
              </Button>
            </div>

            {generated && (
              <div className="space-y-4 border-t border-blue-100 pt-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{resultado.totalUnidades} unidades generadas</p>
                  </div>
                  <p className="text-sm text-blue-700 font-semibold">
                    Factor simultaneidad (Sn): {resultado.factorSimultaneidad.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl border overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-600 hover:bg-blue-600">
                        <TableHead className="text-white text-xs">Piso</TableHead>
                        <TableHead className="text-white text-xs">Unidades</TableHead>
                        <TableHead className="text-white text-xs">Caudal c/simult.</TableHead>
                        <TableHead className="text-white text-xs">Artefactos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultado.filas.map(fila => (
                        <TableRow key={fila.piso}>
                          <TableCell className="text-sm font-medium">{fila.piso}</TableCell>
                          <TableCell className="text-sm">{fila.unidades.join(', ')}</TableCell>
                          <TableCell className="text-sm font-semibold text-blue-700">
                            {fila.caudalPorPiso.toFixed(2)} {FLOW_UNIT[tipoGas]}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fila.artefactosPorUnidad} c/u</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="font-semibold">{resultado.totalUnidades} unidades</TableCell>
                        <TableCell className="font-bold text-blue-700">
                          {resultado.caudalTotalSimultaneidad.toFixed(2)} {FLOW_UNIT[tipoGas]}
                        </TableCell>
                        <TableCell className="text-muted-foreground">con Sn={resultado.factorSimultaneidad.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                  </div>
                </div>

                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="block mb-1">Regulación de presión por altura</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Altura total</div>
                        <div className="font-semibold">{resultado.alturaTotal.toFixed(1)} m</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pérdida por columna gas</div>
                        <div className="font-semibold">~{resultado.perdidaColumna.toFixed(3)} mbar</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Presión disponible p/cañería</div>
                        <div className="font-semibold">{resultado.presionDisponible.toFixed(3)} mbar</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="h-auto w-full justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 sm:px-6 sm:py-5 text-center text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800"
                >
                  <div className="flex items-center justify-center gap-3 text-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                    <div>
                      <p className="text-lg sm:text-2xl font-bold leading-tight">Calcular montante y presion del edificio</p>
                      <p className="mt-1 text-xs sm:text-sm text-emerald-50">Estimacion de apoyo independiente del flujo principal. Requiere validacion del profesional matriculado.</p>
                    </div>
                  </div>
                </Button>

                {showResults && (
                  <div ref={resultsRef} className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-4 sm:p-6 shadow-lg space-y-5 overflow-hidden">
                  <h3 className="text-xl sm:text-2xl font-bold">Resultados del edificio</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        value: resultado.caudalTotalSimultaneidad.toFixed(2),
                        label: `${FLOW_UNIT[tipoGas]} colectivo`,
                        note: 'con Sn aplicado',
                      },
                      {
                        value: '2"',
                        label: 'Montante',
                        note: 'diametro minimo',
                      },
                      {
                        value: resultado.perdidaColumna.toFixed(3),
                        label: 'mbar por altura',
                        note: `${resultado.alturaTotal.toFixed(1)} m total`,
                      },
                      {
                        value: totalMbar.toFixed(3),
                        label: 'mbar total',
                        note: totalMbar > 1 ? 'excede 1 mbar' : 'cumple',
                      },
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl bg-white/10 px-4 py-4 text-center min-w-0">
                        <div className="text-3xl sm:text-4xl font-bold leading-none break-words">{item.value}</div>
                        <div className="mt-2 text-sm font-semibold">{item.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-blue-100">{item.note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 space-y-3 text-sm">
                    {[
                      ['Tipo de edificación', BUILDING_LABELS[resultado.tipoEdificacion]],
                      ['Pisos x Unidades/piso', `${datos.cantidadPisos} x ${datos.unidadesPorPiso} = ${resultado.totalUnidades} unidades`],
                      ['Altura por piso', `${datos.alturaPorPiso} m`],
                      ['Factor simultaneidad (Sn)', `${resultado.factorSimultaneidad.toFixed(2)} (NAG-200 Tabla 2.1)`],
                      ['Regulación', REGULATION_LABELS[datos.tipoRegulacion]],
                      ['Presión de suministro', '19 mbar (estándar baja presión)'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col items-start justify-between gap-1 border-b border-white/10 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-blue-100">{label}</span>
                        <span className="font-semibold text-left sm:text-right break-words">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 text-sm text-blue-50">
                    <strong>Nota importante:</strong> Esta estimacion orienta el montante (caneria colectiva vertical) del edificio. Las instalaciones internas de cada unidad funcional deben calcularse y validarse por separado usando el modo "Vivienda unifamiliar" y el criterio del profesional matriculado.
                  </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
