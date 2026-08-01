import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Slide } from '../types';

interface Props {
  slides: Slide[];
  currentIndex: number;
}

const PANEL_HEIGHT = 666; // 720 - title bar 54

export const SlidePanel: React.FC<Props> = ({ slides, currentIndex }) => {
  const slide = slides[Math.max(0, Math.min(currentIndex, slides.length - 1))];
  if (!slide) return null;

  const total = slides.length;

  return (
    <div
      style={{
        width: '100%',
        height: PANEL_HEIGHT,
        overflow: 'hidden',
        background: '#fafafa',
        boxSizing: 'border-box',
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Slide number indicator */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 20,
          fontSize: 14,
          color: '#999',
          fontWeight: 500,
          letterSpacing: 1,
        }}
      >
        {currentIndex + 1} / {total}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '20px 48px 16px',
          boxSizing: 'border-box',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, marginTop: 4 }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#16213e', borderBottom: '2px solid #4a90d9', paddingBottom: 4, marginTop: 4, marginBottom: 12 }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ fontSize: 23, fontWeight: 600, color: '#0f3460', marginTop: 14, marginBottom: 6 }}>
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
            ol: ({ children }) => (
              <ol style={{ paddingLeft: 24, margin: '4px 0' }}>{children}</ol>
            ),
            strong: ({ children }) => (
              <strong style={{ color: '#0f3460', fontWeight: 700 }}>{children}</strong>
            ),
            hr: () => (
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '14px 0' }} />
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
            blockquote: ({ children }) => (
              <blockquote style={{ borderLeft: '4px solid #4a90d9', paddingLeft: 16, margin: '8px 0', color: '#555', fontStyle: 'italic' }}>
                {children}
              </blockquote>
            ),
          }}
        >
          {slide.content}
        </ReactMarkdown>
      </div>

      {/* Bottom progress bar */}
      <div
        style={{
          height: 4,
          background: '#e0e0e0',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentIndex + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #4a90d9, #357abd)',
            transition: 'width 0s',
          }}
        />
      </div>
    </div>
  );
};
