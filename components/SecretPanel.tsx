import React, { useState } from 'react';
import { motion } from 'motion/react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '-100vh', x: '-50%', rotate: 3, opacity: 0 }}
        animate={{ 
          y: 0,
          rotate: 0,
          opacity: 1,
          x: '-50%'
        }}
        exit={{ 
          y: '-100vh', 
          rotate: 3,
          opacity: 0,
          x: '-50%'
        }}
        transition={{ 
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="fixed top-[15%] left-1/2 z-[70] w-[clamp(300px,80vw,450px)] perspective-[1500px]"
      >
        <div className={`relative w-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face - Frosted Black */}
          <div className="w-full bg-black/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backface-hidden flex flex-col">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-4 border border-white/10 bg-gray-800 group cursor-pointer" onClick={() => setIsFlipped(true)}>
               <img 
                 src="https://www.themoviedb.org/t/p/w1280/pz9NCWxxOk3o0W3v1Zkhawrwb4i.jpg?q=80&w=600&auto=format&fit=crop" 
                 alt="Secret 1"
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.2] brightness-90 group-hover:brightness-100"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                 <span className="text-gray-200 text-sm font-serif tracking-widest">点击翻转</span>
               </div>
            </div>
            <div className="flex gap-3 justify-between">
              <SecretButton label="网盘" url="https://www.qmp4.com/mv/465508.html" />
              <SecretButton label="在线" url="https://www.ppnix.com/cn/movie/8024.html" />
              <SecretButton label="磁力" url="https://1337x.st/torrent/6658988/Sentimental-Value-2025-Criterion-1080p-BluRay-x265-10bit-EAC3-5-1-Norwegian-Silence/" />
            </div>
          </div>

          {/* Back Face - Frosted Black */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backface-hidden rotate-y-180 flex flex-col justify-between">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-4 border border-white/10 bg-gray-800 group cursor-pointer" onClick={() => setIsFlipped(false)}>
               <img 
                 src="https://www.themoviedb.org/t/p/w1280/z7Nga7Q9IGFWs5OEduY2gGFxnX3.jpg?q=80&w=600&auto=format&fit=crop" 
                 alt="Secret 2"
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.2] brightness-90 group-hover:brightness-100"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                 <span className="text-gray-200 text-sm font-serif tracking-widest">点击返回</span>
               </div>
            </div>
            <div className="flex gap-3 justify-between mt-auto">
              <SecretButton label="网盘" url="https://www.qmp4.com/mv/460912.html" />
              <SecretButton label="在线" url="https://www.novipnoad.us/tv/western/152182.html" />
              <SecretButton label="磁力" url="https://www.cilixiong.uk/drama/4552.html" />
            </div>
          </div>

        </div>
      </motion.div>
      
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </>
  );
};

const SecretButton: React.FC<{ label: string; url: string }> = ({ label, url }) => (
  <button 
    onClick={() => window.open(url, '_blank')}
    className="flex-1 py-2 text-gray-400 bg-white/5 border border-white/10 rounded-full hover:bg-cinnabar hover:text-white hover:border-cinnabar transition-all duration-300 transform hover:scale-105 font-serif font-bold text-base tracking-widest backdrop-blur-sm"
  >
    {label}
  </button>
);

export default SecretPanel;
