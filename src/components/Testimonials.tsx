"use client";
import Image from "next/image";
import { useState } from "react";
import { testimonials } from "@/data/site";
import { Icon } from "@/components/Icon";
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const item = testimonials[index];
  return <div className="testimonial-card"><Icon name="quote" size={48}/><blockquote>{item.quote}</blockquote><div className="testimonial-person"><Image src={item.image} alt={item.name} width={58} height={58}/><div><strong>{item.name}</strong><span>{item.role}</span></div></div><div className="slider-controls"><button onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial">←</button><span>{String(index+1).padStart(2,"0")} / {String(testimonials.length).padStart(2,"0")}</span><button onClick={() => setIndex((index + 1) % testimonials.length)} aria-label="Next testimonial">→</button></div></div>;
}
