---
title: خیلی وقت‌ها Design Pattern اشتباه نیست؛
description: >-
  خیلی وقت‌ها Design Pattern اشتباه نیست؛ ما فقط در زمان اشتباه سراغش می‌رویم.
  مثلاً چون تازه با Strategy آشنا شده‌ایم، سعی می‌کنیم هر if/else ای را با آن
  جایگزین کنیم. در حالی که…
date: '2026-07-03T13:50:39.000Z'
updatedAt: '2026-07-08T17:38:39.000Z'
author: M.Mahdi Saeidi
cover: /generated/covers/design-patterns-cover.svg
tags:
  - Design_Patterns
  - Creational_Patterns
draft: false
telegramMessageIds:
  - 348
  - 349
  - 350
  - 351
  - 352
  - 353
  - 354
  - 355
  - 356
  - 359
  - 360
  - 361
  - 362
  - 363
  - 364
  - 365
  - 366
  - 367
  - 368
  - 369
  - 370
  - 371
  - 372
  - 373
  - 375
  - 376
  - 377
  - 378
  - 379
  - 380
  - 381
  - 382
  - 383
  - 384
  - 385
  - 386
  - 387
  - 388
  - 389
  - 390
  - 391
  - 392
  - 393
  - 394
  - 395
  - 396
  - 397
  - 398
  - 399
  - 400
  - 401
  - 402
  - 403
  - 404
  - 405
  - 406
  - 407
  - 408
---
<!-- FRONTDOCS_PART:1 -->

خیلی وقت‌ها Design Pattern اشتباه نیست؛
ما فقط در زمان اشتباه سراغش می‌رویم.

مثلاً چون تازه با Strategy آشنا شده‌ایم، سعی می‌کنیم هر if/else ای را با آن جایگزین کنیم.

در حالی که شاید آن بخش از کد فقط به یک تابع ساده نیاز داشته باشد، نه چند کلاس و Interface جدید.

اصل ماجرا این نیست که چند Pattern بلدیم.

مهم این است که بفهمیم:

این کد الان واقعاً چه مشکلی دارد؟

قبل از انتخاب Pattern، اول مسئله را درست پیدا کنیم.

---

قبل از اینکه بگوییم:

«اینجا Factory بزنیم»
یا
«Strategy بهتره»

یک سؤال ساده بپرسیم:

دقیقاً کجای این کد اذیتمان می‌کند؟

مثلاً این Constructor را ببینید:

```js
const orderService = new OrderService(
  database,
  paymentService,
  smsService,
  logger,
  cache,
  notificationService
);
```

مشکل این کد چیست؟

تعداد پارامترها زیاد شده، ترتیب آن‌ها مهم است و شاید مشخص نباشد کدام وابستگی ضروری یا اختیاری است.

در چنین شرایطی، یک Factory می‌تواند ساخت آبجکت را ساده‌تر کند:

```js
const orderService =
  OrderServiceFactory.create();
```

حالا تمام جزئیات ساخت داخل Factory قرار گرفته است.

نکته مهم این است:

ما به‌خاطر علاقه به Factory از آن استفاده نکردیم؛
به‌خاطر یک درد واقعی از آن استفاده کردیم.

---

یک Design Pattern زمانی ارزش دارد که یک مشکل تکراری را کمتر کند.

مثلاً فرض کنید در چند جای پروژه مستقیماً به API پیامک وصل شده‌ایم:

```js
await axios.post(
  "https://sms-provider.com/send",
  {
    mobile: phone,
    text: message
  }
);
```

این کد داخل Controller، Job و Serviceهای مختلف تکرار شده است.

حالا اگر شرکت پیامک عوض شود، باید چندین فایل را تغییر دهیم.

راه بهتر این است که ارتباط با سرویس پیامک را پشت یک رابط ثابت قرار دهیم:

```js
await smsService.send(
  phone,
  message
);
```

داخل smsService می‌توانیم از هر سرویس‌دهنده‌ای استفاده کنیم:

```javascript
class SmsService {
  async send(phone, message) {
    return smsProvider.send(
      phone,
      message
    );
  }
}
```

حالا اگر سرویس‌دهنده تغییر کند، فقط یک بخش از پروژه تغییر می‌کند.

اینجاست که Pattern واقعاً هزینه تغییر را کم می‌کند.

---

برای انتخاب Design Pattern مناسب، لازم نیست همه Patternها را حفظ باشیم.

فقط این سه سؤال را بپرسیم:

**۱. مشکل در ساختن آبجکت‌هاست؟**

مثلاً:

```
new ReportService(
  database,
  logger,
  cache,
  sms,
  notification
);
```

اینجا شاید Factory یا Builder کمک کند.

---

**۲. مشکل در ارتباط بین بخش‌های سیستم است؟**

مثلاً همه‌جای پروژه مستقیماً به یک API خارجی وابسته شده است:

```
axios.post(
  "external-api.com/send",
  data
);
```

اینجا یک Adapter می‌تواند ارتباط را ساده کند:

```swift
externalService.send(data);
```

---

**۳. مشکل در رفتارهای متغیر است؟**

مثلاً کد به این شکل درآمده:

```javascript
if (paymentType === "card") {
  payByCard();
} else if (
  paymentType === "wallet"
) {
  payByWallet();
} else if (
  paymentType === "credit"
) {
  payByCredit();
}
```

در چنین شرایطی، Strategy می‌تواند هر روش پرداخت را جدا کند:

```javascript
const strategy =
  paymentStrategies[paymentType];

strategy.pay();
```

اسم دسته‌بندی‌ها مهم نیست.

مهم این است که بفهمیم مشکل از ساختن است، از ارتباط است یا از رفتار.

---

بعضی وقت‌ها فکر می‌کنیم هرچه Pattern بیشتری در پروژه استفاده کنیم، کد حرفه‌ای‌تر است.

مثلاً برای یک محاسبه ساده چنین ساختاری می‌سازیم:

```dart
class DiscountStrategy {
  calculate(price) {
    return price * 0.9;
  }
}

class DiscountFactory {
  static create() {
    return new DiscountStrategy();
  }
}
```

در حالی که شاید کل نیاز پروژه همین باشد:

```javascript
const calculateDiscount =
  price => price * 0.9;
```

نسخه دوم ساده‌تر، خواناتر و قابل‌فهم‌تر است.

---

هر Pattern با خودش هزینه می‌آورد:

کلاس بیشتر،
فایل بیشتر،
لایه بیشتر،
و زمان بیشتر برای فهمیدن کد.

پس قبل از اضافه‌کردن هر Pattern بپرسیم:

این Pattern دقیقاً قرار است کدام مشکل را حل کند؟

اگر جواب روشنی نداریم، احتمالاً هنوز به آن نیاز نداریم.
**پترن یعنی پیچیدگی را در یک نقطه کنترل کنیم؛
نه اینکه بدون دلیل، پیچیدگی جدیدی بسازیم.**

---

خلاصه چیز هایی که گفتیم میشه توی این عکس خلاصه کرد.

فعلا برای پارت یک اینا رو داشته باشیم، بخش های بعدی داخل هر قسمت عمیق تر میشیم.

![خلاصه چیز هایی که گفتیم میشه توی این عکس خلاصه کرد.](/generated/media/design-patterns/356-1.jpg)
---
<!-- FRONTDOCS_PART:2 -->

