import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Service } from "@/types/site";
export function ServiceCard({ service }: { service: Service }) {
  return <article className="service-card"><div className="service-image"><Image src={service.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw"/></div><div className="service-body"><span className="service-number">0{Math.max(1, service.title.length % 7)}</span><h3>{service.title}</h3><p>{service.excerpt}</p><Link href={`/services/${service.slug}`}>Explore service <Icon name="arrow" size={18}/></Link></div></article>;
}
