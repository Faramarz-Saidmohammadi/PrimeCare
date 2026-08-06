import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { getServices } from "@/lib/content";
export const metadata={title:"Dental Services"};
export default async function ServicesPage(){const services=await getServices();return <><PageHero eyebrow="Our services" title="Complete dental care in one clinic" text="From prevention and routine care to complex restoration, cosmetic dentistry, orthodontics, children’s care, and emergencies."/><section className="section section-muted"><div className="container service-grid full">{services.map(s=><ServiceCard service={s} key={s.slug}/>)}</div></section></>}
