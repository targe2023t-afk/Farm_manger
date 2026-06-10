# 🛠️ دليل إصلاح Farmy — حل المشاكل الأربعة

---

## ✅ المشكلة 1: الكاميرا مش شغالة

### السبب
`AndroidManifest.xml` ناقص صلاحيات الكاميرا.

### الحل
1. انسخ `android-config/AndroidManifest.xml` إلى:
   ```
   android/app/src/main/AndroidManifest.xml
   ```

2. في الكود، استخدم `src/useCamera.js` بدل استدعاء الكاميرا مباشرة:
   ```jsx
   import { openCamera, requestCameraPermission } from "./useCamera";

   // في زرار الكاميرا:
   const photo = await openCamera();
   ```

3. بعد `npx cap sync`، شغّل التطبيق وهيطلب إذن الكاميرا تلقائياً.

---

## ✅ المشكلة 2: اسم التطبيق → Farmy + اللوجو الجديد

### الحل
1. استبدل `capacitor.config.json` بالملف الجديد (appName: "Farmy")

2. انسخ الأيقونات من `public/icons/` إلى مشروعك:
   ```
   public/icons/icon-1024x1024.png  ← الأصلية
   public/icons/icon-512x512.png
   public/icons/icon-192x192.png
   ... إلخ
   ```

3. بعد بناء المشروع، شغّل:
   ```bash
   npx cap sync android
   ```
   
   Capacitor هيستخدم الأيقونة تلقائياً من `public/icons/icon.png`

4. لو الأيقونة مش بتتغير، ثبّت أداة توليد الأيقونات:
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate --android
   ```

---

## ✅ المشكلة 3: عدم الاتصال بالسيرفر بعد التثبيت

### الحل
1. افتح `src/api.js` وغيّر عنوان السيرفر:
   ```js
   const SERVERS = {
     production: "https://YOUR-REAL-SERVER.com/api",  // ← هنا
   };
   ```

2. في `App.jsx`، في أول السطور استبدل:
   ```js
   // قديم ❌
   const API_BASE = "https://your-api-server.com/api";
   
   // جديد ✅
   import { API_BASE, apiFetch, checkServerConnection } from "./config/api";
   ```

3. في Codemagic، أضف متغير البيئة:
   - اسم: `VITE_API_URL`
   - قيمة: `https://your-server.com/api`

4. في `vite.config.js` أضف:
   ```js
   define: {
     __API_URL__: JSON.stringify(process.env.VITE_API_URL)
   }
   ```

---

## ✅ المشكلة 4: رسالة "إصدار قديم" في Codemagic

### السبب
السيرفر بيرفض الطلبات لأن `versionCode` في `build.gradle` قديم.

### الحل
1. افتح `android-config/build.gradle`:
   ```gradle
   versionCode 2        // ← زوّد الرقم كل build
   versionName "1.1.0"  // ← غيّر الإصدار
   ```

2. في السيرفر (`server.js`)، لو عندك فحص إصدار، تأكد إنه بيقبل:
   ```js
   const MIN_VERSION = "1.0.0"; // ← مش "2.0.0" أو رقم أعلى من إصدارك
   ```

3. إصدار `package.json` يتطابق:
   ```json
   "version": "1.1.0"
   ```

---

## 🚀 ترتيب التطبيق بعد التعديلات

```bash
# 1. ثبّت الباكدجات الجديدة
npm install

# 2. ابنِ المشروع
npm run build

# 3. زامن مع Android
npx cap sync android

# 4. انسخ الـ config
cp android-config/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
cp android-config/build.gradle android/app/build.gradle

# 5. ابنِ APK
cd android && ./gradlew assembleDebug
```

---

## 📦 الملفات في هذه الحزمة

| الملف | الوظيفة |
|-------|---------|
| `capacitor.config.json` | اسم Farmy + إذن الكاميرا |
| `package.json` | Capacitor 6 (أحدث إصدار) |
| `android-config/AndroidManifest.xml` | صلاحيات الكاميرا + الإنترنت |
| `android-config/build.gradle` | versionCode جديد |
| `src/api.js` | اتصال السيرفر + معالجة رسالة الإصدار |
| `src/useCamera.js` | فتح الكاميرا صح |
| `public/icons/` | أيقونة Farmy بكل المقاسات |
| `.github/workflows/build.yml` | بناء تلقائي على GitHub |
