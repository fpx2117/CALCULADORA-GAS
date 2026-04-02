import { useState } from 'react'
import type { ArtefactoInstalado, MetodoLongitudEquivalente, Tramo, TipoGas } from '../types'
import { ARTEFACTOS, CATEGORIAS } from '../data/artefactos'
import { ACCESORIOS_DATA } from '../data/accesorios'
import { aplicarSimultaneidad } from '../utils/calculations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { cn } from '@/lib/utils'
import { Plus, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useAppToast } from '../hooks/use-app-toast'

interface Props {
  tipoGas: TipoGas
  artefactos: ArtefactoInstalado[]
  tramos: Tramo[]
  onArtefactosChange: (a: ArtefactoInstalado[]) => void
  onTramosChange: (t: Tramo[]) => void
  onBack: () => void
  onNext: () => void
}

const PODER_CALORIFICO = { natural: 9300, glp: 11000 }

const METODOS_LE: Array<{ value: MetodoLongitudEquivalente; label: string; hint: string }> = [
  {
    value: 'factor_1_2',
    label: 'Factor 1.2',
    hint: 'Aplica Le = longitud real x 1.2.',
  },
  {
    value: 'accesorios_detallados',
    label: 'Accesorios detallados',
    hint: 'Suma codos, tes y valvulas al calculo.',
  },
]

const ACCESORIOS_FIJOS = [
  { tipo: 'codo_90', label: 'Codos 90°' },
  { tipo: 'codo_45', label: 'Codos 45°' },
  { tipo: 'tee_lateral', label: 'Tes' },
  { tipo: 'valvula_paso', label: 'Válvulas' },
] as const

let artCounter = 0
let tramoCounter = 0

function getNombreAccesorio(tipo: string) {
  return ACCESORIOS_DATA.find(accesorio => accesorio.tipo === tipo)?.nombre ?? tipo
}

function getCantidadAccesorio(tramo: Tramo, tipo: string) {
  return tramo.accesorios.find(accesorio => accesorio.tipo === tipo)?.cantidad ?? 0
}

function construirAccesorios(tramo: Tramo, tipo: string, cantidad: number) {
  const resto = tramo.accesorios.filter(accesorio => accesorio.tipo !== tipo)

  if (cantidad <= 0) {
    return resto
  }

  return [
    ...resto,
    {
      tipo,
      nombre: getNombreAccesorio(tipo),
      cantidad,
    },
  ]
}

function calcularCaudalAsignado(tramo: Tramo, artefactos: ArtefactoInstalado[]) {
  const consumos = artefactos
    .filter(artefacto => tramo.artefactosIds.includes(artefacto.id))
    .map(artefacto => artefacto.consumo * artefacto.cantidad)

  return aplicarSimultaneidad(consumos)
}

