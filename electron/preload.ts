import { contextBridge, ipcRenderer } from 'electron'

export type ExtractUrlResponse =
  | {
      ok: true
      url: string
      title: string
      mainText: string
      preview: string
      method: string
      stats: {
        rawHTMLLength: number
        mainTextLength: number
        rawTokensEst: number
        mainTokensEst: number
        compressionRatio: number
        savedTokensEst: number
        savedRatioEst: number
      }
      tookMs: number
    }
  | { ok: false; error: string; code: string }

export type BuildBundleResponse =
  | {
      ok: true
      bundle: any
      rendered: { text: string; tokenEstimate: number; profile: string }
    }
  | { ok: false; error: string; code: string }

export type AgentApiInfo = {
  port: number
  token: string
  baseUrl: string
} | null

export type PriesmDesktopAPI = {
  getAppInfo: () => Promise<{
    name: string
    version: string
    phase: string
    platform: string
    agentApi?: AgentApiInfo
  }>
  pingWorkspace: () => Promise<{ ok: boolean; ts: number }>
  extractUrl: (url: string) => Promise<ExtractUrlResponse>
  buildBundle: (payload: {
    query: string
    profile?: string
    modelCountTarget?: number
    pages?: Array<{
      url: string
      title: string
      mainText: string
      rawHTMLLength: number
      method?: string
      fromCache?: boolean
    }>
    urls?: string[]
  }) => Promise<BuildBundleResponse>
  renderBundle: (payload: {
    bundle: unknown
    profile?: string
    maxTokens?: number
  }) => Promise<
    | { ok: true; rendered: { text: string; tokenEstimate: number; profile: string } }
    | { ok: false; error: string; code: string }
  >
  getAgentApiInfo: () => Promise<AgentApiInfo>
  extractWithCrawl4AI: (url: string) => Promise<any>
  onBundleCreated: (callback: (bundle: any) => void) => () => void
}

const api: PriesmDesktopAPI = {
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  pingWorkspace: () => ipcRenderer.invoke('workspace:ping'),
  extractUrl: (url: string) => ipcRenderer.invoke('runtime:extractUrl', url),
  extractWithCrawl4AI: (url: string) => ipcRenderer.invoke('runtime:extractWithCrawl4AI', url),
  buildBundle: (payload) => ipcRenderer.invoke('runtime:buildBundle', payload),
  renderBundle: (payload) => ipcRenderer.invoke('runtime:renderBundle', payload),
  getAgentApiInfo: () => ipcRenderer.invoke('agent:getApiInfo'),
  onBundleCreated: (callback: (bundle: any) => void) => {
    const handler = (_evt: any, bundle: any) => callback(bundle);
    ipcRenderer.on('priesm:on-bundle-created', handler);
    return () => {
      ipcRenderer.removeListener('priesm:on-bundle-created', handler);
    };
  },
}

contextBridge.exposeInMainWorld('priesm', api)