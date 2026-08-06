import Image from "next/image";
import { BeforeAfter } from "@/components/BeforeAfter";
import { PageHero } from "@/components/PageHero";
const images=["gallery-1.svg","gallery-2.svg","gallery-3.svg","gallery-4.svg","gallery-5.svg","gallery-6.svg"];
export const metadata={title:"Smile Gallery"};
export default function GalleryPage(){return <><PageHero eyebrow="Smile gallery" title="Carefully planned transformations" text="Representative examples of restorative, cosmetic, and orthodontic outcomes. Individual results vary by diagnosis and treatment plan."/><section className="section section-muted"><div className="container"><BeforeAfter/><div className="gallery-grid">{images.map((img,i)=><div className={`gallery-item ${i===0||i===5?"wide":""}`} key={img}><Image src={`/images/${img}`} alt={`Dental treatment result ${i+1}`} fill sizes="(max-width:760px) 100vw, 33vw"/></div>)}</div></div></section></>}
