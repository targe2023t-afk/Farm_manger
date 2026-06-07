# 🌾 نظام إدارة المزرعة الزراعية

## المميزات
- ✅ إدارة المصروفات والإيرادات
- ✅ إدارة المخزون مع مسح الباركود
- ✅ إدارة العمالة مع حساب الأجور تلقائياً
- ✅ تقارير مالية شاملة مع رسوم بيانية
- ✅ سجل التغييرات (Audit Log)
- ✅ نظام صلاحيات متكامل
- ✅ مزامنة مع السيرفر
- ✅ يعمل بدون إنترنت (offline first)

---

## 🚀 تشغيل المشروع

### الواجهة الأمامية (Frontend)
```bash
# في المجلد الرئيسي
npm install
npm run dev
# يفتح على http://localhost:3000
```

### السيرفر (Backend)
```bash
cd server
npm install

# انسخ ملف الإعدادات
cp .env.example .env
# عدّل .env وضع بياناتك

npm start
# يعمل على http://localhost:5000
```

---

## 📁 هيكل الملفات
```
farm-project/
├── src/
│   ├── App.jsx          ← التطبيق الكامل
│   └── main.jsx         ← نقطة الدخول
├── server/
│   ├── server.js        ← الخادم (Express + MongoDB)
│   ├── package.json
│   └── .env.example     ← نموذج الإعدادات
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🌐 ربط التطبيق بالسيرفر

في ملف `src/App.jsx` غيّر هذا السطر:
```js
const API_BASE = "https://your-api-server.com/api";
```
إلى عنوان السيرفر الحقيقي، مثلاً:
```js
const API_BASE = "http://localhost:5000/api";
// أو
const API_BASE = "https://api.myfarm.com/api";
```

---

## ☁️ نشر السيرفر على الإنترنت

### خيار ١: Railway (مجاني)
1. اذهب إلى railway.app
2. ارفع مجلد `server`
3. أضف متغيرات البيئة من `.env`

### خيار ٢: Render (مجاني)
1. اذهب إلى render.com
2. New → Web Service
3. ارفع مجلد `server`

### خيار ٣: VPS (DigitalOcean / Hostinger)
```bash
npm install -g pm2
pm2 start server.js --name farm-api
pm2 save
```

---

## 📱 تحويل لـ APK
```bash
# باستخدام Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init "Farm Manager" "com.farm.manager"
npm run build
npx cap add android
npx cap open android
# ثم من Android Studio: Build → Generate APK
```

---

## 🔑 بيانات الدخول التجريبية
| المستخدم | كلمة المرور | الصلاحية |
|----------|-------------|---------|
| admin    | 1234        | مدير   |
| ahmed    | 1234        | مشرف   |
