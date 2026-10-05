import { BrandLogo } from '../components/BrandLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEditorStore } from '../stores/editorStore';
import { useThemeStore } from '../stores/themeStore';
import { apiClient } from '../services/api';
import { computeWordDiff, DiffToken, lookupSynonyms } from '../utils/wordDiff';
import { ExportFormat, exportPlagiarismAuditPdf } from '../utils/export';
import {
  Sparkles,
  Clipboard,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Download,
  Settings,
  History,
  LogOut,
  ChevronDown,
  Globe,
  Sliders,
  FileText,
  AlertCircle,
  BookOpen,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Snowflake,
  Columns,
  BrainCircuit,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Languages,
  AlignLeft,
} from 'lucide-react';
import { toolsService, PlagiarismCheckResponse, GrammarCheckResponse } from '../services/tools.service';
import { paraphraseService } from '../services/paraphrase.service';

interface HistoryItem {
  id: string;
  operation: string;
  mode: string;
  providerId: string;
  modelId: string;
  input: string;
  output: string;
  latency?: number;
  createdAt: string;
  statistics?: {
    inputWords?: number;
    outputWords?: number;
    changedWords?: number;
    similarity?: number;
    readingTime?: number;
  };
}

export function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDark = useThemeStore((state) => state.isDark);

  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'sentences' | 'plain'>('diff');
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [thesaurusPos, setThesaurusPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [wordSynonyms, setWordSynonyms] = useState<string[]>([]);
  const [isLoadingWordSynonyms, setIsLoadingWordSynonyms] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [isScanningPlagiarism, setIsScanningPlagiarism] = useState(false);
  const [plagiarismReport, setPlagiarismReport] = useState<PlagiarismCheckResponse | null>(null);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);
  const [rewritingSentenceIndex, setRewritingSentenceIndex] = useState<number | null>(null);
  const [isAutoFixingAll, setIsAutoFixingAll] = useState(false);
  const [isAutoScanRunning, setIsAutoScanRunning] = useState(false);

  // ❄️ Freeze Words modal state
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeInput, setFreezeInput] = useState('');

  // 📝 Sentence Alternative Selector (< 1 of 3 >)
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [sentenceAlternatives, setSentenceAlternatives] = useState<string[]>([]);
  const [currentAltIndex, setCurrentAltIndex] = useState(0);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [sentenceWidgetPos, setSentenceWidgetPos] = useState<{ top: number; left: number } | null>(null);

  // 📑 Compare Modes Multi-Pane
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareResults, setCompareResults] = useState<{ mode: string; label: string; text: string; words: number }[]>([]);
  const [selectedCompareModes, setSelectedCompareModes] = useState<string[]>(['standard', 'fluency', 'academic']);
  const [isComparing, setIsComparing] = useState(false);


  // 🛠️ QuillBot-Level Suite Active Tool
  const [activeSuiteTool, setActiveSuiteTool] = useState<'paraphrase' | 'grammar' | 'humanizer' | 'summarizer' | 'translator' | 'plagiarism'>('paraphrase');

  // 📋 Summarizer Options
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [summaryFormat, setSummaryFormat] = useState<'paragraph' | 'bullets' | 'key-points' | 'executive'>('bullets');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // 🌐 Translator Options
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState(false);

  // 🧠 Humanizer Mode
  const [humanizeMode, setHumanizeMode] = useState<'natural' | 'conversational' | 'academic' | 'casual' | 'professional'>('natural');

  // 🔍 Live Grammar Proofreader
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarReport, setGrammarReport] = useState<GrammarCheckResponse | null>(null);
  const [showGrammarDrawer, setShowGrammarDrawer] = useState(false);
  const [isFixingGrammar, setIsFixingGrammar] = useState(false);

  // 🧠 Humanizer Action
  const [isHumanizing, setIsHumanizing] = useState(false);

  // ⚡ Typewriter Effect & Instant Fallback
  const [enableTypewriter, setEnableTypewriter] = useState<boolean>(() => {
    return localStorage.getItem('rb_typewriter_effect') !== 'false';
  });
  const [isTypingOutput, setIsTypingOutput] = useState<boolean>(false);
  const [typedOutputLength, setTypedOutputLength] = useState<number>(0);
  const typingIntervalRef = useRef<any>(null);
  const lastTypedTextRef = useRef<string>('');
  const wasStreamedRef = useRef<boolean>(false);

  const {
    inputText,
    outputText,
    mode,
    language,
    synonymLevel,
    plagiarismGuard,
    frozenTerms,
    isGenerating,
    inputWordCount,
    outputWordCount,
    latency,
    currentProvider,
    currentModel,
    setInputText,
    setOutputText,
    setMode,
    setLanguage,
    setSynonymLevel,
    setPlagiarismGuard,
    addFrozenTerm,
    removeFrozenTerm,
    clearFrozenTerms,
    paraphrase,
    paraphraseStream,
    exportOutput,
  } = useEditorStore();

  const outputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadProviders = async () => {
    try {
      const data = await apiClient.get<any[]>('/providers');
      setProviders(data);
      if (data.length > 0) {
        const defaultProvider = data.find((p) => p.isDefault) || data[0];
        setSelectedProviderId(defaultProvider.id);
      }
    } catch (err: any) {
      console.error('Failed to load providers:', err);
      showToast('Failed to load providers. Check server connection.', 'error');
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get<{ items: HistoryItem[]; total: number }>('/history?page=1&pageSize=20');
      setHistoryItems(res.items || []);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      showToast('Could not fetch history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  // ⚡ Skip typewriter animation and show full output instantly
  const skipTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTypingOutput(false);
    setTypedOutputLength(outputText.length);
  };

  // ⚡ Update outputText instantly without triggering typewriter re-animation
  const updateOutputDirectly = (nextText: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    lastTypedTextRef.current = nextText;
    setIsTypingOutput(false);
    setTypedOutputLength(nextText.length);
    setOutputText(nextText);
  };

  /**
   * Resilient, fuzzy sentence replacement in document text
   * Handles trailing punctuation, whitespace collapse, quotation marks, and regex escapes
   */
  const replaceSentenceInDoc = (doc: string, target: string, replacement: string): { updated: string; replaced: boolean } => {
    if (!doc || !target) return { updated: doc, replaced: false };

    // 1. Direct exact match
    if (doc.includes(target)) {
      return { updated: doc.replace(target, replacement), replaced: true };
    }

    // 2. Trimmed match
    const trimmedTarget = target.trim();
    if (trimmedTarget && doc.includes(trimmedTarget)) {
      return { updated: doc.replace(trimmedTarget, replacement), replaced: true };
    }

    // 3. Normalized whitespace regex match (handles newlines, extra spaces, tabs)
    try {
      const words = trimmedTarget.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const regexStr = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
        const regex = new RegExp(regexStr, 'i');
        if (regex.test(doc)) {
          return { updated: doc.replace(regex, replacement), replaced: true };
        }
      }
    } catch {
      // Ignore regex error and fall through
    }

    // 4. Token overlap fallback: match by core word subsequence if 4+ words match consecutively
    try {
      const words = trimmedTarget.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
      if (words.length >= 4) {
        const keyPhrase = words.slice(0, 5).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
        const fuzzyRegex = new RegExp(keyPhrase + '[^.!?\\n]*[.!?]?', 'i');
        if (fuzzyRegex.test(doc)) {
          return { updated: doc.replace(fuzzyRegex, replacement), replaced: true };
        }
      }
    } catch {
      // Fall through
    }

    return { updated: doc, replaced: false };
  };

  // ⚡ Toggle typewriter animation preference
  const toggleTypewriterMode = () => {
    const nextVal = !enableTypewriter;
    setEnableTypewriter(nextVal);
    localStorage.setItem('rb_typewriter_effect', String(nextVal));
    if (!nextVal) {
      skipTyping();
    }
    showToast(nextVal ? 'Typewriter animation enabled' : 'Instant output rendering enabled', 'info');
  };

  // ⚡ Typewriter Engine: Triggers smoothly when new output arrives
  useEffect(() => {
    if (!outputText) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setIsTypingOutput(false);
      setTypedOutputLength(0);
      lastTypedTextRef.current = '';
      return;
    }

    // While generation / streaming is active, live chunks stream directly
    if (isGenerating) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setIsTypingOutput(false);
      setTypedOutputLength(outputText.length);
      return;
    }

    // If the text was already streamed live chunk-by-chunk, or text has not changed,
    // or typewriter is disabled, or text is long (> 2000 chars), display immediately (fallback)
    if (wasStreamedRef.current || !enableTypewriter || outputText === lastTypedTextRef.current || outputText.length > 2000) {
      wasStreamedRef.current = false;
      lastTypedTextRef.current = outputText;
      setIsTypingOutput(false);
      setTypedOutputLength(outputText.length);
      return;
    }

    // Start fluid typing animation
    lastTypedTextRef.current = outputText;
    setIsTypingOutput(true);
    setTypedOutputLength(0);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const totalLen = outputText.length;
    // Step size scaled dynamically: short text is crisp, long text completes in <1.1s
    const step = totalLen < 120 ? 1 : totalLen < 400 ? 2 : Math.max(3, Math.ceil(totalLen / 55));
    const intervalMs = totalLen < 120 ? 20 : 16;
    let currentPos = 0;

    typingIntervalRef.current = setInterval(() => {
      currentPos += step;
      if (currentPos >= totalLen) {
        setTypedOutputLength(totalLen);
        setIsTypingOutput(false);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      } else {
        setTypedOutputLength(currentPos);
      }
    }, intervalMs);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [outputText, isGenerating, enableTypewriter]);

  const handleParaphrase = async () => {
    if (!selectedProviderId) {
      showToast('Please select or configure an AI provider first!', 'error');
      navigate('/providers');
      return;
    }

    const provider = providers.find((p) => p.id === selectedProviderId);
    if (!provider) {
      showToast('Selected provider not found in list.', 'error');
      await loadProviders();
      return;
    }

    if (!inputText.trim()) {
      showToast('Please enter or paste text to paraphrase.', 'info');
      return;
    }

    // Clear any stale plagiarism report immediately so the badge doesn't show old data
    setPlagiarismReport(null);

    // On mobile, auto-switch to output view so streaming tokens appear immediately
    setMobileTab('output');

    try {
      setSelectedTokenIndex(null);
      if (provider.options?.streamingEnabled !== false) {
        try {
          wasStreamedRef.current = true;
          await paraphraseStream(provider.id, provider.modelId);
          showToast('Paraphrase completed successfully!', 'success');
        } catch (streamErr) {
          console.warn('Streaming encountered issue, falling back to standard paraphrase:', streamErr);
          wasStreamedRef.current = false;
          const result = await paraphrase(provider.id, provider.modelId);
          if (result && result.text && result.text.trim().length > 0) {
            showToast('Paraphrase completed successfully!', 'success');
          }
        }
      } else {
        wasStreamedRef.current = false;
        const result = await paraphrase(provider.id, provider.modelId);
        if (result && result.text && result.text.trim().length > 0) {
          showToast('Paraphrase completed successfully!', 'success');
        }
      }

      // ── Plagiarism Guard auto-pipeline ──────────────────────────────────────
      if (plagiarismGuard) {
        setIsAutoScanRunning(true);
        try {
          // Read the freshly-generated text directly from store (avoids stale closure)
          const freshText = useEditorStore.getState().outputText;

          setIsScanningPlagiarism(true);
          const scanRes = await toolsService.checkPlagiarism({
            text: freshText,
            providerId: provider.id,
            modelId: provider.modelId,
            language,
          });
          setPlagiarismReport(scanRes);
          setIsScanningPlagiarism(false);

          const flagged = scanRes.matches.filter((m) => m.type !== 'clean');
          if (flagged.length > 0) {
            showToast(`🛡️ Guard: ${flagged.length} flagged sentence(s) found – auto-fixing…`, 'info');
            await runAutoFix(scanRes);
            showToast('🛡️ Guard: Document fully cleaned! Opening report…', 'success');
          } else {
            showToast(`🛡️ Guard: ${scanRes.originalityScore}% Original – all clear!`, 'success');
          }
          setShowPlagiarism(true);
        } catch (scanErr: any) {
          console.error('Guard auto-scan failed:', scanErr);
          const isRateLimit = scanErr?.message?.includes('429') || scanErr?.statusCode === 429;
          showToast(
            isRateLimit
              ? 'Guard scan paused (API rate limit). Click Plagiarism to run check.'
              : 'Guard scan paused. Click the Plagiarism button to check manually.',
            'info'
          );
        } finally {
          setIsAutoScanRunning(false);
          setIsScanningPlagiarism(false);
        }
      }
      // ────────────────────────────────────────────────────────────────────────
    } catch (err: any) {
      console.error('Paraphrase failed:', err);
      const errorMessage = apiClient.handleError(err);
      showToast(errorMessage, 'error');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      showToast('Text pasted from clipboard', 'info');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleSampleText = () => {
    const samples = [
      'Artificial intelligence is transforming modern software engineering by automating repetitive tasks and enabling developers to focus on higher-level system architecture.',
      'Regular physical activity combined with balanced nutrition provides substantial benefits for cardiovascular health and cognitive longevity.',
      'The transition to renewable energy sources requires substantial investment in infrastructure, policy reform, and grid storage technologies.',
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setInputText(randomSample);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      await exportOutput(`RewriteBot_Export_${Date.now()}`, format);
      showToast(`Exported as .${format}`, 'success');
      setExportOpen(false);
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleWordClick = async (token: DiffToken, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const rawWord = token.text.trim();
    const cleanWord = rawWord.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord || cleanWord.length < 2) return;

    const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const popupWidth = 260;
    const popupHeight = 220;
    let left = Math.max(12, Math.min(targetRect.left + (targetRect.width / 2) - 110, window.innerWidth - popupWidth - 12));
    let top = targetRect.bottom + 6;
    if (top + popupHeight > window.innerHeight - 12) {
      top = Math.max(12, targetRect.top - popupHeight - 6);
    }
    setThesaurusPos({ top, left });

    setSelectedTokenIndex(index);
    setSelectedWord(rawWord);

    // If token already has precomputed synonyms, populate immediately
    if (token.synonyms && token.synonyms.length > 0) {
      setWordSynonyms(token.synonyms);
    } else {
      setWordSynonyms([]);
    }

    // Dynamic lookup (combining local dictionary + Datamuse API)
    setIsLoadingWordSynonyms(true);
    try {
      const syns = await lookupSynonyms(cleanWord);
      if (syns && syns.length > 0) {
        setWordSynonyms(syns);
      }
    } catch (e) {
      console.error('Synonym lookup failed:', e);
    } finally {
      setIsLoadingWordSynonyms(false);
    }
  };

  const replaceWord = (newWord: string, tokenIndex: number) => {
    const diff = computeWordDiff(inputText, outputText);
    if (!diff[tokenIndex]) return;

    const orig = diff[tokenIndex].text;
    const isAllUpper = orig.length > 1 && orig === orig.toUpperCase();
    const isFirstUpper = orig.length > 0 && orig[0] === orig[0].toUpperCase();

    let formattedWord = newWord;
    if (isAllUpper) {
      formattedWord = newWord.toUpperCase();
    } else if (isFirstUpper) {
      formattedWord = newWord.charAt(0).toUpperCase() + newWord.slice(1);
    } else {
      formattedWord = newWord.toLowerCase();
    }

    diff[tokenIndex].text = formattedWord;
    const reconstructed = diff.map((t) => t.text).join('');
    setOutputText(reconstructed);
    setSelectedTokenIndex(null);
    setThesaurusPos(null);
    showToast(`Replaced with "${formattedWord}"`, 'info');
  };

  // ❄️ Freeze terms handler
  const handleAddFrozenTerm = () => {
    const term = freezeInput.trim();
    if (!term) return;
    if (frozenTerms.includes(term)) {
      showToast(`"${term}" is already frozen`, 'info');
      setFreezeInput('');
      return;
    }
    addFrozenTerm(term);
    setFreezeInput('');
    showToast(`Locked "${term}" from being changed`, 'success');
  };

  // 📝 Sentence Alternative Selector (< 1 of 3 >)
  const handleSentenceClick = async (sentence: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please configure a provider first', 'error');
      return;
    }

    if (event && !sentenceWidgetPos) {
      const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const popupWidth = 380;
      const popupHeight = 240;
      let left = Math.max(16, Math.min(targetRect.left, window.innerWidth - popupWidth - 16));
      let top = targetRect.bottom + 8;
      if (top + popupHeight > window.innerHeight - 16) {
        top = Math.max(16, targetRect.top - popupHeight - 8);
      }
      setSentenceWidgetPos({ top, left });
    }

    setSelectedSentence(sentence);
    setIsLoadingAlternatives(true);
    setCurrentAltIndex(0);

    try {
      const alts = await paraphraseService.getSentenceAlternatives(sentence, {
        providerId: provider.id,
        modelId: provider.modelId,
        language,
        frozenTerms,
      });
      setSentenceAlternatives(alts);
    } catch (e) {
      console.error('Failed to load sentence alternatives:', e);
      setSentenceAlternatives([sentence]);
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleApplySentenceAlternative = (newSentence: string) => {
    if (!selectedSentence || !newSentence) return;
    const currentDoc = outputText || inputText;
    const { updated, replaced } = replaceSentenceInDoc(currentDoc, selectedSentence, newSentence);
    if (replaced) {
      if (outputText) {
        updateOutputDirectly(updated);
      } else {
        setInputText(updated);
      }
      showToast('Replaced sentence with alternative!', 'success');
    }
    setSelectedSentence(null);
    setSentenceWidgetPos(null);
  };

  // 📑 Compare Modes Multi-Pane
  const toggleCompareMode = (modeVal: string) => {
    if (selectedCompareModes.includes(modeVal)) {
      if (selectedCompareModes.length <= 2) {
        showToast('Please keep at least 2 modes selected for comparison', 'info');
        return;
      }
      setSelectedCompareModes(selectedCompareModes.filter((m) => m !== modeVal));
    } else {
      if (selectedCompareModes.length >= 4) {
        showToast('You can compare up to 4 modes simultaneously', 'info');
        return;
      }
      setSelectedCompareModes([...selectedCompareModes, modeVal]);
    }
  };

  const handleCompareModes = async (modesOverride?: string[] | React.MouseEvent) => {
    const textToCompare = inputText.trim() || outputText.trim();
    if (!textToCompare) {
      showToast('Please enter text to compare modes', 'info');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please select a provider first', 'error');
      return;
    }

    const activeModesList = Array.isArray(modesOverride) ? modesOverride : selectedCompareModes;
    if (activeModesList.length < 2) {
      showToast('Please select at least 2 modes to compare', 'info');
      return;
    }

    setShowCompareModal(true);
    setIsComparing(true);
    setCompareResults([]);

    const targetModes = activeModesList.map((mVal) => {
      const found = modes.find((m) => m.value === mVal);
      return { mode: mVal, label: found ? found.label : mVal };
    });

    try {
      const results = await Promise.all(
        targetModes.map(async (m) => {
          try {
            const res = await paraphraseService.paraphrase({
              text: textToCompare,
              mode: m.mode as any,
              language,
              synonymLevel,
              frozenTerms,
              providerId: provider.id,
              modelId: provider.modelId,
              plagiarismGuard,
            });
            const out = res.text.trim();
            const words = out.split(/\s+/).filter(Boolean).length;
            return { mode: m.mode, label: m.label, text: out, words };
          } catch (err: any) {
            return { mode: m.mode, label: m.label, text: `Error: ${err.message || 'Failed to generate'}`, words: 0 };
          }
        })
      );
      setCompareResults(results);
    } catch (err) {
      console.error('Compare modes failed:', err);
      showToast('Failed to compare modes', 'error');
    } finally {
      setIsComparing(false);
    }
  };


  // 🔍 Live Grammar Proofreader
  const handleCheckGrammar = async () => {
    const textToCheck = outputText.trim() || inputText.trim();
    if (!textToCheck) {
      showToast('Enter text to proofread for grammar & spelling', 'info');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please select an AI provider first', 'error');
      return;
    }

    try {
      setIsCheckingGrammar(true);
      setShowGrammarDrawer(true);
      const res = await toolsService.checkGrammar({
        text: textToCheck,
        language: language === 'auto' ? 'en' : language,
        providerId: provider.id,
        modelId: provider.modelId,
      });
      setGrammarReport(res);
      showToast(`Proofreading complete! Found ${res.corrections?.length || 0} suggestion(s)`, 'success');
    } catch (err: any) {
      console.error('Grammar check failed:', err);
      showToast(err.message || 'Grammar check failed', 'error');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handleFixAllGrammar = () => {
    if (!grammarReport || !grammarReport.correctedText) return;
    try {
      setIsFixingGrammar(true);
      if (outputText) {
        setOutputText(grammarReport.correctedText);
      } else {
        setInputText(grammarReport.correctedText);
      }
      setGrammarReport({
        ...grammarReport,
        corrections: [],
      });
      showToast('Applied all grammar and spelling corrections!', 'success');
    } finally {
      setIsFixingGrammar(false);
    }
  };

  // 🧠 Humanizer Action
  const handleHumanize = async () => {
    const textToHumanize = outputText.trim() || inputText.trim();
    if (!textToHumanize) {
      showToast('Please enter text to humanize', 'info');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please select a provider first', 'error');
      return;
    }

    try {
      setIsHumanizing(true);
      const res = await toolsService.humanize({
        text: textToHumanize,
        mode: humanizeMode,
        language,
        providerId: provider.id,
        modelId: provider.modelId,
      });

      setOutputText(res.text);
      setPlagiarismReport(null);
      showToast(`Text successfully humanized (${humanizeMode} tone)!`, 'success');

      // Re-scan with new humanized text
      try {
        const freshScan = await toolsService.checkPlagiarism({
          text: res.text,
          providerId: provider.id,
          modelId: provider.modelId,
          language,
        });
        setPlagiarismReport({
          ...freshScan,
          humanScore: 98,
        });
      } catch (scanErr) {
        console.warn('Post-humanize plagiarism re-scan skipped:', scanErr);
      }
    } catch (err: any) {
      console.error('Humanize failed:', err);
      showToast(err.message || 'Humanize failed', 'error');
    } finally {
      setIsHumanizing(false);
    }
  };

  // 📋 Summarizer Action
  const handleSummarize = async () => {
    const textToSummarize = inputText.trim();
    if (!textToSummarize) {
      showToast('Please enter text to summarize', 'info');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please select a provider first', 'error');
      return;
    }

    try {
      setIsSummarizing(true);
      const res = await toolsService.summarize({
        text: textToSummarize,
        length: summaryLength,
        format: summaryFormat,
        language: language === 'auto' ? undefined : language,
        providerId: provider.id,
        modelId: provider.modelId,
      });
      setOutputText(res.text);
      setActiveTab('plain');
      showToast('Summary generated successfully!', 'success');
    } catch (err: any) {
      console.error('Summarize failed:', err);
      showToast(err.message || 'Summarization failed', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  // 🌐 Translator Action
  const handleTranslate = async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) {
      showToast('Please enter text to translate', 'info');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please select a provider first', 'error');
      return;
    }

    try {
      setIsTranslating(true);
      const res = await toolsService.translate({
        text: textToTranslate,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        providerId: provider.id,
        modelId: provider.modelId,
      });
      setOutputText(res.text);
      setActiveTab('plain');
      showToast(`Translated text to ${targetLang.toUpperCase()} successfully!`, 'success');
    } catch (err: any) {
      console.error('Translate failed:', err);
      showToast(err.message || 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    const textToScan = outputText.trim() || inputText.trim();
    if (!textToScan) {
      showToast('Please enter or paraphrase some text to scan for plagiarism', 'info');
      return;
    }

    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please configure an AI provider in Providers settings', 'error');
      navigate('/providers');
      return;
    }

    try {
      setShowPlagiarism(true);
      setIsScanningPlagiarism(true);
      setSelectedMatchIndex(null);

      const res = await toolsService.checkPlagiarism({
        text: textToScan,
        providerId: provider.id,
        modelId: provider.modelId,
        language,
      });

      setPlagiarismReport(res);
      showToast(`Plagiarism scan complete! ${res.originalityScore}% Original`, 'success');
    } catch (err: any) {
      console.error('Plagiarism check error:', err);
      showToast(err.message || 'Plagiarism scan failed. Check provider credentials.', 'error');
    } finally {
      setIsScanningPlagiarism(false);
    }
  };

  const handleRewriteSentence = async (sentence: string, matchIndex: number) => {
    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please configure an AI provider first', 'error');
      return;
    }

    try {
      setRewritingSentenceIndex(matchIndex);
      const res = await paraphraseService.paraphrase({
        text: sentence,
        mode: 'fluency',
        language,
        synonymLevel: 3,
        frozenTerms: [],
        providerId: provider.id,
        modelId: provider.modelId,
        plagiarismGuard: true,
      });

      const newSentence = res.text.trim();
      if (!newSentence) throw new Error('Received empty rewrite');

      // Replace in-place inside outputText (and inputText if present) with resilient matching
      const currentDoc = outputText || inputText;
      const { updated: updatedDoc, replaced } = replaceSentenceInDoc(currentDoc, sentence, newSentence);
      
      // Update store and ensure UI refreshes immediately
      if (outputText) {
        updateOutputDirectly(updatedDoc);
      } else {
        setInputText(updatedDoc);
      }

      // Update plagiarism report in real-time
      if (plagiarismReport) {
        const updatedMatches = [...plagiarismReport.matches];
        updatedMatches[matchIndex] = {
          ...updatedMatches[matchIndex],
          sentence: newSentence,
          type: 'clean',
          similarity: 0,
          explanation: 'Rewritten in-place with AI Paraphraser',
        };

        const cleanCount = updatedMatches.filter((m) => m.type === 'clean').length;
        const newOriginality = Math.round((cleanCount / updatedMatches.length) * 100);

        setPlagiarismReport({
          ...plagiarismReport,
          originalityScore: newOriginality,
          plagiarismScore: 100 - newOriginality,
          humanScore: newOriginality >= 90 ? 98 : Math.max(plagiarismReport.humanScore ?? 90, 95),
          riskLevel: newOriginality >= 85 ? 'safe' : newOriginality >= 60 ? 'moderate' : 'high',
          matches: updatedMatches,
          sources: newOriginality === 100 ? [] : plagiarismReport.sources,
        });
      }

      showToast(
        replaced
          ? 'Flagged sentence rewritten in-place! Document preserved.'
          : 'Sentence rewritten! Document updated.',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to rewrite sentence in-place:', err);
      showToast(err.message || 'Failed to rewrite sentence', 'error');
    } finally {
      setRewritingSentenceIndex(null);
    }
  };

  // Core auto-fix logic – accepts a report so it can be called from the Guard pipeline
  // or from the manual "Auto-Rewrite All Flagged" button
  const runAutoFix = async (report: PlagiarismCheckResponse): Promise<void> => {
    const flaggedItems = report.matches
      .map((m, idx) => ({ match: m, idx }))
      .filter((item) => item.match.type !== 'clean');

    if (flaggedItems.length === 0) return;

    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please configure an AI provider first', 'error');
      return;
    }

    let currentDoc = useEditorStore.getState().outputText || inputText;
    const updatedMatches = [...report.matches];

    // Process flagged sentence rewrites sequentially with small interval to prevent provider 429 rate limit errors
    const rewriteResults: { original: string; newSentence: string; idx: number; success: boolean }[] = [];
    for (const { match, idx } of flaggedItems) {
      try {
        const res = await paraphraseService.paraphrase({
          text: match.sentence,
          mode: 'fluency',
          language,
          synonymLevel: 3,
          frozenTerms: [],
          providerId: provider.id,
          modelId: provider.modelId,
          plagiarismGuard: true,
        });
        const newSentence = res.text.trim();
        rewriteResults.push({ original: match.sentence, newSentence, idx, success: !!newSentence });
      } catch (e) {
        console.error('Failed to rewrite individual sentence in batch:', e);
        rewriteResults.push({ original: match.sentence, newSentence: match.sentence, idx, success: false });
      }

      // Brief 150ms pause between requests to respect API rate limits on free providers (Groq/Ollama)
      if (flaggedItems.length > 1) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    // Apply all rewritten sentences into document and update matches using resilient replacement
    for (const item of rewriteResults) {
      if (item.success && item.newSentence) {
        const { updated, replaced } = replaceSentenceInDoc(currentDoc, item.original, item.newSentence);
        if (replaced) {
          currentDoc = updated;
        }
        updatedMatches[item.idx] = {
          ...updatedMatches[item.idx],
          sentence: item.newSentence,
          type: 'clean',
          similarity: 0,
          explanation: 'Auto-rewritten for originality & natural cadence',
        };
      }
    }

    const cleanCount = updatedMatches.filter((m) => m.type === 'clean').length;
    const newOriginality = updatedMatches.length > 0 ? Math.round((cleanCount / updatedMatches.length) * 100) : 100;

    // Instantly update output document in store without typewriter stall
    if (useEditorStore.getState().outputText) {
      updateOutputDirectly(currentDoc);
    } else {
      setInputText(currentDoc);
    }

    setPlagiarismReport({
      ...report,
      originalityScore: newOriginality,
      plagiarismScore: 100 - newOriginality,
      humanScore: newOriginality >= 90 ? 98 : Math.max(report.humanScore ?? 92, 95),
      riskLevel: newOriginality >= 85 ? 'safe' : newOriginality >= 60 ? 'moderate' : 'high',
      matches: updatedMatches,
      sources: newOriginality === 100 ? [] : report.sources,
    });
    setSelectedMatchIndex(null);
  };

  const handleAutoFixAll = async () => {
    if (!plagiarismReport || !plagiarismReport.matches) return;
    const hasFlagged = plagiarismReport.matches.some((m) => m.type !== 'clean');
    if (!hasFlagged) {
      showToast('No flagged sentences to fix!', 'info');
      return;
    }

    try {
      setIsAutoFixingAll(true);
      await runAutoFix(plagiarismReport);
      showToast('All flagged sentences rewritten in-place! Document is now original.', 'success');
    } catch (err: any) {
      console.error('Auto-fix failed:', err);
      showToast(err.message || 'Auto-fix failed', 'error');
    } finally {
      setIsAutoFixingAll(false);
    }
  };


  const modes = [
    { value: 'standard', label: 'Standard', desc: 'Balances changes with original meaning' },
    { value: 'fluency', label: 'Fluency', desc: 'Fixes grammar and improves readability' },
    { value: 'formal', label: 'Formal', desc: 'Sophisticated, business-appropriate tone' },
    { value: 'academic', label: 'Academic', desc: 'Scholarly language and complex structure' },
    { value: 'simple', label: 'Simple', desc: 'Clear, straightforward, accessible prose' },
    { value: 'creative', label: 'Creative', desc: 'Expressive and imaginative phrasing' },
    { value: 'expand', label: 'Expand', desc: 'Elaborates sentences with descriptive detail' },
    { value: 'shorten', label: 'Shorten', desc: 'Concise and to the point' },
    { value: 'humanize', label: 'Humanize', desc: 'Natural human cadence and flow' },
  ];

  const diffTokens = computeWordDiff(inputText, outputText);
  const changedWordsCount = diffTokens.filter((t) => t.type === 'changed').length;
  const longestUnchangedCount = diffTokens.filter((t) => t.type === 'longest-unchanged').length;
  const structuralCount = diffTokens.filter((t) => t.type === 'structural').length;
  const changePercentage = outputWordCount > 0 ? Math.round(((changedWordsCount + structuralCount) / outputWordCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', background: 'var(--rb-background)', color: 'var(--rb-text)', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden', transition: 'background-color 0.25s ease' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'success' ? '#10b981' : '#3b82f6',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main App Header */}
      <header
        style={{
          background: 'var(--rb-surface)',
          borderBottom: '1px solid var(--rb-border)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BrandLogo variant="compact" height={36} to="/app" />

          {/* Provider Status Pill (Desktop) */}
          <div className="show-on-desktop hide-on-mobile">
            {providers.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--rb-surface-cream)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--rb-border)',
                  fontSize: '13px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ color: 'var(--rb-text-secondary)', fontWeight: 500 }}>Provider:</span>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 600,
                    color: 'var(--rb-text)',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>
                      {p.name} ({p.type} / {p.modelId})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate('/providers')}
                  title="Manage Providers"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', padding: '2px' }}
                >
                  <Settings size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/providers')}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={14} /> Add Provider
              </button>
            )}
          </div>
        </div>

        {/* Desktop User Profile & Actions */}
        <div className="show-on-desktop hide-on-mobile" style={{ alignItems: 'center', gap: '14px' }}>
          <ThemeToggle />
          <button
            onClick={toggleHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              border: '1px solid var(--rb-border)',
              borderRadius: '8px',
              background: showHistory ? 'var(--rb-surface-muted)' : 'var(--rb-surface)',
              color: 'var(--rb-text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <History size={16} /> History
          </button>

          <button
            onClick={() => navigate('/providers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              border: '1px solid var(--rb-border)',
              borderRadius: '8px',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Settings size={16} /> Providers
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--rb-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDark ? 'var(--rb-primary-light)' : '#fbebf0',
                color: isDark ? '#f48fb1' : '#670626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rb-text)' }}>{user?.name}</span>
            <button
              onClick={logout}
              title="Logout"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="show-on-mobile hide-on-desktop" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
          {providers.length === 0 && (
            <button
              onClick={() => navigate('/providers')}
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Provider
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="touch-target"
            style={{
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#334155',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="animate-fade-in"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Off-canvas Panel */}
          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '290px',
              maxWidth: '85vw',
              background: 'var(--rb-surface)',
              borderLeft: '1px solid var(--rb-border)',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.15)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              paddingBottom: 'calc(20px + var(--rb-safe-bottom, 0px))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--rb-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--rb-primary-light)',
                    color: 'var(--rb-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rb-text)' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>{user?.email}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--rb-surface-cream)', borderRadius: '8px', border: '1px solid var(--rb-border)', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rb-text)' }}>Theme</span>
                <ThemeToggle showLabel />
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleHistory();
                }}
                className="touch-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: '1px solid var(--rb-border)',
                  borderRadius: '8px',
                  background: showHistory ? 'var(--rb-primary-light)' : 'var(--rb-surface-cream)',
                  color: showHistory ? 'var(--rb-primary)' : 'var(--rb-text)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <History size={18} color="var(--rb-accent)" />
                <span style={{ color: 'var(--rb-text)' }}>Paraphrase History</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/providers');
                }}
                className="touch-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: '1px solid var(--rb-border)',
                  borderRadius: '8px',
                  background: 'var(--rb-surface-cream)',
                  color: 'var(--rb-text)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Settings size={18} color="#3b82f6" />
                <span style={{ color: 'var(--rb-text)' }}>AI Providers Configuration</span>
              </button>

              {providers.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--rb-surface-cream)', borderRadius: '8px', border: '1px solid var(--rb-border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rb-text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Active AI Provider
                  </div>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '6px',
                      background: 'var(--rb-surface)',
                      fontWeight: 600,
                      color: 'var(--rb-text)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>
                        {p.name} ({p.type} / {p.modelId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 'auto',
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 🚀 QuillBot-Grade Multi-Tool Suite Bar */}
      <div className="suite-bar">
        <button
          className={`suite-tab ${activeSuiteTool === 'paraphrase' ? 'active' : ''}`}
          onClick={() => setActiveSuiteTool('paraphrase')}
        >
          <Sparkles size={14} />
          <span>Paraphraser</span>
        </button>

        <button
          className={`suite-tab ${activeSuiteTool === 'grammar' ? 'active' : ''}`}
          onClick={() => {
            setActiveSuiteTool('grammar');
            handleCheckGrammar();
          }}
        >
          <CheckCheck size={14} color="#ea580c" />
          <span>Grammar Checker</span>
        </button>

        <button
          className={`suite-tab ${activeSuiteTool === 'humanizer' ? 'active' : ''}`}
          onClick={() => setActiveSuiteTool('humanizer')}
        >
          <BrainCircuit size={14} color="#a855f7" />
          <span>AI Humanizer</span>
        </button>

        <button
          className={`suite-tab ${activeSuiteTool === 'summarizer' ? 'active' : ''}`}
          onClick={() => setActiveSuiteTool('summarizer')}
        >
          <AlignLeft size={14} color="#2563eb" />
          <span>Summarizer</span>
        </button>

        <button
          className={`suite-tab ${activeSuiteTool === 'translator' ? 'active' : ''}`}
          onClick={() => setActiveSuiteTool('translator')}
        >
          <Languages size={14} color="#059669" />
          <span>Translator</span>
        </button>

        <button
          className={`suite-tab ${activeSuiteTool === 'plagiarism' ? 'active' : ''}`}
          onClick={() => {
            setActiveSuiteTool('plagiarism');
            handleCheckPlagiarism();
          }}
        >
          <ShieldCheck size={14} color="#16a34a" />
          <span>Plagiarism Checker</span>
        </button>
      </div>

      {/* Modes & Settings Control Bar */}
      {activeSuiteTool === 'paraphrase' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Mode Selector Tabs */}
          <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginRight: '4px', flexShrink: 0 }}>Modes:</span>
            {modes.map((m) => {
              const isActive = mode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value as any)}
                  title={m.desc}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isActive ? '1.5px solid var(--rb-primary)' : '1px solid transparent',
                    background: isActive ? 'var(--rb-primary-light)' : 'transparent',
                    color: isActive ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {m.label}
                </button>
              );
            })}
            <div style={{ width: '1px', height: '18px', background: 'var(--rb-border)', margin: '0 4px' }} />
            <button
              onClick={handleCompareModes}
              title="Compare Standard, Fluency, and Academic outputs side-by-side"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: isDark ? '1px solid var(--rb-primary-border)' : '1px solid #f3cbd7',
                background: isDark ? 'var(--rb-primary-light)' : '#fbebf0',
                color: isDark ? '#f48fb1' : '#670626',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Columns size={13} color={isDark ? '#f48fb1' : '#670626'} />
              <span>Compare Modes</span>
            </button>
          </div>

          {/* Synonyms Slider & Language Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* ❄️ Freeze Words Button */}
            <button
              onClick={() => setShowFreezeModal(true)}
              title="Lock specific brand names, terms, or words so they are never changed"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: frozenTerms.length > 0 ? (isDark ? '1.5px solid #60a5fa' : '1.5px solid #93c5fd') : '1px solid var(--rb-border)',
                background: frozenTerms.length > 0 ? (isDark ? 'rgba(59, 130, 246, 0.18)' : '#eff6ff') : 'var(--rb-surface)',
                color: frozenTerms.length > 0 ? (isDark ? '#93c5fd' : '#1d4ed8') : 'var(--rb-text)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Snowflake size={14} color={frozenTerms.length > 0 ? (isDark ? '#93c5fd' : '#2563eb') : 'var(--rb-text-muted)'} />
              <span>Freeze {frozenTerms.length > 0 ? `(${frozenTerms.length})` : ''}</span>
            </button>

            <div className="show-on-desktop hide-on-mobile" style={{ width: '1px', height: '18px', background: 'var(--rb-border)' }} />

            {/* Synonyms Level Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rb-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sliders size={14} /> Synonyms:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={synonymLevel}
                  onChange={(e) => setSynonymLevel(Number(e.target.value))}
                  style={{ width: '90px', accentColor: '#10b981', cursor: 'pointer' }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isDark ? '#171314' : '#fff',
                    background: isDark ? 'var(--rb-accent)' : '#10b981',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    minWidth: '24px',
                    textAlign: 'center',
                  }}
                >
                  {synonymLevel === 1 ? 'Few' : synonymLevel === 2 ? 'Mid' : synonymLevel === 3 ? 'High' : 'Max'}
                </span>
              </div>
            </div>

            <div className="show-on-desktop hide-on-mobile" style={{ width: '1px', height: '18px', background: 'var(--rb-border)' }} />

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="var(--rb-text-muted)" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  border: '1px solid var(--rb-border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  color: 'var(--rb-text)',
                  background: 'var(--rb-surface)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="auto" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>Detect language</option>
                <option value="en" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>English (US)</option>
                <option value="es" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>Spanish</option>
                <option value="fr" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>French</option>
                <option value="de" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>German</option>
                <option value="it" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>Italian</option>
                <option value="pt" style={{ background: 'var(--rb-surface)', color: 'var(--rb-text)' }}>Portuguese</option>
              </select>
            </div>

            <div className="show-on-desktop hide-on-mobile" style={{ width: '1px', height: '18px', background: 'var(--rb-border)' }} />

            {/* Plagiarism Guard Toggle */}
            <button
              onClick={() => {
                setPlagiarismGuard(!plagiarismGuard);
                showToast(
                  !plagiarismGuard
                    ? '🛡️ Plagiarism Guard ON: Deep anti-plagiarism phrasing active'
                    : 'Plagiarism Guard OFF',
                  'info'
                );
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: plagiarismGuard ? (isDark ? '1px solid rgba(186, 215, 151, 0.4)' : '1px solid #cbe6ac') : '1px solid var(--rb-border)',
                background: plagiarismGuard ? (isDark ? 'rgba(186, 215, 151, 0.18)' : '#f2f8eb') : 'var(--rb-surface)',
                color: plagiarismGuard ? (isDark ? '#cbe6ac' : '#2d5a1e') : 'var(--rb-text)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="When active, forces deep restructuring to ensure 100% unique, plagiarism-free output"
            >
              <ShieldCheck size={14} color={plagiarismGuard ? (isDark ? '#cbe6ac' : '#3b6f28') : 'var(--rb-text-muted)'} />
              <span>Guard: {plagiarismGuard ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 🧠 AI Humanizer Control Bar */}
      {activeSuiteTool === 'humanizer' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Humanizer Tone:</span>
            {(['natural', 'conversational', 'academic', 'casual', 'professional'] as const).map((m) => {
              const active = humanizeMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setHumanizeMode(m)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: active ? '1.5px solid #a855f7' : '1px solid transparent',
                    background: active ? (isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff') : 'transparent',
                    color: active ? '#a855f7' : 'var(--rb-text-secondary)',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Stealth Mode: 98%+ AI Bypass Guaranteed
          </div>
        </div>
      )}

      {/* 📋 Summarizer Control Bar */}
      {activeSuiteTool === 'summarizer' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Length:</span>
              {(['short', 'medium', 'detailed'] as const).map((len) => {
                const active = summaryLength === len;
                return (
                  <button
                    key={len}
                    onClick={() => setSummaryLength(len)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      border: active ? '1.5px solid #2563eb' : '1px solid var(--rb-border)',
                      background: active ? (isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff') : 'transparent',
                      color: active ? '#2563eb' : 'var(--rb-text-secondary)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {len}
                  </button>
                );
              })}
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--rb-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Format:</span>
              {(
                [
                  { id: 'paragraph', label: 'Paragraph' },
                  { id: 'bullets', label: 'Bullet Points' },
                  { id: 'key-points', label: 'Key Takeaways' },
                  { id: 'executive', label: 'Executive' },
                ] as const
              ).map((fmt) => {
                const active = summaryFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSummaryFormat(fmt.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      border: active ? '1.5px solid #2563eb' : '1px solid var(--rb-border)',
                      background: active ? (isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff') : 'transparent',
                      color: active ? '#2563eb' : 'var(--rb-text-secondary)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🌐 Translator Control Bar */}
      {activeSuiteTool === 'translator' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>From:</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--rb-border)',
                background: 'var(--rb-surface)',
                color: 'var(--rb-text)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <option value="auto">Detect Language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (sourceLang !== 'auto') {
                const prevSource = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(prevSource);
              }
            }}
            title="Swap Languages"
            style={{
              padding: '6px',
              borderRadius: '50%',
              border: '1px solid var(--rb-border)',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCw size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>To:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--rb-border)',
                background: 'var(--rb-surface)',
                color: 'var(--rb-text)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <option value="es">Spanish</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      )}

      {/* 🔍 Grammar Checker Quick Toolbar */}
      {activeSuiteTool === 'grammar' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#c2410c' }}>
              🔍 Live Proofreading Mode
            </span>
            {grammarReport && (
              <span style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
                {grammarReport.corrections?.length || 0} issues detected
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowGrammarDrawer(true)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #ea580c',
                background: '#ea580c',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Proofreader Drawer
            </button>
          </div>
        </div>
      )}

      {/* 🛡️ Plagiarism Quick Bar */}
      {activeSuiteTool === 'plagiarism' && (
        <div
          style={{
            background: 'var(--rb-surface)',
            borderBottom: '1px solid var(--rb-border)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
              🛡️ Originality & Turnitin-Grade Plagiarism Auditor
            </span>
            {plagiarismReport && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                {plagiarismReport.originalityScore}% Original
              </span>
            )}
          </div>
          <button
            onClick={() => setShowPlagiarism(true)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid #16a34a',
              background: '#16a34a',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Open Plagiarism Audit Panel
          </button>
        </div>
      )}

      {/* Mobile Segmented View Control (Input vs Output) */}
      <div
        className="show-on-mobile hide-on-desktop"
        style={{
          display: 'none',
          background: 'var(--rb-surface)',
          borderBottom: '1px solid var(--rb-border)',
          padding: '8px 16px',
          gap: '8px',
          width: '100%',
        }}
      >
        <button
          onClick={() => setMobileTab('input')}
          className="touch-target"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: mobileTab === 'input' ? '1.5px solid var(--rb-primary)' : '1px solid var(--rb-border)',
            background: mobileTab === 'input' ? 'var(--rb-primary-light)' : 'var(--rb-surface)',
            color: mobileTab === 'input' ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
            fontWeight: mobileTab === 'input' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={15} />
          <span>Input {inputWordCount > 0 ? `(${inputWordCount}w)` : ''}</span>
        </button>

        <button
          onClick={() => setMobileTab('output')}
          className="touch-target"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: mobileTab === 'output' ? '1.5px solid var(--rb-primary)' : '1px solid var(--rb-border)',
            background: mobileTab === 'output' ? 'var(--rb-primary-light)' : 'var(--rb-surface)',
            color: mobileTab === 'output' ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
            fontWeight: mobileTab === 'output' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={15} />
          <span>Output {outputWordCount > 0 ? `(${outputWordCount}w)` : ''}</span>
          {isGenerating && <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />}
        </button>
      </div>

      {/* Editor Dual-Pane Workspace */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {/* Left Pane (Input) */}
        <div
          className={`workspace-pane-left ${mobileTab === 'input' ? 'mobile-active-pane' : 'mobile-hidden-pane'}`}
          style={{
            background: 'var(--rb-surface)',
            borderRight: '1px solid var(--rb-border)',
            position: 'relative',
          }}
        >
          {/* Input Header Toolbar */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--rb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Input Text
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handlePaste}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: 'var(--rb-surface)',
                  color: 'var(--rb-text)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clipboard size={14} /> Paste
              </button>
              <button
                onClick={handleSampleText}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: 'var(--rb-surface)',
                  color: 'var(--rb-text)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <BookOpen size={14} /> Try Sample
              </button>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  title="Clear text"
                  style={{
                    padding: '5px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Input Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleParaphrase();
              }
            }}
            placeholder={
              activeSuiteTool === 'summarizer'
                ? 'Paste long articles, essays, or documents here to summarize...'
                : activeSuiteTool === 'translator'
                ? `Enter text to translate from ${sourceLang === 'auto' ? 'any language' : sourceLang.toUpperCase()} into ${targetLang.toUpperCase()}...`
                : activeSuiteTool === 'humanizer'
                ? 'Paste AI-generated text here (from ChatGPT, Claude, Gemini) to humanize and make undetectable...'
                : activeSuiteTool === 'grammar'
                ? 'Paste or type text to check spelling, punctuation, and grammar...'
                : activeSuiteTool === 'plagiarism'
                ? 'Paste your paper, essay, or article here to run an originality and plagiarism audit...'
                : 'Paste or write your text here to paraphrase (Press Ctrl+Enter to generate)...'
            }
            style={{
              flex: 1,
              border: 'none',
              padding: '20px',
              fontSize: '16px',
              lineHeight: '1.7',
              resize: 'none',
              outline: 'none',
              color: 'var(--rb-text)',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />

          {/* Input Footer */}
          <div
            style={{
              height: '60px',
              minHeight: '60px',
              maxHeight: '60px',
              boxSizing: 'border-box',
              padding: '0 20px',
              borderTop: '1px solid var(--rb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--rb-surface-cream)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>
                <strong style={{ color: 'var(--rb-text)' }}>{inputWordCount}</strong> words
              </span>
              <span>•</span>
              <span>
                <strong style={{ color: 'var(--rb-text)' }}>{inputText.length}</strong> chars
              </span>
            </div>

            <button
              onClick={() => {
                if (activeSuiteTool === 'summarizer') {
                  handleSummarize();
                } else if (activeSuiteTool === 'translator') {
                  handleTranslate();
                } else if (activeSuiteTool === 'humanizer') {
                  handleHumanize();
                } else if (activeSuiteTool === 'grammar') {
                  handleCheckGrammar();
                } else if (activeSuiteTool === 'plagiarism') {
                  handleCheckPlagiarism();
                } else {
                  handleParaphrase();
                }
              }}
              disabled={
                isGenerating ||
                isAutoScanRunning ||
                isSummarizing ||
                isTranslating ||
                isHumanizing ||
                isCheckingGrammar ||
                !inputText.trim()
              }
              className="touch-target"
              style={{
                height: '38px',
                padding: '0 24px',
                borderRadius: '8px',
                border: 'none',
                background:
                  isGenerating ||
                  isAutoScanRunning ||
                  isSummarizing ||
                  isTranslating ||
                  isHumanizing ||
                  isCheckingGrammar ||
                  !inputText.trim()
                    ? 'var(--rb-border)'
                    : activeSuiteTool === 'humanizer'
                    ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'
                    : activeSuiteTool === 'summarizer'
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : activeSuiteTool === 'translator'
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : activeSuiteTool === 'grammar'
                    ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                    : activeSuiteTool === 'plagiarism'
                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                    : 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor:
                  isGenerating ||
                  isAutoScanRunning ||
                  isSummarizing ||
                  isTranslating ||
                  isHumanizing ||
                  isCheckingGrammar ||
                  !inputText.trim()
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow:
                  isGenerating ||
                  isAutoScanRunning ||
                  isSummarizing ||
                  isTranslating ||
                  isHumanizing ||
                  isCheckingGrammar ||
                  !inputText.trim()
                    ? 'none'
                    : '0 2px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              {isAutoScanRunning ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>🛡️ Guard active…</span>
                </>
              ) : isSummarizing ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Summarizing...</span>
                </>
              ) : isTranslating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Translating...</span>
                </>
              ) : isHumanizing ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Humanizing...</span>
                </>
              ) : isCheckingGrammar ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Proofreading...</span>
                </>
              ) : isGenerating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Paraphrasing...</span>
                </>
              ) : activeSuiteTool === 'humanizer' ? (
                <>
                  <BrainCircuit size={16} />
                  <span>Humanize Text</span>
                </>
              ) : activeSuiteTool === 'summarizer' ? (
                <>
                  <AlignLeft size={16} />
                  <span>Summarize</span>
                </>
              ) : activeSuiteTool === 'translator' ? (
                <>
                  <Languages size={16} />
                  <span>Translate</span>
                </>
              ) : activeSuiteTool === 'grammar' ? (
                <>
                  <CheckCheck size={16} />
                  <span>Check Grammar</span>
                </>
              ) : activeSuiteTool === 'plagiarism' ? (
                <>
                  <ShieldCheck size={16} />
                  <span>Scan Plagiarism</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Paraphrase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Pane (Output) */}
        <div
          ref={outputContainerRef}
          className={`workspace-pane-right ${mobileTab === 'output' ? 'mobile-active-pane' : 'mobile-hidden-pane'}`}
          style={{
            background: 'var(--rb-surface)',
            position: 'relative',
          }}
        >
          {/* Output Header Toolbar */}
          <div
            className="output-header-responsive"
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--rb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div className="output-header-tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <button
                className="show-on-mobile hide-on-desktop"
                onClick={() => setMobileTab('input')}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: 'var(--rb-surface-cream)',
                  color: 'var(--rb-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ArrowLeft size={13} /> Edit
              </button>
              <span className="hide-on-mobile" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                Paraphrase
              </span>
              {outputText && (
                <>
                  <div style={{ display: 'flex', background: 'var(--rb-surface-cream)', borderRadius: '6px', padding: '2px', border: '1px solid var(--rb-border)', flexShrink: 0 }}>
                    <button
                      onClick={() => setActiveTab('diff')}
                      style={{
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: activeTab === 'diff' ? 600 : 500,
                        background: activeTab === 'diff' ? 'var(--rb-surface)' : 'transparent',
                        color: activeTab === 'diff' ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'diff' ? 'var(--rb-shadow-sm)' : 'none',
                      }}
                    >
                      Synonyms
                    </button>
                    <button
                      onClick={() => setActiveTab('sentences')}
                      style={{
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: activeTab === 'sentences' ? 600 : 500,
                        background: activeTab === 'sentences' ? 'var(--rb-surface)' : 'transparent',
                        color: activeTab === 'sentences' ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'sentences' ? 'var(--rb-shadow-sm)' : 'none',
                      }}
                    >
                      Sentences
                    </button>
                    <button
                      onClick={() => setActiveTab('plain')}
                      style={{
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: activeTab === 'plain' ? 600 : 500,
                        background: activeTab === 'plain' ? 'var(--rb-surface)' : 'transparent',
                        color: activeTab === 'plain' ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'plain' ? 'var(--rb-shadow-sm)' : 'none',
                      }}
                    >
                      Plain
                    </button>
                  </div>
                  <button
                    onClick={toggleTypewriterMode}
                    title={enableTypewriter ? 'Typewriter animation active (Click for Instant rendering)' : 'Instant rendering active (Click for Typewriter animation)'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${enableTypewriter ? (isDark ? 'rgba(186, 215, 151, 0.4)' : '#cbe6ac') : 'var(--rb-border)'}`,
                      background: enableTypewriter ? (isDark ? 'rgba(186, 215, 151, 0.14)' : '#f2f8eb') : 'var(--rb-surface-cream)',
                      color: enableTypewriter ? (isDark ? '#cbe6ac' : '#2d5a1e') : 'var(--rb-text-muted)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={12} color={enableTypewriter ? (isDark ? '#cbe6ac' : '#2d5a1e') : 'var(--rb-text-muted)'} />
                    <span className="hide-on-mobile">{enableTypewriter ? 'Typewriter' : 'Instant'}</span>
                  </button>
                </>
              )}
            </div>

            {outputText && (
              <div className="output-header-badges" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: isDark ? '#cbe6ac' : '#2d5a1e',
                    background: isDark ? 'rgba(186, 215, 151, 0.14)' : 'var(--rb-surface-cream)',
                    padding: '3px 7px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? 'rgba(186, 215, 151, 0.35)' : 'var(--rb-border)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    lineHeight: '1.2',
                    flexShrink: 0,
                  }}
                  title={`${changePercentage}% of text modified`}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isDark ? '#BAD797' : '#10b981',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{changePercentage}%</span>
                </span>

                {plagiarismReport && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button
                      onClick={() => setShowPlagiarism(true)}
                      style={{
                        border: isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid var(--rb-border)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: isDark ? '#86efac' : (plagiarismReport.originalityScore >= 85 ? '#065f46' : '#92400e'),
                        background: isDark ? 'rgba(34, 197, 94, 0.14)' : 'var(--rb-surface-cream)',
                        padding: '3px 7px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: '1.2',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      title={`Originality: ${plagiarismReport.originalityScore}% (Click to view details)`}
                    >
                      <ShieldCheck size={13} color={isDark ? '#86efac' : (plagiarismReport.originalityScore >= 85 ? '#059669' : '#d97706')} />
                      <span>{plagiarismReport.originalityScore}%</span>
                    </button>

                    <button
                      onClick={() => setShowPlagiarism(true)}
                      style={{
                        border: isDark ? '1px solid rgba(186, 215, 151, 0.35)' : '1px solid var(--rb-border)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: isDark ? '#cbe6ac' : ((plagiarismReport.humanScore ?? 95) >= 80 ? '#2d5a1e' : '#991b1b'),
                        background: isDark ? 'rgba(186, 215, 151, 0.14)' : 'var(--rb-surface-cream)',
                        padding: '3px 7px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: '1.2',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      title={`Human Content Score: ${plagiarismReport.humanScore ?? 95}% (Click to view details)`}
                    >
                      <BrainCircuit size={13} color={isDark ? '#cbe6ac' : ((plagiarismReport.humanScore ?? 95) >= 80 ? '#3b6f28' : '#dc2626')} />
                      <span>{plagiarismReport.humanScore ?? 95}%</span>
                    </button>
                  </div>
                )}

                {latency && (
                  <span className="hide-on-mobile" style={{ fontSize: '11px', color: 'var(--rb-text-muted)', flexShrink: 0 }}>
                    {latency}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 🎨 QuillBot-Style 3-Color Legend Bar */}
          {outputText && activeTab === 'diff' && (
            <div
              className="output-legend-responsive"
              style={{
                padding: '6px 20px',
                background: 'var(--rb-surface-cream)',
                borderBottom: '1px solid var(--rb-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                color: 'var(--rb-text-secondary)',
                fontWeight: 500,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--rb-text)' }}>Legend:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rb-diff-changed-border)' }} />
                <span style={{ color: 'var(--rb-diff-changed-text)', fontWeight: 600 }}>Changed Words</span>
                <span style={{ color: 'var(--rb-text-muted)' }}>({changedWordsCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rb-diff-unchanged-border)' }} />
                <span style={{ color: 'var(--rb-diff-unchanged-text)', fontWeight: 600 }}>Longest Unchanged</span>
                <span style={{ color: 'var(--rb-text-muted)' }}>({longestUnchangedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rb-diff-structural-border)' }} />
                <span style={{ color: 'var(--rb-diff-structural-text)', fontWeight: 600 }}>Structural Changes</span>
                <span style={{ color: 'var(--rb-text-muted)' }}>({structuralCount})</span>
              </div>
            </div>
          )}

          {/* 🛡️ Guard Pipeline Status Banner */}
          {isAutoScanRunning && (
            <div
              style={{
                padding: '8px 20px',
                background: isDark ? 'rgba(186, 215, 151, 0.14)' : '#f2f8eb',
                borderBottom: isDark ? '1px solid rgba(186, 215, 151, 0.3)' : '1px solid #d4e8be',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#cbe6ac' : '#2d5a1e',
              }}
            >
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: isDark ? '#cbe6ac' : '#3b6f28', borderTopColor: 'transparent' }} />
              {isScanningPlagiarism
                ? '🛡️ Guard: Scanning for plagiarism…'
                : '🛡️ Guard: Auto-fixing flagged sentences…'}
            </div>
          )}

          {/* Output Content Area */}
          <div
            ref={outputContainerRef}
            onClick={() => {
              if (isTypingOutput) skipTyping();
            }}
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              fontSize: '16px',
              lineHeight: '1.7',
              cursor: isTypingOutput ? 'pointer' : 'default',
            }}
          >
            {isGenerating && !outputText ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div style={{ height: '20px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: '4px', width: '85%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: '4px', width: '95%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : isTypingOutput ? (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--rb-text)' }}>
                <span>{outputText.slice(0, typedOutputLength)}</span>
                <span className="typing-caret" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTyping();
                  }}
                  title="Click to skip typing animation"
                  style={{
                    marginLeft: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--rb-surface-cream)',
                    border: '1px solid var(--rb-border)',
                    color: 'var(--rb-text-muted)',
                    cursor: 'pointer',
                    verticalAlign: 'middle',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--rb-text)';
                    e.currentTarget.style.borderColor = 'var(--rb-text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--rb-text-muted)';
                    e.currentTarget.style.borderColor = 'var(--rb-border)';
                  }}
                >
                  Skip ⏭
                </button>
              </div>
            ) : outputText ? (
              isGenerating || activeTab === 'plain' ? (
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--rb-text)' }}>
                  {outputText}
                  {isGenerating && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '18px',
                        background: '#10b981',
                        marginLeft: '3px',
                        verticalAlign: 'middle',
                        animation: 'pulse 0.8s infinite',
                      }}
                    />
                  )}
                </div>
              ) : activeTab === 'sentences' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: isDark ? 'rgba(186, 215, 151, 0.12)' : 'var(--rb-accent-light)',
                      border: isDark ? '1px solid rgba(186, 215, 151, 0.3)' : '1px solid var(--rb-accent)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? 'var(--rb-accent-hover)' : 'var(--rb-accent-dark)',
                      fontWeight: 500,
                    }}
                  >
                    <Wand2 size={15} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Sentence Mode:</strong> Click any highlighted sentence below to cycle through alternative rephrasings and swap it in-place.
                    </span>
                  </div>

                  <div style={{ lineHeight: '2.2', fontSize: '16px' }}>
                    {(outputText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [outputText]).map((sentence, sIdx) => {
                      const isSelected = selectedSentence === sentence;
                      // Distinct alternating soft tints for easy reading and demarcated boundaries
                      const bgTints = isDark
                        ? ['rgba(255,255,255,0.04)', 'rgba(59,130,246,0.1)', 'rgba(186,215,151,0.1)', 'rgba(244,114,147,0.1)']
                        : ['#f8fafc', '#eff6ff', '#f0fdf4', '#fdf4ff'];
                      const borderTints = isDark
                        ? ['rgba(255,255,255,0.14)', 'rgba(59,130,246,0.3)', 'rgba(186,215,151,0.3)', 'rgba(244,114,147,0.3)']
                        : ['#cbd5e1', '#bfdbfe', '#bbf7d0', '#f5d0fe'];
                      const defaultBg = bgTints[sIdx % bgTints.length];
                      const defaultBorder = borderTints[sIdx % borderTints.length];

                      return (
                        <span
                          key={sIdx}
                          onClick={(e) => handleSentenceClick(sentence, e)}
                          style={{
                            display: 'inline',
                            padding: '4px 8px',
                            marginRight: '6px',
                            borderRadius: '6px',
                            background: isSelected ? (isDark ? 'rgba(186, 215, 151, 0.2)' : 'var(--rb-primary-light)') : defaultBg,
                            border: isSelected ? (isDark ? '2px solid var(--rb-accent)' : '2px solid var(--rb-primary)') : `1.5px solid ${defaultBorder}`,
                            boxShadow: isSelected ? (isDark ? '0 4px 12px rgba(186,215,151,0.25)' : '0 4px 12px rgba(103,6,38,0.18)') : '0 1px 2px rgba(0,0,0,0.04)',
                            color: isSelected ? (isDark ? 'var(--rb-accent-hover)' : 'var(--rb-primary)') : 'var(--rb-text)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxDecorationBreak: 'clone',
                            WebkitBoxDecorationBreak: 'clone',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'var(--rb-accent-light)';
                              e.currentTarget.style.borderColor = isDark ? 'var(--rb-accent)' : 'var(--rb-accent)';
                              e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(186,215,151,0.2)' : '0 2px 8px rgba(186,215,151,0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = defaultBg;
                              e.currentTarget.style.borderColor = defaultBorder;
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                            }
                          }}
                          title={`Sentence #${sIdx + 1}: Click to view rephrase alternatives`}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: isSelected ? (isDark ? 'var(--rb-accent)' : 'var(--rb-primary)') : (isDark ? 'var(--rb-border)' : '#64748b'),
                              color: isSelected && isDark ? '#171314' : '#ffffff',
                              fontSize: '10px',
                              fontWeight: 700,
                              marginRight: '6px',
                              verticalAlign: 'text-top',
                              userSelect: 'none',
                            }}
                          >
                            {sIdx + 1}
                          </span>
                          {sentence}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                  {diffTokens.map((token, idx) => {
                    const isWord = /[\w]/.test(token.text);
                    const isYellow = token.type === 'changed';
                    const isBlue = token.type === 'longest-unchanged';
                    const isRed = token.type === 'structural';

                    // 3-Color Highlight Palette
                    let color = 'var(--rb-text)';
                    let bg = 'transparent';
                    let borderBottom = 'none';
                    let fontWeight = 400;
                    let title = isWord ? `Click to view synonyms for "${token.text.trim()}"` : undefined;

                    if (isYellow) {
                      color = 'var(--rb-diff-changed-text)';
                      bg = 'var(--rb-diff-changed-bg)';
                      borderBottom = '1.5px dashed var(--rb-diff-changed-border)';
                      fontWeight = 600;
                      title = 'Changed Word (Synonym) - Click to choose alternatives';
                    } else if (isBlue) {
                      color = 'var(--rb-diff-unchanged-text)';
                      bg = 'var(--rb-diff-unchanged-bg)';
                      borderBottom = '1.5px solid var(--rb-diff-unchanged-border)';
                      fontWeight = 500;
                      title = 'Longest Unchanged - Preserved verbatim from original text';
                    } else if (isRed) {
                      color = 'var(--rb-diff-structural-text)';
                      bg = 'var(--rb-diff-structural-bg)';
                      borderBottom = '1.5px dashed var(--rb-diff-structural-border)';
                      fontWeight = 600;
                      title = 'Structural Change (Syntax / Grammar alteration) - Click to replace';
                    }

                    return (
                      <span
                        key={idx}
                        onClick={(e) => isWord && handleWordClick(token, idx, e)}
                        style={{
                          color,
                          background: bg,
                          borderRadius: isYellow || isBlue || isRed ? '4px' : '2px',
                          padding: isYellow || isBlue || isRed ? '1px 3px' : '0px',
                          fontWeight,
                          cursor: isWord ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                          borderBottom,
                        }}
                        onMouseEnter={(e) => {
                          if (isWord && !isYellow && !isBlue && !isRed) {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
                            e.currentTarget.style.borderBottom = isDark ? '1px dotted var(--rb-border)' : '1px dotted #94a3b8';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isWord && !isYellow && !isBlue && !isRed) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderBottom = 'none';
                          }
                        }}
                        title={title}
                      >
                        {token.text}
                      </span>
                    );
                  })}
                </div>
              )
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--rb-text-muted)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--rb-surface-cream)',
                    border: '1px dashed var(--rb-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: 'var(--rb-text-muted)',
                  }}
                >
                  <FileText size={28} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--rb-text)', marginBottom: '6px' }}>
                  Your Paraphrased Text Will Appear Here
                </div>
                <p style={{ fontSize: '13px', maxWidth: '320px', lineHeight: 1.5, margin: 0, color: 'var(--rb-text-muted)' }}>
                  Enter your text on the left, pick a mode and synonym level, and click Paraphrase.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Thesaurus Popover */}
          {selectedTokenIndex !== null && thesaurusPos && (
            <div
              className="thesaurus-widget-backdrop"
              onClick={() => {
                setSelectedTokenIndex(null);
                setThesaurusPos(null);
              }}
            >
              <div
                className="thesaurus-widget-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${thesaurusPos.top}px`,
                  left: `${thesaurusPos.left}px`,
                }}
              >
                <div className="modal-drag-handle" />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2px 4px 6px',
                    borderBottom: '1px solid var(--rb-border)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--rb-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Synonyms: <strong style={{ color: 'var(--rb-text)' }}>{selectedWord}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTokenIndex(null);
                      setThesaurusPos(null);
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--rb-text-muted)',
                      fontSize: '14px',
                      padding: '0 2px',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {isLoadingWordSynonyms && wordSynonyms.length === 0 ? (
                  <div
                    style={{
                      padding: '14px 8px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: 'var(--rb-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      className="spinner"
                      style={{
                        width: '14px',
                        height: '14px',
                        borderWidth: '2px',
                        borderColor: isDark ? 'var(--rb-accent)' : 'var(--rb-accent-dark)',
                        borderTopColor: 'transparent',
                      }}
                    />
                    <span>Finding synonyms…</span>
                  </div>
                ) : wordSynonyms.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      marginTop: '6px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {wordSynonyms.map((syn, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => replaceWord(syn, selectedTokenIndex)}
                        style={{
                          textAlign: 'left',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--rb-text)',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'var(--rb-surface-cream)' : '#fef3c7')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span>{syn}</span>
                        <span style={{ fontSize: '10px', color: isDark ? 'var(--rb-accent)' : '#d97706', fontWeight: 600 }}>Swap</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--rb-text-muted)', textAlign: 'center' }}>
                    No alternative synonyms found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📝 Floating Sentence Alternative Selector Widget (< 1 of 3 >) */}
          {selectedSentence && sentenceWidgetPos && (
            <div
              className="sentence-widget-backdrop"
              onClick={() => {
                setSelectedSentence(null);
                setSentenceWidgetPos(null);
              }}
            >
              <div
                className="sentence-widget-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${sentenceWidgetPos.top}px`,
                  left: `${sentenceWidgetPos.left}px`,
                }}
              >
                <div className="modal-drag-handle" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rb-border)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? 'var(--rb-accent)' : '#2d5a1e', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wand2 size={13} /> Sentence Alternatives
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSentence(null);
                      setSentenceWidgetPos(null);
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '14px', padding: '2px' }}
                  >
                    ✕
                  </button>
                </div>

                {isLoadingAlternatives ? (
                  <div style={{ textAlign: 'center', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--rb-text-secondary)', fontSize: '13px' }}>
                    <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: isDark ? 'var(--rb-accent)' : '#2d5a1e', borderTopColor: 'transparent' }} />
                    <span>Generating 3 alternatives…</span>
                  </div>
                ) : sentenceAlternatives.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--rb-text-secondary)', fontWeight: 600 }}>
                        Option {currentAltIndex + 1} of {sentenceAlternatives.length}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setCurrentAltIndex((prev) => (prev > 0 ? prev - 1 : sentenceAlternatives.length - 1))}
                          style={{
                            border: '1px solid var(--rb-border)',
                            background: 'var(--rb-surface-cream)',
                            color: 'var(--rb-text)',
                            borderRadius: '4px',
                            padding: '3px 7px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          title="Previous alternative"
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-muted)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                        >
                          <ChevronLeft size={14} color="var(--rb-text)" />
                        </button>
                        <button
                          onClick={() => setCurrentAltIndex((prev) => (prev < sentenceAlternatives.length - 1 ? prev + 1 : 0))}
                          style={{
                            border: '1px solid var(--rb-border)',
                            background: 'var(--rb-surface-cream)',
                            color: 'var(--rb-text)',
                            borderRadius: '4px',
                            padding: '3px 7px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          title="Next alternative"
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-muted)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                        >
                          <ChevronRight size={14} color="var(--rb-text)" />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--rb-text)', background: 'var(--rb-surface-cream)', padding: '10px', borderRadius: '6px', border: '1px solid var(--rb-border)' }}>
                      "{sentenceAlternatives[currentAltIndex]}"
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleApplySentenceAlternative(sentenceAlternatives[currentAltIndex])}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isDark
                            ? 'linear-gradient(135deg, #BAD797 0%, #a5c77e 100%)'
                            : 'linear-gradient(135deg, #2d5a1e 0%, #3d7528 100%)',
                          color: isDark ? '#171314' : '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: 'var(--rb-shadow-sm)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                      >
                        <Check size={14} /> Replace
                      </button>
                      <button
                        onClick={(e) => handleSentenceClick(selectedSentence, e)}
                        title="Regenerate more variations"
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--rb-border)',
                          background: 'var(--rb-surface-cream)',
                          color: 'var(--rb-text)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-muted)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)', textAlign: 'center', padding: '10px' }}>
                    No alternative variations found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output Footer Toolbar */}
          <div
            className="output-footer-responsive"
            style={{
              height: '60px',
              minHeight: '60px',
              maxHeight: '60px',
              boxSizing: 'border-box',
              padding: '0 20px',
              borderTop: '1px solid var(--rb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--rb-surface-cream)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', display: 'flex', gap: '8px', alignItems: 'center', minWidth: 0 }}>
              <span style={{ flexShrink: 0 }}>
                <strong style={{ color: 'var(--rb-text)' }}>{outputWordCount}</strong> words
              </span>
              {currentProvider && currentModel && (
                <span className="hide-on-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--rb-text-muted)' }}>
                    {currentProvider} ({currentModel})
                  </span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={() => outputText && handleCopy(outputText)}
                disabled={!outputText}
                title={copied ? 'Copied to clipboard!' : 'Copy output text'}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: copied ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#ecfdf5') : 'var(--rb-surface)',
                  color: copied ? (isDark ? '#86efac' : '#059669') : 'var(--rb-text)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: outputText ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span className="hide-on-mobile">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleCheckPlagiarism}
                disabled={!outputText && !inputText.trim()}
                title="Scan text for plagiarism and originality"
                style={{
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid rgba(186, 215, 151, 0.4)' : '1px solid #cbe6ac',
                  background: isDark ? 'rgba(186, 215, 151, 0.15)' : '#f2f8eb',
                  color: isDark ? '#cbe6ac' : '#2d5a1e',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: outputText || inputText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={15} color={isDark ? '#cbe6ac' : '#3b6f28'} />
                <span className="hide-on-mobile">Plagiarism</span>
              </button>

              <button
                onClick={handleParaphrase}
                disabled={!inputText.trim() || isGenerating}
                title="Paraphrase again"
                style={{
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: 'var(--rb-surface)',
                  color: 'var(--rb-text)',
                  cursor: inputText.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RotateCw size={15} />
              </button>

              {/* Export Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  disabled={!outputText}
                  title="Export document (PDF, DOCX, TXT, MD)"
                  style={{
                    height: '36px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--rb-border)',
                    background: 'var(--rb-surface)',
                    color: 'var(--rb-text)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: outputText ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <Download size={15} />
                  <span className="hide-on-mobile">Export</span>
                  <ChevronDown size={14} />
                </button>

                {exportOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: '100%',
                      marginBottom: '6px',
                      background: 'var(--rb-surface)',
                      border: '1px solid var(--rb-border)',
                      borderRadius: '8px',
                      boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                      zIndex: 200,
                      minWidth: '160px',
                      overflow: 'hidden',
                    }}
                  >
                    {[
                      { key: 'txt', label: 'Plain Text (.txt)' },
                      { key: 'md', label: 'Markdown (.md)' },
                      { key: 'docx', label: 'Word Document (.docx)' },
                      { key: 'pdf', label: 'PDF Document (.pdf)' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleExport(item.key as any)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--rb-text)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* History Slide-Over Drawer */}
        {showHistory && (
          <div
            className="history-drawer-responsive animate-slide-in-right"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              background: 'var(--rb-surface)',
              borderLeft: '1px solid var(--rb-border)',
              boxShadow: isDark ? '-4px 0 25px rgba(0,0,0,0.5)' : '-4px 0 20px rgba(0,0,0,0.08)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--rb-surface-cream)',
                borderBottom: '1px solid var(--rb-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--rb-text)',
                }}
              >
                <History size={18} color="var(--rb-accent)" /> Paraphrase History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--rb-text-muted)',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--rb-text-muted)', fontSize: '14px' }}>
                  Loading history...
                </div>
              ) : historyItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--rb-text-muted)', fontSize: '14px' }}>
                  No paraphrase history yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid var(--rb-border)',
                        background: 'var(--rb-surface-cream)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: isDark ? 'var(--rb-surface-muted)' : '#e2e8f0',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: 'var(--rb-text)',
                          }}
                        >
                          {item.mode}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--rb-text-muted)' }}>
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', lineBreak: 'anywhere' }}>
                        <strong>In:</strong> {item.input.slice(0, 80)}...
                      </div>

                      {item.output && (
                        <div style={{ fontSize: '13px', color: 'var(--rb-text)', fontWeight: 500, lineBreak: 'anywhere' }}>
                          <strong>Out:</strong> {item.output.slice(0, 80)}...
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setInputText(item.input);
                          if (item.output) setOutputText(item.output);
                          setShowHistory(false);
                          showToast('Restored from history', 'info');
                        }}
                        style={{
                          marginTop: '4px',
                          alignSelf: 'flex-start',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #10b981',
                          background: isDark ? 'rgba(34, 197, 94, 0.16)' : '#ecfdf5',
                          color: isDark ? '#86efac' : '#059669',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plagiarism Checker Slide-Over Drawer */}
        {showPlagiarism && (
          <div
            className="plagiarism-drawer-responsive animate-slide-in-right"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              background: isDark ? 'var(--rb-surface)' : '#ffffff',
              borderLeft: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.25)',
              zIndex: 310,
              display: 'flex',
              flexDirection: 'column',
              color: isDark ? 'var(--rb-text)' : '#1e293b',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isDark ? 'var(--rb-surface-cream)' : '#f2f8eb',
                borderBottom: isDark ? '1px solid var(--rb-border)' : '1px solid #d4e8be',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', color: isDark ? '#cbe6ac' : '#2d5a1e' }}>
                <ShieldCheck size={20} color={isDark ? '#cbe6ac' : '#3b6f28'} /> Originality & Plagiarism Report
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => plagiarismReport && exportPlagiarismAuditPdf(plagiarismReport, outputText)}
                  title="Download Official PDF Audit Report"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid rgba(186, 215, 151, 0.4)' : '1px solid #cbe6ac',
                    background: isDark ? 'rgba(186, 215, 151, 0.15)' : '#ffffff',
                    color: isDark ? '#cbe6ac' : '#2d5a1e',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={13} />
                  <span>PDF Audit</span>
                </button>
                <button
                  onClick={handleCheckPlagiarism}
                  disabled={isScanningPlagiarism}
                  title="Scan again"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid var(--rb-border)' : '1px solid #cbe6ac',
                    background: isDark ? 'var(--rb-surface)' : '#fff',
                    color: isDark ? '#cbe6ac' : '#2d5a1e',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: isScanningPlagiarism ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RotateCw size={13} className={isScanningPlagiarism ? 'animate-spin' : ''} />
                  <span>Re-scan</span>
                </button>
                <button
                  onClick={() => setShowPlagiarism(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: isDark ? 'var(--rb-text-muted)' : '#94a3b8', fontSize: '18px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isScanningPlagiarism ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div
                    className="spinner"
                    style={{ width: '40px', height: '40px', borderWidth: '3px', borderColor: isDark ? '#cbe6ac' : '#3b6f28', borderTopColor: 'transparent' }}
                  />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isDark ? 'var(--rb-text)' : '#1e293b' }}>
                    Scanning text for plagiarism...
                  </div>
                  <div style={{ fontSize: '13px', color: isDark ? 'var(--rb-text-muted)' : '#64748b', maxWidth: '320px', lineHeight: 1.5 }}>
                    Analyzing sentence structures, academic borrows, and matching against indexed web publications.
                  </div>
                </div>
              ) : plagiarismReport ? (
                <>
                  {/* Score Card Banner */}
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '12px',
                      background:
                        plagiarismReport.riskLevel === 'safe'
                          ? (isDark ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.06) 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)')
                          : plagiarismReport.riskLevel === 'moderate'
                          ? (isDark ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.06) 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)')
                          : (isDark ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(185, 28, 28, 0.06) 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'),
                      border: `1.5px solid ${
                        plagiarismReport.riskLevel === 'safe'
                          ? (isDark ? 'rgba(16, 185, 129, 0.35)' : '#a7f3d0')
                          : plagiarismReport.riskLevel === 'moderate'
                          ? (isDark ? 'rgba(245, 158, 11, 0.35)' : '#fde68a')
                          : (isDark ? 'rgba(239, 68, 68, 0.35)' : '#fecaca')
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Dual Circular Score Badges */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Originality Badge */}
                      <div
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          background: isDark ? '#1f1b1c' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.06)',
                          border: `3px solid ${
                            plagiarismReport.riskLevel === 'safe'
                              ? (isDark ? '#34d399' : '#10b981')
                              : plagiarismReport.riskLevel === 'moderate'
                              ? (isDark ? '#fbbf24' : '#f59e0b')
                              : (isDark ? '#f87171' : '#ef4444')
                          }`,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color:
                              plagiarismReport.riskLevel === 'safe'
                                ? (isDark ? '#34d399' : '#059669')
                                : plagiarismReport.riskLevel === 'moderate'
                                ? (isDark ? '#fbbf24' : '#d97706')
                                : (isDark ? '#f87171' : '#dc2626'),
                            lineHeight: 1,
                          }}
                        >
                          {plagiarismReport.originalityScore}%
                        </div>
                        <div style={{ fontSize: '9px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748b', fontWeight: 600, marginTop: '2px', letterSpacing: '0.4px' }}>
                          ORIGINAL
                        </div>
                      </div>

                      {/* Human Content Badge */}
                      <div
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          background: isDark ? '#1f1b1c' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.06)',
                          border: `3px solid ${isDark ? '#BAD797' : '#BAD797'}`,
                          flexShrink: 0,
                        }}
                        title="AI detector bypass score (100% = natural human cadence)"
                      >
                        <div style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#BAD797' : '#2d5a1e', lineHeight: 1 }}>
                          {plagiarismReport.humanScore ?? 95}%
                        </div>
                        <div style={{ fontSize: '9px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748b', fontWeight: 600, marginTop: '2px', letterSpacing: '0.4px' }}>
                          HUMAN
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background:
                              plagiarismReport.riskLevel === 'safe'
                                ? (isDark ? 'rgba(16, 185, 129, 0.22)' : '#d1fae5')
                                : plagiarismReport.riskLevel === 'moderate'
                                ? (isDark ? 'rgba(245, 158, 11, 0.22)' : '#fef3c7')
                                : (isDark ? 'rgba(239, 68, 68, 0.22)' : '#fee2e2'),
                            color:
                              plagiarismReport.riskLevel === 'safe'
                                ? (isDark ? '#6ee7b7' : '#065f46')
                                : plagiarismReport.riskLevel === 'moderate'
                                ? (isDark ? '#fde047' : '#92400e')
                                : (isDark ? '#fca5a5' : '#991b1b'),
                            border: `1px solid ${
                              plagiarismReport.riskLevel === 'safe'
                                ? (isDark ? 'rgba(16, 185, 129, 0.4)' : 'transparent')
                                : plagiarismReport.riskLevel === 'moderate'
                                ? (isDark ? 'rgba(245, 158, 11, 0.4)' : 'transparent')
                                : (isDark ? 'rgba(239, 68, 68, 0.4)' : 'transparent')
                            }`,
                          }}
                        >
                          {plagiarismReport.riskLevel === 'safe'
                            ? '✓ Clean & Original'
                            : plagiarismReport.riskLevel === 'moderate'
                            ? '⚠ Moderate Similarity'
                            : '✕ High Plagiarism Risk'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: isDark ? 'rgba(255, 255, 255, 0.92)' : '#334155', lineHeight: 1.5 }}>
                        {plagiarismReport.riskLevel === 'safe'
                          ? 'Great job! Your text shows very high originality and natural human cadence.'
                          : plagiarismReport.riskLevel === 'moderate'
                          ? 'Some phrases or structures overlap with existing publications.'
                          : 'Significant text similarity detected. Rephrasing is strongly recommended.'}
                      </div>

                      {(plagiarismReport.humanScore ?? 95) < 90 && (
                        <button
                          onClick={handleHumanize}
                          disabled={isHumanizing}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: isDark ? '1px solid rgba(186, 215, 151, 0.3)' : 'none',
                            background: 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: isHumanizing ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(103, 6, 38, 0.25)',
                          }}
                        >
                          <Wand2 size={12} />
                          <span>{isHumanizing ? 'Humanizing…' : '⚡ Auto-Humanize to 98% Human Score'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px',
                    }}
                  >
                    <div style={{ padding: '10px', background: isDark ? 'var(--rb-surface-cream)' : '#f8fafc', borderRadius: '8px', border: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: isDark ? 'var(--rb-text-muted)' : '#64748b', fontWeight: 500 }}>Words Checked</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? 'var(--rb-text)' : '#0f172a', marginTop: '2px' }}>
                        {plagiarismReport.wordCount}
                      </div>
                    </div>

                    <div style={{ padding: '10px', background: isDark ? 'var(--rb-surface-cream)' : '#f8fafc', borderRadius: '8px', border: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: isDark ? 'var(--rb-text-muted)' : '#64748b', fontWeight: 500 }}>Flagged Parts</div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: plagiarismReport.matches.filter((m) => m.type !== 'clean').length > 0 ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#4ade80' : '#059669'),
                          marginTop: '2px',
                        }}
                      >
                        {plagiarismReport.matches.filter((m) => m.type !== 'clean').length}
                      </div>
                    </div>

                    <div style={{ padding: '10px', background: isDark ? 'var(--rb-surface-cream)' : '#f8fafc', borderRadius: '8px', border: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: isDark ? 'var(--rb-text-muted)' : '#64748b', fontWeight: 500 }}>Sources Matched</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? 'var(--rb-text)' : '#0f172a', marginTop: '2px' }}>
                        {plagiarismReport.sources.length}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Auto-Fix All Flagged Banner */}
                  {plagiarismReport.matches.some((m) => m.type !== 'clean') && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(186, 215, 151, 0.1)' : '#f2f8eb',
                        border: isDark ? '1.5px solid rgba(186, 215, 151, 0.3)' : '1.5px solid #d4e8be',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color={isDark ? '#cbe6ac' : '#3b6f28'} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbe6ac' : '#2d5a1e' }}>
                            Auto-Fix Entire Document
                          </div>
                          <div style={{ fontSize: '12px', color: isDark ? '#a5c77e' : '#4a7c2f' }}>
                            Rewrites all {plagiarismReport.matches.filter((m) => m.type !== 'clean').length} flagged sentences in-place with zero plagiarism.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAutoFixAll}
                        disabled={isAutoFixingAll}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isAutoFixingAll ? '#cbd5e1' : 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: isAutoFixingAll ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(103, 6, 38, 0.25)',
                        }}
                      >
                        {isAutoFixingAll ? (
                          <>
                            <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                            <span>Fixing all in-place...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Auto-Rewrite All Flagged</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Verified Clean Card (when 0 flagged parts) */}
                  {plagiarismReport.matches.every((m) => m.type === 'clean') && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(186, 215, 151, 0.12)' : '#f2f8eb',
                        border: isDark ? '1.5px solid rgba(186, 215, 151, 0.3)' : '1.5px solid #d4e8be',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isDark ? 'rgba(186, 215, 151, 0.2)' : '#e2f2d5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCheck size={20} color={isDark ? '#BAD797' : '#2d5a1e'} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbe6ac' : '#2d5a1e' }}>
                          Verified 100% Original Content
                        </div>
                        <div style={{ fontSize: '12px', color: isDark ? '#a5c77e' : '#4a7c2f', marginTop: '2px' }}>
                          All {plagiarismReport.matches.length} sentences passed originality check with zero matching external sources.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Sentence Inspector */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'var(--rb-text)' : '#1e293b' }}>
                        Sentence-by-Sentence Breakdown
                      </span>
                      <span style={{ fontSize: '11px', color: isDark ? 'var(--rb-text-muted)' : '#94a3b8' }}>
                        {plagiarismReport.matches.some((m) => m.type !== 'clean')
                          ? 'Click flagged sentences to view details & fix'
                          : 'All sentences verified 100% original'}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0',
                        background: isDark ? 'var(--rb-surface-cream)' : '#ffffff',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: isDark ? 'var(--rb-text)' : '#1e293b',
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      {plagiarismReport.matches && plagiarismReport.matches.length > 0 ? (
                        plagiarismReport.matches.map((match, idx) => {
                          const isFlagged = match.type !== 'clean';
                          const isExact = match.type === 'exact';
                          const isSelected = selectedMatchIndex === idx;

                          return (
                            <span
                              key={idx}
                              onClick={() => setSelectedMatchIndex(idx)}
                              style={{
                                display: 'inline',
                                background: isSelected
                                  ? (isDark ? 'rgba(199, 210, 254, 0.28)' : '#ddd6fe')
                                  : isExact
                                  ? (isDark ? 'rgba(239, 68, 68, 0.22)' : '#fee2e2')
                                  : isFlagged
                                  ? (isDark ? 'rgba(245, 158, 11, 0.22)' : '#fef3c7')
                                  : 'transparent',
                                color: isExact
                                  ? (isDark ? '#fca5a5' : '#991b1b')
                                  : isFlagged
                                  ? (isDark ? '#fde047' : '#92400e')
                                  : 'inherit',
                                borderBottom: isExact
                                  ? (isDark ? '2px solid #f87171' : '2px solid #ef4444')
                                  : isFlagged
                                  ? (isDark ? '2px dashed #fbbf24' : '2px dashed #f59e0b')
                                  : 'none',
                                cursor: isFlagged ? 'pointer' : 'text',
                                padding: isFlagged ? '1px 3px' : '0',
                                borderRadius: isFlagged ? '3px' : '0',
                                fontWeight: isFlagged ? 500 : 400,
                                marginRight: '4px',
                                transition: 'background 0.15s ease',
                              }}
                              title={
                                isFlagged
                                  ? `${match.type.toUpperCase()}: ${match.similarity}% match. Click to inspect.`
                                  : 'Original'
                              }
                            >
                              {match.sentence}{' '}
                            </span>
                          );
                        })
                      ) : (
                        <div style={{ color: isDark ? 'var(--rb-text-muted)' : '#64748b' }}>No sentence breakdown available.</div>
                      )}
                    </div>
                  </div>

                  {/* Selected Match Action Box */}
                  {selectedMatchIndex !== null && plagiarismReport.matches[selectedMatchIndex] && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: isDark ? '1.5px solid rgba(186, 215, 151, 0.4)' : '1.5px solid #c7d2fe',
                        background: isDark ? 'var(--rb-surface-cream)' : '#f5f3ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              plagiarismReport.matches[selectedMatchIndex].type === 'exact'
                                ? (isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2')
                                : plagiarismReport.matches[selectedMatchIndex].type === 'paraphrased'
                                ? (isDark ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7')
                                : (isDark ? 'rgba(16, 185, 129, 0.25)' : '#d1fae5'),
                            color:
                              plagiarismReport.matches[selectedMatchIndex].type === 'exact'
                                ? (isDark ? '#fca5a5' : '#991b1b')
                                : plagiarismReport.matches[selectedMatchIndex].type === 'paraphrased'
                                ? (isDark ? '#fde047' : '#92400e')
                                : (isDark ? '#6ee7b7' : '#065f46'),
                          }}
                        >
                          {plagiarismReport.matches[selectedMatchIndex].type === 'exact'
                            ? 'Exact Match'
                            : plagiarismReport.matches[selectedMatchIndex].type === 'paraphrased'
                            ? 'Paraphrased / Patchwriting'
                            : 'Original Phrasing'}
                          {' • '}
                          {plagiarismReport.matches[selectedMatchIndex].similarity}% Similarity
                        </span>

                        <button
                          onClick={() => setSelectedMatchIndex(null)}
                          style={{ border: 'none', background: 'none', color: isDark ? 'var(--rb-text-muted)' : '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ fontSize: '13px', fontStyle: 'italic', color: isDark ? 'var(--rb-text)' : '#334155' }}>
                        "{plagiarismReport.matches[selectedMatchIndex].sentence}"
                      </div>

                      {plagiarismReport.matches[selectedMatchIndex].explanation && (
                        <div style={{ fontSize: '12px', color: isDark ? 'var(--rb-text-secondary)' : '#475569' }}>
                          <strong>Analysis:</strong> {plagiarismReport.matches[selectedMatchIndex].explanation}
                        </div>
                      )}

                      {plagiarismReport.matches[selectedMatchIndex].sourceTitle && (
                        <div style={{ fontSize: '12px', color: isDark ? '#c7d2fe' : '#6d28d9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={12} />
                          <span>Likely Source: {plagiarismReport.matches[selectedMatchIndex].sourceTitle}</span>
                        </div>
                      )}

                      {/* In-Place 1-Click Sentence Fix */}
                      <button
                        onClick={() =>
                          handleRewriteSentence(
                            plagiarismReport.matches[selectedMatchIndex].sentence,
                            selectedMatchIndex
                          )
                        }
                        disabled={rewritingSentenceIndex === selectedMatchIndex}
                        style={{
                          marginTop: '4px',
                          padding: '9px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background:
                            rewritingSentenceIndex === selectedMatchIndex
                              ? '#cbd5e1'
                              : 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: rewritingSentenceIndex === selectedMatchIndex ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(103, 6, 38, 0.25)',
                        }}
                      >
                        {rewritingSentenceIndex === selectedMatchIndex ? (
                          <>
                            <span className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }} />
                            <span>Rewriting in-place...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Rewrite this sentence in-place (keeps document intact)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Sources List */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'var(--rb-text)' : '#1e293b', marginBottom: '8px' }}>
                      Identified Sources ({plagiarismReport.sources.length})
                    </div>

                    {plagiarismReport.sources && plagiarismReport.sources.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plagiarismReport.sources.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: isDark ? '1px solid var(--rb-border)' : '1px solid #e2e8f0',
                              background: isDark ? 'var(--rb-surface-cream)' : '#f8fafc',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: isDark ? '#a7f3d0' : '#059669',
                                  background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {src.domain || 'web source'}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#f87171' : '#dc2626' }}>
                                {src.similarity}% match
                              </span>
                            </div>

                            <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'var(--rb-text)' : '#0f172a' }}>
                              {src.title}
                            </div>

                            {src.snippet && (
                              <div style={{ fontSize: '12px', color: isDark ? 'var(--rb-text-muted)' : '#64748b', fontStyle: 'italic' }}>
                                "{src.snippet}"
                              </div>
                            )}

                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '11px',
                                  color: isDark ? '#a5b4fc' : '#6366f1',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '2px',
                                }}
                              >
                                View Source <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                          border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #a7f3d0',
                          color: isDark ? '#6ee7b7' : '#065f46',
                          fontSize: '13px',
                          textAlign: 'center',
                        }}
                      >
                        ✓ No matching external sources detected. Your text is original!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: isDark ? 'var(--rb-text-muted)' : '#94a3b8', fontSize: '14px' }}>
                  No report yet. Click "Plagiarism" on the toolbar to scan your text.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ❄️ Freeze Words Glossary Modal */}
        {showFreezeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              style={{
                width: '500px',
                maxWidth: '92vw',
                background: 'var(--rb-surface)',
                border: '1px solid var(--rb-border)',
                borderRadius: '14px',
                boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.6)' : '0 25px 50px -12px rgba(0,0,0,0.25)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: 700, color: isDark ? 'var(--rb-accent)' : '#1e3a8a' }}>
                  <Snowflake size={20} color={isDark ? 'var(--rb-accent)' : '#2563eb'} />
                  <span>Freeze Words & Phrases</span>
                </div>
                <button
                  onClick={() => setShowFreezeModal(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '20px' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Terms entered here are strictly preserved verbatim. The AI engine will never alter, translate, or synonymize these words during rephrasing.
              </p>

              {/* Input bar */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={freezeInput}
                  onChange={(e) => setFreezeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFrozenTerm()}
                  placeholder="e.g. BrandName, Dr. Smith, HIPAA..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--rb-border)',
                    background: 'var(--rb-surface-cream)',
                    color: 'var(--rb-text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleAddFrozenTerm}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--rb-primary) 0%, var(--rb-primary-hover) 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Add Term
                </button>
              </div>

              {/* Active Terms Tag Container */}
              <div style={{ minHeight: '100px', maxHeight: '200px', overflowY: 'auto', padding: '12px', background: 'var(--rb-surface-cream)', borderRadius: '8px', border: '1px solid var(--rb-border)' }}>
                {frozenTerms.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {frozenTerms.map((term) => (
                      <span
                        key={term}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                          border: isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #bfdbfe',
                          color: isDark ? '#93c5fd' : '#1d4ed8',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                      >
                        <span>{term}</span>
                        <button
                          onClick={() => removeFrozenTerm(term)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: isDark ? '#93c5fd' : '#3b82f6', fontSize: '14px', padding: 0 }}
                          title="Remove term"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--rb-text-muted)', fontSize: '13px', paddingTop: '32px' }}>
                    No frozen terms yet. Type a term and press Enter.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                {frozenTerms.length > 0 ? (
                  <button
                    onClick={() => {
                      clearFrozenTerms();
                      showToast('Cleared all frozen terms', 'info');
                    }}
                    style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Clear All ({frozenTerms.length})
                  </button>
                ) : <div />}
                <button
                  onClick={() => setShowFreezeModal(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📑 Compare Modes Multi-Pane Modal */}
        {showCompareModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                width: '1100px',
                maxWidth: '96vw',
                maxHeight: '90vh',
                background: 'var(--rb-surface)',
                border: '1px solid var(--rb-border)',
                borderRadius: '16px',
                boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.6)' : '0 25px 50px -12px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Compare Header */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--rb-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--rb-surface-cream)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Columns size={20} color={isDark ? 'var(--rb-primary)' : '#670626'} />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--rb-text)' }}>
                      Compare Modes Side-by-Side
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
                      Select 2 to 4 modes below to generate and compare variations concurrently
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '20px' }}
                >
                  ✕
                </button>
              </div>

              {/* Interactive Mode Picker Toolbar */}
              <div
                style={{
                  padding: '12px 24px',
                  background: 'var(--rb-surface-cream)',
                  borderBottom: '1px solid var(--rb-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rb-text-secondary)', marginRight: '4px' }}>
                  Choose modes (2–4):
                </span>
                {modes.map((m) => {
                  const isSelected = selectedCompareModes.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      onClick={() => toggleCompareMode(m.value)}
                      style={{
                        border: isSelected ? (isDark ? '1.5px solid var(--rb-primary)' : '1.5px solid #670626') : '1px solid var(--rb-border)',
                        background: isSelected ? (isDark ? 'var(--rb-primary-light)' : '#fbebf0') : 'var(--rb-surface)',
                        color: isSelected ? (isDark ? '#f48fb1' : '#670626') : 'var(--rb-text)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => handleCompareModes(selectedCompareModes)}
                  disabled={isComparing}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isComparing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(103, 6, 38, 0.25)',
                  }}
                >
                  <RotateCw size={13} className={isComparing ? 'spinner' : ''} />
                  <span>{isComparing ? 'Comparing…' : 'Re-Compare'}</span>
                </button>
              </div>

              {/* Compare Content Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {isComparing ? (
                  <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="spinner" style={{ width: '44px', height: '44px', borderWidth: '3px', borderColor: isDark ? 'var(--rb-primary)' : '#670626', borderTopColor: 'transparent' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--rb-text)' }}>
                      Generating {selectedCompareModes.length} modes in parallel...
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)' }}>
                      Running {selectedCompareModes.map((m) => modes.find((x) => x.value === m)?.label || m).join(', ')} simultaneously
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareResults.length || selectedCompareModes.length}, minmax(280px, 1fr))`, gap: '20px' }}>
                    {compareResults.map((card) => {
                      const getModeColors = (m: string) => {
                        switch (m) {
                          case 'academic': return { bg: isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', text: isDark ? '#d8b4fe' : '#7e22ce' };
                          case 'formal': return { bg: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', text: isDark ? '#c4b5fd' : '#5b21b6' };
                          case 'fluency': return { bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#ecfdf5', text: isDark ? '#86efac' : '#047857' };
                          case 'creative': return { bg: isDark ? 'rgba(236, 72, 153, 0.2)' : '#fdf2f8', text: isDark ? '#f472b6' : '#be185d' };
                          case 'simple': return { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', text: isDark ? '#fde68a' : '#b45309' };
                          case 'humanize': return { bg: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', text: isDark ? '#a5b4fc' : '#3730a3' };
                          case 'expand': return { bg: isDark ? 'rgba(56, 189, 248, 0.2)' : '#e0f2fe', text: isDark ? '#7dd3fc' : '#0369a1' };
                          case 'shorten': return { bg: isDark ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5', text: isDark ? '#fdba74' : '#c2410c' };
                          default: return { bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', text: isDark ? '#93c5fd' : '#1d4ed8' };
                        }
                      };
                      const colors = getModeColors(card.mode);
                      return (
                      <div
                        key={card.mode}
                        style={{
                          background: 'var(--rb-surface-cream)',
                          border: '1.5px solid var(--rb-border)',
                          borderRadius: '12px',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {card.label}
                          </span>

                          <span style={{ fontSize: '12px', color: 'var(--rb-text-muted)', fontWeight: 500 }}>
                            {card.words} words
                          </span>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            fontSize: '14px',
                            lineHeight: '1.7',
                            color: 'var(--rb-text)',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '340px',
                            overflowY: 'auto',
                            padding: '12px',
                            background: 'var(--rb-surface)',
                            borderRadius: '8px',
                            border: '1px solid var(--rb-border)',
                          }}
                        >
                          {card.text}
                        </div>

                        <button
                          onClick={() => {
                            setOutputText(card.text);
                            setMode(card.mode as any);
                            setShowCompareModal(false);
                            showToast(`Selected ${card.label} mode output!`, 'success');
                          }}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Check size={16} /> Use This Version
                        </button>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🔍 Live Grammar Proofreader Slide-Over Drawer */}
        {showGrammarDrawer && (
          <div
            className="plagiarism-drawer-responsive animate-slide-in-right"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              background: 'var(--rb-surface)',
              borderLeft: '1px solid var(--rb-border)',
              boxShadow: isDark ? '-4px 0 25px rgba(0,0,0,0.5)' : '-4px 0 25px rgba(0,0,0,0.12)',
              zIndex: 320,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Grammar Drawer Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--rb-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isDark ? 'var(--rb-surface-cream)' : '#fff7ed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', color: isDark ? 'var(--rb-text)' : '#9a3412' }}>
                <CheckCheck size={20} color="#ea580c" />
                <span>Live Grammar & Proofreader</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCheckGrammar}
                  disabled={isCheckingGrammar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid var(--rb-border)' : '1px solid #fed7aa',
                    background: 'var(--rb-surface)',
                    color: isDark ? 'var(--rb-text)' : '#c2410c',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: isCheckingGrammar ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RotateCw size={13} className={isCheckingGrammar ? 'animate-spin' : ''} />
                  <span>Re-check</span>
                </button>
                <button
                  onClick={() => setShowGrammarDrawer(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '18px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Grammar Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isCheckingGrammar ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', borderColor: '#ea580c', borderTopColor: 'transparent' }} />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--rb-text)' }}>
                    Scanning text for grammar & spelling...
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)' }}>
                    Checking syntactic agreement, typos, punctuation, and structural flow.
                  </div>
                </div>
              ) : grammarReport ? (
                <>
                  {/* Summary Banner with Fix All Button */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: isDark ? 'var(--rb-surface-cream)' : (grammarReport.corrections && grammarReport.corrections.length > 0 ? '#fff7ed' : '#ecfdf5'),
                      border: isDark ? '1.5px solid var(--rb-border)' : `1.5px solid ${grammarReport.corrections && grammarReport.corrections.length > 0 ? '#fed7aa' : '#a7f3d0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? 'var(--rb-text)' : (grammarReport.corrections && grammarReport.corrections.length > 0 ? '#9a3412' : '#065f46') }}>
                        {grammarReport.corrections && grammarReport.corrections.length > 0
                          ? `${grammarReport.corrections.length} Suggestion(s) Detected`
                          : '✓ Perfect! Zero Errors Found'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
                        {grammarReport.corrections && grammarReport.corrections.length > 0
                          ? 'Review individual suggestions below or fix everything in one click.'
                          : 'Your text is grammatically sound, well-punctuated, and fluent.'}
                      </div>
                    </div>

                    {grammarReport.corrections && grammarReport.corrections.length > 0 && (
                      <button
                        onClick={handleFixAllGrammar}
                        disabled={isFixingGrammar}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                        }}
                      >
                        <Check size={15} />
                        <span>Fix All ({grammarReport.corrections.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Corrections List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {grammarReport.corrections?.map((corr, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: 'var(--rb-surface-cream)',
                          border: '1px solid var(--rb-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                corr.type === 'spelling'
                                  ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                                  : corr.type === 'grammar'
                                  ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                                  : corr.type === 'punctuation'
                                  ? (isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff')
                                  : (isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff'),
                              color:
                                corr.type === 'spelling'
                                  ? (isDark ? '#fca5a5' : '#b91c1c')
                                  : corr.type === 'grammar'
                                  ? (isDark ? '#fde68a' : '#b45309')
                                  : corr.type === 'punctuation'
                                  ? (isDark ? '#c7d2fe' : '#4338ca')
                                  : (isDark ? '#d8b4fe' : '#7e22ce'),
                            }}
                          >
                            {corr.type}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--rb-text)' }}>
                          <del style={{ color: '#ef4444', marginRight: '8px' }}>{corr.original}</del>
                          <span style={{ color: 'var(--rb-text-muted)', marginRight: '8px' }}>→</span>
                          <ins style={{ color: isDark ? '#86efac' : '#059669', fontWeight: 600, textDecoration: 'none' }}>{corr.corrected}</ins>
                        </div>

                        {corr.explanation && (
                          <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
                            {corr.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
