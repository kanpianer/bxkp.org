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

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let time = 0;

    // --- Configuration ---
    const LAYERS = 4;
    
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
        this.y = height * (0.1 + Math.random() * 0.5); // Upper half mostly
        this.w = width * (0.3 + Math.random() * 0.4);
        this.h = height * 0.15;
        this.speed = Math.random() * 0.2 + 0.1; // Slow drift
        this.opacity = Math.random() * 0.2 + 0.1;
      }

      update() {
        this.x += this.speed; // Drift right
        if (this.x - this.w > width) {
          this.x = -this.w;
          this.y = height * (0.1 + Math.random() * 0.5);
        }
      }

      draw(ctx: CanvasRenderingContext2D, isNight: boolean) {
        // Create a soft cloud shape using radial gradient
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        const rx = this.w / 2;
        
        // Use standard gradient for ellipse approximation
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        
        // Cloud Color: White in day, Dark/Faint in night
        const r = isNight ? 30 : 255;
        const g = isNight ? 30 : 255;
        const b = isNight ? 40 : 255;
        
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = grad;
        
        // Draw ellipse-ish rect
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
        this.y = Math.random() * height * 0.3; // Top 30% of screen
        this.speed = (0.2 + Math.random() * 0.3) * 0.5; // Very slow
        
        // Generate random puffs to form a cloud shape
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

        // Style: Soft white/light gray
        const opacity = isNight ? 0.05 : 0.4;
        const r = isNight ? 150 : 255;
        const g = isNight ? 150 : 255;
        const b = isNight ? 160 : 255;

        // Use radial gradients for each puff to make them soft
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
        this.x = randomX ? Math.random() * width : -300;
        this.y = height * (0.1 + Math.random() * 0.25); // Sky area
        this.speed = 0.3 + Math.random() * 0.2; // Moderate flying speed
        this.geese = [];
        
        // V formation logic
        // Leader at 0,0
        this.geese.push(new Goose(0, 0));
        
        const count = 3 + Math.floor(Math.random() * 4); // Pairs of followers
        const spacingX = 25;
        const spacingY = 12;

        for (let i = 1; i <= count; i++) {
           // Flying right, V opens to the left
           // Followers: x negative relative to leader
           const noiseX = (Math.random() - 0.5) * 5;
           const noiseY = (Math.random() - 0.5) * 5;
           
           // Left wing (Upper in 2D projection usually, or just symmetrical)
           this.geese.push(new Goose(-i * spacingX + noiseX, -i * spacingY + noiseY));
           // Right wing
           this.geese.push(new Goose(-i * spacingX + noiseX, i * spacingY + noiseY));
        }
      }

      update() {
        this.x += this.speed;
        if (this.x > width + 300) {
          this.init(false);
          this.x = -300 - Math.random() * 400; // Random delay before next pass
        }
      }

      draw(ctx: CanvasRenderingContext2D, time: number, isNight: boolean) {
         ctx.save();
         ctx.translate(this.x, this.y);
         const scale = 0.5; // Small distant birds
         ctx.scale(scale, scale);
         
         // Ink color
         const color = isNight ? 'rgba(60,60,70,0.4)' : 'rgba(40,40,45,0.7)';
         ctx.strokeStyle = color;
         ctx.lineWidth = 1.5;
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';

         this.geese.forEach(g => {
            const flap = Math.sin(time * 0.15 + g.flapOffset) * 3;
            
            ctx.beginPath();
            // Draw "m" shape for bird
            const x = g.relX;
            const y = g.relY;
            
            ctx.moveTo(x - 8, y - flap);
            ctx.quadraticCurveTo(x - 4, y + 2, x, y + 4); // Left wing
            ctx.quadraticCurveTo(x + 4, y + 2, x + 8, y - flap); // Right wing
            
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
        this.offset = Math.random() * 1000;
        // Far mountains (lower index) move slower
        // Index 0 = Back, Index 3 = Front
        this.speed = 0.05 + ((index) * 0.05);
      }

      // Generate Perlin-ish noise for mountain shape
      getHeight(x: number) {
        const t = time * 0.005; // Time factor
        // Parallax scrolling x
        const xOff = (x * 0.002) + this.offset + (t * this.speed);
        
        // Different frequencies for jaggedness vs rolling hills
        // Front layers (higher index) are more jagged/detailed
        const detail = 1 + (this.index * 0.5);
        
        const y = 
          Math.sin(xOff) * 1.0 +
          Math.sin(xOff * 2.3 * detail) * 0.5 +
          Math.sin(xOff * 4.7 * detail) * 0.25;
        
        // Base height depends on layer index 
        // Index 0 (Back) = High up on screen (smaller)
        // Index 3 (Front) = Lower on screen (bigger)
        
        const baseLevel = height * (0.55 + (this.index * 0.12)); 
        const amplitude = height * (0.1 + (this.index * 0.05));
        
        return baseLevel - Math.abs(y * amplitude);
      }

      draw(ctx: CanvasRenderingContext2D, darkness: number) {
        // Calculate Ink Color (Shanshui Style - Atmospheric Perspective)
        // Far = Light/Mist, Near = Dark/Ink
        
        const depth = this.index / (LAYERS - 1); // 0.0 (Back) to 1.0 (Front)
        
        // Day Colors
        // Back: Light Gray (180), Front: Dark Ink (40)
        const dayVal = 160 - (depth * 130); 
        const dayAlpha = 0.5 + (depth * 0.5); // Back is more transparent
        
        // Night Colors
        const nightVal = 10 + (depth * 10);
        const nightAlpha = 0.8;

        const val = dayVal + (nightVal - dayVal) * darkness;
        const r = val;
        const g = val + 2; // Slight warmth/coolness could be added
        const b = val + 5; 
        
        // Ink Wash Gradient Effect (Top solid-ish, bottom fades to mist)
        // Actually, Shanshui mountains often fade at the *bottom* into mist.
        const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
        
        // Top of mountain (Peak) -> Solid Ink
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${dayAlpha})`); 
        // Bottom (Mist) -> Transparent
        gradient.addColorStop(1, `rgba(${r+20}, ${g+20}, ${b+20}, 0)`);

        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        
        // Start bottom left
        ctx.moveTo(0, height);
        
        // Trace mountain tops
        const step = 10; // Resolution
        for (let x = 0; x <= width + step; x += step) {
           const y = this.getHeight(x);
           ctx.lineTo(x, y);
        }
        
        // End bottom right
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- State ---
    const layers: InkMountain[] = [];
    const mists: Mist[] = [];
    const clouds: Cloud[] = [];
    const flocks: Flock[] = [];

    const init = () => {
       layers.length = 0;
       // Create layers Back to Front
       for(let i=0; i<LAYERS; i++) {
         layers.push(new InkMountain(i));
       }
       
       mists.length = 0;
       for(let i=0; i<6; i++) {
         mists.push(new Mist());
       }

       clouds.length = 0;
       for(let i=0; i<5; i++) {
         clouds.push(new Cloud());
       }
       
       flocks.length = 0;
       // Add one or two flocks
       flocks.push(new Flock());
       setTimeout(() => {
          if (flocks.length < 2) flocks.push(new Flock());
       }, 5000); // Stagger the second flock
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      init();
    };

    let currentDarkness = 0;

    const animate = () => {
      const targetDarkness = darkModeRef.current ? 1 : 0;
      currentDarkness += (targetDarkness - currentDarkness) * 0.05;

      ctx.clearRect(0, 0, width, height);
      time++;

      // Draw Background Sky Clouds (Behind everything)
      clouds.forEach(c => {
        c.update();
        c.draw(ctx, currentDarkness > 0.5);
      });

      // Draw Mist (Behind Mountains or Interleaved?)
      // Let's draw some mist behind
      mists.forEach((m, i) => {
          if (i % 2 === 0) {
             m.update();
             m.draw(ctx, currentDarkness > 0.5);
          }
      });

      // Draw Mountains (Back to Front)
      layers.forEach((l, i) => {
          l.draw(ctx, currentDarkness);
          
          // Draw mist interleaved between mountain layers for depth
          if (i === 1) { // After 2nd mountain layer
             mists.forEach((m, mi) => {
                 if (mi % 2 !== 0) {
                    m.update();
                    m.draw(ctx, currentDarkness > 0.5);
                 }
             });
          }
      });
      
      // Draw Flocks (In front of mountains/mist to be visible, but styled as distant)
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
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000 ${darkMode ? 'opacity-90 mix-blend-multiply' : 'opacity-80 mix-blend-multiply'}`}
    />
  );
};

export default InkCanvas;