import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  style = {},
  showLabel = false,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 31, 32, 0.05)',
        border: '1px solid',
        borderColor: isDark ? 'var(--rb-border)' : 'var(--rb-border-light)',
        color: isDark ? '#BAD797' : '#670626',
        borderRadius: '8px',
        padding: showLabel ? '6px 12px' : '7px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.background = isDark ? 'rgba(186, 215, 151, 0.15)' : 'rgba(103, 6, 38, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 31, 32, 0.05)';
      }}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={2.2} style={{ color: '#BAD797' }} />
      ) : (
        <Moon size={17} strokeWidth={2.2} style={{ color: '#670626' }} />
      )}
      {showLabel && (
        <span style={{ color: 'var(--rb-text)' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
