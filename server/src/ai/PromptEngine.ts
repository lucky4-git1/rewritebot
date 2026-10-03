import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes with deep structural & syntactic variety
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Rewrite the following text with balanced clause rearrangement, voice alternation, and deep syntactic restructuring while preserving all original facts and information. Invert cause-and-effect clauses, vary sentence openings, shift between active and passive constructions where natural, and refresh vocabulary without retaining the source sentence's exact grammatical template. Maintain strict 1:1 length parity without adding unnecessary padding, inflated synonyms, or bloated paragraphs.`,

  fluency: `Improve the grammatical flow, cadence, and sentence architecture of the following text to QuillBot-grade fluency. Focus on:
- Reorganizing clause order and sentence structure for natural, effortless human cadence
- Inverting dependent and independent clauses where it enhances readability
- Fronting transitional modifiers, participial openers, and varied sentence beginnings
- Eliminating awkward phrasing, word repetition, and monotonous rhythm
- Preserving strict 1:1 length parity and factual fidelity with zero verbose padding or bloated synonyms.`,

  humanize: `Rewrite the following text with deep sentence-level variety to sound naturally authored and defeat AI detectors. Focus on:
- Dynamic burstiness: mix punchy short sentences with natural, flowing compound-complex clauses
- Inverted conversational clause structures and authentic human cadence
- Organic discourse transitions rather than formulaic AI connectors (avoid "Furthermore", "Moreover", "In conclusion", "It is crucial to note", "delve into")
- Never preserve the robotic word-for-word sentence structure of the source
CRITICAL LENGTH RULE: Keep all facts, names, numbers, and technical terms intact. Maintain strict 1:1 length parity. Do NOT expand, explain, elaborate, or add conversational padding, filler stories, or introductory fluff.`,

  formal: `Rewrite the following text in an authoritative, sophisticated professional style. Reframe sentences using elevated grammatical construction, inverted clause hierarchies, and polished formal transitions while preserving all original facts and maintaining strict 1:1 length parity without pompous circumlocutions.`,

  academic: `Rewrite the following text in a scholarly peer-reviewed academic style. Reframe sentences by fronting evidence, methodology, or conditional clauses, alternating passive/active constructions for objective detachment, and synthesizing conceptual relationships with varied sentence architecture while maintaining strict 1:1 length parity.`,

  simple: `Simplify the following text to make it effortless to understand. Break convoluted, nested clauses into clean, direct sentences with clear subject-verb-object order, and reorder ideas chronologically or logically while keeping meaning 100% accurate and maintaining direct, concise phrasing.`,

  creative: `Rewrite the following text with expressive, imaginative phrasing and dynamic sentence pacing. Radically vary sentence rhythms, restructure narrative clause order, employ evocative syntactic flow, and alternate between punchy short clauses and rich compound structures while preserving core meaning and avoiding artificial padding.`,

  expand: `Expand the following text with contextual nuance, explanatory depth, and elaborated sentence structures without inventing unsupported claims. Combine ideas into sophisticated compound-complex sentences with rich subordinate clauses and nuanced descriptors.`,

  shorten: `Condense the following text into high-impact, concise sentences. Merge redundant clauses, eliminate filler, and invert syntax for maximal economy of language while keeping every essential fact.`,

  custom: `Follow these instructions to rewrite the text with full sentence restructuring:

{customInstruction}`,
};

/**
 * Prompt engine for constructing AI prompts
 */
