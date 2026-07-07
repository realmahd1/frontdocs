import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container empty-state">
      <span className="eyebrow">404</span>
      <h1>این صفحه پیدا نشد</h1>
      <p>ممکن است نوشته حذف شده یا آدرس آن تغییر کرده باشد.</p>
      <Link className="primary-button" href="/blog">
        رفتن به وبلاگ
      </Link>
    </section>
  );
}
