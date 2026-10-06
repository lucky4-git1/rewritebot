import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes with deep structural & syntactic variety
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Paraphrase the text with natural human fluency, clear sentence structure, and authentic phrasing:
- Restructure sentences and rearrange clauses where it improves clarity and flow.
- Choose natural, precise wording while preserving all core facts, figures, citations, and proper nouns.
- Maintain authentic human cadence without artificial filler or awkward phrasing.
- Preserve paragraph boundaries and stop immediately when the input text finishes.`,

  fluency: `Improve the grammatical flow, cadence, and readability of the text:
- Refine sentence transitions and clause connections for effortless reading.
- Correct awkward constructions and monotonous rhythms.
- Keep the vocabulary clear, natural, and idiomatic without unnecessary complexity.
- Preserve factual meaning, numbers, and paragraph structure.`,

  humanize: `Rewrite the text to sound naturally and individually authored:
- Vary sentence length and pacing with dynamic, organic rhythm.
- Use natural conversational phrasing and organic transitions rather than rigid, formulaic connectors.
- Maintain the author's original meaning, facts, and paragraph boundaries without adding speculative commentary.`,

  formal: `Rewrite the text in an authoritative, polished professional style:
- Use sophisticated grammatical structure, clear clause relationships, and precise professional terminology.
- Maintain objective detachment and clarity without becoming pompous or convoluted.
- Preserve all facts, figures, proper names, and paragraph structure.`,

  academic: `Rewrite the text in a scholarly, peer-reviewed academic style:
- Frame ideas around evidence, methodology, and analytical context.
- Use precise disciplinary vocabulary, balancing passive and active voice for scholarly rigor.
- Preserve technical terms, factual assertions, numbers, and citations intact.`,

  simple: `Simplify the text to make it easy and direct to understand:
- Break complex, nested clauses into clean, straightforward sentences.
- Use clear everyday vocabulary while preserving 100% of the underlying meaning.
- Keep ideas organized logically and maintain paragraph structure.`,

  creative: `Rewrite the text with expressive phrasing and dynamic sentence pacing:
- Introduce evocative imagery, varied rhythmic cadence, and fresh phrasing.
- Keep core ideas intact while giving the narrative voice vitality and distinct character.
- Preserve paragraph structure without introducing unrelated claims.`,

  expand: `Elaborate on the text with explanatory depth and nuance:
- Develop core concepts with richer subordinate clauses and detailed descriptive context.
- Build nuanced compound-complex sentences without introducing ungrounded factual claims.`,

  shorten: `Condense the text into concise, high-impact prose:
- Remove redundancies, tighten wordy phrases, and distill core arguments to their essence.
- Preserve every essential fact, figure, and conclusion.`,

  custom: `Follow these instructions to rewrite the text:

{customInstruction}`,
};

/**
 * Prompt engine for constructing AI prompts
 */
