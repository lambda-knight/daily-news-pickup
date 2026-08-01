import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  markdown: string;
  currentSegmentIndex: number;
  totalSegments: number;
  currentSectionName?: string;
  sectionStartIndex?: number; // 現在のセクションの開始セグメント index
  sectionEndIndex?: number;   // 次のセクションの開始セグメント index（最後のセクションなら totalSegments）
  scrollOffsetPx?: number;
}

const PANEL_HEIGHT = 666; // visible area height px (720 - title bar 54)
const PANEL_W = 1184;    // 1280 - 2*48px horizontal padding
const AVG_CHAR_W = 18;   // average char width at fontSize 20 (mixed JP + ASCII)

// Markdown各行のレンダリング高さをCSSスタイルに基づいて推定する
function estimateLineH(line: string): number {
  const s = line.trim();
  if (!s) return 0;
  if (/^# [^#]/.test(s)) return 78;  // h1: font 36 + margins
  if (/^## [^#]/.test(s)) return 82; // h2: font 28 + paddingBottom 4 + marginTop 24 + marginBottom 12
  if (/^### /.test(s)) return 57;    // h3: font 23 + margins
  if (/^[-*] /.test(s)) {
    const wraps = Math.max(1, Math.ceil((s.length - 2) / (PANEL_W / AVG_CHAR_W)));
    return wraps * 36 + 4; // lineHeight 1.8*20=36 + marginBottom 4
  }
  if (/^\|/.test(s)) return 35; // table row
  if (/^---/.test(s)) return 40; // hr
  // paragraph
  const wraps = Math.max(1, Math.ceil(s.length / (PANEL_W / AVG_CHAR_W)));
  return wraps * 36 + 12; // lineHeight 1.8*20=36 + margin 12
}

// ライン高さ推定でセクションの実際のピクセル位置を計算し、スクロール量を返す
// セクション内でも segIdx の進行に応じて次の見出し位置まで徐々にスクロールする
// （sectionStartIdx/sectionEndIdx はそのセクションに属するセグメントの index 範囲）
function calcScrollY(
  markdown: string,
  sectionName: string,
  segIdx: number,
  totalSegs: number,
  sectionStartIdx: number,
  sectionEndIdx: number,
): number {
  const segProgress = totalSegs > 1 ? segIdx / (totalSegs - 1) : 0;
  const lines = markdown.split('\n');

  // 全 ## セクションのピクセル位置を計算
  let pixelPos = 40; // padding-top
  const sectionPositions: Array<{ name: string; pixel: number }> = [];
  for (const line of lines) {
    if (/^## [^#]/.test(line)) {
      sectionPositions.push({ name: line.slice(3).trim(), pixel: pixelPos });
    }
    pixelPos += estimateLineH(line);
  }
  const totalHeight = pixelPos + 20; // padding-bottom
  const maxScroll = Math.max(0, totalHeight - PANEL_HEIGHT);

  if (!sectionName) {
    return segProgress * maxScroll;
  }

  // 複数照合戦略でセクションを特定
  const colonKey = sectionName.split(/[:：]/)[0].trim();
  const shortKey = sectionName.slice(0, 10);
  const idx = sectionPositions.findIndex(({ name }) =>
    name === sectionName ||
    name.includes(sectionName) ||
    sectionName.includes(name) ||
    (colonKey.length >= 2 && name.includes(colonKey)) ||
    (shortKey.length >= 4 && name.includes(shortKey)),
  );

  if (idx < 0) {
    return segProgress * maxScroll;
  }

  const foundPixel = sectionPositions[idx].pixel;
  const isLastSection = idx === sectionPositions.length - 1;
  // 次の見出し位置（最後のセクションならコンテンツ末尾）へ向けて徐々にスクロールする
  const nextPixel = isLastSection ? totalHeight : sectionPositions[idx + 1].pixel;

  const span = Math.max(1, sectionEndIdx - sectionStartIdx - 1);
  const localProgress = Math.max(0, Math.min(1, (segIdx - sectionStartIdx) / span));

  const rawY = foundPixel + localProgress * (nextPixel - foundPixel) - PANEL_HEIGHT * 0.25;
  return Math.max(0, Math.min(rawY, maxScroll));
}

export const MarkdownPanel: React.FC<Props> = ({
  markdown,
  currentSegmentIndex,
  totalSegments,
  currentSectionName = '',
  sectionStartIndex = 0,
  sectionEndIndex = totalSegments,
  scrollOffsetPx = 0,
}) => {
  const calculatedScrollY = calcScrollY(
    markdown,
    currentSectionName,
    currentSegmentIndex,
    totalSegments,
    sectionStartIndex,
    sectionEndIndex,
  );
  const scrollY = Math.max(0, calculatedScrollY + scrollOffsetPx);

  return (
    <div
      style={{
        width: '100%',
        height: PANEL_HEIGHT,
        overflow: 'hidden',
        background: '#fafafa',
        padding: '20px 48px',
        boxSizing: 'border-box',
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      }}
    >
      <div style={{ transform: `translateY(${-scrollY}px)` }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, trust: true, throwOnError: false }]]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, marginTop: 16 }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#16213e', borderBottom: '2px solid #4a90d9', paddingBottom: 4, marginTop: 24, marginBottom: 12 }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ fontSize: 23, fontWeight: 600, color: '#0f3460', marginTop: 16, marginBottom: 6 }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{ fontSize: 20, lineHeight: 1.8, color: '#333', margin: '6px 0' }}>
                {children}
              </p>
            ),
            li: ({ children }) => (
              <li style={{ fontSize: 20, lineHeight: 1.8, color: '#333', marginBottom: 4 }}>
                {children}
              </li>
            ),
            ul: ({ children }) => (
              <ul style={{ paddingLeft: 24, margin: '4px 0' }}>{children}</ul>
            ),
            strong: ({ children }) => (
              <strong style={{ color: '#0f3460', fontWeight: 700 }}>{children}</strong>
            ),
            hr: () => (
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '16px 0' }} />
            ),
            table: ({ children }) => (
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 18, margin: '8px 0' }}>
                {children}
              </table>
            ),
            th: ({ children }) => (
              <th style={{ border: '2px solid #16213e', padding: '6px 12px', background: '#c7d4e8', color: '#16213e', fontWeight: 700 }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td style={{ border: '2px solid #16213e', padding: '6px 12px', color: '#1a1a2e' }}>{children}</td>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