export default function Step2Artefactos({
  tipoGas,
  artefactos,
  tramos,
  onArtefactosChange,
  onTramosChange,
  onBack,
  onNext,
}: Props) {
  const { toast } = useAppToast()
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [customNombre, setCustomNombre] = useState('')
  const [customKW, setCustomKW] = useState('')

  const pc = PODER_CALORIFICO[tipoGas]
  const totalCaudalInstalacion = aplicarSimultaneidad(
    artefactos.map(artefacto => artefacto.consumo * artefacto.cantidad)
  )

  const agregarArtefacto = (artefactoId: string) => {
    const art = ARTEFACTOS.find(a => a.id === artefactoId)
    if (!art) return

    const consumo = tipoGas === 'natural' ? art.consumoNatural : art.consumoGLP

    onArtefactosChange([
      ...artefactos,
      {
        id: `art-${++artCounter}-${Date.now()}`,
        artefactoId: art.id,
        nombre: art.nombre,
        consumo,
        cantidad: 1,
      },
    ])
  }

  const agregarPersonalizado = () => {
    const kw = parseFloat(customKW)

    if (!customNombre.trim() || Number.isNaN(kw) || kw <= 0) {
      toast({
        title: 'Artefacto personalizado incompleto',
        description: 'Ingresá un nombre y una potencia valida en kW.',
        variant: 'warning',
      })
      return
    }

    const consumo = (kw * 860) / pc

    onArtefactosChange([
      ...artefactos,
      {
        id: `art-${++artCounter}-${Date.now()}`,
        artefactoId: 'custom',
        nombre: customNombre,
        consumo,
        cantidad: 1,
      },
    ])

    setCustomNombre('')
    setCustomKW('')
  }

  const removerArtefacto = (id: string) => {
    onArtefactosChange(artefactos.filter(artefacto => artefacto.id !== id))
    onTramosChange(
      tramos.map(tramo => ({
        ...tramo,
        artefactosIds: tramo.artefactosIds.filter(artefactoId => artefactoId !== id),
      }))
    )
  }

  const cambiarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return
    onArtefactosChange(
      artefactos.map(artefacto =>
        artefacto.id === id ? { ...artefacto, cantidad } : artefacto
      )
    )
  }

  const agregarTramo = () => {
    const esPrimerTramo = tramos.length === 0
    const nombreDefault = esPrimerTramo ? 'Tramo principal' : `Ramal ${tramos.length}`

    onTramosChange([
      ...tramos,
      {
        id: `tramo-${++tramoCounter}-${Date.now()}`,
        nombre: nombreDefault,
        longitud: 0,
        caudal: esPrimerTramo ? totalCaudalInstalacion : 0,
        metodoLongitudEquivalente: 'factor_1_2',
        accesorios: [],
        artefactosIds: esPrimerTramo ? artefactos.map(artefacto => artefacto.id) : [],
        material: 'hierro',
      },
    ])
  }

  const removerTramo = (id: string) => onTramosChange(tramos.filter(tramo => tramo.id !== id))

  const updTramo = (id: string, field: Partial<Tramo>) =>
    onTramosChange(tramos.map(tramo => (tramo.id === id ? { ...tramo, ...field } : tramo)))

  const normalizarTramos = () =>
    tramos.map((tramo, index) => {
      if (index === 0) {
        return {
          ...tramo,
          caudal: Number(totalCaudalInstalacion.toFixed(3)),
          artefactosIds: artefactos.map(artefacto => artefacto.id),
        }
      }

      const caudalAsignado = calcularCaudalAsignado(tramo, artefactos)

      return {
        ...tramo,
        caudal: tramo.caudal > 0 ? tramo.caudal : Number(caudalAsignado.toFixed(3)),
      }
    })

  const handleNext = () => {
    if (artefactos.length === 0) {
      toast({
        title: 'Faltan artefactos',
        description: 'Agregá al menos un artefacto antes de continuar.',
        variant: 'warning',
      })
      return
    }

    if (tramos.length === 0) {
      toast({
        title: 'Faltan tramos',
        description: 'Definí al menos un tramo de cañeria antes de continuar.',
        variant: 'warning',
      })
      return
    }

    const tramosNormalizados = normalizarTramos()

    const invalidos = tramosNormalizados.filter((tramo, index) => {
      const caudalEfectivo = index === 0 ? totalCaudalInstalacion : tramo.caudal
      return tramo.longitud <= 0 || caudalEfectivo <= 0
    })

    if (invalidos.length > 0) {
      toast({
        title: 'Revisá los tramos',
        description: 'Cada tramo necesita una longitud valida y un caudal mayor a cero.',
        variant: 'warning',
      })
      return
    }

    onTramosChange(tramosNormalizados)
    onNext()
  }

  const artsFiltrados =
    categoriaFiltro === 'Todos'
      ? ARTEFACTOS
      : ARTEFACTOS.filter(artefacto => artefacto.categoria === categoriaFiltro)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-blue-600" />
            <CardTitle className="text-base text-blue-900">A. Artefactos a instalar</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Consumos según NAG-200 Anexo E.1 para{' '}
            <strong>{tipoGas === 'natural' ? 'Gas Natural' : 'GLP'}</strong>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['Todos', ...CATEGORIAS].map(categoria => (
              <button
                key={categoria}
                onClick={() => setCategoriaFiltro(categoria)}
                className={cn(
                  'rounded-full border px-3.5 py-1 text-xs font-medium transition-all',
                  categoriaFiltro === categoria
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                )}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {artsFiltrados.map(art => {
              const consumo = tipoGas === 'natural' ? art.consumoNatural : art.consumoGLP

              return (
                <div
                  key={art.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-gray-800">{art.nombre}</p>
                    <Badge variant="success" className="mt-1 w-fit text-[11px]">
                      {consumo.toFixed(2)} m³/h
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => agregarArtefacto(art.id)}
                    className="gap-1 border-blue-200 text-blue-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="space-y-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-[13px] font-semibold text-gray-700">Artefacto personalizado</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-36 flex-1 space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input
                  type="text"
                  placeholder="Nombre del artefacto"
                  value={customNombre}
                  onChange={event => setCustomNombre(event.target.value)}
                />
              </div>
              <div className="w-36 space-y-1">
                <Label className="text-xs">Potencia (kW)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                  value={customKW}
                  onChange={event => setCustomKW(event.target.value)}
                />
              </div>
              <Button onClick={agregarPersonalizado} disabled={!customNombre || !customKW} className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Q = P x 860 / {pc.toLocaleString('es-AR')} kcal/m³ ({tipoGas === 'natural' ? 'Gas Natural' : 'GLP'}).
            </p>
          </div>

          {artefactos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[13px] font-semibold text-gray-700">Artefactos instalados</p>
              <div className="overflow-hidden rounded-lg border bg-white">
                <div className="overflow-x-auto">
                  <Table className="min-w-[560px]">
                    <TableHeader>
                      <TableRow className="bg-blue-600 hover:bg-blue-600">
                        <TableHead className="text-xs font-semibold text-white">Artefacto</TableHead>
                        <TableHead className="text-xs font-semibold text-white">Consumo unit.</TableHead>
                        <TableHead className="text-xs font-semibold text-white">Cantidad</TableHead>
                        <TableHead className="text-xs font-semibold text-white">Total</TableHead>
                        <TableHead className="w-10 text-white" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artefactos.map(artefacto => (
                        <TableRow key={artefacto.id}>
                          <TableCell className="min-w-[190px] text-sm">{artefacto.nombre}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {artefacto.consumo.toFixed(3)} m³/h
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => cambiarCantidad(artefacto.id, artefacto.cantidad - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50 text-sm font-medium transition-all hover:border-blue-400 hover:text-blue-600"
                              >
                                -
                              </button>
                              <span className="min-w-5 text-center text-sm font-bold">
                                {artefacto.cantidad}
                              </span>
                              <button
                                onClick={() => cambiarCantidad(artefacto.id, artefacto.cantidad + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50 text-sm font-medium transition-all hover:border-blue-400 hover:text-blue-600"
                              >
                                +
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {(artefacto.consumo * artefacto.cantidad).toFixed(3)} m³/h
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removerArtefacto(artefacto.id)}
                              className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-sm font-semibold">
                          Total sin simultaneidad
                        </TableCell>
                        <TableCell colSpan={2} className="text-sm font-bold">
                          {artefactos
                            .reduce((total, artefacto) => total + artefacto.consumo * artefacto.cantidad, 0)
                            .toFixed(3)}{' '}
                          m³/h
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardHeader className="space-y-3 border-b border-gray-100 bg-white pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
              B
            </span>
            <CardTitle className="text-lg text-gray-900">Tramos de cañería</CardTitle>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Cargá cada tramo con su longitud real, accesorios y caudal. El primer tramo se toma
            como principal y usa automáticamente el caudal total de la instalación; los ramales se
            pueden completar manualmente o aprovechar el caudal ya asignado en datos existentes.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 bg-white p-5">
          {artefactos.length === 0 && (
            <div className="flex items-center gap-2 rounded-r-lg border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Primero agregá artefactos en la sección A.
            </div>
          )}

          <div className="space-y-4">
            {tramos.map((tramo, index) => {
              const esPrincipal = index === 0
              const metodo = tramo.metodoLongitudEquivalente ?? 'factor_1_2'
              const caudalAsignado = calcularCaudalAsignado(tramo, artefactos)
              const caudalVisible = esPrincipal ? totalCaudalInstalacion : tramo.caudal || caudalAsignado

              return (
                <div key={tramo.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                        {esPrincipal ? 'Tramo principal' : `Ramal ${index}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {esPrincipal
                          ? 'El caudal se completa en forma automática con el total simultáneo.'
                          : 'Ingresá el caudal del ramal o reutilizá el valor heredado de la versión anterior.'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerTramo(tramo.id)}
                      className="gap-1 self-start text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-1.5 xl:col-span-1">
                      <Label className="text-xs font-semibold text-gray-700">Nombre del tramo</Label>
                      <Input
                        type="text"
                        value={tramo.nombre}
                        onChange={event => updTramo(tramo.id, { nombre: event.target.value })}
                        placeholder="Ej. Cocina / Ramal patio"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">
                        Longitud real (metros)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={tramo.longitud || ''}
                        onChange={event =>
                          updTramo(tramo.id, {
                            longitud: parseFloat(event.target.value) || 0,
                          })
                        }
                        placeholder="0.0"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Caudal del tramo (m³/h)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={caudalVisible || ''}
                        readOnly={esPrincipal}
                        onChange={event =>
                          updTramo(tramo.id, {
                            caudal: parseFloat(event.target.value) || 0,
                          })
                        }
                        placeholder="0.000"
                        className={cn('bg-white', esPrincipal && 'cursor-not-allowed bg-gray-100 text-gray-600')}
                      />
                      <p className="text-xs text-muted-foreground">
                        {esPrincipal
                          ? 'Tramo principal: se calcula con todos los artefactos instalados.'
                          : caudalAsignado > 0
                          ? `Base detectada por artefactos asignados previamente: ${caudalAsignado.toFixed(3)} m³/h.`
                          : 'Ramal: completalo manualmente si no viene de una asignación previa.'}
                      </p>
                    </div>

                    {ACCESORIOS_FIJOS.map(accesorio => (
                      <div key={accesorio.tipo} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">{accesorio.label}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={getCantidadAccesorio(tramo, accesorio.tipo) || ''}
                          onChange={event =>
                            updTramo(tramo.id, {
                              accesorios: construirAccesorios(
                                tramo,
                                accesorio.tipo,
                                Math.max(0, parseInt(event.target.value || '0', 10) || 0)
                              ),
                            })
                          }
                          placeholder="0"
                          className="bg-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Método de longitud equivalente (Le)
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {METODOS_LE.map(opcion => {
                        const activo = metodo === opcion.value

                        return (
                          <label
                            key={opcion.value}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-all',
                              activo
                                ? 'border-orange-300 bg-orange-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              name={`metodo-le-${tramo.id}`}
                              className="mt-0.5 h-4 w-4 accent-orange-500"
                              checked={activo}
                              onChange={() =>
                                updTramo(tramo.id, {
                                  metodoLongitudEquivalente: opcion.value,
                                })
                              }
                            />
                            <span>
                              <span className="block text-sm font-semibold text-gray-900">
                                {opcion.label}
                              </span>
                              <span className="block text-xs text-muted-foreground">{opcion.hint}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={agregarTramo}
            className="h-11 w-full gap-2 rounded-xl border-gray-300 bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Agregar Tramo
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button onClick={handleNext} className="gap-1.5">
          Siguiente: Ventilación
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
