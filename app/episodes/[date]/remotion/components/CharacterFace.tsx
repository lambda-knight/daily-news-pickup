import React from 'react';
import { useCurrentFrame, Img } from 'remotion';

const ASSET_ROOT = 'https://lambda-knight.github.io/ai-qc-news';

interface Props {
  character: 'A' | 'B';
  isSpeaking: boolean;
  side: 'left' | 'right';
  size?: number;
  imageClose?: string;   // カスタム立ち絵（指定時は従来のずんだもん/四国めたんより優先）
  imageOpen?: string;    // 口開き画像（省略時は imageClose を使い回す）
}

const DEFAULT_SIZE = 130;
const LIP_HZ = 8;

export const CharacterFace: React.FC<Props> = ({
  character, isSpeaking, side, size = DEFAULT_SIZE, imageClose, imageOpen,
}) => {
  const frame = useCurrentFrame();

  const isZundamon = character === 'A';
  const mouthOpen = isSpeaking && Math.floor(frame / (30 / LIP_HZ)) % 2 === 0;

  // カスタム立ち絵が指定されていればそれを使う（口パクは open/close 画像で表現）
  const custom = !!imageClose;
  const imgSrc = custom
    ? `${ASSET_ROOT}/${mouthOpen ? (imageOpen ?? imageClose!) : imageClose!}`
    : isZundamon
      ? `${ASSET_ROOT}/${mouthOpen ? 'zundamon_open.png' : 'zundamon_close.png'}`
      : `${ASSET_ROOT}/${mouthOpen ? 'metan_open.png' : 'metan.png'}`;

  // ── アニメ的な動き ───────────────────────────────────────
  const t = frame / 30; // 秒
  // 呼吸（常時・ごく僅かに上下に伸縮）
  const breathe = 1 + 0.014 * Math.sin(t * Math.PI * 2 * 0.22);
  // 上下の弾み（話している間は大きく、待機中も僅かに揺れる）
  const bounce = isSpeaking
    ? Math.sin(t * Math.PI * 4) * 5
    : Math.sin(t * Math.PI * 2 * 0.22) * 1.6;
  // 体の揺れ（話している間は左右にリズミカルに、待機中はゆっくり）
  const sway = isSpeaking
    ? Math.sin(t * Math.PI * 2 * 1.2) * 1.4
    : Math.sin(t * Math.PI * 2 * 0.15) * 0.5;
  // 口パク squash（口開き画像が無い立ち絵向け: 縦に僅かに潰して喋り感を出す）
  const needsSquash = (custom && !imageOpen) || (!custom && !isZundamon);
  const talkSquash = isSpeaking && needsSquash && mouthOpen ? 0.978 : 1.0;
  // まばたき（約3.2秒ごとに一瞬だけ縦に潰す）
  const blinkPhase = t % 3.2;
  const blink = blinkPhase < 0.12 ? 0.9 : 1.0;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        transformOrigin: 'bottom center',
        transform:
          `translateY(${bounce}px) rotate(${sway}deg) ` +
          `scale(${breathe}) scaleY(${talkSquash * blink})`,
        filter: isSpeaking ? 'drop-shadow(0 0 8px rgba(255,255,200,0.8))' : 'none',
      }}
    >
      <Img
        src={imgSrc}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
    </div>
  );
};
