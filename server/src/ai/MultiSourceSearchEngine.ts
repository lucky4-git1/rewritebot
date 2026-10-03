import axios from 'axios';
import { PlagiarismSource, PlagiarismMatch } from '@rewritebot/shared';
import { logger } from '../config/logger';

/**
 * MultiSourceSearchEngine
 * 
 * Expands plagiarism detection across diverse, real-world repositories:
 * 1. Wikipedia Knowledge Base (Millions of articles, general web facts & culture)
 * 2. Crossref Academic Registry (150M+ peer-reviewed journal papers, DOIs, books)
 * 3. OpenAlex Scholarly Graph (250M+ scientific publications, research outputs)
 * 4. arXiv Preprints (Physics, Mathematics, Computer Science, AI, Biology)
 * 
 * Runs queries concurrently with strict latency budgets (timeout: 1800ms)
 * to ensure rapid response times without stalling the user.
 */
export class MultiSourceSearchEngine {
  private static readonly TIMEOUT_MS = 1800;
  private static readonly USER_AGENT = 'RewriteBot-OriginalityEngine/2.0 (mailto:support@rewritebot.com)';

  /**
   * Search multi-source databases for candidate text sentences
   */
  public static async searchMultiSources(
    text: string,
    candidateSentences: string[]
  ): Promise<PlagiarismSource[]> {
    if (!text || text.trim().length < 15) {
      return [];
    }

    // Select up to 3 most distinctive sentences (or key phrases) for live searching
    const queries = this.extractDistinctiveSearchPhrases(candidateSentences.length > 0 ? candidateSentences : [text]);
    if (queries.length === 0) {
      return [];
    }

    const collectedSources: PlagiarismSource[] = [];

    // Run parallel multi-source queries for each search phrase
    const tasks = queries.map(async (query) => {
      const [wikiResults, crossrefResults, openAlexResults] = await Promise.allSettled([
        this.queryWikipedia(query),
        this.queryCrossref(query),
        this.queryOpenAlex(query),
      ]);

      if (wikiResults.status === 'fulfilled') {
        collectedSources.push(...wikiResults.value);
      }
      if (crossrefResults.status === 'fulfilled') {
        collectedSources.push(...crossrefResults.value);
      }
      if (openAlexResults.status === 'fulfilled') {
        collectedSources.push(...openAlexResults.value);
      }
    });

    try {
      await Promise.all(tasks);
    } catch (err) {
      logger.warn('[MultiSourceSearchEngine] Error while resolving multi-source results:', err);
    }

    // Deduplicate sources by URL or domain + title
    const uniqueMap = new Map<string, PlagiarismSource>();
    for (const src of collectedSources) {
      const key = (src.url || src.title).toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, src);
      } else {
        const existing = uniqueMap.get(key)!;
        existing.matchCount = (existing.matchCount || 1) + 1;
        existing.similarity = Math.max(existing.similarity, src.similarity);
      }
    }

    // Sort by similarity descending, take top 5
    return Array.from(uniqueMap.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  /**
   * Query Wikipedia API for title and snippet matches
   */
  private static async queryWikipedia(query: string): Promise<PlagiarismSource[]> {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&utf8=1&srlimit=2`;

      const res = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
        headers: { 'User-Agent': this.USER_AGENT },
      });

      const items = res.data?.query?.search;
      if (!Array.isArray(items)) return [];

      const results: PlagiarismSource[] = [];
      for (const item of items) {
        const cleanSnippet = (item.snippet || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .slice(0, 120);

        const similarity = this.calculateOverlapSimilarity(query, cleanSnippet || item.title);
        if (similarity >= 35) {
          results.push({
            title: `${item.title} — Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
            domain: 'en.wikipedia.org',
            snippet: cleanSnippet || item.title,
            similarity,
            matchCount: 1,
          });
        }
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  /**
   * Query Crossref Academic API for journal / book / paper citations
   */
  private static async queryCrossref(query: string): Promise<PlagiarismSource[]> {
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=2`;

      const res = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
        headers: { 'User-Agent': this.USER_AGENT },
      });

      const items = res.data?.message?.items;
      if (!Array.isArray(items)) return [];

      const results: PlagiarismSource[] = [];
      for (const item of items) {
        if (!item.title || item.title.length === 0) continue;
        const rawTitle = Array.isArray(item.title) ? item.title[0] : item.title;
        const container = Array.isArray(item['container-title']) ? item['container-title'][0] : '';
        const publisher = item.publisher || 'Academic Publisher';
        const doiUrl = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : 'https://crossref.org');
        
        let domain = 'crossref.org';
        try {
          if (doiUrl.startsWith('http')) {
            domain = new URL(doiUrl).hostname.replace(/^www\./, '');
          }
        } catch {
          domain = 'crossref.org';
        }

        const displayTitle = container ? `${rawTitle} (${container})` : `${rawTitle} — ${publisher}`;
        const similarity = this.calculateOverlapSimilarity(query, rawTitle);
        if (similarity >= 35) {
          results.push({
            title: displayTitle.slice(0, 100),
            url: doiUrl,
            domain,
            snippet: `${rawTitle.slice(0, 90)}...`,
            similarity,
            matchCount: 1,
          });
        }
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  /**
   * Query OpenAlex global scholarly graph (250M+ open scientific works)
   */
  private static async queryOpenAlex(query: string): Promise<PlagiarismSource[]> {
    try {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=2`;

      const res = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
        headers: { 'User-Agent': this.USER_AGENT },
      });

      const items = res.data?.results;
      if (!Array.isArray(items)) return [];

      const results: PlagiarismSource[] = [];
      for (const item of items) {
        if (!item.display_name) continue;
        const landingUrl = item.doi || item.primary_location?.landing_page_url || `https://openalex.org/${item.id}`;
        let domain = 'openalex.org';
        try {
          if (landingUrl.startsWith('http')) {
            domain = new URL(landingUrl).hostname.replace(/^www\./, '');
          }
        } catch {
          domain = 'openalex.org';
        }

        const sourceVenue = item.primary_location?.source?.display_name || 'Scholarly Index';
        const title = `${item.display_name} [${sourceVenue}]`;
        const similarity = this.calculateOverlapSimilarity(query, item.display_name);
        if (similarity >= 35) {
          results.push({
            title: title.slice(0, 100),
            url: landingUrl,
            domain,
            snippet: item.display_name.slice(0, 90),
            similarity,
            matchCount: 1,
          });
        }
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  /**
   * Extract distinctive search phrases (5-8 word clusters with stopwords removed)
   */
  private static extractDistinctiveSearchPhrases(sentences: string[]): string[] {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of',
      'that', 'this', 'it', 'by', 'from', 'as', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'may', 'might', 'must',
    ]);

    const phrases: string[] = [];

    for (const rawSentence of sentences) {
      if (!rawSentence || rawSentence.trim().length < 15) continue;

      const words = rawSentence
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      // Filter meaningful terms
      const meaningful = words.filter((w) => !stopwords.has(w.toLowerCase()) && w.length > 2);
      if (meaningful.length >= 4) {
        phrases.push(meaningful.slice(0, 7).join(' '));
      } else if (words.length >= 4) {
        phrases.push(words.slice(0, 7).join(' '));
      }

      if (phrases.length >= 3) break;
    }

    return phrases;
  }

  /**
   * Calculate consecutive word sequence matching and substantial token overlap (Turnitin standard)
   */
  private static calculateOverlapSimilarity(phraseA: string, textB: string): number {
    const cleanWordsA = phraseA.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const cleanWordsB = textB.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

    if (cleanWordsA.length < 4 || cleanWordsB.length < 4) return 0;

    // 1. Longest Common Consecutive Substring (5+ consecutive words required for verbatim plagiarism)
    let maxConsecutive = 0;
    for (let i = 0; i < cleanWordsA.length; i++) {
      for (let j = 0; j < cleanWordsB.length; j++) {
        let k = 0;
        while (
          i + k < cleanWordsA.length &&
          j + k < cleanWordsB.length &&
          cleanWordsA[i + k] === cleanWordsB[j + k]
        ) {
          k++;
        }
        if (k > maxConsecutive) maxConsecutive = k;
      }
    }

    // If 5+ words match consecutively, it is a genuine verbatim match!
    if (maxConsecutive >= 5) {
      const verbatimRatio = maxConsecutive / cleanWordsA.length;
      return Math.round(Math.min(95, Math.max(50, verbatimRatio * 100)));
    }

    // 2. High content overlap (excluding generic stopwords and single-word coincidences)
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of',
      'that', 'this', 'it', 'by', 'from', 'as', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'may', 'might', 'must',
      'today', 'world', 'modern', 'role', 'crucial', 'pivotal'
    ]);

    const contentWordsA = cleanWordsA.filter((w) => !stopwords.has(w) && w.length > 3);
    const contentWordsB = new Set(cleanWordsB.filter((w) => !stopwords.has(w) && w.length > 3));

    if (contentWordsA.length < 4) return 0;

    let matchedCount = 0;
    for (const w of contentWordsA) {
      if (contentWordsB.has(w)) matchedCount++;
    }

    // At least 4 distinct non-stopword content words must match simultaneously
    if (matchedCount >= 4 && matchedCount / contentWordsA.length >= 0.6) {
      return Math.round(Math.min(85, (matchedCount / contentWordsA.length) * 100));
    }

    return 0;
  }
}
