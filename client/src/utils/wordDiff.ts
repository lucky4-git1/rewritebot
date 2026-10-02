export const COMMON_SYNONYMS: Record<string, string[]> = {
  important: ['crucial', 'essential', 'vital', 'significant', 'critical', 'paramount'],
  vital: ['essential', 'crucial', 'indispensable', 'key', 'fundamental'],
  crucial: ['vital', 'critical', 'essential', 'pivotal', 'decisive'],
  essential: ['vital', 'necessary', 'fundamental', 'integral', 'required'],
  significant: ['meaningful', 'notable', 'substantial', 'considerable', 'momentous'],
  critical: ['essential', 'urgent', 'decisive', 'pivotal', 'crucial'],
  transform: ['reshape', 'revolutionize', 'alter', 'modernize', 'convert'],
  transforming: ['reshaping', 'revolutionizing', 'altering', 'modernizing', 'overhauling'],
  transformed: ['altered', 'reshaped', 'revolutionized', 'converted', 'modernized'],
  reshaping: ['transforming', 'redefining', 'remodeling', 'adapting'],
  modern: ['contemporary', 'current', 'state-of-the-art', 'present-day', 'advanced'],
  contemporary: ['modern', 'current', 'present-day', 'current-era'],
  artificial: ['synthetic', 'machine-based', 'automated', 'computational'],
  intelligence: ['cognition', 'intellect', 'smart systems', 'reasoning'],
  tasks: ['activities', 'responsibilities', 'duties', 'operations', 'functions'],
  routine: ['repetitive', 'standard', 'regular', 'habitual', 'ordinary'],
  repetitive: ['routine', 'monotonous', 'recurring', 'cyclical', 'tedious'],
  developers: ['engineers', 'programmers', 'software creators', 'architects'],
  engineers: ['developers', 'creators', 'architects', 'technologists'],
  automating: ['streamlining', 'mechanizing', 'digitizing', 'optimizing'],
  automate: ['streamline', 'mechanize', 'digitize', 'systematize'],
  concentrate: ['focus', 'center', 'deliberate', 'direct attention'],
  focus: ['concentrate', 'target', 'center', 'prioritize', 'zero in'],
  education: ['learning', 'instruction', 'schooling', 'training', 'scholarship'],
  driving: ['fueling', 'propelling', 'accelerating', 'fostering', 'spurring'],
  innovation: ['invention', 'modernization', 'breakthroughs', 'novelty', 'advancement'],
  growth: ['development', 'expansion', 'progress', 'prosperity', 'enhancement'],
  economic: ['financial', 'fiscal', 'monetary', 'commercial'],
  fast: ['rapid', 'swift', 'quick', 'speedy', 'brisk'],
  slow: ['sluggish', 'gradual', 'leisurely', 'unhurried'],
  improve: ['enhance', 'elevate', 'upgrade', 'refine', 'boost'],
  improving: ['enhancing', 'elevating', 'refining', 'advancing', 'boosting'],
  improved: ['enhanced', 'elevated', 'refined', 'upgraded', 'boosted'],
  enhance: ['improve', 'boost', 'strengthen', 'amplify', 'magnify'],
  create: ['produce', 'generate', 'craft', 'build', 'develop'],
  creating: ['producing', 'generating', 'crafting', 'building', 'authoring'],
  created: ['produced', 'generated', 'crafted', 'built', 'developed'],
  help: ['assist', 'support', 'aid', 'facilitate', 'empower'],
  helps: ['assists', 'supports', 'aids', 'facilitates', 'empowers'],
  helping: ['assisting', 'supporting', 'aiding', 'facilitating'],
  make: ['craft', 'construct', 'formulate', 'produce', 'generate'],
  makes: ['produces', 'renders', 'crafts', 'establishes'],
  making: ['crafting', 'producing', 'rendering', 'generating'],
  show: ['demonstrate', 'reveal', 'illustrate', 'display', 'indicate'],
  shows: ['demonstrates', 'reveals', 'illustrates', 'indicates', 'exhibits'],
  showing: ['demonstrating', 'revealing', 'illustrating', 'indicating'],
  demonstrate: ['illustrate', 'show', 'prove', 'exhibit', 'evince'],
  use: ['utilize', 'employ', 'leverage', 'apply', 'adopt'],
  uses: ['utilizes', 'employs', 'leverages', 'applies'],
  using: ['utilizing', 'employing', 'leveraging', 'applying', 'adopting'],
  utilized: ['employed', 'applied', 'leveraged', 'used'],
  provide: ['offer', 'furnish', 'supply', 'deliver', 'present'],
  provides: ['offers', 'furnishes', 'delivers', 'supplies', 'presents'],
  providing: ['offering', 'furnishing', 'supplying', 'delivering'],
  increase: ['expand', 'boost', 'raise', 'escalate', 'elevate'],
  increasing: ['boosting', 'escalating', 'raising', 'amplifying'],
  decrease: ['reduce', 'diminish', 'curb', 'lessen', 'lower'],
  reducing: ['lowering', 'diminishing', 'curbing', 'lessening'],
  effective: ['efficacious', 'potent', 'impactful', 'successful', 'efficient'],
  efficient: ['streamlined', 'effective', 'productive', 'optimal'],
  complex: ['intricate', 'elaborate', 'sophisticated', 'multifaceted'],
  simple: ['straightforward', 'uncomplicated', 'accessible', 'elementary'],
  clear: ['lucid', 'evident', 'apparent', 'unambiguous', 'distinct'],
  great: ['exceptional', 'tremendous', 'outstanding', 'remarkable', 'superb'],
  good: ['favorable', 'beneficial', 'advantageous', 'sound', 'valuable'],
  bad: ['detrimental', 'adverse', 'unfavorable', 'harmful', 'suboptimal'],
  big: ['substantial', 'immense', 'massive', 'extensive', 'considerable'],
  small: ['modest', 'minimal', 'compact', 'minor', 'limited'],
  change: ['modify', 'alter', 'adjust', 'revise', 'transform'],
  changing: ['modifying', 'altering', 'adjusting', 'shifting'],
  changed: ['modified', 'altered', 'adjusted', 'revised'],
  allow: ['permit', 'enable', 'authorize', 'empower'],
  allows: ['permits', 'enables', 'authorizes', 'empowers'],
  allowing: ['permitting', 'enabling', 'facilitating'],
  require: ['demand', 'necessitate', 'mandate', 'call for'],
  requires: ['demands', 'necessitates', 'mandates'],
  requiring: ['demanding', 'necessitating'],
  analyze: ['examine', 'investigate', 'scrutinize', 'evaluate', 'assess'],
  analyzing: ['examining', 'investigating', 'evaluating', 'assessing'],
  ensure: ['guarantee', 'assure', 'verify', 'confirm', 'safeguard'],
  ensures: ['guarantees', 'secures', 'safeguards', 'confirms'],
  achieve: ['attain', 'accomplish', 'realize', 'fulfill'],
  achieved: ['attained', 'accomplished', 'realized', 'fulfilled'],
  different: ['distinct', 'diverse', 'disparate', 'alternative', 'varied'],
  similar: ['analogous', 'comparable', 'equivalent', 'related'],
  problem: ['dilemma', 'challenge', 'issue', 'obstacle', 'complication'],
  solution: ['remedy', 'resolution', 'answer', 'countermeasure'],
  result: ['outcome', 'consequence', 'effect', 'finding'],
  results: ['outcomes', 'consequences', 'findings', 'repercussions'],
  strategy: ['approach', 'tactic', 'methodology', 'plan'],
  method: ['technique', 'procedure', 'approach', 'manner'],
  system: ['framework', 'mechanism', 'structure', 'architecture'],
  idea: ['concept', 'notion', 'conception', 'perspective'],
  accurate: ['precise', 'exact', 'correct', 'flawless', 'faithful'],
  original: ['authentic', 'unique', 'novel', 'unprecedented'],
};

