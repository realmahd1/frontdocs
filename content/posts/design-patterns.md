---
title: خیلی وقت‌ها Design Pattern اشتباه نیست؛
description: >-
  خیلی وقت‌ها Design Pattern اشتباه نیست؛ ما فقط در زمان اشتباه سراغش می‌رویم.
  مثلاً چون تازه با Strategy آشنا شده‌ایم، سعی می‌کنیم هر if/else ای را با آن
  جایگزین کنیم. در حالی که…
date: '2026-07-03T13:50:39.000Z'
updatedAt: '2026-07-07T09:15:29.000Z'
author: M.Mahdi Saeidi
cover: /generated/covers/design-patterns-cover.svg
tags:
  - Design_Patterns
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

```javascript
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

```javascript
axios.post(
  "external-api.com/send",
  data
);
```

اینجا یک Adapter می‌تواند ارتباط را ساده کند:

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

**نکته اصلی:**
**Factory Method یعنی منطق ساخت آبجکت‌ها را از کد اصلی جدا کنیم و به کلاس‌های مخصوص بسپاریم.**

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

**Prototype زمانی مناسب است که کپی‌کردن یک آبجکت آماده، ساده‌تر یا سریع‌تر از ساختن دوباره آن از ابتدا باشد.**

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

```javascript
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

این مثال زمانی مناسب است که تنظیمات پس از شروع برنامه معمولاً تغییر نکنند و **فقط خوانده **شوند. برای تنظیمات متغیر مربوط به هر کاربر یا هر درخواست، **Singleton انتخاب مناسبی نیست.**

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

یک مثال واقعی از**Factory Method**می‌تواند سیستم ارسال اعلان در یک نرم‌افزار باشد.

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

**نکته اصلی

در Abstract Factory یک آبجکت ساخته نمی‌شود؛ بلکه یک مجموعه از آبجکت‌های مرتبط و هماهنگ ساخته می‌شود.
**

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
