# Farmy - نظام إدارة المزرعة

## 🚀 التعديلات الأخيرة

### ✅ تم إصلاح مشكلة الاتصال بـ Supabase
- استخدام `@supabase/supabase-js` library بدل REST API المباشر
- Publishable Key (`sb_publishable_...`) يشتغل صح مع المكتبة

### ✅ تم تعديل الأيقونة
- قصت من padding الأبيض
- كبرت لتملا المربع بالكامل (1024×1024)
- ولدت كل مقاسات Android المطلوبة

### ✅ تم تعديل النصوص
- "إدارة ذكية لمزرعتك الزراعية" → "إدارة ذكية لمزرعتك"
- شيلت سطر `🔑 admin/1234` (بيانات تجريبية)

## 📦 الملفات المعدلة

| الملف | التعديل |
|-------|---------|
| `src/App.jsx` | شيلت "الزراعية" + شيلت admin/1234 |
| `src/supabase.js` | استخدمت `@supabase/supabase-js` library |
| `public/icons/` | أيقونات معدلة بدون padding |
| `android/app/src/main/res/mipmap-*/` | أيقونات Android بكل المقاسات |

## ⚠️ خطوات مهمة قبل البناء

### 1. تأكد من RLS Policies في Supabase

افتح SQL Editor في Supabase ونفذ:

```sql
-- تفعيل RLS
alter table expenses enable row level security;
alter table revenues enable row level security;
alter table inventory enable row level security;
alter table workers enable row level security;
alter table usage_log enable row level security;

-- السماح بالوصول
create policy "allow_all" on expenses for all using (true) with check (true);
create policy "allow_all" on revenues for all using (true) with check (true);
create policy "allow_all" on inventory for all using (true) with check (true);
create policy "allow_all" on workers for all using (true) with check (true);
create policy "allow_all" on usage_log for all using (true) with check (true);
```

### 2. تأكد من الجداول

الجداول المطلوبة:
- `expenses`
- `revenues`
- `inventory`
- `workers`
- `usage_log`

### 3. تثبيت الباكدجات

```bash
npm install
```

### 4. بناء APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

## 🔑 مفاتيح Supabase

| النوع | القيمة |
|-------|--------|
| URL | `https://eczbanusmdjfeenttusb.supabase.co` |
| Publishable Key | `sb_publishable_QsfpZIKxlH3WA-nALDXKJw_x44AiHXS` |

## 📱 بناء APK أوتوماتيكي

### GitHub Actions
- ملف `.github/workflows/build.yml` جاهز
- ارفع الكود على GitHub وهيبني APK أوتوماتيكي

### Codemagic
- ملف `codemagic.yaml` جاهز
- اربط المشروع بـ Codemagic وهيبني APK

---

**إصدار:** v6.1  
**تاريخ التعديل:** 2026-06-16