خوب بریم سراغ شاخه اولی که اینجا گفتم یعنی
**Creational Patterns**

از این شاخه زمانی استفاده می‌کنیم که خودِ ساختن آبجکت تبدیل به مشکل شده باشد؛ مثلاً:
> Constructor پارامترهای زیادی دارد.
>
> کد ساخت و تنظیم آبجکت در چند جا تکرار شده است.
>
> مقدارهای پیش‌فرض مشخص نیستند.
>
> تصمیم اینکه کدام کلاس ساخته شود، در بخش‌های مختلف پروژه پخش شده است.

---

**قدم اول: آیا واقعاً فقط به یک نمونه نیاز داریم؟**

قبل از استفاده از `Singleton` باید مشخص کنیم چرا می‌خواهیم فقط یک نمونه از آن کلاس وجود داشته باشد.

اینکه بگوییم:

«می‌خواهم از همه‌جای برنامه راحت به آن دسترسی داشته باشم»

دلیل مناسبی نیست؛ چون `Singleton` ممکن است وابستگی‌های برنامه را پنهان کند و تست‌نویسی را سخت‌تر کند.

Singleton زمانی مناسب است که آبجکت:

> اطلاعات متغیر و مخصوصی داخل خودش نگه ندارد.
>
> داده‌هایش معمولاً تغییر نکنند.
>
> استفاده مشترک از آن در تمام بخش‌های برنامه مشکلی ایجاد نکند.

برای مثال، یک **Logger عمومی** یا **تنظیمات فقط‌خواندنی** برنامه می‌تواند Singleton باشد.

---

این تصویر نحوه کار الگوی `Singleton` را نشان می‌دهد.
در اینجا دو بخش از برنامه یعنی `Component A` و `Component B` هر دو به یک `Logger` مشترک دسترسی دارند.
در اصل **یک نمونه مشترک در کل اجرای برنامه** داریم.

![این تصویر نحوه کار الگوی Singleton را نشان می‌دهد.](/generated/media/design-patterns/361-1.jpg)

---

**مشکلات Singleton چیست؟**

Singleton با اینکه ساده به نظر می‌رسد، می‌تواند چند مشکل ایجاد کند:

**وابستگی‌ها را پنهان می‌کند**
وقتی یک کلاس مستقیماً Singleton را صدا می‌زند، از بیرون مشخص نیست که به آن وابسته است.

```dart
class OrderService {
  save() {
    Logger.instance().info("Order saved");
  }
}
```

در اینجا `OrderService` به Logger وابسته است، اما این وابستگی در Constructor دیده نمی‌شود.

**تست‌نویسی را سخت می‌کند**
چون همه تست‌ها از یک نمونه مشترک استفاده می‌کنند، ممکن است اطلاعات تست قبلی داخل Singleton باقی بماند و روی تست بعدی اثر بگذارد.

**State مشترک ایجاد می‌کند**
اگر Singleton اطلاعات متغیر نگه دارد، همه بخش‌های برنامه آن اطلاعات را با هم به اشتراک می‌گذارند. این موضوع می‌تواند باعث قاطی شدن داده‌ها شود.

**تغییر و توسعه کد را سخت‌تر می‌کند**
اگر بعداً بخواهیم به‌جای Singleton از پیاده‌سازی دیگری استفاده کنیم، ممکن است مجبور شویم قسمت‌های زیادی از برنامه را تغییر دهیم.

**در اجرای هم‌زمان مشکل ایجاد می‌کند**
اگر چند Thread یا چند درخواست هم‌زمان مقدارهای Singleton را تغییر دهند، ممکن است نتیجه غیرقابل‌پیش‌بینی شود.

---

**قدم دوم: آیا ساختن آبجکت پیچیده شده است؟**

اگر Constructor پارامترهای زیادی دارد یا بعضی تنظیمات فقط در کنار هم معتبر هستند، بهتر است از الگوی **Builder** استفاده کنیم.

بدون Builder، ساختن آبجکت ممکن است ناخوانا و اشتباه‌پذیر باشد:

```ruby
request = Request.new(
  url,
  method,
  headers,
  body,
  timeout,
  retry_count,
  cache,
  auth
)
```

در این حالت به‌سختی می‌توان فهمید هر مقدار مربوط به کدام پارامتر است و ممکن است ترتیب آن‌ها اشتباه شود.
با Builder، تنظیمات را مرحله‌به‌مرحله و واضح مشخص می‌کنیم:

```ruby
request = RequestBuilder.new
  .url("https://api.example.com")
  .method(:post)
  .headers(auth_headers)
  .timeout(2)
  .build
```

---

در تصویر، `Client` ابتدا یک `RequestBuilder` می‌سازد و سپس آدرس، متد، هدرها و زمان انتظار را به آن می‌دهد. در پایان، با اجرای build()، Builder تنظیمات را بررسی می‌کند و یک آبجکت معتبر از نوع `Request` می‌سازد.

**نکته اصلی این است که Builder فقط برای زیباتر شدن زنجیره متدها نیست**؛ بلکه باعث می‌شود:

> ساخت آبجکت خواناتر باشد.
>
> احتمال اشتباه کمتر شود.
>
> تنظیمات نامعتبر زودتر شناسایی شوند.
>
> بتوانیم تنظیمات آماده و مطمئن، مثل تعداد تلاش مجدد پیش‌فرض، تعریف کنیم.

![در تصویر، Client ابتدا یک RequestBuilder می‌سازد و سپس آدرس، متد، هدرها و زمان انتظار را به آن می‌دهد. در پایان، با اجرا](/generated/media/design-patterns/364-1.jpg)

---

**قدم سوم: آیا برنامه باید بر اساس شرایط، کلاس مناسب را بسازد؟**
فرض کن برنامه می‌خواهد یک فایل بسازد، اما نوع فایل همیشه یکی نیست:
> گاهی فایل Word می‌خواهیم.
>
> گاهی فایل PDF می‌خواهیم.

بدون **Factory** ممکن است در بخش‌های مختلف برنامه این شرط را تکرار کنیم:

```javascript
if (type === "word") {
  document = new WordDocument();
} else if (type === "pdf") {
  document = new PdfDocument();
}
```

اگر این تصمیم‌گیری در قسمت‌های مختلف برنامه تکرار شود، کد شلوغ و تغییر دادن آن سخت می‌شود. در این شرایط از **Factory Method** استفاده می‌کنیم.

---

در تصویر یک کلاس پایه به نام `Creator` وجود دارد که متد `createDocument()` را تعریف می‌کند. سپس هر کلاس فرزند مشخص می‌کند چه نوع فایلی ساخته شود:

> WordCreator یک WordDocument می‌سازد.
>
> PdfCreator یک PdfDocument می‌سازد.

![در تصویر یک کلاس پایه به نام Creator وجود دارد که متد createDocument() را تعریف می‌کند. سپس هر کلاس فرزند مشخص می‌کند چه](/generated/media/design-patterns/366-1.jpg)

---

مثلاً:

```javascript
class DocumentCreator {
  createDocument() {
    throw new Error("Not implemented");
  }
}

class WordCreator extends DocumentCreator {
  createDocument() {
    return new WordDocument();
  }
}

class PdfCreator extends DocumentCreator {
  createDocument() {
    return new PdfDocument();
  }
}
```

