import React, { useState } from 'react';
import { Lock, Plus, X, CheckCircle2 } from 'lucide-react';

interface EditorialFeatureStoryProps {
  isDark?: boolean;
}

export const EditorialFeatureStory: React.FC<EditorialFeatureStoryProps> = ({ isDark = false }) => {

  // 1. Syntactic Clause State
  const [syntaxInverted, setSyntaxInverted] = useState<boolean>(true);

  // 2. Glossary Control State
  const [frozenTerms, setFrozenTerms] = useState<string[]>(['CRISPR-Cas9', 'TensorFlow', 'Section 404']);
  const [termInput, setTermInput] = useState<string>('');

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    if (!frozenTerms.includes(termInput.trim())) {
      setFrozenTerms([...frozenTerms, termInput.trim()]);
    }
    setTermInput('');
  };

  const handleRemoveTerm = (term: string) => {
    setFrozenTerms(frozenTerms.filter((t) => t !== term));
  };

  // 3. Compare Modes State
  const [activeMode, setActiveMode] = useState<'standard' | 'academic' | 'creative'>('academic');

  return (
    <section
      id="features"
      style={{
        padding: 'clamp(36px, 5vw, 48px) 16px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      {/* Section Eyebrow & Headline */}
      <div style={{ marginBottom: '32px', maxWidth: '800px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#BAD797',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '16px',
          }}
        >
          CORE INSTRUMENTS
        </div>
        <h2
          className="editorial-headline"
          style={{
            fontSize: 'clamp(34px, 4.8vw, 54px)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--rb-text)',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}
        >
          Engineered for precision.
          <br />
          <span style={{ fontStyle: 'italic', color: isDark ? '#e27293' : '#670626' }}>
            Demonstrated, not claimed.
          </span>
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.65,
            color: 'var(--rb-text-secondary)',
            margin: 0,
          }}
        >
          Shallow rephrasers replace isolated words with dictionary synonyms. RewriteBot parses grammatical hierarchy, relocates clauses, and locks proprietary formulas.
        </p>
      </div>

      {/* FEATURE 1: DEEP SYNTACTIC RESTRUCTURING */}
      <div
        className="editorial-story-grid"
        style={{
          borderTop: '1px solid var(--rb-border)',
          paddingTop: '32px',
          paddingBottom: '36px',
        }}
      >
        {/* Left: Editorial Statement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#BAD797', fontFamily: 'monospace' }}>01</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SYNTAX ARCHITECTURE
            </span>
          </div>
          <h3
            className="editorial-headline"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--rb-text)',
              margin: '0 0 16px',
            }}
          >
            Deep syntactic clause restructuring.
          </h3>
          <p style={{ fontSize: '15.5px', lineHeight: 1.65, color: 'var(--rb-text-secondary)', margin: '0 0 20px' }}>
            Rather than swapping isolated words with awkward synonyms, RewriteBot analyzes relational clause hierarchy. Subordinate causes can be promoted to independent head clauses to generate natural academic cadence.
          </p>

          <div style={{ display: 'inline-flex', gap: '8px', padding: '4px', borderRadius: '8px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSyntaxInverted(false)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: !syntaxInverted ? 'var(--rb-surface)' : 'transparent',
                color: !syntaxInverted ? 'var(--rb-text)' : 'var(--rb-text-muted)',
                fontWeight: !syntaxInverted ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: !syntaxInverted ? 'var(--rb-shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Passive Conjunction
            </button>
            <button
              onClick={() => setSyntaxInverted(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: syntaxInverted ? '#670626' : 'transparent',
                color: syntaxInverted ? '#F7F3EB' : 'var(--rb-text-muted)',
                fontWeight: syntaxInverted ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: syntaxInverted ? '0 2px 8px rgba(103, 6, 38, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Clause Inverted (Active)
            </button>
          </div>
        </div>

        {/* Right: Live Syntactic Transformation Visualizer */}
        <div
          style={{
            padding: 'clamp(18px, 4vw, 28px)',
            borderRadius: '12px',
            background: 'var(--rb-surface)',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-sm)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            Syntactic Transformation Engine
          </div>

          <div
            className="font-serif"
            style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: 'var(--rb-text)',
              minHeight: '90px',
              padding: '16px',
              background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'var(--rb-surface-cream)',
              borderRadius: '8px',
              border: '1px solid var(--rb-border-light)',
              marginBottom: '16px',
            }}
          >
            {syntaxInverted ? (
              <span>
                <span
                  style={{
                    background: isDark ? 'rgba(186, 215, 151, 0.2)' : '#ecfdf5',
                    color: isDark ? '#BAD797' : '#047857',
                    borderBottom: '2px solid #BAD797',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    fontWeight: 600,
                  }}
                >
                  Because the sample size was strictly constrained,
                </span>{' '}
                the empirical team postponed publication to ensure statistical significance.
              </span>
            ) : (
              <span>
                The empirical team postponed publication{' '}
                <span
                  style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                    color: isDark ? '#fca5a5' : '#b91c1c',
                    borderBottom: '2px solid #ef4444',
                    padding: '2px 4px',
                    borderRadius: '2px',
                  }}
                >
                  because the sample size was too small and not adequate.
                </span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--rb-text-muted)', flexWrap: 'wrap', gap: '8px' }}>
            <span>Shift: {syntaxInverted ? 'Dependent causal clause elevated to sentence head' : 'Trailing subordinate conjunction clause'}</span>
            <span style={{ fontWeight: 600, color: '#BAD797' }}>{syntaxInverted ? '✦ Active Voice' : 'Standard Voice'}</span>
          </div>
        </div>
      </div>

      {/* FEATURE 2: GLOSSARY CONTROL (TERMS GUARANTEED UNTOUCHED) */}
      <div
        className="editorial-story-grid"
        style={{
          borderTop: '1px solid var(--rb-border)',
          paddingTop: '32px',
          paddingBottom: '36px',
        }}
      >
        {/* Left: Interactive Terminology Lock Workspace */}
        <div
          style={{
            padding: 'clamp(18px, 4vw, 28px)',
            borderRadius: '12px',
            background: 'var(--rb-surface)',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-sm)',
            order: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Locked Glossary Registry
            </span>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Zero Drift Enforced</span>
          </div>

          {/* Active Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {frozenTerms.map((term) => (
              <span
                key={term}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(103, 6, 38, 0.25)' : 'var(--rb-primary-light)',
                  border: '1px solid var(--rb-primary-border)',
                  color: isDark ? '#f48fb1' : '#670626',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Lock size={10} />
                <span>{term}</span>
                <button
                  onClick={() => handleRemoveTerm(term)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remove lock"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Add Term Form */}
          <form onSubmit={handleAddTerm} style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="Lock custom term (e.g. mRNA, ISO-9001)..."
              style={{
                flex: '1 1 180px',
                minWidth: '0',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--rb-border)',
                background: 'var(--rb-surface-cream)',
                color: 'var(--rb-text)',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: '#670626',
                color: '#F7F3EB',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} />
              <span>Lock</span>
            </button>
          </form>

          {/* Demonstration Preview */}
          <div
            className="font-serif"
            style={{
              padding: '14px',
              borderRadius: '6px',
              background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'var(--rb-surface-cream)',
              border: '1px solid var(--rb-border-light)',
              fontSize: '15px',
              lineHeight: 1.6,
              color: 'var(--rb-text)',
            }}
          >
            "Using <strong style={{ color: isDark ? '#f48fb1' : '#670626' }}>CRISPR-Cas9</strong> and <strong style={{ color: isDark ? '#f48fb1' : '#670626' }}>TensorFlow</strong>, the genomic pipeline observed statutory adherence under <strong style={{ color: isDark ? '#f48fb1' : '#670626' }}>Section 404</strong>."
          </div>
        </div>

        {/* Right: Editorial Statement */}
        <div style={{ order: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#BAD797', fontFamily: 'monospace' }}>02</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TERMINOLOGY INTEGRITY
            </span>
          </div>
          <h3
            className="editorial-headline"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--rb-text)',
              margin: '0 0 16px',
            }}
          >
            Glossary control without losing context.
          </h3>
          <p style={{ fontSize: '15.5px', lineHeight: 1.65, color: 'var(--rb-text-secondary)', margin: '0 0 20px' }}>
            Never let a model mutate proprietary formulas, statutory citations, medical nomenclature, or trademark names. RewriteBot injects strict boundary constraints so locked terms stay 100% verbatim.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Cryptographic boundary isolation across all supported LLMs</span>
          </div>
        </div>
      </div>

      {/* FEATURE 3: COMPARE MODES (SIDE-BY-SIDE SYNTHESIS) */}
      <div
        className="editorial-story-grid"
        style={{
          borderTop: '1px solid var(--rb-border)',
          paddingTop: '32px',
          paddingBottom: '24px',
        }}
      >
        {/* Left: Editorial Statement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#BAD797', fontFamily: 'monospace' }}>03</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REGISTER & TONALITY
            </span>
          </div>
          <h3
            className="editorial-headline"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--rb-text)',
              margin: '0 0 16px',
            }}
          >
            Compare multiple modes concurrently.
          </h3>
          <p style={{ fontSize: '15.5px', lineHeight: 1.65, color: 'var(--rb-text-secondary)', margin: '0 0 20px' }}>
            See how different rewriting modes transform the exact same thought. Standard clarifies direct prose, Academic elevates lexical rigor, and Creative unfolds rhythm and cadence.
          </p>

          <div style={{ display: 'inline-flex', gap: '6px', padding: '4px', borderRadius: '8px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', flexWrap: 'wrap' }}>
            {(['standard', 'academic', 'creative'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeMode === mode ? '#670626' : 'transparent',
                  color: activeMode === mode ? '#F7F3EB' : 'var(--rb-text-muted)',
                  fontWeight: activeMode === mode ? 700 : 500,
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Mode Transformation Card */}
        <div
          style={{
            padding: 'clamp(18px, 4vw, 28px)',
            borderRadius: '12px',
            background: 'var(--rb-surface)',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Base Thought: "The study proves the first idea was right."
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#BAD797', textTransform: 'uppercase' }}>
              {activeMode} Output
            </span>
          </div>

          <div
            className="font-serif"
            style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: 'var(--rb-text)',
              minHeight: '80px',
              padding: '16px',
              background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'var(--rb-surface-cream)',
              borderRadius: '8px',
              border: '1px solid var(--rb-border-light)',
            }}
          >
            {activeMode === 'standard' && (
              <span>"The study demonstrates that the initial hypothesis was methodologically sound."</span>
            )}
            {activeMode === 'academic' && (
              <span>"Empirical findings corroborate the primary hypothesis with profound statistical rigor."</span>
            )}
            {activeMode === 'creative' && (
              <span>"The gathered evidence paints an undeniable picture, elevating the initial thesis into certainty."</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
