# FrontDocs

وبلاگ فارسی مبتنی بر **Next.js** و **Markdown** برای انتشار مقاله‌های فنی، بدون نیاز به دیتابیس یا پنل مدیریت محتوا.

تمام مقاله‌ها به‌صورت فایل Markdown نگهداری می‌شوند و هنگام Build به صفحات استاتیک تبدیل می‌شوند. پروژه همچنین از دریافت پست‌های کانال تلگرام، تولید خودکار مقاله، اصلاح ساختار Markdown و ساخت کاور پشتیبانی می‌کند.

---

## ویژگی‌ها

- مبتنی بر Next.js App Router
- ذخیره مقاله‌ها در فایل‌های Markdown
- بدون دیتابیس
- خروجی کاملاً استاتیک
- مناسب برای GitHub Pages
- پشتیبانی از زبان فارسی و RTL
- استفاده از فونت Vazirmatn
- پشتیبانی از Markdown و GitHub Flavored Markdown
- نمایش Syntax Highlighting برای کدها
- دریافت پست‌های تلگرام با Long Polling
- پشتیبانی از ویرایش پست‌های کانال
- ترکیب چند پیام تلگرام در یک مقاله
- تولید خودکار کاور برای مقاله‌ها
- اصلاح خودکار خطاهای رایج Markdown
- پشتیبانی از پیش‌نویس، برچسب و تاریخ به‌روزرسانی

---

## معماری محتوا

مقاله‌های نهایی در مسیر زیر نگهداری می‌شوند:

```text
content/posts/*.md
```

پیام‌های خام دریافت‌شده از تلگرام در مسیر زیر ذخیره می‌شوند:

```text
content/telegram/<article-key>/*.md
```

فایل‌های تولیدشده عمومی، مانند کاورها و تصاویر، در مسیر زیر قرار می‌گیرند:

```text
public/generated/
```

در زمان Build، Next.js محتوای `content/posts` را می‌خواند و صفحات استاتیک سایت را تولید می‌کند.

---

## پیش‌نیازها

- Node.js 22 یا جدیدتر
- npm
- توکن ربات تلگرام، فقط برای استفاده از Telegram Poller

---

## نصب و اجرای محلی

ابتدا وابستگی‌ها را نصب کنید:

```bash
npm install
```

سپس محیط توسعه را اجرا کنید:

```bash
npm run dev
```

سایت از آدرس زیر در دسترس خواهد بود:

```text
http://localhost:3000
```

صفحه وبلاگ:

```text
http://localhost:3000/blog
```

---

## ساخت نسخه Production

برای تولید نسخه نهایی سایت اجرا کنید:

```bash
npm run build
```

پروژه با Static Export ساخته می‌شود و خروجی نهایی در مسیر زیر قرار می‌گیرد:

```text
out/
```

برای بررسی خروجی استاتیک در محیط محلی می‌توانید از یک Static Server استفاده کنید:

```bash
npx serve out
```

---

## ایجاد مقاله جدید

یک فایل Markdown جدید در مسیر زیر بسازید:

```text
content/posts/my-new-post.md
```

نمونه ساختار مقاله:

```md
---
title: "عنوان مقاله"
description: "توضیح کوتاه مقاله برای کارت، متادیتا و موتورهای جست‌وجو"
date: "2026-07-05"
updatedAt: "2026-07-05"
author: "نام نویسنده"
cover: "/generated/covers/my-new-post-cover.svg"
tags:
  - Next.js
  - Markdown
draft: false
---

# عنوان مقاله

متن مقاله از این قسمت شروع می‌شود.
```

نام فایل، Slug و آدرس مقاله را مشخص می‌کند:

```text
content/posts/design-patterns.md
```

آدرس خروجی:

```text
/blog/design-patterns
```

---

## Front Matter

فیلدهای پشتیبانی‌شده در ابتدای هر مقاله:

| فیلد | توضیح |
|---|---|
| `title` | عنوان مقاله |
| `description` | توضیح کوتاه برای کارت مقاله و SEO |
| `date` | تاریخ انتشار |
| `updatedAt` | تاریخ آخرین به‌روزرسانی |
| `author` | نام نویسنده |
| `cover` | آدرس تصویر یا کاور مقاله |
| `tags` | فهرست برچسب‌ها |
| `draft` | مشخص می‌کند مقاله منتشر شود یا خیر |

برای مخفی‌کردن یک مقاله از سایت:

```yaml
draft: true
```

مقاله‌هایی که مقدار `draft` آن‌ها `true` باشد، در نسخه منتشرشده نمایش داده نمی‌شوند.

---

## تصاویر مقاله

تصاویر عمومی را داخل پوشه `public` قرار دهید.

مثال:

```text
public/blog/my-image.jpg
```

استفاده در Markdown:

```md
![توضیح تصویر](/blog/my-image.jpg)
```

فایل‌های تولیدشده به‌صورت خودکار در این مسیر قرار می‌گیرند:

```text
public/generated/
```

نمونه آدرس کاور تولیدشده:

