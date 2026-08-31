import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 目标宽幅视口基准宽度 (px) - 设为 1024px 让内容在弹窗内以更大比例和字号呈现
const TARGET_VIEWPORT_WIDTH = 1024;

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [virtualHeight, setVirtualHeight] = useState(720);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        const calculatedScale = clientWidth / TARGET_VIEWPORT_WIDTH;
        setScale(calculatedScale);
        setVirtualHeight(clientHeight / calculatedScale);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]" 
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Modal Window Container - Preloaded */}
      <motion.div 
        initial={{ y: '-100vh', x: '-50%', opacity: 0 }}
        animate={{ 
          y: isOpen ? 0 : '-100vh',
          opacity: isOpen ? 1 : 0,
          x: '-50%'
        }}
        transition={{ 
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        onDoubleClick={(e) => e.preventDefault()}
        className={`fixed top-[8vh] left-1/2 z-[70] w-[92vw] max-w-[800px] h-[82vh] max-h-[720px] bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden select-none touch-manipulation overscroll-contain ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="关闭窗口"
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white active:scale-90 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Iframe Container */}
        <div 
          ref={containerRef}
          className="flex-1 w-full h-full relative bg-transparent overflow-hidden" 
          style={{ touchAction: 'manipulation' }}
        >
          <iframe 
            src="https://jk.bxkp.org/"
            title="家宽导航"
            className="border-0 bg-transparent absolute top-0 left-0 origin-top-left"
            allowTransparency={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ 
              width: `${TARGET_VIEWPORT_WIDTH}px`,
              height: `${virtualHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              touchAction: 'manipulation' 
            }}
          />
        </div>
      </motion.div>
    </>
  );
};

export default SecretPanel;



