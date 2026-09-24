export interface DiffToken {
  text: string;
  type: 'unchanged' | 'changed' | 'inserted';
  originalWord?: string;
  synonyms?: string[];
}

const COMMON_SYNONYMS: Record<string, string[]> = {
  important: ['crucial', 'essential', 'vital', 'significant', 'critical', 'paramount'],
  vital: ['essential', 'crucial', 'indispensable', 'key', 'fundamental'],
  crucial: ['vital', 'critical', 'essential', 'pivotal', 'decisive'],
  essential: ['vital', 'necessary', 'fundamental', 'integral', 'required'],
  transform: ['reshape', 'revolutionize', 'alter', 'modernize', 'convert'],
  transforming: ['reshaping', 'revolutionizing', 'altering', 'modernizing', 'overhauling'],
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
  enhance: ['improve', 'boost', 'strengthen', 'amplify', 'magnify'],
  create: ['produce', 'generate', 'craft', 'build', 'develop'],
  help: ['assist', 'support', 'aid', 'facilitate', 'empower'],
};

/**
 * Tokenize text into words and punctuation
 */
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  if (!original.trim() || !modified.trim()) {
    return modified.split(/(\s+)/).map(t => ({
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
