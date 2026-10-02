import React, { useState } from 'react';
import { Layers, ArrowRight, ChevronRight } from 'lucide-react';

interface TransformationStage {
  step: number;
  label: string;
  badge: string;
  badgeColor: string;
  sentence: string;
  highlightWords: string[];
  explanation: string;
  syntaxShift: string;
}

const STAGES: TransformationStage[] = [
  {
    step: 1,
    label: 'Raw Input Draft',
    badge: 'Original Unpolished Text',
    badgeColor: 'var(--rb-text-muted)',
    sentence: 'The results were not very good because the sample size was too small and we did not have enough time.',
    highlightWords: [],
    explanation: 'Passive, repetitive vocabulary with informal cadence and weak grammatical construction.',
    syntaxShift: 'Base sentence with two trailing dependent conjunction clauses ("because...", "and we did not...")',
  },
  {
    step: 2,
    label: 'Deep Syntactic Inversion',
    badge: 'Clause Restructuring',
    badgeColor: '#ef4444',
    sentence: 'Because the sample size was constrained and time was strictly limited, the experimental results failed to achieve significance.',
    highlightWords: ['Because the sample size was constrained', 'and time was strictly limited,'],
    explanation: 'Inverts dependent causal clauses to the beginning of the sentence to give commanding academic emphasis to the findings.',
    syntaxShift: 'Subordinate clause relocated to sentence head; core claim shifted to independent clause.',
  },
  {
    step: 3,
    label: 'Vocabulary & Nuance Calibration',
    badge: 'Lexical Refinement',
    badgeColor: '#f59e0b',
    sentence: 'Owing to constrained sample sizes and restrictive project timelines, the empirical findings lacked statistical significance.',
    highlightWords: ['Owing to', 'restrictive project timelines,', 'empirical findings', 'lacked statistical significance.'],
    explanation: 'Substitutes ambiguous conversational phrasing with precise domain terminology without sounding artificial.',
    syntaxShift: 'Syntactic relations preserved while elevating vocabulary register to peer-reviewed standard.',
  },
  {
    step: 4,
    label: 'Cadence & Tone Optimization',
    badge: 'Rhythm & Voice',
    badgeColor: '#60a5fa',
    sentence: 'Constrained sample sizes and stringent time limitations fundamentally restricted the statistical significance of the empirical findings.',
    highlightWords: ['fundamentally restricted'],
    explanation: 'Balances syllable count, rhythmic stress, and eliminates clunky prepositional stacking for effortless readability.',
    syntaxShift: 'Streamlined into an active nominal subject construction for maximum executive punch.',
  },
  {
    step: 5,
    label: 'Verified Final Rewrite',
    badge: '99% Original • 98% Human',
    badgeColor: '#059669',
    sentence: 'Constrained sample sizes and stringent timelines fundamentally curtailed the statistical validity of the empirical findings.',
    highlightWords: ['curtailed', 'statistical validity'],
    explanation: 'Ready for publication. Completely free of Turnitin AI detector watermarks with zero meaning loss.',
    syntaxShift: 'Certified transformation: zero synonym patchwriting, authentic human cadences throughout.',
  },
];

interface StickyScrollStoryProps {
  isDark?: boolean;
}

