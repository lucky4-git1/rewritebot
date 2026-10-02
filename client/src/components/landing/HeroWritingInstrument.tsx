import React, { useState, useEffect } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroWritingInstrumentProps {
  isDark?: boolean;
}

interface ToneMode {
  id: 'standard' | 'academic' | 'executive';
  label: string;
  output: {
    beforeWord1: string;
    changedWord1: string;
    midWords: string;
    changedWord2: string;
    afterWords: string;
  };
  originalityScore: number;
  humanScore: number;
}

const TONES: ToneMode[] = [
  {
    id: 'standard',
    label: 'Standard',
    output: {
      beforeWord1: 'The company ',
      changedWord1: 'introduced',
      midWords: ' a new strategy to ',
      changedWord2: 'enhance',
      afterWords: ' customer satisfaction.',
    },
    originalityScore: 99,
    humanScore: 98,
  },
  {
    id: 'academic',
    label: 'Academic',
    output: {
      beforeWord1: 'The organization ',
      changedWord1: 'implemented',
      midWords: ' an empirical methodology to ',
      changedWord2: 'elevate',
      afterWords: ' stakeholder satisfaction.',
    },
    originalityScore: 100,
    humanScore: 99,
  },
  {
    id: 'executive',
    label: 'Executive',
    output: {
      beforeWord1: 'Leadership ',
      changedWord1: 'instituted',
      midWords: ' a strategic initiative to ',
      changedWord2: 'maximize',
      afterWords: ' client retention and value.',
    },
    originalityScore: 98,
    humanScore: 97,
  },
];

export const HeroWritingInstrument: React.FC<HeroWritingInstrumentProps> = ({ isDark = false }) => {
  const navigate = useNavigate();
  const [activeTone, setActiveTone] = useState<'standard' | 'academic' | 'executive'>('standard');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typedChars, setTypedChars] = useState<number>(100);
  const [showCopyFeedback, setShowCopyFeedback] = useState<boolean>(false);

  const currentTone = TONES.find((t) => t.id === activeTone) || TONES[0];
  const fullSentence = `${currentTone.output.beforeWord1}${currentTone.output.changedWord1}${currentTone.output.midWords}${currentTone.output.changedWord2}${currentTone.output.afterWords}`;

  // Animate typing when tone switches
  useEffect(() => {
    setIsTyping(true);
    setTypedChars(0);

    const length = fullSentence.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= length) {
        setTypedChars(length);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setTypedChars(current);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [activeTone]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullSentence);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        borderRadius: '14px',
        background: 'var(--rb-surface)',
        border: '1px solid var(--rb-border)',
        boxShadow: isDark
          ? '0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 16px 40px rgba(37, 31, 32, 0.08), 0 1px 3px rgba(37, 31, 32, 0.04)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Studio Header Bar */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--rb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: isDark ? 'rgba(23, 19, 20, 0.4)' : 'var(--rb-surface-cream)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--rb-text)', letterSpacing: '0.04em' }}>
            REWRITE INSTRUMENT
          </span>
          <span style={{ fontSize: '11px', color: 'var(--rb-text-muted)' }}>•</span>
          <span style={{ fontSize: '11.5px', color: 'var(--rb-text-secondary)', fontWeight: 500 }}>
            Frontier Engine
          </span>
        </div>

        {/* Tone Selector */}
        <div
          style={{
            display: 'inline-flex',
            padding: '3px',
            borderRadius: '7px',
            background: isDark ? '#1a1617' : 'rgba(37, 31, 32, 0.06)',
            border: '1px solid var(--rb-border)',
          }}
        >
          {TONES.map((tone) => {
            const isActive = tone.id === activeTone;
            return (
              <button
                key={tone.id}
                onClick={() => setActiveTone(tone.id)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  background: isActive ? 'var(--rb-surface)' : 'transparent',
                  color: isActive ? 'var(--rb-text)' : 'var(--rb-text-muted)',
                  boxShadow: isActive ? 'var(--rb-shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Drafting Canvas */}
      <div style={{ padding: '16px 14px' }}>
        {/* Source Text Area */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--rb-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}
          >
            Original Draft
          </div>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--rb-text-muted)',
              margin: 0,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            "The company implemented a new strategy to improve customer satisfaction."
          </p>
        </div>

        {/* Dynamic Divider with Engine Status */}
        <div
          style={{
            position: 'relative',
            margin: '16px 0',
            borderTop: '1px solid var(--rb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              padding: '2px 10px',
              borderRadius: '10px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
              fontSize: '10px',
              fontWeight: 700,
              color: '#BAD797',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} color="#BAD797" />
            <span>SYNTACTIC REWRITE</span>
          </span>
        </div>

        {/* Rewritten Target Output */}
        <div style={{ minHeight: '80px', paddingTop: '4px' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#670626',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span style={{ color: isDark ? '#e27293' : '#670626' }}>Polished Output</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#059669',
                  background: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ecfdf5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentTone.originalityScore}% Original
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isDark ? '#BAD797' : '#2d5a1e',
                  background: isDark ? 'rgba(186, 215, 151, 0.15)' : '#f2f8eb',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentTone.humanScore}% Human
              </span>
            </div>
          </div>

          <div
            className="font-serif"
            style={{
              fontSize: '16.5px',
              lineHeight: 1.7,
              color: 'var(--rb-text)',
              fontStyle: 'normal',
            }}
          >
            {isTyping ? (
              <span>
                {fullSentence.slice(0, typedChars)}
                <span className="typing-caret" />
              </span>
            ) : (
              <span>
                <span>{currentTone.output.beforeWord1}</span>
                <span
                  style={{
                    background: isDark ? 'rgba(254, 243, 199, 0.18)' : '#fef3c7',
                    color: isDark ? '#fef08a' : '#92400e',
                    borderBottom: '2px solid #f59e0b',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    fontWeight: 600,
                  }}
                  title="Syntactic refinement"
                >
                  {currentTone.output.changedWord1}
                </span>
                <span>{currentTone.output.midWords}</span>
                <span
                  style={{
                    background: isDark ? 'rgba(254, 243, 199, 0.18)' : '#fef3c7',
                    color: isDark ? '#fef08a' : '#92400e',
                    borderBottom: '2px solid #f59e0b',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    fontWeight: 600,
                  }}
                  title="Vocabulary elevation"
                >
                  {currentTone.output.changedWord2}
                </span>
                <span>{currentTone.output.afterWords}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Studio Action Footer */}
      <div
        style={{
          padding: '10px 14px',
          background: isDark ? 'rgba(23, 19, 20, 0.6)' : 'var(--rb-surface-cream)',
          borderTop: '1px solid var(--rb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', color: 'var(--rb-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#f59e0b',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '10.5px' }}>Refined Lexicon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#60a5fa',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '10.5px' }}>Clause Inversion</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--rb-border)',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {showCopyFeedback ? (
              <>
                <Check size={11} color="#059669" />
                <span style={{ color: '#059669' }}>Copied</span>
              </>
            ) : (
              <span>Copy</span>
            )}
          </button>

          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#670626',
              color: '#F7F3EB',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#52041e')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#670626')}
          >
            <span>Open Studio</span>
            <ArrowRight size={11} color="#BAD797" />
          </button>
        </div>
      </div>
    </div>
  );
};
