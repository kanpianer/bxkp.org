import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POPUP_CONFIG, PopupConfig, PopupVideoItem } from '../../constants';

interface SecretPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 格式化倒计时时钟：视频寿命：12天14小时32分43秒
export function formatLifespan(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSec / 86400);
  const hours = Math.floor((safeSec % 86400) / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `视频寿命：${days}天${pad(hours)}小时${pad(minutes)}分${pad(seconds)}秒`;
}

const SecretPanel: React.FC<SecretPanelProps> = ({ isOpen, onClose }) => {
  const [popupConfig, setPopupConfig] = useState<PopupConfig>(POPUP_CONFIG);
  const [activeCycleIndex, setActiveCycleIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // 当弹窗打开时，静默尝试从 /data/sites.json 加载最新落盘数据（防止本地或静态更新后未刷新页面）
  useEffect(() => {
    if (isOpen) {
      fetch(`/data/sites.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.popup && Array.isArray(data.popup.videos)) {
            setPopupConfig(data.popup);
          }
        })
        .catch(() => {
          // 降级使用静态 POPUP_CONFIG
        });
    }
  }, [isOpen]);

  // 筛选出启用的视频列表
  const enabledVideos = useMemo(() => {
    const list = (popupConfig.videos || []).filter(v => v.enabled !== false);
    if (list.length > 0) return list;
    return POPUP_CONFIG.videos;
  }, [popupConfig]);

  // 单轮总存活时长 (秒)
  const totalCycleSeconds = useMemo(() => {
    return enabledVideos.reduce((acc, v) => acc + Math.max(1, v.duration || 1), 0);
  }, [enabledVideos]);

  // 核心倒计时与轮播时钟循环计算
  useEffect(() => {
    if (!isOpen || enabledVideos.length === 0 || totalCycleSeconds <= 0) return;

    const tick = () => {
      const now = Date.now();
      const cycleStart = popupConfig.cycleStartTime || 0;
      const totalCycleMs = totalCycleSeconds * 1000;

      let elapsedMs = (now - cycleStart) % totalCycleMs;
      if (elapsedMs < 0) elapsedMs += totalCycleMs;
      const elapsedSec = elapsedMs / 1000;

      let accumulated = 0;
      let targetIndex = 0;
      let targetRemaining = 0;

      for (let i = 0; i < enabledVideos.length; i++) {
        const itemDuration = Math.max(1, enabledVideos[i].duration || 1);
        if (elapsedSec < accumulated + itemDuration) {
          targetIndex = i;
          targetRemaining = (accumulated + itemDuration) - elapsedSec;
          break;
        }
        accumulated += itemDuration;
      }

      setActiveCycleIndex(targetIndex);
      setRemainingSeconds(targetRemaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, enabledVideos, totalCycleSeconds, popupConfig.cycleStartTime]);

  // 键盘与滚动锁
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

  // 当前播放视频
  const currentVideo: PopupVideoItem | undefined = enabledVideos[activeCycleIndex] || enabledVideos[0];

  // 渲染视频内容：兼容 URL 链接与 iframe 嵌入代码
  const renderVideoPlayer = () => {
    if (!currentVideo) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
          暂无已启用的弹窗视频内容
        </div>
      );
    }

    const content = (currentVideo.content || '').trim();
    const isIframeSnippet = currentVideo.type === 'iframe' || content.startsWith('<iframe') || content.includes('</iframe>');
    const isDirectMedia = /\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(content);

    if (isDirectMedia) {
      return (
        <video
          key={currentVideo.id}
          src={content}
          controls
          autoPlay
          className="w-full h-full object-contain bg-black"
        />
      );
    }

    if (isIframeSnippet) {
      return (
        <div
          key={currentVideo.id}
          className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-none flex items-center justify-center bg-black"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <iframe
        key={currentVideo.id}
        src={content}
        title={currentVideo.title || "视频播放器"}
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        frameBorder="0"
        allowFullScreen
        allow="encrypted-media; autoplay *; fullscreen *"
      />
    );
  };

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
        className={`fixed top-[5vh] md:top-[7vh] left-1/2 z-[70] w-[95vw] max-w-[980px] h-[82vh] max-h-[660px] flex flex-col ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Top Header Bar: 倒计时数字时钟与关闭按钮 */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          {/* 数字时钟徽章：UI 与右侧关闭按钮保持一致 */}
          <div className="flex items-center px-3 py-1.5 text-xs text-white/80 bg-black/70 rounded-full backdrop-blur-md border border-white/10 shadow-lg select-none font-mono tracking-wider">
            <span>{formatLifespan(remainingSeconds)}</span>
          </div>

          {/* 右侧关闭按钮：删除后方 X 图标 */}
          <button
            onClick={onClose}
            aria-label="关闭窗口"
            className="flex items-center px-3 py-1.5 text-xs text-white/80 hover:text-white bg-black/70 hover:bg-black/90 rounded-full backdrop-blur-md border border-white/10 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ml-auto"
          >
            <span>关闭</span>
          </button>
        </div>

        {/* Video Player Card */}
        <div className="flex-1 w-full bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
          {renderVideoPlayer()}
        </div>
      </motion.div>
    </>
  );
};

export default SecretPanel;
