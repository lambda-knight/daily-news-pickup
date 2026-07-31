import episodesData from "@/data/episodes.json";
import type { Episode } from "@/types/episode";
import { MathContent } from "./MathContent";
import { AnimatedEpisode } from "./AnimatedEpisode";

const episodes = episodesData as Episode[];

export function generateStaticParams() {
  return episodes.map((ep) => ({ date: ep.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return { title: `${date} のニュース` };
}

const MODE_LABEL: Record<string, string> = {
  ai: "生成AI ニュース",
  compare: "7カ国メディア比較",
  domestic: "国内8紙比較",
  intl_jp: "海外ニュースと日本報道",
  weird: "世界の珍ニュース",
  security: "セキュリティニュース",
  spain: "スペインニュース",
  world_jp: "世界から見た日本",
};

export default async function EpisodePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const episode = episodes.find((ep) => ep.date === date);
  if (!episode) return <p style={{ color: "var(--muted)" }}>エピソードが見つかりません</p>;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 32, color: "var(--text)" }}>
        {date}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {episode.segments.map((seg) => (
          <section key={seg.mode}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--accent2)" }}>
              {MODE_LABEL[seg.mode] ?? seg.label}
            </h3>
            {seg.videoUrl && (
              <video controls style={{ width: "100%" }} src={seg.videoUrl} />
            )}
          {seg.audioUrl && seg.timeline ? (
              <AnimatedEpisode
                date={date}
                audioUrl={seg.audioUrl}
                title={seg.title ?? MODE_LABEL[seg.mode] ?? seg.label}
                mode={seg.mode}
                markdownSource={seg.markdownSource}
                timeline={seg.timeline}
              />
            ) : seg.audioUrl && (
              <audio controls style={{ width: "100%", marginTop: seg.videoUrl ? 8 : 0 }} src={seg.audioUrl} />
            )}
            {seg.papers && seg.papers.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary>参考論文（{seg.papers.length}本）</summary>
                <ol style={{ margin: "8px 0 0 1.2em", lineHeight: 2, fontSize: 13 }}>
                  {seg.papers.map((p) => (
                    <li key={p.url}>
                      <a href={p.url} target="_blank" rel="noopener">{p.title}</a>
                      <span style={{ marginLeft: 8, color: "var(--muted)", fontSize: 11 }}>
                        {p.url.replace("https://arxiv.org/abs/", "arXiv:")}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            {seg.markdown && (
              <details style={{ marginTop: 12 }}>
                <summary>スライド（クリックで展開）</summary>
                <MathContent html={seg.markdown} />
              </details>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