در این حالت، بخش اصلی برنامه مستقیماً این کار را انجام نمی‌دهد:

```
new WordDocument();
```

یا:

```javascript
new PdfDocument();
```

بلکه از Creator می‌خواهد فایل را بسازد:

```javascript
const document = creator.createDocument();
```

**نکته اصلی:
Factory Method یعنی منطق ساخت آبجکت‌ها را از کد اصلی جدا کنیم و به کلاس‌های مخصوص بسپاریم.**

در نتیجه اگر بعداً بخواهیم `ExcelDocument` اضافه کنیم، فقط یک `ExcelCreator` جدید می‌سازیم و نیازی نیست قسمت‌های مختلف برنامه را تغییر دهیم.

---

**Abstract Factory زمانی استفاده می‌شود که برنامه باید چند آبجکت مرتبط را با هم بسازد و این آبجکت‌ها باید با یکدیگر هماهنگ باشند.**

در تصویر، برنامه برای دو سیستم‌عامل رابط کاربری می‌سازد:

برای Mac:
> MacButton
>
> MacCheckbox
برای Windows:
> WindowsButton
>
> WindowsCheckbox

نکته مهم این است که اجزای هر خانواده نباید با خانواده دیگر ترکیب شوند. مثلاً این حالت درست نیست:

```
MacButton + WindowsCheckbox
```

چون ظاهر و رفتار آن‌ها با هم هماهنگ نیست.
برای جلوگیری از این مشکل، دو Factory داریم:

```
MacFactory
WindowsFactory
```

`MacFactory` فقط اجزای مخصوص Mac را می‌سازد:

```java
macFactory.createButton();   // MacButton
macFactory.createCheckbox(); // MacCheckbox
```

و `WindowsFactory` فقط اجزای مخصوص Windows را می‌سازد:

```javascript
windowsFactory.createButton();   // WindowsButton
windowsFactory.createCheckbox(); // WindowsCheckbox
```

برنامه اصلی فقط با `UIFactory` کار می‌کند و لازم نیست بداند آبجکت واقعی مربوط به Mac است یا Windows:

```javascript
const button = factory.createButton();
const checkbox = factory.createCheckbox();
```

![Abstract Factory زمانی استفاده می‌شود که برنامه باید چند آبجکت مرتبط را با هم بسازد و این آبجکت‌ها باید با یکدیگر هماهنگ](/generated/media/design-patterns/368-1.jpg)

---

**تفاوت ساده با Factory Method**

در Factory Method معمولاً یک نوع آبجکت ساخته می‌شود؛ مثلاً فقط یک Document:

```
WordDocument یا PdfDocument
```

اما در Abstract Factory یک خانواده از آبجکت‌های مرتبط ساخته می‌شود:

```
MacButton + MacCheckbox
```

یا:

```
WindowsButton + WindowsCheckbox
```

---

گاهی ساختن یک آبجکت از **صفر زمان‌بر یا پیچیده** است؛ چون باید تنظیمات زیادی روی آن انجام شود.

در این شرایط می‌توانیم از الگوی `Prototype` استفاده کنیم.

Prototype یعنی:

> یک آبجکت آماده و تنظیم‌شده داشته باشیم، از روی آن کپی بگیریم و فقط قسمت‌های لازم را تغییر دهیم.

---

در تصویر، برنامه می‌خواهد چند دشمن از نوع orc بسازد.

ابتدا Client نمونه آماده دشمن را از `PrototypeRegistry` می‌گیرد:

```javascript
const prototype = registry.get("orc");
```

این نمونه از قبل تنظیم شده است؛ مثلاً ظاهر، قدرت، سرعت و رفتار دشمن مشخص شده‌اند.

بعد به‌جای ساختن یک دشمن جدید از ابتدا، از روی آن Clone می‌گیرد:

```javascript
const enemy = prototype.clone();
```

سپس فقط مواردی که باید متفاوت باشند تغییر داده می‌شوند:

```dart
enemy.customize(position, weapon);
```

مثلاً:

> موقعیت دشمن تغییر کند.
>
> سلاح دشمن متفاوت باشد.
>
> نام یا رنگ آن عوض شود.

![در تصویر، برنامه می‌خواهد چند دشمن از نوع orc بسازد.](/generated/media/design-patterns/371-1.jpg)

---

مثال ساده

فرض کن ساختن دشمن از ابتدا این‌طور باشد:

```javascript
const enemy = new Enemy();

enemy.type = "orc";
enemy.health = 100;
enemy.speed = 20;
enemy.texture = loadLargeTexture();
enemy.behavior = loadAIBehavior();
enemy.weapon = "sword";
```

اگر این تنظیمات سنگین باشند، تکرار آن‌ها برای هر دشمن مناسب نیست.

با Prototype:

```javascript
const enemy1 = orcPrototype.clone();
enemy1.position = { x: 10, y: 20 };

const enemy2 = orcPrototype.clone();
enemy2.position = { x: 50, y: 30 };
enemy2.weapon = "axe";
```

هر دو دشمن تنظیمات اصلی را از نمونه آماده گرفته‌اند و فقط تفاوت‌های کوچک آن‌ها تغییر کرده است.

**نکته اصلی**

Prototype زمانی مناسب است که کپی‌کردن یک آبجکت آماده، ساده‌تر یا سریع‌تر از ساختن دوباره آن از ابتدا باشد.

---

خلاصه مواردی که توی پارت دو برای انتخاب Creational Pattern گفتیم.
من که خودم این فلوچارت ها رو خیلی دوست دارم:)
امیدوارم بدرد شما هم بخوره❤️

![خلاصه مواردی که توی پارت دو برای انتخاب Creational Pattern گفتیم.](/generated/media/design-patterns/373-1.jpg)
---
<!-- FRONTDOCS_PART:3 -->

یک مثال واقعی برای **Singleton** می‌تواند مدیریت تنظیمات برنامه باشد.

فرض کن نرم‌افزار هنگام اجرا، تنظیمات را از فایل یا دیتابیس می‌خواند؛ مثل:

> آدرس سرور
>
> نام دیتابیس
>
> زبان برنامه
>
> زمان Timeout
>
> مسیر ذخیره فایل‌ها

بهتر است این تنظیمات فقط یک‌بار خوانده شوند و همه بخش‌های برنامه از همان نمونه مشترک استفاده کنند.

```dart
class AppConfig {
  static instance;

  constructor() {
    if (AppConfig.instance) {
      return AppConfig.instance;
    }

    this.apiUrl = "https://api.example.com";
    this.timeout = 5000;
    this.language = "fa";

    AppConfig.instance = this;
  }
}
```

حالا بخش‌های مختلف برنامه:

```javascript
const paymentConfig = new AppConfig();
const reportConfig = new AppConfig();

console.log(paymentConfig === reportConfig); // true
```

هر دو بخش به همان تنظیمات مشترک دسترسی دارند:

```javascript
console.log(paymentConfig.apiUrl);
console.log(reportConfig.timeout);
```

نمای ساده:

```
Payment Module ──┐
                 ├── AppConfig مشترک
Report Module ───┘
```