```text
public/generated/covers/design-patterns-cover.svg
```

استفاده در Front Matter:

```yaml
cover: "/generated/covers/design-patterns-cover.svg"
```

---

## دریافت پست‌های تلگرام

این پروژه برای دریافت پست‌های کانال از Telegram Bot API و روش `getUpdates` استفاده می‌کند.

در این روش به Webhook، سرور عمومی یا Cloudflare Tunnel نیاز نیست.

اجرای Poller:

```bash
npm run telegram:poll
```

Poller فقط Updateهای مرتبط با پست کانال را پردازش می‌کند:

```text
channel_post
edited_channel_post
```

آخرین `update_id` پردازش‌شده در این فایل ذخیره می‌شود:

```text
storage/telegram-polling-offset.txt
```

برای پاک‌کردن Offset ذخیره‌شده:

```bash
npm run telegram:poll:reset
```

> `getUpdates` برای دریافت تاریخچه کامل کانال طراحی نشده است. این روش معمولاً فقط Updateهای جدید و دریافت‌نشده را برمی‌گرداند. برای واردکردن آرشیو قدیمی کانال باید از ابزار جداگانه مبتنی بر MTProto استفاده شود یا پست‌ها دوباره ویرایش و منتشر شوند.

---

## جریان تولید مقاله از تلگرام

فرایند کلی پردازش پیام‌های تلگرام:

```text
Telegram Channel
       ↓
Telegram Poller
       ↓
content/telegram
       ↓
Article Composer
       ↓
Markdown Normalizer
       ↓
content/posts
       ↓
Next.js Static Build
```

پیام‌های مرتبط می‌توانند در یک مقاله گروه‌بندی شوند. نسخه نهایی مقاله پس از ترکیب Fragmentها در `content/posts` ذخیره می‌شود.

---

## فونت فارسی

پروژه از فونت متن‌باز **Vazirmatn** استفاده می‌کند.

فونت از طریق پکیج npm بارگذاری می‌شود و نیازی به نگهداری دستی فایل‌های فونت داخل Repository نیست.

فونت اصلی سایت در Root Layout وارد شده و در فایل CSS عمومی پروژه استفاده می‌شود.

---

## تولید خودکار کاور

کاورهای مقاله به‌صورت خودکار بر اساس اطلاعات مقاله تولید می‌شوند.

اطلاعات قابل نمایش روی کاور می‌تواند شامل موارد زیر باشد:

- عنوان مقاله
- Slug
- برچسب‌ها
- نام FrontDocs
- آدرس سایت
- شناسه شبکه اجتماعی

کاورها در مسیر زیر ذخیره می‌شوند:

```text
public/generated/covers/
```

برای بازسازی تمام کاورهای تولیدشده اجرا کنید:

```bash
npm run covers:regenerate
```

مقاله‌هایی که کاور اختصاصی دارند می‌توانند بدون تغییر باقی بمانند.

---

## ساختار پروژه

```text
.
├── app/
│   ├── blog/
│   ├── tag/
│   ├── globals.css
│   └── layout.tsx
│
├── content/
│   ├── posts/
│   └── telegram/
│
├── lib/
│   ├── posts/
│   └── telegram/
│       ├── composer.ts
│       ├── cover.ts
│       ├── fragments.ts
│       ├── markdown-normalizer.ts
│       └── paths.ts
│
├── public/
│   ├── blog/
│   └── generated/
│       ├── covers/
│       └── media/
│
├── scripts/
│   ├── telegram-poll.ts
│   ├── normalize-generated-markdown.ts
│   └── regenerate-covers.ts
│
├── storage/
│   └── telegram-polling-offset.txt
│
├── next.config.ts
├── package.json
└── README.md
```

---

## اسکریپت‌های اصلی

| دستور | کاربرد |
|---|---|
| `npm run dev` | اجرای محیط توسعه |
| `npm run build` | ساخت خروجی استاتیک Production |
| `npm run telegram:poll` | دریافت پست‌های جدید تلگرام |
| `npm run telegram:poll:reset` | پاک‌کردن Offset محلی Poller |
| `npm run markdown:normalize` | اصلاح فایل‌های Markdown موجود |
| `npm run covers:regenerate` | بازسازی کاورهای خودکار |

---

## انتشار روی GitHub Pages

پروژه با Static Export سازگار است و می‌تواند مستقیماً از پوشه `out` روی GitHub Pages منتشر شود.

فرایند Deployment:

```text
Push to main
     ↓
GitHub Actions
     ↓
npm ci
     ↓
npm run build
     ↓
Upload out/
     ↓
GitHub Pages
```

از آنجا که GitHub Pages فقط فایل‌های استاتیک ارائه می‌دهد، Routeهای داینامیک، Webhook و APIهای Server-side نباید داخل مسیر `app/api` قرار داشته باشند.

برای دامنه اختصاصی می‌توان دامنه موردنظر را از مسیر زیر تنظیم کرد:

```text
Repository
→ Settings
→ Pages
→ Custom domain
```

نمونه دامنه پروژه:

```text
https://frontdocs.ir
```