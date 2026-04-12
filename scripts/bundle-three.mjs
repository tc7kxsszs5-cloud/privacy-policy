import { build } from 'esbuild'
import { writeFileSync, readFileSync } from 'fs'

await build({
  entryPoints: ['scripts/three-bundle-entry.mjs'],
  bundle: true,
  format: 'iife',
  globalName: 'ThreeBundle',
  outfile: 'scripts/three-bundle.js',
  minify: true,
  platform: 'browser',
  target: ['safari13'],
})

const bundle = readFileSync('scripts/three-bundle.js', 'utf8')
const encoded = Buffer.from(bundle).toString('base64')
console.log('Bundle size:', bundle.length, 'bytes')
writeFileSync('scripts/three-bundle.b64', encoded)
console.log('Done')
