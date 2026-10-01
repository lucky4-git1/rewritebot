import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes with deep structural & syntactic variety
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Rewrite the following text with balanced clause rearrangement and syntactic restructuring while preserving all original facts and information. Invert cause-and-effect clauses, vary sentence openings, and refresh vocabulary without retaining the source sentence's exact template.`,

  fluency: `Improve the grammatical flow, cadence, and sentence architecture of the following text. Focus on:
- Reorganizing clause order and sentence structure for natural human cadence
- Inverting dependent and independent clauses where it enhances readability
- Fronting transitional modifiers and varied sentence openings
- Eliminating awkward phrasing, word repetition, and monotonous rhythm
Preserve all factual information, names, numbers, and technical terms.`,

  humanize: `Rewrite the following text with deep sentence-level variety to sound naturally authored and defeat AI detectors. Use:
- Dramatic sentence length variation (mix punchy 5-word statements with compound thoughts)
- Inverted conversational clause structures and natural human cadence
- Asymmetric discourse connectors and organic flow
- Never preserve the robotic word-for-word sentence structure of the source
Keep all facts, names, numbers, and technical terms intact.`,

  formal: `Rewrite the following text in an authoritative, sophisticated professional style. Reframe sentences using elevated grammatical construction, inverted clause hierarchies, and polished formal transitions while preserving all original facts.`,

  academic: `Rewrite the following text in a scholarly peer-reviewed academic style. Reframe sentences by fronting evidence, condition, or methodology clauses, utilizing syntactic nominalization, and synthesizing conceptual relationships with varied sentence architecture.`,

  simple: `Simplify the following text to make it effortless to understand. Break convoluted, nested clauses into clean, direct sentences with clear subject-verb order, and reorder ideas chronologically or logically while keeping meaning accurate.`,

  creative: `Rewrite the following text with expressive, imaginative phrasing and dynamic sentence pacing. Radically vary sentence rhythms, restructure narrative clause order, and employ evocative syntactic flow while preserving core meaning.`,

  expand: `Expand the following text with contextual nuance, explanatory depth, and elaborated sentence structures without inventing unsupported claims. Combine ideas into sophisticated compound-complex sentences.`,

  shorten: `Condense the following text into high-impact, concise sentences. Merge redundant clauses, eliminate filler, and invert syntax for maximal economy of language while keeping every essential fact.`,

  custom: `Follow these instructions to rewrite the text with full sentence restructuring:

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
    parts.push('You are an expert AI paraphrasing and rewriting engine. Your primary objective is to rewrite text by fundamentally restructuring its sentence syntax and clause architecture.');
    parts.push('');

    // Mode-specific instructions
    const modePrompt = this.getModePrompt(request.mode, request.customInstruction);
    parts.push(modePrompt);
    parts.push('');

    // QuillBot-grade Syntactic & Structural Restructuring Directive
    parts.push('MANDATORY SENTENCE-LEVEL STRUCTURAL RESTRUCTURING DIRECTIVE:');
    parts.push('You must transform the grammatical architecture and clause order of every sentence. Do NOT perform 1:1 word-for-word synonym swapping.');
    parts.push('');
    parts.push('NEGATIVE CONSTRAINT (DO NOT DO THIS - LAZY PATCHWRITING):');
    parts.push('Input: "Because the storm caused severe flooding, the city council decided to evacuate the coastal residents."');
    parts.push('Bad output: "Since the tempest produced intense inundation, the town board resolved to relocate the seaside inhabitants."');
    parts.push('Error: Every word was merely substituted in the exact same grammatical slot. This is lazy patchwriting.');
    parts.push('');
    parts.push('POSITIVE DEMONSTRATIONS (MANDATORY SENTENCE RESTRUCTURING):');
    parts.push('- Clause Inversion (Flip order of clauses):');
    parts.push('  "The city council evacuated coastal residents after severe flooding struck the area."');
    parts.push('- Voice & Subject Inversion (Object/Causal phrase becomes subject):');
    parts.push('  "Severe coastal flooding prompted municipal leaders to order an immediate evacuation."');
    parts.push('- Fronted Prepositional / Participial Opener:');
    parts.push('  "Following catastrophic flooding from the storm, coastal residents were swiftly evacuated by local officials."');
    parts.push('');
    parts.push('RULES FOR EVERY SENTENCE:');
    parts.push('1. Clause Reordering: If a sentence contains two or more clauses, invert their sequence or front the conditional/purpose clause.');
    parts.push('2. Subject Transformation: Change the grammatical subject of the sentence where natural (e.g. active <-> passive voice, or nominalize verbs).');
    parts.push('3. Dynamic Sentence Length: Combine choppy sentences into compound structures, or divide verbose run-on sentences into crisp, punchy ideas.');
    parts.push('4. Varied Openings: Never start consecutive sentences with the same word or syntactic structure.');
    parts.push('5. 100% Fact & Semantic Preservation: Keep all numbers, proper nouns, facts, and underlying intent completely accurate.');
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

    // Plagiarism Guard instructions (default active)
    if (request.plagiarismGuard !== false) {
      parts.push('ORIGINALITY & ANTI-PLAGIARISM DIRECTIVE:');
      parts.push('- Ensure the output text is completely original with zero verbatim plagiarism or patchwriting.');
      parts.push('- Reorganize clause order, vary syntax structures, and substitute fresh vocabulary while preserving 100% of facts and meaning.');
      parts.push('');
    }

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
${source.pages ? `Pages: ${source.pages}` : ''}
${source.accessed ? `Accessed: ${source.accessed}` : ''}`;
  }

  /**
   * Build a prompt for plagiarism and originality checking (speed-optimized)
   */
  buildPlagiarismPrompt(text: string, language?: string): string {
    const lang = language && language !== 'auto' ? `Language: ${this.getLanguageName(language)}` : '';

    return `You are a fast academic plagiarism detection engine.
Evaluate the text for potential plagiarism, patchwriting, and semantic overlap against published web content, academic articles, and literature.

${lang}

CRITICAL: Return ONLY a valid, compact JSON object matching this schema without markdown formatting, backticks, or extra prose.

{
  "originalityScore": <0-100 integer: 100 is completely original, 0 is fully copied>,
  "plagiarismScore": <0-100 integer: 100 - originalityScore>,
  "humanScore": <0-100 integer: human vs AI detector score, where 100 is completely natural human and 0 is synthetic AI>,
  "riskLevel": <"safe" | "moderate" | "high">,
  "summary": "<ultra-brief 1-sentence assessment>",
  "matches": [
    {
      "sentence": "<exact sentence>",
      "type": <"exact" | "paraphrased" | "clean">,
      "similarity": <0-100 integer>,
      "sourceTitle": "<source name or empty string if clean>",
      "sourceUrl": "<source url or domain, or empty string if clean>",
      "explanation": "<concise reason under 8 words, or empty string if clean>"
    }
  ],
  "sources": [
    {
      "title": "<source title>",
      "url": "<url or domain>",
      "domain": "<clean domain, e.g. wikipedia.org>",
      "snippet": "<short 4-8 word matched excerpt>",
      "similarity": <0-100 integer>,
      "matchCount": <integer>
    }
  ]
}

SPEED & ACCURACY INSTRUCTIONS:
- Break text into its sentences.
- Label original phrasing or standard speech as "clean" (similarity 0-10%). For "clean", explanation, sourceTitle, and sourceUrl must be empty strings "".
- Label close paraphrases / patchwriting as "paraphrased" (similarity 30-79%). Keep explanation under 8 words.
- "sources" array: Include AT MOST 2 top matched sources only if non-clean matches exist; if all clean, return [].
- "riskLevel": "safe" if originalityScore >= 85, "moderate" if >= 60, else "high".
- "humanScore": Objectively evaluate whether the text exhibits synthetic AI characteristics vs authentic human cadence:
  * 20-55: Highly synthetic AI (monotonous sentence lengths, generic adjectives, predictable transition words like "Moreover", "Furthermore", "In conclusion", "It is crucial to note", "delve into").
  * 56-78: Mixed / moderate AI presence (balanced phrasing with some formulaic sentences).
  * 79-99: Highly natural human writing (dynamic burstiness with punchy short sentences mixed with long clauses, idiosyncratic rhythm, natural human voice).

TEXT TO ANALYZE:
---
${text}
---`;
  }
}