این مثال زمانی مناسب است که تنظیمات پس از شروع برنامه معمولاً تغییر نکنند و **فقط خوانده** شوند. برای تنظیمات متغیر مربوط به هر کاربر یا هر درخواست، **Singleton انتخاب مناسبی نیست.**

---

یک مثال واقعی از **Builder** می‌تواند ساخت گزارش پزشکی PDF باشد.

فرض کن گزارش تنظیمات زیادی دارد:

> اطلاعات بیمار
>
> عنوان گزارش
>
> نام پزشک
>
> لوگوی مرکز
>
> تصاویر پزشکی
>
> امضا
>
> واترمارک
>
> شماره صفحه

بدون Builder ممکن است ساخت گزارش این‌طور شود:

```javascript
const report = new MedicalReport(
  patient,
  doctor,
  title,
  logo,
  images,
  signature,
  true,
  true
);
```

مشخص نیست مقدارهای `true` مربوط به چه چیزی هستند و احتمال اشتباه زیاد است.

با **Builder**، ساخت گزارش واضح‌تر می‌شود:

```javascript
const report = new MedicalReportBuilder()
  .setPatient(patient)
  .setDoctor(doctor)
  .setTitle("گزارش MRI مغز")
  .setLogo(clinicLogo)
  .addImages(mriImages)
  .setSignature(doctorSignature)
  .enableWatermark()
  .enablePageNumbers()
  .build();
```

خود Builder هم می‌تواند قبل از ساخت، اطلاعات ضروری را بررسی کند:

```javascript
class MedicalReportBuilder {
  constructor() {
    this.report = {};
  }

  setPatient(patient) {
    this.report.patient = patient;
    return this;
  }

  setDoctor(doctor) {
    this.report.doctor = doctor;
    return this;
  }

  setTitle(title) {
    this.report.title = title;
    return this;
  }

  setLogo(logo) {
    this.report.logo = logo;
    return this;
  }

  addImages(images) {
    this.report.images = images;
    return this;
  }

  setSignature(signature) {
    this.report.signature = signature;
    return this;
  }

  enableWatermark() {
    this.report.hasWatermark = true;
    return this;
  }

  enablePageNumbers() {
    this.report.hasPageNumbers = true;
    return this;
  }

  build() {
    if (!this.report.patient) {
      throw new Error("اطلاعات بیمار الزامی است");
    }

    if (!this.report.title) {
      throw new Error("عنوان گزارش الزامی است");
    }

    return new MedicalReport(this.report);
  }
}
```

در این مثال، Builder باعث می‌شود ساخت گزارش:

> خواناتر باشد.
>
> تنظیمات اختیاری واضح باشند.
>
> پارامترها با هم اشتباه نشوند.
>
> اطلاعات ضروری قبل از ساخت بررسی شوند.

یعنی به‌جای فرستادن یک لیست طولانی از پارامترها، آبجکت را مرحله‌به‌مرحله می‌سازیم.

---

یک مثال واقعی از **Factory Method** می‌تواند سیستم ارسال اعلان در یک نرم‌افزار باشد.

فرض کن برنامه گاهی باید پیام را با **SMS** و گاهی با **Email** ارسال کند. روند ارسال تقریباً یکسان است، اما کلاس ارسال‌کننده متفاوت خواهد بود.

کلاس پایه، روند کلی ارسال را مشخص می‌کند:

```javascript
class NotificationService {
  createSender() {
    throw new Error("Not implemented");
  }

  sendNotification(message) {
    const sender = this.createSender();
    sender.send(message);
  }
}
```

سپس هر کلاس فرزند مشخص می‌کند چه نوع Sender ساخته شود:

```javascript
class SmsNotificationService extends NotificationService {
  createSender() {
    return new SmsSender();
  }
}

class EmailNotificationService extends NotificationService {
  createSender() {
    return new EmailSender();
  }
}
```

کلاس‌های واقعی ارسال‌کننده:

```javascript
class SmsSender {
  send(message) {
    console.log(`ارسال پیامک: ${message}`);
  }
}

class EmailSender {
  send(message) {
    console.log(`ارسال ایمیل: ${message}`);
  }
}
```

حالا می‌توانیم سرویس مناسب را انتخاب کنیم:

```javascript
const service = new SmsNotificationService();

service.sendNotification(
  "جواب آزمایش شما آماده است."
);
```

در این حالت، متد `createSender()` یک `SmsSender` می‌سازد.

برای ارسال ایمیل:

```javascript
const service = new EmailNotificationService();

service.sendNotification(
  "جواب آزمایش شما آماده است."
);
```

این بار همان متد `createSender()` یک `EmailSender` می‌سازد.

---

**نکته اصلی**

کلاس اصلی مستقیماً این کار را انجام نمی‌دهد:

```javascript
new SmsSender();
```

بلکه ساختن Sender مناسب را به کلاس فرزند می‌سپارد:

```javascript
const sender = this.createSender();
```

بنابراین اگر بعداً بخواهیم ارسال از طریق WhatsApp را اضافه کنیم، فقط یک کلاس جدید اضافه می‌کنیم:

```javascript
class WhatsAppNotificationService extends NotificationService {
  createSender() {
    return new WhatsAppSender();
  }
}
```

پس **Factory Method** یعنی کلاس پایه روند کلی کار را مشخص می‌کند، اما کلاس‌های فرزند تصمیم می‌گیرند دقیقاً چه آبجکتی ساخته شود.

---

یک مثال واقعی برای **Abstract Factory** می‌تواند اتصال نرم‌افزار به چند شرکت پرداخت باشد.

فرض کن برنامه از دو درگاه پشتیبانی می‌کند:

> درگاه ملت
>
> درگاه سامان

هر درگاه فقط یک کلاس ندارد، بلکه چند کلاس مرتبط با خودش دارد:

```
ملت:
MellatClient
MellatRequestMapper
MellatResponseValidator

سامان:
SamanClient
SamanRequestMapper
SamanResponseValidator
```

این کلاس‌ها باید با هم هماهنگ باشند. مثلاً نباید درخواست را با `MellatRequestMapper` بسازیم ولی نتیجه را با `SamanResponseValidator` بررسی کنیم.

---

**تعریف Factory اصلی**

```javascript
class PaymentFactory {
  createClient() {
    throw new Error("Not implemented");
  }

  createRequestMapper() {
    throw new Error("Not implemented");
  }

  createResponseValidator() {
    throw new Error("Not implemented");
  }
}
```

**خانواده مربوط به ملت**

```javascript
class MellatPaymentFactory extends PaymentFactory {
  createClient() {
    return new MellatClient();
  }

  createRequestMapper() {
    return new MellatRequestMapper();
  }

  createResponseValidator() {
    return new MellatResponseValidator();
  }
}
```

**خانواده مربوط به سامان**

```javascript
class SamanPaymentFactory extends PaymentFactory {
  createClient() {
    return new SamanClient();
  }

  createRequestMapper() {
    return new SamanRequestMapper();
  }

  createResponseValidator() {
    return new SamanResponseValidator();
  }
}
```

**استفاده در برنامه**

```javascript
class PaymentService {
  constructor(factory) {
    this.client = factory.createClient();
    this.mapper = factory.createRequestMapper();
    this.validator = factory.createResponseValidator();
  }

  async pay(order) {
    const request = this.mapper.map(order);

    const response = await this.client.send(request);

    return this.validator.validate(response);
  }
}
```

