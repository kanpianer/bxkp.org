import React, { useState } from 'react';

interface TasselSwitchProps {
  onToggle: () => void;
}

const TasselSwitch: React.FC<TasselSwitchProps> = ({ onToggle }) => {
  const [isPulled, setIsPulled] = useState(false);

  const handleClick = () => {
    setIsPulled(true);
    onToggle();
    setTimeout(() => setIsPulled(false), 300);
  };

  return (
    <div 
      className="fixed top-0 right-[5%] z-50 flex flex-col items-center cursor-pointer group"
      onClick={handleClick}
      title="Open Secret Panel"
    >
      {/* Mounting Plate (Static) */}
      <div className="w-5 h-2 bg-ink-800 rounded-b-lg shadow-md z-10"></div>
      
      {/* Swinging Assembly */}
      <div className="flex flex-col items-center origin-top animate-breeze">
        {/* Red Cord (Animates Height) */}
        <div 
          className="w-[2px] bg-cinnabar shadow-sm transition-all duration-300 ease-in-out"
          style={{ height: isPulled ? '100px' : '80px' }}
        ></div>
        
        {/* Moving Part: Knot & Tail (Moves with the cord) */}
        <div className="flex flex-col items-center -mt-[2px]">
          {/* Chinese Knot Body (Simplified) */}
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 bg-cinnabar rotate-45 rounded-sm shadow-md"></div>
            <div className="absolute inset-0 bg-cinnabar border border-cinnabar-light rotate-45 rounded-sm opacity-50 scale-75"></div>
          </div>
          
          {/* Tassel Tail */}
          <div className="flex justify-center -mt-[2px] space-x-[1px] origin-top animate-flutter">
             <div className="w-[1px] h-8 bg-cinnabar opacity-80"></div>
             <div className="w-[1px] h-10 bg-cinnabar"></div>
             <div className="w-[1px] h-9 bg-cinnabar opacity-90"></div>
             <div className="w-[1px] h-8 bg-cinnabar opacity-80"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breeze {
            0%, 100% { transform: rotate(-4deg); }
            50% { transform: rotate(4deg); }
        }
        @keyframes flutter {
            0%, 100% { transform: skewX(-5deg) rotate(2deg); }
            50% { transform: skewX(5deg) rotate(-2deg); }
        }
        .animate-breeze {
            animation: breeze 5s ease-in-out infinite;
        }
        .animate-flutter {
            animation: flutter 3s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default TasselSwitch;