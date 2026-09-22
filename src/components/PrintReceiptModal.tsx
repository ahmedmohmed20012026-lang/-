import React, { useEffect, useRef } from 'react';
import {
  Printer,
  X,
  Building,
  CheckCircle,
  QrCode,
  Download,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';

export const PrintReceiptModal: React.FC = () => {
  const { activeReceiptForPrint, setActiveReceiptForPrint, companySettings, contracts } = useApp();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const receipt = activeReceiptForPrint;

  // Find related contract to show detailed remaining balance
  const contract = contracts.find((c) => c.id === receipt?.contractId);

  useEffect(() => {
    if (receipt && qrCanvasRef.current) {
      const qrData = `شركة: ${companySettings.companyName} | وصل سداد: ${receipt.receiptNumber} | العميل: ${receipt.customerName} | المبلغ: ${receipt.amount} ${companySettings.currencySymbol} | التاريخ: ${receipt.paymentDate}`;
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 110,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  }, [receipt, companySettings]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top Screen Action Bar (Hidden on print) */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">معاينة وصل السداد الإلكتروني</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة فورية</span>
            </button>
            <button
              onClick={() => setActiveReceiptForPrint(null)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-4 text-slate-900 font-['Cairo',sans-serif] space-y-5" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {companySettings.companyName}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              نظام إدارة المبيعات والأقساط والقروض النقدية
            </p>
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2 pt-0.5">
              <span>هاتف: {companySettings.phone}</span>
              {companySettings.altPhone && <span>• {companySettings.altPhone}</span>}
            </div>
            {companySettings.address && (
              <div className="text-[10px] text-slate-400">
                العنوان: {companySettings.address}
              </div>
            )}
            {companySettings.commercialRegister && (
              <div className="text-[10px] text-slate-400 font-mono">
                سجل تجاري: {companySettings.commercialRegister}
              </div>
            )}
          </div>

          {/* Receipt Title & Meta */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="font-bold text-slate-700">وصل سداد رسمي</div>
              <div className="font-mono text-[11px] text-blue-700 font-bold mt-0.5">
                رقم الوصل: {receipt.receiptNumber}
              </div>
            </div>

            <div className="text-left">
              <div className="text-slate-500 font-mono">{receipt.paymentDate}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                طريقة الدفع: {receipt.paymentMethod === 'cash' ? 'نقداً (كاش)' : 'دفع إلكتروني'}
              </div>
            </div>
          </div>

          {/* Customer & Contract Info */}
          <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3.5">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">اسم العميل:</span>
              <span className="font-bold text-slate-900">{receipt.customerName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">رقم العقد:</span>
              <span className="font-mono font-bold text-slate-800">{receipt.contractNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">رقم القسط المسدد:</span>
              <span className="font-bold text-slate-800">
                {receipt.installmentNumber === 0 ? 'الدفعة الأولى (المقدمة)' : `القسط الشهري رقم #${receipt.installmentNumber}`}
              </span>
            </div>

            {contract?.itemNameOrDescription && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">البيان / الخدمة:</span>
                <span className="font-medium text-slate-800">{contract.itemNameOrDescription}</span>
              </div>
            )}

            <div className="flex justify-between py-1">
              <span className="text-slate-500">المستلم / الصندوق:</span>
              <span className="font-medium text-slate-700">{receipt.collectedBy} ({receipt.collectorRole})</span>
            </div>
          </div>

          {/* Amount Paid Big Highlight Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl text-center space-y-1">
            <div className="text-[11px] text-slate-300 font-medium">المبلغ المسدد بهذا الوصل</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {receipt.amount.toLocaleString()} {companySettings.currencySymbol}
            </div>
            <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800">
              المتبقي بذمة العميل بالعقد: {receipt.remainingContractBalance.toLocaleString()} {companySettings.currencySymbol}
            </div>
          </div>

          {/* QR Code & Signature */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-center">
              <canvas ref={qrCanvasRef} className="mx-auto rounded-lg border border-slate-200" />
              <div className="text-[9px] text-slate-400 mt-1 font-mono">التحقق الرقمي للوصل</div>
            </div>

            <div className="space-y-6 text-center text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">توقيع وختم أمين الصندوق</div>
                <div className="h-9 border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px]">توقيع العميل المستلم</div>
                <div className="h-9 border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 leading-relaxed">
            {companySettings.receiptFooterNote || 'شكراً لتعاملكم معنا، يرجى الاحتفاظ بهذا الوصل كإثبات سداد رسمي.'}
          </div>
        </div>

        {/* Footer (Screen only) */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={() => setActiveReceiptForPrint(null)}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
