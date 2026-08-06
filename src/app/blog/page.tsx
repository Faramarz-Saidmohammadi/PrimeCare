import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getPosts } from "@/lib/content";
export const metadata={title:"Dental Insights"};
export default async function BlogPage(){const posts=await getPosts();return <><PageHero eyebrow="Dental insights" title="Practical oral-health guidance" text="Clear, concise information about prevention, treatment, orthodontics, and maintaining long-term dental health."/><section className="section section-muted"><div className="container blog-grid">{posts.map(post=><article className="blog-card" key={post.slug}><Link href={`/blog/${post.slug}`} className="blog-image"><Image src={post.image} alt="" fill sizes="33vw"/></Link><div><span>{post.category} · {post.date}</span><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className="text-link" href={`/blog/${post.slug}`}>Read article <Icon name="arrow" size={17}/></Link></div></article>)}</div></section></>}
