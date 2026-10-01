import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  height?: number | string;
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  height = 36,
  clickable = true,
  className = '',
  style = {},
}) => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);

  const fullLogoSrc = isDark ? '/logo-dark.png' : '/logo-light.png';
  const iconLogoSrc = isDark ? '/logo-icon-dark.png' : '/logo-icon.png';

  const handleClick = (e: React.MouseEvent) => {
    if (clickable) {
      e.preventDefault();
      navigate('/');
    }
  };

  const cursorStyle = clickable ? { cursor: 'pointer' } : {};

  if (variant === 'icon') {
    return (
      <div
        className={`brand-logo-icon ${className}`}
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...cursorStyle,
          ...style,
        }}
        title="RewriteBot"
      >
        <img
          src={iconLogoSrc}
          alt="RewriteBot Emblem"
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            width: typeof height === 'number' ? `${height}px` : height,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`brand-logo-full ${className}`}
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          ...cursorStyle,
          ...style,
        }}
        title="RewriteBot - Say it better, instantly."
      >
        <img
          src={fullLogoSrc}
          alt="RewriteBot - Say it better, instantly."
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // 'compact' variant: Responsive full logo on desktop/tablet, clean icon mark on tight mobile screens
  return (
    <div
      className={`brand-logo-responsive ${className}`}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...cursorStyle,
        ...style,
      }}
      title="RewriteBot - Say it better, instantly."
    >
      {/* Desktop & Tablet: Full Brand Lockup */}
      <img
        src={fullLogoSrc}
        alt="RewriteBot"
        className="hide-on-mobile"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: 'auto',
          maxWidth: '220px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {/* Mobile: Space-Efficient Circular Arrow 'R' Icon */}
      <img
        src={iconLogoSrc}
        alt="RewriteBot"
        className="show-on-mobile"
        style={{
          height: typeof height === 'number' ? `${Math.min(Number(height) || 34, 34)}px` : height,
          width: typeof height === 'number' ? `${Math.min(Number(height) || 34, 34)}px` : height,
          objectFit: 'contain',
          display: 'none',
        }}
      />
    </div>
  );
};