---

برای استفاده از درگاه ملت:

```javascript
const factory = new MellatPaymentFactory();
const paymentService = new PaymentService(factory);

paymentService.pay(order);
```

برای تغییر به سامان فقط Factory را عوض می‌کنیم:

```javascript
const factory = new SamanPaymentFactory();
const paymentService = new PaymentService(factory);

paymentService.pay(order);
```

**نکته اصلی**

**در Abstract Factory یک آبجکت ساخته نمی‌شود؛ بلکه یک مجموعه از آبجکت‌های مرتبط و هماهنگ ساخته می‌شود.**

```
MellatFactory
    ├── MellatClient
    ├── MellatRequestMapper
    └── MellatResponseValidator
```

این کار مانع ترکیب اشتباه کلاس‌های ارائه‌دهندگان مختلف می‌شود و اضافه‌کردن یک درگاه جدید را ساده‌تر می‌کند.

---

یک مثال واقعی برای **Prototype** می‌تواند ساخت گزارش‌های پزشکی از روی یک قالب آماده باشد.

فرض کن ساخت هر گزارش شامل تنظیمات زیادی است:

> لوگو و مشخصات مرکز
>
> سربرگ و پابرگ
>
> فونت و قالب‌بندی
>
> بخش‌های ثابت گزارش
>
> اطلاعات پزشک
>
> تنظیمات چاپ

به‌جای اینکه این تنظیمات را برای هر بیمار دوباره انجام دهیم، یک گزارش آماده می‌سازیم و از روی آن کپی می‌گیریم.

```javascript
class MedicalReport {
  constructor(data) {
    this.data = data;
  }

  clone() {
    return new MedicalReport(
      structuredClone(this.data)
    );
  }
}
```

ابتدا Prototype اصلی را می‌سازیم:

```javascript
const mriReportPrototype = new MedicalReport({
  clinicName: "مرکز تصویربرداری ایکس",
  reportType: "MRI",
  doctorName: "دکتر احمدی",
  logo: "logo.png",
  sections: [
    "Findings",
    "Impression"
  ],
  patient: null,
  reportText: ""
});
```

حالا برای هر بیمار، به‌جای ساخت گزارش از ابتدا، از قالب آماده کپی می‌گیریم:

```javascript
const report1 = mriReportPrototype.clone();

report1.data.patient = {
  name: "علی رضایی",
  fileNumber: 12045
};

report1.data.reportText =
  "No significant abnormality was detected.";
```

برای بیمار بعدی هم دوباره Clone می‌گیریم:

```javascript
const report2 = mriReportPrototype.clone();

report2.data.patient = {
  name: "زهرا محمدی",
  fileNumber: 12046
};

report2.data.reportText =
  "Mild disc bulging is noted.";
```

در این مثال، هر گزارش:

> قالب و تنظیمات اصلی را از Prototype می‌گیرد.
>
> آبجکت مستقلی دارد.
>
> فقط اطلاعات بیمار و متن گزارش آن تغییر می‌کند.

**نکته اصلی**

**Prototype یعنی از یک آبجکت آماده و تنظیم‌شده کپی بگیریم و فقط بخش‌های لازم را تغییر دهیم.**

این الگو زمانی مناسب است که ساخت یا تنظیم اولیه آبجکت پیچیده، زمان‌بر یا پرهزینه باشد.

همچنین باید مراقب باشیم Clone به‌صورت عمیق انجام شود؛ وگرنه ممکن است بخش‌های داخلی مثل `sections` بین چند گزارش مشترک بمانند و تغییر یکی روی بقیه اثر بگذارد.
---
<!-- FRONTDOCS_PART:4 -->

**خوب حالا بریم سراغ شاخه دوم: Structural Patterns**

از **Structural Patterns** زمانی استفاده می‌کنیم که کلاس‌ها درست کار می‌کنند، اما ارتباط بین آن‌ها پیچیده یا نامرتب شده است؛ مثلاً:

> یک سرویس خارجی ساختار متفاوتی دارد.
>
> برای استفاده از یک سیستم باید چند مرحله پیچیده انجام دهیم.
>
> کلاس‌ها بیش از حد به جزئیات یکدیگر وابسته شده‌اند.
>
> ترکیب و ارتباط آبجکت‌ها سخت شده است.

---

**قدم اول: آیا دو بخش، رابط‌های متفاوتی دارند؟**

گاهی برنامه ما انتظار دارد یک متد با این شکل وجود داشته باشد:

```javascript
payment_processor.process(amount, card)
```

اما شرکت پرداخت یا کتابخانه خارجی متدی با نام و ترتیب پارامترهای متفاوت ارائه می‌دهد:

```javascript
provider.execute_payment(card_info, transaction_amount)
```

با اینکه هر دو متد یک کار انجام می‌دهند، رابط آن‌ها با هم سازگار نیست.

**در این حالت از Adapter استفاده می‌کنیم.**
Adapter مانند یک مترجم بین برنامه ما و سرویس خارجی عمل می‌کند.

```javascript
class ProviderAdapter
  def initialize(provider)
    @provider = provider
  end

  def process(amount, card)
    @provider.execute_payment(
      card.to_provider_format,
      amount
    )
  end
end
```

حالا برنامه همچنان با همان رابط مورد انتظار خودش کار می‌کند:

```javascript
payment_processor.process(amount, card)
```

اما Adapter در پشت صحنه:

> اطلاعات کارت را به فرمت مورد انتظار شرکت پرداخت تبدیل می‌کند.
>
> ترتیب پارامترها را تغییر می‌دهد.
>
> متد مناسب سرویس خارجی را صدا می‌زند.

---

در تصویر نیز همین روند دیده می‌شود.
بنابراین کد اصلی برنامه لازم نیست نام متدها یا ساختار اطلاعات هر شرکت پرداخت را بداند.

**نکته مهم**
**وظیفه Adapter فقط تبدیل رابط، نام‌ها و شکل داده‌ها است.**

منطق‌هایی مثل این‌ها بهتر است داخل Adapter قرار نگیرند:

> محاسبه تخفیف
>
> بررسی موجودی
>
> تعیین کارمزد
>
> تصمیم‌گیری درباره تأیید یا رد پرداخت

این موارد منطق کسب‌وکار هستند و باید در کلاس جداگانه‌ای قرار بگیرند.
⁧Adapter زمانی مناسب است که دو بخش کار مشابهی انجام می‌دهند، اما زبان و رابط متفاوتی دارند. Adapter بین آن‌ها قرار می‌گیرد و این تفاوت را ترجمه می‌کند.

![در تصویر نیز همین روند دیده می‌شود.](/generated/media/design-patterns/385-1.jpg)

---

**قدم دوم: آیا استفاده از یک بخش از سیستم بیش از حد پیچیده شده است؟**

گاهی برای انجام یک کار ساده، باید چند مرحله مختلف را با ترتیب درست اجرا کنیم.

مثلاً برای تبدیل یک ویدئو ممکن است لازم باشد:

> فایل ورودی بررسی شود.
>
> ویدئو به فرمت جدید تبدیل شود.
>
> اطلاعات فایل استخراج شود.
>
> فایل خروجی روی سرور آپلود شود.
>
> فایل‌های موقت پاک شوند.