// In-memory cache for ultra-fast repeated lookups
const synonymCache = new Map<string, string[]>();

/**
 * Fetch high-quality alternative synonyms for any word dynamically.
 * Combines local static dictionary with fast Datamuse API lookup.
 */
export async function lookupSynonyms(word: string): Promise<string[]> {
  const clean = word.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (!clean || clean.length < 2) return [];

  // Check cache first
  if (synonymCache.has(clean)) {
    return synonymCache.get(clean)!;
  }

  const results: string[] = [];

  // 1. Check local static dictionary first for immediate matches
  if (COMMON_SYNONYMS[clean]) {
    results.push(...COMMON_SYNONYMS[clean]);
  }

  // 2. Fetch from Datamuse for rich, dynamic contextual synonyms
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const [relRes, mlRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(clean)}&max=8`, {
        signal: controller.signal,
      }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      results.length < 4
        ? fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(clean)}&max=6`, {
            signal: controller.signal,
          }).then((r) => (r.ok ? r.json() : [])).catch(() => [])
        : Promise.resolve([]),
    ]);

    clearTimeout(timeoutId);

    const apiSynonyms: string[] = [
      ...((Array.isArray(relRes) ? relRes : []).map((item: any) => item.word?.toLowerCase())),
      ...((Array.isArray(mlRes) ? mlRes : []).map((item: any) => item.word?.toLowerCase())),
    ].filter(Boolean);

    for (const s of apiSynonyms) {
      if (s !== clean && !s.includes('_') && !s.includes('-') && !results.includes(s)) {
        results.push(s);
      }
    }
  } catch (err) {
    // Offline or network error: gracefully rely on local dictionary
  }

  // Filter out the word itself and limit to top 8 distinct synonyms
  const finalSynonyms = Array.from(new Set(results)).filter((w) => w !== clean).slice(0, 8);
  synonymCache.set(clean, finalSynonyms);
  return finalSynonyms;
}

