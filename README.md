# برنامه‌ی روزانه — THE ASCENT BLUEPRINT

> **هر روز یک قدم جلوتر** · «روز صفر تا قله»

یک اپلیکیشن وب نصب‌پذیر (PWA) شخصی برای برنامه‌ریزی روزانه، ردیابی عادت‌ها و
تحلیل پیشرفت — تماماً **فارسی، راست‌به‌چپ (RTL)** و با تقویم جلالی.

بدون نیاز به حساب کاربری، بدون سرور؛ تمام داده‌ها روی همین دستگاه در `localStorage`
ذخیره می‌شوند.

---

## ✨ امکانات

- **سه نما**: «امروز»، «عادت‌ها»، «آمار»
- **تقویم جلالی واقعی** با پیمایش روز/ماه، هفته از شنبه، نشانگرِ روزهای دارای داده
- **برنامه‌ی روزانه** با ردیف‌های قابل تیک و یادداشت
- **اولویت کارها** با چک‌باکس نئونی متحرک و خط‌خوردنِ انجام‌شده‌ها
- **اهداف امروز** و **درس‌های امروز** (یادداشت خط‌دار)
- **ماتریس هفتگی عادت‌ها** با پیشنهادهای آماده، رکورد و استریک
- **تحلیل هوشمند** با خلاصه‌ی فارسی خودکار و نمودارهای SVG سفارشی
- صداهای سینتزشده (WebAudio)، پشتیبان‌گیری JSON، نصب به‌صورت اپ، آفلاین
- طراحی گلسی (شیشه‌ای)، پس‌زمینه‌ی آئورا، و واکنش‌گرا از ۳۶۰ پیکسل تا دسکتاپ

## 🛠 فناوری‌ها

Vite · React · TypeScript · Tailwind CSS · date-fns-jalali

## 🚀 اجرا در محیط توسعه

```bash
npm install
npm run dev      # http://localhost:5173
```

## 📦 ساخت نسخه‌ی تولید

```bash
npm run build    # خروجی در پوشه‌ی dist
npm run preview  # پیش‌نمایش نسخه‌ی ساخته‌شده
```

---

## 🌐 استقرار (Deploy)

### گیت‌هاب (GitHub Pages) — پیشنهادی

1. مخزن را روی گیت‌هاب بسازید و کد را push کنید:

   ```bash
   git init
   git add .
   git commit -m "feat: برنامه‌ی روزانه"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

2. چون مسیر Pages روی `/<repo>/` است، `base` را در `vite.config.ts` تنظیم کنید:

   ```ts
   export default defineConfig({ base: '/<repo>/', plugins: [react()] });
   ```

3. در گیت‌هاب: **Settings ← Pages ← Source: GitHub Actions** و از پیش‌فرض
   «Deploy static content to Pages» (Node) استفاده کنید. خروجی پوشه‌ی `dist` است.

> نکته: سرویس‌ورکر (SW) فقط در پروتکل `https` فعال می‌شود؛ در Pages مشکلی ندارد.

### Netlify

1. در [netlify.com](https://www.netlify.com) روی **Add new site ← Import from Git**.
2. ریپازیتوری را متصل کنید؛ تنظیمات:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. فایل `public/_redirects` با محتوای زیر (برای SPA):

   ```
   /*    /index.html   200
   ```

### Vercel

1. در [vercel.com](https://vercel.com) روی **New Project** و ریپازیتوری را انتخاب کنید.
2. تنظیمات پیش‌فرض خودکار است (Vite را تشخیص می‌دهد):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. کافی است Deploy کنید — PWA و سرویس‌ورکر آماده‌اند.

---

## 🗂 ساختار داده

کلید ذخیره‌سازی: `ascent-data-v1`

```ts
{
  days: {
    "YYYY-MM-DD": {
      schedule: [{ id, note, done }],
      tasks:     [{ id, t, done }],
      goals:     ["..."],
      lessons:   "",
      habits:    { "<habitId>": true }
    }
  },
  habits:  [{ id, title, icon, color, createdAt }],
  settings: { sound: true }
}
```

## 🧩 ساخته شده با

عشق به پیشرفت یک قدم در روز · THE ASCENT BLUEPRINT — DAILY
