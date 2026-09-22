#!/bin/bash
echo "======================================================"
echo "  شركة الفجر للتجارة والتقسيط - سرفر لينكس وماك"
echo "======================================================"

if ! command -v node &> /dev/null; then
    echo "[خطأ] يرجى تثبيت Node.js أولاً من https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "جاري تثبيت الحزم والمكتبات..."
    npm install
fi

mkdir -p data

echo "جاري تشغيل السيرفر المحلي على المنفذ 3000..."
npm run dev