/**
 * Tokenize text into words and punctuation
 */
export interface DiffToken {
  text: string;
  type: 'changed' | 'structural' | 'longest-unchanged' | 'unchanged';
  originalWord?: string;
  synonyms?: string[];
}

const STRUCTURAL_MARKERS = new Set([
  // Discourse transitions & logical conjunctions
  'furthermore', 'moreover', 'however', 'although', 'whereas', 'consequently',
  'therefore', 'nevertheless', 'nonetheless', 'meanwhile', 'subsequently',
  'accordingly', 'conversely', 'incidentally', 'specifically', 'namely',
  'similarly', 'likewise', 'instead', 'otherwise', 'hence', 'thus',
  'whereby', 'wherein', 'whereupon', 'inasmuch', 'notwithstanding',
  'because', 'since', 'while', 'whilst', 'unless', 'though',
  'despite', 'regarding', 'concerning', 'provided', 'assuming',
  'leading', 'resulting', 'causing', 'enabling', 'allowing',
  'which', 'whose', 'where', 'thereby',

  // Syntactic prepositions & relational binders
  'through', 'throughout', 'across', 'within', 'along', 'amid', 'amidst',
  'via', 'among', 'between', 'against', 'towards', 'upon', 'onto',
  'beyond', 'besides', 'except',

  // Passive voice & grammatical restructuring auxiliaries
  'was', 'were', 'been', 'being', 'having',
  'by', 'became', 'become', 'served', 'acted'
]);

// Multi-word structural clause patterns (connective, passive, relational, subordinating)
const MULTI_WORD_STRUCTURAL_PHRASES = [
  'in order to', 'as a result of', 'as a consequence of', 'as a means of',
  'which now', 'which subsequently', 'which in turn', 'that in turn',
  'leading to', 'resulting in', 'causing a', 'due to the', 'owing to the',
  'by means of', 'with respect to', 'with regard to', 'with the aim of',
  'on the basis of', 'in light of', 'in terms of', 'in comparison with',
  'in contrast to', 'as opposed to', 'rather than', 'as well as',
  'it is evident that', 'it has been', 'has been shown to', 'can be attributed to',
  'is characterized by', 'are characterized by', 'was characterized by', 'were characterized by',
  'has been', 'have been', 'had been', 'was being', 'were being',
  'is being', 'are being', 'will be', 'would be', 'could be', 'should be',
  'serves as', 'served as', 'acts as', 'acted as', 'functions as'
];

