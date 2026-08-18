import React, { useEffect, useRef } from 'react';
import type { NoteNode, HitJudgment, Particle } from '../types/game';

interface RhythmCanvasProps {
  notes: NoteNode[];
  judgments: HitJudgment[];
  particles: Particle[];
  combo: number;
}

export const RhythmCanvas: React.FC<RhythmCanvasProps> = ({
  notes,
  judgments,
  particles,
  combo
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

      // Strike Line parameters - set at 72% height to leave bottom room for WordStack
      const strikeY = height * 0.72;
      const numLanes = 5;
      const laneWidth = width / (numLanes + 1);

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

      // 2. Draw Horizontal Strike Line & Target Rings (Larger size)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff8800';
      ctx.strokeStyle = 'rgba(255, 136, 0, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, strikeY);
      ctx.lineTo(width, strikeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw larger lane strike target rings
      for (let i = 1; i <= numLanes; i++) {
        const x = i * laneWidth;
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, strikeY, 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 136, 0, 0.08)';
        ctx.fill();
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

      // 4. Draw Falling Letter Nodes (Much Larger circles & text)
      activeNotes.forEach((note, idx) => {
        const isNextTarget = idx === 0;
        const radius = isNextTarget ? 34 : 28;

        // Glow effects
        ctx.shadowBlur = isNextTarget ? 25 : 12;
        ctx.shadowColor = isNextTarget ? '#ff9900' : '#3b82f6';

        // Outer Node Circle
        ctx.beginPath();
        ctx.arc(note.x, note.y, radius, 0, Math.PI * 2);

        if (note.missed) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
          ctx.strokeStyle = '#fca5a5';
        } else if (isNextTarget) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
          ctx.strokeStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.85)';
        }

        ctx.lineWidth = isNextTarget ? 4 : 2.5;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulsing indicator ring for immediate active letter target
        if (isNextTarget && !note.missed) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(note.x, note.y, radius + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Significantly Larger Letter Label Inside Circle
        ctx.font = `900 ${isNextTarget ? 26 : 22}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isNextTarget || note.missed ? '#ffffff' : '#e0f2fe';
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
  }, [notes, judgments, particles, combo]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-zinc-950 to-neutral-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
