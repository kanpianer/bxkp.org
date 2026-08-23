import React from 'react';

interface AskMovieButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode?: boolean;
}

const AskMovieButton: React.FC<AskMovieButtonProps> = ({
  isOpen,
  onToggle,
  isDarkMode = false,
}) => {
  return (
    <button
      onClick={onToggle}
      title="问片：关于影片的所有问题"
      aria-label="问片：关于影片的所有问题"
      className={`fixed top-3 sm:top-4 left-4 sm:left-[5%] z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-serif font-bold text-xs sm:text-sm tracking-wider backdrop-blur-md transition-all duration-500 border shadow-sm cursor-pointer select-none group active:scale-95 ${
        isOpen
          ? 'bg-cinnabar/60 text-paper-50 border-cinnabar/60 shadow-cinnabar/30 scale-105'
          : isDarkMode
            ? 'bg-paper-100/20 hover:bg-paper-100/30 text-paper-100 hover:text-cinnabar-light border-white/15 hover:border-cinnabar-light/40 hover:scale-105'
            : 'bg-paper-100/60 hover:bg-paper-200/80 text-ink-800 hover:text-cinnabar border-ink-500/15 hover:border-cinnabar/40 hover:scale-105'
      }`}
    >
      <svg
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110 ${
          isOpen ? 'text-paper-50' : isDarkMode ? 'text-cinnabar-light' : 'text-cinnabar'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <span>问片</span>
    </button>
  );
};

export default AskMovieButton;
