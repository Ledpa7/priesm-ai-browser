import { Crawl4AIResult } from './crawl4aiAdapter';

export interface SharedContextBundle {
  bundleId: string;
  url: string;
  title: string;
  extractedMarkdown: string;
  rawHtmlLength: number;
  extractedLength: number;
  tokensEst: number;
  savedTokensEst: number;
  savedRatioPercentage: number;
  createdAt: string;
  source: 'crawl4ai' | 'fallback';
}

export function createCitationBundle(crawlResult: Crawl4AIResult): SharedContextBundle {
  const bundleId = `bundle-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  
  // Estimate tokens for raw HTML vs extracted markdown
  const rawTokensEst = Math.ceil(crawlResult.rawHtmlLength / 3.5);
  const savedTokensEst = Math.max(0, rawTokensEst - crawlResult.tokensEst);
  const savedRatioPercentage = rawTokensEst > 0 
    ? Math.min(99, Math.round((savedTokensEst / rawTokensEst) * 100))
    : 0;

  return {
    bundleId,
    url: crawlResult.url,
    title: crawlResult.title || crawlResult.url,
    extractedMarkdown: crawlResult.fitMarkdown || crawlResult.markdown,
    rawHtmlLength: crawlResult.rawHtmlLength,
    extractedLength: crawlResult.extractedLength,
    tokensEst: crawlResult.tokensEst,
    savedTokensEst,
    savedRatioPercentage,
    createdAt: new Date().toISOString(),
    source: crawlResult.source,
  };
}