اگر کد اصلی برنامه بخواهد همه این مراحل را خودش اجرا کند، هم شلوغ می‌شود و هم ممکن است ترتیب مراحل اشتباه شود.

در این شرایط از **Facade** استفاده می‌کنیم.

---

Facade یک رابط ساده روی یک سیستم پیچیده قرار می‌دهد. در نتیجه Client فقط یک متد را صدا می‌زند:

```javascript
videoConverter.convert(file, format);
```

اما Facade در پشت صحنه همه مراحل را با ترتیب درست اجرا می‌کند:

```javascript
class VideoConverterFacade {
  convert(file, format) {
    const videoInfo = probeInput(file);

    const outputFile = transcode(
      file,
      format,
      videoInfo
    );

    const metadata = extractMetadata(outputFile);

    upload(outputFile, metadata);

    cleanup(file, outputFile);
  }
}
```

---

در تصویر نیز Client فقط این دستور را اجرا می‌کند:

```javascript
convert(file, format)
```

سپس `VideoConverterFacade` خودش این مراحل را مدیریت می‌کند:

```
بررسی فایل ورودی
      ↓
تبدیل ویدئو
      ↓
استخراج اطلاعات
      ↓
آپلود
      ↓
پاک‌سازی
```

**نکته اصلی**

**Facade پیچیدگی داخل سیستم را پنهان می‌کند و یک راه ساده و امن برای استفاده از آن ارائه می‌دهد.**

یعنی به‌جای اینکه Client چند کلاس و چند متد مختلف را با ترتیب درست صدا بزند، فقط با Facade کار می‌کند.

Facade معمولاً منطق اصلی آن بخش‌ها را تغییر نمی‌دهد؛ فقط استفاده از آن‌ها را ساده‌تر می‌کند.

![در تصویر نیز Client فقط این دستور را اجرا می‌کند:](/generated/media/design-patterns/388-1.jpg)

---

**قدم سوم: آیا چند قابلیت اختیاری را می‌خواهیم بدون اینکه کلاس‌های زیادی بسازیم؟**

گاهی یک آبجکت پایه داریم و می‌خواهیم بعضی قابلیت‌ها را به‌صورت اختیاری به آن اضافه کنیم؛ مثلاً:

> ثبت لاگ
>
> رمزنگاری
>
> فشرده‌سازی
>
> کش‌کردن

فرض کن یک `FileStream` ساده داریم که فایل را می‌خواند و می‌نویسد.

حالا ممکن است در یک بخش فقط فشرده‌سازی بخواهیم:

```javascript
FileStream
+ Compression
```

در بخش دیگر رمزنگاری و فشرده‌سازی را با هم بخواهیم:

```javascript
FileStream
+ Compression
+ Encryption
```

و در جای دیگری علاوه بر این‌ها، ثبت لاگ هم لازم باشد:

```javascript
FileStream
+ Compression
+ Encryption
+ Logging
```

اگر برای هر ترکیب یک کلاس جدا بسازیم، تعداد کلاس‌ها خیلی زیاد می‌شود:

```javascript
EncryptedFileStream
CompressedFileStream
LoggedFileStream
EncryptedCompressedFileStream
LoggedEncryptedCompressedFileStream
...
```

در این شرایط از **Decorator** استفاده می‌کنیم.

---

Decorator مانند یک لایه دور آبجکت اصلی قرار می‌گیرد و یک قابلیت جدید به آن اضافه می‌کند، بدون اینکه کلاس اصلی را تغییر دهیم.

در تصویر، آبجکت اصلی این است:

```
FileStream
```

سپس چند Decorator دور آن قرار گرفته‌اند:

```
LoggingDecorator
    ↓
EncryptionDecorator
    ↓
CompressionDecorator
    ↓
FileStream
```

هر لایه وظیفه خودش را انجام می‌دهد:

`CompressionDecorator` داده را فشرده یا از حالت فشرده خارج می‌کند.
`EncryptionDecorator` داده را رمزنگاری یا رمزگشایی می‌کند.
`LoggingDecorator` عملیات خواندن و نوشتن را ثبت می‌کند.

![Decorator مانند یک لایه دور آبجکت اصلی قرار می‌گیرد و یک قابلیت جدید به آن اضافه می‌کند، بدون اینکه کلاس اصلی را تغییر د](/generated/media/design-patterns/390-1.jpg)

---

مثال ساده

```javascript
let stream = new FileStream("report.txt");

stream = new CompressionDecorator(stream);
stream = new EncryptionDecorator(stream);
stream = new LoggingDecorator(stream);

stream.write(data);
```

وقتی `write()` اجرا شود، درخواست از لایه‌ها عبور می‌کند:

```
Logging
   ↓
Encryption
   ↓
Compression
   ↓
FileStream
```

یعنی ابتدا عملیات ثبت می‌شود، سپس داده رمزنگاری و فشرده می‌شود و در نهایت داخل فایل نوشته می‌شود.

**مزیت اصلی**

با Decorator می‌توانیم قابلیت‌ها را آزادانه ترکیب کنیم:

```javascript
const simpleStream =
  new FileStream("file.txt");

const compressedStream =
  new CompressionDecorator(simpleStream);

const secureStream =
  new EncryptionDecorator(
    new CompressionDecorator(simpleStream)
  );
```

بدون اینکه برای هر ترکیب، کلاس جدیدی بسازیم.

---

**نکته مهم**

هر Decorator بهتر است:

> کوچک باشد.
>
> فقط یک وظیفه مشخص داشته باشد.
>
> همان Interface آبجکت اصلی را حفظ کند.
>
> به ترتیب و جزئیات Decoratorهای دیگر وابسته نباشد.

چون اگر لایه‌ها بیش از حد به هم وابسته شوند، فهمیدن ترتیب اجرا و نتیجه نهایی سخت می‌شود.

Decorator زمانی مناسب است که بخواهیم قابلیت‌هایی را به‌صورت اختیاری و ترکیبی به یک آبجکت اضافه کنیم، بدون اینکه کلاس اصلی را تغییر دهیم یا تعداد زیادی کلاس فرزند بسازیم.

---

**قدم چهارم: آیا به یک آبجکت واسط نیاز داریم؟**

گاهی نمی‌خواهیم Client مستقیماً با آبجکت اصلی کار کند. در این حالت یک آبجکت واسط به نام **Proxy** بین آن‌ها قرار می‌دهیم.

Proxy از بیرون شبیه آبجکت اصلی است، اما قبل از دسترسی به آن می‌تواند کارهای دیگری انجام دهد؛ مثل:

> Lazy Loading
>
> ذخیره نتیجه در Cache
>
> بررسی سطح دسترسی
>
> ثبت لاگ
>
> ارتباط با یک سرویس از راه دور

---

**مثال تصویر: بارگذاری تصویر**

فرض کن `RealImage` یک تصویر بزرگ را از دیسک یا اینترنت بارگذاری می‌کند. اگر تصویر را همان ابتدای کار بارگذاری کنیم، ممکن است بی‌دلیل زمان و حافظه مصرف شود.

به همین دلیل Client به‌جای `RealImage` با `ImageProxy` کار می‌کند:

```javascript
const image = new ImageProxy("large-image.jpg");

image.display();
```

