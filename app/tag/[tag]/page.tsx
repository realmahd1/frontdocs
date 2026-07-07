import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type PageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag: encodedTag } = await params;
  const tag = decodeURIComponent(encodedTag);

  return {
    title: `نوشته‌های ${tag}`,
    description: `نوشته‌های دارای برچسب ${tag}`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: encodedTag } = await params;
  const tag = decodeURIComponent(encodedTag);
  const posts = getPostsByTag(tag);

  if (!posts.length) {
    notFound();
  }

  return (
    <section className="container section">
      <div className="page-heading">
        <Link className="back-link" href="/blog">
          بازگشت به وبلاگ
        </Link>
        <span className="eyebrow">برچسب</span>
        <h1>#{tag}</h1>
        <p>{posts.length} نوشته با این برچسب پیدا شد.</p>
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
