import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SITES, EMBY_SECTION, OK_SECTION, FOOTER_SECTION } from '../constants';
import { Category, InfoType } from './types';
import InkCanvas from './components/InkCanvas';
import NightCanvas from './components/NightCanvas';
import TasselSwitch from './components/TasselSwitch';
import SecretPanel from './components/SecretPanel';

// Theme switch transition duration in milliseconds
const THEME_TRANSITION_DURATION = 800;

export default function App() {
  const [currentCategory, setCurrentCategory] = useState<Category>('online');
  const [infoType, setInfoType] = useState<InfoType>(null);
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 家宽导航多镜像权重随机跳转 (50% jiakuan.link / 25% jkdh.sld.tw / 25% jkdh.pages.dev)
  const getRandomJiakuanUrl = () => {
    const r = Math.random();
    if (r < 0.5) {
      return 'https://jiakuan.link/';
    } else if (r < 0.75) {
      return 'https://jkdh.sld.tw/';
    } else {
      return 'https://jkdh.pages.dev/';
    }
  };

  const [jiakuanUrl, setJiakuanUrl] = useState('https://jiakuan.link/');

  const handleJiakuanPrepare = () => {
    setJiakuanUrl(getRandomJiakuanUrl());
  };

  const handleJiakuanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetUrl = getRandomJiakuanUrl();
    setJiakuanUrl(targetUrl);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const categoryAnchorRef = useRef<HTMLDivElement>(null);

  // Hover transition control refs
  const isDarkModeRef = useRef(isDarkMode);
  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  const hoverCommitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverOriginalThemeRef = useRef<boolean | null>(null);
  const isHoverCompletedRef = useRef<boolean>(false);

  // Sync html dark class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 跟踪 SecretPanel 是否打开，避免在弹窗打开时误触发
  const isSecretOpenRef = useRef(isSecretOpen);
  useEffect(() => {
    isSecretOpenRef.current = isSecretOpen;
  }, [isSecretOpen]);

  // 在网页空白处连续点击5次，在新标签页打开 CMS 内容管理界面 (域名/Donttouchmyshit/)
  useEffect(() => {
    let clickCount = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const handleGlobalClick = (e: MouseEvent) => {
      // 弹窗打开时不处理
      if (isSecretOpenRef.current) {
        clickCount = 0;
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        return;
      }

      const rawTarget = e.target as Node | null;
      const target = (rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement) as Element | null;
      if (!target || !target.closest) return;

      // 检查是否点击在可交互元素（如链接、按钮、输入框、标签、选项卡、或带 cursor-pointer 的元素等）
      const interactiveEl = target.closest(
        'a, button, input, textarea, select, label, iframe, [role="button"], [role="tab"], .cursor-pointer'
      );

      let isPointer = false;
      try {
        isPointer = window.getComputedStyle(target).cursor === 'pointer';
      } catch (_) {
        // ignore
      }

      if (interactiveEl || isPointer) {
        // 点中可交互元素时重置计数
        clickCount = 0;
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        return;
      }

      // 点在网页空白处，计数自增
      clickCount += 1;
      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      if (clickCount >= 5) {
        clickCount = 0;
        resetTimer = null;
        window.getSelection()?.removeAllRanges();

        // 动态根据当前所在域名（兼容多域名/备份域名/本地开发环境）在新标签页打开后台
        const origin = window.location.origin && window.location.origin !== 'null'
          ? window.location.origin
          : `${window.location.protocol}//${window.location.host}`;
        const targetUrl = `${origin}/Donttouchmyshit/`;
        window.open(targetUrl, '_blank');
      } else {
        // 1.5秒内没有下一次点击则重置计数
        resetTimer = setTimeout(() => {
          clickCount = 0;
          resetTimer = null;
        }, 1500);
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, []);

  const filteredSites = useMemo(() => {
    let tag = "在线";
    if (currentCategory === "pan") tag = "网盘";
    if (currentCategory === "bt") tag = "BT";
    return SITES.filter(site => !site.isHidden && site.tags.includes(tag));
  }, [currentCategory]);

  useEffect(() => {
    if (infoType) {
      const positionToCategory = () => {
        if (categoryAnchorRef.current) {
          const rect = categoryAnchorRef.current.getBoundingClientRect();
          const targetTop = Math.max(0, rect.top + window.scrollY);
          window.scrollTo({
            top: targetTop,
            behavior: 'instant'
          });
        }
      };

      positionToCategory();
      const timer = setTimeout(positionToCategory, 20);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [infoType]);

  const toggleInfo = (type: InfoType) => {
    if (infoType === type) {
      setInfoType(null);
    } else {
      setInfoType(type);
    }
  };

  // Direct theme toggle (Click)
  const handleTitleClick = () => {
    // Clear any pending hover state so click immediately commits
    if (hoverCommitTimerRef.current) {
      clearTimeout(hoverCommitTimerRef.current);
      hoverCommitTimerRef.current = null;
    }
    isHoverCompletedRef.current = true;
    hoverOriginalThemeRef.current = null;

    setIsDarkMode(prev => !prev);
  };

  // Hover enter on title: start fading to opposite theme
  const handleTitleMouseEnter = () => {
    const original = isDarkModeRef.current;
    hoverOriginalThemeRef.current = original;
    isHoverCompletedRef.current = false;

    // Start direct fade transition to the opposite theme
    setIsDarkMode(!original);

    // If hover stays for full transition duration, commit the theme permanently
    if (hoverCommitTimerRef.current) clearTimeout(hoverCommitTimerRef.current);
    hoverCommitTimerRef.current = setTimeout(() => {
      isHoverCompletedRef.current = true;
      hoverOriginalThemeRef.current = null;
    }, THEME_TRANSITION_DURATION);
  };

  // Hover leave on title: if left before transition completes, restore original theme
  const handleTitleMouseLeave = () => {
    if (!isHoverCompletedRef.current && hoverOriginalThemeRef.current !== null) {
      if (hoverCommitTimerRef.current) {
        clearTimeout(hoverCommitTimerRef.current);
        hoverCommitTimerRef.current = null;
      }
      // Revert to original theme
      setIsDarkMode(hoverOriginalThemeRef.current);
      hoverOriginalThemeRef.current = null;
    }
  };

  const isDarkActive = isDarkMode || isSecretOpen;

  const getButtonClass = (isActive: boolean, isRedText: boolean = false, isSmall: boolean = false) => 
    `${isSmall ? 'px-3 h-7 text-xs' : 'px-6 h-10 text-base'} flex items-center justify-center rounded-full font-serif font-bold transition-all duration-500 transform border cursor-pointer select-none whitespace-nowrap
    ${isActive 
      ? 'bg-cinnabar/60 backdrop-blur-md text-paper-50 shadow-md shadow-cinnabar/30 scale-105 border-cinnabar/60' 
      : isDarkActive
        ? `bg-midnight-card backdrop-blur-sm hover:bg-white/10 hover:scale-105 hover:border-cinnabar/50 border-midnight-border ${isRedText ? 'text-cinnabar-light' : 'text-gray-300 hover:text-white'}`
        : `bg-paper-100/40 backdrop-blur-sm hover:bg-paper-200/60 hover:scale-105 hover:border-cinnabar/30 border-ink-500/10 ${isRedText ? 'text-cinnabar' : 'text-ink-700 hover:text-ink-900'}`
    }`;

  // Dynamic link classes for better readability on different backgrounds
  const linkClass = isDarkActive 
    ? "text-paper-50 hover:text-cinnabar-light border-b border-transparent hover:border-cinnabar-light transition-all font-bold"
    : "text-indigo-stone hover:text-cinnabar border-b border-transparent hover:border-cinnabar transition-all font-bold";

  const footerLinkClass = `transition-colors duration-300 ${isDarkActive ? 'text-cinnabar-light hover:text-white' : 'text-cinnabar hover:text-cinnabar-hover'}`;

  // Action Buttons Component to avoid duplication
  const ActionButtons = () => (
    <>
        <button 
            onClick={() => toggleInfo('emby')}
            className={getButtonClass(infoType === 'emby', true)}
        >
            Emby服
        </button>
        <button 
            onClick={() => toggleInfo('ok')}
            className={getButtonClass(infoType === 'ok', true)}
        >
            OK影视
        </button>
    </>
  );

  return (
    <div className={`min-h-screen relative font-serif selection:bg-cinnabar/30 selection:text-ink-900 transition-colors duration-[800ms] ease-in-out ${isSecretOpen ? 'bg-black' : isDarkMode ? 'bg-[#080c14]' : ''}`}>
      {/* Night Sky with Moon & Stars (Rendered in background layer) */}
      <NightCanvas isDark={isDarkMode && !isSecretOpen} />

      {/* Shanshui Ink Mountain Canvas (Rendered in front of sky, naturally occluding stars behind mountain ridgeline) */}
      <InkCanvas darkMode={isDarkActive} />
      
      <TasselSwitch onToggle={() => setIsSecretOpen(prev => !prev)} isOpen={isSecretOpen} />
      <SecretPanel isOpen={isSecretOpen} onClose={() => setIsSecretOpen(false)} />

      {/* Top-Left: 家宽导航 链接（无装饰按钮，纯logo与文字，hover高亮，固定于页面左上角不随屏悬浮） */}
      <a
        href={jiakuanUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleJiakuanClick}
        onMouseEnter={handleJiakuanPrepare}
        onFocus={handleJiakuanPrepare}
        onTouchStart={handleJiakuanPrepare}
        title="家宽导航（精选家宽与住宅IP节点推荐）"
        aria-label="家宽导航"
        className={`absolute top-4 left-4 sm:top-5 sm:left-6 z-30 flex items-center gap-2 font-serif text-sm font-bold select-none cursor-pointer transition-all duration-300 group ${
          isDarkActive
            ? 'text-gray-300/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
            : 'text-ink-700/80 hover:text-cinnabar hover:drop-shadow-sm'
        }`}
      >
        <img
          src="/jkdh-icon.png"
          alt="家宽导航"
          width="20"
          height="20"
          className="w-5 h-5 object-contain rounded-sm opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          loading="eager"
          decoding="async"
        />
        <span className="tracking-wide">家宽导航</span>
      </a>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-8 md:py-10 pb-36 md:pb-6 flex flex-col items-center min-h-screen">
        
        {/* Header with Dark Mode Hover / Click toggle */}
        <header className="mt-5 md:mt-7 mb-3 text-center select-none">
          <div 
            className="inline-block cursor-pointer group relative"
            onMouseEnter={handleTitleMouseEnter}
            onMouseLeave={handleTitleMouseLeave}
            onClick={handleTitleClick}
            title="鼠标悬停或点击切换昼夜暗黑模式"
          >
            <h1 
              className={`text-4xl font-bold tracking-[0.2em] mb-3 drop-shadow-sm opacity-95 font-serif transition-all duration-[800ms] group-hover:scale-105 ${
                isDarkActive 
                  ? 'text-gray-200 group-hover:text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]' 
                  : 'text-ink-900 group-hover:text-ink-800'
              }`} 
              style={{ textShadow: isDarkActive ? '0 2px 10px rgba(0,0,0,0.5)' : '2px 2px 4px rgba(0,0,0,0.05)' }}
            >
              不想看片
            </h1>
          </div>
          <h2 className={`text-base font-medium tracking-widest opacity-80 font-serif transition-colors duration-[800ms] ${
            isDarkActive ? 'text-cinnabar-light' : 'text-cinnabar'
          }`}>
            精选全球影视资源
          </h2>
        </header>

        {/* Scroll Anchor */}
        <div ref={categoryAnchorRef} className="w-full h-0 pointer-events-none" />

        {/* Category Filters - Sticky Top */}
        <nav aria-label="资源分类导航" className="sticky top-0 z-40 w-full flex justify-center py-3 pointer-events-none">
          <div 
            role="tablist"
            className="flex gap-4 flex-wrap justify-center pointer-events-auto p-2 rounded-full transition-all duration-500"
          >
            <button 
              role="tab"
              aria-selected={currentCategory === 'pan' && !infoType}
              aria-label="网盘资源分类"
              className={getButtonClass(currentCategory === 'pan')} 
              onClick={() => { setCurrentCategory('pan'); setInfoType(null); }}
            >
              网盘
            </button>
            <button 
              role="tab"
              aria-selected={currentCategory === 'online' && !infoType}
              aria-label="在线影视分类"
              className={getButtonClass(currentCategory === 'online')} 
              onClick={() => { setCurrentCategory('online'); setInfoType(null); }}
            >
              在线
            </button>
            <button 
              role="tab"
              aria-selected={currentCategory === 'bt' && !infoType}
              aria-label="磁力BT分类"
              className={getButtonClass(currentCategory === 'bt')} 
              onClick={() => { setCurrentCategory('bt'); setInfoType(null); }}
            >
              磁力
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main className="w-[95%] min-h-[150px] relative transition-all duration-[800ms] ease-in-out mt-3">
          
          {infoType ? (
             /* Info Panel View */
            <div className={`w-full max-w-4xl mx-auto rounded-3xl p-8 border backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.05)] animate-fade-in-up transition-colors duration-700 ${
              isDarkActive 
                ? 'bg-midnight-800/85 border-white/10 text-gray-200' 
                : 'bg-paper-50/80 border-ink-200/10 text-ink-800'
            }`}>
              {infoType === 'emby' ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-cinnabar-light text-center mb-6 border-b border-paper-300/30 pb-2">{EMBY_SECTION.title}</h3>
                  <p>{EMBY_SECTION.description}</p>
                  <ul className={`list-disc pl-6 space-y-2 ${isDarkActive ? 'text-gray-300' : 'text-ink-700'}`}>
                     <li><span className={`font-bold ${isDarkActive ? 'text-white' : 'text-ink-900'}`}>公益服：</span>无需付费，但可能有一定入服门槛。
                        <div className={`mt-1 text-sm flex flex-wrap gap-2 ${isDarkActive ? 'text-cinnabar-light' : 'text-indigo-stone'}`}>
                           {EMBY_SECTION.publicServers.map(server => (
                             <a key={server.name} href={server.url} target="_blank" rel="noopener noreferrer" className="hover:text-cinnabar underline">{server.name}</a>
                           ))}
                        </div>
                     </li>
                     <li><span className={`font-bold ${isDarkActive ? 'text-white' : 'text-ink-900'}`}>付费服：</span>需要付费，但服务会相对比较稳定。
                        <div className={`mt-1 text-sm flex flex-wrap gap-2 ${isDarkActive ? 'text-cinnabar-light' : 'text-indigo-stone'}`}>
                           {EMBY_SECTION.paidServers.map(server => (
                             <a key={server.name} href={server.url} target="_blank" rel="noopener noreferrer" className="hover:text-cinnabar underline">{server.name}</a>
                           ))}
                        </div>
                     </li>
                  </ul>
                  <p className={`text-sm mt-4 italic border-t pt-4 ${isDarkActive ? 'border-white/10 text-gray-400' : 'border-paper-300 text-ink-500'}`}>
                     {EMBY_SECTION.notice}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-cinnabar-light text-center mb-6 border-b border-paper-300/30 pb-2">{OK_SECTION.title}</h3>
                    <p>
                      {OK_SECTION.apps.map((app, idx) => (
                        <React.Fragment key={app.name}>
                          {idx > 0 && ' 和 '}
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:text-cinnabar underline">{app.name}</a>
                        </React.Fragment>
                      ))}
                      {OK_SECTION.description}
                    </p>
                    <ul className={`list-disc pl-6 space-y-2 ${isDarkActive ? 'text-gray-300' : 'text-ink-700'}`}>
                        {OK_SECTION.resources.map(res => (
                          <li key={res.name}>
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className={`hover:text-cinnabar underline ${isDarkActive ? 'text-cinnabar-light' : 'text-indigo-stone'}`}>{res.name}</a>
                          </li>
                        ))}
                    </ul>
                     <p className={`text-sm mt-4 italic border-t pt-4 ${isDarkActive ? 'border-white/10 text-gray-400' : 'border-paper-300 text-ink-500'}`}>
                        {OK_SECTION.notice}
                    </p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-fade-in">
              {filteredSites.map((site) => (
                <div 
                  key={site.name} 
                  className={`group relative rounded-2xl border p-5 flex flex-col items-center hover:-translate-y-1 transition-all duration-500 cursor-pointer ${
                    isDarkActive
                      ? 'bg-midnight-card backdrop-blur-md border-midnight-border hover:bg-midnight-700/80 hover:border-cinnabar/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                      : 'bg-paper-100/75 backdrop-blur-[2px] border-ink-500/10 hover:shadow-[0_4px_12px_rgba(158,42,43,0.15)] hover:bg-paper-100/90 hover:border-cinnabar/30'
                  }`}
                  onClick={() => window.open(site.main_url, "_blank")}
                >
                    <a 
                        href={site.main_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={`访问 ${site.name} 官网`}
                        aria-label={`访问 ${site.name} 官网`}
                        className={`text-lg font-bold mb-3 group-hover:text-cinnabar transition-colors pb-0.5 border-b border-transparent group-hover:border-cinnabar/20 ${
                          isDarkActive ? 'text-gray-100' : 'text-ink-800'
                        }`}
                    >
                        {site.name}
                    </a>
                    
                    {site.backup_url ? (
                        <a 
                            href={site.backup_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`${site.name} 备用地址`}
                            aria-label={`${site.name} 备用地址`}
                            className={`mt-1 text-xs px-3 py-1 rounded-full border transition-colors ${
                              isDarkActive 
                                ? 'border-cinnabar/40 text-cinnabar-light hover:bg-cinnabar hover:text-white' 
                                : 'border-cinnabar/20 text-cinnabar/80 hover:bg-cinnabar hover:text-white'
                            }`}
                        >
                            备份网址
                        </a>
                    ) : (
                        <a
                            href="https://md.picasoft.net/LMlgl6FTRW-bTx3GgT2txQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="查看站点备份与提交记录"
                            aria-label="查看站点备份与提交记录"
                            className={`mt-1 text-xs px-3 py-1 rounded-full border transition-colors ${
                              isDarkActive 
                                ? 'border-white/10 text-gray-400 hover:border-gray-300 hover:text-gray-200' 
                                : 'border-ink-300/30 text-ink-400 hover:border-ink-500 hover:text-ink-500'
                            }`}
                        >
                            没有备份
                        </a>
                    )}
                </div>
              ))}
            </div>
          )}

        </main>

        {/* Page Bottom Notes & Footer */}
        <footer className="mt-4 w-full flex flex-col items-center gap-4">
            <div className={`text-sm leading-relaxed max-w-2xl mx-auto p-4 text-center transition-colors duration-[800ms] ${isDarkActive ? 'text-paper-200' : 'text-black/90'}`}>
               {FOOTER_SECTION.backupSites && FOOTER_SECTION.backupSites.length > 0 && (
                 <p className="mb-2">
                   备份网站：
                   {FOOTER_SECTION.backupSites.map((bSite, idx) => (
                     <React.Fragment key={bSite.name}>
                       {idx > 0 && '、'}
                       <a href={bSite.url} target="_blank" rel="noopener noreferrer" className={linkClass}>{bSite.name}</a>
                     </React.Fragment>
                   ))}
                 </p>
               )}
               {FOOTER_SECTION.relatedSites && FOOTER_SECTION.relatedSites.length > 0 ? (
                 <p className="mb-2">
                   {FOOTER_SECTION.relatedSites.map((item, idx) => (
                     <React.Fragment key={item.name}>
                       {idx > 0 && '、'}
                       <span>{item.name}: </span>
                       <a 
                         href={item.url} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className={linkClass}
                       >
                         {item.displayText || item.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                       </a>
                     </React.Fragment>
                   ))}
                 </p>
               ) : (
                 <p className="mb-2">
                   <span>不想翻墙: </span>
                   <a href="https://bxfq.sld.tw/" target="_blank" rel="noopener noreferrer" className={linkClass}>bxfq.sld.tw</a>
                   <span>、不想看书: </span>
                   <a href="https://bxks.sld.tw/" target="_blank" rel="noopener noreferrer" className={linkClass}>bxks.sld.tw</a>
                 </p>
               )}
               {FOOTER_SECTION.promoLinks && FOOTER_SECTION.promoLinks.map(p => (
                 <p key={p.title}>
                   <a href={p.url} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>{p.title}</a>：{p.description}
                 </p>
               ))}
            </div>

            {/* Bottom Row: Buttons & Links aligned tightly */}
            <div className="w-full flex items-center justify-center gap-3 relative px-2 md:px-0">
                {/* Left Button (Desktop/Tablet) */}
                <div className="hidden md:block">
                    <button 
                        onClick={() => toggleInfo('emby')}
                        className={getButtonClass(infoType === 'emby', true, true)}
                    >
                        Emby服
                    </button>
                </div>

                {/* Center Links */}
                <div className={`flex justify-center items-center text-xs tracking-widest gap-6 font-serif transition-colors duration-[800ms] ${isDarkActive ? 'text-cinnabar-light' : 'text-cinnabar'}`}>
                    <span className="flex items-center gap-1">
                        {FOOTER_SECTION.bottomText || 'Made with ❤'}
                    </span>
                    {FOOTER_SECTION.githubUrl && (
                      <a href={FOOTER_SECTION.githubUrl} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>Github</a>
                    )}
                </div>

                {/* Right Button (Desktop/Tablet) */}
                <div className="hidden md:block">
                    <button 
                        onClick={() => toggleInfo('ok')}
                        className={getButtonClass(infoType === 'ok', true, true)}
                    >
                        OK影视
                    </button>
                </div>
            </div>
        </footer>

      </div>

      {/* Mobile Fixed Buttons (Floating) - Hidden on tablet/desktop */}
      <div className="md:hidden fixed bottom-3 left-0 w-full z-30 flex justify-center py-2 pointer-events-none">
        <div className="flex justify-center items-center gap-6 pointer-events-auto px-2">
            <ActionButtons />
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
