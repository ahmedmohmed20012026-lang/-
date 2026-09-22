import React, { useEffect, useRef, useState } from 'react';
import {
  Wifi,
  X,
  Copy,
  Check,
  Smartphone,
  Laptop,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Server
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';

export const LanNetworkModal: React.FC = () => {
  const { isLanModalOpen, setIsLanModalOpen, networkInfo, companySettings } = useApp();
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const primaryIp = networkInfo?.localIpAddresses?.[0] || '127.0.0.1';
  const port = networkInfo?.port || 3000;
  const accessUrl = `http://${primaryIp}:${port}`;

  useEffect(() => {
    if (isLanModalOpen && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, accessUrl, {
        width: 170,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    }
  }, [isLanModalOpen, accessUrl]);

  if (!isLanModalOpen) return null;

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedIp(url);
    setTimeout(() => setCopiedIp(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/30">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                ربط الشبكة المحلية والراوتر (LAN / Wi-Fi)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                اتصال الأجهزة الأخرى (أندرويد، ويندوز، آيباد) بنفس قاعدة البيانات المحلية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLanModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* QR Code & Direct Scan Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs shrink-0">
              <canvas ref={qrCanvasRef} />
              <div className="text-[10px] text-center text-slate-400 mt-1 font-mono">
                امسح بكاميرا الهاتف
              </div>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-right">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                  الخادم المحلي يعمل بنجاح
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  عنوان الوصول المباشر عبر الراوتر:
                </h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  افتح متصفح كروم في أي جهاز متصل بنفس الراوتر وأدخل هذا الرابط:
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                <code className="text-xs font-mono font-bold text-blue-700 break-all">
                  {accessUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(accessUrl)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="نسخ الرابط"
                >
                  {copiedIp === accessUrl ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* All Detected LAN IPs */}
          {networkInfo && networkInfo.localIpAddresses && networkInfo.localIpAddresses.length > 1 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700">
                عناوين IP الأخرى المكتشفة في محولات الشبكة:
              </h5>
              <div className="space-y-1.5">
                {networkInfo.localIpAddresses.map((ip) => {
                  const full = `http://${ip}:${port}`;
                  return (
                    <div
                      key={ip}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-slate-800 font-bold">{full}</span>
                      <button
                        onClick={() => copyToClipboard(full)}
                        className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        {copiedIp === full ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>نسخ</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guidelines for Multi-device Operation */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>كيفية تشغيل النظام على عدة أجهزة في المحل أو الشركة:</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">1. الجهاز الرئيسي (السيرفر)</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يبقى شغالاً وموصولاً بالراوتر، وهو الذي يحتوي على قاعدة البيانات الأصلية وتتم المزامنة عبره تلقائياً.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">2. الأجهزة الفرعية (الموظفين)</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تتصل بنفس شبكة الواي فاي للراوتر وتفتح الرابط أعلاه، وتسجل الدخول بحسابات المبيعات لمباشرة العمل فوراً.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsLanModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
