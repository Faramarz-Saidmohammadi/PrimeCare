import { DoctorCard } from "@/components/DoctorCard";
import { PageHero } from "@/components/PageHero";
import { getDoctors } from "@/lib/content";
export const metadata={title:"Our Doctors"};
export default async function DoctorsPage(){const doctors=await getDoctors();return <><PageHero eyebrow="Clinical team" title="Experienced professionals committed to your care" text="Meet the dentists and specialists responsible for diagnosis, treatment planning, and follow-up at PrimeCare."/><section className="section"><div className="container doctor-grid">{doctors.map(d=><DoctorCard doctor={d} key={d.slug}/>)}</div></section><section className="section section-muted"><div className="container"><div className="team-note"><h2>Coordinated multidisciplinary care</h2><p>When a patient needs input from more than one discipline, our clinicians review records together and agree on sequencing before treatment proceeds.</p></div></div></section></>}
