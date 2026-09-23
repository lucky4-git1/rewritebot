import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Rewrite the following text while preserving its original meaning and key information. Make it clear and natural, but avoid unnecessary changes to facts, names, numbers, or technical terms.`,

  fluency: `Improve the fluency and readability of the following text. Focus on:
- Grammar and sentence structure
- Natural flow and transitions
- Clear expression
- Professional tone
Preserve all factual information, names, numbers, and technical terms.`,

  humanize: `Rewrite the following text to sound more natural and human. Use:
- Varied sentence structures
- Natural transitions
- Appropriate vocabulary
- Clear and engaging expression
Keep all facts, names, numbers, and technical terms unchanged.`,

  formal: `Rewrite the following text in a formal, professional style. Use formal language and structure while preserving all original meaning and information.`,

  academic: `Rewrite the following text in an academic style appropriate for research papers and scholarly work. Use precise, formal language. Do not invent references, citations, or facts. Preserve all existing information accurately.`,

  simple: `Simplify the following text to make it easier to understand. Use simpler vocabulary and shorter sentences while keeping the meaning accurate.`,

  creative: `Rewrite the following text with more creative and engaging expression. Use varied language and stylistic flourishes while preserving the core meaning and all factual information.`,

  expand: `Expand the following text with useful detail and elaboration. Add explanatory content and context where appropriate, but do not invent unsupported facts or claims.`,

  shorten: `Condense the following text to be more concise. Remove redundancy and unnecessary words while keeping all key information and meaning.`,

  custom: `Follow these instructions to rewrite the text:

{customInstruction}`,
};

/**
 * Prompt engine for constructing AI prompts
 */
export class PromptEngine {
  /**
   * Build a complete prompt for AI generation
   */
  buildPrompt(request: AIRequest): string {
    const parts: string[] = [];

    // System-level instructions
    parts.push('You are an AI writing assistant. Your task is to rewrite text according to specific instructions.');
    parts.push('');

    // Mode-specific instructions
    const modePrompt = this.getModePrompt(request.mode, request.customInstruction);
    parts.push(modePrompt);
    parts.push('');

    // Synonym level instructions
    if (request.synonymLevel > 1) {
      parts.push(this.getSynonymLevelInstruction(request.synonymLevel));
      parts.push('');
    }

    // Frozen terms instructions
    if (request.frozenTerms && request.frozenTerms.length > 0) {
      parts.push(this.getFrozenTermsInstruction(request.frozenTerms));
      parts.push('');
    }

    // Language instruction
    if (request.language && request.language !== 'auto') {
      parts.push(`Language: Keep the text in ${this.getLanguageName(request.language)}.`);
      parts.push('');
    }

    // Output format instructions
    parts.push('IMPORTANT: Return ONLY the rewritten text. Do not include explanations, notes, or meta-commentary.');
    parts.push('');

    // Input text
    parts.push('TEXT TO REWRITE:');
    parts.push('---');
    parts.push(request.text);
    parts.push('---');

    return parts.join('\n');
  }

  /**
   * Get prompt template for a mode
   */
  private getModePrompt(mode: ParaphraseMode, customInstruction?: string): string {
    const template = PROMPT_TEMPLATES[mode];

    if (mode === 'custom' && customInstruction) {
      return template.replace('{customInstruction}', customInstruction);
    }

    return template;
  }

  /**
   * Get synonym level instruction
   */
  private getSynonymLevelInstruction(level: number): string {
    const instructions = {
      1: 'Use minimal lexical changes. Replace words only when necessary for clarity.',
      2: 'Use moderate synonym replacement to vary the expression.',
      3: 'Use high synonym replacement to significantly vary the wording.',
      4: 'Use aggressive synonym replacement to maximize lexical variation.',
    };

    return instructions[level as 1 | 2 | 3 | 4] || instructions[2];
  }

  /**
   * Get frozen terms instruction
   */
  private getFrozenTermsInstruction(frozenTerms: string[]): string {
    const termsList = frozenTerms.map((term) => `"${term}"`).join(', ');
    return `PRESERVE EXACTLY: The following terms must remain unchanged: ${termsList}`;
  }

  /**
   * Get language name from code
   */
  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      te: 'Telugu',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      it: 'Italian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      ru: 'Russian',
    };

    return languages[code] || code;
  }

  /**
   * Build a prompt for grammar checking
   */
  buildGrammarPrompt(text: string, language: string): string {
    return `Check and correct the grammar, spelling, and punctuation in the following text. Return ONLY the corrected text without explanations.

