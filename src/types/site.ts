export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  excerpt: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
};

export type Doctor = {
  slug: string;
  name: string;
  role: string;
  qualification: string;
  experience: string;
  image: string;
  bio: string;
  specialties: string[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  date: string;
  category: string;
  readTime: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

export type Faq = { question: string; answer: string };
