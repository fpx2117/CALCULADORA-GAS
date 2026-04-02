import fs from 'node:fs'
import path from 'node:path'
import { transform } from 'esbuild'
import { build as viteBuild } from 'vite'

const rootDir = process.cwd()
const tempDir = path.join(rootDir, '.offline-build')
const tempHtmlPath = path.join(tempDir, 'index.html')
const outputHtmlPath = path.join(rootDir, 'dist', 'calculadora-gas-offline.html')

await viteBuild({
  configFile: path.join(rootDir, 'vite.config.ts'),
  build: {
    outDir: tempDir,
    emptyOutDir: true,
  },
})

const html = fs.readFileSync(tempHtmlPath, 'utf8')
const scriptMatch = html.match(/<script type="module" crossorigin>([\s\S]*?)<\/script>/)
const styleMatch = html.match(/<style rel="stylesheet" crossorigin>([\s\S]*?)<\/style>/)

if (!scriptMatch) {
  throw new Error('No se pudo extraer el script inline del build temporal.')
}

const jsCode = scriptMatch[1]
const cssCode = styleMatch?.[1] ?? ''
const normalizedCss = cssCode.replace(/<\/style>/g, '')

const transformed = await transform(jsCode, {
  loader: 'js',
  format: 'iife',
  target: ['es2018', 'ios13', 'safari13', 'chrome80'],
  minify: true,
})

const offlineHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <title>Calculadora Gas NAG-200</title>
    <style>${normalizedCss}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${transformed.code}</script>
  </body>
</html>
`

fs.mkdirSync(path.dirname(outputHtmlPath), { recursive: true })
fs.writeFileSync(outputHtmlPath, offlineHtml, 'utf8')

if (fs.existsSync(tempHtmlPath)) fs.rmSync(tempHtmlPath, { force: true })
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true })

console.log(`Offline build generado en: ${outputHtmlPath}`)
