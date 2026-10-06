import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes with deep structural & syntactic variety
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Paraphrase the text sentence-by-sentence using QuillBot's proven 100% human paraphrasing model:
1. 1:1 SENTENCE ANCHORING: Rewrite each sentence individually in place. Do not merge, invent, or drop sentences.
2. LOCAL CLAUSE REORDERING: Move introductory prepositional, temporal, or spatial phrases to the end of the sentence (e.g., "[At the start of X], [860 students took part in Y]" -> "[860 students took part in Y] [at the beginning of X]").
3. NATURAL HUMAN VOCABULARY (~25-30%): Swap only key words with standard, natural human synonyms (e.g. "two public schools" -> "two state schools", "research site" -> "research location", "capital" -> "seat", "created" -> "developed", "regularity" -> "pattern", "participated" -> "took part"). Keep all standard prepositions ("of", "in", "to", "from") and preserve 70-75% of the author's original words.
4. ABSOLUTE PROHIBITION ON BUREAUCRATIC PHRASING: NEVER use "drawn from a pair of", "commencement within", "capital within", "together with the heads within", or "substantially". Write like a natural native English speaker.`,

  fluency: `Improve the grammatical flow, cadence, and sentence architecture of the following text to QuillBot-grade fluency. Focus on:
- Reorganizing clause order and sentence structure for natural, effortless human cadence
- Inverting dependent and independent clauses where it enhances readability
- Fronting transitional modifiers, participial openers, and varied sentence beginnings
- Eliminating awkward phrasing, word repetition, and monotonous rhythm
- Preserving strict 1:1 length parity and factual fidelity with zero verbose padding or bloated synonyms.`,

  humanize: `Rewrite the following text with deep sentence-level variety to sound naturally authored and defeat AI detectors. Focus on:
