import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  Copy,
  Check,
  RotateCw,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TokenDiff {
  text: string;
  type: 'changed' | 'unchanged' | 'structural';
  synonyms?: string[];
}

interface DemoPreset {
  id: string;
  category: string;
  title: string;
  originalText: string;
  modes: {
    standard: {
      tokens: TokenDiff[];
      originality: number;
      human: number;
    };
    academic: {
      tokens: TokenDiff[];
      originality: number;
      human: number;
    };
    creative: {
      tokens: TokenDiff[];
      originality: number;
      human: number;
    };
    humanize: {
      tokens: TokenDiff[];
      originality: number;
      human: number;
    };
  };
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'academic',
    category: 'Research Paper',
    title: 'Academic Abstract',
    originalText:
      'The rapid advancement of artificial intelligence technologies has significantly influenced academic writing, necessitating rigorous analysis of scholarly integrity.',
    modes: {
      standard: {
        tokens: [
          { text: 'Academic writing', type: 'changed', synonyms: ['Scholarly composition', 'Academic prose', 'Peer literature'] },
          { text: 'has been profoundly', type: 'structural' },
          { text: 'reshaped by', type: 'changed', synonyms: ['transformed by', 'altered by', 'redefined by'] },
          { text: 'the rapid rise of', type: 'changed', synonyms: ['the swift emergence of', 'the fast evolution of'] },
          { text: 'artificial intelligence,', type: 'unchanged' },
          { text: 'which now demands', type: 'structural' },
          { text: 'a closer examination of', type: 'changed', synonyms: ['a deeper scrutiny of', 'rigorous analysis of', 'careful study of'] },
          { text: 'scholarly integrity.', type: 'unchanged' },
        ],
        originality: 98,
        human: 97,
      },
      academic: {
        tokens: [
          { text: 'As', type: 'structural' },
          { text: 'artificial intelligence', type: 'unchanged' },
          { text: 'continues to transform', type: 'changed', synonyms: ['rapidly reshapes', 'substantively alters', 'progressively redefines'] },
          { text: 'the conventions of', type: 'structural' },
          { text: 'scholarly composition,', type: 'changed', synonyms: ['academic writing', 'scholarly authorship', 'peer discourse'] },
          { text: 'rigorous oversight', type: 'changed', synonyms: ['exacting scrutiny', 'diligent inspection', 'critical evaluation'] },
          { text: 'regarding', type: 'structural' },
          { text: 'academic integrity', type: 'unchanged' },
          { text: 'has become indispensable.', type: 'changed', synonyms: ['is now paramount', 'is vital', 'is mandatory'] },
        ],
        originality: 99,
        human: 98,
      },
      creative: {
        tokens: [
          { text: 'With', type: 'structural' },
          { text: 'intelligent algorithms', type: 'changed', synonyms: ['artificial systems', 'automated tools', 'machine cognition'] },
          { text: 'sweeping through', type: 'structural' },
          { text: 'academia,', type: 'changed', synonyms: ['scholarly institutions', 'higher education'] },
          { text: 'scholars must now confront', type: 'changed', synonyms: ['researchers face', 'authors must address', 'thinkers grapple with'] },
          { text: 'an urgent question:', type: 'structural' },
          { text: 'how do we safeguard genuine intellectual honesty?', type: 'changed', synonyms: ['how can we protect academic truth?'] },
        ],
        originality: 99,
        human: 99,
      },
      humanize: {
        tokens: [
          { text: 'Because', type: 'structural' },
          { text: 'artificial intelligence', type: 'unchanged' },
          { text: 'is moving so fast,', type: 'changed', synonyms: ['advances so quickly', 'develops at high speed'] },
          { text: 'it\'s completely changing', type: 'structural' },
          { text: 'how we write papers—', type: 'changed', synonyms: ['how scholarly work is done—', 'the way research is drafted—'] },
          { text: 'and that means', type: 'structural' },
          { text: 'we really have to rethink', type: 'changed', synonyms: ['we need an honest look at', 'we must carefully examine'] },
          { text: 'academic honesty.', type: 'changed', synonyms: ['scholarly integrity.', 'academic ethics.'] },
        ],
        originality: 97,
        human: 99,
      },
    },
  },
  {
    id: 'executive',
    category: 'Corporate Strategy',
    title: 'Executive Proposal',
    originalText:
      'Our team must optimize operational workflows and eliminate redundant overhead expenses to guarantee sustainable profitability across the next fiscal year.',
    modes: {
      standard: {
        tokens: [
          { text: 'To guarantee', type: 'structural' },
          { text: 'sustainable profitability', type: 'unchanged' },
          { text: 'in the coming fiscal year,', type: 'changed', synonyms: ['across the next fiscal cycle,', 'for the upcoming year,'] },
          { text: 'our team needs to', type: 'structural' },
          { text: 'eliminate', type: 'unchanged' },
          { text: 'redundant overhead', type: 'unchanged' },
          { text: 'and streamline', type: 'changed', synonyms: ['and optimize', 'and enhance', 'and simplify'] },
          { text: 'our operational workflows.', type: 'unchanged' },
        ],
        originality: 96,
        human: 97,
      },
      academic: {
        tokens: [
          { text: 'Superfluous overhead', type: 'changed', synonyms: ['Redundant expenditure', 'Excessive operational cost', 'Non-essential outlays'] },
          { text: 'must be eliminated', type: 'structural' },
          { text: 'through systematic workflow refinement', type: 'changed', synonyms: ['via operational optimization', 'through procedural streamlining'] },
          { text: 'if sustained fiscal profitability', type: 'changed', synonyms: ['if enduring financial performance', 'if long-term profitability'] },
          { text: 'is to be realized.', type: 'structural' },
        ],
        originality: 99,
        human: 98,
      },
      creative: {
        tokens: [
          { text: 'Securing next year\'s bottom line', type: 'changed', synonyms: ['Protecting our financial future', 'Driving next year\'s profit'] },
          { text: 'requires bold moves:', type: 'structural' },
          { text: 'cutting away excess expenses', type: 'changed', synonyms: ['eliminating redundant overhead', 'trimming administrative waste'] },
          { text: 'and reinventing the way', type: 'structural' },
          { text: 'our team operates.', type: 'changed', synonyms: ['we work every day', 'our organization functions'] },
        ],
        originality: 99,
        human: 99,
      },
      humanize: {
        tokens: [
          { text: 'If we want to', type: 'structural' },
          { text: 'stay solidly profitable', type: 'changed', synonyms: ['maintain strong profit margins', 'secure steady returns'] },
          { text: 'next year,', type: 'unchanged' },
          { text: 'we have to trim', type: 'structural' },
          { text: 'the unnecessary spending', type: 'changed', synonyms: ['redundant overhead expenses', 'wasteful outlays'] },
          { text: 'and get our everyday processes in order.', type: 'changed', synonyms: ['and streamline how we work', 'and optimize team workflows'] },
        ],
        originality: 97,
        human: 99,
      },
    },
  },
];

