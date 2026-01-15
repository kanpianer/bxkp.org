import React, { useState } from 'react';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Container: Removed -translate-x-1/2 from class because the animation handles the transform centering */}
      <div className="fixed top-[15%] left-1/2 z-[70] w-[clamp(300px,80vw,450px)] perspective-[1500px] animate-drop-in">
        <div className={`relative w-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face - Frosted Black */}
          <div className="w-full bg-black/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backface-hidden flex flex-col">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-4 border border-white/10 bg-gray-800 group cursor-pointer" onClick={() => setIsFlipped(true)}>
               <img 
                 src="https://www.apple.com/tv-pr/articles/2025/10/apple-tv-debuts-trailer-for-vince-gilligans-highly-anticipated-drama-pluribus-starring-emmy-award-nominee-rhea-seehorn/images/big-image/big-image-01/102225_Apple_Debuts_Trailer_Drama_Pluribus_Big_Image_01_big_image_post.jpg.large_2x.jpg?q=80&w=600&auto=format&fit=crop" 
                 alt="Secret 1"
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.2] brightness-90 group-hover:brightness-100"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                 <span className="text-gray-200 text-sm font-serif tracking-widest">点击翻转</span>
               </div>
            </div>
            <div className="flex gap-3 justify-between">
              <SecretButton label="网盘" url="https://www.qmp4.com/mv/460912.html" />
              <SecretButton label="在线" url="https://www.novipnoad.cc/tv/western/152182.html" />
              <SecretButton label="磁力" url="https://www.cilixiong.org/drama/4552.html" />
            </div>
          </div>

          {/* Back Face - Frosted Black */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backface-hidden rotate-y-180 flex flex-col justify-between">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-4 border border-white/10 bg-gray-800 group cursor-pointer" onClick={() => setIsFlipped(false)}>
               <img 
                 src="https://frontend-assets.clipsource.com/61f2b6d73d8bf/hbo-61f7aa83bfb15/2025/09/24/68d3940a93e04_thumbnail.jpg?q=80&w=600&auto=format&fit=crop" 
                 alt="Secret 2"
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.2] brightness-90 group-hover:brightness-100"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                 <span className="text-gray-200 text-sm font-serif tracking-widest">点击返回</span>
               </div>
            </div>
            <div className="flex gap-3 justify-between mt-auto">
              <SecretButton label="网盘" url="https://www.qmp4.com/mv/459048.html" />
              <SecretButton label="在线" url="https://www.novipnoad.cc/tv/western/152181.html" />
              <SecretButton label="磁力" url="https://www.cilixiong.org/drama/4567.html" />
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        
        /* Drop In Animation */
        @keyframes dropIn {
          0% { transform: translate(-50%, -100vh) rotate(3deg); opacity: 0; }
          70% { transform: translate(-50%, 20px) rotate(-1deg); opacity: 1; }
          100% { transform: translate(-50%, 0) rotate(0deg); opacity: 1; }
        }
        .animate-drop-in {
          animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: top center;
        }

        /* Fade In for Backdrop */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
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