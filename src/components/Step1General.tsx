import type { DatosGenerales } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Info, ChevronRight } from 'lucide-react'
import { useAppToast } from '../hooks/use-app-toast'

interface Props {
  datos: DatosGenerales
  onChange: (datos: DatosGenerales) => void
  onNext: () => void
}

export default function Step1General({ datos, onChange, onNext }: Props) {
  const { toast } = useAppToast()
  const set = (field: keyof DatosGenerales, value: string) =>
    onChange({ ...datos, [field]: value })
  const nextLabel = 'Siguiente: Artefactos y cañerías'

  const handleNext = () => {
    if (!datos.nombreInstalador.trim() || !datos.matricula.trim() || !datos.direccion.trim()) {
      toast({
        title: 'Datos generales incompletos',
        description: 'Complete nombre, matricula y direccion antes de continuar.',
        variant: 'warning',
      })
      return
    }
    onNext()
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800">Datos generales de la instalación</CardTitle>
          <p className="text-sm text-muted-foreground">
            Estos datos aparecen en el <strong>informe PDF</strong>. Recomendados para la presentación
            ante la prestadora.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="instalador">Nombre del instalador matriculado</Label>
              <Input
                id="instalador"
                type="text"
                value={datos.nombreInstalador}
                onChange={e => set('nombreInstalador', e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="matricula">N° de matrícula</Label>
              <Input
                id="matricula"
                type="text"
                value={datos.matricula}
                onChange={e => set('matricula', e.target.value)}
                placeholder="Ej: 12345-GAS"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección de la instalación</Label>
            <Input
              id="direccion"
              type="text"
              value={datos.direccion}
              onChange={e => set('direccion', e.target.value)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong className="block mb-2 text-blue-800">Cómo usar esta calculadora:</strong>
          <ol className="list-decimal pl-4 space-y-1 text-sm text-blue-700">
            <li>
              <span className="font-medium">Datos generales</span> — Instalador, matrícula y dirección
              (para el PDF).
            </li>
            <li>
              <span className="font-medium">Artefactos y cañerías</span> — Seleccioná artefactos y
              definí los tramos de cañería.
            </li>
            <li>
              <span className="font-medium">Ventilación</span> — Calculá rejillas y conductos por
              ambiente (NAG-200 Cap. 6).
            </li>
            <li>
              <span className="font-medium">Resultados</span> — Revisá diámetros, presión y descargá
              el PDF.
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="flex justify-end pt-1">
        <Button onClick={handleNext} className="gap-2">
          {nextLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
