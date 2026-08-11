import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const [srcDoc, setSrcDoc] = useState<string>('');

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
    let isMounted = true;
    fetch('https://raw.githubusercontent.com/kanpianer/tz.bxkp.org/main/index.html')
      .then((res) => res.text())
      .then((html) => {
        if (!isMounted) return;
        // Inject base URL tag and CSS transparent override into <head>
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
        setSrcDoc(modifiedHtml);
      })
      .catch((err) => {
        console.error('Failed to fetch tz.bxkp.org html:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '-100vh', x: '-50%', opacity: 0 }}
        animate={{ 
          y: 0,
          opacity: 1,
          x: '-50%'
        }}
        exit={{ 
          y: '-100vh', 
          opacity: 0,
          x: '-50%'
        }}
        transition={{ 
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="fixed top-[8vh] left-1/2 z-[70] w-[92vw] max-w-[800px] h-[82vh] max-h-[720px] bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
      >
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


