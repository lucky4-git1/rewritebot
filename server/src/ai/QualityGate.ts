import { logger } from '../config/logger';

export interface EntityExtractionResult {
  numbers: string[];
  datesAndYears: string[];
  properNouns: string[];
  citations: string[];
  rawWordCount: number;
}

export interface QualityEvaluationResult {
  passed: boolean;
  score: number; // 0 to 100
  issues: string[];
  metrics: {
    lengthRatio: number;
    paragraphParity: boolean;
    missingEntities: string[];
    bannedPatternsFound: string[];
  };
}

// Obvious robotic / bureaucratic artifacts that degrade human flow
const BANNED_BOT_PHRASES: RegExp[] = [
  /\bcommencement\s+within\b/i,
  /\bcapital\s+within\b/i,
  /\bheads\s+within\b/i,
  /\bdrawn\s+from\s+a\s+pair\s+of\b/i,
  /\bpertaining\s+to\b/i,
  /\bplays\s+a\s+pivotal\s+role\b/i,
  /\bserves\s+as\s+a\s+testament\b/i,
  /\bdelve\s+into\b/i,
  /\bit\s+is\s+crucial\s+to\s+note\b/i,
  /\bit\s+is\s+worth\s+noting\b/i,
];

// Hallucinated conclusion sentence openers
const HALLUCINATED_CONCLUSION_TRIGGERS: RegExp[] = [
  /\b(?:in\s+conclusion|to\s+conclude|to\s+summarize|in\s+summary),/i,
  /\bthe\s+study['’]s\s+findings\s+could\s+inform\b/i,
  /\bthese\s+findings\s+pave\s+the\s+way\s+for\b/i,
  /\bfurther\s+research\s+is\s+warranted\b/i,
  /\bfurther\s+investigation\s+is\s+needed\b/i,
  /\bensuring\s+academic\s+rigor\b/i,
];

export class QualityGate {
  /**
   * Fast, deterministic entity and fact extraction (0ms latency)
   */
  extractEntities(text: string): EntityExtractionResult {
    const rawWords = text.trim().split(/\s+/).filter(Boolean);

    // Extract numbers, percentages, and decimals (e.g. "860", "110", "0.72", "50%")
    const numberMatches = text.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];
    const uniqueNumbers = Array.from(new Set(numberMatches));

    // Extract academic year / date patterns (e.g. "2016/2017", "2016–2017", "12 months")
    const dateMatches = text.match(/\b\d{4}(?:[\/\-–]\d{2,4})?\b/g) || [];
    const uniqueDates = Array.from(new Set(dateMatches));

    // Extract citations like [1], [4, 5], [12-15]
    const citationMatches = text.match(/\[\d+(?:[,\-–]\s*\d+)*\]/g) || [];
    const uniqueCitations = Array.from(new Set(citationMatches));

    // Extract capitalized proper noun chains (e.g. "Beni-Suef", "Cairo", "Upper Egypt")
    const properNounMatches = text.match(/\b[A-Z][a-zA-Z]*(?:-[A-Z][a-zA-Z]*)*(?:\s+[A-Z][a-zA-Z]*(?:-[A-Z][a-zA-Z]*)*)*/g) || [];
    // Filter out common sentence start words
    const commonStartWords = new Set(['The', 'This', 'That', 'These', 'Those', 'In', 'At', 'On', 'A', 'An', 'It', 'Section', 'Every', 'Only', 'Along']);
    const filteredProperNouns = Array.from(
      new Set(
        properNounMatches
          .map((m) => m.trim())
          .filter((m) => m.length > 2 && !commonStartWords.has(m) && !/^\d+$/.test(m))
      )
    );

    return {
      numbers: uniqueNumbers,
      datesAndYears: uniqueDates,
      properNouns: filteredProperNouns,
      citations: uniqueCitations,
      rawWordCount: rawWords.length,
    };
  }

  /**
   * Deterministic quality evaluation of candidate output against original source (<5ms latency)
   */
  evaluateQuality(original: string, candidate: string, mode: string = 'standard'): QualityEvaluationResult {
    const issues: string[] = [];
    let score = 100;

    const originalEntities = this.extractEntities(original);
    const candidateEntities = this.extractEntities(candidate);

    // 1. Length ratio sanity check
    const originalWords = originalEntities.rawWordCount;
    const candidateWords = candidateEntities.rawWordCount;
    const lengthRatio = originalWords > 0 ? candidateWords / originalWords : 1.0;

    if (mode === 'shorten') {
      if (lengthRatio > 0.75) {
        issues.push(`Shorten mode output too long (${Math.round(lengthRatio * 100)}% of input, expected <65%)`);
        score -= 25;
      }
    } else if (mode === 'expand') {
      if (lengthRatio < 1.15) {
        issues.push(`Expand mode output too short (${Math.round(lengthRatio * 100)}% of input, expected >120%)`);
        score -= 25;
      }
    } else {
      // Standard / Fluency / Humanize / Academic modes require ~1:1 word count parity
      if (lengthRatio < 0.75 || lengthRatio > 1.25) {
        issues.push(`Length drift out of bounds (${Math.round(lengthRatio * 100)}% of input, expected 85-115%)`);
        score -= 20;
      }
    }

    // 2. Paragraph parity check (reject merging or fracturing paragraphs)
    const origParas = original.trim().split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const candParas = candidate.trim().split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const paragraphParity = origParas.length === candParas.length;

    if (!paragraphParity && origParas.length > 1) {
      issues.push(`Paragraph count mismatch: original has ${origParas.length}, candidate has ${candParas.length}`);
      score -= 20;
    }

    // 3. Number & Statistical Data Integrity Check
    const missingNumbers: string[] = [];
    for (const num of originalEntities.numbers) {
      // Allow minor decimal formatting differences, e.g. 0.72 vs .72
      const cleanNum = num.replace(/^0\./, '.');
      const candHasNum = candidate.includes(num) || (cleanNum !== num && candidate.includes(cleanNum));
      if (!candHasNum) {
        missingNumbers.push(num);
      }
    }
    if (missingNumbers.length > 0) {
      issues.push(`Missing key quantitative data: ${missingNumbers.join(', ')}`);
      score -= Math.min(30, missingNumbers.length * 15);
    }

    // 4. Citation preservation check
    const missingCitations = originalEntities.citations.filter((c) => !candidate.includes(c));
    if (missingCitations.length > 0) {
      issues.push(`Missing citations: ${missingCitations.join(', ')}`);
      score -= 25;
    }

    // 5. Check for hallucinated closing commentary
    for (const trigger of HALLUCINATED_CONCLUSION_TRIGGERS) {
      if (trigger.test(candidate)) {
        issues.push(`Detected hallucinated conclusion commentary: matches ${trigger}`);
        score -= 35;
        break;
      }
    }

    // 6. Check for banned robotic / awkward prepositional artifacts
    const foundBanned: string[] = [];
    for (const pattern of BANNED_BOT_PHRASES) {
      const match = candidate.match(pattern);
      if (match) {
        foundBanned.push(match[0]);
      }
    }
    if (foundBanned.length > 0) {
      issues.push(`Detected awkward bot phrasing: ${foundBanned.join(', ')}`);
      score -= Math.min(30, foundBanned.length * 15);
    }

    // Final verdict: passed if score >= 75 and no critical factual omissions
    const passed = score >= 75 && missingNumbers.length === 0 && missingCitations.length === 0;

    return {
      passed,
      score: Math.max(0, score),
      issues,
      metrics: {
        lengthRatio,
        paragraphParity,
        missingEntities: missingNumbers,
        bannedPatternsFound: foundBanned,
      },
    };
  }
}

export const qualityGate = new QualityGate();