interface InteractiveProductDemoProps {
  isDark?: boolean;
}

export const InteractiveProductDemo: React.FC<InteractiveProductDemoProps> = ({ isDark = false }) => {
  const navigate = useNavigate();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('academic');
  const [selectedMode, setSelectedMode] = useState<'standard' | 'academic' | 'creative' | 'humanize'>('academic');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [visibleTokenCount, setVisibleTokenCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // In-place word swap state
  const [customTokens, setCustomTokens] = useState<TokenDiff[] | null>(null);
  const [thesaurusModal, setThesaurusModal] = useState<{
    word: string;
    synonyms: string[];
    tokenIndex: number;
    x: number;
    y: number;
  } | null>(null);

  const activePreset = DEMO_PRESETS.find((p) => p.id === selectedPresetId) || DEMO_PRESETS[0];
  const activeModeData = activePreset.modes[selectedMode];
  const displayTokens = customTokens || activeModeData.tokens;

  // Trigger typing simulation when preset or mode changes
  const triggerRewriteAnimation = () => {
    setIsTyping(true);
    setVisibleTokenCount(0);
    setCustomTokens(null);
    setThesaurusModal(null);

    const totalTokens = activeModeData.tokens.length;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleTokenCount(current);
      if (current >= totalTokens) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 70);
  };

  useEffect(() => {
    triggerRewriteAnimation();
  }, [selectedPresetId, selectedMode]);

  // Handle word click to open inline thesaurus
  const handleWordClick = (e: React.MouseEvent, token: TokenDiff, index: number) => {
    e.stopPropagation();
    if (!token.synonyms || token.synonyms.length === 0) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setThesaurusModal({
      word: token.text,
      synonyms: token.synonyms,
      tokenIndex: index,
      x: rect.left,
      y: rect.bottom + 6,
    });
  };

  // Perform in-place word swap
  const handleSwapWord = (newWord: string, index: number) => {
    const updated = [...displayTokens];
    updated[index] = {
      ...updated[index],
      text: newWord,
    };
    setCustomTokens(updated);
    setThesaurusModal(null);
  };

  const handleCopy = () => {
    const textToCopy = displayTokens.map((t) => t.text).join(' ');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setThesaurusModal(null)}
      style={{
        position: 'relative',
        background: 'var(--rb-surface)',
        borderRadius: '12px',
        border: '1px solid var(--rb-border)',
        boxShadow: isDark
          ? '0 12px 30px rgba(0, 0, 0, 0.35)'
          : '0 12px 30px rgba(37, 31, 32, 0.06)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Studio Window Chrome Header */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--rb-surface-cream)',
          borderBottom: '1px solid var(--rb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Sample preset buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--rb-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            Sample:
          </span>
          {DEMO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: isSelected ? '1.5px solid var(--rb-primary)' : '1px solid var(--rb-border)',
                  background: isSelected ? 'var(--rb-surface)' : 'transparent',
                  color: isSelected ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? 'var(--rb-shadow-sm)' : 'none',
                }}
              >
                {preset.title}
              </button>
            );
          })}
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'var(--rb-surface)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--rb-border)',
            flexWrap: 'wrap',
          }}
        >
          {(['standard', 'academic', 'creative', 'humanize'] as const).map((mode) => {
            const isSelected = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '5px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  border: 'none',
                  background: isSelected ? 'var(--rb-primary)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--rb-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Split Work Area */}
      <div className="editorial-split-workarea">
        {/* Left Pane: Original Draft */}
        <div
          style={{
            padding: '20px 16px',
            borderRight: '1px solid var(--rb-border)',
            borderBottom: '1px solid var(--rb-border)',
            background: isDark ? 'rgba(255, 255, 255, 0.015)' : 'var(--rb-surface)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--rb-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Original Source
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--rb-text-muted)' }}>
                {activePreset.originalText.split(' ').length} words
              </span>
            </div>
            <p
              className="font-serif"
              style={{
                fontSize: '17px',
                lineHeight: 1.75,
                color: 'var(--rb-text-secondary)',
                margin: 0,
              }}
            >
              "{activePreset.originalText}"
            </p>
          </div>

          <div
            style={{
              marginTop: '28px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--rb-surface-cream)',
              border: '1px solid var(--rb-border)',
              fontSize: '12px',
              color: 'var(--rb-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: 'var(--rb-primary)', fontSize: '13px' }}>💡</span>
            <span>
              <strong>Syntactic difference:</strong> Notice how the rewrite below inverts dependent clauses rather than swapping isolated words.
            </span>
          </div>
        </div>

        {/* Right Pane: RewriteBot Interactive Output */}
        <div
          style={{
            padding: '20px 16px',
            background: 'var(--rb-surface)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Output Meta Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--rb-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Wand2 size={13} />
                  RewriteBot Studio ({selectedMode})
                </span>
                {isTyping && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--rb-text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    Generating clauses…
                  </span>
                )}
              </div>

              {/* Verified Meters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(5, 150, 105, 0.12)',
                    color: '#059669',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <ShieldCheck size={12} /> {activeModeData.originality}% Original
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isDark ? 'rgba(186, 215, 151, 0.15)' : 'rgba(103, 6, 38, 0.08)',
                    color: isDark ? '#BAD797' : 'var(--rb-primary)',
                    border: isDark ? '1px solid rgba(186, 215, 151, 0.3)' : '1px solid var(--rb-primary-border)',
                  }}
                >
                  <BrainCircuit size={12} /> {activeModeData.human}% Human
                </span>
              </div>
            </div>

            {/* Simulated 3-Color Highlighted Text */}
            <div
              className="font-serif"
              style={{
                fontSize: '17.5px',
                lineHeight: 1.8,
                color: 'var(--rb-text)',
                marginBottom: '20px',
              }}
            >
              {displayTokens.slice(0, visibleTokenCount).map((token, idx) => {
                if (token.type === 'changed') {
                  return (
                    <span
                      key={idx}
                      onClick={(e) => handleWordClick(e, token, idx)}
                      title="Changed Word — Click to choose alternatives"
                      style={{
                        background: 'var(--rb-diff-changed-bg)',
                        color: 'var(--rb-diff-changed-text)',
                        borderBottom: '2px solid var(--rb-diff-changed-border)',
                        padding: '1px 4px',
                        borderRadius: '4px',
                        margin: '0 2px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {token.text}{' '}
                    </span>
                  );
                }
                if (token.type === 'structural') {
                  return (
                    <span
                      key={idx}
                      title="Structural Syntax Shift — Clause reordered"
                      style={{
                        background: 'var(--rb-diff-structural-bg)',
                        color: 'var(--rb-diff-structural-text)',
                        borderBottom: '2px solid var(--rb-diff-structural-border)',
                        padding: '1px 4px',
                        borderRadius: '4px',
                        margin: '0 2px',
                        fontWeight: 600,
                      }}
                    >
                      {token.text}{' '}
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    title="Longest Contiguous Preserved Phrase"
                    style={{
                      background: 'var(--rb-diff-unchanged-bg)',
                      color: 'var(--rb-diff-unchanged-text)',
                      borderBottom: '2px solid var(--rb-diff-unchanged-border)',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      margin: '0 2px',
                    }}
                  >
                    {token.text}{' '}
                  </span>
                );
              })}
              {isTyping && <span className="typing-caret" />}
            </div>
          </div>

          {/* Interactive Legend & Action Toolbar */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--rb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* 3-Color Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} />
                <span>Changed Words</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#60a5fa' }} />
                <span>Preserved Verbatim</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} />
                <span>Clause Structure</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={triggerRewriteAnimation}
                title="Re-run paraphrase simulation"
                style={{
                  padding: '6px 10px',
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
              >
                <RotateCw size={13} className={isTyping ? 'spinner' : ''} />
                <span>Rerun</span>
              </button>

              <button
                onClick={handleCopy}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--rb-border)',
                  background: copied ? 'rgba(5, 150, 105, 0.15)' : 'var(--rb-surface-cream)',
                  color: copied ? '#059669' : 'var(--rb-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied ✓' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Thesaurus Dropdown Overlay */}
      {thesaurusModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: Math.max(64, Math.min(window.innerHeight - 280, thesaurusModal.y)),
            left: Math.max(12, Math.min(window.innerWidth - 264, thesaurusModal.x)),
            width: '240px',
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--rb-surface)',
            border: '1.5px solid var(--rb-border)',
            borderRadius: '10px',
            boxShadow: 'var(--rb-shadow-lg)',
            padding: '12px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--rb-border)',
              paddingBottom: '6px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase' }}>
              Synonyms: <strong style={{ color: 'var(--rb-primary)' }}>{thesaurusModal.word.trim()}</strong>
            </span>
            <button
              onClick={() => setThesaurusModal(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '13px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {thesaurusModal.synonyms.map((syn, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSwapWord(syn, thesaurusModal.tokenIndex)}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  border: 'none',
                  background: 'var(--rb-surface-cream)',
                  color: 'var(--rb-text)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#383032' : '#fef3c7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
              >
                <span>{syn}</span>
                <span style={{ fontSize: '10px', color: '#2d5a1e', fontWeight: 700 }}>Swap</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <div
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(103, 6, 38, 0.05) 0%, rgba(186, 215, 151, 0.12) 100%)',
          borderTop: '1px solid var(--rb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--rb-text-secondary)' }}>
          Experience the full studio with <strong>Freeze Words</strong>, <strong>Sentence Rephrasing</strong>, and <strong>PDF Audits</strong>.
        </span>

        <button
          onClick={() => navigate('/app')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(247, 243, 235, 0.15)',
            background: '#670626',
            color: '#F7F3EB',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(103, 6, 38, 0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#52041e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#670626')}
        >
          <span>Open Full Studio Free</span>
          <ArrowRight size={13} color="#BAD797" />
        </button>
      </div>
    </div>
  );
};
