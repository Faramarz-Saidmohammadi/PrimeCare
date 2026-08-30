import type { Doctor, Faq, Post, Service, Testimonial } from "@/types/site";

export const site = {
  name: "PrimeCare",
  phone: "+1 (789) 987-6450",
  email: "care@primecare.example",
  address: "145 Wellness Avenue, Springfield",
  emergency: "+1 (659) 989-6985",
  hours: ["Mon–Fri: 8:00 AM–7:00 PM", "Saturday: 9:00 AM–4:00 PM", "Sunday: Closed"]
};

export const services: Service[] = [
  {
    slug: "general-dentistry",
    title: "General Dentistry",
    shortTitle: "General Care",
    excerpt: "Preventive examinations, professional cleaning, fillings, and long-term oral-health planning.",
    description: "Our general dentistry programme focuses on early diagnosis, prevention, and practical treatment plans for every stage of life. Each visit combines a detailed examination with clear guidance and comfortable care.",
    image: "https://images.pexels.com/photos/5622234/pexels-photo-5622234.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "tooth",
    features: ["Comprehensive oral examination", "Digital diagnostics", "Professional cleaning", "Tooth-coloured fillings", "Personal prevention plan"]
  },
  {
    slug: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    shortTitle: "Cosmetic Care",
    excerpt: "Natural-looking whitening, bonding, veneers, and smile-design treatments tailored to your goals.",
    description: "Cosmetic treatment starts with facial balance, tooth health, and realistic expectations. We create conservative plans that improve colour, shape, proportion, and confidence while protecting healthy tooth structure.",
    image: "https://images.pexels.com/photos/6812558/pexels-photo-6812558.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "sparkle",
    features: ["Smile assessment", "Professional whitening", "Composite bonding", "Porcelain veneers", "Digital smile preview"]
  },
  {
    slug: "restorative-dentistry",
    title: "Restorative Dentistry",
    shortTitle: "Restorative Care",
    excerpt: "Durable crowns, bridges, dentures, and implant restorations that rebuild comfort and function.",
    description: "Restorative dentistry repairs damaged or missing teeth with materials selected for strength, appearance, and long-term function. We explain every option and phase treatment according to your priorities.",
    image: "https://images.pexels.com/photos/19976592/pexels-photo-19976592.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "shield",
    features: ["Ceramic crowns", "Dental bridges", "Implant restoration", "Partial and full dentures", "Bite rehabilitation"]
  },
  {
    slug: "orthodontics",
    title: "Orthodontics",
    shortTitle: "Orthodontics",
    excerpt: "Clear aligners and modern orthodontic planning for a healthier bite and more confident smile.",
    description: "Our orthodontic service uses digital records and staged planning to improve alignment and bite function. Treatment options are selected around your age, lifestyle, and clinical needs.",
    image: "https://images.pexels.com/photos/5355926/pexels-photo-5355926.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "align",
    features: ["Digital orthodontic records", "Clear aligner treatment", "Retainers", "Bite correction", "Progress monitoring"]
  },
  {
    slug: "paediatric-dentistry",
    title: "Paediatric Dentistry",
    shortTitle: "Children’s Care",
    excerpt: "Gentle, positive dental visits designed to protect children’s teeth and build lifelong healthy habits.",
    description: "Children need clinical care that is calm, age-appropriate, and preventive. Our team uses simple language, gradual familiarisation, and parent guidance to create safe dental experiences.",
    image: "https://images.pexels.com/photos/5622000/pexels-photo-5622000.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "heart",
    features: ["First dental visits", "Fluoride and sealants", "Growth monitoring", "Tooth-coloured restorations", "Parent education"]
  },
  {
    slug: "emergency-dentistry",
    title: "Emergency Dentistry",
    shortTitle: "Emergency Care",
    excerpt: "Prompt assessment and pain relief for dental injuries, swelling, broken teeth, and urgent concerns.",
    description: "Dental emergencies are assessed quickly to control pain, identify the cause, and prevent complications. Same-day availability depends on clinical urgency and appointment capacity.",
    image: "https://images.pexels.com/photos/19976602/pexels-photo-19976602.jpeg?auto=compress&dpr=1&h=900&w=1200",
    icon: "pulse",
    features: ["Urgent pain assessment", "Dental trauma care", "Temporary restoration", "Swelling and infection triage", "Same-day priority slots"]
  }
];

