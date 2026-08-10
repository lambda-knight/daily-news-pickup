import React from "react";

type Props = {
  text: string;
  progress: number;
  enabled: boolean;
};

export const KaraokeSubtitle: React.FC<Props> = ({text, progress, enabled}) => {
  const visibleChars = Math.round(Math.max(0, Math.min(1, progress / 0.92)) * text.length);
  return <div className={`karaoke-subtitle${text.length > 28 ? " multiline" : ""}`}>
    {[...text].map((char, index) => <i key={index} className={enabled && index < visibleChars ? "read" : ""}>{char}</i>)}
  </div>;
};