export const StickyScrollStory: React.FC<StickyScrollStoryProps> = ({ isDark = false }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentStage = STAGES.find((s) => s.step === activeStep) || STAGES[0];

  return (
    <section
      style={{
        padding: 'clamp(36px, 5vw, 50px) 16px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      <div className="editorial-sticky-grid">
        {/* Left Column: Editorial Philosophy & Interactive Steps */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              background: isDark ? 'rgba(186, 215, 151, 0.15)' : 'var(--rb-accent-light)',
              color: isDark ? 'var(--rb-accent)' : 'var(--rb-accent-dark)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <Layers size={13} />
            <span>HOW THE ENGINE THINKS</span>
          </div>

          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(32px, 4vw, 50px)',
              fontWeight: 700,
              color: 'var(--rb-text)',
              margin: '0 0 20px',
            }}
          >
            Rewrite without losing what you meant.
          </h2>

          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: 'var(--rb-text-secondary)',
              margin: '0 0 36px',
              maxWidth: '520px',
            }}
          >
            Legacy rephrasers perform shallow word substitution that sounds robotic and triggers AI detectors.
            RewriteBot parses grammatical hierarchy, relocates clauses, and recalibrates cadence step-by-step.
          </p>

          {/* Interactive Step Navigator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STAGES.map((stage) => {
              const isActive = activeStep === stage.step;
              return (
                <button
                  key={stage.step}
                  onClick={() => setActiveStep(stage.step)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: isActive
                      ? isDark
                        ? '1.5px solid var(--rb-accent)'
                        : '1.5px solid var(--rb-primary)'
                      : '1px solid var(--rb-border)',
                    background: isActive ? 'var(--rb-surface)' : 'transparent',
                    color: 'var(--rb-text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? 'var(--rb-shadow-sm)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: isActive
                          ? isDark
                            ? 'var(--rb-accent)'
                            : 'var(--rb-primary)'
                          : 'var(--rb-surface-cream)',
                        color: isActive
                          ? isDark
                            ? '#171314'
                            : '#ffffff'
                          : 'var(--rb-text-muted)',
                      }}
                    >
                      {stage.step}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                        {stage.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)' }}>
                        {stage.badge}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color={isActive ? (isDark ? 'var(--rb-accent)' : 'var(--rb-primary)') : 'var(--rb-text-muted)'}
                    style={{
                      transform: isActive ? 'translateX(2px)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Morphing Transformation Canvas */}
        <div
          style={{
            position: 'relative',
            background: 'var(--rb-surface)',
            borderRadius: '12px',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-sm)',
            padding: 'clamp(20px, 4vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '400px',
            transition: 'all 0.25s ease',
          }}
        >
          <div>
            {/* Top Stage Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: '1px solid var(--rb-border)',
                paddingBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isDark ? 'var(--rb-accent)' : 'var(--rb-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Stage 0{currentStage.step} of 05
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--rb-surface-cream)',
                    color: currentStage.badgeColor,
                    fontWeight: 600,
                    border: '1px solid var(--rb-border)',
                  }}
                >
                  {currentStage.badge}
                </span>
              </div>

              {/* Step dots */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {STAGES.map((s) => (
                  <span
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: s.step === activeStep ? (isDark ? 'var(--rb-accent)' : 'var(--rb-primary)') : 'var(--rb-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Transformed Sentence */}
            <div
              className="font-serif"
              style={{
                fontSize: '22px',
                lineHeight: 1.65,
                color: 'var(--rb-text)',
                margin: '24px 0',
                minHeight: '96px',
              }}
            >
              "{currentStage.sentence}"
            </div>

            {/* Syntax Breakdown Blueprint */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                background: 'var(--rb-surface-cream)',
                border: '1px solid var(--rb-border)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--rb-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                Syntactic Blueprint:
              </div>
              <div style={{ fontSize: '13px', color: 'var(--rb-text)', lineHeight: 1.5 }}>
                {currentStage.syntaxShift}
              </div>
            </div>

            {/* Explanation Note */}
            <p style={{ fontSize: '13.5px', color: 'var(--rb-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {currentStage.explanation}
            </p>
          </div>

          {/* Bottom Next Step Trigger */}
          <div
            style={{
              paddingTop: '20px',
              marginTop: '24px',
              borderTop: '1px solid var(--rb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12.5px', color: 'var(--rb-text-muted)' }}>
              Interactive syntactic engine simulation
            </span>

            <button
              onClick={() => setActiveStep((prev) => (prev < 5 ? prev + 1 : 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                background: isDark ? 'var(--rb-accent)' : 'var(--rb-primary)',
                color: isDark ? '#171314' : '#ffffff',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{activeStep < 5 ? 'Next Stage' : 'Restart Cycle'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
