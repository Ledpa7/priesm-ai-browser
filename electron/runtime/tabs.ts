import { BrowserWindow } from 'electron'
import { extractMainFromHtml } from './extract'
import { compressionRatio, estimateTokens } from './tokens'

export interface ExtractUrlResult {
  ok: true
  url: string
  title: string
  mainText: string
  preview: string
  method: 'article-like' | 'body-text' | 'empty'
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

export interface ExtractUrlError {
  ok: false
  error: string
  code: 'BAD_URL' | 'TIMEOUT' | 'NAV_FAILED' | 'EXTRACT_EMPTY' | 'INTERNAL'
}

const DEFAULT_TIMEOUT_MS = 25000

function assertPublicHttpUrl(input: string): URL {
  let u: URL
  try {
    u = new URL(input.trim())
  } catch {
    throw Object.assign(new Error('Invalid URL'), { code: 'BAD_URL' as const })
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw Object.assign(new Error('Only http/https allowed'), { code: 'BAD_URL' as const })
  }
  const host = u.hostname.toLowerCase()
  const blocked =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '0.0.0.0' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith('.local') ||
    host === 'metadata.google.internal'
  if (blocked) {
    throw Object.assign(new Error('Private/local hosts are blocked'), { code: 'BAD_URL' as const })
  }
  return u
}

/** Rough token estimate for raw HTML (tags are cheap-ish but still count). */
function estimateHtmlTokens(htmlLength: number): number {
  return Math.ceil(Math.min(htmlLength, 400000) / 3.2)
}

/**
 * Load URL in a hidden window, extract main text, return economy stats.
 */
export async function extractUrl(
  urlInput: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<ExtractUrlResult | ExtractUrlError> {
  const started = Date.now()
  let win: BrowserWindow | null = null

  try {
    const url = assertPublicHttpUrl(urlInput).toString()

    win = new BrowserWindow({
      show: false,
      width: 1280,
      height: 900,
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        javascript: true,
        images: false,
      },
    })

    const wc = win.webContents
    wc.setAudioMuted(true)

    const nav = wc.loadURL(url, {
      userAgent: `${wc.getUserAgent()} PriesmExtract/0.1`,
    })
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(Object.assign(new Error('Navigation timeout'), { code: 'TIMEOUT' })),
        timeoutMs,
      )
    })

    try {
      await Promise.race([nav, timeout])
    } catch (e: any) {
      if (e?.code === 'TIMEOUT') throw e
      throw Object.assign(new Error(e?.message || 'Navigation failed'), { code: 'NAV_FAILED' })
    }

    // brief settle for light client rendering
    await new Promise((r) => setTimeout(r, 800))

    const payload = (await wc.executeJavaScript(
      `({
        title: document.title || '',
        html: document.documentElement ? document.documentElement.outerHTML : ''
      })`,
      true,
    )) as { title: string; html: string }

    const extracted = extractMainFromHtml(url, payload.html || '', payload.title)
    if (!extracted.mainText || extracted.mainTextLength < 40) {
      return {
        ok: false,
        error: 'Could not extract enough main text from this page',
        code: 'EXTRACT_EMPTY',
      }
    }

    const rawTokensEst = estimateHtmlTokens(extracted.rawHTMLLength)
    const mainTokensEst = estimateTokens(extracted.mainText)
    const ratio = compressionRatio(extracted.rawHTMLLength, extracted.mainTextLength)
    const savedTokensEst = Math.max(0, rawTokensEst - mainTokensEst)
    const savedRatioEst =
      rawTokensEst > 0 ? Number((savedTokensEst / rawTokensEst).toFixed(4)) : 0

    const preview =
      extracted.mainText.length > 1200
        ? `${extracted.mainText.slice(0, 1200)}\n…`
        : extracted.mainText

    return {
      ok: true,
      url: extracted.url,
      title: extracted.title,
      mainText: extracted.mainText,
      preview,
      method: extracted.method,
      stats: {
        rawHTMLLength: extracted.rawHTMLLength,
        mainTextLength: extracted.mainTextLength,
        rawTokensEst,
        mainTokensEst,
        compressionRatio: ratio,
        savedTokensEst,
        savedRatioEst,
      },
      tookMs: Date.now() - started,
    }
  } catch (e: any) {
    const code = (e?.code ||
      (String(e?.message || '').toLowerCase().includes('timeout')
        ? 'TIMEOUT'
        : 'INTERNAL')) as ExtractUrlError['code']
    return {
      ok: false,
      error: e?.message || 'Extract failed',
      code,
    }
  } finally {
    try {
      win?.destroy()
    } catch {
      // ignore
    }
  }
}