import React, { useEffect, useRef } from 'react';

interface NightCanvasProps {
  isDark: boolean;
}

const NightCanvas: React.FC<NightCanvasProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let time = 0;

    // Mountain ridgeline calculation (matches layer 0 mountain top in InkCanvas)
    const getMountainTopY = (x: number, baseH: number) => {
      const xOff = (x * 0.0035);
      const detail = 1;
      const y = Math.sin(xOff) * 1.0 +
                Math.sin(xOff * 2.2 * detail) * 0.5 + 
                Math.sin(xOff * 4.5) * 0.15;
      const baseLevel = baseH * 0.65;
      const amplitude = baseH * 0.23;
      return baseLevel - (y * amplitude);
    };

    // --- Stars / Fireflies (subtle) ---
    interface Star {
      x: number;
      y: number;
      size: number;
      pulseSpeed: number;
      baseOpacity: number;
      phase: number;
    }
    const stars: Star[] = [];
    const initStars = () => {
      stars.length = 0;
      const count = 12;
      for (let i = 0; i < count; i++) {
        const starX = Math.random() * width;
        // Keep star at least 35px strictly above the mountain ridge at this X coordinate
        const mountainLimitY = getMountainTopY(starX, height) - 35;
        const maxStarY = Math.max(height * 0.1, Math.min(mountainLimitY, height * 0.42));
        const starY = height * 0.03 + Math.random() * (maxStarY - height * 0.03);

        stars.push({
          x: starX,
          y: Math.max(10, starY),
          size: 0.8 + Math.random() * 1.4,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          baseOpacity: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initStars();
    };

    let transitionAlpha = isDark ? 1 : 0;

    const render = () => {
      const targetAlpha = isDarkRef.current ? 1 : 0;
      transitionAlpha += (targetAlpha - transitionAlpha) * 0.05;

      ctx.clearRect(0, 0, width, height);

      if (transitionAlpha > 0.005) {
        time++;

        // 1. Draw Moon (with soft multi-layer glowing halo)
        const moonX = width > 768 ? width * 0.82 : width * 0.78;
        const moonY = height * 0.16;
        const moonRadius = width > 768 ? 35 : 26;

        ctx.save();

        // Outer glow
        const glowRadius = moonRadius * 3.5;
        const glowGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, glowRadius);
        glowGrad.addColorStop(0, `rgba(255, 248, 220, ${0.35 * transitionAlpha})`);
        glowGrad.addColorStop(0.5, `rgba(220, 230, 255, ${0.12 * transitionAlpha})`);
        glowGrad.addColorStop(1, `rgba(200, 220, 255, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon Disc (Warm pearly white crescent/full moon with soft craters)
        const moonGrad = ctx.createRadialGradient(
          moonX - moonRadius * 0.3,
          moonY - moonRadius * 0.3,
          moonRadius * 0.1,
          moonX,
          moonY,
          moonRadius
        );
        moonGrad.addColorStop(0, `rgba(255, 253, 240, ${0.96 * transitionAlpha})`);
        moonGrad.addColorStop(0.8, `rgba(240, 236, 215, ${0.9 * transitionAlpha})`);
        moonGrad.addColorStop(1, `rgba(215, 210, 190, ${0.8 * transitionAlpha})`);

        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Soft moon texture / shadows
        ctx.fillStyle = `rgba(180, 175, 155, ${0.15 * transitionAlpha})`;
        ctx.beginPath();
        ctx.arc(moonX - moonRadius * 0.2, moonY + moonRadius * 0.25, moonRadius * 0.35, 0, Math.PI * 2);
        ctx.arc(moonX + moonRadius * 0.3, moonY - moonRadius * 0.1, moonRadius * 0.25, 0, Math.PI * 2);
        ctx.arc(moonX + moonRadius * 0.1, moonY + moonRadius * 0.3, moonRadius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 2. Stars twinkling (Guaranteed strictly in night sky above mountains)
        stars.forEach((star) => {
          const opacity =
            (star.baseOpacity + Math.sin(time * star.pulseSpeed + star.phase) * 0.25) *
            transitionAlpha;
          ctx.fillStyle = `rgba(245, 245, 255, ${Math.max(0, opacity)})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ imageRendering: 'auto' }}
    />
  );
};

export default NightCanvas;
