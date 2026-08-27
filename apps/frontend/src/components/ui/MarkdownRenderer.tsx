import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines for block-level parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = (key: string) => {
    if (!currentList) return;
    const { type, items } = currentList;
    if (type === 'ul') {
      elements.push(
        <ul key={key} className="space-y-1.5 my-2.5 pl-2 list-none">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5 select-none">•</span>
              <span className="flex-1 leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={key} className="space-y-1.5 my-2.5 pl-2 list-none counter-reset-item">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
              <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold select-none font-mono">
                {idx + 1}
              </span>
              <span className="flex-1 leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process markdown links [label](url)
    const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const formattedText = text;

    // Helper for bold and code
    const parseFormatting = (subText: string, keyPrefix: string): React.ReactNode[] => {
      // Bold **text**
      const tokens = subText.split(/(\*\*.*?\*\*|`.*?`)/g);
      return tokens.map((token, i) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={`${keyPrefix}-${i}`} className="font-bold text-slate-900 dark:text-white">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code
              key={`${keyPrefix}-${i}`}
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        return token;
      });
    };

    while ((match = linkRegex.exec(formattedText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(...parseFormatting(formattedText.substring(lastIndex, match.index), `txt-${lastIndex}`));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-0.5"
        >
          {label}
          <span className="text-[10px] select-none">↗</span>
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < formattedText.length) {
      parts.push(...parseFormatting(formattedText.substring(lastIndex), `txt-${lastIndex}`));
    }

    return parts.length > 0 ? parts : parseFormatting(text, 'root');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="p-3 my-2 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800"
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        flushList(`flush-${i}`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Empty lines
    if (!trimmed) {
      flushList(`flush-${i}`);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList(`flush-${i}`);
      elements.push(<hr key={`hr-${i}`} className="my-4 border-slate-200 dark:border-slate-800" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-base font-black text-blue-950 dark:text-blue-300 mt-4 mb-2">
          {renderInline(trimmed.substring(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-extrabold text-blue-900 dark:text-blue-400 mt-3.5 mb-1.5">
          {renderInline(trimmed.substring(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mt-3 mb-1">
          {renderInline(trimmed.substring(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1">
          {renderInline(trimmed.substring(5))}
        </h4>
      );
      continue;
    }

    // Blockquote or Tip (> ...)
    if (trimmed.startsWith('>')) {
      flushList(`flush-${i}`);
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${i}`}
          className="p-3 my-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-400 text-xs text-blue-900 dark:text-blue-200"
        >
          {renderInline(quoteText)}
        </div>
      );
      continue;
    }

    // Unordered List Items (* or -)
    const ulMatch = trimmed.match(/^[\*\-]\s+(.+)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList(`flush-${i}`);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered List Items (1. , 2. )
    const olMatch = trimmed.match(/^\d+[\.\)]\s+(.+)/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList(`flush-${i}`);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Standard Paragraph
    flushList(`flush-${i}`);
    elements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 my-1.5">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList('flush-end');

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
