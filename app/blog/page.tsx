import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "فهرست تمام نوشته‌های وبلاگ",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="container section">
      <div className="page-heading">
        <span className="eyebrow">آرشیو نوشته‌ها</span>
        <h1>وبلاگ</h1>
        <p>{posts.length} نوشته منتشر شده است.</p>
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
