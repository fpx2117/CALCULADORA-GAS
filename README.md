# Calculadora Gas NAG-200

Calculadora web para estimar instalaciones de gas bajo criterios operativos inspirados en NAG-200. Esta herramienta ayuda a gasistas matriculados y equipos tecnicos a cargar datos de una instalacion, calcular tramos, verificar ventilacion y generar un PDF de respaldo listo para compartir. 🔥

## Que resuelve

- Calcula consumos con simultaneidad para instalaciones de gas natural o GLP.
- Dimensiona tramos de caneria con longitud equivalente y diametro comercial sugerido.
- Permite trabajar con viviendas unifamiliares y escenarios de edificio / PH. 🏢
- Estima requisitos de ventilacion por criterio normativo y por ambiente.
- Genera un informe PDF con resultados tecnicos y resumen de la instalacion. 📄
- Exporta una version offline autocontenida para usar sin servidor. ⚡

## Flujo de trabajo

1. Cargar datos generales de la instalacion.
2. Definir artefactos y tramos de caneria.
3. Configurar ventilacion segun el tipo de instalacion.
4. Revisar resultados, materiales y exportar el PDF.

## Funcionalidades principales

### Artefactos y canerias

- Carga de artefactos estandar y personalizados.
- Calculo de caudal por tramo.
- Metodo de longitud equivalente con `Factor 1.2` o `Accesorios detallados`.
- Advertencias tecnicas por velocidad, caida de presion y capacidad del tramo.

### Ventilacion

- Selector de criterio `4 cm2/kW` o `6 cm2/kW`.
- Carga de ambientes con dimensiones y volumen calculado en vivo.
- Estimacion de rejillas y conducto sugerido por ambiente.
- Resumen consolidado para edificios cuando corresponde. 🌬️

### Salidas

- Resultados en pantalla paso a paso.
- PDF con datos generales, tramos, ventilacion y observaciones.
- Build web y build offline listos para distribuir.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- jsPDF + AutoTable

## Desarrollo local

### Requisitos

- Node.js 20+
- npm

### Instalar dependencias

```bash
npm install
```

### Levantar en desarrollo

```bash
npm run dev
```

### Generar build web

```bash
npm run build
```

### Generar build offline

```bash
npm run build:offline
```

## Publicacion en GitHub Pages

- Repositorio: `https://github.com/fpx2117/CALCULADORA-GAS`
- URL esperada del sitio: `https://fpx2117.github.io/CALCULADORA-GAS/`
- El deploy queda automatizado con GitHub Actions en cada push a `main`. 🚀

## Archivos importantes

- `src/App.tsx` - orquesta el flujo principal de la calculadora.
- `src/utils/calculations.ts` - concentra la logica de calculo.
- `src/utils/pdfGenerator.ts` - arma el PDF final.
- `src/components/Step2Artefactos.tsx` - carga de tramos y artefactos.
- `src/components/Step3Ventilacion.tsx` - configuracion de ventilacion.
- `src/components/Step4Resultados.tsx` - resumen tecnico final.

## Notas

- La herramienta agiliza el trabajo tecnico, pero no reemplaza la validacion profesional final. 🛠️
- La version offline se genera en `dist/calculadora-gas-offline.html`.
- El build web queda en `dist/index.html`.

## Objetivo del proyecto

Reducir errores de carga, acelerar calculos repetitivos y entregar una base clara para documentar instalaciones de gas de forma mas prolija, portable y entendible.