export const doctors: Doctor[] = [
  {
    slug: "general-dentistry-team",
    name: "General Dentistry Team",
    role: "Preventive and restorative care",
    qualification: "Clinician details verified by the deploying clinic",
    experience: "Clinic-provided profile required",
    image: "https://images.pexels.com/photos/31017709/pexels-photo-31017709.jpeg?auto=compress&dpr=1&h=1000&w=900",
    bio: "This role-based profile represents clinicians providing examinations, prevention, restorative treatment, and coordinated treatment planning. A real deployment must replace it with verified staff information.",
    specialties: ["Restorative dentistry", "Smile rehabilitation", "Complex treatment planning"]
  },
  {
    slug: "orthodontic-care-team",
    name: "Orthodontic Care Team",
    role: "Alignment and bite care",
    qualification: "Clinician details verified by the deploying clinic",
    experience: "Clinic-provided profile required",
    image: "https://images.pexels.com/photos/37458046/pexels-photo-37458046.jpeg?auto=compress&dpr=1&h=1000&w=900",
    bio: "This role-based profile represents clinicians responsible for orthodontic assessment, staged treatment, progress review, and retention planning. A real deployment must use verified staff information.",
    specialties: ["Clear aligners", "Adult orthodontics", "Retention planning"]
  },
  {
    slug: "cosmetic-care-team",
    name: "Cosmetic Care Team",
    role: "Conservative aesthetic care",
    qualification: "Clinician details verified by the deploying clinic",
    experience: "Clinic-provided profile required",
    image: "https://images.pexels.com/photos/37458356/pexels-photo-37458356.jpeg?auto=compress&dpr=1&h=1000&w=900",
    bio: "This role-based profile represents clinicians providing cosmetic assessment and conservative treatment planning. A real deployment must replace it with qualified, verified team members.",
    specialties: ["Composite bonding", "Whitening", "Porcelain veneers"]
  },
  {
    slug: "childrens-dentistry-team",
    name: "Children’s Dentistry Team",
    role: "Preventive care for children",
    qualification: "Clinician details verified by the deploying clinic",
    experience: "Clinic-provided profile required",
    image: "https://images.pexels.com/photos/14235194/pexels-photo-14235194.jpeg?auto=compress&dpr=1&h=1000&w=900",
    bio: "This role-based profile represents clinicians providing calm, age-appropriate preventive care and practical guidance for children and parents. A real deployment must use verified staff information.",
    specialties: ["Children’s dentistry", "Prevention", "Dental anxiety management"]
  }
];

export const posts: Post[] = [
  {
    slug: "essential-tips-for-a-healthy-smile",
    title: "Essential tips for a healthy smile",
    excerpt: "A practical daily routine can prevent most common dental problems and reduce the need for complex treatment.",
    content: [
      "Brush twice daily for two minutes using fluoride toothpaste. Angle the bristles toward the gumline and clean every surface without excessive pressure.",
      "Clean between the teeth once a day with floss or interdental brushes. These areas are commonly missed by a toothbrush and are frequent sites of gum inflammation.",
      "Limit frequent sugar exposure, drink water regularly, and attend preventive examinations based on your individual risk level."
    ],
    image: "https://images.pexels.com/photos/3845983/pexels-photo-3845983.jpeg?auto=compress&dpr=1&h=900&w=1200",
    date: "July 28, 2026",
    category: "Prevention",
    readTime: "4 min read"
  },
  {
    slug: "benefits-of-regular-dental-checkups",
    title: "Benefits of regular dental checkups",
    excerpt: "Regular examinations help detect decay, gum disease, bite changes, and other concerns before symptoms become severe.",
    content: [
      "Dental disease can progress quietly. A structured examination allows the dentist to compare changes over time and decide whether monitoring or treatment is appropriate.",
      "Preventive appointments may include professional cleaning, radiographs when justified, oral-cancer screening, and personalised advice.",
      "The correct interval is not identical for everyone. Your dentist should recommend timing based on current health, previous disease, and risk factors."
    ],
    image: "https://images.pexels.com/photos/3845723/pexels-photo-3845723.jpeg?auto=compress&dpr=1&h=900&w=1200",
    date: "July 18, 2026",
    category: "Dental Care",
    readTime: "5 min read"
  },
  {
    slug: "what-to-expect-from-clear-aligners",
    title: "What to expect from clear aligners",
    excerpt: "Clear aligners can be effective when case selection, wear time, oral hygiene, and follow-up are managed correctly.",
    content: [
      "Treatment begins with records, a bite assessment, and a digital plan. The proposed tooth movements should be reviewed before aligners are produced.",
      "Most systems require consistent daily wear and scheduled changes. Attachments or additional procedures may be needed to improve movement predictability.",
      "Retention is essential after active treatment. Without retainers, teeth can move toward their previous positions."
    ],
    image: "https://images.pexels.com/photos/6812556/pexels-photo-6812556.jpeg?auto=compress&dpr=1&h=900&w=1200",
    date: "July 8, 2026",
    category: "Orthodontics",
    readTime: "6 min read"
  }
];

export const testimonials: Testimonial[] = [
  { name: "Clear communication", role: "Care standard", quote: "Patients should receive understandable explanations of findings, options, expected outcomes, limitations, and costs before agreeing to treatment.", image: "/images/patient-dianne.svg" },
  { name: "Respectful care", role: "Care standard", quote: "Appointments should protect privacy, allow time for questions, and adapt communication to the patient’s comfort and clinical needs.", image: "/images/patient-robert.svg" },
  { name: "Continuity and follow-up", role: "Care standard", quote: "Treatment records, after-care instructions, and follow-up plans should remain clear so patients know what happens next.", image: "/images/patient-maya.svg" }
];

export const faqs: Faq[] = [
  { question: "Do you accept dental insurance?", answer: "We work with many major insurance providers. Coverage and reimbursement differ by plan, so our team can help verify your benefits before treatment." },
  { question: "How often should I visit the dentist?", answer: "Visit frequency should be based on your oral-health risk. Many patients attend every six months, while others require shorter or longer intervals." },
  { question: "Do you offer emergency appointments?", answer: "Yes. Urgent cases are prioritised according to symptoms and clinical risk. Call the emergency number for the earliest available assessment." },
  { question: "What happens during a first visit?", answer: "A first visit normally includes a health history, examination, discussion of concerns, and diagnostic records when clinically justified." },
  { question: "Can I book an appointment online?", answer: "Yes. Submit the appointment form with your preferred date and time. The clinic will confirm availability by phone or email." }
];
