import { useState } from 'react'
import type { FormData, ResultadosCalculos, TipoGas, TipoInstalacion } from './types'
import { calcularTodo } from './utils/calculations'
import Step1General from './components/Step1General'
import Step2Artefactos from './components/Step2Artefactos'
import Step2Edificio from './components/Step2Edificio'
import Step3Ventilacion from './components/Step3Ventilacion'
import Step4Resultados from './components/Step4Resultados'
import EditorialContent from './components/EditorialContent'
import { Badge } from './components/ui/badge'
import { cn } from './lib/utils'
import './App.css'

const INITIAL_FORM: FormData = {
  datosGenerales: {
    nombreInstalador: '',
    matricula: '',
    direccion: '',
    tipoGas: 'natural',
    tipoInstalacion: 'unifamiliar',
  },
  datosEdificio: {
    tipoEdificacion: 'edificio',
    cantidadPisos: 6,
    alturaPorPiso: 2.7,
    unidadesPorPiso: 4,
    plantillaId: '1d-basica',
    tipoRegulacion: 'colectivo',
  },
  artefactosInstalados: [],
  tramos: [],
  ambientesVentilacion: [],
  ratioVentilacion: 4,
}

const DEFAULT_DATOS_EDIFICIO = INITIAL_FORM.datosEdificio

const UNIFAMILIAR_STEPS = [
  { n: 1, label: 'Datos generales' },
  { n: 2, label: 'Artefactos y cañerías' },
  { n: 3, label: 'Ventilación' },
  { n: 4, label: 'Resultados' },
]

const PODER_CALORIFICO: Record<TipoGas, string> = {
  natural: 'δ=0.65 | PC=9.300 kcal/m³',
  glp: 'δ=1.52 | PC=11.000 kcal/kg',
}

