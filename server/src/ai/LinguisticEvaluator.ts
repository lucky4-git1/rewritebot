import { logger } from '../config/logger';

export interface EvaluatorScoreBreakdown {
  semanticScore: number;       // 0 - 100: Directional and factual meaning preservation
  fluencyScore: number;        // 0 - 100: Natural human flow, burstiness, zero robotic cliches
  transformationScore: number; // 0 - 100: Structural rephrasing distance without over-mutilation
  readabilityScore: number;    // 0 - 100: Syntactic clarity and lexical appropriateness
}

export interface LinguisticEvaluationResult {
  totalScore: number;          // 0 - 100 weighted composite score
  passed: boolean;             // True if totalScore >= passThreshold and no critical semantic breaks
  breakdown: EvaluatorScoreBreakdown;
  issues: string[];
  metrics: {
    directionalFlips: string[];
    negationFlips: string[];
    burstinessVariance: number;
    repetitionRatio: number;
    transformationRatio: number;
  };
}

export interface EvaluatorWeights {
  semantic: number;
  fluency: number;
  transformation: number;
  readability: number;
}

// Default initial weights: Semantic preservation is highest priority, followed by fluency, transformation, and readability
export const DEFAULT_EVALUATOR_WEIGHTS: EvaluatorWeights = {
  semantic: 0.40,
  fluency: 0.25,
  transformation: 0.20,
  readability: 0.15,
};

// Logical, directional, and relational antonym pairs that indicate severe meaning distortion if flipped
const DIRECTIONAL_ANTONYM_PAIRS: Array<[RegExp, RegExp, string]> = [
  [/\bincreas(?:e|ed|ing|es)\b/i, /\bdecreas(?:e|ed|ing|es)\b/i, 'increase vs decrease'],
  [/\brise|rose|rising|risen\b/i, /\bfall|fell|falling|fallen|drop(?:ped)?\b/i, 'rise vs fall/drop'],
  [/\baccelerat(?:e|ed|ing)\b/i, /\bdecelerat(?:e|ed|ing)|slow(?:ed)?\b/i, 'accelerate vs decelerate'],
  [/\bbefore|prior\s+to\b/i, /\bafter|subsequent\s+to|following\b/i, 'before/prior vs after/following'],
  [/\bearlier\b/i, /\blater\b/i, 'earlier vs later'],
  [/\bsuperior\b/i, /\binferior\b/i, 'superior vs inferior'],
  [/\bmajority\b/i, /\bminority\b/i, 'majority vs minority'],
  [/\bmaximum|highest\b/i, /\bminimum|lowest\b/i, 'maximum vs minimum'],
  [/\bcaus(?:e|ed|ing)\b/i, /\bprevent(?:ed|ing)?|inhibited\b/i, 'cause vs prevent'],
  [/\binclud(?:e|ed|ing|es)\b/i, /\bexclud(?:e|ed|ing|es)\b/i, 'include vs exclude'],
  [/\ballowed|permitted\b/i, /\bprohibited|forbidden|banned\b/i, 'allowed vs prohibited'],
  [/\bpresent\b/i, /\babsent\b/i, 'present vs absent'],
];

// Negation patterns for polarity verification
const NEGATION_PATTERNS = [
  /\bnot\b/i,
  /\bnever\b/i,
  /\bno\b/i,
  /\bneither\b/i,
  /\bnor\b/i,
  /\bwithout\b/i,
  /\bfailed\s+to\b/i,
  /\bunable\s+to\b/i,
  /\blacks?\b/i,
];

// Robotic AI clichés that penalize naturalness
const ROBOTIC_CLICHE_PATTERNS: RegExp[] = [
  /\bfurthermore\b/i,
  /\bmoreover\b/i,
  /\badditionally\b/i,
  /\bit\s+is\s+crucial\s+to\s+note\b/i,
  /\bit\s+is\s+worth\s+noting\b/i,
  /\bplays\s+a\s+(?:pivotal|crucial)\s+role\b/i,
  /\bserves\s+as\s+a\s+testament\b/i,
  /\bdelve\s+into\b/i,
  /\ba\s+beacon\s+of\b/i,
  /\bin\s+conclusion\b/i,
  /\bto\s+summarize\b/i,
  /\btapestry\s+of\b/i,
];

/**
 * Tokenize text into normalized alphanumeric words
 */
function tokenizeWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Split text into individual sentences
 */
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
}

export class LinguisticEvaluator {
  private weights: EvaluatorWeights;

