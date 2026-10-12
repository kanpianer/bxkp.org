import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !document.fullscreenElement) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
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
          duration: 0.45,
          ease: [0.34, 1.3, 0.64, 1]
        }}
        className={`fixed top-[6vh] md:top-[8vh] left-1/2 z-[70] w-[94vw] max-w-[960px] h-[80vh] max-h-[640px] flex flex-col ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            aria-label="关闭窗口"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 hover:text-white bg-black/70 hover:bg-black/90 rounded-full backdrop-blur-md border border-white/10 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          >
            <span>关闭</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Player Card */}
        <div className="flex-1 w-full bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          <iframe
            src="https://www.vidy.st/tv/1396/1/1?color=DC2626&nextEpisode=true&episodeSelector=true"
            title="视频播放器"
            width="100%"
            height="100%"
            className="w-full h-full border-0"
            frameBorder="0"
            allowFullScreen
            allow="encrypted-media; autoplay *; fullscreen *"
          />
        </div>
      </motion.div>
    </>
  );
};

export default SecretPanel;




