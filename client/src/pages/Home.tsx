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
} from 'lucide-react';

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
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [thesaurusPos, setThesaurusPos] = useState<{ top: number; left: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const {
    inputText,
    outputText,
    mode,
    language,
    synonymLevel,
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
    paraphrase,
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

    try {
      setSelectedTokenIndex(null);
      const result = await paraphrase(provider.id, provider.modelId);
      if (result && result.text && result.text.trim().length > 0) {
        showToast('Paraphrase completed successfully!', 'success');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

          {/* Provider Status Pill */}
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

        {/* User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
      </header>

      {/* Modes & Settings Control Bar */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>Modes:</span>
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
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Synonyms Slider & Language Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
          {/* Synonyms Level Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                style={{ width: '100px', accentColor: '#10b981', cursor: 'pointer' }}
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

          <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

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
        </div>
      </div>

      {/* Editor Dual-Pane Workspace */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Pane (Input) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
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
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '85%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '95%', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : outputText ? (
              activeTab === 'diff' ? (
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
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>{outputText}</div>
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
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '380px',
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
      </div>
    </div>
  );
}
