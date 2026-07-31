export interface Segment {
  id: number;
  speaker: 'A' | 'B';
  text: string;
  section: 'opening' | 'main' | 'ending';
  sectionName: string;  // 実際の ## ヘッダー名（スクロール同期用）
  startFrame: number;
  endFrame: number;
  audioFile: string;
  slideIndex?: number;  // slideMode 時に表示するスライド番号
}

export interface Slide {
  index: number;
  title: string;
  content: string;
}

export interface CharacterConfig {
  name: string;          // 字幕バッジに表示する話者名
  color: string;         // バッジ背景色
  imageClose: string;    // public/ 内のファイル名（口閉じ / 通常）
  imageOpen?: string;    // 口開き（省略時は imageClose を使い、発話中はグロー演出のみ）
}

export interface TimingData {
  title: string;
  markdown: string;
  fps: number;
  totalFrames: number;
  youtubeScreens: boolean;
  segments: Segment[];
  // slideMode: true のとき MarkdownPanel の代わりに SlidePanel を使用
  slideMode?: boolean;
  slides?: Slide[];
  // 省略時は従来どおり ずんだもん(A)/四国めたん(B) を使用（後方互換）
  characters?: { A: CharacterConfig; B: CharacterConfig };
}
