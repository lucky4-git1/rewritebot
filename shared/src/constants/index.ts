export const PARAPHRASE_MODES = [
  'standard',
  'fluency',
  'humanize',
  'formal',
  'academic',
  'simple',
  'creative',
  'expand',
  'shorten',
  'custom',
] as const;

export const LANGUAGES = [
  { code: 'auto', name: 'Detect Language' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
] as const;

export const PROVIDER_TYPES = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  ANTHROPIC: 'anthropic',
  NVIDIA: 'nvidia',
  OPENROUTER: 'openrouter',
  DEEPSEEK: 'deepseek',
  MISTRAL: 'mistral',
  GROQ: 'groq',
  TOGETHER: 'together',
  CEREBRAS: 'cerebras',
  HUGGINGFACE: 'huggingface',
  XAI: 'xai',
  OLLAMA: 'ollama',
  LMSTUDIO: 'lmstudio',
  GENERIC: 'generic-openai',
} as const;

export const SYNONYM_LEVELS = {
  MINIMAL: 1,
  MODERATE: 2,
  HIGH: 3,
  AGGRESSIVE: 4,
} as const;

export const CITATION_STYLES = [
  'apa',
  'mla',
  'chicago',
  'harvard',
  'ieee',
  'vancouver',
] as const;

export const EXPORT_FORMATS = ['txt', 'docx', 'pdf', 'markdown'] as const;

export const MAX_INPUT_LENGTH = 50000;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEBOUNCE_AUTOSAVE_MS = 2000;
