/**
 * Main-text extraction heuristics (Step 1).
 * No external readability dependency yet — keep install surface small.
 * Step 2+ can swap in mozilla/readability if needed.
 */

export interface ExtractResult {
  url: string
  title: string
  mainText: string
  rawHTMLLength: number
  mainTextLength: number
  method: 'article-like' | 'body-text' | 'empty'
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
}

function htmlToText(html: string): string {
  const noTags = stripTags(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return noTags
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** Prefer <article>, then role=main, then largest texty block. */
export function extractMainFromHtml(url: string, html: string, titleFromDom?: string): ExtractResult {
  const rawHTMLLength = html.length
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = (titleFromDom || titleMatch?.[1] || '').replace(/\s+/g, ' ').trim() || url

  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i)
  if (articleMatch) {
    const mainText = htmlToText(articleMatch[0])
    if (mainText.length > 200) {
      return {
        url,
        title,
        mainText,
        rawHTMLLength,
        mainTextLength: mainText.length,
        method: 'article-like',
      }
    }
  }

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i) ||
    html.match(/role=["']main["'][\s\S]*?<\/[^>]+>/i)
  if (mainMatch) {
    const mainText = htmlToText(mainMatch[0])
    if (mainText.length > 200) {
      return {
        url,
        title,
        mainText,
        rawHTMLLength,
        mainTextLength: mainText.length,
        method: 'article-like',
      }
    }
  }

  // Fallback: body text, drop very short nav-like lines
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i)
  const bodyHtml = bodyMatch?.[0] || html
  let text = htmlToText(bodyHtml)
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const filtered = lines.filter((line) => {
    if (line.length < 25 && !/[.!?。！？]$/.test(line)) return false
    if (/^(menu|sign in|log in|cookie|subscribe|share|home)$/i.test(line)) return false
    return true
  })
  text = filtered.join('\n\n').trim()

  return {
    url,
    title,
    mainText: text,
    rawHTMLLength,
    mainTextLength: text.length,
    method: text.length > 0 ? 'body-text' : 'empty',
  }
}