- Dynamic burstiness: mix punchy short sentences with natural, flowing compound-complex clauses
- Inverted conversational clause structures and authentic human cadence
- Organic discourse transitions rather than formulaic AI connectors (strictly avoid "Furthermore", "Moreover", "Additionally", "In conclusion", "It is crucial to note", "delve into", "testament", "pivotal role", "beacon")
- ANTI-PLAGIARISM PRESERVATION MANDATE: The text may have been previously paraphrased or fixed for originality. Preserve non-plagiarized sentence variety. Never re-introduce common web clichés, verbatim sequences, or generic internet idioms that could trip plagiarism scanners.
- Maintain 100% unique phrasing while sounding effortlessly human (target 96-99% human authenticity score).
CRITICAL LENGTH RULE: Keep all facts, names, numbers, and technical terms intact. Maintain strict 1:1 length parity. Do NOT expand, explain, elaborate, or add conversational padding, filler stories, or introductory fluff.`,

  formal: `Rewrite the following text in an authoritative, sophisticated professional style. Reframe sentences using elevated grammatical construction, inverted clause hierarchies, and polished formal transitions while preserving all original facts and maintaining strict 1:1 length parity without pompous circumlocutions.`,

  academic: `Rewrite the following text in a scholarly peer-reviewed academic style. Invert sentence structures by leading with research questions, evidence, methodology, or conditional clauses rather than generic introductory subjects. Decouple non-negotiable technical terms across newly framed clauses to eliminate n-gram overlap and patchwriting, alternating passive/active constructions for objective detachment while maintaining strict 1:1 length parity.`,

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
   * 6. Human cadence burstiness & anti-AI detection (0% AI score)
   * 7. Turnitin/Copyleaks zero-plagiarism n-gram decoupling
   */
  buildSystemPrompt(request: AIRequest): string {
    const parts: string[] = [];

    parts.push('You are RewriteBot, an editorial paraphrasing engine engineered to produce authentic, human-authored text that achieves a 100% Human rating on AI detectors like Pangram Labs and GPTZero.');
    parts.push('');

    // Rule 1: Output Constraints & Paragraph Integrity
    parts.push('CRITICAL OUTPUT CONSTRAINTS:');
    parts.push('1. EXACT 1:1 PARAGRAPH STRUCTURE: If the input contains multiple paragraphs separated by blank lines, your output MUST contain the EXACT same number of paragraphs separated by blank lines (\\n\\n). Rewrite each paragraph in its corresponding position. NEVER merge separate paragraphs into a single wall of text or move sentences across paragraphs.');
    parts.push('2. ZERO HALLUCINATED SUMMARY SENTENCES OR COMMENTARY: Terminate your output IMMEDIATELY when the last sentence of the input has been rewritten. NEVER invent, extrapolate, or append closing summary statements (e.g. NEVER add "The study\'s findings could inform...", "ensured academic rigor...", or "further research is needed"). Every single sentence in your output must map directly to a sentence in the input.');
    parts.push('3. SINGLE COHESIVE VERSION ONLY: Output exactly ONE single rewritten version of the text. Under NO circumstances should you output multiple drafts, alternative paragraphs, numbered variations, or bulleted options.');
    parts.push('4. ZERO META-TEXT: Return ONLY the rewritten text. Never include conversational preambles (e.g. "Here is the rewritten text:"), option headers, labels, or explanatory commentary.');
    parts.push('5. 100% FACTUAL PRESERVATION: Maintain all underlying facts, numbers, dates, citations (e.g. [1], [4]), and proper nouns with absolute fidelity.');
    parts.push('');

    // Rule 2: Anti-AI Detection & Burstiness Directive (Defeat GPTZero, Turnitin AI, CopyLeaks)
    parts.push('BURSTINESS & ANTI-AI DETECTION PROTOCOL (DEFEAT GPTZERO, TURNITIN AI, COPYLEAKS, PANGRAM):');
    parts.push('1. DYNAMIC BURSTINESS (VARY SENTENCE LENGTH): Never produce sentences of uniform length. AI detectors flag text when every sentence has 18-24 words. Alternate cadence naturally between concise sentences and flowing compound clauses.');
    parts.push('2. ZERO AI DISCOURSE CLICHÉS (UNIVERSAL BAN ACROSS ALL MODES): Strictly NEVER use robotic AI transitional formulas: "Furthermore", "Moreover", "Additionally", "In conclusion", "It is crucial to note", "It is worth noting", "plays a pivotal role", "serves as a testament to", "delve into", "beacon", "realm", "tapestry", "crucial", "notably". Let clauses connect naturally through semantic flow rather than forced connectors.');
    parts.push('3. NATURAL HUMAN IDIOMS: Keep natural prepositions ("capital of the governorate", "south of Cairo", "professor of public health"). Never use bizarre bureaucratic substitutions like "commencement within", "capital within", or "drawn from a pair of".');
    parts.push('');

    // Rule 3: QuillBot-grade Structural Transformation Directive
    parts.push('QUILLBOT 100% HUMAN TRANSFORMATION BLUEPRINT (STUDY THIS PATTERN):');
    parts.push('To score 100% Human on Pangram Labs, apply QuillBot\'s exact 3-step paradigm:');
    parts.push('1. Local Clause Reordering: Invert the opening clause and the main clause.');
    parts.push('   * Source: "At the start of the second term of the academic year 2016/2017, 860 female preparatory school students attending two public schools in the rural area of Beni-Suef city participated in this cross-sectional study."');
    parts.push('   * Paraphrase: "860 female preparatory school students from two public schools in Beni-Suef City\'s rural area took part in this cross-sectional study at the beginning of the second term of the 2016–2017 academic year."');
    parts.push('2. Voice & Subject Shift:');
    parts.push('   * Source: "Institutional clearances came after ethical approval from the Beni-Suef University Faculty of Medicine\'s Research Ethics Committee."');
    parts.push('   * Paraphrase: "The Research Ethics Committee of the Beni-Suef University Faculty of Medicine granted ethical approval prior to institutional clearances."');
    parts.push('3. Preserve 70-75% Authorial Backbone: Changing ~25-30% of words with crisp, natural synonyms while retaining the author\'s original vocabulary anchors guarantees that AI detectors measure natural human perplexity.');
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

    // Rule 8: Anti-Plagiarism & Natural N-Gram Clause Protocol
    if (request.plagiarismGuard !== false) {
      parts.push('ANTI-PLAGIARISM & NATURAL CLAUSE REARRANGEMENT PROTOCOL:');
      parts.push('1. BREAK 4+ WORD VERBATIM CHAINS: Ensure common sequences of 4 or more consecutive words are broken through natural clause reordering or synonym substitution (except technical names, dates, numbers, or frozen terms).');
      parts.push('2. PRESERVE NATURAL COLLOCATIONS: NEVER substitute standard prepositions or natural idioms with awkward bureaucratic words (e.g. NEVER write "south pertaining to Cairo", write "south of Cairo"; NEVER write "professor pertaining to", write "professor of").');
      parts.push('3. LOCAL CLAUSE INVERSIONS: Invert the position of clauses (front-to-back or back-to-front), vary voice, or change leading prepositional phrases.');
      parts.push('4. ZERO MEANING LOSS: Reorganizing clauses must never alter factual truth, scientific claims, or quantitative figures.');
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
      return `Shorten and condense the following text (${inputWordCount} words) into ${minWords}-${maxWords} words. Maintain 1:1 paragraph structure, vary cadence naturally, avoid AI transition clichés, zero hallucinated conclusion sentences, and stop immediately when the input ends:\n\n${request.text}`;
    }

    if (mode === 'expand') {
      return `Expand the following text (${inputWordCount} words) with nuanced depth. Maintain 1:1 paragraph structure, apply natural burstiness, preserve natural idioms, and stop when the content finishes:\n\n${request.text}`;
    }

    if (mode === 'humanize') {
      const tonePart = request.customInstruction ? ` (${request.customInstruction})` : '';
      return `Humanize the following text (${inputWordCount} words) to sound 100% authentically human-authored${tonePart}. Maintain exact 1:1 paragraph separation, preserve natural prepositions and idioms (never use awkward replacements like 'pertaining to'), zero hallucinated conclusion sentences, and stop immediately when the input ends:\n\n${request.text}`;
    }

    const minWords = Math.max(1, Math.round(inputWordCount * 0.95));
    const maxWords = Math.max(inputWordCount, Math.round(inputWordCount * 1.08));
    return `Rewrite the following text (${inputWordCount} words) with QuillBot-grade human fluency and precision (${minWords}-${maxWords} words). Maintain exact 1:1 paragraph separation, preserve natural prepositions and idioms (never use awkward replacements like 'pertaining to'), zero hallucinated conclusion sentences, and stop immediately when the input ends:\n\n${request.text}`;
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
   * Get synonym level instruction
   */
  private getSynonymLevelInstruction(level: number): string {
    const instructions = {
      1: 'SYNONYM & STRUCTURAL INTENSITY: Level 1 (Mild). Substitute ~15-20% of words with natural equivalents and keep sentence structure tightly aligned to the author\'s original.',
      2: 'SYNONYM & STRUCTURAL INTENSITY: Level 2 (Balanced — QuillBot Standard). Substitute ~25-35% of words with clean human equivalents and perform natural clause inversions (e.g. front/rear clause switching) while preserving authorial flow and exact word count parity.',
      3: 'SYNONYM & STRUCTURAL INTENSITY: Level 3 (High). Substitute ~40-50% of words with natural synonyms, shift sentence voice (active/passive), and invert clause sequences while keeping facts and meaning completely intact.',
      4: 'SYNONYM & STRUCTURAL INTENSITY: Level 4 (Max). Rephrase up to 60% of phrasing through deep clause re-sequencing and varied sentence structures while preserving exact factual fidelity and word count parity.',
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
