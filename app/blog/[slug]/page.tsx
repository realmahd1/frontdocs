import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import {
  formatPersianDate,
  getAllPosts,
  getPostBySlug,
} from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      images: post.cover ? [post.cover] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="article-shell">
      <header className="article-header container">
        <Link className="back-link" href="/blog">
          بازگشت به وبلاگ
        </Link>

        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link key={tag} className="tag" href={`/tag/${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
        </div>

        <h1>{post.title}</h1>
        <p className="article-description">{post.description}</p>

        <div className="article-meta">
          <span>{post.author}</span>
          <span>•</span>
          <time dateTime={post.date}>{formatPersianDate(post.date)}</time>
          <span>•</span>
          <span>{post.readingTime} دقیقه مطالعه</span>
        </div>

        {post.cover && (
          <div className="article-cover">
            <Image
              src={post.cover}
              alt={post.title}
              width={1200}
              height={630}
              unoptimized
              priority
            />
          </div>
        )}
      </header>

      <div className="container article-layout">
        <MarkdownContent content={post.content} />
      </div>
    </article>
  );
}
