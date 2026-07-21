import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'node:path'
import { startAgentBridgeServer } from './runtime/agentServer'
import { extractWithCrawl4AI } from './runtime/crawl4aiAdapter'
import { createCitationBundle } from './runtime/citationBundle'
import { buildCitationBundle, renderBundle } from './runtime/bundle'
import type { BuildBundleInput, RenderProfileId } from './runtime/bundleTypes'
import { extractUrl } from './runtime/tabs'

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-compositing')
app.commandLine.appendSwitch('in-process-gpu')

const APP_ROOT = path.join(__dirname, '..')
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(APP_ROOT, 'dist')

let mainWindow: BrowserWindow | null = null
let agentBridgePort = 37100

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Priesm AI Browser',
    backgroundColor: '#0f1115',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(async () => {
  // Start Agent Bridge HTTP API (Port 37100) — Primary surface for AI Agents
  try {
    startAgentBridgeServer({
      port: agentBridgePort,
      onBundleCreated: (bundle) => {
        if (mainWindow) {
          mainWindow.webContents.send('priesm:on-bundle-created', bundle);
        }
      },
    });
    console.log(`[Priesm Agent Bridge] Active on http://localhost:${agentBridgePort}`);
  } catch (e) {
    console.error('[Priesm Agent Bridge] Failed to start on 37100', e);
  }

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  mainWindow = null
})

ipcMain.handle('app:getInfo', () => ({
  name: 'Priesm AI Browser',
  version: app.getVersion(),
  phase: 'a3-agent-http',
  platform: process.platform,
  agentBridgePort,
}))

ipcMain.handle('workspace:ping', async () => ({ ok: true, ts: Date.now() }))

ipcMain.handle('runtime:extractWithCrawl4AI', async (_evt, payload: string | { url: string; options?: any }) => {
  const targetUrl = typeof payload === 'string' ? payload : payload?.url || '';
  const options = typeof payload === 'object' && payload?.options ? payload.options : {};
  const crawlRes = await extractWithCrawl4AI(targetUrl, options);
  return createCitationBundle(crawlRes);
});


ipcMain.handle('runtime:extractUrl', async (_evt, url: string) => {
  return extractUrl(typeof url === 'string' ? url : '')
})

ipcMain.handle(
  'runtime:buildBundle',
  async (
    _evt,
    payload: {
      query: string
      profile?: RenderProfileId
      modelCountTarget?: number
      pages?: BuildBundleInput['pages']
      urls?: string[]
    },
  ) => {
    try {
      const pages: BuildBundleInput['pages'] = [...(payload?.pages || [])]
      for (const u of payload?.urls || []) {
        const r = await extractUrl(u)
        if (r.ok) {
          pages.push({
            url: r.url,
            title: r.title,
            mainText: r.mainText,
            rawHTMLLength: r.stats.rawHTMLLength,
            method: r.method,
          })
        }
      }
      if (pages.length === 0) {
        return { ok: false as const, error: 'No pages to bundle', code: 'NOT_FOUND' }
      }
      const bundle = buildCitationBundle({
        query: payload?.query || '',
        profile: payload?.profile || 'standard',
        modelCountTarget: payload?.modelCountTarget ?? 1,
        pages,
      })
      const rendered = renderBundle(bundle, payload?.profile || bundle.render.defaultProfile)
      return { ok: true as const, bundle, rendered }
    } catch (e: any) {
      return {
        ok: false as const,
        error: e?.message || 'buildBundle failed',
        code: 'INTERNAL',
      }
    }
  },
)

ipcMain.handle(
  'runtime:renderBundle',
  async (
    _evt,
    payload: { bundle: any; profile?: RenderProfileId; maxTokens?: number },
  ) => {
    try {
      if (!payload?.bundle) {
        return { ok: false as const, error: 'bundle required', code: 'NOT_FOUND' }
      }
      const rendered = renderBundle(payload.bundle, payload.profile, payload.maxTokens)
      return { ok: true as const, rendered }
    } catch (e: any) {
      return { ok: false as const, error: e?.message || 'render failed', code: 'INTERNAL' }
    }
  },
)

ipcMain.handle('agent:getApiInfo', () => ({ port: agentBridgePort, baseUrl: `http://localhost:${agentBridgePort}` }))