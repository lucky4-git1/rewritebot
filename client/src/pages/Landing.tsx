import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { AmbientWordsBackground } from '../components/landing/AmbientWordsBackground';
import { CinematicHero } from '../components/landing/CinematicHero';
import { InteractiveProductDemo } from '../components/landing/InteractiveProductDemo';
import { StickyScrollStory } from '../components/landing/StickyScrollStory';
import { ComparisonMatrix } from '../components/landing/ComparisonMatrix';
import { EditorialFeatureStory } from '../components/landing/EditorialFeatureStory';
import { ArchitectureFlow } from '../components/landing/ArchitectureFlow';

export function Landing() {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--rb-background)',
        color: 'var(--rb-text)',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: 'hidden',
        position: 'relative',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* 0. AMBIENT WORDS GENERATIVE BACKGROUND (WORDS IN MOTION) */}
      <AmbientWordsBackground isDark={isDark} />

      {/* 1. STICKY FROSTED NAVIGATION */}
      <LandingNavbar isDark={isDark} />

      {/* 2. CINEMATIC 100VH EDITORIAL HERO WITH LIVING REWRITE SLATE */}
      <CinematicHero isDark={isDark} />

      {/* 3. PRODUCT DEMO — FULL INTERACTIVE STUDIO */}
      <section
        id="demo"
        style={{
          position: 'relative',
          padding: 'clamp(36px, 5vw, 48px) 16px 44px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto 36px', textAlign: 'center' }}>

          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(30px, 4.2vw, 48px)',
              fontWeight: 700,
              margin: '0 0 12px',
              color: 'var(--rb-text)',
              letterSpacing: '-0.025em',
            }}
          >
            Experience authentic clause restructuring.
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--rb-text-secondary)',
              lineHeight: 1.6,
              margin: '0 auto',
              maxWidth: '640px',
            }}
          >
            Click any highlighted word to test instant synonym swapping, or toggle between Standard, Academic, Creative, and Humanize modes.
          </p>
        </div>

        <InteractiveProductDemo isDark={isDark} />
      </section>

      {/* 4. SCROLL-DRIVEN STICKY STORY (STEP-BY-STEP SYNTAX) */}
      <StickyScrollStory isDark={isDark} />

      {/* 5. EDITORIAL COMPARISON MATRIX (VS TRADITIONAL TOOLS) */}
      <ComparisonMatrix isDark={isDark} />

      {/* 6. EDITORIAL FEATURE STORY (DEMONSTRATIONS ON CANVAS) */}
      <EditorialFeatureStory isDark={isDark} />

      {/* 7. SOVEREIGN INTELLIGENCE LAYER & MODEL ROUTER */}
      <ArchitectureFlow isDark={isDark} />

      {/* 8. TYPOGRAPHIC TESTIMONIALS (DIRECTLY ON CANVAS) */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(40px, 5vw, 56px) 16px 44px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto 36px', textAlign: 'center' }}>
          <div className="editorial-eyebrow-badge" style={{ marginBottom: '16px' }}>
            <span>AUTHENTIC TESTIMONIALS</span>
          </div>
          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(30px, 4.2vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'var(--rb-text)',
              margin: '0 auto',
              letterSpacing: '-0.025em',
            }}
          >
            Built for researchers, editors, and professional writers.
          </h2>
        </div>

        {/* Typographic Quotes on Canvas with Thin Rules */}
        <div
          className="editorial-testimonials-grid"
          style={{
            borderTop: '1px solid var(--rb-border)',
            paddingTop: '28px',
          }}
        >
          {[
            {
              quote:
                'QuillBot’s patchwriting triggered Turnitin AI flags because it only changed isolated synonyms. RewriteBot’s clause inversion with Claude 3.5 Sonnet produced genuine peer-review quality.',
              author: 'Academic Linguistics Researcher',
              role: 'Peer-Reviewed Author & Lecturer',
              tag: 'Academic Writing',
            },
            {
              quote:
                'The Freeze Words feature is an essential lifesaver. We deal with proprietary medical protocols that cannot be modified. RewriteBot respects our terms while polishing syntax effortlessly.',
              author: 'Senior Scientific Editor',
              role: 'Biomedical Journal Reviewer',
              tag: 'Scientific Protocol',
            },
            {
              quote:
                'Running local Ollama models completely air-gapped on my workstation gave me 100% data privacy with zero subscription overhead. Sub-2-second speed with 3-color structural explanations.',
              author: 'Technical Systems Author',
              role: 'Enterprise Documentation Lead',
              tag: 'Data Privacy & BYOK',
            },
          ].map((t, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ marginBottom: '18px' }}>
                <p
                  className="font-serif"
                  style={{
                    fontSize: '16.5px',
                    lineHeight: 1.65,
                    color: 'var(--rb-text)',
                    margin: '0 0 12px',
                    fontStyle: 'italic',
                  }}
                >
                  "{t.quote}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--rb-border-light)', paddingTop: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#BAD797', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                  {t.tag}
                </div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--rb-text)' }}>{t.author}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--rb-text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. MINIMAL ACCORDION FREQUENTLY ASKED QUESTIONS */}
      <section
        id="faq"
        style={{
          position: 'relative',
          padding: 'clamp(40px, 5vw, 56px) 16px 48px',
          maxWidth: '880px',
          margin: '0 auto',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="editorial-eyebrow-badge" style={{ marginBottom: '16px' }}>
            <span>ARCHITECTURE & PRIVACY</span>
          </div>
          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 700,
              margin: '0 auto 10px',
              color: 'var(--rb-text)',
              letterSpacing: '-0.025em',
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '15.5px', color: 'var(--rb-text-secondary)', margin: '0 auto', maxWidth: '580px' }}>
            Everything you need to know about RewriteBot’s architecture, privacy, and models.
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--rb-border)' }}>
          {[
            {
              q: 'Is RewriteBot really completely free?',
              a: 'Yes. RewriteBot has zero monthly or annual subscription traps. You can run it entirely free with local models like Ollama, or bring your own API keys (from OpenAI, Anthropic, or Groq) where you only pay fractions of a penny directly for what you actually use.',
            },
            {
              q: 'How does the 3-color highlight engine work?',
              a: 'RewriteBot analyzes syntactic differences at the clause level. Yellow highlights indicate refined vocabulary, blue highlights denote preserved verbatim core clauses, and red highlights mark structural movements or clause inversions.',
            },
            {
              q: 'Can I lock specific terms from ever being paraphrased?',
              a: 'Yes. The Freeze Words feature allows you to specify exact terms, trademarks, medical formulas, or statutory citations that are guaranteed to remain untouched verbatim across all models.',
            },
            {
              q: 'What is the PDF Originality & AI Compliance audit report?',
              a: 'When you finalize a document, RewriteBot generates an official client-side compliance certificate complete with cryptographic audit IDs, citation breakdown, and the RewriteBot verification seal for academic defenses or publishing submission.',
            },
            {
              q: 'Is my text private and protected from model training?',
              a: 'Yes. When using API keys (Anthropic, OpenAI, Groq), official enterprise endpoints with zero-retention policies are invoked. When running local Ollama, your text never leaves your workstation at all.',
            },
            {
              q: 'Can I compare multiple modes at once?',
              a: 'Yes. RewriteBot supports concurrent multi-mode generation, allowing you to view Standard, Academic, Creative, and Fluency outputs side-by-side in real-time.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  borderBottom: '1px solid var(--rb-border)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--rb-text)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ paddingRight: '12px' }}>{item.q}</span>
                  <ChevronDown
                    size={17}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      color: isOpen ? '#BAD797' : 'var(--rb-text-muted)',
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      paddingBottom: '16px',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--rb-text-secondary)',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. REFINED EDITORIAL FINAL CTA (CONTAINED CARD) */}
      <section
        style={{
          position: 'relative',
          padding: '24px 16px clamp(40px, 6vw, 64px)',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            padding: 'clamp(36px, 6vw, 52px) clamp(18px, 4vw, 32px)',
            background: isDark
              ? 'linear-gradient(135deg, #3d0517 0%, #1a0109 100%)'
              : 'linear-gradient(135deg, #670626 0%, #460319 100%)',
            color: '#F7F3EB',
            border: '1px solid rgba(186, 215, 151, 0.25)',
            boxShadow: isDark
              ? '0 16px 40px rgba(0, 0, 0, 0.45)'
              : '0 16px 40px rgba(103, 6, 38, 0.18)',
            textAlign: 'center',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <h2
            className="editorial-headline"
            style={{
              fontSize: 'clamp(28px, 4.2vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.12,
              margin: '0 0 16px',
              color: '#F7F3EB',
              letterSpacing: '-0.02em',
            }}
          >
            Experience writing without compromise.
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'rgba(247, 243, 235, 0.88)',
              maxWidth: '520px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            No credit card. No word limits. Just the raw power of frontier AI with editorial polish.
          </p>

          <button
            onClick={() => navigate('/app')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 26px',
              borderRadius: '8px',
              border: 'none',
              background: '#BAD797',
              color: '#251F20',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Launch RewriteBot Free</span>
            <ArrowRight size={15} color="#251F20" />
          </button>
        </div>
      </section>

      {/* 11. REFINED EDITORIAL FOOTER */}
      <LandingFooter isDark={isDark} />
    </div>
  );
}
