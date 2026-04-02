import type { FormData, ResultadosCalculos } from '../types'
import { generarPDF } from '../utils/pdfGenerator'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { CheckCircle2, AlertTriangle, ChevronLeft, FileDown, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  formData: FormData
  resultados: ResultadosCalculos
  onBack: () => void
  onReset: () => void
}

export default function Step4Resultados({ formData, resultados, onBack, onReset }: Props) {
  const { datosGenerales } = formData
  const tieneErrores = resultados.tramos.some(t => !t.ok)
  const vent = resultados.ventilacion
  const edificio = resultados.edificio

  if (edificio) {
    const flowUnit = datosGenerales.tipoGas === 'natural' ? 'm³/h' : 'kg/h'

    return (
      <div className="space-y-5">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Estimacion del edificio lista. Revise simultaneidad, altura y presion disponible con validacion final del profesional matriculado.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tipo', val: edificio.tipoEdificacion, icon: '🏢' },
            { label: 'Gas', val: datosGenerales.tipoGas === 'natural' ? 'Gas Natural' : 'GLP', icon: '⛽' },
            { label: 'Unidades', val: String(edificio.totalUnidades), icon: '🚪' },
            {
              label: 'Caudal total',
              val: `${edificio.caudalTotalSimultaneidad.toFixed(2)} ${flowUnit}`,
              icon: '📊',
            },
          ].map(item => (
            <Card key={item.label} className="text-center">
              <CardContent className="pt-4 pb-3 px-3">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-[11px] text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-bold text-blue-700 capitalize">{item.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900">Resumen del edificio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { lbl: 'Plantilla', val: edificio.plantillaNombre },
                { lbl: 'Regulación', val: edificio.tipoRegulacion === 'colectivo' ? 'Colectiva' : 'Individual' },
                { lbl: 'Caudal unitario', val: `${edificio.caudalUnitario.toFixed(2)} ${flowUnit}` },
                { lbl: 'Factor simultaneidad', val: edificio.factorSimultaneidad.toFixed(2) },
                { lbl: 'Altura total', val: `${edificio.alturaTotal.toFixed(2)} m` },
                { lbl: 'Presión disponible', val: `${edificio.presionDisponible.toFixed(3)} mbar` },
              ].map(item => (
                <div
                  key={item.lbl}
                  className="flex flex-col items-start justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm gap-1 sm:flex-row sm:items-center sm:gap-2"
                >
                  <span className="text-muted-foreground">{item.lbl}</span>
                  <span className="font-bold text-blue-800 text-left break-words sm:text-right">{item.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900">Unidades generadas por piso</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-b-xl">
              <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow className="bg-blue-600 hover:bg-blue-600">
                    <TableHead className="text-white font-semibold text-xs">Piso</TableHead>
                    <TableHead className="text-white font-semibold text-xs">Unidades</TableHead>
                    <TableHead className="text-white font-semibold text-xs">Caudal por piso</TableHead>
                    <TableHead className="text-white font-semibold text-xs">Artefactos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edificio.filas.map(fila => (
                    <TableRow key={fila.piso}>
                      <TableCell className="text-sm font-medium">{fila.piso}</TableCell>
                        <TableCell className="text-sm min-w-[180px]">{fila.unidades.join(', ')}</TableCell>
                      <TableCell className="text-sm font-semibold text-blue-700">
                        {fila.caudalPorPiso.toFixed(2)} {flowUnit}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fila.artefactosPorUnidad} c/u
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {formData.ambientesVentilacion.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-900">Requisitos de ventilación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                  Potencia ventilada total: <strong>{vent.consumoTotalKW.toFixed(2)} kW</strong>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                  Area inferior total: <strong>{vent.areaRejillaInferior.toFixed(0)} cm2</strong>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                  Area superior total: <strong>{vent.areaRejillaSuperior.toFixed(0)} cm2</strong>
                </div>
              </div>
              {formData.ambientesVentilacion.map(ambiente => (
                <div
                  key={ambiente.id}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <span className="font-semibold text-gray-800">{ambiente.nombre}</span>
                    <span className="text-sm text-gray-700">Volumen: {ambiente.volumen.toFixed(2)} m3</span>
                    <span className="text-sm text-gray-700">Potencia estimada: {ambiente.consumoEstimadoKW.toFixed(2)} kW</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-700 sm:flex-row sm:flex-wrap sm:gap-4">
                    <span>Rejilla inf: {ambiente.areaRejillaInferior.toFixed(0)} cm2</span>
                    <span>Rejilla sup: {ambiente.areaRejillaSuperior.toFixed(0)} cm2</span>
                    <span>Conducto: O{ambiente.diametroConducto} mm</span>
                    <span>Criterio: {ambiente.criterioCalculo}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm flex flex-col gap-1 sm:block">
            <span>
              Altura total: <strong>{edificio.alturaTotal.toFixed(2)} m</strong>
            </span>
            <span>
              Pérdida por columna: <strong>-{edificio.perdidaColumna.toFixed(3)} mbar</strong>
            </span>
            <span>
              Presión disponible por cañería: <strong>{edificio.presionDisponible.toFixed(3)} mbar</strong>
            </span>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
          <Button variant="outline" onClick={onBack} className="gap-1.5 w-full sm:w-auto">
            <ChevronLeft className="h-4 w-4" />
            Modificar
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              onClick={() => generarPDF(formData, resultados)}
              className="gap-1.5 bg-sky-700 hover:bg-sky-800 w-full sm:w-auto"
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
            <Button onClick={onReset} className="gap-1.5 w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Nueva calculación
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <Alert variant={tieneErrores ? 'warning' : 'success'}>
        {tieneErrores ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        <AlertDescription className="font-medium">
          {tieneErrores
            ? 'Algunos tramos requieren revisión. Verifique las advertencias debajo.'
            : 'Calculo completado. Verifique criterios tecnicos y normativa vigente antes de presentar.'}
        </AlertDescription>
      </Alert>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Instalación',
            val:
              datosGenerales.tipoInstalacion === 'unifamiliar' ? 'Unifamiliar' : 'Edificio/PH',
            icon: '🏠',
          },
          {
            label: 'Tipo de gas',
            val: datosGenerales.tipoGas === 'natural' ? 'Gas Natural' : 'GLP',
            icon: '⛽',
          },
          {
            label: 'Caudal c/ simultaneidad',
            val: `${resultados.consumoTotalConSimultaneidad.toFixed(3)} m³/h`,
            icon: '📊',
          },
          {
            label: 'Tramos calculados',
            val: String(resultados.tramos.length),
            icon: '📏',
          },
        ].map(r => (
          <Card key={r.label} className="text-center">
            <CardContent className="pt-4 pb-3 px-3">
              <div className="text-2xl mb-1">{r.icon}</div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{r.label}</p>
              <p className="text-sm font-bold text-blue-700">{r.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hydraulic results table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-900">
            Cálculo Hidráulico por Tramos{' '}
            <span className="text-muted-foreground font-normal text-xs">— Fórmula de Renouard</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-[11px]">
              d = (23.200 × δ × Le × Q^1.82 / ΔP)^0.2075
            </code>
            {' | '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-[11px]">
              v = 358.36 × Q / d²
            </code>
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-blue-600 hover:bg-blue-600">
                  {['Tramo', 'Q (m³/h)', 'Le (m)', 'd calc. (mm)', 'D comercial', 'v (m/s)', 'ΔP (mbar)', 'Estado'].map(
                    h => (
                      <TableHead key={h} className="text-white font-semibold text-xs whitespace-nowrap">
                        {h}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultados.tramos.map(r => (
                  <TableRow key={r.tramoId} className={cn(!r.ok && 'bg-red-50 hover:bg-red-100')}>
                     <TableCell className="text-sm font-medium min-w-[120px]">{r.nombre}</TableCell>
                    <TableCell className="text-sm">{r.caudal.toFixed(3)}</TableCell>
                    <TableCell className="text-sm">{r.longitudEquivalente.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{r.diametroCalculado.toFixed(1)}</TableCell>
                    <TableCell className="text-sm font-bold">{r.diametroComercial}</TableCell>
                    <TableCell
                      className={cn(
                        'text-sm font-semibold',
                        r.velocidad > 7 ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {r.velocidad.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-sm font-semibold',
                        r.caida_presion > 1 ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {r.caida_presion.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.ok ? 'success' : 'warning'} className="whitespace-nowrap">
                        {r.ok ? '✓ OK' : '⚠ Revisar'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Advertencias */}
      {resultados.tramos.some(t => t.advertencias.length > 0) && (
        <div className="space-y-2">
          {resultados.tramos
            .filter(t => t.advertencias.length > 0)
            .map(t => (
              <div
                key={t.tramoId}
                className="px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-sm text-yellow-800"
              >
                <strong>{t.nombre}:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {t.advertencias.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}

      {/* Technical parameters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-900">Parámetros Técnicos NAG-200</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { lbl: 'Caída de presión máxima', val: '1 mbar (10 mmcda)' },
              { lbl: 'Velocidad máxima', val: '7 m/s' },
              { lbl: 'Presión de hermeticidad', val: '150 mbar / 200 mmH₂O' },
              { lbl: 'Factor simultaneidad', val: 'Top 2: 100% | Resto: 50%' },
            ].map(p => (
                <div
                  key={p.lbl}
                  className="flex flex-col items-start justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm gap-1 sm:flex-row sm:items-center sm:gap-2"
                >
                  <span className="text-muted-foreground">{p.lbl}</span>
                  <span className="font-bold text-blue-800 text-left break-words sm:text-right">{p.val}</span>
                </div>
              ))}
            </div>
        </CardContent>
      </Card>

      {/* Ventilation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-900">Ventilación (NAG-200 Cap. 6)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { lbl: 'Potencia total', val: `${vent.consumoTotalKW.toFixed(2)} kW` },
              { lbl: 'Área total requerida', val: `${vent.areaRequerida.toFixed(1)} cm²` },
              {
                lbl: 'Rejilla inferior (< 30 cm piso)',
                val: `${vent.areaRejillaInferior.toFixed(0)} cm²`,
              },
              {
                lbl: 'Rejilla superior (> 1,80 m)',
                val: `${vent.areaRejillaSuperior.toFixed(0)} cm²`,
              },
            ].map(v => (
                <div
                  key={v.lbl}
                  className="flex flex-col items-start justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm gap-1 sm:flex-row sm:items-center sm:gap-2"
                >
                  <span className="text-muted-foreground">{v.lbl}</span>
                  <span className="font-bold text-blue-800 text-left break-words sm:text-right">{v.val}</span>
                </div>
              ))}
            </div>
        </CardContent>
      </Card>

      {/* Materials list */}
      {resultados.listaMaterieles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-900">
              Lista de Materiales{' '}
              <span className="text-muted-foreground font-normal text-xs">
                (incluye 12% desperdicio)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-b-xl">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow className="bg-blue-600 hover:bg-blue-600">
                    <TableHead className="text-white font-semibold text-xs">Descripción</TableHead>
                    <TableHead className="text-white font-semibold text-xs">Cantidad</TableHead>
                    <TableHead className="text-white font-semibold text-xs">Unidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultados.listaMaterieles.map((m, i) => (
                    <TableRow key={i}>
                       <TableCell className="text-sm min-w-[220px]">{m.descripcion}</TableCell>
                      <TableCell className="text-sm font-medium">{m.cantidad}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.unidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
        <Button variant="outline" onClick={onBack} className="gap-1.5 w-full sm:w-auto">
          <ChevronLeft className="h-4 w-4" />
          Modificar
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            onClick={() => generarPDF(formData, resultados)}
            className="gap-1.5 bg-sky-700 hover:bg-sky-800 w-full sm:w-auto"
          >
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button onClick={onReset} className="gap-1.5 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Nueva calculación
          </Button>
        </div>
      </div>

      <Alert variant="info">
        <AlertDescription className="text-sm text-blue-700">
          <strong className="text-blue-800">Informe de apoyo tecnico:</strong> util como referencia
          para presentaciones ante <strong>Metrogas</strong>, <strong>Camuzzi</strong> y{' '}
          <strong>Naturgy</strong>, con validacion final del profesional matriculado.
        </AlertDescription>
      </Alert>
    </div>
  )
}