Language: ${this.getLanguageName(language)}

TEXT:
---
${text}
---`;
  }

  /**
   * Build a prompt for humanization
   */
  buildHumanizePrompt(text: string, mode: string, language: string): string {
    const modeInstructions = {
      natural: 'Make the text sound natural and conversational while maintaining professionalism.',
      casual: 'Make the text casual and friendly.',
      professional: 'Make the text professional and polished.',
      academic: 'Make the text academic and scholarly.',
      conversational: 'Make the text conversational and engaging.',
    };

    const instruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.natural;

    return `${instruction}

Use natural sentence variation, appropriate transitions, and clear expression. Do not intentionally introduce errors.

Language: ${this.getLanguageName(language)}

TEXT:
---
${text}
---`;
  }

  /**
   * Build a prompt for summarization
   */
  buildSummarizePrompt(text: string, length: string, format: string, language: string): string {
    const lengthInstructions = {
      short: 'Create a brief summary (1-2 sentences).',
      medium: 'Create a moderate summary (3-5 sentences).',
      detailed: 'Create a detailed summary covering all main points.',
    };

    const formatInstructions = {
      paragraph: 'Format as a paragraph.',
      bullets: 'Format as bullet points.',
      'key-points': 'List the key points.',
      executive: 'Format as an executive summary.',
    };

    return `Summarize the following text.

${lengthInstructions[length as keyof typeof lengthInstructions] || lengthInstructions.medium}
${formatInstructions[format as keyof typeof formatInstructions] || formatInstructions.paragraph}

Language: ${this.getLanguageName(language)}

TEXT:
---
${text}
---`;
  }

  /**
   * Build a prompt for translation
   */
  buildTranslatePrompt(text: string, sourceLanguage: string, targetLanguage: string): string {
    return `Translate the following text from ${this.getLanguageName(sourceLanguage)} to ${this.getLanguageName(targetLanguage)}.

Return ONLY the translated text.

TEXT:
---
${text}
---`;
  }

  /**
   * Build a prompt for citation generation
   */
  buildCitationPrompt(source: any, style: string): string {
    const styleInstructions = {
      apa: 'Format the citation in APA 7th edition style.',
      mla: 'Format the citation in MLA 9th edition style.',
      chicago: 'Format the citation in Chicago 17th edition style.',
      harvard: 'Format the citation in Harvard style.',
      ieee: 'Format the citation in IEEE style.',
      vancouver: 'Format the citation in Vancouver style.',
    };

    const instruction = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.apa;

    return `Generate a properly formatted citation for the following source.

${instruction}

Return ONLY the formatted citation, without any explanations.

SOURCE INFORMATION:
Type: ${source.type}
Title: ${source.title}
Authors: ${source.authors.join(', ')}
${source.year ? `Year: ${source.year}` : ''}
${source.publisher ? `Publisher: ${source.publisher}` : ''}
${source.url ? `URL: ${source.url}` : ''}
${source.doi ? `DOI: ${source.doi}` : ''}
${source.volume ? `Volume: ${source.volume}` : ''}
${source.issue ? `Issue: ${source.issue}` : ''}
${source.pages ? `Pages: ${source.pages}` : ''}
${source.accessed ? `Accessed: ${source.accessed}` : ''}`;
  }
}
