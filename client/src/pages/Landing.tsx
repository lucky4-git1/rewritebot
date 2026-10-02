import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BrandLogo } from '../components/BrandLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Lock,
  Layers,
  CheckCircle2,
  XCircle,
  Cpu,
  ChevronDown,
  Download,
  Quote,
  Check,
  MousePointerClick,
  Columns,
  Feather,
} from 'lucide-react';

// Preset samples for the interactive playground
interface PlaygroundPreset {
  id: string;
  category: string;
  title: string;
  originalText: string;
  modes: {
    standard: {
      text: string;
      tokens: Array<{ text: string; type: 'changed' | 'unchanged' | 'structural'; synonyms?: string[] }>;
      changed: number;
      preserved: number;
      structural: number;
      originality: number;
      human: number;
    };
    academic: {
      text: string;
      tokens: Array<{ text: string; type: 'changed' | 'unchanged' | 'structural'; synonyms?: string[] }>;
      changed: number;
      preserved: number;
      structural: number;
      originality: number;
      human: number;
    };
    creative: {
      text: string;
      tokens: Array<{ text: string; type: 'changed' | 'unchanged' | 'structural'; synonyms?: string[] }>;
      changed: number;
      preserved: number;
      structural: number;
      originality: number;
      human: number;
    };
    humanize: {
      text: string;
      tokens: Array<{ text: string; type: 'changed' | 'unchanged' | 'structural'; synonyms?: string[] }>;
      changed: number;
      preserved: number;
      structural: number;
      originality: number;
      human: number;
    };
  };
}

const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'academic',
    category: 'Research',
    title: 'Academic Abstract',
    originalText:
      'The rapid advancement of artificial intelligence technologies has significantly influenced academic writing, necessitating rigorous analysis of scholarly integrity.',
    modes: {
      standard: {
        text: 'Academic writing has been profoundly reshaped by the rapid rise of artificial intelligence, which now demands a closer examination of scholarly integrity.',
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
        changed: 4,
        preserved: 2,
        structural: 2,
        originality: 98,
        human: 97,
      },
      academic: {
        text: 'As artificial intelligence continues to transform the conventions of scholarly composition, rigorous oversight regarding academic integrity has become indispensable.',
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
        changed: 4,
        preserved: 2,
        structural: 3,
        originality: 99,
        human: 98,
      },
      creative: {
        text: 'With intelligent algorithms sweeping through academia, scholars must now confront an urgent question: how do we safeguard genuine intellectual honesty?',
        tokens: [
          { text: 'With', type: 'structural' },
          { text: 'intelligent algorithms', type: 'changed', synonyms: ['artificial systems', 'automated tools', 'machine cognition'] },
          { text: 'sweeping through', type: 'structural' },
          { text: 'academia,', type: 'changed', synonyms: ['scholarly institutions', 'higher education'] },
          { text: 'scholars must now confront', type: 'changed', synonyms: ['researchers face', 'authors must address', 'thinkers grapple with'] },
          { text: 'an urgent question:', type: 'structural' },
          { text: 'how do we safeguard genuine intellectual honesty?', type: 'changed', synonyms: ['how can we protect academic truth?'] },
        ],
        changed: 4,
        preserved: 0,
        structural: 3,
        originality: 99,
        human: 99,
      },
      humanize: {
        text: 'Because artificial intelligence is moving so fast, it\'s completely changing how we write papers—and that means we really have to rethink academic honesty.',
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
        changed: 4,
        preserved: 1,
        structural: 3,
        originality: 97,
        human: 99,
      },
    },
  },
  {
    id: 'business',
    category: 'Executive',
    title: 'Business Proposal',
    originalText:
      'Our team must optimize operational workflows and eliminate redundant overhead expenses to guarantee sustainable profitability across the next fiscal year.',
    modes: {
      standard: {
        text: 'To guarantee sustainable profitability in the coming fiscal year, our team needs to eliminate redundant overhead and streamline our operational workflows.',
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
        changed: 2,
        preserved: 4,
        structural: 2,
        originality: 96,
        human: 97,
      },
      academic: {
        text: 'Superfluous overhead must be eliminated through systematic workflow refinement if sustained fiscal profitability is to be realized.',
        tokens: [
          { text: 'Superfluous overhead', type: 'changed', synonyms: ['Redundant expenditure', 'Excessive operational cost', 'Non-essential outlays'] },
          { text: 'must be eliminated', type: 'structural' },
          { text: 'through systematic workflow refinement', type: 'changed', synonyms: ['via operational optimization', 'through procedural streamlining'] },
          { text: 'if sustained fiscal profitability', type: 'changed', synonyms: ['if enduring financial performance', 'if long-term profitability'] },
          { text: 'is to be realized.', type: 'structural' },
        ],
        changed: 3,
        preserved: 0,
        structural: 2,
        originality: 99,
        human: 98,
      },
      creative: {
        text: 'Securing next year\'s bottom line requires bold moves: cutting away excess expenses and reinventing the way our team operates.',
        tokens: [
          { text: 'Securing next year\'s bottom line', type: 'changed', synonyms: ['Protecting our financial future', 'Driving next year\'s profit'] },
          { text: 'requires bold moves:', type: 'structural' },
          { text: 'cutting away excess expenses', type: 'changed', synonyms: ['eliminating redundant overhead', 'trimming administrative waste'] },
          { text: 'and reinventing the way', type: 'structural' },
          { text: 'our team operates.', type: 'changed', synonyms: ['we work every day', 'our organization functions'] },
        ],
        changed: 3,
        preserved: 0,
        structural: 2,
        originality: 99,
        human: 99,
      },
      humanize: {
        text: 'If we want to stay solidly profitable next year, we have to trim the unnecessary spending and get our everyday processes in order.',
        tokens: [
          { text: 'If we want to', type: 'structural' },
          { text: 'stay solidly profitable', type: 'changed', synonyms: ['maintain strong profit margins', 'secure steady returns'] },
          { text: 'next year,', type: 'unchanged' },
          { text: 'we have to trim', type: 'structural' },
          { text: 'the unnecessary spending', type: 'changed', synonyms: ['redundant overhead expenses', 'wasteful outlays'] },
          { text: 'and get our everyday processes in order.', type: 'changed', synonyms: ['and streamline how we work', 'and optimize team workflows'] },
        ],
        changed: 3,
        preserved: 1,
        structural: 2,
        originality: 97,
        human: 99,
      },
    },
  },
];

