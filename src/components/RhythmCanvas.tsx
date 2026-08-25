import React, { useEffect, useRef } from 'react';
import type { NoteNode, HitJudgment, Particle } from '../types/game';

interface RhythmCanvasProps {
  notes: NoteNode[];
  judgments: HitJudgment[];
  particles: Particle[];
  combo: number;
  hasMobileKeyboard?: boolean;
}

export const RhythmCanvas: React.FC<RhythmCanvasProps> = ({
  notes,
  judgments,
  particles,
  combo,
  hasMobileKeyboard = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Strike Line parameters - set at 50% height if mobile keyboard is visible, else 72%
      const strikeY = height * (hasMobileKeyboard ? 0.50 : 0.72);
      const numLanes = 4;
      const laneWidth = width / (numLanes + 1);

      // 4 Lane Themes for Falling Letter Circles (Soft, matte non-neon colors)
      const LANE_THEMES = [
        {
          // Lane 0: Soft Warm Gold / Amber
          stroke: '#D9911E',
          glow: 'rgba(217, 145, 30, 0.35)',
          fill: 'rgba(217, 145, 30, 0.88)',
          text: '#FFFFFF'
        },
        {
          // Lane 1: Soft Slate Blue
          stroke: '#4173B9',
          glow: 'rgba(65, 115, 185, 0.35)',
          fill: 'rgba(65, 115, 185, 0.88)',
          text: '#FFFFFF'
        },
        {
          // Lane 2: Soft Terracotta / Orange
          stroke: '#D2692D',
          glow: 'rgba(210, 105, 45, 0.35)',
          fill: 'rgba(210, 105, 45, 0.88)',
          text: '#FFFFFF'
        },
        {
          // Lane 3: Soft Silver / White
          stroke: '#D5DCE8',
          glow: 'rgba(215, 220, 228, 0.35)',
          fill: 'rgba(215, 220, 228, 0.88)',
          text: '#1E293B'
        }
      ];

      // 1. Draw Lane Lines & Grid
      ctx.lineWidth = 1;
      for (let i = 1; i <= numLanes; i++) {
        const x = i * laneWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Background horizontal grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Horizontal Strike Line & Target Rings (All Coffee Color)
      const ringRadius = 30;
      const coffeeStrokeColor = '#A88267';
      const coffeeGlowColor = 'rgba(168, 130, 103, 0.5)';

      ctx.shadowBlur = 8;
      ctx.shadowColor = coffeeGlowColor;
      ctx.strokeStyle = coffeeStrokeColor;
      ctx.lineWidth = 4;

      // Draw horizontal strike line in SEGMENTS so it never passes inside the circles
      ctx.beginPath();
      let currentX = 0;
      for (let i = 1; i <= numLanes; i++) {
        const laneCenterX = i * laneWidth;
        const lineEndX = laneCenterX - ringRadius;
        ctx.moveTo(currentX, strikeY);
        ctx.lineTo(lineEndX, strikeY);
        currentX = laneCenterX + ringRadius;
      }
      // Final segment from last circle to right edge of screen
      ctx.moveTo(currentX, strikeY);
      ctx.lineTo(width, strikeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw 4 lane target circles: ALL in Coffee Color matching the line
      for (let i = 1; i <= numLanes; i++) {
        const x = i * laneWidth;

        // Path for circle
        ctx.beginPath();
        ctx.arc(x, strikeY, ringRadius, 0, Math.PI * 2);

        // Solid background fill to mask any line behind the circle
        ctx.fillStyle = '#090d16';
        ctx.fill();

        // Subtle coffee interior fill
        ctx.fillStyle = 'rgba(168, 130, 103, 0.10)';
        ctx.fill();

        // Coffee ring border
        ctx.shadowBlur = 8;
        ctx.shadowColor = coffeeGlowColor;
        ctx.strokeStyle = 'rgba(168, 130, 103, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Calculate node screen positions
      const activeNotes = notes.filter(n => !n.hit);
      activeNotes.forEach(note => {
        const laneX = (note.laneIndex + 1) * laneWidth;
        note.x = laneX;
        note.y = note.progress * strikeY;
      });

      // 3. Draw Connecting Path Line between consecutive nodes
      if (activeNotes.length > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(activeNotes[0].x, activeNotes[0].y);
        for (let i = 1; i < activeNotes.length; i++) {
          ctx.lineTo(activeNotes[i].x, activeNotes[i].y);
        }
        ctx.stroke();
      }

      // 4. Draw Falling Letter Nodes (Soft matte colors by lane: 0: Yellow, 1: Blue, 2: Orange, 3: White)
      activeNotes.forEach((note, idx) => {
        const isNextTarget = idx === 0;
        const radius = isNextTarget ? 34 : 28;
        const laneTheme = LANE_THEMES[note.laneIndex % 4] || LANE_THEMES[0];

        // Soft glow matching lane theme (not neon)
        ctx.shadowBlur = isNextTarget ? 14 : 6;
        ctx.shadowColor = isNextTarget ? 'rgba(230, 160, 40, 0.5)' : laneTheme.glow;

        // Outer Node Circle
        ctx.beginPath();
        ctx.arc(note.x, note.y, radius, 0, Math.PI * 2);

        if (note.missed) {
          ctx.fillStyle = 'rgba(200, 45, 45, 0.85)';
          ctx.strokeStyle = '#f87171';
        } else if (isNextTarget) {
          ctx.fillStyle = laneTheme.fill;
          ctx.strokeStyle = '#ffffff';
        } else {
          ctx.fillStyle = laneTheme.fill;
          ctx.strokeStyle = laneTheme.stroke;
        }

        ctx.lineWidth = isNextTarget ? 3.5 : 2;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulsing indicator ring for active target
        if (isNextTarget && !note.missed) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(note.x, note.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Letter Label inside circle
        ctx.font = `900 ${isNextTarget ? 26 : 22}px "JetBrains Mono", monospace`;
        ctx.fillStyle = note.missed ? '#ffffff' : laneTheme.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.char.toUpperCase(), note.x, note.y + 1);
      });

      // 5. Draw Spark Particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 6. Draw Judgment Feedback Texts (PERFECT, GREAT, MISS)
      const now = Date.now();
      judgments.forEach(j => {
        const age = (now - j.timestamp) / 1000;
        if (age < 0.8) {
          const alpha = 1 - age / 0.8;
          const yOffset = age * 50;

          ctx.font = '900 24px "Outfit", sans-serif';
          ctx.fillStyle = j.color;
          ctx.globalAlpha = alpha;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 12;
          ctx.shadowColor = j.color;
          ctx.fillText(j.text, j.x, j.y - yOffset);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      });
    };

    render();
    animationFrameId = requestAnimationFrame(function loop() {
      render();
      animationFrameId = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes, judgments, particles, combo, hasMobileKeyboard]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-zinc-950 to-neutral-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
