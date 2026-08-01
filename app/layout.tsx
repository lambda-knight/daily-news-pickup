import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "daily-news-pickup | 毎日のニュース解説",
  description: "世界・国内・文化・テクノロジーのニュースをずんだもん＋四国めたんが解説",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-EJ7YLQX7PS" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-EJ7YLQX7PS');`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']],processEscapes:true}};`,
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async />
      </head>
      <body>
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px", borderRadius: 4, background: "var(--accent)", color: "#fff" }}>
              daily-news-pickup
            </span>
            <a href="/" style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
              毎日のニュース解説
            </a>
          </div>
        </header>

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
          {children}
        </main>

        <footer style={{ borderTop: "1px solid var(--border)", marginTop: 64, padding: "24px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
            <p>
              音声合成:{" "}
              <a href="https://voicevox.hiroshiba.jp/" target="_blank" rel="noopener">VOICEVOX</a>
              {" "}／ キャラクター: ずんだもん（© VOICEVOX）・四国めたん（© VOICEVOX）
            </p>
            <p style={{ marginTop: 4 }}>
              VOICEVOX{" "}
              <a href="https://github.com/VOICEVOX/voicevox/blob/main/LICENSE" target="_blank" rel="noopener">LICENSE</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
