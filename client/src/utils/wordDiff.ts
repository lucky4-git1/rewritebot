export interface DiffToken {
  text: string;
  type: 'unchanged' | 'changed' | 'inserted';
  originalWord?: string;
  synonyms?: string[];
}

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
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  if (!original.trim() || !modified.trim()) {
    return modified.split(/(\s+)/).map((t) => ({
      text: t,
      type: 'unchanged',
    }));
  }

  const origWords = original.toLowerCase().match(/\b[\w'-]+\b/g) || [];
  const origSet = new Set(origWords);

  // Split modified text keeping whitespace and punctuation
  const tokens = modified.split(/(\s+|[^\w\s'-]+)/);

  return tokens.map((token) => {
    // If whitespace or punctuation, return unchanged
    if (/^\s+$/.test(token) || /^[^\w\s'-]+$/.test(token) || !token) {
      return {
        text: token,
        type: 'unchanged',
      };
    }

    const cleanWord = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
    const isPresent = origSet.has(cleanWord);

    const lookupKey = cleanWord;
    const synonyms = COMMON_SYNONYMS[lookupKey] || undefined;

    if (!isPresent) {
      return {
        text: token,
        type: 'changed',
        synonyms,
      };
    }

    return {
      text: token,
      type: 'unchanged',
      synonyms: COMMON_SYNONYMS[lookupKey] || undefined,
    };
  });
}