export class PromptEngine {
  /**
   * Build an authoritative system prompt that enforces:
   * 1. Single cohesive output only (no multiple drafts / alternative paragraphs)
   * 2. QuillBot-level structural and syntactic restructuring
   * 3. Mode-specific calibration (especially Shorten compression ratio and Expand depth)
   * 4. Scaled syntactic intensity according to synonymLevel
   * 5. Strict prohibition of meta-chatter, options, or preambles
   */
  buildSystemPrompt(request: AIRequest): string {
    const parts: string[] = [];

    parts.push('You are RewriteBot, an elite editorial paraphrasing and syntactic restructuring engine.');
    parts.push('');

    // Rule 1: Single output only (strictly eliminates multiple alternative paragraphs / word bloat)
    parts.push('CRITICAL OUTPUT CONSTRAINTS:');
    parts.push('1. SINGLE COHESIVE VERSION ONLY: Output exactly ONE single rewritten version of the text. Under NO circumstances should you output multiple drafts, alternative paragraphs, numbered variations, or bulleted options.');
    parts.push('2. ZERO META-TEXT: Return ONLY the rewritten text. Never include conversational preambles (e.g. "Here is the rewritten text:"), option headers, labels, or explanatory commentary.');
    parts.push('3. 100% FACTUAL PRESERVATION: Maintain all underlying facts, numbers, dates, citations (e.g. [1], [4]), and proper nouns with absolute fidelity.');
    parts.push('');

    // Rule 2: QuillBot-grade Structural Transformation Directive
    parts.push('QUILLBOT-GRADE STRUCTURAL RESTRUCTURING DIRECTIVE:');
    parts.push('You must actively transform the grammatical architecture and clause order of every sentence. Do NOT perform lazy 1:1 word-for-word synonym swapping into the original sentence template.');
    parts.push('- Invert clause sequence: flip cause-and-effect, conditional, and main clauses.');
    parts.push('- Shift grammatical voice (active <-> passive) and change the sentence subject where natural.');
    parts.push('- Front prepositional phrases, adverbial modifiers, or participial openers for varied sentence beginnings.');
    parts.push('- You may split dense, convoluted run-on clauses into crisp, high-impact statements, or synthesize choppy clauses into balanced compound structures.');
    parts.push('- Never reuse the identical main predicate or grammatical template across consecutive sentences.');
    parts.push('');

    // Rule 3: Zero Unnecessary Synonyms & Anti-Bloat Directive
    parts.push('ZERO UNNECESSARY SYNONYMS & ANTI-BLOAT DIRECTIVE:');
    parts.push('1. EQUAL-WEIGHT SYNONYM REPLACEMENTS: When replacing words, use precise, concise equivalents of identical or nearly identical semantic length (e.g. replace "delay" with "postpone", NOT with "make a strategic decision to push back").');
    parts.push('2. ZERO CIRCUMLOCUTIONS: Never expand a single word into a wordy multi-word phrase (e.g. never change "because" to "due to the incontrovertible fact that", or "helps" to "plays an instrumental role in facilitating").');
    parts.push('3. ZERO ADJECTIVE/ADVERB PADDING: Do not insert decorative, pretentious adverbs or intensifiers ("substantially", "critically", "dramatically", "crucially", "remarkably") unless they exist in the input.');
    parts.push('4. RESTRUCTURE VIA SYNTAX, NOT INFLATION: Transform sentence architecture through clause inversion (subordinate <-> main), grammatical voice alternation, and varied sentence openings—NOT by inflating vocabulary or padding with thesaurus synonyms.');
    parts.push('');

    // Calculate dynamic word count metrics
    const rawWords = request.text.trim().split(/\s+/).filter(Boolean);
    const inputWordCount = rawWords.length;

    // Rule 4: Mode-specific instructions and calibrated length limits
    const mode = request.mode;
    if (mode === 'shorten') {
      const minWords = Math.max(3, Math.round(inputWordCount * 0.40));
      const maxWords = Math.max(minWords, Math.round(inputWordCount * 0.65));
      parts.push('MODE: SHORTEN (HIGH COMPRESSION MANDATE):');
      parts.push(`- Input length: ${inputWordCount} words.`);
      parts.push(`- TARGET COMPRESSION LENGTH: ${minWords} to ${maxWords} words (40% to 65% of input).`);
      parts.push('- Strip non-essential modifiers, eliminate wordy transitions, and synthesize the core assertion into a single, punchy, high-impact sentence or tight paragraph.');
      parts.push('- Under NO circumstances should you expand or output multiple alternative versions.');
      parts.push('');
    } else if (mode === 'expand') {
      const minWords = Math.round(inputWordCount * 1.20);
      const maxWords = Math.round(inputWordCount * 1.45);
      parts.push('MODE: EXPAND (NUANCED ELABORATION MANDATE):');
      parts.push(`- Input length: ${inputWordCount} words.`);
      parts.push(`- TARGET EXPANDED LENGTH: ${minWords} to ${maxWords} words (+20% to +45% longer).`);
      parts.push('- Elaborate ideas with analytical depth, rich subordinate clauses, and contextual precision without inventing ungrounded facts.');
      parts.push('');
    } else {
      // Standard, Fluency, Humanize, Formal, Academic, Simple, Creative, Custom
      const minWords = Math.max(1, Math.round(inputWordCount * 0.95));
      const maxWords = Math.max(inputWordCount, Math.round(inputWordCount * 1.08));
      const modePrompt = this.getModePrompt(mode, request.customInstruction);
      parts.push(`MODE: ${mode.toUpperCase()}`);
      parts.push(modePrompt);
      parts.push('');
      parts.push('QUILLBOT 1:1 WORD-COUNT PARITY & LENGTH CONSERVATION:');
      parts.push(`- Input length: Exactly ${inputWordCount} words.`);
      parts.push(`- STRICT TARGET LENGTH: ${minWords} to ${maxWords} words (strict 1:1 length parity).`);
      parts.push(`- STRICT MAXIMUM: Never exceed ${maxWords} words. Do NOT bloat into extra sentences, add padding, or introduce conversational filler.`);
      parts.push('');
    }

    // Rule 5: Synonym & Structural Intensity Slider (Levels 1 to 4)
    parts.push(this.getSynonymLevelInstruction(request.synonymLevel || 2));
    parts.push('');

    // Rule 6: Frozen terms
    if (request.frozenTerms && request.frozenTerms.length > 0) {
      parts.push(this.getFrozenTermsInstruction(request.frozenTerms));
      parts.push('');
    }

    // Rule 7: Language
    if (request.language && request.language !== 'auto') {
      parts.push(`LANGUAGE: Keep the output in ${this.getLanguageName(request.language)}.`);
      parts.push('');
    }

    // Rule 8: Plagiarism Guard
    if (request.plagiarismGuard !== false) {
      parts.push('ANTI-PLAGIARISM DIRECTIVE: Ensure the output exhibits zero verbatim copying or patchwriting by completely recasting sentence trees while keeping meaning intact.');
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Build the clean user prompt containing only the text to rewrite
   */
  buildUserPrompt(request: AIRequest): string {
    const rawWords = request.text.trim().split(/\s+/).filter(Boolean);
    const inputWordCount = rawWords.length;
    const mode = request.mode;

    if (mode === 'shorten') {
      const minWords = Math.max(3, Math.round(inputWordCount * 0.40));
      const maxWords = Math.max(minWords, Math.round(inputWordCount * 0.65));
      return `Shorten and condense the following text (${inputWordCount} words) into ${minWords}-${maxWords} words. Do not bloat or output multiple versions:\n\n${request.text}`;
    }

    if (mode === 'expand') {
      return `Expand the following text (${inputWordCount} words) with nuanced depth:\n\n${request.text}`;
    }

    const minWords = Math.max(1, Math.round(inputWordCount * 0.95));
    const maxWords = Math.max(inputWordCount, Math.round(inputWordCount * 1.08));
    return `Rewrite and structurally restructure the following text (${inputWordCount} words) maintaining strict 1:1 word count parity (${minWords}-${maxWords} words) with zero fluff or bloated synonyms:\n\n${request.text}`;
  }

  /**
   * Build a complete prompt for AI generation (legacy / single-string fallback)
   */
  buildPrompt(request: AIRequest): string {
    const systemPart = this.buildSystemPrompt(request);
    const userPart = this.buildUserPrompt(request);
    return `${systemPart}\n\n---\n${userPart}`;
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
      1: 'SYNONYM & STRUCTURAL INTENSITY: Level 1 (Mild). Substitute ~20% of words with concise equivalents and make light clause adjustments while preserving familiar cadence and strict word count parity.',
      2: 'SYNONYM & STRUCTURAL INTENSITY: Level 2 (Balanced). Substitute ~35% of words with concise equivalents, actively invert cause-and-effect clauses, and alternate sentence openings while maintaining strict word count parity.',
      3: 'SYNONYM & STRUCTURAL INTENSITY: Level 3 (High — QuillBot Standard). Transform ~55% of phrasing: aggressively invert clause hierarchies, change sentence subjects, front participial/prepositional modifiers, and maintain strict 1:1 word count parity with zero fluff.',
      4: 'SYNONYM & STRUCTURAL INTENSITY: Level 4 (Max — Radical Syntactic Transformation). Completely reconstruct sentence syntax and transform ~75% of phrasing from the ground up: re-sequence ideas, invert main/subordinate clauses, and maximize structural variety while preserving exact facts and strict word count parity.',
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
CRITICAL: Keep output length strictly proportional to the input text (word count strictly within ±10%). Do NOT add background explanations, introductory remarks, or conversational filler. Return ONLY the rewritten text.

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

CRITICAL CONSISTENCY MANDATE:
- The "originalityScore" and the "matches" array MUST be 100% mathematically consistent:
  * If originalityScore < 85, you MUST flag at least one or more sentences as "paraphrased" (or "exact") with a concise explanation and a likely reference domain (e.g. "scholar.google.com", "arxiv.org", "wikipedia.org", "sciencedirect.com", "reuters.com"). NEVER return a low originality score with 0 flagged sentences!
  * If ALL sentences in "matches" are labeled "clean", then "originalityScore" MUST be 95-100, "plagiarismScore" must be <= 5, "riskLevel" must be "safe", and "sources" must be [].
  * If any sentence is flagged as "paraphrased" or "exact", you MUST populate the "sources" array with at least 1-2 realistic reference sources and excerpts so the user can verify and fix.

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