روند کار:

1. Client متد `display()` را روی Proxy اجرا می‌کند.
2. Proxy بررسی می‌کند که تصویر اصلی قبلاً بارگذاری شده است یا نه.
3. اگر بارگذاری نشده باشد، یک `RealImage` می‌سازد.
4. سپس متد `display()` تصویر اصلی را اجرا می‌کند.
5. در دفعات بعدی از همان تصویر موجود استفاده می‌شود.

![مثال تصویر: بارگذاری تصویر](/generated/media/design-patterns/394-1.jpg)

---

```javascript
class ImageProxy {
  constructor(path) {
    this.path = path;
    this.realImage = null;
  }

  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.path);
    }

    this.realImage.display();
  }
}
```

کلاس اصلی:

```javascript
class RealImage {
  constructor(path) {
    this.path = path;
    this.load();
  }

  load() {
    console.log("تصویر در حال بارگذاری است...");
  }

  display() {
    console.log("تصویر نمایش داده شد");
  }
}
```

**چرا مستقیم از RealImage استفاده نکنیم؟**

اگر مستقیم این کار را انجام دهیم:

```javascript
const image = new RealImage("large-image.jpg");
```

تصویر همان لحظه بارگذاری می‌شود، حتی اگر هیچ‌وقت نمایش داده نشود.

اما Proxy بارگذاری را تا زمانی که واقعاً لازم باشد عقب می‌اندازد.

---

**یک مثال دیگر: کنترل دسترسی**

Proxy می‌تواند قبل از اجرای عملیات، دسترسی کاربر را بررسی کند:

```javascript
class ReportProxy {
  constructor(user, reportService) {
    this.user = user;
    this.reportService = reportService;
  }

  viewReport(reportId) {
    if (!this.user.canViewReports) {
      throw new Error("شما اجازه مشاهده گزارش را ندارید");
    }

    return this.reportService.viewReport(reportId);
  }
}
```

در اینجا Client فکر می‌کند با سرویس گزارش کار می‌کند، اما Proxy ابتدا مجوز کاربر را بررسی می‌کند.
**نکته اصلی**

**Proxy جانشین موقت آبجکت اصلی می‌شود و دسترسی به آن را کنترل می‌کند.**

ساختار ساده آن:

```
Client
   ↓
Proxy
   ↓
Real Object
```

تفاوت اصلی Proxy با Decorator این است که:

> **Decorator** قابلیت جدیدی به آبجکت اضافه می‌کند.
>
> **Proxy** دسترسی به آبجکت را مدیریت یا کنترل می‌کند.

---

**قدم پنجم: آیا ساختار درختی داریم و می‌خواهیم همه اجزا یکسان مدیریت شوند؟**

گاهی داده‌های برنامه به‌صورت درختی هستند؛ یعنی بعضی آبجکت‌ها می‌توانند آبجکت‌های دیگری را داخل خودشان نگه دارند.

مثلاً در سیستم فایل:

> فایل، یک عضو ساده است.
>
> پوشه، می‌تواند شامل فایل و پوشه‌های دیگر باشد.

---

در تصویر، پوشه `root` شامل این موارد است:

```
root
├── a.txt
├── pictures
│   ├── img1.png
│   └── img2.png
└── docs
    └── spec.pdf
```

اینجا فایل‌ها و پوشه‌ها با هم تفاوت دارند:

> فایل زیرمجموعه‌ای ندارد.
>
> پوشه می‌تواند چند فایل یا پوشه دیگر داشته باشد.

اما می‌خواهیم Client بتواند با هر دو به یک شکل کار کند؛ مثلاً روی فایل یا پوشه، متد `operation()` را اجرا کند.

در این شرایط از **Composite** استفاده می‌کنیم.

![در تصویر، پوشه root شامل این موارد است:](/generated/media/design-patterns/398-1.jpg)

---

**ساختار اصلی**

هم فایل و هم پوشه یک Interface مشترک دارند:

```javascript
class FileSystemItem {
  operation() {
    throw new Error("Not implemented");
  }
}
```

کلاس فایل:

```javascript
class File extends FileSystemItem {
  constructor(name) {
    super();
    this.name = name;
  }

  operation() {
    console.log(`انجام عملیات روی فایل ${this.name}`);
  }
}
```

کلاس پوشه:

```javascript
class Folder extends FileSystemItem {
  constructor(name) {
    super();
    this.name = name;
    this.children = [];
  }

  add(item) {
    this.children.push(item);
  }

  operation() {
    console.log(`انجام عملیات روی پوشه ${this.name}`);

    for (const item of this.children) {
      item.operation();
    }
  }
}
```

حالا ساختار تصویر را می‌سازیم:

```javascript
const root = new Folder("root");

const pictures = new Folder("pictures");
pictures.add(new File("img1.png"));
pictures.add(new File("img2.png"));

const docs = new Folder("docs");
docs.add(new File("spec.pdf"));

root.add(new File("a.txt"));
root.add(pictures);
root.add(docs);
```

Client فقط این دستور را اجرا می‌کند:

```javascript
root.operation();
```

پوشه `root` عملیات را روی تمام فایل‌ها و پوشه‌های داخلی اجرا می‌کند.

---

**نکته اصلی**

در الگوی Composite، آبجکت ساده و آبجکت گروهی از یک رابط مشترک استفاده می‌کنند:

```
File   ──┐
         ├── operation()
Folder ──┘
```

به همین دلیل Client لازم نیست برای فایل و پوشه کد جداگانه بنویسد.

**مثال‌های دیگر**

Composite فقط برای فایل و پوشه نیست. در این موارد هم کاربرد دارد:

> منو و زیرمنو
>
> دسته‌بندی محصولات
>
> کامپوننت‌های تو‌در‌توی رابط کاربری
>
> ساختار سازمانی شرکت
>
> فصل، بخش و پاراگراف یک سند
>
> کامنت و پاسخ‌های تو‌در‌تو

Composite زمانی مناسب است که ساختار درختی داریم و می‌خواهیم یک عضو ساده و یک مجموعه از اعضا را به یک شکل مدیریت کنیم.

---

**قدم ششم: آیا تعداد زیادی آبجکت، اطلاعات تکراری را نگه می‌دارند؟**

گاهی برنامه تعداد بسیار زیادی آبجکت می‌سازد و هرکدام بخشی از اطلاعات یکسان را داخل خود نگه می‌دارند. این تکرار می‌تواند حافظه زیادی مصرف کند.

در این شرایط از **Flyweight** استفاده می‌کنیم.

---

**مثال واقعی: ویرایشگر متن**

فرض کن یک ویرایشگر، برای هر حرف یک آبجکت می‌سازد:

```
حرف A:
فونت Arial
اندازه 14
رنگ مشکی
موقعیت 10

حرف B:
فونت Arial
اندازه 14
رنگ مشکی
موقعیت 11
```

فونت، اندازه و رنگ در هر دو حرف یکسان هستند. اگر یک سند یک‌میلیون حرف داشته باشد، ذخیره دوباره این اطلاعات برای هر حرف حافظه زیادی مصرف می‌کند.

در Flyweight، اطلاعات مشترک فقط یک‌بار ساخته می‌شوند:

```
FormatFlyweight:
Arial + 14 + Black
```

