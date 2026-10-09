import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface CinematicHeroProps {
  isDark?: boolean;
}

interface RewriteMode {
  id: 'standard' | 'academic' | 'executive' | 'creative';
  label: string;
  sourceText: string;
  rewrittenTokens: Array<{
    text: string;
    type: 'changed' | 'unchanged' | 'structural';
    synonyms?: string[];
  }>;
  meaningScore: number;
  aiDetectionRisk: string;
  readabilityShift: string;
}

const MODES: Record<string, RewriteMode> = {
  standard: {
    id: 'standard',
    label: 'Standard',
    sourceText: 'Because the research team was small and our time was limited, the results were not very good.',
    rewrittenTokens: [
      { text: 'Constrained', type: 'structural' },
      { text: ' by a ', type: 'unchanged' },
      { text: 'small', type: 'unchanged' },
      { text: ' research team and ', type: 'unchanged' },
      { text: 'strictly limited', type: 'changed', synonyms: ['tightly constrained', 'narrow'] },
      { text: ' timelines, the study ', type: 'unchanged' },
      { text: 'outcomes', type: 'changed', synonyms: ['findings', 'results', 'data'] },
      { text: ' failed to ', type: 'unchanged' },
      { text: 'attain', type: 'changed', synonyms: ['reach', 'achieve', 'yield'] },
      { text: ' expected ', type: 'unchanged' },
      { text: 'significance.', type: 'changed', synonyms: ['benchmarks', 'thresholds', 'relevance'] },
    ],
    meaningScore: 99,
    aiDetectionRisk: '0% (Natural cadence)',
    readabilityShift: '+24% Clarity',
  },
  academic: {
    id: 'academic',
    label: 'Academic',
    sourceText: 'Because the research team was small and our time was limited, the results were not very good.',
    rewrittenTokens: [
      { text: 'Owing to', type: 'structural' },
      { text: ' constrained ', type: 'changed', synonyms: ['restricted', 'limited', 'modest'] },
      { text: 'investigator ', type: 'changed', synonyms: ['researcher', 'author', 'scholar'] },
      { text: 'headcount and ', type: 'changed', synonyms: ['personnel and', 'capacity and'] },
      { text: 'restrictive', type: 'changed', synonyms: ['tight', 'inflexible', 'stringent'] },
      { text: ' project durations, the ', type: 'unchanged' },
      { text: 'empirical', type: 'changed', synonyms: ['experimental', 'observational'] },
      { text: ' findings ', type: 'unchanged' },
      { text: 'demonstrated', type: 'changed', synonyms: ['exhibited', 'displayed', 'yielded'] },
      { text: ' limited ', type: 'unchanged' },
      { text: 'methodological', type: 'changed', synonyms: ['statistical', 'inferential'] },
      { text: ' validity.', type: 'unchanged' },
    ],
    meaningScore: 98,
    aiDetectionRisk: '0% (Peer-review register)',
    readabilityShift: 'Peer-Reviewed Grade',
  },
  executive: {
    id: 'executive',
    label: 'Executive',
    sourceText: 'Because the research team was small and our time was limited, the results were not very good.',
    rewrittenTokens: [
      { text: 'Strict', type: 'changed', synonyms: ['Rigid', 'Tight', 'Aggressive'] },
      { text: ' milestone deadlines and ', type: 'unchanged' },
      { text: 'resource scarcity', type: 'changed', synonyms: ['under-resourcing', 'budget constraints'] },
      { text: ' fundamentally ', type: 'structural' },
      { text: 'impaired', type: 'changed', synonyms: ['hampered', 'compromised', 'restricted'] },
      { text: ' the initiative’s ', type: 'unchanged' },
      { text: 'delivery metrics', type: 'changed', synonyms: ['output targets', 'key milestones'] },
      { text: ' and target ', type: 'unchanged' },
      { text: 'impact.', type: 'changed', synonyms: ['value', 'yield', 'reach'] },
    ],
    meaningScore: 98,
    aiDetectionRisk: '0% (Direct active voice)',
    readabilityShift: 'High-Impact Brevity',
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    sourceText: 'Because the research team was small and our time was limited, the results were not very good.',
    rewrittenTokens: [
      { text: 'Working against the clock', type: 'structural' },
      { text: ' with ', type: 'unchanged' },
      { text: 'scarce', type: 'changed', synonyms: ['scant', 'few', 'slender'] },
      { text: ' hands on deck, the experiment ', type: 'unchanged' },
      { text: 'culminated', type: 'changed', synonyms: ['arrived', 'resulted', 'ended'] },
      { text: ' in ', type: 'unchanged' },
      { text: 'sobering', type: 'changed', synonyms: ['underwhelming', 'humbling', 'modest'] },
      { text: ' conclusions.', type: 'unchanged' },
    ],
    meaningScore: 97,
    aiDetectionRisk: '0% (Human idiom)',
    readabilityShift: 'Evocative Flow',
  },
};

