import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow">فرانت‌داکس</span>
          <h1>یادداشت‌های یک توسعه‌دهنده</h1>
          {/* <p>
            بدون دیتابیس و پنل مدیریت؛ هر فایل Markdown یک نوشته مستقل
            در وبلاگ خواهد بود.
          </p> */}
          <Link className="primary-button" href="/blog">
            مشاهده نوشته‌ها
          </Link>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">جدیدترین‌ها</span>
            <h2>آخرین نوشته‌ها</h2>
          </div>
          <Link href="/blog">مشاهده همه</Link>
        </div>

        <div className="post-grid">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
