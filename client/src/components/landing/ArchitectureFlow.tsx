import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ModelProvider {
  id: string;
  name: string;
  creator: string;
  speed: string;
  context: string;
  highlight: string;
  privacy: string;
}

const SUPPORTED_PROVIDERS: ModelProvider[] = [
  {
    id: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    creator: 'Anthropic',
    speed: '65 tok/s',
    context: '200K tokens',
    highlight: 'Gold-standard prose eloquence and complex academic clause restructuring.',
    privacy: 'Zero-retention API',
  },
  {
    id: 'openai',
    name: 'GPT-4o',
    creator: 'OpenAI',
    speed: '85 tok/s',
    context: '128K tokens',
    highlight: 'Exceptional cross-lingual dexterity and strict lexical compliance.',
    privacy: 'Enterprise API standards',
  },
  {
    id: 'groq',
    name: 'Llama 3.3 70B',
    creator: 'Groq LPUs',
    speed: '280 tok/s',
    context: '128K tokens',
    highlight: 'Near-instantaneous paraphrasing for full pages in sub-2 seconds.',
    privacy: 'Direct hardware LPU routing',
  },
  {
    id: 'google',
    name: 'Gemini 1.5 Pro',
    creator: 'Google',
    speed: '70 tok/s',
    context: '1M tokens',
    highlight: 'Unmatched context capacity to paraphrase entire chapters without chunk loss.',
    privacy: 'Developer API standards',
  },
  {
    id: 'ollama',
    name: 'Local Ollama',
    creator: 'Self-Hosted',
    speed: 'Hardware dependent',
    context: 'Up to 32K',
    highlight: '100% Air-Gapped. No data or draft text ever leaves your physical machine.',
    privacy: '100% Offline / Local disk',
  },
];

interface ArchitectureFlowProps {
  isDark?: boolean;
}

export const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({ isDark = false }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('anthropic');
  const activeModel = SUPPORTED_PROVIDERS.find((p) => p.id === selectedModelId) || SUPPORTED_PROVIDERS[0];

  return (
    <section
      id="models"
      style={{
        padding: 'clamp(36px, 5vw, 50px) 16px',
        maxWidth: '1240px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '780px', marginBottom: '32px' }}>
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
          SOVEREIGN INTELLIGENCE PIPELINE
        </div>
        <h2
          className="editorial-headline"
          style={{
            fontSize: 'clamp(34px, 4.5vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--rb-text)',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}
        >
          Frontier models. Zero proprietary lock-in.
        </h2>
        <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'var(--rb-text-secondary)', margin: 0 }}>
          RewriteBot connects directly to frontier reasoning models or completely offline local instances. You bring your own keys or run air-gapped on Ollama.
        </p>
      </div>

      {/* Large Horizontal Architecture Pipeline */}
      <div
        style={{
          borderTop: '1px solid var(--rb-border)',
          borderBottom: '1px solid var(--rb-border)',
          padding: 'clamp(24px, 4vw, 44px) 0',
        }}
      >
        {/* Pipeline Stage Indicators */}
        <div className="editorial-pipeline-grid" style={{ position: 'relative' }}>
          {/* Stage 1: INPUT */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              01 • INPUT
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)', marginBottom: '4px' }}>
              Source Prose
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
              + Glossary term constraints (Frozen Lexicon)
            </div>
          </div>

          {/* Stage 2: UNDERSTANDING */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              02 • UNDERSTANDING
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)', marginBottom: '4px' }}>
              Syntactic Parsing
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
              Clause dependency & discourse role decomposition
            </div>
          </div>

          {/* Stage 3: REWRITE ENGINE (ACTIVE) */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: isDark ? 'rgba(103, 6, 38, 0.25)' : 'var(--rb-primary-light)',
              border: '1.5px solid #670626',
              boxShadow: '0 4px 16px rgba(103, 6, 38, 0.15)',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: isDark ? '#f48fb1' : '#670626', textTransform: 'uppercase', marginBottom: '6px' }}>
              03 • REWRITE ENGINE
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#F7F3EB' : '#670626', marginBottom: '4px' }}>
              {activeModel.name}
            </div>
            <div style={{ fontSize: '12px', color: isDark ? '#f48fb1' : '#851036' }}>
              {activeModel.speed} • {activeModel.privacy}
            </div>
          </div>

          {/* Stage 4: QUALITY CONTROL */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              04 • QUALITY AUDIT
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)', marginBottom: '4px' }}>
              Dual Originality
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
              Statistical burstiness & Turnitin/GPTZero calibration
            </div>
          </div>

          {/* Stage 5: OUTPUT */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              05 • OUTPUT
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)', marginBottom: '4px' }}>
              Relational Prose
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
              3-color syntactic diff & verified PDF certificate
            </div>
          </div>
        </div>

        {/* Interactive Model Selector Strip */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rb-text-muted)', marginBottom: '10px' }}>
            Select Active Intelligence Provider:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {SUPPORTED_PROVIDERS.map((provider) => {
              const isSelected = provider.id === selectedModelId;
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedModelId(provider.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #670626' : '1px solid var(--rb-border)',
                    background: isSelected ? 'var(--rb-surface)' : 'transparent',
                    color: isSelected ? 'var(--rb-text)' : 'var(--rb-text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--rb-shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{provider.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--rb-text-muted)', marginLeft: '6px' }}>
                    ({provider.creator})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Model Spec Details */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '8px',
              background: 'var(--rb-surface-cream)',
              border: '1px solid var(--rb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rb-text)' }}>
                {activeModel.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--rb-text-secondary)', marginTop: '2px' }}>
                {activeModel.highlight}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>{activeModel.privacy}</span>
              </div>
              <div style={{ color: 'var(--rb-text-muted)' }}>
                Context: <strong style={{ color: 'var(--rb-text)' }}>{activeModel.context}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
