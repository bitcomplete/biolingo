import { useEffect, useRef } from 'react';
import type { Animal } from '../types';

interface Props {
  animal: Animal;
}

export function TargetShape({ animal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(2, 2);

      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const color = animal === 'cat' ? '#ff6b9d' : '#ffa94d';
      ctx.strokeStyle = color + '55';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      if (animal === 'cat') {
        ctx.moveTo(w * 0.05, h * 0.8);
        ctx.bezierCurveTo(w * 0.15, h * 0.2, w * 0.25, h * 0.15, w * 0.4, h * 0.2);
        ctx.bezierCurveTo(w * 0.55, h * 0.25, w * 0.65, h * 0.25, w * 0.7, h * 0.3);
        ctx.bezierCurveTo(w * 0.8, h * 0.5, w * 0.9, h * 0.7, w * 0.95, h * 0.85);
      } else {
        ctx.moveTo(w * 0.1, h * 0.85);
        ctx.bezierCurveTo(w * 0.2, h * 0.8, w * 0.3, h * 0.15, w * 0.4, h * 0.1);
        ctx.bezierCurveTo(w * 0.5, h * 0.15, w * 0.55, h * 0.7, w * 0.6, h * 0.85);
        ctx.lineTo(w * 0.95, h * 0.85);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px "Space Mono", monospace';
      ctx.fillStyle = color + '88';
      if (animal === 'cat') {
        ctx.fillText('meee', w * 0.15, h * 0.55);
        ctx.fillText('→', w * 0.45, h * 0.55);
        ctx.fillText('owh', w * 0.7, h * 0.75);
      } else {
        ctx.fillText('WOOF!', w * 0.3, h * 0.55);
        ctx.fillText('quick', w * 0.55, h * 0.75);
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [animal]);

  return (
    <div className="target-card fade-up">
      <div className="target-label">Target Shape</div>
      <div className="target-canvas">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