const WORDS_TO_ROTATE = [
  { word: 'clarity.', color: '#6e8d4a', darkColor: '#BAD797' },
  { word: 'authority.', color: '#670626', darkColor: '#e27293' },
  { word: 'precision.', color: '#1d4ed8', darkColor: '#60a5fa' },
  { word: 'elegance.', color: '#b45309', darkColor: '#f59e0b' },
];

export const CinematicHero: React.FC<CinematicHeroProps> = ({ isDark = false }) => {
  const navigate = useNavigate();
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<'standard' | 'academic' | 'executive' | 'creative'>('standard');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hoveredSynonym, setHoveredSynonym] = useState<string[] | null>(null);

  // Rotating Word in Headline
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % WORDS_TO_ROTATE.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleModeSwitch = (modeId: 'standard' | 'academic' | 'executive' | 'creative') => {
    if (modeId === currentMode) return;
    setIsAnimating(true);
    setCurrentMode(modeId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const activeModeData = MODES[currentMode];
  const activeWord = WORDS_TO_ROTATE[activeWordIdx];

  const handleCopy = () => {
    const fullText = activeModeData.rewrittenTokens.map((t) => t.text).join('');
    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 64px) 18px clamp(40px, 6vw, 72px)',
        maxWidth: '1240px',
        margin: '0 auto',
        zIndex: 1,
        boxSizing: 'border-box',
      }}
    >
      {/* Background radial atmosphere */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 800px)',
          height: '450px',
          background: isDark
            ? 'radial-gradient(circle, rgba(103, 6, 38, 0.22) 0%, rgba(23, 19, 20, 0) 70%)'
            : 'radial-gradient(circle, rgba(186, 215, 151, 0.25) 0%, rgba(247, 243, 235, 0) 70%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* TOP: Brand Eyebrow with Live Status Dot */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: isDark ? 'rgba(37, 31, 32, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--rb-border)',
            boxShadow: '0 2px 8px rgba(37, 31, 32, 0.04)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#BAD797',
              boxShadow: '0 0 8px #BAD797',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--rb-text)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            SYNTACTIC INVERSION ENGINE • V2.4
          </span>
          <span style={{ fontSize: '11px', color: 'var(--rb-text-muted)' }}>•</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isDark ? '#e27293' : '#670626',
            }}
          >
            Zero Turnitin Flags
          </span>
        </div>
      </div>

      {/* CENTER: Grand Kinetic Headline */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '920px',
          margin: '0 auto 24px',
        }}
      >
        <h1
          className="editorial-headline"
          style={{
            fontSize: 'clamp(36px, 5.8vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.05,
            color: 'var(--rb-text)',
            margin: '0 0 16px',
            letterSpacing: '-0.03em',
          }}
        >
          Say what you mean.{' '}
          <br className="hide-on-mobile" />
          Only with more{' '}
          <span
            key={activeWord.word}
            className="animate-word-flip"
            style={{
              color: isDark ? activeWord.darkColor : activeWord.color,
              fontStyle: 'italic',
              fontWeight: 700,
            }}
          >
            {activeWord.word}
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--rb-text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 28px',
          }}
        >
          RewriteBot transforms rough sentences through deep clause restructuring and cadence tuning.
          Your facts, numbers, and personal voice stay intact — without patchwriting or robotic fluff.
        </p>

        {/* Action Button Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '36px',
          }}
        >
          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 28px',
              borderRadius: '9999px',
              border: 'none',
              background: '#670626',
              color: '#FAF6EF',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(103, 6, 38, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(103, 6, 38, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(103, 6, 38, 0.35)';
            }}
          >
            <span>Launch Studio Free</span>
            <ArrowRight size={15} color="#BAD797" />
          </button>

          <a
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 22px',
              borderRadius: '9999px',
              border: '1px solid var(--rb-border)',
              background: isDark ? 'rgba(37, 31, 32, 0.5)' : 'var(--rb-surface)',
              color: 'var(--rb-text)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--rb-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--rb-border)')}
          >
            <span>See Full Capabilities</span>
            <ChevronRight size={14} color="var(--rb-text-muted)" />
          </a>
        </div>
      </div>

      {/* THE CENTERPIECE: LIVING INTERACTIVE REWRITE SLATE */}
      <div
        className="editorial-card-lift"
        style={{
          width: '100%',
          maxWidth: '920px',
          margin: '0 auto',
          borderRadius: '18px',
          background: 'var(--rb-surface)',
          border: '1px solid var(--rb-border)',
          boxShadow: isDark
            ? '0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 24px 60px rgba(37, 31, 32, 0.08), 0 2px 6px rgba(37, 31, 32, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Slate Mode Header Bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--rb-border)',
            background: isDark ? 'rgba(23, 19, 20, 0.7)' : 'var(--rb-surface-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--rb-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginRight: '6px',
              }}
            >
              Mode:
            </span>

            {(['standard', 'academic', 'executive', 'creative'] as const).map((modeId) => {
              const isActive = currentMode === modeId;
              return (
                <button
                  key={modeId}
                  onClick={() => handleModeSwitch(modeId)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    background: isActive ? (isDark ? '#380d19' : '#670626') : 'transparent',
                    color: isActive ? '#FAF6EF' : 'var(--rb-text-secondary)',
                    boxShadow: isActive ? '0 2px 8px rgba(103, 6, 38, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {MODES[modeId].label}
                </button>
              );
            })}
          </div>

          {/* Slate Telemetry Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '9999px',
                background: isDark ? 'rgba(186, 215, 151, 0.15)' : '#f2f8eb',
                color: isDark ? '#BAD797' : '#6e8d4a',
                border: '1px solid rgba(186, 215, 151, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={11} /> {activeModeData.meaningScore}% Meaning Preserved
            </span>

            <span
              className="hide-on-mobile"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '9999px',
                background: 'var(--rb-surface)',
                color: 'var(--rb-text-muted)',
                border: '1px solid var(--rb-border)',
              }}
            >
              {activeModeData.readabilityShift}
            </span>
          </div>
        </div>

        {/* Split Slate Work Area: Source vs Transformed */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {/* Top/Left: Original Draft */}
          <div
            style={{
              padding: '24px 22px',
              borderRight: '1px solid var(--rb-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--rb-surface)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--rb-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Input Draft</span>
                <span style={{ fontSize: '10.5px' }}>17 words</span>
              </div>

              <p
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.7,
                  color: 'var(--rb-text-secondary)',
                  margin: 0,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                "{activeModeData.sourceText}"
              </p>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid var(--rb-border-light)',
                fontSize: '12px',
                color: 'var(--rb-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b91c1c' }} />
              <span>Trailing dependent causal clause ("because...")</span>
            </div>
          </div>

          {/* Bottom/Right: Restructured Output */}
          <div
            style={{
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: isDark ? 'rgba(23, 19, 20, 0.35)' : 'var(--rb-surface-cream)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isDark ? '#e27293' : '#670626',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Syntactic Restructure</span>
                <span style={{ color: '#059669', fontSize: '10.5px', fontWeight: 700 }}>
                  Active Clause Inversion
                </span>
              </div>

              <div
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.7,
                  color: 'var(--rb-text)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  opacity: isAnimating ? 0.3 : 1,
                  transform: isAnimating ? 'translateY(4px)' : 'none',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  position: 'relative',
                }}
              >
                "
                {activeModeData.rewrittenTokens.map((token, idx) => {
                  if (token.type === 'structural') {
                    return (
                      <span
                        key={idx}
                        style={{
                          background: isDark ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7',
                          color: isDark ? '#fcd34d' : '#92400e',
                          padding: '1px 3px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                        title="Subordinate clause inverted to sentence head"
                      >
                        {token.text}
                      </span>
                    );
                  }
                  if (token.type === 'changed') {
                    return (
                      <span
                        key={idx}
                        style={{
                          background: isDark ? 'rgba(226, 114, 147, 0.18)' : 'rgba(103, 6, 38, 0.08)',
                          color: isDark ? '#e27293' : '#670626',
                          padding: '1px 3px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          cursor: token.synonyms ? 'pointer' : 'default',
                        }}
                        onMouseEnter={() => token.synonyms && setHoveredSynonym(token.synonyms)}
                        onMouseLeave={() => setHoveredSynonym(null)}
                        title={token.synonyms ? `Alternative synonyms: ${token.synonyms.join(', ')}` : undefined}
                      >
                        {token.text}
                      </span>
                    );
                  }
                  return <span key={idx}>{token.text}</span>;
                })}
                "
              </div>

              {/* Floating Synonyms Tooltip if hovered */}
              {hoveredSynonym && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--rb-surface)',
                    border: '1px solid var(--rb-border)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    fontSize: '11px',
                    color: 'var(--rb-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={11} color="#BAD797" />
                  <span>Synonyms: {hoveredSynonym.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid var(--rb-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--rb-text-muted)' }}>
                <span>Risk: </span>
                <span style={{ color: '#059669', fontWeight: 600 }}>{activeModeData.aiDetectionRisk}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--rb-border)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    color: copied ? '#059669' : 'var(--rb-text)',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => navigate('/app')}
                  style={{
                    background: 'var(--rb-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    color: '#FAF6EF',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Open in Studio</span>
                  <ArrowRight size={11} color="#BAD797" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slate Footer Color Diff Legend */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--rb-border)',
            background: 'var(--rb-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11.5px',
            color: 'var(--rb-text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: isDark ? '#e27293' : '#670626' }} />
              Vocabulary Elevation
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} />
              Syntactic Clause Inversion
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--rb-border)' }} />
              Unchanged Factual Anchor
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--rb-text)' }}>
            <ShieldCheck size={13} color="#059669" />
            <span>Guaranteed Zero Plagiarism & Fact Preservation</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '32px',
        }}
      >
        <a
          href="#demo"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: 'var(--rb-text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-muted)')}
        >
          <span>Explore Architecture & Features</span>
          <span style={{ fontSize: '13px' }}>↓</span>
        </a>
      </div>
    </section>
  );
};
