# بناء ملف APK

## الطريقة 1: GitHub (بدون تثبيت أي شيء)
1. ارفع هذا المجلد إلى مستودع GitHub جديد.
2. من تبويب Actions شغّل "Build APK".
3. بعد دقائق نزّل الملف `bakery-apk` (فيه app-debug.apk) وأرسله للزبون.

## الطريقة 2: على جهازك (Android Studio + Node 22 + Java 21)
npm install --legacy-peer-deps
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug

الملف الناتج: android/app/build/outputs/apk/debug/app-debug.apk
عند التثبيت على هاتف الزبون: فعّل "التثبيت من مصادر غير معروفة".
