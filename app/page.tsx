import episodesData from "@/data/episodes.json";
import type { Episode } from "@/types/episode";
import Link from "next/link";

const episodes = episodesData as Episode[];

const MODE_BADGE: Record<string, string> = {
  ai: "AI",
  compare: "世界7カ国",
  domestic: "国内8紙",
  intl_jp: "海外×日本",
  weird: "珍ニュース",
  security: "セキュリティ",
  spain: "スペイン",
  world_jp: "世界から見た日本",
};

export default function IndexPage() {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
          <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>日付</th>
          <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>コンテンツ</th>
        </tr>
      </thead>
      <tbody>
        {episodes.map((ep) => (
          <tr key={ep.date} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
              <Link href={`/episodes/${ep.date}/`} style={{ color: "var(--accent2)", fontWeight: 500, fontSize: 14 }}>
                {ep.date}
              </Link>
            </td>
            <td style={{ padding: "14px 12px" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ep.segments.map((seg) => (
                  <span key={seg.mode} style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 4,
                    background: seg.videoUrl ? "var(--accent)" : "var(--surface2)",
                    color: seg.videoUrl ? "#fff" : "var(--muted)",
                  }}>
                    {MODE_BADGE[seg.mode] ?? seg.mode}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
