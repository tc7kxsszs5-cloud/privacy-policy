import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { createRequire } from 'node:module'
import Module from 'node:module'
import vm from 'node:vm'

const root = process.cwd()
const playwrightDir = '/Users/mac/.bun/install/cache/playwright@1.58.0@@@1'
const playwrightCoreDir = '/Users/mac/.bun/install/cache/playwright-core@1.58.0@@@1'
const originalResolve = Module._resolveFilename

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'playwright-core') return join(playwrightCoreDir, 'index.js')
  if (request.startsWith('playwright-core/')) {
    return join(playwrightCoreDir, request.slice('playwright-core/'.length))
  }
  return originalResolve.call(this, request, parent, isMain, options)
}

const require = createRequire(import.meta.url)
const { chromium } = require(join(playwrightDir, 'index.js'))

function buildViewerHtml() {
  const viewerSource = readFileSync(join(root, 'components/CarViewer/viewer.html.ts'), 'utf8')
  const context = {}
  vm.runInNewContext(
    viewerSource.replace('export const VIEWER_HTML =', 'globalThis.VIEWER_HTML ='),
    context
  )

  const auditShim = `<script>
    window.__auditMessages = [];
    window.ReactNativeWebView = {
      postMessage: function (message) {
        try { window.__auditMessages.push(JSON.parse(message)); }
        catch (_) { window.__auditMessages.push({ type: 'raw', message: String(message) }); }
      }
    };
  </script>`

  return context.VIEWER_HTML.replace('<head>', '<head>' + auditShim)
}

const html = buildViewerHtml()
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.glb': 'model/gltf-binary',
}

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    if (url.pathname === '/') {
      res.writeHead(200, { 'content-type': mime['.html'] })
      res.end(html)
      return
    }

    const normalized = normalize(decodeURIComponent(url.pathname)).replace(/^\/+/, '')
    if (!normalized.startsWith('assets/models/cars/')) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('Not found')
      return
    }

    const filePath = join(root, normalized)
    try {
      const size = statSync(filePath).size
      res.writeHead(200, {
        'content-type': mime[extname(filePath)] || 'application/octet-stream',
        'content-length': size,
        'access-control-allow-origin': '*',
      })
      res.end(readFileSync(filePath))
    } catch (error) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end(String(error))
    }
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({ server, url: `http://127.0.0.1:${address.port}` })
    })
  })
}

const model = process.argv[2] || 'assets/models/cars/audi_rs5.glb'
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const consoleMessages = []
const requestFailures = []
let browser
let server

try {
  const started = await startServer()
  server = started.server

  browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(chromePath) ? chromePath : undefined,
  })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`))
  page.on('requestfailed', request => {
    requestFailures.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`)
  })
  page.on('pageerror', error => consoleMessages.push(`pageerror: ${error.message}`))

  await page.goto(started.url, { waitUntil: 'load', timeout: 30_000 })
  const bridgeReady = await page.waitForFunction(
    () => typeof window.__CARWRAP_RECEIVE__ === 'function',
    null,
    { timeout: 10_000 }
  ).then(() => true, () => false)

  if (!bridgeReady) {
    const earlyState = await page.evaluate(() => ({
      title: document.title,
      bodyText: document.body?.innerText || '',
      hasThreeBundle: typeof window.ThreeBundle !== 'undefined',
      hasReceive: typeof window.__CARWRAP_RECEIVE__ === 'function',
      auditMessages: window.__auditMessages || [],
    }))

    mkdirSync(join(root, 'output/playwright'), { recursive: true })
    await page.screenshot({ path: join(root, 'output/playwright/carviewer-audit-early-fail.png'), fullPage: true })
    console.log(JSON.stringify({
      ok: false,
      model,
      terminal: { type: 'viewer_boot_timeout' },
      earlyState,
      consoleMessages,
      requestFailures,
      screenshot: 'output/playwright/carviewer-audit-early-fail.png',
    }, null, 2))
    process.exitCode = 1
    throw new Error('viewer_boot_timeout')
  }

  const result = await page.evaluate(async (modelPath) => {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    }

    const response = await fetch('/' + modelPath)
    if (!response.ok) throw new Error('model fetch failed ' + response.status)
    const dataUrl = await blobToDataUrl(await response.blob())
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const chunkSize = 128000
    const total = Math.ceil(base64.length / chunkSize)

    window.__CARWRAP_RECEIVE__(JSON.stringify({ type: 'load_model_chunk_start', totalChunks: total }))
    for (let i = 0; i < total; i++) {
      window.__CARWRAP_RECEIVE__(JSON.stringify({
        type: 'load_model_chunk',
        index: i,
        data: base64.slice(i * chunkSize, (i + 1) * chunkSize),
      }))
      if ((i + 1) % 4 === 0) await sleep(0)
    }
    window.__CARWRAP_RECEIVE__(JSON.stringify({ type: 'load_model_chunk_end' }))

    const deadline = Date.now() + 45_000
    while (Date.now() < deadline) {
      const terminal = window.__auditMessages.find(
        msg => msg.type === 'model_loaded' || msg.type === 'model_error'
      )
      if (terminal) {
        return { terminal, messages: window.__auditMessages }
      }
      await sleep(250)
    }
    return { terminal: { type: 'timeout' }, messages: window.__auditMessages }
  }, model)

  mkdirSync(join(root, 'output/playwright'), { recursive: true })
  await page.screenshot({ path: join(root, 'output/playwright/carviewer-audit.png'), fullPage: true })

  console.log(JSON.stringify({
    ok: result.terminal.type === 'model_loaded',
    model,
    terminal: result.terminal,
    messages: result.messages,
    consoleMessages,
    requestFailures,
    screenshot: 'output/playwright/carviewer-audit.png',
  }, null, 2))
} finally {
  if (browser) await browser.close()
  if (server) await new Promise(resolve => server.close(resolve))
}
