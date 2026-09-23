import { DocumentStatistics } from '@rewritebot/shared';

export function calculateStatistics(
  inputText: string,
  outputText: string = ''
): DocumentStatistics {
  const inputStats = analyzeText(inputText);
  const outputStats = outputText ? analyzeText(outputText) : inputStats;

  const changedWords = outputText ? countChangedWords(inputText, outputText) : 0;
  const similarity = outputText ? calculateSimilarity(inputText, outputText) : 100;

  return {
    inputWords: inputStats.words,
    inputCharacters: inputStats.characters,
    inputSentences: inputStats.sentences,
    inputParagraphs: inputStats.paragraphs,
    outputWords: outputStats.words,
    outputCharacters: outputStats.characters,
    outputSentences: outputStats.sentences,
    outputParagraphs: outputStats.paragraphs,
    changedWords,
    similarity,
    readingTime: Math.ceil(outputStats.words / 200), // Average reading speed: 200 words/minute
  };
}

function analyzeText(text: string): {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
} {
  if (!text || text.trim().length === 0) {
    return { words: 0, characters: 0, sentences: 0, paragraphs: 0 };
  }

  const trimmed = text.trim();

  // Count words (split by whitespace and filter empty strings)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0).length;

  // Count characters (excluding whitespace)
  const characters = trimmed.replace(/\s/g, '').length;

  // Count sentences (split by . ! ? followed by space or end)
  const sentences = (trimmed.match(/[.!?]+(\s|$)/g) || []).length || 1;

  // Count paragraphs (split by double newlines)
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

  return { words, characters, sentences, paragraphs };
}

function countChangedWords(original: string, modified: string): number {
  const originalWords = original.toLowerCase().split(/\s+/);
  const modifiedWords = modified.toLowerCase().split(/\s+/);

  const originalSet = new Set(originalWords);
  const modifiedSet = new Set(modifiedWords);

  let changed = 0;

  // Count words in modified that aren't in original
  for (const word of modifiedSet) {
    if (!originalSet.has(word)) {
      changed++;
    }
  }

  // Count words in original that aren't in modified
  for (const word of originalSet) {
    if (!modifiedSet.has(word)) {
      changed++;
    }
  }

  return Math.floor(changed / 2); // Approximate, since we double-counted
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 100;

  return Math.round((intersection.size / union.size) * 100);
}
