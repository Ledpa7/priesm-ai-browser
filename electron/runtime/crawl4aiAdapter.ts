export interface ExtractOptions {
  mode?: 'full' | 'code-only' | 'summary';
  targetSelector?: string;
  maxTokenBudget?: number;
  preserveCodeBlocks?: boolean;
  query?: string;
}

export interface Crawl4AIResult {
  success: boolean;
  url: string;
  title?: string;
  markdown: string;
  fitMarkdown: string;
  rawHtmlLength: number;
  extractedLength: number;
  tokensEst: number;
  error?: string;
  source: 'crawl4ai' | 'fallback';
  appliedMode?: string;
  sourcesCount?: number;
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.5);
}

/**
 * 다중 웹 URL을 동시 파싱하고 중복 텍스트를 제거하여 1개의 통합 마크다운으로 병합합니다.
 */
export async function extractMultipleWithCrawl4AI(
  urls: string[],
  options: ExtractOptions = {},
  apiUrl: string = 'http://localhost:11235'
): Promise<Crawl4AIResult> {
  const uniqueUrls = Array.from(new Set(urls.filter((u) => u && u.trim().length > 0)));
  if (uniqueUrls.length === 0) {
    return {
      success: false,
      url: '',
      markdown: '',
      fitMarkdown: '',
      rawHtmlLength: 0,
      extractedLength: 0,
      tokensEst: 0,
      error: 'No valid URLs provided',
      source: 'fallback',
    };
  }

  if (uniqueUrls.length === 1) {
    return extractWithCrawl4AI(uniqueUrls[0], options, apiUrl);
  }

  // Fetch all URLs in parallel
  const results = await Promise.all(
    uniqueUrls.map((url) => extractWithCrawl4AI(url, options, apiUrl))
  );

  const validResults = results.filter((r) => r.success);
  if (validResults.length === 0) {
    return {
      success: false,
      url: uniqueUrls.join(', '),
      markdown: '',
      fitMarkdown: '',
      rawHtmlLength: 0,
      extractedLength: 0,
      tokensEst: 0,
      error: 'All URL extractions failed',
      source: 'fallback',
    };
  }

  // Merge and deduplicate content across multiple URLs
  const mergedMarkdown = mergeAndDeduplicate(validResults);
  const processedMarkdown = processCustomExtractionMode(mergedMarkdown, options);
  const totalRawLength = validResults.reduce((acc, curr) => acc + curr.rawHtmlLength, 0);
  const tokensEst = estimateTokens(processedMarkdown);

  const mainTitle = `Super Bundle (${validResults.length} sources): ${validResults[0].title}`;

  return {
    success: true,
    url: validResults.map((r) => r.url).join(', '),
    title: mainTitle,
    markdown: mergedMarkdown,
    fitMarkdown: processedMarkdown,
    rawHtmlLength: totalRawLength,
    extractedLength: processedMarkdown.length,
    tokensEst,
    source: validResults[0].source,
    appliedMode: options.mode || 'multi-digest',
    sourcesCount: validResults.length,
  };
}

/**
 * Crawl4AI API 또는 Fallback 파서를 통해 단일 웹 URL을 옵션에 맞춰 추출합니다.
 */
export async function extractWithCrawl4AI(
  targetUrl: string,
  options: ExtractOptions = {},
  apiUrl: string = 'http://localhost:11235'
): Promise<Crawl4AIResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const bodyPayload: Record<string, any> = {
      urls: targetUrl,
      priority: 10,
      word_count_threshold: 10,
      extraction_strategy: 'NoExtraction',
      chunking_strategy: 'RegexChunking',
    };

    if (options.targetSelector) {
      bodyPayload.css_selector = options.targetSelector;
    }

    const response = await fetch(`${apiUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const resultData = Array.isArray(data) ? data[0] : data.results ? data.results[0] : data;
      let markdown = resultData?.markdown || resultData?.cleaned_html || '';
      let fitMarkdown = resultData?.fit_markdown || markdown;
      const title = resultData?.metadata?.title || extractTitleFromMarkdown(markdown) || targetUrl;

      // Apply Query RAG filtering & custom extraction mode
      fitMarkdown = processCustomExtractionMode(fitMarkdown, options);

      const tokensEst = estimateTokens(fitMarkdown);

      return {
        success: true,
        url: targetUrl,
        title,
        markdown,
        fitMarkdown,
        rawHtmlLength: (resultData?.raw_html || '').length || fitMarkdown.length * 4,
        extractedLength: fitMarkdown.length,
        tokensEst,
        source: 'crawl4ai',
        appliedMode: options.mode || (options.query ? 'query-rag' : 'full'),
      };
    }
  } catch (err) {
    console.warn('[Crawl4AI Adapter] Local Crawl4AI service unavailable, using lightweight fallback parser.', err);
  }

  // Fallback Lightweight Extractor
  return await extractFallback(targetUrl, options);
}

async function extractFallback(targetUrl: string, options: ExtractOptions): Promise<Crawl4AIResult> {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PriesmAIBrowser/0.1',
      },
    });
    const html = await res.text();
    let cleanMarkdown = stripHtmlToCleanMarkdown(html, options.targetSelector);
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : targetUrl;

    cleanMarkdown = processCustomExtractionMode(cleanMarkdown, options);
    const tokensEst = estimateTokens(cleanMarkdown);

    return {
      success: true,
      url: targetUrl,
      title,
      markdown: cleanMarkdown,
      fitMarkdown: cleanMarkdown,
      rawHtmlLength: html.length,
      extractedLength: cleanMarkdown.length,
      tokensEst,
      source: 'fallback',
      appliedMode: options.mode || (options.query ? 'query-rag' : 'full'),
    };
  } catch (err: any) {
    return {
      success: false,
      url: targetUrl,
      markdown: '',
      fitMarkdown: '',
      rawHtmlLength: 0,
      extractedLength: 0,
      tokensEst: 0,
      error: err?.message || 'Failed to fetch page',
      source: 'fallback',
      appliedMode: options.mode || 'full',
    };
  }
}

function processCustomExtractionMode(text: string, options: ExtractOptions): string {
  if (!text) return '';
  let processed = text;

  // 1. Code-Only Mode: Extract only code blocks
  if (options.mode === 'code-only') {
    const codeBlocks: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(processed)) !== null) {
      codeBlocks.push(match[0]);
    }
    processed = codeBlocks.length > 0 ? codeBlocks.join('\n\n') : '<!-- No code blocks found in source -->';
  }

  // 2. Query-Driven RAG Filtering: Extract relevant paragraphs matching the query
  if (options.query && options.query.trim().length > 0) {
    processed = filterByQueryRelevance(processed, options.query.trim());
  }

  // 3. Max Token Budget Truncation (Preserve Code Block integrity)
  if (options.maxTokenBudget && options.maxTokenBudget > 0) {
    const maxChars = options.maxTokenBudget * 3.5;
    if (processed.length > maxChars) {
      let cutIndex = Math.floor(maxChars);
      const codeBlockCountBeforeCut = (processed.slice(0, cutIndex).match(/```/g) || []).length;
      if (codeBlockCountBeforeCut % 2 !== 0) {
        const closingTagIndex = processed.indexOf('```', cutIndex);
        if (closingTagIndex !== -1 && closingTagIndex < maxChars + 1500) {
          cutIndex = closingTagIndex + 3;
        }
      }
      processed = processed.slice(0, cutIndex) + '\n\n...[Truncated due to token budget constraint]';
    }
  }

  return processed;
}

