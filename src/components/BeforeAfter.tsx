"use client";
import Image from "next/image";
import { useState } from "react";
export function BeforeAfter() {
  const [value, setValue] = useState(52);
  return <div className="before-after"><Image src="/images/transformation-after.svg" alt="Smile after treatment" fill sizes="100vw"/><div className="before-layer" style={{ width: `${value}%` }}><Image src="/images/transformation-before.svg" alt="Smile before treatment" fill sizes="100vw"/></div><div className="before-label">Before</div><div className="after-label">After</div><div className="slider-line" style={{ left: `${value}%` }}><span>↔</span></div><input aria-label="Compare before and after" type="range" min="8" max="92" value={value} onChange={e => setValue(Number(e.target.value))}/></div>;
}
