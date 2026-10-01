import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { ThemeToggle } from '../components/ThemeToggle';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/app');
    } catch (err: any) {
      setError(apiClient.handleError(err) || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--rb-background)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        position: 'relative',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Floating Theme Toggle in top-right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle showLabel />
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', marginBottom: '14px' }}>
          <BrandLogo variant="full" height={48} clickable={false} />
        </div>
        <p style={{ margin: 0, color: 'var(--rb-text-secondary)', fontSize: '14px' }}>
          Your professional, provider-agnostic AI paraphrasing workspace
        </p>
      </div>

      {/* Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--rb-surface)',
          borderRadius: '16px',
          border: '1px solid var(--rb-border)',
          boxShadow: 'var(--rb-shadow-md)',
          padding: '36px 32px',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(185, 28, 28, 0.1)',
              border: '1px solid var(--rb-danger)',
              color: 'var(--rb-danger)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--rb-text)',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--rb-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Mail size={17} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  fontSize: '14px',
                  color: 'var(--rb-text)',
                  background: 'var(--rb-surface-cream)',
                  border: '1px solid var(--rb-border)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--rb-primary)';
                  e.target.style.background = 'var(--rb-surface)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(103, 6, 38, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--rb-border)';
                  e.target.style.background = 'var(--rb-surface-cream)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--rb-text)',
                }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--rb-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={17} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  fontSize: '14px',
                  color: 'var(--rb-text)',
                  background: 'var(--rb-surface-cream)',
                  border: '1px solid var(--rb-border)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--rb-primary)';
                  e.target.style.background = 'var(--rb-surface)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(103, 6, 38, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--rb-border)';
                  e.target.style.background = 'var(--rb-surface-cream)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--rb-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? 'var(--rb-border)' : 'linear-gradient(135deg, #670626 0%, #4e041c 100%)',
              color: '#F7F3EB',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(103, 6, 38, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={16} color="#BAD797" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            margin: '24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--rb-border)' }} />
          <span style={{ fontSize: '11px', color: 'var(--rb-text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>NEW TO REWRITEBOT?</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--rb-border)' }} />
        </div>

        {/* Create Account Link */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: '1px solid var(--rb-border)',
              background: 'var(--rb-surface)',
              color: 'var(--rb-text)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rb-surface-cream)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rb-surface)')}
          >
            Create an Account
          </Link>
        </div>
      </div>

      {/* Trust & Security Badges */}
      <div
        style={{
          marginTop: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontSize: '12px',
          color: 'var(--rb-text-secondary)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="#670626" />
          <span>Encrypted with AES-256-GCM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={16} color="#670626" />
          <span>Bring Your Own AI Provider</span>
        </div>
      </div>
    </div>
  );
}
