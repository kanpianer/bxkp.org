import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Module-level cache and prefetch promise for instant loading
let cachedSrcDoc = '';
let fetchPromise: Promise<string> | null = null;

const preloadSrcDoc = () => {
  if (cachedSrcDoc) return Promise.resolve(cachedSrcDoc);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('https://raw.githubusercontent.com/kanpianer/tz.bxkp.org/main/index.html')
    .then((res) => res.text())
    .then((html) => {
      const modifiedHtml = html.replace(
        '<head>',
        `<head><base href="https://tz.bxkp.org/"><style>
          html, body {
            background: transparent !important;
            background-color: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            overflow-x: hidden !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar, ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .container {
            margin-top: auto !important;
            margin-bottom: auto !important;
            padding-top: 3.5rem !important;
            padding-bottom: 2rem !important;
            transform: translateY(16px) !important;
          }
        </style>`
      );
      cachedSrcDoc = modifiedHtml;
      return modifiedHtml;
    })
    .catch((err) => {
      console.error('Failed to fetch tz.bxkp.org html:', err);
      return '';
    });

  return fetchPromise;
};

// Immediate background prefetch when module is loaded
preloadSrcDoc();

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const [srcDoc, setSrcDoc] = useState<string>(cachedSrcDoc);

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
    if (!srcDoc) {
      preloadSrcDoc().then((html) => {
        if (html) setSrcDoc(html);
      });
    }
  }, [srcDoc]);

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
      
      {/* Modal Window Container - Preloaded & Animated */}
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
        className={`fixed top-[8vh] left-1/2 z-[70] w-[92vw] max-w-[800px] h-[82vh] max-h-[720px] bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="关闭窗口"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 transition-all duration-300 flex items-center justify-center text-white/70 hover:text-white border border-white/10 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Iframe Container */}
        <div className="flex-1 w-full h-full relative bg-transparent overflow-hidden">
          <iframe 
            srcDoc={srcDoc || undefined}
            src={!srcDoc ? "https://tz.bxkp.org/" : undefined}
            title="不想看牌"
            className="absolute top-0 left-0 border-0"
            style={{ 
              width: '125%', 
              height: '125%', 
              transform: 'scale(0.8)', 
              transformOrigin: '0 0',
              background: 'transparent'
            }}
            allowTransparency={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </motion.div>
    </>
  );
};

export default SecretPanel;


