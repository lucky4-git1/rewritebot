import React, { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComparisonRow {
  category: string;
  feature: string;
  description: string;
  traditional: string;
  traditionalHas: boolean;
  rewriteBot: string;
  rewriteBotHas: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    category: 'Architecture',
    feature: 'AI Model Freedom',
    description: 'Select frontier reasoning models for prose nuance',
    traditional: 'Closed legacy model (Black-box)',
    traditionalHas: false,
    rewriteBot: 'Claude 3.5 Sonnet, GPT-4o, Llama 3.3 70B, Gemini 1.5',
    rewriteBotHas: true,
  },
  {
    category: 'Freedom',
    feature: 'Subscription Pricing',
    description: 'Annual software licensing and paywalls',
    traditional: '$99.95/year recurring subscription',
    traditionalHas: false,
    rewriteBot: '100% Free & Open-Source ($0 subscription forever)',
    rewriteBotHas: true,
  },
  {
    category: 'Intelligence',
    feature: 'Clause Inversion & Restructuring',
    description: 'Rearranges sentence hierarchy rather than isolated words',
    traditional: 'Shallow word-level synonym patchwriting',
    traditionalHas: false,
    rewriteBot: 'Deep Syntactic Clause Inversion & Voice Alternation',
    rewriteBotHas: true,
  },
  {
    category: 'Privacy',
    feature: 'Data Sovereignty & Local Models',
    description: 'Air-gapped operation without transmitting drafts to cloud',
    traditional: 'No (User drafts saved on cloud servers)',
    traditionalHas: false,
    rewriteBot: '100% Private with Local Ollama integration',
    rewriteBotHas: true,
  },
  {
    category: 'Control',
    feature: 'Glossary Term Freeze',
    description: 'Lock technical jargon and trademark terms verbatim',
    traditional: 'Capped or locked behind paid tiers',
    traditionalHas: false,
    rewriteBot: 'Unlimited Glossary Freeze included free',
    rewriteBotHas: true,
  },
  {
    category: 'Integrity',
    feature: 'Dual Originality & Human Content Audit',
    description: 'Statistical burstiness scoring and plagiarism check',
    traditional: 'Separate paid tool / basic scanning',
    traditionalHas: false,
    rewriteBot: 'Dual Originality % + Human Content % with Auto-Humanize',
    rewriteBotHas: true,
  },
  {
    category: 'Compliance',
    feature: 'Official PDF Audit Certificate',
    description: 'Downloadable compliance document for academic review',
    traditional: 'None or limited per month',
    traditionalHas: false,
    rewriteBot: 'Client-side PDF compliance certificate with seal',
    rewriteBotHas: true,
  },
  {
    category: 'Workflow',
    feature: 'Multi-Pane Mode Comparison',
    description: 'Generate and review multiple modes simultaneously',
    traditional: 'Single output pane',
    traditionalHas: false,
    rewriteBot: 'Concurrent 2-4 mode split view comparison',
    rewriteBotHas: true,
  },
];

interface ComparisonMatrixProps {
  isDark?: boolean;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ isDark = false }) => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="compare"
      style={{
        padding: 'clamp(36px, 5vw, 50px) 16px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      {/* Editorial Section Header: Asymmetric Layout */}
      <div className="editorial-asymmetric-header">
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#BAD797',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '14px',
            }}
          >
            FACTUAL ARCHITECTURAL AUDIT
          </div>
          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(34px, 4.5vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'var(--rb-text)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Why writers are switching to RewriteBot.
          </h2>
        </div>

        <div>
          <p
            style={{
              fontSize: '16.5px',
              color: 'var(--rb-text-secondary)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            An honest, factual breakdown of architectural capabilities. No artificial lock-in, no synthetic paywalls, and no proprietary hostage taking.
          </p>
        </div>
      </div>

      {/* Desktop Editorial Table directly on canvas (Hidden on mobile) */}
      <div className="hide-on-mobile" style={{ borderTop: '1px solid var(--rb-border)', overflowX: 'auto' }}>
        {/* Table Column Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 2.2fr) minmax(170px, 1.4fr) minmax(200px, 1.6fr)',
            padding: '16px 0',
            borderBottom: '1px solid var(--rb-border)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--rb-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span>Capability & Architecture</span>
          <span>Traditional Paywalled Tools</span>
          <span style={{ color: '#BAD797' }}>RewriteBot Studio</span>
        </div>

        {/* Comparison Rows */}
        <div>
          {COMPARISON_DATA.map((row, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 2.2fr) minmax(170px, 1.4fr) minmax(200px, 1.6fr)',
                  padding: '18px 8px',
                  borderBottom: '1px solid var(--rb-border-light)',
                  background: isHovered
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(103, 6, 38, 0.02)'
                    : 'transparent',
                  alignItems: 'center',
                  transition: 'background 0.15s ease',
                  fontSize: '13.5px',
                }}
              >
                {/* Feature Name & Description */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--rb-text)' }}>{row.feature}</div>
                  <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)', marginTop: '2px' }}>
                    {row.description}
                  </div>
                </div>

                {/* Traditional Tools column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rb-text-secondary)', paddingRight: '12px' }}>
                  <X size={14} color="#b91c1c" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px' }}>{row.traditional}</span>
                </div>

                {/* RewriteBot column */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    color: isDark ? '#BAD797' : '#2d5a1e',
                  }}
                >
                  <Check size={14} color="#BAD797" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px' }}>{row.rewriteBot}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Responsive Comparison Cards (Visible only on mobile) */}
      <div className="show-on-mobile-block" style={{ display: 'none', borderTop: '1px solid var(--rb-border)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {COMPARISON_DATA.map((row, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 14px',
                borderRadius: '10px',
                background: 'var(--rb-surface)',
                border: '1px solid var(--rb-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--rb-text)' }}>{row.feature}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#BAD797',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      background: isDark ? 'rgba(186, 215, 151, 0.15)' : 'rgba(103, 6, 38, 0.06)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.category}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--rb-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {row.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Traditional Paywalled */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'var(--rb-text-secondary)',
                  }}
                >
                  <X size={14} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#b91c1c', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Traditional Paywalls
                    </strong>
                    <span>{row.traditional}</span>
                  </div>
                </div>

                {/* RewriteBot Studio */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isDark ? 'rgba(186, 215, 151, 0.12)' : '#f0fdf4',
                    border: isDark ? '1px solid rgba(186, 215, 151, 0.25)' : '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '12.5px',
                    color: isDark ? '#BAD797' : '#15803d',
                    fontWeight: 600,
                  }}
                >
                  <Check size={14} color="#BAD797" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: isDark ? '#BAD797' : '#15803d', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      RewriteBot Studio
                    </strong>
                    <span>{row.rewriteBot}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Year Cost Summary Bar */}
      <div
        style={{
          padding: '20px 8px',
          borderTop: '1px solid var(--rb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginTop: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--rb-text)' }}>
            Total 3-Year Cost Over Time:
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--rb-text-secondary)', marginTop: '2px' }}>
            Traditional Subscriptions: <strong>$299.85</strong> • RewriteBot: <strong>$0.00</strong> subscription fees
          </div>
        </div>

        <button
          onClick={() => navigate('/app')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(247, 243, 235, 0.15)',
            background: '#670626',
            color: '#F7F3EB',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(103, 6, 38, 0.35)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#52041e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#670626')}
        >
          <span>Launch Free Studio</span>
          <ArrowRight size={14} color="#BAD797" />
        </button>
      </div>
    </section>
  );
};
