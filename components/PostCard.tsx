import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatPersianDate } from "@/lib/posts";

type Props = {
  post: PostSummary;
};

export default function PostCard({ post }: Props) {
  return (
    <article className="post-card">
      {post.cover && (
        <Link className="post-card-cover" href={`/blog/${post.slug}`}>
          <Image
            src={post.cover}
            alt={post.title}
            width={720}
            height={420}
            unoptimized
          />
        </Link>
      )}

      <div className="post-card-body">
        <div className="tag-list">
          {post.tags.slice(0, 3).map((tag) => (
            <Link key={tag} className="tag" href={`/tag/${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
        </div>

        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p>{post.description}</p>

        <div className="post-card-footer">
          <time dateTime={post.date}>{formatPersianDate(post.date)}</time>
          <span>{post.readingTime} دقیقه مطالعه</span>
        </div>
      </div>
    </article>
  );
}