export class PromptEngine {
  /**
   * Build an authoritative system prompt that enforces:
   * 1. Output constraints & paragraph integrity
   * 2. Calibrated transformation depth based on level (1 to 4)
   * 3. Mode-specific calibration
   * 4. Natural linguistic fluency and factual preservation
   */
  buildSystemPrompt(request: AIRequest): string {
    const parts: string[] = [];

    parts.push('You are RewriteBot, an expert editorial paraphrasing engine that rewrites text with authentic human craftsmanship, natural sentence variety, and strict factual preservation.');
    parts.push('');

    // Rule 1: Output Constraints & Paragraph Integrity
    parts.push('CRITICAL OUTPUT CONSTRAINTS:');
    parts.push('1. EXACT PARAGRAPH INTEGRITY: If the input has multiple paragraphs separated by blank lines, your output MUST preserve the exact same paragraph structure separated by blank lines (\\n\\n). Never merge paragraphs into a single block or move sentences between paragraphs.');
    parts.push('2. ZERO HALLUCINATED ADDITIONS: Stop immediately when the input text is fully rewritten. Never invent conclusions, summary observations, or editorial remarks (e.g. do NOT append "In summary...", "This highlights...", or "Further research is required").');
    parts.push('3. SINGLE OUTPUT ONLY: Output exactly ONE finished rewritten version. Never output multiple variations, alternative phrasing, options, or numbered lists.');
    parts.push('4. ZERO META-TEXT: Return ONLY the rewritten text itself. Never include conversational preambles (e.g. "Here is the rewritten text:"), headers, or notes.');
    parts.push('5. FACTUAL PRESERVATION: Retain all quantitative figures, statistics, dates, citations (e.g. [1], [4]), formulas, and proper nouns with complete accuracy.');
    parts.push('');

    // Rule 2: Natural Style & Phrasing Standards
    parts.push('STYLE & FLUENCY STANDARDS:');
    parts.push('1. NATURAL IDIOMATIC USAGE: Always use natural English collocations and prepositions (e.g. "capital of the province", "south of Cairo", "professor of public health"). Never generate awkward, bureaucratic phrasing like "capital within", "commencement within", or "pertaining to".');
    parts.push('2. ORGANIC TRANSITIONS: Let ideas connect naturally through the logic of the sentences rather than relying on repetitive formulaic transitional crutches.');
    parts.push('3. VARIED CADENCE: Alternate naturally between shorter, direct statements and longer, multi-clause sentences.');
    parts.push('');

    // Calculate dynamic word count metrics
    const rawWords = request.text.trim().split(/\s+/).filter(Boolean);
    const inputWordCount = rawWords.length;

    // Rule 3: Mode-specific instructions and calibrated length limits
    const mode = request.mode;
    if (mode === 'shorten') {
      const minWords = Math.max(3, Math.round(inputWordCount * 0.40));
      const maxWords = Math.max(minWords, Math.round(inputWordCount * 0.65));
      parts.push('MODE: SHORTEN (HIGH COMPRESSION MANDATE):');
      parts.push(`- Input length: ${inputWordCount} words.`);
      parts.push(`- TARGET COMPRESSION LENGTH: Approximately ${minWords} to ${maxWords} words (40% to 65% of input).`);
      parts.push('- Strip non-essential modifiers, eliminate wordy transitions, and synthesize the core assertion into concise, punchy phrasing.');
      parts.push('');
    } else if (mode === 'expand') {
      const minWords = Math.round(inputWordCount * 1.20);
      const maxWords = Math.round(inputWordCount * 1.45);
      parts.push('MODE: EXPAND (NUANCED ELABORATION MANDATE):');
      parts.push(`- Input length: ${inputWordCount} words.`);
      parts.push(`- TARGET EXPANDED LENGTH: Approximately ${minWords} to ${maxWords} words (+20% to +45% longer).`);
      parts.push('- Elaborate ideas with analytical depth, rich subordinate clauses, and contextual precision without inventing ungrounded facts.');
      parts.push('');
    } else {
      const modePrompt = this.getModePrompt(mode, request.customInstruction);
      parts.push(`MODE: ${mode.toUpperCase()}`);
      parts.push(modePrompt);
      parts.push('');
      parts.push('NATURAL LENGTH PREFERENCE:');
      parts.push(`- Input length: Approximately ${inputWordCount} words.`);
      parts.push('- Maintain natural, balanced length proportional to the original. Prioritize faithful meaning and readability over artificial length expansion.');
      parts.push('');
    }

    // Rule 4: Transformation Depth / Synonym Level (Levels 1 to 4)
    parts.push(this.getSynonymLevelInstruction(request.synonymLevel || 2));
    parts.push('');

    // Rule 5: Frozen terms
    if (request.frozenTerms && request.frozenTerms.length > 0) {
      parts.push(this.getFrozenTermsInstruction(request.frozenTerms));
      parts.push('');
    }

    // Rule 6: Language
    if (request.language && request.language !== 'auto') {
      parts.push(`LANGUAGE: Keep the output in ${this.getLanguageName(request.language)}.`);
      parts.push('');
    }

    // Rule 7: Originality & Clause Rearrangement Protocol
    if (request.plagiarismGuard !== false) {
      parts.push('ORIGINALITY & CLAUSE REARRANGEMENT GUIDANCE:');
      parts.push('- Break long verbatim runs through genuine syntactic reframing and clause restructuring.');
      parts.push('- Keep domain-standard terminology and idiomatic collocations intact.');
      parts.push('- Ensure all underlying facts, quantitative measurements, and scientific assertions remain 100% faithful.');
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
      return `Shorten and condense the following text (${inputWordCount} words) into ${minWords}-${maxWords} words. Maintain paragraph structure, preserve essential facts, and return only the rewritten text:\n\n${request.text}`;
    }

    if (mode === 'expand') {
      return `Expand the following text (${inputWordCount} words) with nuanced depth. Maintain paragraph structure, preserve facts, and return only the rewritten text:\n\n${request.text}`;
    }

    if (mode === 'humanize') {
      const tonePart = request.customInstruction ? ` (${request.customInstruction})` : '';
      return `Rewrite the following text (${inputWordCount} words) with authentic human voice and natural phrasing${tonePart}. Maintain paragraph structure, preserve all facts, and return only the rewritten text:\n\n${request.text}`;
    }

    return `Rewrite the following text (${inputWordCount} words) with high fluency and precision. Maintain paragraph structure, preserve all facts, and return only the rewritten text:\n\n${request.text}`;
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

    if (mode === 'humanize' && customInstruction) {
      return `${template}\n\nSPECIFIC TONE DIRECTIVE:\n${customInstruction}`;
    }

    return template;
  }

