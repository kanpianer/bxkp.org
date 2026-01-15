import React, { useEffect, useRef } from 'react';

interface InkCanvasProps {
  darkMode?: boolean;
}

const InkCanvas: React.FC<InkCanvasProps> = ({ darkMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkModeRef = useRef(darkMode);
  
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let time = 0;

    // --- Configuration ---
    const LAYERS = 3; 
    
    // --- Classes ---
    
    class Mist {
      x: number;
      y: number;
      w: number;
      h: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = height * (0.2 + Math.random() * 0.6); 
        this.w = width * (0.4 + Math.random() * 0.4);
        this.h = height * 0.2;
        this.speed = Math.random() * 0.1 + 0.05; 
        this.opacity = Math.random() * 0.15 + 0.05;
      }

      update() {
        this.x += this.speed; 
        if (this.x - this.w > width) {
          this.x = -this.w;
          this.y = height * (0.2 + Math.random() * 0.6);
        }
      }

      draw(ctx: CanvasRenderingContext2D, isNight: boolean) {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const rx = this.w / 2;
        
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        
        const r = isNight ? 30 : 255;
        const g = isNight ? 30 : 255;
        const b = isNight ? 40 : 255;
        
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = grad;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, this.h / this.w);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Cloud {
      x: number;
      y: number;
      speed: number;
      scale: number;
      puffs: { x: number, y: number, r: number }[];

      constructor() {
        this.init(true);
      }

      init(randomX = false) {
        this.scale = 0.5 + Math.random() * 0.8;
        this.x = randomX ? Math.random() * width : -300 * this.scale;
        this.y = Math.random() * height * 0.25; 
        this.speed = (0.1 + Math.random() * 0.1); 
        
        this.puffs = [];
        const puffCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < puffCount; i++) {
          this.puffs.push({
            x: Math.random() * 100 - 50,
            y: Math.random() * 40 - 20,
            r: 30 + Math.random() * 20
          });
        }
      }

      update() {
        this.x += this.speed;
        if (this.x > width + 200 * this.scale) {
          this.init(false);
        }
      }

      draw(ctx: CanvasRenderingContext2D, isNight: boolean) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        const opacity = isNight ? 0.05 : 0.6; 
        const r = isNight ? 150 : 255;
        const g = isNight ? 150 : 255;
        const b = isNight ? 160 : 255;

        this.puffs.forEach(puff => {
          const grad = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.r);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }
    }

    class Goose {
      relX: number;
      relY: number;
      flapOffset: number;
      
      constructor(relX: number, relY: number) {
        this.relX = relX;
        this.relY = relY;
        this.flapOffset = Math.random() * Math.PI * 2;
      }
    }

    class Flock {
      x: number;
      y: number;
      speed: number;
      geese: Goose[];

      constructor() {
        this.init(true);
      }

      init(randomX = false) {
        this.x = randomX ? Math.random() * width : -200;
        this.y = height * (0.15 + Math.random() * 0.2);
        this.speed = 0.5; 
        this.geese = [];
        
        this.geese.push(new Goose(0, 0));
        
        const count = 2 + Math.floor(Math.random() * 3);
        const spacingX = 20;
        const spacingY = 10;

        for (let i = 1; i <= count; i++) {
           const noiseX = (Math.random() - 0.5) * 2;
           const noiseY = (Math.random() - 0.5) * 2;
           this.geese.push(new Goose(-i * spacingX + noiseX, -i * spacingY + noiseY));
           this.geese.push(new Goose(-i * spacingX + noiseX, i * spacingY + noiseY));
        }
      }

      update() {
        this.x += this.speed;
        if (this.x > width + 200) {
          this.init(false);
          this.x = -200 - Math.random() * 1000;
        }
      }

      draw(ctx: CanvasRenderingContext2D, time: number, isNight: boolean) {
         ctx.save();
         ctx.translate(this.x, this.y);
         const scale = 0.4;
         ctx.scale(scale, scale);
         
         const color = isNight ? 'rgba(80,80,90,0.5)' : 'rgba(30,30,35,0.8)';
         ctx.strokeStyle = color;
         ctx.lineWidth = 2;
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';

         this.geese.forEach(g => {
            const flap = Math.sin(time * 0.1 + g.flapOffset) * 4;
            const x = g.relX;
            const y = g.relY;
            
            ctx.beginPath();
            ctx.moveTo(x - 8, y - flap);
            ctx.quadraticCurveTo(x - 4, y + 2, x, y + 4);
            ctx.quadraticCurveTo(x + 4, y + 2, x + 8, y - flap);
            ctx.stroke();
         });

         ctx.restore();
      }
    }

    class InkMountain {
      index: number;
      offset: number;
      speed: number;
      
      constructor(index: number) {
        this.index = index;
        this.offset = Math.random() * 10000;
        this.speed = 0.2 + (index * 0.1); 
      }

      getHeight(x: number) {
        const xOff = (x * 0.0035) + this.offset + (time * 0.0005 * this.speed);
        const detail = 1 + (this.index * 0.2);
        
        let y = Math.sin(xOff) * 1.0 +
                Math.sin(xOff * 2.2 * detail) * 0.5 + 
                Math.sin(xOff * 4.5) * 0.15;
        
        if (this.index === LAYERS - 1) {
            y += Math.sin(xOff * 12) * 0.08;
        }
        
        const baseLevel = height * (0.65 + (this.index * 0.1)); 
        const amplitude = height * (0.23 + (this.index * 0.08));
        
        return baseLevel - (y * amplitude); 
      }

      draw(ctx: CanvasRenderingContext2D, darkness: number) {
        const depth = this.index / (LAYERS - 1); 
        
        const dayVal = 180 - (depth * 140); 
        const dayAlpha = 0.3 + (depth * 0.6); 
        
        const nightVal = 20 + (depth * 10);
        const nightAlpha = 0.9;

        const val = dayVal + (nightVal - dayVal) * darkness;
        const alpha = dayAlpha + (nightAlpha - dayAlpha) * darkness;
        const r = val;
        const g = val + 2; 
        const b = val + 5; 
        
        // Fill for the mountain body
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // --- CRITICAL CHANGE FOR SMOOTHNESS ---
        // Reduced step size from 15 to 2 for ultra-fine, delicate curves without aliasing
        const step = 2; 
        for (let x = 0; x <= width + step; x += step) {
           const y = this.getHeight(x);
           ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // --- FINE BRUSH OUTLINE ---
        // Adds a very thin, delicate line to the top of the mountains to mimic fine ink strokes
        ctx.beginPath();
        const startY = this.getHeight(0);
        ctx.moveTo(0, startY);
        for (let x = 0; x <= width + step; x += step) {
           const y = this.getHeight(x);
           ctx.lineTo(x, y);
        }
        
        ctx.lineWidth = 0.5 + (depth * 0.5); // Nearer mountains have slightly bolder lines
        ctx.strokeStyle = `rgba(${r - 20}, ${g - 20}, ${b - 20}, ${alpha * 0.8})`;
        ctx.stroke();
      }
    }

    // --- State ---
    const layers: InkMountain[] = [];
    const mists: Mist[] = [];
    const clouds: Cloud[] = [];
    const flocks: Flock[] = [];

    const init = () => {
       layers.length = 0;
       for(let i=0; i<LAYERS; i++) {
         layers.push(new InkMountain(i));
       }
       
       mists.length = 0;
       for(let i=0; i<5; i++) {
         mists.push(new Mist());
       }

       clouds.length = 0;
       for(let i=0; i<4; i++) {
         clouds.push(new Cloud());
       }
       
       flocks.length = 0;
       flocks.push(new Flock());
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      // Ensure smooth drawing context settings
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      init();
    };

    let currentDarkness = 0;

    const animate = () => {
      const targetDarkness = darkModeRef.current ? 1 : 0;
      currentDarkness += (targetDarkness - currentDarkness) * 0.05;

      ctx.clearRect(0, 0, width, height);
      time++;

      clouds.forEach(c => {
        c.update();
        c.draw(ctx, currentDarkness > 0.5);
      });

      mists.forEach((m, i) => {
          if (i % 2 === 0) {
             m.update();
             m.draw(ctx, currentDarkness > 0.5);
          }
      });

      layers.forEach((l, i) => {
          l.draw(ctx, currentDarkness);
          
          if (i === 0) { 
             mists.forEach((m, mi) => {
                 if (mi % 2 !== 0) {
                    m.update();
                    m.draw(ctx, currentDarkness > 0.5);
                 }
             });
          }
      });
      
      flocks.forEach(f => {
          f.update();
          f.draw(ctx, time, currentDarkness > 0.5);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: 'auto' }}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000 ${darkMode ? 'opacity-50 mix-blend-multiply' : 'opacity-100 mix-blend-multiply'}`}
    />
  );
};

export default InkCanvas;