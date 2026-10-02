import React, { useEffect, useRef } from 'react';

interface AmbientWordsBackgroundProps {
  isDark?: boolean;
}

interface WordFragment {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  font: string;
  italic: boolean;
  baseOpacity: number;
  rotation: number;
  vRot: number;
  colorType: 'cherry' | 'matcha' | 'ink';
}

const WORDS = [
  'rewrite',
  'clarity',
  'meaning',
  'tone',
  'structure',
  'language',
  'precision',
  'voice',
  'context',
  'cadence',
  'syntax',
  'flow',
];

export const AmbientWordsBackground: React.FC<AmbientWordsBackgroundProps> = ({ isDark = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates (soft spring)
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const updateSize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateSize);
    updateSize();

    // 12 tightly controlled fragments to avoid any GPU bottleneck
    const count = Math.min(12, Math.max(8, Math.floor(width / 120)));
    const fragments: WordFragment[] = [];

    for (let i = 0; i < count; i++) {
      const isSerif = i % 2 === 0;
      fragments.push({
        text: WORDS[i % WORDS.length],
        x: (width / count) * i + Math.random() * 60,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14,
        size: Math.floor(22 + (i % 4) * 10),
        font: isSerif ? 'Newsreader, Georgia, serif' : 'Inter, system-ui, sans-serif',
        italic: isSerif,
        baseOpacity: isDark ? 0.12 : 0.16, // Higher opacity for clear readability
        rotation: (Math.random() - 0.5) * 0.15,
        vRot: (Math.random() - 0.5) * 0.0006,
        colorType: i % 3 === 0 ? 'cherry' : i % 3 === 1 ? 'matcha' : 'ink',
      });
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta to prevent jump
      lastTime = now;

      // Soft spring for mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Soft spring for scroll
      scrollY += (targetScrollY - scrollY) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // Render typography fragments
      const displacementRadius = 200;

      for (let i = 0; i < fragments.length; i++) {
        const frag = fragments[i];

        if (!prefersReducedMotion) {
          frag.x += frag.vx * (dt * 60);
          frag.y += frag.vy * (dt * 60);
          frag.rotation += frag.vRot * (dt * 60);

          if (frag.x < -140) frag.x = width + 100;
          if (frag.x > width + 140) frag.x = -100;
          if (frag.y < -140) frag.y = height + 100;
          if (frag.y > height + 140) frag.y = -100;
        }

        // Parallax translation
        const parallaxY = frag.y - ((scrollY * (0.06 + (i % 3) * 0.03)) % height);
        const wrappedY = parallaxY < -100 ? parallaxY + height + 200 : parallaxY;

        // Cursor displacement
        let dispX = 0;
        let dispY = 0;
        if (mouse.active) {
          const dx = frag.x - mouse.x;
          const dy = wrappedY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < displacementRadius && dist > 0) {
            const force = (1 - dist / displacementRadius) * 24;
            dispX = (dx / dist) * force;
            dispY = (dy / dist) * force;
          }
        }

        const renderX = frag.x + dispX;
        const renderY = wrappedY + dispY;

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(frag.rotation);

        ctx.font = `${frag.italic ? 'italic ' : ''}600 ${frag.size}px ${frag.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // High clarity in light mode and balanced visibility in dark mode
        let fillStyle = '';
        if (frag.colorType === 'cherry') {
          fillStyle = isDark
            ? 'rgba(244, 143, 177, 0.16)'
            : 'rgba(103, 6, 38, 0.22)';
        } else if (frag.colorType === 'matcha') {
          fillStyle = isDark
            ? 'rgba(186, 215, 151, 0.18)'
            : 'rgba(94, 133, 56, 0.24)';
        } else {
          fillStyle = isDark
            ? 'rgba(247, 243, 235, 0.14)'
            : 'rgba(37, 31, 32, 0.20)';
        }

        ctx.fillStyle = fillStyle;
        ctx.fillText(frag.text, 0, 0);

        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (!prefersReducedMotion) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark]);

  return (
    <>
      {/* CSS-accelerated ambient glow pools (0 CPU canvas overhead) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            maxWidth: '800px',
            maxHeight: '800px',
            background: isDark
              ? 'radial-gradient(circle, rgba(103, 6, 38, 0.08) 0%, transparent 65%)'
              : 'radial-gradient(circle, rgba(103, 6, 38, 0.04) 0%, transparent 65%)',
            filter: 'blur(60px)',
            transform: 'translateZ(0)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            maxWidth: '700px',
            maxHeight: '700px',
            background: isDark
              ? 'radial-gradient(circle, rgba(186, 215, 151, 0.07) 0%, transparent 65%)'
              : 'radial-gradient(circle, rgba(186, 215, 151, 0.06) 0%, transparent 65%)',
            filter: 'blur(60px)',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      {/* Typography canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
    </>
  );
};