function filterByQueryRelevance(markdownText: string, query: string): string {
  const paragraphs = markdownText.split(/\n\n+/);
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  if (queryWords.length === 0 || paragraphs.length <= 3) {
    return markdownText;
  }

  const scoredParagraphs = paragraphs.map((p) => {
    // Code blocks get high default score to avoid accidental loss
    if (p.includes('```')) {
      return { paragraph: p, score: 5 };
    }

    const lowerP = p.toLowerCase();
    let score = 0;
    queryWords.forEach((word) => {
      if (lowerP.includes(word)) {
        score += 2;
      }
    });

    // Bonus for headings
    if (p.startsWith('#')) score += 1;

    return { paragraph: p, score };
  });

  // Keep paragraphs with score > 0 or top 50%
  const relevant = scoredParagraphs.filter((item) => item.score > 0);
  if (relevant.length > 0) {
    return relevant.map((item) => item.paragraph).join('\n\n');
  }

  return markdownText;
}

function mergeAndDeduplicate(results: Crawl4AIResult[]): string {
  const seenParagraphs = new Set<string>();
  const mergedBlocks: string[] = [];

  results.forEach((res, index) => {
    mergedBlocks.push(`## Source [${index + 1}]: ${res.title} (${res.url})`);
    const paragraphs = (res.fitMarkdown || res.markdown).split(/\n\n+/);

    for (const p of paragraphs) {
      const normalized = p.trim().toLowerCase().replace(/\s+/g, ' ');
      // Deduplicate paragraphs longer than 30 chars
      if (normalized.length > 30) {
        if (seenParagraphs.has(normalized)) {
          continue; // Skip duplicate paragraph
        }
        seenParagraphs.add(normalized);
      }
      mergedBlocks.push(p);
    }
  });

  return mergedBlocks.join('\n\n');
}

function extractTitleFromMarkdown(md: string): string | null {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function stripHtmlToCleanMarkdown(html: string, targetSelector?: string): string {
  let targetHtml = html;

  if (targetSelector) {
    const idMatch = targetSelector.match(/^#([\w-]+)/);
    const classMatch = targetSelector.match(/^\.([\w-]+)/);
    const tagMatch = targetSelector.match(/^([a-z0-9]+)/i);

    let extracted: string | null = null;
    if (idMatch) {
      const regex = new RegExp(`<[^>]+id=["']${idMatch[1]}["'][^>]*>([\\s\\S]*?)<\\/`, 'i');
      const m = html.match(regex);
      if (m) extracted = m[1];
    } else if (classMatch) {
      const regex = new RegExp(`<[^>]+class=["'][^"']*${classMatch[1]}[^"']*["'][^>]*>([\\s\\S]*?)<\\/`, 'i');
      const m = html.match(regex);
      if (m) extracted = m[1];
    } else if (tagMatch) {
      const regex = new RegExp(`<${tagMatch[1]}[^>]*>([\\s\\S]*?)<\\/${tagMatch[1]}>`, 'gi');
      const matches = html.match(regex);
      if (matches) extracted = matches.join('\n');
    }

    if (extracted) {
      targetHtml = extracted;
    }
  }

  let text = targetHtml
    .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg\b[^<]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<header\b[^<]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer\b[^<]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav\b[^<]*>[\s\S]*?<\/nav>/gi, '');

  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n* $1');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n');
}
