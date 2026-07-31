"use client";
import { useEffect, useRef } from "react";

export function MathContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    type MJ = {
      typesetPromise?: (els: Element[]) => Promise<void>;
      startup?: { promise?: Promise<void> };
    };
    const win = window as unknown as { MathJax?: MJ };
    const mj = win.MathJax;
    if (!mj?.typesetPromise) return;
    const el = ref.current;
    const run = () => mj.typesetPromise!([el]).catch(console.error);
    if (mj.startup?.promise) {
      mj.startup.promise.then(run);
    } else {
      run();
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className="slide-content"
      style={{ marginTop: 8, padding: 16, background: "var(--surface2)", borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
