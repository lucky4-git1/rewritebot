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
  'serves as', 'served as', 'acts as', 'acted as', 'functions as',
  'at the start of', 'during the', 'prior to', 'following the', 'along with',
  'in addition to', 'was conducted', 'were conducted', 'was performed', 'were performed',
  'was documented', 'were documented', 'was recorded', 'were recorded',
  'took part in', 'taking part in', 'taken part in', 'participated in',
  'how common', 'relationship to', 'relationship between', 'sources of knowledge',
  'conducted with', 'performed on', 'aimed at', 'associated with',
  'in relation to', 'in an effort to', 'with the goal of', 'designed to', 'intended to'
];

const FUNCTION_AND_SYNTAX_WORDS = new Set([
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'of', 'into', 'onto', 'upon',
  'about', 'through', 'throughout', 'between', 'among', 'during', 'under', 'over', 'as',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'which', 'who', 'whom', 'whose',
  'and', 'or', 'nor', 'but', 'so', 'while', 'where', 'when', 'how', 'its', 'their', 'our'
]);

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

  // Extract sentences from original text
  const origSentences = original.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim().length > 0);
  const origSentenceWordLists = origSentences.map((s) => s.toLowerCase().match(/\b[\w'-]+\b/g) || []);

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

  // Map each modified word to its sentence index and position
  let currentSentenceIndex = 0;
  let runningSentenceWords: number[] = [];
  interface SentenceMeta {
    sentIndex: number;
    posInSent: number;
    sentLen: number;
  }
  const modWordSentenceMeta: SentenceMeta[] = [];

  for (let i = 0; i < wordTokens.length; i++) {
    runningSentenceWords.push(i);
    const nextWordTokenIndex = i < wordTokens.length - 1 ? wordTokens[i + 1].tokenIndex : tokens.length;
    const gapText = tokens.slice(wordTokens[i].tokenIndex + 1, nextWordTokenIndex).join('');

    // Check if gapText contains sentence-ending punctuation (.!? or newline)
    // Ignore decimal points within numbers
    const hasPunctuation = /[!?\n]/.test(gapText) || /\.(?!\d)/.test(gapText);
    const isEndOfSentence = hasPunctuation || i === wordTokens.length - 1;

    if (isEndOfSentence) {
      const len = runningSentenceWords.length;
      runningSentenceWords.forEach((wIdx, order) => {
        modWordSentenceMeta[wIdx] = {
          sentIndex: currentSentenceIndex,
          posInSent: len > 1 ? order / (len - 1) : 0,
          sentLen: len,
        };
      });
      runningSentenceWords = [];
      currentSentenceIndex++;
    }
  }

  // Find best matching original sentence for each modified sentence
  const bestOrigSentForModSent = new Map<number, number>();
  for (let sIdx = 0; sIdx < currentSentenceIndex; sIdx++) {
    const modSentWords = wordTokens
      .filter((_, idx) => modWordSentenceMeta[idx]?.sentIndex === sIdx)
      .map((w) => w.clean);

    let bestScore = -1;
    let bestOrigIdx = -1;
    origSentenceWordLists.forEach((origList, oIdx) => {
      let overlap = 0;
      origList.forEach((w) => {
        if (modSentWords.includes(w)) overlap++;
      });
      const score = overlap / Math.max(modSentWords.length, origList.length, 1);
      if (score > bestScore && overlap >= 2) {
        bestScore = score;
        bestOrigIdx = oIdx;
      }
    });
    if (bestOrigIdx !== -1) {
      bestOrigSentForModSent.set(sIdx, bestOrigIdx);
    }
  }

  const candidateStructuralWordIndices = new Set<number>();

  // 1. Identify Longest Unchanged Sequences (🔵 Blue)
  // Continuous sequences of 2 or more words that appear identically in the original IN THE SAME POSITION.
  // Note: Relocated or reordered phrases belong to Structural Changes (🔴 Red), not Blue!
  const longestUnchangedTokens = new Set<number>();
  for (let i = 0; i < wordTokens.length; i++) {
    for (let len = 8; len >= 2; len--) {
      if (i + len <= wordTokens.length) {
        const slice = wordTokens.slice(i, i + len);
        const phrase = ' ' + slice.map((w) => w.clean).join(' ') + ' ';

        const isPureStopWordPair = len === 2 && slice.every((w) => FUNCTION_AND_SYNTAX_WORDS.has(w.clean));
        if (isPureStopWordPair) {
          const meta = modWordSentenceMeta[i];
          if (meta && bestOrigSentForModSent.has(meta.sentIndex)) {
            const origSentIdx = bestOrigSentForModSent.get(meta.sentIndex)!;
            const origSentStr = ' ' + origSentenceWordLists[origSentIdx].join(' ') + ' ';
            if (origSentStr.includes(phrase)) {
              for (let k = 0; k < len; k++) {
                longestUnchangedTokens.add(wordTokens[i + k].tokenIndex);
              }
              break;
            }
          }
          continue;
        }

        if (origWordString.includes(phrase)) {
          // Check if this phrase stayed in roughly the same relative position
          let isRelocatedPhrase = false;
          const meta = modWordSentenceMeta[i];
          if (meta && bestOrigSentForModSent.has(meta.sentIndex)) {
            const origSentIdx = bestOrigSentForModSent.get(meta.sentIndex)!;
            const firstWordClean = slice[0].clean;
            const origSentList = origSentenceWordLists[origSentIdx];
            const origPositions: number[] = [];
            origSentList.forEach((w, idx) => {
              if (w === firstWordClean) {
                origPositions.push(origSentList.length > 1 ? idx / (origSentList.length - 1) : 0);
              }
            });
            if (origPositions.length > 0) {
              const minDist = Math.min(...origPositions.map((pos) => Math.abs(pos - meta.posInSent)));
              if (minDist >= 0.18 && meta.sentLen >= 6) {
                isRelocatedPhrase = true;
              }
            }
          }

          if (isRelocatedPhrase) {
            // Relocated phrase! In QuillBot, rearranged/relocated phrases are RED (structural)!
            for (let k = 0; k < len; k++) {
              candidateStructuralWordIndices.add(i + k);
            }
          } else {
            for (let k = 0; k < len; k++) {
              longestUnchangedTokens.add(wordTokens[i + k].tokenIndex);
            }
          }
          break;
        }
      }
    }
  }

  // 2. Identify Clause-Level Structural Shifts (🔴 Red)

  // A. Multi-word phrase patterns
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
        for (let k = 0; k < pLen; k++) {
          if (!longestUnchangedTokens.has(wordTokens[i + k].tokenIndex)) {
            candidateStructuralWordIndices.add(i + k);
          }
        }
      }
    }
  });

  // B. Relocated Clause Detection (Intra-sentence & inter-sentence displacement)
  for (let i = 0; i < wordTokens.length; i++) {
    const wt = wordTokens[i];
    if (longestUnchangedTokens.has(wt.tokenIndex)) continue;

    const meta = modWordSentenceMeta[i];
    let isRelocated = false;

    // Check sentence-local displacement (e.g. clause fronting / inversion within sentence)
    if (meta && bestOrigSentForModSent.has(meta.sentIndex)) {
      const origSentIdx = bestOrigSentForModSent.get(meta.sentIndex)!;
      const origSentList = origSentenceWordLists[origSentIdx];
      const origLocalPositions: number[] = [];
      origSentList.forEach((w, idx) => {
        if (w === wt.clean) {
          origLocalPositions.push(origSentList.length > 1 ? idx / (origSentList.length - 1) : 0);
        }
      });
      if (origLocalPositions.length > 0) {
        const minLocalDist = Math.min(...origLocalPositions.map((pos) => Math.abs(pos - meta.posInSent)));
        if (minLocalDist >= 0.25 && meta.sentLen >= 6) {
          isRelocated = true;
        }
      }
    } else if (origSet.has(wt.clean) && wordTokens.length > 4) {
      // Unmatched sentence fallback to global document displacement
      const currentGlobalRatio = wt.wordOrderIndex / (wordTokens.length - 1);
      const originalPositions = origWordPositions.get(wt.clean) || [];
      const minGlobalDistance = Math.min(...originalPositions.map((pos) => Math.abs(pos - currentGlobalRatio)));
      if (minGlobalDistance >= 0.28) {
        isRelocated = true;
      }
    }

    if (isRelocated) {
      candidateStructuralWordIndices.add(i);
    }
  }

  // C. Passive Voice & Copular Predicate Restructuring ([auxiliary] [adverb]? [participle] [agent prep]?)
  const AUXILIARIES = new Set(['is', 'are', 'was', 'were', 'been', 'being', 'has', 'have', 'had', 'be', 'become']);
  for (let i = 0; i < wordTokens.length - 1; i++) {
    const current = wordTokens[i].clean;
    if (AUXILIARIES.has(current) && !longestUnchangedTokens.has(wordTokens[i].tokenIndex)) {
      for (let span = 1; span <= 3 && i + span < wordTokens.length; span++) {
        const nextWord = wordTokens[i + span].clean;
        const isParticiple =
          /ed$|en$|wn$|pt$|ld$|ne$/.test(nextWord) ||
          ['made', 'built', 'drawn', 'sent', 'set', 'run', 'spent', 'conducted', 'performed', 'surveyed', 'recorded'].includes(nextWord);
        if (isParticiple) {
          const hasAgentPrep =
            i + span + 1 < wordTokens.length &&
            ['by', 'via', 'through', 'with', 'in', 'on', 'from', 'among'].includes(wordTokens[i + span + 1].clean);
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

  // D. Expand structural clusters to absorb adjacent grammatical binders / prepositions
  const expanded = new Set(candidateStructuralWordIndices);
  candidateStructuralWordIndices.forEach((idx) => {
    // Look backward
    if (idx > 0 && !longestUnchangedTokens.has(wordTokens[idx - 1].tokenIndex)) {
      if (FUNCTION_AND_SYNTAX_WORDS.has(wordTokens[idx - 1].clean) || STRUCTURAL_MARKERS.has(wordTokens[idx - 1].clean)) {
        expanded.add(idx - 1);
        if (idx > 1 && !longestUnchangedTokens.has(wordTokens[idx - 2].tokenIndex)) {
          if (FUNCTION_AND_SYNTAX_WORDS.has(wordTokens[idx - 2].clean)) {
            expanded.add(idx - 2);
          }
        }
      }
    }
    // Look forward
    if (idx < wordTokens.length - 1 && !longestUnchangedTokens.has(wordTokens[idx + 1].tokenIndex)) {
      if (FUNCTION_AND_SYNTAX_WORDS.has(wordTokens[idx + 1].clean) || STRUCTURAL_MARKERS.has(wordTokens[idx + 1].clean)) {
        expanded.add(idx + 1);
        if (idx < wordTokens.length - 2 && !longestUnchangedTokens.has(wordTokens[idx + 2].tokenIndex)) {
          if (FUNCTION_AND_SYNTAX_WORDS.has(wordTokens[idx + 2].clean)) {
            expanded.add(idx + 2);
          }
        }
      }
    }
  });

  // E. Sentence-Level Structural Promotion & Clause Synthesis
  // If a sentence has undergone structural reordering (e.g. clause relocation, passive voice, or structural markers)
  // promote all modified non-blue words to the structural red block so entire clauses/sentences render in red!
  for (let sIdx = 0; sIdx < currentSentenceIndex; sIdx++) {
    const sWordIndices = wordTokens
      .map((_, idx) => idx)
      .filter((idx) => modWordSentenceMeta[idx]?.sentIndex === sIdx);

    const sStructCount = sWordIndices.filter((idx) => expanded.has(idx)).length;
    const sChangedCount = sWordIndices.filter((idx) => !origSet.has(wordTokens[idx].clean) && !longestUnchangedTokens.has(wordTokens[idx].tokenIndex)).length;
    const sNonBlueCount = sWordIndices.filter((idx) => !longestUnchangedTokens.has(wordTokens[idx].tokenIndex)).length;

    const isStructurallyRestructuredSentence = sStructCount >= 2 || (sStructCount >= 1 && sChangedCount >= 2) || (sNonBlueCount >= 3 && sStructCount >= 1);

    if (isStructurallyRestructuredSentence) {
      // In a restructured sentence, promote grammatical binders, connectives, and words adjacent to structural shifts to red,
      // but PRESERVE lexical vocabulary substitutions / synonyms as YELLOW so users can click them in the thesaurus!
      sWordIndices.forEach((idx) => {
        if (!longestUnchangedTokens.has(wordTokens[idx].tokenIndex)) {
          const clean = wordTokens[idx].clean;
          const isGrammarOrMarker = FUNCTION_AND_SYNTAX_WORDS.has(clean) || STRUCTURAL_MARKERS.has(clean);
          const hasAdjacentStructural =
            (idx > 0 && candidateStructuralWordIndices.has(idx - 1)) ||
            (idx < wordTokens.length - 1 && candidateStructuralWordIndices.has(idx + 1));

          if (isGrammarOrMarker && hasAdjacentStructural) {
            expanded.add(idx);
          }
        }
      });
    }
  }

  // F. Bridge Pass: if structural tokens in same sentence are separated by up to 3 non-blue words, bridge them!
  for (let gap = 1; gap <= 3; gap++) {
    for (let i = 0; i < wordTokens.length - (gap + 1); i++) {
      if (
        expanded.has(i) &&
        expanded.has(i + gap + 1) &&
        modWordSentenceMeta[i]?.sentIndex === modWordSentenceMeta[i + gap + 1]?.sentIndex
      ) {
        let allNonBlue = true;
        for (let g = 1; g <= gap; g++) {
          if (longestUnchangedTokens.has(wordTokens[i + g].tokenIndex)) {
            allNonBlue = false;
            break;
          }
        }
        if (allNonBlue) {
          for (let g = 1; g <= gap; g++) {
            expanded.add(i + g);
          }
        }
      }
    }
  }

  // G. Strict Anti-Fragmentation Rule: minimum 2 words in a structural group
  const finalStructuralTokenIndices = new Set<number>();
  for (let i = 0; i < wordTokens.length; i++) {
    if (expanded.has(i)) {
      const hasNeighbor =
        (i > 0 && expanded.has(i - 1)) ||
        (i < wordTokens.length - 1 && expanded.has(i + 1));

      if (hasNeighbor) {
        finalStructuralTokenIndices.add(wordTokens[i].tokenIndex);
      }
    }
  }

  // 3. Final Token Classification
  return tokens.map((token, index) => {
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

    // 4. Default neutral unchanged word
    return {
      text: token,
      type: 'unchanged',
      synonyms,
    };
  });
}



