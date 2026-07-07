# وبلاگ Next.js با فایل‌های Markdown

این پروژه هیچ دیتابیسی ندارد. تمام نوشته‌ها از فایل‌های زیر خوانده می‌شوند:

```text
content/posts/*.md
```

## اجرا

```bash
npm install
npm run dev
```

سپس آدرس زیر را باز کنید:

```text
http://localhost:3000/blog
```

## افزودن پست

یک فایل جدید در مسیر زیر بسازید:

```text
content/posts/my-new-post.md
```

قالب Frontmatter:

```md
---
title: "عنوان نوشته"
description: "توضیح کوتاه برای کارت و سئو"
date: "2026-07-05"
updatedAt: "2026-07-05"
author: "نام نویسنده"
cover: "/blog/example-cover.svg"
tags:
  - Next.js
  - Telegram
draft: false
---

# عنوان داخل مقاله

متن مقاله...
```

نام فایل، آدرس نوشته را می‌سازد:

```text
content/posts/design-patterns.md
→
/blog/design-patterns
```

## تصاویر

تصویرها را داخل `public/blog` قرار دهید:

```text
public/blog/my-image.jpg
```

و در Markdown استفاده کنید:

```md
![توضیح تصویر](/blog/my-image.jpg)
```

## پیش‌نویس

برای مخفی‌شدن یک پست:

```yaml
draft: true
```

## اتصال ربات تلگرام در مرحله بعد

ربات فقط باید فایل‌های داخل `content/posts` را ایجاد یا ویرایش کند. سایت هنگام اجرای مجدد یا build بعدی، نوشته‌ها را از روی فایل‌ها می‌سازد و به دیتابیس نیاز ندارد.

## دریافت پست‌ها با getUpdates بدون Webhook

برای این روش Cloudflare Tunnel و آدرس عمومی لازم نیست.

```bash
npm install
npm run telegram:poll
```

اسکریپت در شروع Webhook قبلی را حذف می‌کند و سپس با Long Polling فقط این Updateها را می‌گیرد:

```text
channel_post
edited_channel_post
```

فایل آخرین `update_id` در مسیر زیر نگهداری می‌شود:

```text
storage/telegram-polling-offset.txt
```

برای صفرکردن offset محلی:

```bash
npm run telegram:poll:reset
```

توجه: `getUpdates` تاریخچه قدیمی کانال را دریافت نمی‌کند. برای پست‌های قدیمی باید آن‌ها را پس از روشن‌شدن Poller ویرایش/بازنشر کنید یا از Importer مبتنی بر MTProto استفاده شود.

## فونت فارسی سایت و کاورهای خودکار

این نسخه از فونت متن‌باز **Vazirmatn** استفاده می‌کند. فونت از طریق پکیج رسمی npm نصب می‌شود و نیازی نیست فایل فونت را دستی داخل پروژه کپی کنید:

```bash
npm install
```

فونت سایت در `app/layout.tsx` بارگذاری شده و در `app/globals.css` به‌عنوان فونت اصلی استفاده می‌شود.

کاورهای خودکار نیز در `lib/telegram/cover.ts` با همین فونت ساخته می‌شوند. تولیدکننده کاور با Satori متن را به مسیرهای SVG تبدیل می‌کند؛ بنابراین نوشته فارسی کاور روی سرور و مرورگرهای مختلف یکسان نمایش داده می‌شود و به نصب بودن فونت روی سیستم وابسته نیست.

برای بازسازی کاورهای خودکاری که قبلاً تولید شده‌اند، اجرا کنید:

```bash
npm run covers:regenerate
```

پست‌هایی که کاور اختصاصی دارند، دست‌نخورده باقی می‌مانند. خروجی کاورها در مسیر زیر ذخیره می‌شود:

```text
storage/generated/covers/<slug>-cover.svg
```
