import Image from "next/image";
import Link from "next/link";
import type { Doctor } from "@/types/site";
export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return <article className="doctor-card"><Link href={`/doctors/${doctor.slug}`} className="doctor-image"><Image src={doctor.image} alt={doctor.name} fill sizes="(max-width: 760px) 100vw, 25vw"/></Link><div className="doctor-info"><span>{doctor.role}</span><h3><Link href={`/doctors/${doctor.slug}`}>{doctor.name}</Link></h3><p>{doctor.qualification}</p></div></article>;
}
