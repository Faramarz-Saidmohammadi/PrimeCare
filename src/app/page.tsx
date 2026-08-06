import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { Testimonials } from "@/components/Testimonials";
import { faqs } from "@/data/site";
import { getPosts, getServices } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";

const images = {
  hero: "https://images.pexels.com/photos/5622000/pexels-photo-5622000.jpeg?auto=compress&dpr=1&h=1000&w=1600",
  titleOne: "https://images.pexels.com/photos/3845723/pexels-photo-3845723.jpeg?auto=compress&dpr=1&h=500&w=800",
  titleTwo: "https://images.pexels.com/photos/6812556/pexels-photo-6812556.jpeg?auto=compress&dpr=1&h=500&w=800",
  about: "https://images.pexels.com/photos/3845723/pexels-photo-3845723.jpeg?auto=compress&dpr=1&h=1000&w=1200",
  serviceOne: "https://images.pexels.com/photos/5622234/pexels-photo-5622234.jpeg?auto=compress&dpr=1&h=900&w=1200",
  serviceTwo: "https://images.pexels.com/photos/6812558/pexels-photo-6812558.jpeg?auto=compress&dpr=1&h=900&w=1200",
  serviceThree: "https://images.pexels.com/photos/19976592/pexels-photo-19976592.jpeg?auto=compress&dpr=1&h=900&w=1200",
  expertiseOne: "https://images.pexels.com/photos/7803051/pexels-photo-7803051.jpeg?auto=compress&dpr=1&h=1000&w=1200",
  expertiseTwo: "https://images.pexels.com/photos/5355926/pexels-photo-5355926.jpeg?auto=compress&dpr=1&h=1000&w=1200",
  doctor: "https://images.pexels.com/photos/19976583/pexels-photo-19976583.jpeg?auto=compress&dpr=1&h=1100&w=900",
  processOne: "https://images.pexels.com/photos/19976602/pexels-photo-19976602.jpeg?auto=compress&dpr=1&h=800&w=1000",
  processTwo: "https://images.pexels.com/photos/6812556/pexels-photo-6812556.jpeg?auto=compress&dpr=1&h=800&w=1000",
  processThree: "https://images.pexels.com/photos/5622000/pexels-photo-5622000.jpeg?auto=compress&dpr=1&h=800&w=1000",
  transformOne: "https://images.pexels.com/photos/5355926/pexels-photo-5355926.jpeg?auto=compress&dpr=1&h=900&w=1200",
  transformTwo: "https://images.pexels.com/photos/19976583/pexels-photo-19976583.jpeg?auto=compress&dpr=1&h=900&w=1200",
  faq: "https://images.pexels.com/photos/6812558/pexels-photo-6812558.jpeg?auto=compress&dpr=1&h=1000&w=900",
};

const servicePhotos = [images.serviceOne, images.serviceTwo, images.serviceThree];