بعد همه حروفی که همین ظاهر را دارند، از همان آبجکت مشترک استفاده می‌کنند:

```
Character A ──┐
Character B ──┼── FormatFlyweight مشترک
Character C ──┘
```

اما اطلاعات مخصوص هر حرف، مثل موقعیت آن، جدا باقی می‌ماند.

**دو نوع اطلاعات در Flyweight**

**اطلاعات مشترک یا Intrinsic State:**

> نام فونت
>
> اندازه فونت
>
> رنگ
>
> نوع استایل

این اطلاعات داخل Flyweight نگهداری می‌شوند.

**اطلاعات مخصوص هر آبجکت یا Extrinsic State:**

> موقعیت حرف
>
> شماره خط
>
> مختصات نمایش

این اطلاعات بیرون از Flyweight باقی می‌مانند.

![مثال واقعی: ویرایشگر متن](/generated/media/design-patterns/402-1.jpg)

---

**مثال ساده**

```javascript
class TextFormat {
  constructor(font, size, color) {
    this.font = font;
    this.size = size;
    this.color = color;
  }
}
```

Factory فرمت‌های ساخته‌شده را نگه می‌دارد:

```javascript
class FormatFactory {
  constructor() {
    this.formats = new Map();
  }

  getFormat(font, size, color) {
    const key = `${font}-${size}-${color}`;

    if (!this.formats.has(key)) {
      this.formats.set(
        key,
        new TextFormat(font, size, color)
      );
    }

    return this.formats.get(key);
  }
}
```

حالا چند حرف می‌توانند از یک فرمت مشترک استفاده کنند:

```javascript
const factory = new FormatFactory();

const sharedFormat = factory.getFormat(
  "Arial",
  14,
  "black"
);

const charA = {
  value: "A",
  position: 10,
  format: sharedFormat
};

const charB = {
  value: "B",
  position: 11,
  format: sharedFormat
};

console.log(charA.format === charB.format); // true
```

`charA` و `charB` موقعیت متفاوتی دارند، اما فرمت آن‌ها یک آبجکت مشترک است.

---

**نکته اصلی تصویر بالا**

در تصویر، `FlyweightFactory` با استفاده از یک `formatKey` بررسی می‌کند که فرمت موردنظر قبلاً ساخته شده یا نه.

اگر وجود داشته باشد، همان `FormatFlyweight` قبلی را برمی‌گرداند؛ در نتیجه برای هر حرف یک فرمت جدید ساخته نمی‌شود.

**چه زمانی مناسب است؟**
Flyweight زمانی مفید است که:

> تعداد آبجکت‌ها بسیار زیاد باشد.
>
> بخش زیادی از اطلاعات آن‌ها یکسان باشد.
>
> تکرار این اطلاعات حافظه زیادی مصرف کند.
>
> اطلاعات مشترک معمولاً تغییر نکنند.

مثلاً در:

> ویرایشگرهای متن
>
> موتورهای بازی
>
> سیستم‌های نقشه
>
> رندر تعداد زیادی آیکون یا شکل
>
> مدل‌های بزرگ داخل حافظه

Flyweight یعنی اطلاعات تکراری را از آبجکت‌ها جدا کنیم و فقط یک نمونه مشترک از آن‌ها نگه داریم تا مصرف حافظه کاهش پیدا کند.

---

**قدم هفتم: آیا دو بخش از سیستم باید مستقل از هم تغییر کنند؟**

گاهی یک سیستم از دو بخش جدا تشکیل شده که هرکدام ممکن است مستقل تغییر کنند.

در مثال تصویر، دو بخش داریم:
> نوع کنترل: BasicRemote یا AdvancedRemote
>
> نوع دستگاه: TV یا Radio
اگر برای هر ترکیب یک کلاس جدا بسازیم، تعداد کلاس‌ها زیاد می‌شود:

```
BasicTVRemote
BasicRadioRemote
AdvancedTVRemote
AdvancedRadioRemote
```

اگر بعداً دستگاه جدیدی مثل `Speaker` یا کنترل جدیدی مثل `VoiceRemote` اضافه شود، تعداد ترکیب‌ها باز هم بیشتر می‌شود.

در این شرایط از **Bridge** استفاده می‌کنیم.

![قدم هفتم: آیا دو بخش از سیستم باید مستقل از هم تغییر کنند؟](/generated/media/design-patterns/405-1.jpg)

---

**ایده اصلی Bridge**

کنترل و دستگاه را از هم جدا می‌کنیم و بین آن‌ها یک ارتباط ایجاد می‌کنیم:

```
RemoteControl
      ↓
    Device
```

کنترل فقط می‌داند که با یک `Device` کار می‌کند و لازم نیست بداند آن دستگاه تلویزیون است یا رادیو.
**Interface دستگاه**

```javascript
class Device {
  turnOn() {
    throw new Error("Not implemented");
  }

  turnOff() {
    throw new Error("Not implemented");
  }
}
```

پیاده‌سازی‌های مختلف دستگاه:

```javascript
class TV extends Device {
  turnOn() {
    console.log("تلویزیون روشن شد");
  }

  turnOff() {
    console.log("تلویزیون خاموش شد");
  }
}

class Radio extends Device {
  turnOn() {
    console.log("رادیو روشن شد");
  }

  turnOff() {
    console.log("رادیو خاموش شد");
  }
}
```

کنترل پایه

```javascript
class BasicRemote {
  constructor(device) {
    this.device = device;
  }

  turnOn() {
    this.device.turnOn();
  }

  turnOff() {
    this.device.turnOff();
  }
}
```

کنترل پیشرفته هم می‌تواند قابلیت‌های بیشتری داشته باشد:

```javascript
class AdvancedRemote extends BasicRemote {
  mute() {
    console.log("صدا قطع شد");
  }
}
```

**استفاده**

کنترل پایه برای تلویزیون:

```javascript
const tv = new TV();
const remote = new BasicRemote(tv);

remote.turnOn();
```

کنترل پیشرفته برای رادیو:

```javascript
const radio = new Radio();
const remote = new AdvancedRemote(radio);

remote.turnOn();
remote.mute();
```

---

**مزیت اصلی**

حالا نوع کنترل و نوع دستگاه مستقل از هم تغییر می‌کنند.

می‌توانیم بدون تغییر کنترل‌ها، دستگاه جدید اضافه کنیم:

```javascript
class Speaker extends Device {
  turnOn() {
    console.log("اسپیکر روشن شد");
  }
}
```

یا بدون تغییر دستگاه‌ها، کنترل جدید بسازیم:

```javascript
class VoiceRemote extends BasicRemote {
  voiceCommand(command) {
    console.log(`اجرای فرمان: ${command}`);
  }
}
```

Bridge زمانی مناسب است که سیستم دو بخش مستقل و قابل‌تغییر دارد و نمی‌خواهیم برای تمام ترکیب‌های آن‌ها کلاس جداگانه بسازیم. در تصویر، کنترل‌ها یک طرف و دستگاه‌ها طرف دیگر Bridge هستند.

---

خلاصه مطالبی که گفتیم داخل این عکس خلاصه میشه.

![خلاصه مطالبی که گفتیم داخل این عکس خلاصه میشه.](/generated/media/design-patterns/408-1.jpg)