export default function App() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [resultados, setResultados] = useState<ResultadosCalculos | null>(null)
  const [showEdificioCalc, setShowEdificioCalc] = useState(false)

  const setTipoGas = (v: TipoGas) =>
    setFormData(f => ({ ...f, datosGenerales: { ...f.datosGenerales, tipoGas: v } }))

  const setTipoInstalacion = (v: TipoInstalacion) => {
    setFormData(f => ({
      ...f,
      datosGenerales: { ...f.datosGenerales, tipoInstalacion: v },
      datosEdificio:
        v === 'edificio'
          ? {
              ...f.datosEdificio,
              cantidadPisos:
                f.datosEdificio.cantidadPisos > 0
                  ? f.datosEdificio.cantidadPisos
                  : DEFAULT_DATOS_EDIFICIO.cantidadPisos,
              alturaPorPiso:
                f.datosEdificio.alturaPorPiso > 0
                  ? f.datosEdificio.alturaPorPiso
                  : DEFAULT_DATOS_EDIFICIO.alturaPorPiso,
              unidadesPorPiso:
                f.datosEdificio.unidadesPorPiso > 0
                  ? f.datosEdificio.unidadesPorPiso
                  : DEFAULT_DATOS_EDIFICIO.unidadesPorPiso,
              plantillaId: f.datosEdificio.plantillaId || DEFAULT_DATOS_EDIFICIO.plantillaId,
            }
          : f.datosEdificio,
    }))
    setResultados(null)
    setStep(1)
    setShowEdificioCalc(false)
  }

  const handleCalcAndNext = () => {
    const res = calcularTodo(formData)
    setResultados(res)
    setStep(4)
  }

  const handleReset = () => {
    setFormData(INITIAL_FORM)
    setResultados(null)
    setStep(1)
  }

  const { tipoGas, tipoInstalacion } = formData.datosGenerales
  const steps = UNIFAMILIAR_STEPS

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">🔥</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">Calculadora Gas NAG-200</h1>
              <p className="text-xs opacity-80">Cálculo hidráulico para gasistas matriculados</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-1.5 shrink-0">
            <Badge className="bg-white/15 border-white/35 text-white text-[11px] font-bold tracking-wide hover:bg-white/20">
              NAG-200
            </Badge>
            <Badge className="bg-white/15 border-white/35 text-white text-[11px] font-bold tracking-wide hover:bg-white/20">
              Ley 24.076
            </Badge>
          </div>
        </div>
      </header>

      {/* Installation type toggle */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 py-2.5 flex gap-2 flex-wrap">
          {(
            [
              { v: 'unifamiliar' as TipoInstalacion, label: '🏠 Vivienda unifamiliar' },
              { v: 'edificio' as TipoInstalacion, label: '🏢 Edificio / PH' },
            ] as const
          ).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setTipoInstalacion(v)}
              className={cn(
                'px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all',
                tipoInstalacion === v
                  ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2 overflow-x-auto step-tabs-inner px-4 py-2 sm:px-5">
          {steps.map(s => {
            const isDone = step > s.n
            const isActive = step === s.n
            return (
              <button
                key={s.n}
                onClick={() => isDone && setStep(s.n)}
                disabled={step < s.n}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-xs sm:px-5 sm:py-3.5 sm:text-[13px] font-medium border-b-2 whitespace-nowrap shrink-0 transition-all',
                  isActive
                    ? 'text-blue-600 font-bold border-blue-600'
                    : isDone
                    ? 'text-green-600 border-transparent cursor-pointer hover:text-green-700'
                    : 'text-gray-400 border-transparent cursor-default opacity-50'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isDone ? '✓' : s.n}
                </span>
                <span>{s.label}</span>
              </button>
            )
          })}
          {tipoInstalacion === 'edificio' && (
            <button
              onClick={() => setShowEdificioCalc(v => !v)}
              className={cn(
                'w-full sm:ml-auto sm:w-auto shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                showEdificioCalc
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100'
              )}
            >
              {showEdificioCalc ? 'Ocultar calculadora edificio' : 'Calculadora edificio / unidades'}
            </button>
          )}
        </div>
      </div>

      {/* Gas type bar */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-5 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold opacity-90">Tipo de Gas:</span>
          {(
            [
              { v: 'natural' as TipoGas, label: 'Gas Natural' },
              { v: 'glp' as TipoGas, label: 'GLP (Gas Licuado)' },
            ] as const
          ).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setTipoGas(v)}
              className={cn(
                'px-3.5 py-1 rounded text-xs font-medium border transition-all',
                tipoGas === v
                  ? 'bg-white text-blue-600 font-bold border-white'
                  : 'border-white/40 text-white/85 hover:bg-white/10'
              )}
            >
              {label}
            </button>
          ))}
          <span className="hidden sm:inline text-[11px] opacity-80 ml-1.5">
            {PODER_CALORIFICO[tipoGas]}
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto w-full px-5 py-6 flex-1">
        {!showEdificioCalc && step === 1 && (
          <Step1General
            datos={formData.datosGenerales}
            onChange={d => setFormData(f => ({ ...f, datosGenerales: d }))}
            onNext={() => setStep(2)}
          />
        )}
        {!showEdificioCalc && step === 2 && (
          <Step2Artefactos
            tipoGas={tipoGas}
            artefactos={formData.artefactosInstalados}
            tramos={formData.tramos}
            onArtefactosChange={a => setFormData(f => ({ ...f, artefactosInstalados: a }))}
            onTramosChange={t => setFormData(f => ({ ...f, tramos: t }))}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {!showEdificioCalc && step === 3 && (
          <Step3Ventilacion
            tipoGas={tipoGas}
            tipoInstalacion={tipoInstalacion}
            artefactos={formData.artefactosInstalados}
            ambientes={formData.ambientesVentilacion}
            ratio={formData.ratioVentilacion}
            onRatioChange={r => setFormData(f => ({ ...f, ratioVentilacion: r }))}
            onAmbientesChange={ambientes =>
              setFormData(f => ({ ...f, ambientesVentilacion: ambientes }))
            }
            onBack={() => setStep(2)}
            onNext={handleCalcAndNext}
          />
        )}
        {!showEdificioCalc && step === 4 && resultados && (
          <Step4Resultados
            formData={formData}
            resultados={resultados}
            onBack={() => setStep(3)}
            onReset={handleReset}
          />
        )}
        {showEdificioCalc && tipoInstalacion === 'edificio' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-amber-900">
              Calculadora edificio / unidades
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Este modulo genera el resultado preliminar del montante y la presion del edificio de
              forma independiente al flujo principal.
            </p>
          </div>
        )}
      </main>

      {tipoInstalacion === 'edificio' && showEdificioCalc && (
        <section className="max-w-4xl mx-auto w-full px-5 pb-8">
          <Step2Edificio
            tipoGas={tipoGas}
            datos={formData.datosEdificio}
            onChange={d => setFormData(f => ({ ...f, datosEdificio: d }))}
          />
        </section>
      )}

      <EditorialContent />

      <footer className="bg-gray-800 text-gray-400 text-center py-3 text-xs mt-auto">
        Calculadora de gas
      </footer>
    </div>
  )
}
