# 📱 خطوات بناء APK

## المتطلبات المسبقة
- Node.js 18+ (من nodejs.org)
- Android Studio (من developer.android.com/studio)
- JDK 17+

---

## الخطوة 1 — تثبيت المتطلبات
```bash
npm install
```

## الخطوة 2 — بناء التطبيق
```bash
npm run build
```
سيُنشئ مجلد `dist/`

## الخطوة 3 — إضافة منصة Android
```bash
npx cap add android
```

## الخطوة 4 — مزامنة الملفات
```bash
npx cap sync android
```

## الخطوة 5 — نسخ إعدادات Android
انسخ الملفات من مجلد `android-config/` إلى:
- `AndroidManifest.xml` → `android/app/src/main/AndroidManifest.xml`
- `build.gradle` → `android/app/build.gradle`

## الخطوة 6 — فتح Android Studio
```bash
npx cap open android
```

## الخطوة 7 — بناء APK
في Android Studio:
1. انتظر حتى ينتهي Gradle من التحميل
2. من القائمة: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
3. بعد الانتهاء اضغط **locate** لتجد الـ APK

📍 مكان الـ APK:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚡ طريقة أسرع — بدون Android Studio

### استخدام GitHub Actions (مجاناً):
1. ارفع المشروع على GitHub
2. أضف ملف `.github/workflows/build.yml` الموجود في المشروع
3. كل مرة ترفع كود، GitHub يبني APK تلقائياً

### استخدام Expo EAS Build:
```bash
npm install -g eas-cli
eas build --platform android
```

---

## 🔑 توقيع APK للنشر على Play Store
```bash
# إنشاء keystore
keytool -genkey -v -keystore farm-manager.keystore \
  -alias farm-manager -keyalg RSA -keysize 2048 -validity 10000

# بناء release APK
cd android
./gradlew assembleRelease
```