  /**
   * Get transformation intensity instruction based on level (1 to 4)
   *
   * Level 1 (Light): Subtle polish; high lexical preservation; minor phrasing tweaks.
   * Level 2 (Balanced): Balanced rewrite; standard clause reordering; natural vocabulary adjustments.
   * Level 3 (High): Deep structural reconstruction; clause inversion, voice shifts, sentence splitting/merging.
   * Level 4 (Max): Deep independent recast; maximum syntactic freedom while strictly preserving core facts and entities.
   */
  private getSynonymLevelInstruction(level: number): string {
    const instructions = {
      1: `TRANSFORMATION INTENSITY: Level 1 (Light / Subtle Polish)
- Purpose: Light editorial polish with minimal disruption.
- Architecture: Keep original sentence structures and clause orders largely intact.
- Phrasing: Make subtle, selective word choices and gentle phrasing improvements where needed.
- Result: High original text retention with clean, natural flow.`,

      2: `TRANSFORMATION INTENSITY: Level 2 (Balanced / Moderate Rewrite)
- Purpose: A balanced, natural rewrite with moderate structural and vocabulary change.
- Architecture: Reorder dependent and independent clauses where it improves rhythm; shift prepositional or adverbial openers naturally.
- Phrasing: Rephrase key verbs, nouns, and modifying phrases with natural synonyms, keeping technical terms intact.
- Result: A well-balanced blend of original phrasing, fresh vocabulary, and reorganized sentence elements.`,

      3: `TRANSFORMATION INTENSITY: Level 3 (High / Deep Structural Reconstruction)
- Purpose: Deep structural transformation without turning into a thesaurus swap.
- Architecture: Substantially reconstruct sentence blueprints. Reorder clauses, shift between active and passive constructions, front trailing modifiers, and split long sentences or merge related short ones.
- Phrasing: Frame concepts using fresh, natural phrasing rather than mechanical word-for-word substitution.
- Result: Significant structural and syntactic movement with substantially altered sentence architecture, while keeping all facts, figures, and entities strictly accurate.`,

      4: `TRANSFORMATION INTENSITY: Level 4 (Max / Deep Independent Recast)
- Purpose: A thorough, independent rewrite that expresses the exact same core meaning through entirely reconstructed syntax.
- Architecture: Re-envision the text from the ground up. You have full freedom to recast clause hierarchies, alter sentence order within paragraphs, split or unite ideas, and change grammatical voice throughout.
- Phrasing: Do NOT perform mechanical thesaurus swaps. Instead, state the author's ideas in your own natural, authoritative words using fluent, idiomatic English.
- Result: A deeply transformed, authentic piece of writing that shares zero structural monotony with the original, while strictly preserving every single fact, number, date, entity, and citation.`,
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
      natural: 'Make the text sound authentically human, fluid, and natural while maintaining clarity.',
      casual: 'Make the text casual, conversational, and friendly.',
      professional: 'Make the text professional, polished, and naturally written.',
      academic: 'Make the text scholarly, insightful, and eloquently structured.',
      conversational: 'Make the text conversational, engaging, and personal.',
    };

    const instruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.natural;

    return `${instruction}

MANDATORY HUMAN AUTHENTICITY & ANTI-PLAGIARISM DIRECTIVES:
- Dynamic Burstiness: Intelligently mix short, punchy statements with longer, natural compound clauses.
- Authentic Voice: Avoid robotic AI formulaic transitions (eliminate "Furthermore", "Moreover", "In conclusion", "delve into", "testament to", "crucial aspect", "pivotal role").
- ANTI-PLAGIARISM PRESERVATION: Never re-introduce common web clichés, verbatim sequences, or generic internet idioms that could trip plagiarism scanners. Maintain 100% unique phrasing.
- Strict 1:1 Length Parity: Keep output length strictly proportional to the input text (within ±10%). Do NOT add background explanations, introductory remarks, or conversational filler. Return ONLY the rewritten text.

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

    return `You are a high-speed multi-source plagiarism & originality detection engine.
Evaluate the text for potential plagiarism, patchwriting, and semantic overlap against published web content, academic articles, open knowledge bases (e.g. Wikipedia), and scientific literature.

${lang}

CRITICAL: Return ONLY a valid, compact JSON object matching this schema without markdown formatting, backticks, or extra prose.

{
  "originalityScore": <0-100 integer: 100 is completely original, 0 is fully copied>,
  "plagiarismScore": <0-100 integer: 100 - originalityScore>,
  "humanScore": <0-100 integer: human authenticity score, where 100 is completely natural human and 0 is synthetic AI>,
  "riskLevel": <"safe" | "moderate" | "high">,
  "summary": "<ultra-brief 1-sentence assessment>",
  "matches": [
    {
      "sentence": "<exact sentence>",
      "type": <"exact" | "paraphrased" | "clean">,
      "similarity": <0-100 integer>,
      "sourceTitle": "<source name or empty string if clean>",
      "sourceUrl": "<real source URL or domain, or empty string if clean>",
      "explanation": "<under 6 words, or empty string if clean>"
    }
  ],
  "sources": [
    {
      "title": "<source title>",
      "url": "<url or domain>",
      "domain": "<clean domain, e.g. en.wikipedia.org, crossref.org, nature.com, arxiv.org>",
      "snippet": "<short 4-6 word matched excerpt>",
      "similarity": <0-100 integer>,
      "matchCount": <integer>
    }
  ]
}

SPEED & ACCURACY INSTRUCTIONS:
- Break text into its sentences. Keep matches compact.
- TOPICAL & COMMON KNOWLEDGE RULE: Do NOT flag general discussion of common topics (e.g. artificial intelligence, technology, healthcare, education) as plagiarism unless there is an actual verbatim 8+ word sequence copied from a specific published paper or website.
- Label original phrasing, humanized flow, or standard speech as "clean" (similarity 0-5%). For "clean", explanation, sourceTitle, and sourceUrl MUST be empty strings "".
- Label close verbatim copying (8+ word identical sequence) as "exact" (similarity 75-100%).
- Label heavy patchwriting / close syntactic mimicry as "paraphrased" (similarity 30-65%).
- "sources" array: If all sentences are "clean", return []. If non-clean matches exist, provide up to 2-3 realistic matched source domains (e.g. "en.wikipedia.org", "crossref.org", "openalex.org", "arxiv.org", "sciencedirect.com", "britannica.com").
- "riskLevel": "safe" if originalityScore >= 85, "moderate" if >= 60, else "high".

CRITICAL CONSISTENCY MANDATE:
- "originalityScore" and "matches" MUST be 100% mathematically consistent:
  * If ALL sentences in "matches" are "clean", originalityScore MUST be 96-100, plagiarismScore <= 4, riskLevel "safe", and sources [].
  * If originalityScore < 85, you MUST flag at least one or more sentences as "paraphrased" or "exact". NEVER return a low score with 0 flagged sentences.
- "humanScore":
  * 85-99: Naturally written, varied sentence lengths, authentic human cadence, no repetitive AI transition words.
  * 50-84: Moderate sentence variety.
  * 10-49: Monotonous, repetitive, robotic phrasing with excessive formulaic transitions ("furthermore", "delve", "testament").

TEXT TO ANALYZE:
---
${text}
---`;
  }
}
