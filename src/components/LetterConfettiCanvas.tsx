import React, { useEffect, useRef } from 'react';

interface LetterConfettiParticle {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  fontSize: number;
  opacity: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PALETTE = ['#fbbf24', '#38bdf8', '#f97316', '#ffffff']; // Yellow, Blue, Orange, White

export const LetterConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Create 90 letter particles exploding upwards from lower screen
    const particles: LetterConfettiParticle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      // Angle shooting upwards with lateral spread
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 14 + Math.random() * 22;

      particles.push({
        char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        x: width * 0.5 + (Math.random() - 0.5) * 120,
        y: height * 0.65 + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.42,
        drag: 0.982,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        fontSize: 22 + Math.floor(Math.random() * 24),
        opacity: 1.0
      });
    }

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      particles.forEach(p => {
        if (p.opacity <= 0.01) return;
        aliveCount++;

        // Apply physics
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Fade out gradually after 1.2 seconds
        if (elapsed > 1.2) {
          p.opacity = Math.max(0, p.opacity - 0.018);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `900 ${p.fontSize}px 'JetBrains Mono', 'Fira Code', 'Consolas', monospace`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow effect
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      if (aliveCount > 0 && elapsed < 4.5) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[60]"
    />
  );
};
