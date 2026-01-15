import React, { useState, useMemo } from 'react';
import { SITES } from './constants';
import { Category, InfoType } from './types';
import InkCanvas from './components/InkCanvas';
import TasselSwitch from './components/TasselSwitch';
import SecretPanel from './components/SecretPanel';

export default function App() {
  const [currentCategory, setCurrentCategory] = useState<Category>('online');
  const [infoType, setInfoType] = useState<InfoType>(null);
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  
  const filteredSites = useMemo(() => {
    let tag = "在线";
    if (currentCategory === "pan") tag = "网盘";
    if (currentCategory === "bt") tag = "BT";
    return SITES.filter(site => site.tags.includes(tag));
  }, [currentCategory]);

  const toggleInfo = (type: InfoType) => {
    if (infoType === type) {
      setInfoType(null);
    } else {
      setInfoType(type);
    }
  };

  const getButtonClass = (isActive: boolean, isRedText: boolean = false) => 
    `px-6 h-10 flex items-center justify-center rounded-full font-serif font-bold text-base transition-all duration-500 transform border cursor-pointer select-none whitespace-nowrap
    ${isActive 
      ? 'bg-cinnabar/50 backdrop-blur-md text-paper-50 shadow-md shadow-cinnabar/30 scale-105 border-cinnabar/50' 
      : `bg-paper-100/40 backdrop-blur-sm hover:bg-paper-200/60 hover:scale-105 hover:border-cinnabar/30 border-ink-500/10 ${isRedText ? (isSecretOpen ? 'text-cinnabar-light' : 'text-cinnabar') : 'text-ink-700 hover:text-ink-900'}`
    }`;

  // Dynamic link classes for better readability on different backgrounds
  const linkClass = isSecretOpen 
    ? "text-paper-50 hover:text-cinnabar-light border-b border-transparent hover:border-cinnabar-light transition-all font-bold"
    : "text-indigo-stone hover:text-cinnabar border-b border-transparent hover:border-cinnabar transition-all font-bold";

  const footerLinkClass = `transition-colors duration-300 ${isSecretOpen ? 'hover:text-cinnabar-light' : 'hover:text-cinnabar'}`;

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
    <div className={`min-h-screen relative font-serif selection:bg-cinnabar/30 selection:text-ink-900 transition-colors duration-[1500ms] ease-in-out ${isSecretOpen ? 'bg-black' : ''}`}>
      <InkCanvas darkMode={isSecretOpen} />
      
      <TasselSwitch onToggle={() => setIsSecretOpen(true)} />
      <SecretPanel isOpen={isSecretOpen} onClose={() => setIsSecretOpen(false)} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-8 md:py-10 pb-36 lg:pb-16 flex flex-col items-center min-h-screen">
        
        {/* Header - Reduced spacing again by ~20% */}
        <header className="mt-5 md:mt-7 mb-3 text-center select-none">
          <h1 className={`text-6xl font-bold tracking-[0.2em] mb-4 drop-shadow-sm opacity-90 font-serif transition-colors duration-[1500ms] ${isSecretOpen ? 'text-gray-300' : 'text-ink-900'}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}>
            不想看片
          </h1>
          <h2 className={`text-xl font-medium tracking-widest opacity-80 font-serif transition-colors duration-[1500ms] ${isSecretOpen ? 'text-cinnabar-light' : 'text-cinnabar'}`}>
            精选全球影视资源
          </h2>
        </header>

        {/* Category Filters - Sticky Top */}
        <div className="sticky top-0 z-40 w-full flex justify-center py-3 pointer-events-none">
          <div 
            className="flex gap-4 flex-wrap justify-center pointer-events-auto p-2 rounded-full transition-all duration-500"
          >
            <button 
              className={getButtonClass(currentCategory === 'pan')} 
              onClick={() => { setCurrentCategory('pan'); setInfoType(null); }}
            >
              网盘
            </button>
            <button 
              className={getButtonClass(currentCategory === 'online')} 
              onClick={() => { setCurrentCategory('online'); setInfoType(null); }}
            >
              在线
            </button>
            <button 
              className={getButtonClass(currentCategory === 'bt')} 
              onClick={() => { setCurrentCategory('bt'); setInfoType(null); }}
            >
              磁力
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-[95%] min-h-[150px] relative transition-all duration-[800ms] ease-in-out mt-3">
          
          {infoType ? (
             /* Info Panel View */
            <div className="w-full max-w-4xl mx-auto bg-paper-50/80 backdrop-blur-md rounded-3xl p-8 border border-ink-200/10 shadow-[0_8px_30px_rgba(0,0,0,0.05)] animate-fade-in-up">
              {infoType === 'emby' ? (
                <div className="space-y-4 text-ink-800">
                  <h3 className="text-2xl font-bold text-cinnabar text-center mb-6 border-b border-paper-300 pb-2">Emby服</h3>
                  <p>没有各种广告和高画质是Emby服的特点，ta一般大致分为以下两类：</p>
                  <ul className="list-disc pl-6 space-y-2 text-ink-700">
                     <li><span className="font-bold text-ink-900">公益服：</span>无需付费，但可能有一定入服门槛。
                        <div className="mt-1 text-sm text-indigo-stone flex flex-wrap gap-2">
                           <a href="https://intro.bgp.yt/" target="_blank" className="hover:text-cinnabar underline">二次元Emby</a>
                           <a href="https://discord.gg/WHxeZ3aTtb" target="_blank" className="hover:text-cinnabar underline">Gir Society</a>
                           <a href="https://t.me/embyxk" target="_blank" className="hover:text-cinnabar underline">公益服星空指南</a>
                        </div>
                     </li>
                     <li><span className="font-bold text-ink-900">付费服：</span>需要付费，但服务会相对比较稳定。
                        <div className="mt-1 text-sm text-indigo-stone flex flex-wrap gap-2">
                            <a href="https://plan.emby.moe/" target="_blank" className="hover:text-cinnabar underline">1111Emby</a>
                            <a href="https://micu.hk/archives/emby-users" target="_blank" className="hover:text-cinnabar underline">MICU</a>
                            <a href="https://zdz.best" target="_blank" className="hover:text-cinnabar underline">终点站+</a>
                        </div>
                     </li>
                  </ul>
                  <p className="text-sm mt-4 text-ink-500 italic border-t border-paper-300 pt-4">
                     * 购买前确保你可以访问相关Emby服线路。文中提到的Emby服仅作为示例展示，不是广告。
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-ink-800">
                    <h3 className="text-2xl font-bold text-cinnabar text-center mb-6 border-b border-paper-300 pb-2">OK影视</h3>
                    <p>OK影视使用起来和Emby差不多，一般在客户端填写好配置接口的地址就可以了。</p>
                    <ul className="list-disc pl-6 space-y-2 text-ink-700">
                        <li><a href="https://blog.ccino.org/p/tvbox-tv-version-installation-and-configuration-complete-guide/" target="_blank" className="hover:text-cinnabar underline text-indigo-stone">TVBox电视版安装配置全指南</a></li>
                        <li><a href="https://t.me/tvb_ys" target="_blank" className="hover:text-cinnabar underline text-indigo-stone">TVB/影視(OK) 电报频道</a></li>
                        <li><a href="https://github.com/qist/tvbox" target="_blank" className="hover:text-cinnabar underline text-indigo-stone">OK影视各种客户端和配置接口</a></li>
                    </ul>
                     <p className="text-sm mt-4 text-ink-500 italic border-t border-paper-300 pt-4">
                        * OK影视是资源聚合的播放器，高清内容通常需要配合网盘VIP使用。
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
                  className="group relative bg-paper-100/50 backdrop-blur-[2px] rounded-2xl border border-ink-500/10 p-5 flex flex-col items-center hover:shadow-[0_4px_12px_rgba(158,42,43,0.15)] hover:bg-paper-100/90 hover:border-cinnabar/30 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                  onClick={() => window.open(site.main_url, "_blank")}
                >
                    <span className="text-lg font-bold text-ink-800 mb-3 group-hover:text-cinnabar transition-colors pb-0.5 border-b border-transparent group-hover:border-cinnabar/20">
                        {site.name}
                    </span>
                    
                    {site.backup_url ? (
                        <a 
                            href={site.backup_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 text-xs px-3 py-1 rounded-full border border-cinnabar/20 text-cinnabar/80 hover:bg-cinnabar hover:text-white transition-colors"
                        >
                            备份网址
                        </a>
                    ) : (
                        <a
                            href="https://app.affine.pro/workspace/43839213-da83-415f-98f9-204fcd910d54/8UjZEIrLtL-PHOqZwH7b4"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 text-xs px-3 py-1 rounded-full border border-ink-300/30 text-ink-400 hover:border-ink-500 hover:text-ink-500 transition-colors"
                        >
                            没有备份
                        </a>
                    )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Page Bottom Notes & Footer - Reduced mt-5 to mt-4, gap-5 to gap-4 */}
        <div className="mt-4 w-full text-center flex flex-col items-center gap-4">
            <div className={`text-sm leading-relaxed max-w-2xl mx-auto p-4 transition-colors duration-[1500ms] ${isSecretOpen ? 'text-paper-200' : 'text-black/90'}`}>
               <p className="mb-2">
                 EE3 邀请码：<span className={`${isSecretOpen ? 'text-paper-50' : 'text-indigo-stone'} select-all font-bold cursor-text transition-colors`}>mpgh</span> &nbsp;|&nbsp; 
                 备份网址：<a href="https://www.bxkp.org" target="_blank" className={linkClass}>3w</a>、
                 <a href="https://v.bxkp.org" target="_blank" className={linkClass}>Vercel</a>
               </p>
               <p>
                 推荐使用 <a href="https://4get.nadeko.net/web?s=Brave浏览器" target="_blank" className={linkClass}>Brave</a> 或 <a href="https://4get.canine.tools/web?s=Vivaldi浏览器" target="_blank" className={linkClass}>Vivaldi</a> 浏览器
               </p>
            </div>

            <div className={`flex justify-center items-center text-xs tracking-widest gap-6 font-serif transition-colors duration-[1500ms] ${isSecretOpen ? 'text-cinnabar-light' : 'text-cinnabar'}`}>
                <span className="flex items-center gap-1">
                    Made with <span className="text-cinnabar animate-pulse">❤</span>
                </span>
                <a href="https://github.com/kanpianer/pianer" target="_blank" className={footerLinkClass}>Github</a>
                <a href="https://x.com/bxkp_org" target="_blank" className={footerLinkClass}>𝕏</a>
            </div>
        </div>

        {/* Desktop Buttons (Static, below footer) */}
        <div className="hidden lg:flex justify-center items-center gap-6 mt-8">
            <ActionButtons />
        </div>

      </div>

      {/* Mobile/Tablet Fixed Buttons (Floating) - Hidden on desktop */}
      <div className="lg:hidden fixed bottom-4 left-0 w-full z-30 flex justify-center py-2 pointer-events-none">
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