export default async function HomePage() {
  const [services, posts, settings] = await Promise.all([getServices(), getPosts(), getSiteSettings()]);

  return (
    <>
      <section className="pc-hero">
        <div className="pc-hero-pattern" aria-hidden="true" />
        <div className="container pc-hero-inner">
          <Reveal className="pc-hero-title-wrap" direction="zoom">
            <h1 className="pc-hero-title">
              Your smile
              <span className="pc-inline-photo"><Image src={images.titleOne} alt="Modern dental clinic" fill priority sizes="150px" /></span>
              matters expert dental care
              <span className="pc-inline-photo pc-inline-photo-wide"><Image src={images.titleTwo} alt="Dentist caring for a patient" fill priority sizes="190px" /></span>
              a bright tomorrow
            </h1>
          </Reveal>

          <div className="pc-hero-support-row">
            <Reveal className="pc-hero-intro" delay={120}>
              <p>Experience top-quality dental care focused on your smile&apos;s health and beauty. Trust us to create a brighter, healthier tomorrow.</p>
              <div className="pc-hero-actions">
                <Link className="pc-btn pc-btn-light" href="/appointment">Book Now <Icon name="arrow" size={18}/></Link>
                <Link className="pc-circle-link" href="/contact" aria-label="Enquiries"><Icon name="arrow" size={22}/></Link>
                <span>Enquiries</span>
              </div>
            </Reveal>

            <Reveal className="pc-hero-stats" delay={220} direction="right">
              <div><strong>0<em>7</em></strong><span>Emergency Service</span></div>
              <div><strong><AnimatedCounter value={8} suffix="k" /></strong><span>Recovered Patients</span></div>
              <div><strong><AnimatedCounter value={15} suffix="+" /></strong><span>Market Experience</span></div>
            </Reveal>
          </div>

          <Reveal className="pc-hero-media" delay={280} direction="zoom">
            <Image src={images.hero} alt="Dentist providing professional dental care" fill priority sizes="(max-width: 900px) 100vw, 1200px" />
            <div className="pc-rating-card">
              <div className="pc-stars">★★★★★</div>
              <strong>Best Service &amp; 5 Star</strong>
              <span>Hospital are crucial institutions in our society</span>
            </div>
            <div className="pc-hero-play" aria-hidden="true"><span>▶</span></div>
          </Reveal>
        </div>
      </section>

      <section className="pc-contact-strip">
        <div className="container pc-contact-strip-grid">
          <Reveal delay={40}><div className="pc-strip-item"><span><Icon name="phone"/></span><div><small>Need Dental Services?</small><strong>{settings.phone}</strong></div></div></Reveal>
          <Reveal delay={120}><div className="pc-strip-item"><span><Icon name="clock"/></span><div><small>Opening Hours</small><strong>Mon to Sat 9:00AM to 9:00PM</strong></div></div></Reveal>
          <Reveal delay={200}><div className="pc-strip-item pc-strip-action"><div><small>Ready for a healthier smile?</small><strong>Make An Appointment</strong></div><Link href="/appointment"><Icon name="arrow"/></Link></div></Reveal>
        </div>
      </section>

      <section className="pc-section pc-about">
        <div className="container pc-about-grid">
          <Reveal className="pc-about-media" direction="left">
            <div className="pc-about-photo"><Image src={images.about} alt="PrimeCare dental clinic interior" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
            <div className="pc-experience-badge"><strong><AnimatedCounter value={25} suffix="+" /></strong><span>experience in medical services</span></div>
            <div className="pc-founder-card"><div className="pc-founder-avatar">DR</div><div><strong>Dianne Russell</strong><span>Co founder</span></div></div>
          </Reveal>
          <Reveal className="pc-about-copy" direction="right">
            <span className="pc-kicker">About Us</span>
            <h2>Commitment to your smile&apos;s health and beauty</h2>
            <p>The goal of our clinic is to provide friendly, caring dentistry and the highest level of general, cosmetic, and specialist dental treatments. With dental practices throughout the world.</p>
            <div className="pc-progress-row">
              <div className="pc-circle-progress" style={{ "--value": "92%" } as CSSProperties}><span>92%</span></div>
              <strong>Invisalign Treatment Complete</strong>
            </div>
            <div className="pc-progress-row">
              <div className="pc-circle-progress" style={{ "--value": "98%" } as CSSProperties}><span>98%</span></div>
              <strong>Patient Satisfaction Rate</strong>
            </div>
            <Link className="pc-btn" href="/about">More About <Icon name="arrow" size={18}/></Link>
          </Reveal>
        </div>
      </section>

      <section className="pc-section pc-services-section">
        <div className="container">
          <div className="pc-heading-row">
            <Reveal>
              <span className="pc-kicker">Our Services</span>
              <h2>Comprehensive dental care tailored services for every smile</h2>
            </Reveal>
            <Reveal delay={160} direction="right"><Link className="pc-btn pc-btn-outline" href="/services">All Services <Icon name="arrow" size={18}/></Link></Reveal>
          </div>
          <div className="pc-service-grid">
            {services.slice(0, 3).map((service, index) => (
              <Reveal key={service.slug} delay={index * 120}>
                <article className="pc-service-card">
                  <Link href={`/services/${service.slug}`} className="pc-service-photo">
                    <Image src={servicePhotos[index]} alt={service.title} fill sizes="(max-width: 800px) 100vw, 33vw" />
                    <span className="pc-service-index">0{index + 1}</span>
                  </Link>
                  <div className="pc-service-content">
                    <div className="pc-service-icon"><Icon name={index === 1 ? "sparkle" : "tooth"} size={28}/></div>
                    <h3><Link href={`/services/${service.slug}`}>{service.title}</Link></h3>
                    <p>We are excited to meet you and provide the best dental care for your family.</p>
                    <Link href={`/services/${service.slug}`} className="pc-read-link">Learn More <Icon name="arrow" size={17}/></Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pc-section pc-expertise">
        <div className="container pc-expertise-grid">
          <Reveal className="pc-expertise-copy" direction="left">
            <span className="pc-kicker pc-kicker-light">Expertise</span>
            <h2>Commitment to your oral health and smile aesthetics</h2>
            <p>A specialist doctor is available for any need. We are available in 150+ locations with modern facilities and experienced doctors.</p>
            <div className="pc-expertise-list">
              <div><span>01</span><div><strong>The needs of our patients always come first</strong><p>Every treatment plan begins with your goals, comfort and long-term oral health.</p></div></div>
              <div><span>02</span><div><strong>Modern facilities and experienced doctors</strong><p>Advanced diagnostics support precise, predictable and comfortable care.</p></div></div>
            </div>
          </Reveal>
          <div className="pc-expertise-collage">
            <Reveal className="pc-expertise-photo pc-expertise-photo-one" direction="zoom"><Image src={images.expertiseOne} alt="Dentist discussing treatment" fill sizes="40vw" /></Reveal>
            <Reveal className="pc-expertise-photo pc-expertise-photo-two" delay={180} direction="zoom"><Image src={images.expertiseTwo} alt="Dental team in treatment room" fill sizes="36vw" /></Reveal>
            <div className="pc-expert-count"><strong><AnimatedCounter value={18} suffix="+" /></strong><span>Expert Doctor</span></div>
          </div>
        </div>
      </section>

      <section className="pc-section pc-why">
        <div className="container">
          <Reveal className="pc-centered-heading">
            <span className="pc-kicker">Why Choose Us</span>
            <h2>Excellence results you can trust</h2>
            <p>Accurate diagnosis of dental diseases ensures effective treatment plans, helping to maintain oral health and prevent further complications.</p>
          </Reveal>
          <div className="pc-why-layout">
            <div className="pc-why-list pc-why-list-left">
              <Reveal direction="left"><div className="pc-why-card"><span><Icon name="phone"/></span><div><h3>Emergency Services</h3><p>The goal of our clinic is to provide friendly, caring dentistry.</p></div></div></Reveal>
              <Reveal delay={120} direction="left"><div className="pc-why-card"><span><Icon name="sparkle"/></span><div><h3>Positive Patient Reviews</h3><p>Patients value our clear communication and careful treatment.</p></div></div></Reveal>
            </div>
            <Reveal className="pc-doctor-cutout" direction="zoom"><Image src={images.doctor} alt="Experienced dental professional" fill sizes="(max-width: 900px) 80vw, 32vw" /></Reveal>
            <div className="pc-why-list">
              <Reveal direction="right"><div className="pc-why-card"><span><Icon name="tooth"/></span><div><h3>Experienced Professionals</h3><p>Skilled clinicians provide coordinated care for every patient.</p></div></div></Reveal>
              <Reveal delay={120} direction="right"><div className="pc-why-card"><span><Icon name="check"/></span><div><h3>Modern Technology</h3><p>Digital equipment supports safer and more accurate decisions.</p></div></div></Reveal>
            </div>
          </div>
          <div className="pc-centered-action"><Link className="pc-btn" href="/contact">Contact Us <Icon name="arrow" size={18}/></Link></div>
        </div>
      </section>

      <section className="pc-section pc-process">
        <div className="container">
          <Reveal className="pc-centered-heading">
            <span className="pc-kicker">How It Work</span>
            <h2>Understanding the patient journey</h2>
          </Reveal>
          <div className="pc-process-grid">
            {[images.processOne, images.processTwo, images.processThree].map((src, index) => (
              <Reveal key={src} delay={index * 130}>
                <article className="pc-process-card">
                  <div className="pc-process-photo"><Image src={src} alt="Dental care process" fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
                  <div><span>0{index + 1}</span><h3>{["Initial Consultation", "Treatment By Experts", "Follow-Up Care"][index]}</h3><p>{["We listen to your concerns, assess your oral health and clarify your goals.", "Our experienced team performs treatment using a precise clinical plan.", "We monitor healing, progress and long-term maintenance after treatment."][index]}</p></div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="pc-process-faq"><FaqAccordion items={faqs.slice(0, 3)}/></div>
        </div>
      </section>

      <section className="pc-section pc-testimonials">
        <div className="container pc-testimonial-grid">
          <Reveal direction="left">
            <span className="pc-kicker pc-kicker-light">Testimonial</span>
            <h2>Real stories of exceptional care and transformative smiles</h2>
            <Link className="pc-btn pc-btn-light" href="/contact">Contact Us Now <Icon name="arrow" size={18}/></Link>
          </Reveal>
          <Reveal delay={160} direction="right"><Testimonials/></Reveal>
        </div>
      </section>

      <section className="pc-section pc-transform">
        <div className="container">
          <div className="pc-heading-row">
            <Reveal><span className="pc-kicker">See The Transformation</span><h2>Stunning results that showcase the life changing impact</h2></Reveal>
            <Reveal delay={140} direction="right"><Link className="pc-btn pc-btn-outline" href="/gallery">Contact Now <Icon name="arrow" size={18}/></Link></Reveal>
          </div>
          <div className="pc-transform-grid">
            <Reveal className="pc-transform-card pc-transform-large" direction="zoom"><Image src={images.transformOne} alt="Smiling dental patient" fill sizes="60vw" /><span>Smile Makeover</span></Reveal>
            <Reveal className="pc-transform-card" delay={100} direction="zoom"><Image src={images.transformTwo} alt="Dental care result" fill sizes="35vw" /><span>Cosmetic Care</span></Reveal>
            <Reveal className="pc-transform-card" delay={180} direction="zoom"><Image src={images.serviceTwo} alt="Professional dental treatment" fill sizes="35vw" /><span>Restorative Care</span></Reveal>
          </div>
        </div>
      </section>

      <section className="pc-section pc-faq-section">
        <div className="container pc-faq-grid">
          <Reveal className="pc-faq-media" direction="left">
            <Image src={images.faq} alt="Dentist performing a careful examination" fill sizes="(max-width: 900px) 100vw, 45vw" />
            <div className="pc-emergency-bubble"><span>We always take care of your smile</span><strong>24/7 Emergency</strong><a href={`tel:${settings.emergency}`}>{settings.emergency}</a></div>
          </Reveal>
          <Reveal direction="right">
            <span className="pc-kicker">Faqs</span>
            <h2>Everything you need to know about dental care</h2>
            <p>Find quick answers to common questions about our dental services, procedures, and patient care in our FAQ section.</p>
            <FaqAccordion items={faqs}/>
          </Reveal>
        </div>
      </section>

      <section className="pc-section pc-news">
        <div className="container">
          <div className="pc-heading-row">
            <Reveal><span className="pc-kicker">Latest News</span><h2>Latest dental news insights and oral health advice</h2></Reveal>
            <Reveal delay={120} direction="right"><Link className="pc-btn pc-btn-outline" href="/blog">View All Post <Icon name="arrow" size={18}/></Link></Reveal>
          </div>
          <div className="pc-news-grid">
            {posts.slice(0, 2).map((post, index) => (
              <Reveal key={post.slug} delay={index * 120}>
                <article className="pc-news-card">
                  <Link href={`/blog/${post.slug}`} className="pc-news-photo"><Image src={index === 0 ? images.serviceOne : images.serviceThree} alt={post.title} fill sizes="(max-width: 800px) 100vw, 50vw" /></Link>
                  <div><span>{post.category} · {post.date}</span><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className="pc-read-link" href={`/blog/${post.slug}`}>Learn More <Icon name="arrow" size={17}/></Link></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pc-section pc-booking">
        <div className="container pc-booking-grid">
          <Reveal className="pc-booking-copy" direction="left">
            <span className="pc-kicker pc-kicker-light">Book Your Appointment</span>
            <h2>Book your dental visit online with PrimeCare</h2>
            <p>Ready to take the next step towards a healthier smile? Use our easy online booking system to schedule your dental appointment.</p>
            <div className="pc-working-hours"><h3>Working Hours</h3>{settings.hours.map((hour) => <span key={hour}><Icon name="clock" size={18}/>{hour}</span>)}</div>
            <div className="pc-booking-emergency"><Icon name="phone"/><div><span>24/7 Emergency</span><strong>{settings.emergency}</strong></div></div>
          </Reveal>
          <Reveal className="pc-booking-form" delay={150} direction="right">
            <p>Fill out the form below to request your dental appointment. We&apos;ll confirm your time and send you a reminder.</p>
            <AppointmentForm compact/>
          </Reveal>
        </div>
      </section>
    </>
  );
}