  constructor(weights: EvaluatorWeights = DEFAULT_EVALUATOR_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Set dynamic weights for experimental benchmarking
   */
  setWeights(weights: EvaluatorWeights): void {
    this.weights = weights;
  }

  /**
   * Evaluate semantic preservation:
   * - Detects inverted directional antonyms
   * - Detects negation/polarity shifts
   * - Evaluates key informational content word coverage
   */
  evaluateSemanticPreservation(original: string, candidate: string): { score: number; issues: string[]; directionalFlips: string[]; negationFlips: string[] } {
    const issues: string[] = [];
    const directionalFlips: string[] = [];
    const negationFlips: string[] = [];
    let score = 100;

    // 1. Directional Antonym Drift Matrix
    for (const [patternA, patternB, label] of DIRECTIONAL_ANTONYM_PAIRS) {
      const origHasA = patternA.test(original);
      const origHasB = patternB.test(original);
      const candHasA = patternA.test(candidate);
      const candHasB = patternB.test(candidate);

      // If original had A (and not B), but candidate flipped to B (without A)
      if (origHasA && !origHasB && candHasB && !candHasA) {
        const desc = `Directional inversion detected: swapped "${label}"`;
        directionalFlips.push(desc);
        issues.push(desc);
        score -= 40;
      }
      // Conversely, if original had B (and not A), but candidate flipped to A (without B)
      else if (origHasB && !origHasA && candHasA && !candHasB) {
        const desc = `Directional inversion detected: inverted "${label}"`;
        directionalFlips.push(desc);
        issues.push(desc);
        score -= 40;
      }
    }

    // 2. Polarity / Negation Inversion Check
    let origNegCount = 0;
    for (const pat of NEGATION_PATTERNS) {
      if (pat.test(original)) origNegCount++;
    }
    let candNegCount = 0;
    for (const pat of NEGATION_PATTERNS) {
      if (pat.test(candidate)) candNegCount++;
    }

    // If original had zero negation but candidate introduced negation (or vice-versa in a short text)
    if (origNegCount === 0 && candNegCount >= 2) {
      const desc = 'Potential polarity inversion: candidate introduced multiple negative assertions absent in source';
      negationFlips.push(desc);
      issues.push(desc);
      score -= 25;
    } else if (origNegCount >= 1 && candNegCount === 0) {
      // Check if original negation was critical ("not", "never", "without")
      const criticalNeg = /\b(?:not|never|without|failed)\b/i.test(original);
      if (criticalNeg) {
        const desc = 'Potential polarity loss: source text contained explicit negation absent in rewrite';
        negationFlips.push(desc);
        issues.push(desc);
        score -= 30;
      }
    }

    // 3. Essential Content Anchor Coverage
    const origTokens = tokenizeWords(original);
    const candTokens = tokenizeWords(candidate);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'was', 'are', 'were', 'it', 'this', 'that', 'from']);
    const origContentTokens = origTokens.filter(t => !stopWords.has(t) && t.length > 2);
    
    // Check what fraction of core vocabulary anchors are preserved or adapted
    const candSet = new Set(candTokens);
    let matchedContent = 0;
    for (const t of origContentTokens) {
      if (candSet.has(t)) matchedContent++;
    }

    const contentRetentionRatio = origContentTokens.length > 0 ? matchedContent / origContentTokens.length : 1.0;
    // For a natural paraphrase, 40-80% of content vocabulary anchors should be present (either directly or via shared stems)
    if (contentRetentionRatio < 0.25) {
      issues.push(`Severe content divergence: only ${Math.round(contentRetentionRatio * 100)}% content vocabulary retained`);
      score -= 30;
    }

