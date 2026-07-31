export interface Paper {
  url: string;
  title: string;
}

export interface TimelineCue {
  speaker: "A" | "B";
  text: string;
  section: string;
  startFrame: number;
  endFrame: number;
}

export interface EpisodeTimeline {
  fps: number;
  totalFrames: number;
  cues: TimelineCue[];
}

export interface Segment {
  mode: string;
  label: string;
  videoUrl?: string;
  audioUrl?: string;
  markdown?: string;
  markdownSource?: string;
  iaId: string;
  title?: string;
  papers?: Paper[];
  timeline?: EpisodeTimeline;
}

export interface Episode {
  date: string;
  segments: Segment[];
}
