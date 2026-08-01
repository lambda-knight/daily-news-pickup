import React from 'react';
import { useCurrentFrame, AbsoluteFill } from 'remotion';
import { TimingData, Segment } from './types';
import { MarkdownPanel } from './components/MarkdownPanel';
import { SlidePanel } from './components/SlidePanel';
import { CharacterFace } from './components/CharacterFace';

interface Props {
  timingData: TimingData;
  audioUrl: string;
  manualSectionName?: string;
  scrollOffsetPx?: number;
  timingOffsetFrames?: number;
  showSubtitles?: boolean;
  characterScale?: number;
}

const TITLE_H = 54;
const BOTTOM_H = 160;
const CHAR_SIZE_NORMAL = 315;
const CHAR_SIZE_YOUTUBE = 375;

// 通常画面の字幕は「立ち絵の実際に見えている部分」ぎりぎりまで幅を広げる。
// zundamon_close.png / metan.png はどちらも 512x512 の正方形キャンバスだが、
// 立ち絵本体は左右に大きな透明余白を持つため、CHAR_SIZE_NORMAL(315px)を
// そのまま余白にすると字幕が必要以上に狭くなる。
// 実測（PIL getbbox, 512px基準を315px表示にスケール）:
//   ずんだもん（左端アンカー）: 右端 ≈ 226px
//   四国めたん（右端アンカー）: 左端 ≈ 264px（右端からの距離）
// これに揺れ・呼吸アニメ分の余裕（+15px）を足した値。
const SUBTITLE_LEFT_INSET = 240;
const SUBTITLE_RIGHT_INSET = 280;

const DEFAULT_CHARS = {
  A: { name: 'ずんだもん', color: '#4caf50', imageClose: '', imageOpen: undefined as string | undefined },
  B: { name: '四国めたん', color: '#e91e8c', imageClose: '', imageOpen: undefined as string | undefined },
};

