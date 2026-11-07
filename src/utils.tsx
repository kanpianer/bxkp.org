import React from 'react';

/**
 * 将被两个 # 包裹的文字渲染为主题红色（例如 #你干嘛# 渲染为主题红色的「你干嘛」，并隐藏 # 符号）
 * @param text 待处理的原始文本
 * @param isDark 是否处于暗黑模式（可选）
 */
export function formatThemeRed(text: string | undefined | null, isDark?: boolean): React.ReactNode {
  if (!text || typeof text !== 'string') return text ?? null;
  if (!text.includes('#')) return text;

  const regex = /#([^#\r\n]+)#/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const innerText = match[1];
    parts.push(
      <span
        key={`${match.index}-${innerText}`}
        className={`theme-red-text font-inherit transition-colors duration-300 ${isDark ? 'text-cinnabar-light' : 'text-cinnabar'}`}
        style={{
          color: isDark !== undefined ? (isDark ? '#e6b0aa' : '#9e2a2b') : undefined
        }}
      >
        {innerText}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex === 0) {
    // 未匹配到有效配对的 #...#
    return text;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * 剔除文本中用于高亮样式的 #...# 标记，用于 title、aria-label 等纯文本属性
 */
export function stripHashes(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return text || '';
  return text.replace(/#([^#\r\n]+)#/g, '$1');
}
