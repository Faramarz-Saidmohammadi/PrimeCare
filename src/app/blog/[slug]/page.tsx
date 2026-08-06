import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getPosts } from "@/lib/content";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const post=(await getPosts()).find(p=>p.slug===slug);return {title:post?.title||"Article",description:post?.excerpt};}
export default async function PostPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const posts=await getPosts();const post=posts.find(p=>p.slug===slug);if(!post)notFound();return <><PageHero eyebrow={post.category} title={post.title} text={post.excerpt}/><article className="section"><div className="container article"><div className="article-image"><Image src={post.image} alt="" fill sizes="900px"/></div><div className="article-meta">{post.date}<span>•</span>{post.readTime}</div>{post.content.map(p=><p key={p}>{p}</p>)}<div className="article-callout"><h3>Need personalised advice?</h3><p>Online information cannot replace a clinical assessment. Book an appointment for recommendations based on your diagnosis.</p><Link className="button" href="/appointment">Request appointment <Icon name="arrow" size={18}/></Link></div></div></article></>}
