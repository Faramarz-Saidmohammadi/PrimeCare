"use client";
import { useState } from "react";
import type { Faq } from "@/types/site";
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{items.map((item,i) => <div className={`faq-item ${open === i ? "open" : ""}`} key={item.question}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{item.question}</span><b>{open === i ? "−" : "+"}</b></button><div className="faq-answer"><p>{item.answer}</p></div></div>)}</div>;
}
