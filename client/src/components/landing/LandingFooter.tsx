import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';
import { ThemeToggle } from '../ThemeToggle';

interface LandingFooterProps {
  isDark?: boolean;
}

export const LandingFooter: React.FC<LandingFooterProps> = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--rb-border)',
        background: 'var(--rb-surface)',
        padding: 'clamp(40px, 5vw, 64px) 16px 28px',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Top Row: Brand & Links */}
        <div className="editorial-footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <BrandLogo variant="compact" height={34} to="/" />
            <p
              className="font-serif"
              style={{
                fontSize: '18px',
                fontStyle: 'italic',
                color: 'var(--rb-text)',
                margin: '14px 0 6px',
              }}
            >
              "Say it better. Instantly."
            </p>
            <p style={{ fontSize: '13px', color: 'var(--rb-text-muted)', maxWidth: '340px', lineHeight: 1.6 }}>
              An editorial, provider-agnostic AI writing instrument engineered with true syntactic restructuring and certified originality audits.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
              Product
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <a href="#demo" style={{ color: 'var(--rb-text-secondary)', textDecoration: 'none' }}>Interactive Demo</a>
              <a href="#features" style={{ color: 'var(--rb-text-secondary)', textDecoration: 'none' }}>Features Bento</a>
              <a href="#compare" style={{ color: 'var(--rb-text-secondary)', textDecoration: 'none' }}>Why RewriteBot</a>
              <a href="#models" style={{ color: 'var(--rb-text-secondary)', textDecoration: 'none' }}>Supported Models</a>
              <Link to="/app" style={{ color: 'var(--rb-primary)', textDecoration: 'none', fontWeight: 600 }}>Launch Studio</Link>
            </div>
          </div>

          {/* Architecture Links */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
              Capabilities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--rb-text-secondary)' }}>
              <span>Clause Inversion</span>
              <span>Glossary Freeze</span>
              <span>Dual Originality</span>
              <span>PDF Compliance</span>
              <span>Local Ollama</span>
            </div>
          </div>

          {/* Company / Preferences */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
              Appearance
            </div>
            <div style={{ marginBottom: '14px' }}>
              <ThemeToggle showLabel />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--rb-text-muted)', lineHeight: 1.5 }}>
              Switch seamlessly between Editorial Cream and Dark Ink.
            </div>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--rb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12.5px',
            color: 'var(--rb-text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} RewriteBot. All rights reserved. Open-source, private & provider-agnostic.
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Preserved</span>
            <span>Zero Data Logging</span>
            <span>Self-Hostable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