    return {
      score: Math.max(0, score),
      issues,
      directionalFlips,
      negationFlips,
    };
  }

  /**
   * Evaluate fluency, burstiness, and natural cadence
   */
  evaluateFluency(candidate: string): { score: number; issues: string[]; burstinessVariance: number; repetitionRatio: number } {
    const issues: string[] = [];
    let score = 100;

    // 1. Robotic Cliché Penalty
    for (const pat of ROBOTIC_CLICHE_PATTERNS) {
      const match = candidate.match(pat);
      if (match) {
        issues.push(`Robotic cliché detected: "${match[0]}"`);
        score -= 15;
      }
    }

    // 2. Repetition & Repetitive N-Gram Stutter
    const tokens = tokenizeWords(candidate);
    const bigrams = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]} ${tokens[i + 1]}`;
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    let repeatedBigrams = 0;
    for (const count of bigrams.values()) {
      if (count > 2) repeatedBigrams += (count - 1);
    }
    const repetitionRatio = tokens.length > 0 ? repeatedBigrams / (tokens.length - 1) : 0;
    if (repetitionRatio > 0.08) {
      issues.push(`Excessive phrasing repetition detected (${Math.round(repetitionRatio * 100)}% repeated bigrams)`);
      score -= 20;
    }

    // 3. Sentence Length Burstiness Variance (Human vs Robotic AI Pacing)
    const sentences = splitSentences(candidate);
    const sentenceLengths = sentences.map(s => tokenizeWords(s).length).filter(len => len > 0);
    let burstinessVariance = 0;

    if (sentenceLengths.length > 1) {
      const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length;
      burstinessVariance = Math.sqrt(variance);

      // Natural human writing has standard deviation >= 3.5 words across sentences
      // Highly robotic/monotonous text has SD < 1.5 where every sentence is uniform length
      if (burstinessVariance < 1.2 && sentenceLengths.length >= 3) {
        issues.push(`Monotonous robotic sentence pacing (burstiness SD: ${burstinessVariance.toFixed(1)})`);
        score -= 10;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      burstinessVariance,
      repetitionRatio,
    };
  }

  /**
   * Evaluate structural transformation distance
   * Rewards genuine, meaningful syntactic rephrasing; penalizes verbatim copying or over-mutation
   */
  evaluateTransformation(original: string, candidate: string): { score: number; issues: string[]; transformationRatio: number } {
    const issues: string[] = [];
    const origTokens = tokenizeWords(original);
    const candTokens = tokenizeWords(candidate);

    if (origTokens.length === 0 || candTokens.length === 0) {
      return { score: 50, issues: ['Empty tokens'], transformationRatio: 0 };
    }

    // Measure exact verbatim token match index
    let exactMatches = 0;
    const minLen = Math.min(origTokens.length, candTokens.length);
    for (let i = 0; i < minLen; i++) {
      if (origTokens[i] === candTokens[i]) {
        exactMatches++;
      }
    }
    const verbatimPositionalRatio = exactMatches / minLen;

    // Transformation ratio (1.0 = completely different sequence, 0.0 = identical verbatim copy)
    const transformationRatio = 1.0 - verbatimPositionalRatio;
    let score = 90;

    // If candidate is a pure copy-paste (> 85% identical word-by-word position)
    if (transformationRatio < 0.15) {
      issues.push(`Insufficient transformation: rewrite is ${Math.round((1 - transformationRatio) * 100)}% identical to source`);
      score = 30;
    } else if (transformationRatio >= 0.25 && transformationRatio <= 0.85) {
      // Golden QuillBot sweet spot: 25% to 75% structural transformation
      score = 98;
    } else if (transformationRatio > 0.90) {
      // Too high: complete over-mutation might indicate hallucination
      score = 80;
    }

    return {
      score,
      issues,
      transformationRatio,
    };
  }

  /**
   * Evaluate readability and syntactic clarity
   */
  evaluateReadability(candidate: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 95;

    const tokens = tokenizeWords(candidate);
    const sentences = splitSentences(candidate);

    if (tokens.length === 0 || sentences.length === 0) {
      return { score: 50, issues: ['Empty candidate text'] };
    }

    const avgWordsPerSentence = tokens.length / Math.max(1, sentences.length);

    // Run-on sentence check
    if (avgWordsPerSentence > 42) {
      issues.push(`Unusually long, convoluted sentence structure (avg ${Math.round(avgWordsPerSentence)} words/sentence)`);
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Full composite linguistic evaluation across all four weighted vectors
   */
  evaluate(original: string, candidate: string, passThreshold: number = 82): LinguisticEvaluationResult {
    const sem = this.evaluateSemanticPreservation(original, candidate);
    const flu = this.evaluateFluency(candidate);
    const tra = this.evaluateTransformation(original, candidate);
    const rea = this.evaluateReadability(candidate);

    const totalScore = Math.round(
      sem.score * this.weights.semantic +
      flu.score * this.weights.fluency +
      tra.score * this.weights.transformation +
      rea.score * this.weights.readability
    );

    const allIssues = [
      ...sem.issues,
      ...flu.issues,
      ...tra.issues,
      ...rea.issues,
    ];

    // Critical failure if directional antonym was flipped regardless of composite score
    const hasCriticalBreak = sem.directionalFlips.length > 0 || sem.score < 50 || tra.transformationRatio < 0.12;
    const passed = totalScore >= passThreshold && !hasCriticalBreak;

    return {
      totalScore,
      passed,
      breakdown: {
        semanticScore: sem.score,
        fluencyScore: flu.score,
        transformationScore: tra.score,
        readabilityScore: rea.score,
      },
      issues: allIssues,
      metrics: {
        directionalFlips: sem.directionalFlips,
        negationFlips: sem.negationFlips,
        burstinessVariance: flu.burstinessVariance,
        repetitionRatio: flu.repetitionRatio,
        transformationRatio: tra.transformationRatio,
      },
    };
  }
}

export const linguisticEvaluator = new LinguisticEvaluator();
