@echo off
chcp 65001 >nul
title تشغيل سرفر شركة الفجر للأقساط - LAN Server
color 0B

echo =====================================================================
echo          تشغيل سرفر نظام الأقساط والمبيعات (شركة الفجر)
echo =====================================================================
echo.

if not exist "node_modules\" (
    echo الحزم غير مثبتة بعد. جاري التثبيت التلقائي...
    call npm install
)

start http://localhost:3000
call npm run dev
pause
