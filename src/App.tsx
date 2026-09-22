import React from 'react';
import { useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { PaymentBoardManager } from './components/PaymentBoardManager';
import { InstallmentsManager } from './components/InstallmentsManager';
import { CustomersManager } from './components/CustomersManager';
import { ReportsManager } from './components/ReportsManager';
import { AuditTrailManager } from './components/AuditTrailManager';
import { SettingsManager } from './components/SettingsManager';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { LanNetworkModal } from './components/LanNetworkModal';
import { OverdueAlertsModal } from './components/OverdueAlertsModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';

export const App: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, isSyncing, companySettings } = useApp();

  // If user is not authenticated, show the login portal
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header />

      {/* Main Tabs Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'payments' && <PaymentBoardManager />}
        {activeTab === 'contracts' && <InstallmentsManager />}
        {activeTab === 'customers' && <CustomersManager />}
        {activeTab === 'reports' && <ReportsManager />}
        {activeTab === 'audit' && currentUser.role === 'manager' && <AuditTrailManager />}
        {activeTab === 'settings' && currentUser.role === 'manager' && <SettingsManager />}
        {activeTab === 'lan' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800">إعدادات وربط الشبكة المحلية (LAN)</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              يمكنك ربط الهواتف والأجهزة اللوحية وحواسيب الموظفين بشبكة الراوتر للعمل المتزامن.
            </p>
            <button
              onClick={() => {
                const lanBtn = document.querySelector('[title="حالة الشبكة المحلية LAN"]') as HTMLButtonElement;
                if (lanBtn) lanBtn.click();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              فتح نافذة رمز QR ورمز الراوتر
            </button>
          </div>
        )}
      </main>

      {/* Clean Professional Desktop Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {companySettings.companyName} • نظام إدارة الأقساط والقروض النقدية (الإصدار التجاري المستقل)
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              قاعدة البيانات المحلية متزامنة
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <PrintReceiptModal />
      <LanNetworkModal />
      <OverdueAlertsModal />
      <CustomerProfileModal />
    </div>
  );
};

export default App;
