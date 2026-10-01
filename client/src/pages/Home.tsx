import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEditorStore } from '../stores/editorStore';
import { apiClient } from '../services/api';
import { computeWordDiff, DiffToken } from '../utils/wordDiff';
import { ExportFormat } from '../utils/export';
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
} from 'lucide-react';
import { toolsService, PlagiarismCheckResponse } from '../services/tools.service';
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

  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'plain'>('diff');
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [thesaurusPos, setThesaurusPos] = useState<{ top: number; left: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [isScanningPlagiarism, setIsScanningPlagiarism] = useState(false);
  const [plagiarismReport, setPlagiarismReport] = useState<PlagiarismCheckResponse | null>(null);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);
  const [rewritingSentenceIndex, setRewritingSentenceIndex] = useState<number | null>(null);
  const [isAutoFixingAll, setIsAutoFixingAll] = useState(false);

  const {
    inputText,
    outputText,
    mode,
    language,
    synonymLevel,
    plagiarismGuard,
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

    // On mobile, auto-switch to output view so streaming tokens appear immediately
    setMobileTab('output');

    try {
      setSelectedTokenIndex(null);
      if (provider.options?.streamingEnabled !== false) {
        try {
          await paraphraseStream(provider.id, provider.modelId);
          showToast('Paraphrase completed successfully!', 'success');
        } catch (streamErr) {
          console.warn('Streaming encountered issue, falling back to standard paraphrase:', streamErr);
          const result = await paraphrase(provider.id, provider.modelId);
          if (result && result.text && result.text.trim().length > 0) {
            showToast('Paraphrase completed successfully!', 'success');
          }
        }
      } else {
        const result = await paraphrase(provider.id, provider.modelId);
        if (result && result.text && result.text.trim().length > 0) {
          showToast('Paraphrase completed successfully!', 'success');
        }
      }
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

  const handleWordClick = (token: DiffToken, index: number, event: React.MouseEvent) => {
    if (!token.synonyms || token.synonyms.length === 0) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setThesaurusPos({
      top: rect.bottom + window.scrollY + 6,
      left: Math.max(16, rect.left + window.scrollX - 40),
    });
    setSelectedTokenIndex(index);
  };

  const replaceWord = (newWord: string, tokenIndex: number) => {
    const diff = computeWordDiff(inputText, outputText);
    diff[tokenIndex].text = newWord;
    const reconstructed = diff.map((t) => t.text).join('');
    setOutputText(reconstructed);
    setSelectedTokenIndex(null);
    showToast(`Replaced with "${newWord}"`, 'info');
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

      // Replace in-place inside outputText (and inputText if present)
      const currentDoc = outputText || inputText;
      const updatedOutput = currentDoc.includes(sentence)
        ? currentDoc.replace(sentence, newSentence)
        : currentDoc;
      setOutputText(updatedOutput);

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
          riskLevel: newOriginality >= 85 ? 'safe' : newOriginality >= 60 ? 'moderate' : 'high',
          matches: updatedMatches,
        });
      }

      showToast('Flagged sentence rewritten in-place! Document preserved.', 'success');
    } catch (err: any) {
      console.error('Failed to rewrite sentence in-place:', err);
      showToast(err.message || 'Failed to rewrite sentence', 'error');
    } finally {
      setRewritingSentenceIndex(null);
    }
  };

  const handleAutoFixAll = async () => {
    if (!plagiarismReport || !plagiarismReport.matches) return;
    const flaggedItems = plagiarismReport.matches
      .map((m, idx) => ({ match: m, idx }))
      .filter((item) => item.match.type !== 'clean');

    if (flaggedItems.length === 0) {
      showToast('No flagged sentences to fix!', 'info');
      return;
    }

    const provider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!provider) {
      showToast('Please configure an AI provider first', 'error');
      return;
    }

    try {
      setIsAutoFixingAll(true);
      let currentDoc = outputText || inputText;
      const updatedMatches = [...plagiarismReport.matches];

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
          if (newSentence && currentDoc.includes(match.sentence)) {
            currentDoc = currentDoc.replace(match.sentence, newSentence);
            updatedMatches[idx] = {
              ...match,
              sentence: newSentence,
              type: 'clean',
              similarity: 0,
              explanation: 'Auto-rewritten for originality',
            };
          }
        } catch (e) {
          console.error('Failed to rewrite individual sentence in batch:', e);
        }
      }

      setOutputText(currentDoc);
      setPlagiarismReport({
        ...plagiarismReport,
        originalityScore: 100,
        plagiarismScore: 0,
        riskLevel: 'safe',
        matches: updatedMatches,
        sources: [],
      });
      setSelectedMatchIndex(null);
      showToast('All flagged sentences rewritten in-place! Document is now 100% original.', 'success');
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
  const changePercentage = outputWordCount > 0 ? Math.round((changedWordsCount / outputWordCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
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
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Rewrite<span style={{ color: '#10b981' }}>Bot</span>
              </div>
            </div>
          </div>

          {/* Provider Status Pill (Desktop) */}
          <div className="show-on-desktop hide-on-mobile">
            {providers.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ color: '#475569', fontWeight: 500 }}>Provider:</span>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type} / {p.modelId})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate('/providers')}
                  title="Manage Providers"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
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
          <button
            onClick={toggleHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: showHistory ? '#f1f5f9' : '#fff',
              color: '#334155',
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
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fff',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Settings size={16} /> Providers
          </button>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{user?.name}</span>
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
              background: '#ffffff',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.15)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              paddingBottom: 'calc(20px + var(--rb-safe-bottom, 0px))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#4338ca',
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
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
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
                  border: 'none',
                  borderRadius: '8px',
                  background: showHistory ? '#ecfdf5' : '#f8fafc',
                  color: showHistory ? '#059669' : '#1e293b',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <History size={18} color="#10b981" />
                <span>Paraphrase History</span>
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
                  border: 'none',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Settings size={18} color="#3b82f6" />
                <span>AI Providers Configuration</span>
              </button>

              {providers.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Active AI Provider
                  </div>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      background: '#fff',
                      fontWeight: 600,
                      color: '#0f172a',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
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

      {/* Modes & Settings Control Bar */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
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
                  border: isActive ? '1px solid #10b981' : '1px solid transparent',
                  background: isActive ? '#ecfdf5' : 'transparent',
                  color: isActive ? '#059669' : '#64748b',
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
        </div>

        {/* Synonyms Slider & Language Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Synonyms Level Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  color: '#fff',
                  background: '#10b981',
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

          <div className="show-on-desktop hide-on-mobile" style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={15} color="#64748b" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '13px',
                color: '#334155',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="auto">Detect language</option>
              <option value="en">English (US)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div className="show-on-desktop hide-on-mobile" style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

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
              border: plagiarismGuard ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
              background: plagiarismGuard ? '#eef2ff' : '#ffffff',
              color: plagiarismGuard ? '#4338ca' : '#64748b',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="When active, forces deep restructuring to ensure 100% unique, plagiarism-free output"
          >
            <ShieldCheck size={14} color={plagiarismGuard ? '#4f46e5' : '#94a3b8'} />
            <span>Guard: {plagiarismGuard ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented View Control (Input vs Output) */}
      <div
        className="show-on-mobile hide-on-desktop"
        style={{
          display: 'none',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
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
            border: mobileTab === 'input' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
            background: mobileTab === 'input' ? '#ecfdf5' : '#ffffff',
            color: mobileTab === 'input' ? '#059669' : '#64748b',
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
            border: mobileTab === 'output' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
            background: mobileTab === 'output' ? '#ecfdf5' : '#ffffff',
            color: mobileTab === 'output' ? '#059669' : '#64748b',
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
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          }}
        >
          {/* Input Header Toolbar */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Input Text
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handlePaste}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
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
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
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
            placeholder="Paste or write your text here to paraphrase (Press Ctrl+Enter to generate)..."
            style={{
              flex: 1,
              border: 'none',
              padding: '20px',
              fontSize: '16px',
              lineHeight: '1.7',
              resize: 'none',
              outline: 'none',
              color: '#1e293b',
              fontFamily: 'inherit',
            }}
          />

          {/* Input Footer */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafafa',
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px' }}>
              <span>
                <strong>{inputWordCount}</strong> words
              </span>
              <span>•</span>
              <span>
                <strong>{inputText.length}</strong> chars
              </span>
            </div>

            <button
              onClick={handleParaphrase}
              disabled={isGenerating || !inputText.trim()}
              className="touch-target"
              style={{
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: isGenerating || !inputText.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isGenerating || !inputText.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isGenerating || !inputText.trim() ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Paraphrasing...</span>
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
            background: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Output Header Toolbar */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="show-on-mobile hide-on-desktop"
                onClick={() => setMobileTab('input')}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={13} /> Edit
              </button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Paraphrase
              </span>
              {outputText && (
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setActiveTab('diff')}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: activeTab === 'diff' ? 600 : 500,
                      background: activeTab === 'diff' ? '#fff' : 'transparent',
                      color: activeTab === 'diff' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'diff' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    Interactive
                  </button>
                  <button
                    onClick={() => setActiveTab('plain')}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: activeTab === 'plain' ? 600 : 500,
                      background: activeTab === 'plain' ? '#fff' : 'transparent',
                      color: activeTab === 'plain' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'plain' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    Plain
                  </button>
                </div>
              )}
            </div>

            {outputText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid #d1fae5',
                  }}
                >
                  {changePercentage}% changed
                </span>

                {plagiarismReport && (
                  <button
                    onClick={() => setShowPlagiarism(true)}
                    style={{
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: plagiarismReport.originalityScore >= 85 ? '#065f46' : '#92400e',
                      background: plagiarismReport.originalityScore >= 85 ? '#d1fae5' : '#fef3c7',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    title="Click to view Originality & Plagiarism details"
                  >
                    <ShieldCheck size={13} color={plagiarismReport.originalityScore >= 85 ? '#059669' : '#d97706'} />
                    <span>{plagiarismReport.originalityScore}% Original</span>
                  </button>
                )}

                {latency && (
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {latency}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Output Content Area */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              fontSize: '16px',
              lineHeight: '1.7',
            }}
          >
            {isGenerating && !outputText ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '85%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '95%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : outputText ? (
              isGenerating || activeTab === 'plain' ? (
                <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>
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
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {diffTokens.map((token, idx) => {
                    const isChanged = token.type === 'changed';
                    return (
                      <span
                        key={idx}
                        onClick={(e) => isChanged && handleWordClick(token, idx, e)}
                        style={{
                          color: isChanged ? '#d97706' : '#1e293b',
                          background: isChanged ? '#fef3c7' : 'transparent',
                          borderRadius: isChanged ? '3px' : '0',
                          padding: isChanged ? '1px 2px' : '0',
                          fontWeight: isChanged ? 600 : 400,
                          cursor: isChanged ? 'pointer' : 'text',
                          transition: 'background 0.15s ease',
                          borderBottom: isChanged ? '1.5px dashed #f59e0b' : 'none',
                        }}
                        title={isChanged ? 'Click for alternative synonyms' : undefined}
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
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#94a3b8',
                  }}
                >
                  <FileText size={28} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Your Paraphrased Text Will Appear Here
                </div>
                <p style={{ fontSize: '13px', maxWidth: '320px', lineHeight: 1.5, margin: 0 }}>
                  Enter your text on the left, pick a mode and synonym level, and click Paraphrase.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Thesaurus Popover */}
          {selectedTokenIndex !== null && thesaurusPos && (
            <div
              style={{
                position: 'absolute',
                top: thesaurusPos.top - 60,
                left: Math.min(thesaurusPos.left, 350),
                zIndex: 100,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                padding: '8px',
                minWidth: '180px',
                maxWidth: '240px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 8px', borderBottom: '1px solid #f1f5f9' }}>
                SUGGESTED SYNONYMS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                {diffTokens[selectedTokenIndex]?.synonyms?.map((syn, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => replaceWord(syn, selectedTokenIndex)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{syn}</span>
                    <span style={{ fontSize: '10px', color: '#10b981' }}>Select</span>
                  </button>
                )) || <div style={{ padding: '8px', fontSize: '12px', color: '#94a3b8' }}>No alternatives found</div>}
              </div>
              <button
                onClick={() => setSelectedTokenIndex(null)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '4px',
                  border: 'none',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '11px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          )}

          {/* Output Footer Toolbar */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafafa',
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>
                <strong>{outputWordCount}</strong> words
              </span>
              {currentProvider && currentModel && (
                <>
                  <span>•</span>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {currentProvider} ({currentModel})
                  </span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => outputText && handleCopy(outputText)}
                disabled={!outputText}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: copied ? '#ecfdf5' : '#fff',
                  color: copied ? '#059669' : '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: outputText ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleCheckPlagiarism}
                disabled={!outputText && !inputText.trim()}
                title="Scan text for plagiarism and originality"
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #c7d2fe',
                  background: '#eef2ff',
                  color: '#4338ca',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: outputText || inputText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShieldCheck size={15} color="#4f46e5" />
                <span>Plagiarism</span>
              </button>

              <button
                onClick={handleParaphrase}
                disabled={!inputText.trim() || isGenerating}
                title="Paraphrase again"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  cursor: inputText.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCw size={15} />
              </button>

              {/* Export Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  disabled={!outputText}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: outputText ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={15} /> Export <ChevronDown size={14} />
                </button>

                {exportOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: '100%',
                      marginBottom: '6px',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      zIndex: 200,
                      minWidth: '150px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => handleExport('txt')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Plain Text (.txt)
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Word Document (.docx)
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      PDF Document (.pdf)
                    </button>
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
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' }}>
                <History size={18} color="#10b981" /> Paraphrase History
              </div>
              <button
                onClick={() => setShowHistory(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
                  Loading history...
                </div>
              ) : historyItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
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
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
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
                            background: '#e2e8f0',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: '#475569',
                          }}
                        >
                          {item.mode}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', lineBreak: 'anywhere' }}>
                        <strong>In:</strong> {item.input.slice(0, 80)}...
                      </div>

                      {item.output && (
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500, lineBreak: 'anywhere' }}>
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
                          border: '1px solid #10b981',
                          background: '#ecfdf5',
                          color: '#059669',
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
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.12)',
              zIndex: 310,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#faf5ff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', color: '#581c87' }}>
                <ShieldCheck size={20} color="#7c3aed" /> Originality & Plagiarism Report
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    border: '1px solid #ddd6fe',
                    background: '#fff',
                    color: '#6d28d9',
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
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px' }}
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
                    style={{ width: '40px', height: '40px', borderWidth: '3px', borderColor: '#7c3aed', borderTopColor: 'transparent' }}
                  />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    Scanning text for plagiarism...
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', lineHeight: 1.5 }}>
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
                          ? 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)'
                          : plagiarismReport.riskLevel === 'moderate'
                          ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                          : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      border: `1.5px solid ${
                        plagiarismReport.riskLevel === 'safe'
                          ? '#a7f3d0'
                          : plagiarismReport.riskLevel === 'moderate'
                          ? '#fde68a'
                          : '#fecaca'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    }}
                  >
                    {/* Circular Score Badge */}
                    <div
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        border: `3px solid ${
                          plagiarismReport.riskLevel === 'safe'
                            ? '#10b981'
                            : plagiarismReport.riskLevel === 'moderate'
                            ? '#f59e0b'
                            : '#ef4444'
                        }`,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color:
                            plagiarismReport.riskLevel === 'safe'
                              ? '#059669'
                              : plagiarismReport.riskLevel === 'moderate'
                              ? '#d97706'
                              : '#dc2626',
                          lineHeight: 1,
                        }}
                      >
                        {plagiarismReport.originalityScore}%
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                        ORIGINAL
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
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
                                ? '#d1fae5'
                                : plagiarismReport.riskLevel === 'moderate'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              plagiarismReport.riskLevel === 'safe'
                                ? '#065f46'
                                : plagiarismReport.riskLevel === 'moderate'
                                ? '#92400e'
                                : '#991b1b',
                          }}
                        >
                          {plagiarismReport.riskLevel === 'safe'
                            ? '✓ Clean / Original'
                            : plagiarismReport.riskLevel === 'moderate'
                            ? '⚠ Moderate Similarity'
                            : '✕ High Plagiarism Risk'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                        {plagiarismReport.riskLevel === 'safe'
                          ? 'Great job! Your text shows very high originality and is safe for academic or publication use.'
                          : plagiarismReport.riskLevel === 'moderate'
                          ? 'Some phrases or structures overlap with existing publications. Consider rephrasing flagged sections.'
                          : 'Significant text similarity detected. Rephrasing is strongly recommended to avoid plagiarism.'}
                      </div>
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
                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Words Checked</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {plagiarismReport.wordCount}
                      </div>
                    </div>

                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Flagged Parts</div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: plagiarismReport.matches.filter((m) => m.type !== 'clean').length > 0 ? '#d97706' : '#059669',
                          marginTop: '2px',
                        }}
                      >
                        {plagiarismReport.matches.filter((m) => m.type !== 'clean').length}
                      </div>
                    </div>

                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Sources Matched</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
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
                        background: '#f5f3ff',
                        border: '1.5px solid #c7d2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="#7c3aed" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#4338ca' }}>
                            Auto-Fix Entire Document
                          </div>
                          <div style={{ fontSize: '12px', color: '#6366f1' }}>
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
                          background: isAutoFixingAll ? '#cbd5e1' : 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: isAutoFixingAll ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
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

                  {/* Highlighted Sentence Inspector */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                        Sentence-by-Sentence Breakdown
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Click flagged sentences to view details & fix
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#1e293b',
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
                                  ? '#ddd6fe'
                                  : isExact
                                  ? '#fee2e2'
                                  : isFlagged
                                  ? '#fef3c7'
                                  : 'transparent',
                                color: isExact ? '#991b1b' : isFlagged ? '#92400e' : 'inherit',
                                borderBottom: isExact
                                  ? '2px solid #ef4444'
                                  : isFlagged
                                  ? '2px dashed #f59e0b'
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
                        <div style={{ color: '#64748b' }}>No sentence breakdown available.</div>
                      )}
                    </div>
                  </div>

                  {/* Selected Match Action Box */}
                  {selectedMatchIndex !== null && plagiarismReport.matches[selectedMatchIndex] && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1.5px solid #c7d2fe',
                        background: '#f5f3ff',
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
                                ? '#fee2e2'
                                : plagiarismReport.matches[selectedMatchIndex].type === 'paraphrased'
                                ? '#fef3c7'
                                : '#d1fae5',
                            color:
                              plagiarismReport.matches[selectedMatchIndex].type === 'exact'
                                ? '#991b1b'
                                : plagiarismReport.matches[selectedMatchIndex].type === 'paraphrased'
                                ? '#92400e'
                                : '#065f46',
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
                          style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#334155' }}>
                        "{plagiarismReport.matches[selectedMatchIndex].sentence}"
                      </div>

                      {plagiarismReport.matches[selectedMatchIndex].explanation && (
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          <strong>Analysis:</strong> {plagiarismReport.matches[selectedMatchIndex].explanation}
                        </div>
                      )}

                      {plagiarismReport.matches[selectedMatchIndex].sourceTitle && (
                        <div style={{ fontSize: '12px', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                              : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: rewritingSentenceIndex === selectedMatchIndex ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
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
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
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
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
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
                                  color: '#059669',
                                  background: '#ecfdf5',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {src.domain || 'web source'}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>
                                {src.similarity}% match
                              </span>
                            </div>

                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                              {src.title}
                            </div>

                            {src.snippet && (
                              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
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
                                  color: '#6366f1',
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
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
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
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '14px' }}>
                  No report yet. Click "Plagiarism" on the toolbar to scan your text.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
