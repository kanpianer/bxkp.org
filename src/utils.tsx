import React from 'react';

export interface FormatOptions {
  allowLinks?: boolean;
}

/**
 * 将被两个 # 包裹的文字渲染为主题红色（例如 #你干嘛# 渲染为主题红色的「你干嘛」，并隐藏 # 符号）
 * 同时支持将 Markdown 样式的超链接 [显示文字](链接URL) 渲染为可点击的外链 <a> 标签
 *
 * @param text 待处理的原始文本
 * @param isDark 是否处于暗黑模式（可选）
 * @param options 可选配置，例如 { allowLinks: false } 防止在已有 <a> 或 <button> 内生成嵌套超链接
 */
export function formatThemeRed(
  text: string | undefined | null,
  isDark?: boolean,
  options?: FormatOptions
): React.ReactNode {
  if (!text || typeof text !== 'string') return text ?? null;
  const allowLinks = options?.allowLinks !== false;

  // 既没有 # 也没有可能成对的 [ ]( ) 时，直接返回纯文本以提升性能
  if (!text.includes('#') && (!allowLinks || !text.includes('[') || !text.includes(']('))) {
    return text;
  }

  // 匹配 [显示文字](URL) 以及 #红色文本#
  // Group 1: 链接文字, Group 2: 链接地址
  // Group 3: 红色高亮文字
  const regex = /\[([^\]]+)\]\(([^)\s]+)\)|#([^#\r\n]+)#/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      // 匹配到 [显示文字](URL)
      const linkText = match[1];
      const linkUrl = match[2];
      // 递归解析链接文本内部是否包含 #主题红#
      const formattedInner = formatThemeRed(linkText, isDark, { allowLinks: false });

      if (allowLinks) {
        parts.push(
          <a
            key={`link-${match.index}-${linkUrl}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`theme-inline-link underline font-medium transition-colors hover:text-cinnabar ${
              isDark ? 'text-cinnabar-light hover:text-white' : 'text-indigo-stone hover:text-cinnabar'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {formattedInner}
          </a>
        );
      } else {
        parts.push(formattedInner);
      }
    } else if (match[3] !== undefined) {
      // 匹配到 #红色高亮文本#
      const innerText = match[3];
      parts.push(
        <span
          key={`red-${match.index}-${innerText}`}
          className={`theme-red-text font-inherit transition-colors duration-300 ${
            isDark ? 'text-cinnabar-light' : 'text-cinnabar'
          }`}
          style={{
            color: isDark !== undefined ? (isDark ? '#e6b0aa' : '#9e2a2b') : undefined
          }}
        >
          {innerText}
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex === 0) {
    // 未匹配到有效配对的标记
    return text;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * 剔除文本中用于高亮样式的 #...# 标记以及 [文字](链接) 的 Markdown 链接语法，用于 title、aria-label 等纯文本属性
 */
export function stripHashes(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/#([^#\r\n]+)#/g, '$1');
}