/**
 * Tokenize text into words and punctuation with QuillBot-style 3-color diffing:
 * - 🟡 changed: Vocabulary / synonym replacement
 * - 🔵 longest-unchanged: Verbatim preserved multi-word sequences (>= 2 words) from original
 * - 🔴 structural: Syntactic rearrangement, clause inversion, voice alternation, multi-word structural shifts
 * - unchanged: Neutral isolated punctuation & preserved words
 */
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  if (!original.trim() || !modified.trim()) {
    return modified.split(/(\s+)/).map((t) => ({
      text: t,
      type: 'unchanged',
    }));
  }

  const origWords = original.toLowerCase().match(/\b[\w'-]+\b/g) || [];
  const origSet = new Set(origWords);
  const origWordString = ' ' + origWords.join(' ') + ' ';

  // Map each original word to its relative positions (0.0 to 1.0)
  const origWordPositions = new Map<string, number[]>();
  origWords.forEach((w, i) => {
    const list = origWordPositions.get(w) || [];
    list.push(origWords.length > 1 ? i / (origWords.length - 1) : 0);
    origWordPositions.set(w, list);
  });

  // Split modified text keeping whitespace and punctuation
  const tokens = modified.split(/(\s+|[^\w\s'-]+)/);

  // Extract clean word tokens with their indices
  interface WordInfo {
    tokenIndex: number;
    wordOrderIndex: number;
    clean: string;
  }
  const wordTokens: WordInfo[] = [];

  let wordCount = 0;
  tokens.forEach((token, index) => {
    if (!/^\s+$/.test(token) && !/^[^\w\s'-]+$/.test(token) && token) {
      const clean = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
      if (clean) {
        wordTokens.push({ tokenIndex: index, wordOrderIndex: wordCount++, clean });
      }
    }
  });

  // 1. Identify Longest Unchanged Sequences (🔵 Blue)
  // Continuous sequences of 2 or more words that appear identically in the original
  const longestUnchangedTokens = new Set<number>();

  for (let i = 0; i < wordTokens.length; i++) {
    for (let len = 6; len >= 2; len--) {
      if (i + len <= wordTokens.length) {
        const slice = wordTokens.slice(i, i + len);
        const phrase = ' ' + slice.map((w) => w.clean).join(' ') + ' ';
        if (origWordString.includes(phrase)) {
          for (let k = 0; k < len; k++) {
            longestUnchangedTokens.add(wordTokens[i + k].tokenIndex);
          }
          break;
        }
      }
    }
  }

  // 2. Identify Clause-Level Structural Shifts (🔴 Red)
  // Candidate structural tokens: must form multi-token cohesive clauses/phrases
  const candidateStructuralWordIndices = new Set<number>();

  // A. Multi-word phrase matches (e.g. "in order to", "has been", "leading to", "which now")
  MULTI_WORD_STRUCTURAL_PHRASES.forEach((pattern) => {
    const patternWords = pattern.split(' ');
    const pLen = patternWords.length;
    for (let i = 0; i <= wordTokens.length - pLen; i++) {
      let matches = true;
      for (let k = 0; k < pLen; k++) {
        if (wordTokens[i + k].clean !== patternWords[k]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        // Only mark if NOT already part of a blue (longest unchanged) sequence
        for (let k = 0; k < pLen; k++) {
          if (!longestUnchangedTokens.has(wordTokens[i + k].tokenIndex)) {
            candidateStructuralWordIndices.add(i + k);
          }
        }
      }
    }
  });

  // B. Relocated Clause Detection (Significant word displacement across clauses)
  // When words moved >= 28% across document flow (e.g. clause inversion / voice change)
  if (wordTokens.length > 3 && origWords.length > 3) {
    const relocatedIndices: number[] = [];
    for (let i = 0; i < wordTokens.length; i++) {
      const wt = wordTokens[i];
      if (longestUnchangedTokens.has(wt.tokenIndex)) continue;

      if (origSet.has(wt.clean)) {
        const currentRatio = wt.wordOrderIndex / (wordTokens.length - 1);
        const originalPositions = origWordPositions.get(wt.clean) || [];
        const minDistance = Math.min(...originalPositions.map((pos) => Math.abs(pos - currentRatio)));
        if (minDistance >= 0.28) {
          relocatedIndices.push(i);
        }
      }
    }

    // Only clusters of relocated words (>= 2 relocated words or relocated word adjacent to structural marker)
    relocatedIndices.forEach((idx) => {
      const hasAdjacentRelocated =
        relocatedIndices.includes(idx - 1) ||
        relocatedIndices.includes(idx + 1) ||
        (idx > 0 && STRUCTURAL_MARKERS.has(wordTokens[idx - 1].clean)) ||
        (idx < wordTokens.length - 1 && STRUCTURAL_MARKERS.has(wordTokens[idx + 1].clean));

      if (hasAdjacentRelocated) {
        candidateStructuralWordIndices.add(idx);
        // Include the adjacent structural marker in the phrase
        if (idx > 0 && STRUCTURAL_MARKERS.has(wordTokens[idx - 1].clean)) {
          candidateStructuralWordIndices.add(idx - 1);
        }
        if (idx < wordTokens.length - 1 && STRUCTURAL_MARKERS.has(wordTokens[idx + 1].clean)) {
          candidateStructuralWordIndices.add(idx + 1);
        }
      }
    });
  }

  // C. Passive Voice Predicate Restructuring ([auxiliary] [adverb]? [participle] [by]?)
  // e.g. "was reshaped by", "has been fundamentally altered by", "is transformed into"
  const AUXILIARIES = new Set(['is', 'are', 'was', 'were', 'been', 'being', 'has', 'have', 'had', 'be', 'become']);
  for (let i = 0; i < wordTokens.length - 1; i++) {
    const current = wordTokens[i].clean;
    if (AUXILIARIES.has(current) && !longestUnchangedTokens.has(wordTokens[i].tokenIndex)) {
      // Check next 1-3 words for past participle / passive construction
      for (let span = 1; span <= 3 && i + span < wordTokens.length; span++) {
        const nextWord = wordTokens[i + span].clean;
        const isParticiple = /ed$|en$|wn$|pt$|ld$|ne$/.test(nextWord) || ['made', 'built', 'drawn', 'sent', 'set', 'run', 'spent'].includes(nextWord);
        if (isParticiple) {
          // Check if followed by agent preposition ('by', 'via', 'through')
          const hasAgentPrep =
            i + span + 1 < wordTokens.length &&
            ['by', 'via', 'through'].includes(wordTokens[i + span + 1].clean);
          const endSpan = hasAgentPrep ? span + 1 : span;

          for (let k = 0; k <= endSpan; k++) {
            if (!longestUnchangedTokens.has(wordTokens[i + k].tokenIndex)) {
              candidateStructuralWordIndices.add(i + k);
            }
          }
          break;
        }
      }
    }
  }

  // 3. Clause Smoothing & Bridge Pass:
  // If structural tokens are separated by only 1 changed word (e.g. "has been" + "profoundly" + "reshaped by"),
  // merge the entire clause into a single unified structural change
  for (let i = 0; i < wordTokens.length - 2; i++) {
    if (
      candidateStructuralWordIndices.has(i) &&
      candidateStructuralWordIndices.has(i + 2) &&
      !longestUnchangedTokens.has(wordTokens[i + 1].tokenIndex)
    ) {
      candidateStructuralWordIndices.add(i + 1);
    }
  }

  // 4. Strict Anti-Fragmentation Rule:
  // An isolated single word MUST NEVER remain red!
  // In QuillBot, "Structural Changes" strictly represents contiguous clauses / phrases (length >= 2).
  const finalStructuralTokenIndices = new Set<number>();
  for (let i = 0; i < wordTokens.length; i++) {
    if (candidateStructuralWordIndices.has(i)) {
      const hasNeighbor =
        (i > 0 && candidateStructuralWordIndices.has(i - 1)) ||
        (i < wordTokens.length - 1 && candidateStructuralWordIndices.has(i + 1));

      if (hasNeighbor) {
        finalStructuralTokenIndices.add(wordTokens[i].tokenIndex);
      }
    }
  }

  // 5. Final Token Classification
  return tokens.map((token, index) => {
    // If whitespace or punctuation, return unchanged
    if (/^\s+$/.test(token) || /^[^\w\s'-]+$/.test(token) || !token) {
      return {
        text: token,
        type: 'unchanged',
      };
    }

    const cleanWord = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
    const isPresentInOriginal = origSet.has(cleanWord);
    const lookupKey = cleanWord;
    const synonyms = COMMON_SYNONYMS[lookupKey] || undefined;

    // 1. 🔵 Longest Unchanged Words (preserved multi-word sequences >= 2)
    if (longestUnchangedTokens.has(index)) {
      return {
        text: token,
        type: 'longest-unchanged',
        synonyms,
      };
    }

    // 2. 🔴 Structural Changes (Clause-level syntactic shift, clause inversion, voice alternation >= 2 words)
    if (finalStructuralTokenIndices.has(index)) {
      return {
        text: token,
        type: 'structural',
        synonyms,
      };
    }

    // 3. 🟡 Changed Words (lexical / synonym replacement)
    if (!isPresentInOriginal) {
      return {
        text: token,
        type: 'changed',
        synonyms,
      };
    }

    // 4. Default neutral unchanged word (present in original, not part of blue/red/yellow blocks)
    return {
      text: token,
      type: 'unchanged',
      synonyms,
    };
  });
}



