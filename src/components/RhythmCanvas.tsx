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
      // Resize canvas to match display size
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Strike Line parameters
      const strikeY = height * 0.82;
      const numLanes = 5;
      const laneWidth = width / (numLanes + 1);

      // 1. Draw Lane Lines & Grid
      ctx.lineWidth = 1;
      for (let i = 1; i <= numLanes; i++) {
        const x = i * laneWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines for synthwave feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Horizontal Strike Line & Target Rings
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff8800';
      ctx.strokeStyle = 'rgba(255, 136, 0, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, strikeY);
      ctx.lineTo(width, strikeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw lane strike target rings
      for (let i = 1; i <= numLanes; i++) {
        const x = i * laneWidth;
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, strikeY, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Inner subtle fill
        ctx.fillStyle = 'rgba(255, 136, 0, 0.05)';
        ctx.fill();
      }

      // Calculate node screen positions
      const activeNotes = notes.filter(n => !n.hit && !n.missed);
      activeNotes.forEach(note => {
        const laneX = (note.laneIndex + 1) * laneWidth;
        note.x = laneX;
        note.y = note.progress * strikeY;
      });

      // 3. Draw Connecting Path Line between consecutive nodes (as seen in Guitar Hero / osu!)
      if (activeNotes.length > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(activeNotes[0].x, activeNotes[0].y);
        for (let i = 1; i < activeNotes.length; i++) {
          ctx.lineTo(activeNotes[i].x, activeNotes[i].y);
        }
        ctx.stroke();
      }

      // 4. Draw Falling Letter Nodes
      activeNotes.forEach((note, idx) => {
        const isNextTarget = idx === 0;
        const radius = isNextTarget ? 24 : 20;

        // Glow effects
        ctx.shadowBlur = isNextTarget ? 20 : 10;
        ctx.shadowColor = isNextTarget ? '#ff9900' : '#4a90e2';

        // Outer Node Circle
        ctx.beginPath();
        ctx.arc(note.x, note.y, radius, 0, Math.PI * 2);

        // Gradient or Color Fill
        if (isNextTarget) {
          ctx.fillStyle = 'rgba(255, 115, 0, 0.9)';
          ctx.strokeStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(20, 30, 48, 0.85)';
          ctx.strokeStyle = 'rgba(74, 144, 226, 0.8)';
        }

        ctx.lineWidth = isNextTarget ? 3 : 2;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulsing indicator ring for immediate active letter target
        if (isNextTarget) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(note.x, note.y, radius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Letter Label Inside Circle
        ctx.font = `bold ${isNextTarget ? 18 : 15}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isNextTarget ? '#ffffff' : '#d0e0ff';
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
          const yOffset = age * 40;

          ctx.font = '900 20px "Outfit", sans-serif';
          ctx.fillStyle = j.color;
          ctx.globalAlpha = alpha;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
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