export const YukkuriWeb: React.FC<Props> = ({
  timingData, audioUrl, manualSectionName, scrollOffsetPx = 0, timingOffsetFrames = 0,
  showSubtitles = true, characterScale = 1,
}) => {
  const frame = useCurrentFrame();
  const syncFrame = Math.max(0, Math.min(timingData.totalFrames - 1, frame + timingOffsetFrames));
  const { title, markdown, segments, youtubeScreens, slideMode, slides } = timingData;

  // characters 省略時は従来どおり ずんだもん/四国めたん（imageClose 空 → CharacterFace がデフォルト立ち絵を使用）
  const charA = timingData.characters?.A ?? DEFAULT_CHARS.A;
  const charB = timingData.characters?.B ?? DEFAULT_CHARS.B;
  const nameFor = (sp: 'A' | 'B') => (sp === 'A' ? charA.name : charB.name);
  const colorFor = (sp: 'A' | 'B') => (sp === 'A' ? charA.color : charB.color);

  const currentSeg: Segment | undefined = segments.find(
    (s) => syncFrame >= s.startFrame && syncFrame < s.endFrame
  );

  // セグメント間ギャップでも直前セクションを維持（ちらつき防止）
  const prevSeg: Segment | undefined = [...segments].reverse().find((s) => s.startFrame <= syncFrame);
  const effectiveSection = prevSeg?.section ?? 'main';

  const speakingA = currentSeg?.speaker === 'A';
  const speakingB = currentSeg?.speaker === 'B';
  const subtitle = currentSeg?.text ?? '';
  // 1行で収まる短い字幕は中央、折り返す長さは読みやすい左詰めにする。
  const subtitleIsMultiLine = subtitle.length > 28;
  const segIdx = prevSeg ? segments.indexOf(prevSeg) : 0;

  // 現在のセクション（sectionName）が segments 配列のどこからどこまでかを求める
  // → MarkdownPanel でセクション内を徐々にスクロールさせるために使う
  const currentSectionName = manualSectionName ?? prevSeg?.sectionName ?? '';
  let sectionStartIndex = 0;
  let sectionEndIndex = segments.length;
  if (prevSeg) {
    const sectionAnchor = manualSectionName
      ? Math.max(0, segments.findIndex((s) => s.sectionName === manualSectionName))
      : segIdx;
    let start = sectionAnchor;
    while (start > 0 && segments[start - 1].sectionName === currentSectionName) start--;
    let end = sectionAnchor + 1;
    while (end < segments.length && segments[end].sectionName === currentSectionName) end++;
    sectionStartIndex = start;
    sectionEndIndex = end;
  }

  // slideMode: 直前セグメントの slideIndex を現在のスライドとして使用
  const currentSlideIndex = prevSeg?.slideIndex ?? 0;
  const isYoutubeSection =
    youtubeScreens &&
    (effectiveSection === 'opening' || effectiveSection === 'ending');

  return (
    <AbsoluteFill style={{ fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif' }}>
      {isYoutubeSection ? (
        /* ── YouTube オープニング / エンディング画面 ── */
        <AbsoluteFill
          style={{
            background: 'linear-gradient(135deg, #0d0d2b 0%, #1a1a4e 50%, #0d1a3a 100%)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: TITLE_H,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#aac4ff', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
              {title}
            </span>
          </div>

          {/* Main area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 60px',
            }}
          >
            {/* 話者A large */}
            <CharacterFace character="A" isSpeaking={speakingA} side="left" size={CHAR_SIZE_YOUTUBE * characterScale} imageClose={charA.imageClose || undefined} imageOpen={charA.imageOpen} />

            {/* Center text */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '0 32px',
                textAlign: 'center',
              }}
            >
              {currentSeg?.section === 'ending' ? (
                <>
                  <div style={{ fontSize: 46, fontWeight: 900, color: '#ffd700', textShadow: '0 0 24px rgba(255,215,0,0.6)', lineHeight: 1.3 }}>
                    チャンネル登録・高評価
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', opacity: 0.92 }}>
                    よろしくお願いします！
                  </div>
                  <div style={{ fontSize: 22, color: '#aac4ff', marginTop: 8 }}>
                    毎日更新中
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#aac4ff', letterSpacing: 2, textTransform: 'uppercase' }}>
                    ゆっくり解説
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
                    {title}
                  </div>
                </>
              )}
            </div>

            {/* 話者B large */}
            <CharacterFace character="B" isSpeaking={speakingB} side="right" size={CHAR_SIZE_YOUTUBE * characterScale} imageClose={charB.imageClose || undefined} imageOpen={charB.imageOpen} />
          </div>

          {/* Bottom subtitle bar */}
          <div
            style={{
              height: BOTTOM_H,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 32px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                color: '#fff',
                width: '100%',
                fontSize: subtitleIsMultiLine ? 28 : 34,
                fontWeight: 600,
                lineHeight: 1.5,
                textAlign: subtitleIsMultiLine ? 'left' : 'center',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              {showSubtitles ? subtitle : ''}
            </div>
          </div>

          {/* Speaker name badge */}
          {currentSeg && (
            <div
              style={{
                position: 'absolute',
                bottom: BOTTOM_H - 2,
                left: currentSeg.speaker === 'A' ? 8 : undefined,
                right: currentSeg.speaker === 'B' ? 8 : undefined,
                background: colorFor(currentSeg.speaker),
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              {nameFor(currentSeg.speaker)}
            </div>
          )}
        </AbsoluteFill>
      ) : (
        /* ── 通常画面 ── */
        <AbsoluteFill style={{ background: '#f0f2f5' }}>
          {/* Title bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1280,
              height: TITLE_H,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              {title}
            </span>
          </div>

          {/* Markdown / Slide panel */}
          <div style={{ position: 'absolute', top: TITLE_H, left: 0, width: 1280 }}>
            {slideMode && slides && slides.length > 0 ? (
              <SlidePanel slides={slides} currentIndex={currentSlideIndex} />
            ) : (
              <MarkdownPanel
                markdown={markdown}
                currentSegmentIndex={segIdx}
                totalSegments={segments.length}
                currentSectionName={currentSectionName}
                sectionStartIndex={sectionStartIndex}
                sectionEndIndex={sectionEndIndex}
                scrollOffsetPx={scrollOffsetPx}
              />
            )}
          </div>

          {/* Characters – anchored to outer edges */}
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <CharacterFace character="A" isSpeaking={speakingA} side="left" size={CHAR_SIZE_NORMAL * characterScale} imageClose={charA.imageClose || undefined} imageOpen={charA.imageOpen} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <CharacterFace character="B" isSpeaking={speakingB} side="right" size={CHAR_SIZE_NORMAL * characterScale} imageClose={charB.imageClose || undefined} imageOpen={charB.imageOpen} />
          </div>

          {/* Subtitle – centered between characters with a background that keeps it legible over slides. */}
          {showSubtitles && <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: SUBTITLE_LEFT_INSET,
              right: SUBTITLE_RIGHT_INSET,
              textAlign: subtitleIsMultiLine ? 'left' : 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'transparent',
                borderRadius: 12,
                padding: '4px 20px',
                color: '#fff',
                fontSize: subtitleIsMultiLine ? 28 : 34,
                fontWeight: 700,
                lineHeight: 1.5,
                textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.9)',
              }}
            >
              {subtitle}
            </span>
          </div>}

          {/* Speaker name badge */}
          {currentSeg && (
            <div
              style={{
                position: 'absolute',
                bottom: BOTTOM_H - 2,
                left: currentSeg.speaker === 'A' ? 4 : undefined,
                right: currentSeg.speaker === 'B' ? 4 : undefined,
                background: colorFor(currentSeg.speaker),
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              {nameFor(currentSeg.speaker)}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
