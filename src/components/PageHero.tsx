import Link from "next/link";

export function PageHero({ title, eyebrow, text }: { title: string; eyebrow: string; text: string }) {
  return (
    <section className="pc-inner-hero">
      <div className="pc-inner-pattern" aria-hidden="true" />
      <div className="pc-inner-orb pc-inner-orb-one" aria-hidden="true" />
      <div className="pc-inner-orb pc-inner-orb-two" aria-hidden="true" />
      <div className="container pc-inner-hero-content">
        <span className="pc-kicker pc-kicker-light">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="pc-inner-breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
      </div>
    </section>
  );
}