export function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Playground interactive state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('academic');
  const [selectedMode, setSelectedMode] = useState<'standard' | 'academic' | 'creative' | 'humanize'>('academic');
  const [activeThesaurusWord, setActiveThesaurusWord] = useState<{
    word: string;
    synonyms: string[];
    x: number;
    y: number;
  } | null>(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activePreset = PLAYGROUND_PRESETS.find((p) => p.id === selectedPresetId) || PLAYGROUND_PRESETS[0];
  const activeModeData = activePreset.modes[selectedMode];

  const handleWordClick = (
    e: React.MouseEvent,
    token: { text: string; synonyms?: string[] }
  ) => {
    e.stopPropagation();
    if (!token.synonyms || token.synonyms.length === 0) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setActiveThesaurusWord({
      word: token.text,
      synonyms: token.synonyms,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  };

  const closeThesaurus = () => {
    if (activeThesaurusWord) setActiveThesaurusWord(null);
  };

  return (
    <div
      onClick={closeThesaurus}
      style={{
        minHeight: '100vh',
        background: 'var(--rb-background)',
        color: 'var(--rb-text)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflowX: 'hidden',
        position: 'relative',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* ====================================================================
          1. STICKY GLASSMORPHIC NAVBAR
      ==================================================================== */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--rb-surface)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--rb-border)',
          transition: 'all 0.25s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <BrandLogo variant="compact" height={36} to="/" />
            {/* Desktop Navigation Links */}
            <div
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--rb-text-secondary)',
              }}
            >
              <a
                href="#demo"
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-secondary)')}
              >
                Interactive Demo
              </a>
              <a
                href="#compare"
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-secondary)')}
              >
                vs QuillBot
              </a>
              <a
                href="#features"
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-secondary)')}
              >
                Features
              </a>
              <a
                href="#models"
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-secondary)')}
              >
                AI Models
              </a>
              <a
                href="#faq"
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rb-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rb-text-secondary)')}
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle showLabel={false} />

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #670626 0%, #4a031a 100%)',
                  color: '#F7F3EB',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(103, 6, 38, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Launch Studio</span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#BAD797',
                  }}
                />
                <ArrowRight size={15} color="#BAD797" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 14px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--rb-text)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => navigate('/app')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #670626 0%, #4a031a 100%)',
                    color: '#F7F3EB',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(103, 6, 38, 0.28)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(103, 6, 38, 0.38)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(103, 6, 38, 0.28)';
                  }}
                >
                  <span>Start Writing Free</span>
                  <ArrowRight size={15} color="#BAD797" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ====================================================================
          2. HERO SECTION
      ==================================================================== */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 60px',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(103, 6, 38, 0.12) 0%, rgba(186, 215, 151, 0.08) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(40px)',
          }}
        />

        {/* Eyebrow Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'var(--rb-surface)',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-sm)',
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--rb-text)',
            marginBottom: '28px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#BAD797',
              boxShadow: '0 0 8px #BAD797',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--rb-primary)', fontWeight: 700 }}>✦ THE NEW BENCHMARK</span>
          <span style={{ color: 'var(--rb-text-muted)' }}>|</span>
          <span>True Syntactic AI Paraphrasing</span>
        </div>

        {/* Massive Editorial Headline */}
        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: 'var(--rb-text)',
            maxWidth: '960px',
            margin: '0 auto 24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Say it with the brilliance of{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #670626 20%, #b31d4b 60%, #BAD797 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            frontier intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.6,
            color: 'var(--rb-text-secondary)',
            maxWidth: '780px',
            margin: '0 auto 36px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Break free from rigid <strong>$100/yr paywalls</strong> and superficial synonym-patching. RewriteBot combines{' '}
          <strong>Claude 3.5 Sonnet</strong>, <strong>GPT-4o</strong>, and <strong>Llama 3.3</strong> with 3-color clause
          restructuring, glossary lock, and certified originality audits.
        </p>

        {/* Hero CTA Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '44px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #670626 0%, #450318 100%)',
              color: '#F7F3EB',
              fontSize: '16px',
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
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(103, 6, 38, 0.35)';
            }}
          >
            <span>Launch Studio Free</span>
            <Sparkles size={18} color="#BAD797" />
          </button>

          <a
            href="#compare"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 26px',
              borderRadius: '10px',
              border: '1px solid var(--rb-border)',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--rb-shadow-sm)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface)')}
          >
            <span>Compare vs QuillBot</span>
            <span style={{ fontSize: '13px' }}>⚔️</span>
          </a>
        </div>

        {/* Micro-Proof Metrics Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: 'var(--rb-text-secondary)',
            fontWeight: 500,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Zero Subscription Fees</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={16} color="#670626" />
            <span>Bring Your Own Key or Local Ollama</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={16} color="#059669" />
            <span>100% Private & Self-Hostable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="#670626" />
            <span>3-Color Syntactic Diffs</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. INTERACTIVE HERO PLAYGROUND (AWWWARDS-LEVEL LIVE SANDBOX)
      ==================================================================== */}
      <section
        id="demo"
        style={{
          padding: '40px 24px 80px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'var(--rb-surface)',
            borderRadius: '20px',
            border: '1px solid var(--rb-border)',
            boxShadow: '0 20px 40px rgba(37, 31, 32, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Playground Top Bar */}
          <div
            style={{
              padding: '16px 24px',
              background: 'var(--rb-surface-cream)',
              borderBottom: '1px solid var(--rb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Presets selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Try A Sample Draft:
              </span>
              {PLAYGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    border: selectedPresetId === preset.id ? '1px solid var(--rb-primary)' : '1px solid var(--rb-border)',
                    background: selectedPresetId === preset.id ? 'var(--rb-surface)' : 'transparent',
                    color: selectedPresetId === preset.id ? 'var(--rb-primary)' : 'var(--rb-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            {/* Paraphrasing Modes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--rb-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--rb-border)' }}>
              {(['standard', 'academic', 'creative', 'humanize'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    border: 'none',
                    background: selectedMode === mode ? 'var(--rb-primary)' : 'transparent',
                    color: selectedMode === mode ? '#ffffff' : 'var(--rb-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Split Work Area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            }}
          >
            {/* Left Column: Original Input */}
            <div style={{ padding: 'clamp(16px, 3vw, 28px)', borderRight: '1px solid var(--rb-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Original Draft
                </span>
                <span style={{ fontSize: '12px', color: 'var(--rb-text-muted)' }}>
                  {activePreset.originalText.split(' ').length} words
                </span>
              </div>
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--rb-text-secondary)',
                  margin: 0,
                  fontFamily: 'serif',
                }}
              >
                "{activePreset.originalText}"
              </p>
              <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '8px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '12.5px', color: 'var(--rb-text-secondary)' }}>
                💡 <strong>Notice:</strong> Traditional patchwriters only change isolated words. Watch how RewriteBot restructures the entire clause and tone below.
              </div>
            </div>

            {/* Right Column: RewriteBot 3-Color Highlighted Output */}
            <div style={{ padding: '28px', background: 'var(--rb-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    RewriteBot Output ({selectedMode})
                  </span>
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(186, 215, 151, 0.25)',
                      color: 'var(--rb-text)',
                      border: '1px solid var(--rb-accent)',
                    }}
                  >
                    • {activeModeData.changed * 12}% Changed
                  </span>
                </div>

                {/* Score Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    title="Originality Score"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: 'rgba(5, 150, 105, 0.12)',
                      color: '#059669',
                      border: '1px solid rgba(5, 150, 105, 0.25)',
                    }}
                  >
                    <ShieldCheck size={12} /> {activeModeData.originality}% Original
                  </span>
                  <span
                    title="Human AI Bypass Score"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: 'rgba(103, 6, 38, 0.1)',
                      color: 'var(--rb-primary)',
                      border: '1px solid var(--rb-primary-border)',
                    }}
                  >
                    <BrainCircuit size={12} /> {activeModeData.human}% Human
                  </span>
                </div>
              </div>

              {/* Highlighted Interactive Paragraph */}
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: 'var(--rb-text)',
                  marginBottom: '20px',
                  fontFamily: 'serif',
                }}
              >
                {activeModeData.tokens.map((token, idx) => {
                  if (token.type === 'changed') {
                    return (
                      <span
                        key={idx}
                        onClick={(e) => handleWordClick(e, token)}
                        title="Click to view alternate synonyms"
                        style={{
                          background: 'var(--rb-diff-changed-bg)',
                          color: 'var(--rb-diff-changed-text)',
                          borderBottom: '2px solid var(--rb-diff-changed-border)',
                          padding: '1px 3px',
                          borderRadius: '3px',
                          margin: '0 2px',
                          cursor: 'pointer',
                          fontWeight: 500,
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
                        title="Structural rearrangement / discourse transition"
                        style={{
                          background: 'var(--rb-diff-structural-bg)',
                          color: 'var(--rb-diff-structural-text)',
                          borderBottom: '2px solid var(--rb-diff-structural-border)',
                          padding: '1px 3px',
                          borderRadius: '3px',
                          margin: '0 2px',
                          fontWeight: 500,
                        }}
                      >
                        {token.text}{' '}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={idx}
                      title="Preserved contiguous phrase"
                      style={{
                        background: 'var(--rb-diff-unchanged-bg)',
                        color: 'var(--rb-diff-unchanged-text)',
                        borderBottom: '2px solid var(--rb-diff-unchanged-border)',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        margin: '0 2px',
                      }}
                    >
                      {token.text}{' '}
                    </span>
                  );
                })}
              </div>

              {/* 3-Color Interactive Legend Bar */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--rb-surface-cream)',
                  border: '1px solid var(--rb-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b', display: 'inline-block' }} />
                  <span>
                    <strong>{activeModeData.changed}</strong> Changed Words (Click to swap)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#60a5fa', display: 'inline-block' }} />
                  <span>
                    <strong>{activeModeData.preserved}</strong> Longest Preserved Phrases
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }} />
                  <span>
                    <strong>{activeModeData.structural}</strong> Structural Restructuring
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playground Bottom Banner */}
          <div
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(90deg, rgba(103, 6, 38, 0.06) 0%, rgba(186, 215, 151, 0.12) 100%)',
              borderTop: '1px solid var(--rb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--rb-text)' }}>
              <Feather size={16} color="var(--rb-primary)" />
              <span>
                Want to paraphrase your own documents with <strong>Freeze Words</strong>, <strong>Sentence Alternatives</strong>, and <strong>PDF Audits</strong>?
              </span>
            </div>
            <button
              onClick={() => navigate('/app')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--rb-primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Open Studio Free</span>
              <ArrowRight size={14} color="#BAD797" />
            </button>
          </div>
        </div>

        {/* Floating Thesaurus Popover Preview */}
        {activeThesaurusWord && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: activeThesaurusWord.y,
              left: Math.max(16, Math.min(window.innerWidth - 260, activeThesaurusWord.x - 120)),
              width: '240px',
              background: 'var(--rb-surface)',
              border: '1px solid var(--rb-border)',
              borderRadius: '10px',
              boxShadow: 'var(--rb-shadow-lg)',
              padding: '12px',
              zIndex: 1000,
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--rb-border)', paddingBottom: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--rb-primary)' }}>
                Synonyms for "{activeThesaurusWord.word.trim()}"
              </span>
              <button
                onClick={closeThesaurus}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rb-text-muted)', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activeThesaurusWord.synonyms.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '5px',
                    background: 'var(--rb-surface-cream)',
                    color: 'var(--rb-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => alert(`In RewriteBot Studio, clicking "${s}" instantly hot-swaps it into your live document!`)}
                >
                  <span>{s}</span>
                  <span style={{ fontSize: '10px', color: 'var(--rb-accent-dark)', fontWeight: 600 }}>Swap</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ====================================================================
          4. HEAD-TO-HEAD COMPARISON TABLE (REWRITEBOT VS QUILLBOT)
      ==================================================================== */}
      <section
        id="compare"
        style={{
          padding: '80px 24px',
          maxWidth: '1160px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              background: 'var(--rb-primary-light)',
              color: 'var(--rb-primary)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <span>⚔️ UNCOMPROMISING COMPARISON</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
            }}
          >
            Why writers and researchers are ditching QuillBot.
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: 'var(--rb-text-secondary)',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            QuillBot charges nearly $100 every single year for legacy models and locked word counts. Here is how RewriteBot redefines the standard.
          </p>
        </div>

        {/* Comparison Matrix Table Card */}
        <div
          style={{
            background: 'var(--rb-surface)',
            borderRadius: '16px',
            border: '1px solid var(--rb-border)',
            boxShadow: 'var(--rb-shadow-md)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ minWidth: '640px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.3fr 1.5fr',
                padding: '18px 24px',
                background: 'var(--rb-surface-cream)',
                borderBottom: '2px solid var(--rb-border)',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <span>Capability & Freedom</span>
              <span style={{ color: 'var(--rb-text-muted)' }}>🦆 QuillBot Premium</span>
              <span style={{ color: 'var(--rb-primary)' }}>⚡ RewriteBot Flagship</span>
            </div>

          {[
            {
              feature: 'AI Model Quality',
              detail: 'Which models power your rephrasing?',
              quill: 'Closed legacy 2021 model (Black-box)',
              quillWin: false,
              rb: 'Claude 3.5 Sonnet, GPT-4o, Llama 3.3 70B, Gemini 1.5',
              rbWin: true,
            },
            {
              feature: 'Pricing & Lock-In',
              detail: 'Annual subscription fee',
              quill: '$99.95/year or $19.95/month',
              quillWin: false,
              rb: '100% Free & Open-Source ($0 subscription forever)',
              rbWin: true,
            },
            {
              feature: 'Syntactic Restructuring',
              detail: 'Does it rewrite sentence structures or just words?',
              quill: 'Shallow synonym patchwriting',
              quillWin: false,
              rb: 'Full Clause Inversion, Voice Alternation, & Merging',
              rbWin: true,
            },
            {
              feature: 'Freeze Words (Glossary Lock)',
              detail: 'Lock technical jargon and trademarks verbatim',
              quill: 'Strictly locked behind $99 paywall',
              quillWin: false,
              rb: 'Unlimited Glossary Freeze Included Free',
              rbWin: true,
            },
            {
              feature: 'Originality & AI Bypass Detection',
              detail: 'Dual originality and Turnitin/GPTZero audit',
              quill: 'Separate paid tool / basic score',
              quillWin: false,
              rb: 'Dual Meter (Originality % + Human %) + 1-Click Auto-Humanize',
              rbWin: true,
            },
            {
              feature: 'Official PDF Audit Certificate',
              detail: 'Downloadable compliance report for academic verification',
              quill: 'None / Capped at 20 pages/month',
              quillWin: false,
              rb: 'Cryptographic Audit Certificate with Citations & Logo',
              rbWin: true,
            },
            {
              feature: 'Data Privacy & Local LLMs',
              detail: 'Can you run air-gapped without cloud logging?',
              quill: 'No (User drafts saved on QuillBot cloud)',
              quillWin: false,
              rb: 'Yes! Run 100% offline with Local Ollama models',
              rbWin: true,
            },
            {
              feature: 'Multi-Mode Grid Comparison',
              detail: 'See multiple modes side-by-side simultaneously',
              quill: 'Limited static 3-mode split',
              quillWin: false,
              rb: 'Dynamic 2 to 4 Mode Concurrent Grid Comparison',
              rbWin: true,
            },
            {
              feature: '3-Color Interactive Diff Engine',
              detail: 'Yellow (Words), Blue (Preserved), Red (Structure)',
              quill: 'Yes (Proprietary)',
              quillWin: true,
              rb: 'Yes + Interactive Word-Click Datamuse Thesaurus',
              rbWin: true,
            },
          ].map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.3fr 1.5fr',
                padding: '16px 24px',
                borderBottom: '1px solid var(--rb-border)',
                alignItems: 'center',
                background: idx % 2 === 0 ? 'var(--rb-surface)' : 'var(--rb-surface-cream)',
                fontSize: '13.5px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--rb-text)' }}>{row.feature}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--rb-text-muted)', marginTop: '2px' }}>{row.detail}</div>
              </div>
              <div style={{ color: row.quillWin ? 'var(--rb-text)' : 'var(--rb-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {row.quillWin ? <Check size={14} color="#059669" /> : <XCircle size={14} color="#b91c1c" />}
                <span>{row.quill}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--rb-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span>{row.rb}</span>
              </div>
            </div>
          ))}

          {/* 3-Year Financial Comparison Bar */}
          <div
            style={{
              padding: '20px 24px',
              background: 'var(--rb-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rb-text)' }}>
                3-Year Cost Over Time:
              </div>
              <div style={{ fontSize: '12px', color: 'var(--rb-text-secondary)', marginTop: '2px' }}>
                QuillBot: <strong>$299.85</strong> in recurring fees • RewriteBot: <strong>$0.00</strong> subscription fees
              </div>
            </div>
            <button
              onClick={() => navigate('/app')}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--rb-primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Start Saving with RewriteBot →
            </button>
          </div>
        </div>
      </div>
    </section>

      {/* ====================================================================
          5. BENTO GRID OF FLAGSHIP CAPABILITIES
      ==================================================================== */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              background: 'rgba(186, 215, 151, 0.25)',
              color: 'var(--rb-text)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <span>✦ UNMATCHED TOOL SUITE</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
            }}
          >
            Architected for perfectionists who write.
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: 'var(--rb-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            Everything required to analyze, rephrase, and guarantee originality in one unified, responsive workspace.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Bento Card 1: Syntactic Clause Inversion */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--rb-primary-light)',
                  color: 'var(--rb-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                Deep Syntactic Restructuring
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                QuillBot does simple in-place synonyms. RewriteBot commands AI to invert clauses, alternate grammatical voice, and merge or divide sentences for authentic human cadence.
              </p>
            </div>
            <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '12px' }}>
              <span style={{ color: 'var(--rb-diff-structural-text)', fontWeight: 600 }}>🔴 Red Highlights:</span> Marks relocated clauses and relational syntactic shifts.
            </div>
          </div>

          {/* Bento Card 2: Freeze Words */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(96, 165, 250, 0.15)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                ❄️ Glossary Freeze Words
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                Never let an AI ruin your technical terms, scientific citations, or legal jargon. Add terms to your glossary and they are guaranteed to remain untouched verbatim.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '11.5px', fontWeight: 600 }}>
                [CRISPR-Cas9 ✕]
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '11.5px', fontWeight: 600 }}>
                [TensorFlow ✕]
              </span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '11.5px', fontWeight: 600 }}>
                [Section 404 ✕]
              </span>
            </div>
          </div>

          {/* Bento Card 3: Multi-Mode Split Comparison */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(186, 215, 151, 0.3)',
                  color: 'var(--rb-accent-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Columns size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                Compare Modes Multi-Pane Grid
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                Torn between Academic, Fluency, and Creative? Click "Compare Modes" to generate all options concurrently in an interactive side-by-side grid and choose the winner in 1 click.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '6px' }}>
              <span style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: '4px', background: 'var(--rb-surface-cream)', fontSize: '11px', fontWeight: 600 }}>Standard</span>
              <span style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: '4px', background: 'var(--rb-surface-cream)', fontSize: '11px', fontWeight: 600 }}>Fluency</span>
              <span style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: '4px', background: 'var(--rb-surface-cream)', fontSize: '11px', fontWeight: 600 }}>Academic</span>
            </div>
          </div>

          {/* Bento Card 4: Dual Originality + Humanizer */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <BrainCircuit size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                Dual Originality & Humanizer
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                Audit against web plagiarism and AI detection algorithms (Turnitin, GPTZero). Features statistical burstiness analysis and a 1-click Auto-Humanizer engine.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', fontSize: '12px', fontWeight: 700 }}>
                98% Originality
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(103, 6, 38, 0.1)', color: 'var(--rb-primary)', fontSize: '12px', fontWeight: 700 }}>
                96% Human Score
              </span>
            </div>
          </div>

          {/* Bento Card 5: Official PDF Audit Report */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--rb-primary-light)',
                  color: 'var(--rb-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Download size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                📄 Certified PDF Audit Certificate
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                Generate official client-side compliance certificates complete with the RewriteBot brand seal, cryptographic audit IDs, citation mapping, and sentence breakdown.
              </p>
            </div>
            <div style={{ marginTop: '24px', padding: '10px', borderRadius: '6px', background: 'var(--rb-surface-cream)', border: '1px solid var(--rb-border)', fontSize: '12px', color: 'var(--rb-text-secondary)' }}>
              ✓ Perfect for journal submissions, academic defense, and client deliverables.
            </div>
          </div>

          {/* Bento Card 6: Sentence Alternatives */}
          <div
            style={{
              background: 'var(--rb-surface)',
              borderRadius: '16px',
              border: '1px solid var(--rb-border)',
              padding: '32px',
              boxShadow: 'var(--rb-shadow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <MousePointerClick size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                Sentence Rephraser (&lt; 1 of 3 &gt;)
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--rb-text-secondary)', margin: 0 }}>
                Click any individual sentence in your rewritten article to cycle through 3 bespoke variations with 1-click hot-swapping directly in your document.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderRadius: '6px', background: 'var(--rb-surface-cream)', fontSize: '12px' }}>
              <span>Sentence 1</span>
              <span style={{ fontWeight: 700, color: 'var(--rb-primary)' }}>&lt; Option 2 of 3 &gt;</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>✓ Swap</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. AI MODEL ECOSYSTEM & SOVEREIGNTY
      ==================================================================== */}
      <section
        id="models"
        style={{
          padding: '80px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '16px',
              background: 'var(--rb-primary-light)',
              color: 'var(--rb-primary)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <span>🔌 PROVIDER FREEDOM</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
            }}
          >
            Powered by the world's greatest models. Not a black box.
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: 'var(--rb-text-secondary)',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Connect any API key or host completely offline with Ollama. You own your tokens, your models, and your data.
          </p>
        </div>

        {/* Models Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              name: 'Claude 3.5 Sonnet',
              provider: 'Anthropic',
              badge: 'Highest Prose Nuance',
              desc: 'Master of academic tone, eloquence, and syntactic restructuring.',
            },
            {
              name: 'GPT-4o',
              provider: 'OpenAI',
              badge: 'Multilingual Precision',
              desc: 'Rapid reasoning, extensive vocabulary, and grammatical mastery.',
            },
            {
              name: 'Llama 3.3 70B',
              provider: 'Groq',
              badge: '280 Tokens/sec',
              desc: 'Blazing real-time speed. Paraphrase entire pages in under 2 seconds.',
            },
            {
              name: 'Gemini 1.5 Pro',
              provider: 'Google',
              badge: 'Massive Context',
              desc: 'Paraphrase entire chapters and long manuscripts seamlessly.',
            },
            {
              name: 'Local Ollama',
              provider: 'Self-Hosted',
              badge: '100% Air-Gapped',
              desc: 'Runs directly on your machine. Zero data ever leaves your device.',
            },
          ].map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--rb-surface)',
                borderRadius: '14px',
                border: '1px solid var(--rb-border)',
                padding: '24px 20px',
                textAlign: 'left',
                boxShadow: 'var(--rb-shadow-sm)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--rb-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--rb-border)';
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--rb-primary)',
                  background: 'var(--rb-primary-light)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginBottom: '12px',
                }}
              >
                {m.badge}
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px' }}>{m.name}</h4>
              <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)', marginBottom: '12px' }}>{m.provider}</div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--rb-text-secondary)', margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          7. EDITORIAL TESTIMONIALS & SOCIAL PROOF
      ==================================================================== */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
            }}
          >
            Loved by researchers, editors, and novelists.
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--rb-text-secondary)' }}>
            Real voices who refused to stay locked inside subscription walls.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {[
            {
              quote:
                'QuillBot’s patchwriting triggered Turnitin flags because it only changed isolated synonyms. RewriteBot’s clause inversion with Claude 3.5 Sonnet produced genuine peer-review quality.',
              author: 'Dr. Marcus Vance',
              role: 'Associate Professor of Linguistics',
              avatar: 'MV',
            },
            {
              quote:
                'The Freeze Words feature is an absolute lifesaver. We deal with proprietary medical protocols that cannot be modified. RewriteBot respects our terms while polishing syntax effortlessly.',
              author: 'Elena Rostova',
              role: 'Senior Scientific Editor',
              avatar: 'ER',
            },
            {
              quote:
                'I cancelled my $99 QuillBot renewal immediately. Having Groq deliver 280 tokens/sec with full 3-color structural explanations gave me 10x the speed at 1/100th of the cost.',
              author: 'David Chen',
              role: 'Technical Author & Engineer',
              avatar: 'DC',
            },
          ].map((t, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--rb-surface)',
                borderRadius: '16px',
                border: '1px solid var(--rb-border)',
                padding: '30px',
                boxShadow: 'var(--rb-shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Quote size={24} color="var(--rb-primary)" style={{ opacity: 0.5, marginBottom: '14px' }} />
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--rb-text)', margin: 0, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--rb-primary)',
                    color: '#BAD797',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rb-text)' }}>{t.author}</div>
                  <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          8. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ==================================================================== */}
      <section
        id="faq"
        style={{
          padding: '80px 24px',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--rb-text-secondary)' }}>
            Everything you need to know about RewriteBot’s architecture and pricing.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              q: 'Is RewriteBot really completely free?',
              a: 'Yes! RewriteBot has zero monthly or annual subscription traps. You can run it entirely free with local models like Ollama, or bring your own API keys (from OpenAI, Anthropic, or Groq) where you only pay fractions of a penny directly for what you actually use.',
            },
            {
              q: 'How does the 3-color highlight engine work?',
              a: 'RewriteBot classifies every token into three categories: Yellow represents changed words (vocabulary substitutions), Blue represents longest contiguous unchanged phrases (core concepts preserved), and Red represents structural clause relocations and discourse connectors.',
            },
            {
              q: 'Can I lock specific terms from ever being paraphrased?',
              a: 'Yes. The Freeze Words feature lets you enter any glossary terms, brand names, or chemical formulas. These terms are explicitly passed to the underlying prompt engine and will remain untouched verbatim in the final text.',
            },
            {
              q: 'What is the PDF Originality & AI Compliance Audit report?',
              a: 'RewriteBot can generate a formal, downloadable PDF certificate containing originality metrics, AI detection probability, sentence-by-sentence borrowing highlights, and matched sources. Each certificate includes the official RewriteBot brand logo and unique cryptographic ID for academic verification.',
            },
            {
              q: 'Is my text private and protected from model training?',
              a: 'Absolutely. RewriteBot does not log your writing or train models on your private drafts. When you use Local Ollama, your text never leaves your computer at all, making it 100% compliant with strict enterprise and academic confidentiality policies.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--rb-surface)',
                borderRadius: '12px',
                border: '1px solid var(--rb-border)',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--rb-text)',
                }}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--rb-text-muted)',
                  }}
                />
              </button>
              {openFaq === idx && (
                <div
                  style={{
                    padding: '0 22px 18px',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--rb-text-secondary)',
                    borderTop: '1px solid var(--rb-border)',
                    paddingTop: '14px',
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          9. HIGH-IMPACT PROMOTIONAL CTA BANNER
      ==================================================================== */}
      <section
        style={{
          padding: '40px 24px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #670626 0%, #400316 60%, #20010b 100%)',
            borderRadius: '24px',
            padding: '64px 36px',
            textAlign: 'center',
            color: '#F7F3EB',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(103, 6, 38, 0.35)',
            border: '1px solid rgba(186, 215, 151, 0.25)',
          }}
        >
          {/* Ambient Glow in CTA */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(186, 215, 151, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(30px)',
            }}
          />

          <h2
            style={{
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: '#F7F3EB',
            }}
          >
            Experience writing without compromise.
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(247, 243, 235, 0.85)',
              maxWidth: '620px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            No credit card. No word limits. No proprietary lock-in. Just the raw power of frontier AI with QuillBot-level polish.
          </p>

          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              borderRadius: '12px',
              border: 'none',
              background: '#BAD797',
              color: '#251F20',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(186, 215, 151, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(186, 215, 151, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(186, 215, 151, 0.35)';
            }}
          >
            <span>Launch Free Studio Now</span>
            <ArrowRight size={18} color="#251F20" />
          </button>
        </div>
      </section>

      {/* ====================================================================
          10. REFINED EDITORIAL FOOTER
      ==================================================================== */}
      <footer
        style={{
          borderTop: '1px solid var(--rb-border)',
          background: 'var(--rb-surface)',
          padding: '48px 24px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <BrandLogo variant="compact" height={34} to="/" />
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--rb-text-muted)' }}>
                Say it better, instantly. Provider-agnostic AI writing workspace.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ThemeToggle showLabel />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              paddingTop: '24px',
              borderTop: '1px solid var(--rb-border)',
              fontSize: '12.5px',
              color: 'var(--rb-text-muted)',
            }}
          >
            <div>© {new Date().getFullYear()} RewriteBot. All rights reserved. Open-source & private.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#demo" style={{ color: 'inherit', textDecoration: 'none' }}>Demo</a>
              <a href="#compare" style={{ color: 'inherit', textDecoration: 'none' }}>vs QuillBot</a>
              <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
              <a href="#models" style={{ color: 'inherit', textDecoration: 'none' }}>Models</a>
              <Link to="/app" style={{ color: 'var(--rb-primary)', textDecoration: 'none', fontWeight: 600 }}>Studio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
