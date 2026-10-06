import { AIRequest, ParaphraseMode } from '@rewritebot/shared';
import { PARAPHRASE_MODES } from '@rewritebot/shared';

/**
 * Prompt templates for different modes with deep structural & syntactic variety
 */
const PROMPT_TEMPLATES: Record<ParaphraseMode, string> = {
  standard: `Rewrite the following text with balanced clause rearrangement, voice alternation, and deep syntactic restructuring while preserving all original facts and information. Invert cause-and-effect clauses, vary sentence openings and lengths for authentic human cadence, shift between active and passive constructions where natural, break 3+ word consecutive source sequences to eliminate patchwriting, and maintain strict 1:1 length parity without adding unnecessary padding, inflated synonyms, or formulaic AI connectors.`,

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

    parts.push('You are RewriteBot, an elite editorial paraphrasing and syntactic restructuring engine.');
    parts.push('');

    // Rule 1: Single output only (strictly eliminates multiple alternative paragraphs / word bloat)
    parts.push('CRITICAL OUTPUT CONSTRAINTS:');
    parts.push('1. SINGLE COHESIVE VERSION ONLY: Output exactly ONE single rewritten version of the text. Under NO circumstances should you output multiple drafts, alternative paragraphs, numbered variations, or bulleted options.');
    parts.push('2. ZERO META-TEXT: Return ONLY the rewritten text. Never include conversational preambles (e.g. "Here is the rewritten text:"), option headers, labels, or explanatory commentary.');
    parts.push('3. 100% FACTUAL PRESERVATION: Maintain all underlying facts, numbers, dates, citations (e.g. [1], [4]), and proper nouns with absolute fidelity.');
    parts.push('');

    // Rule 2: Anti-AI Detection & Burstiness Directive (Defeat GPTZero, Turnitin AI, CopyLeaks)
    parts.push('BURSTINESS & ANTI-AI DETECTION PROTOCOL (DEFEAT GPTZERO, TURNITIN AI, COPYLEAKS):');
    parts.push('1. DYNAMIC BURSTINESS (VARY SENTENCE LENGTH): Never produce sentences of uniform length. AI detectors flag text when every sentence has 18-24 words. You must alternate cadence: pair short, crisp sentences (6-12 words) with flowing compound-complex clauses (22-34 words) to replicate authentic human cognitive rhythm.');
    parts.push('2. ZERO AI DISCOURSE CLICHÉS (UNIVERSAL BAN ACROSS ALL MODES): Strictly NEVER use robotic AI transitional formulas: "Furthermore", "Moreover", "Additionally", "In conclusion", "It is crucial to note", "It is worth noting", "plays a pivotal role", "serves as a testament to", "delve into", "beacon", "realm", "tapestry", "crucial", "notably". Let clauses connect naturally through semantic flow rather than forced connectors.');
    parts.push('3. NATURAL SYNTACTIC FLOW: Vary sentence openings. Do not start multiple consecutive sentences with the subject or an adverbial participial clause.');
    parts.push('');

    // Rule 3: QuillBot-grade Structural Transformation Directive
    parts.push('QUILLBOT-GRADE STRUCTURAL RESTRUCTURING DIRECTIVE:');
    parts.push('You must actively transform the grammatical architecture and clause order of every sentence. Do NOT perform lazy 1:1 word-for-word synonym swapping into the original sentence template.');
    parts.push('- Invert clause sequence: flip cause-and-effect, conditional, and main clauses.');
    parts.push('- Shift grammatical voice (active <-> passive) and change the sentence subject where natural.');
    parts.push('- Front prepositional phrases, adverbial modifiers, or participial openers for varied sentence beginnings.');
    parts.push('- You may split dense, convoluted run-on clauses into crisp, high-impact statements, or synthesize choppy clauses into balanced compound structures.');
    parts.push('- Never reuse the identical main predicate or grammatical template across consecutive sentences.');
    parts.push('');

    // Rule 4: Zero Unnecessary Synonyms & Anti-Bloat Directive
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

    // Rule 8: Turnitin/Copyleaks Anti-Plagiarism & N-Gram Decoupling Protocol
    if (request.plagiarismGuard !== false) {
      parts.push('ANTI-PLAGIARISM & N-GRAM DECOUPLING PROTOCOL (PASS TURNITIN / COPYLEAKS 0% PLAGIARISM ON GENERATION 1):');
      parts.push('1. MAXIMUM 3-WORD N-GRAM LIMIT: Under NO circumstances should any sequence of 4 or more consecutive words from the source text appear in your output (except for isolated proper nouns or frozen terms).');
      parts.push('2. ZERO PATCHWRITING OR SENTENCE-SKELETON MIMICRY: Plagiarism detectors track grammatical templates. Never replace words while keeping the original sentence skeleton intact (e.g. do not just change "The purpose of this study is to assess..." to "This study aims to evaluate..."). You MUST alter the syntactic architecture:');
      parts.push('   - Invert sentence sequence: Lead with the research question, findings, methodology, condition, or conclusion rather than the generic introductory subject.');
      parts.push('   - Synthesize or divide clauses: Merge adjacent related ideas or split compound sentences so the original paragraph fingerprint is dissolved.');
      parts.push('3. FEW-SHOT SYNTACTIC INVERSION EXAMPLES (STUDY THESE PATTERNS):');
      parts.push('   * Source: "Because temperature was elevated, the reaction proceeded rapidly, resulting in byproduct degradation."');
      parts.push('     Inversion: "Byproduct degradation accelerated as a direct consequence of thermal increases driving rapid reaction kinetics." (Flipped effect -> condition -> cause)');
      parts.push('   * Source: "The researchers investigated 500 patients over a 12-month period to evaluate efficacy."');
      parts.push('     Inversion: "Efficacy assessments spanned 500 patient cohorts throughout a full year of structured clinical observation." (Shifted object to subject, decoupled timeline)');
      parts.push('   * Source: "In addition to dysmenorrhea, other menstrual abnormalities were also recorded during the study."');
      parts.push('     Inversion: "Broader menstrual irregularities were systematically documented alongside dysmenorrhea throughout the investigation." (Inverted list, varied passive verb)');
      parts.push('4. DECOUPLE FIXED TECHNICAL & FACTUAL ANCHORS: When names, numbers, dates, locations, or clinical terms (e.g. disease names, acronyms) must be preserved:');
      parts.push('   - Do NOT line them up in the original sequence.');
      parts.push('   - Separate them across new clauses and distinct grammatical roles so Turnitin cannot match multi-word chains.');
      parts.push('5. INVERT COMPOUND PHRASES & LISTS: Never copy multi-word lists verbatim (e.g. invert "dysmenorrhea, and other menstrual abnormalities" into "other menstrual irregularities, including dysmenorrhea"; invert "pain management techniques employed by girls" into "analgesic relief measures reported by participants").');
      parts.push('6. ZERO MEANING LOSS: Reorganizing clauses must never alter factual truth, scientific claims, or quantitative figures.');
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
      return `Shorten and condense the following text (${inputWordCount} words) into ${minWords}-${maxWords} words. Vary sentence cadence naturally, avoid AI transition clichés, and break all 3+ word source sequences to prevent patchwriting, with zero bloat:\n\n${request.text}`;
    }

    if (mode === 'expand') {
      return `Expand the following text (${inputWordCount} words) with nuanced depth while applying natural burstiness and breaking 3+ word source sequences:\n\n${request.text}`;
    }

    const minWords = Math.max(1, Math.round(inputWordCount * 0.95));
    const maxWords = Math.max(inputWordCount, Math.round(inputWordCount * 1.08));
    return `Rewrite and structurally restructure the following text (${inputWordCount} words) maintaining strict 1:1 word count parity (${minWords}-${maxWords} words). Apply authentic human burstiness (varied sentence lengths), avoid AI clichés ('Moreover', 'Additionally', etc.), zero fluff, zero bloated synonyms, and break all 3+ word source sequences to ensure 0% plagiarism and 0% AI detection:\n\n${request.text}`;
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
