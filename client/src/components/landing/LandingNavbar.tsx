import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useAuthStore } from '../../stores/authStore';

interface LandingNavbarProps {
  isDark?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isDark = false }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'clip',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: isScrolled ? '10px 16px' : '14px 18px',
        background: isScrolled
          ? isDark
            ? 'rgba(23, 19, 20, 0.88)'
            : 'rgba(247, 243, 235, 0.88)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--rb-border)' : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(8px, 2vw, 16px)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Brand Logo & Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 32px)', minWidth: 0 }}>
          <BrandLogo variant="compact" height={34} to="/" />

          <nav
            className="editorial-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '22px',
              fontSize: '13.5px',
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
              Why RewriteBot
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
          </nav>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle showLabel={false} />

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/app')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--rb-primary)',
                color: '#F7F3EB',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Studio</span>
              <ArrowRight size={13} color="#BAD797" />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                className="hide-on-mobile"
                style={{
                  padding: '7px 10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--rb-text)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sign In
              </Link>

              <button
                onClick={() => navigate('/app')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(247, 243, 235, 0.15)',
                  background: '#670626',
                  color: '#F7F3EB',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(103, 6, 38, 0.35)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#52041e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#670626')}
              >
                <span>Launch<span className="hide-on-mobile"> Studio</span> Free</span>
                <ArrowRight size={13} color="#BAD797" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
