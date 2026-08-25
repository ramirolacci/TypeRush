import React, { useEffect, useRef } from 'react';

interface LetterRainCanvasProps {
  density?: number;
  speedMultiplier?: number;
}

interface LetterParticle {
  char: string;
  x: number;
  y: number;
  vy: number;
  fontSize: number;
  opacity: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÑñ';
const PALETTE = ['#fbbf24', '#38bdf8', '#f97316', '#ffffff'];

/**
 * Ambient background Canvas rendering a gentle shower/rain of falling letters.
 */
export const LetterRainCanvas: React.FC<LetterRainCanvasProps> = ({
  density = 45,
  speedMultiplier = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize letter particles evenly across screen
    const particles: LetterParticle[] = Array.from({ length: density }, () => ({
      char: CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      vy: (25 + Math.random() * 40) * speedMultiplier,
      fontSize: 14 + Math.floor(Math.random() * 10),
      opacity: 0.12 + Math.random() * 0.28,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rotation: (Math.random() - 0.5) * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.01
    }));

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Update vertical movement
        p.y += p.vy * delta;
        p.rotation += p.rotSpeed;

        // Wrap particle when exiting screen bottom
        if (p.y > height + 30) {
          p.y = -30;
          p.x = Math.random() * width;
          p.char = CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `bold ${p.fontSize}px 'JetBrains Mono', 'Fira Code', 'Consolas', monospace`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
