"use client";

import { useEffect, useState } from "react";

export function SiteEffects() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 520);

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(nextProgress);
      setShowTop(window.scrollY > 700);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <div className={`site-loader ${loaded ? "is-hidden" : ""}`} aria-hidden="true">
        <div className="loader-tooth">P</div>
        <span>PrimeCare</span>
      </div>
      <button
        type="button"
        className={`scroll-top ${showTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </>
  );
}
