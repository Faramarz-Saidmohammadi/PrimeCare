"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="not-found"><div><span>!</span><h1>Something went wrong</h1><p>The page could not be loaded. Check your connection and try again.</p><button className="button" onClick={reset}>Try again</button></div></section>;
}
