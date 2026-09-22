import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CompanySettings,
  UserAccount,
  Customer,
  InstallmentContract,
  PaymentReceipt,
  AuditLogEntry,
  NetworkInfo,
  UserRole
} from '../types';

interface AppContextType {
  currentUser: UserAccount | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<boolean>;

  usersList: UserAccount[];
  addUser: (user: { username: string; password: string; name: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, user: { name?: string; password?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;

  customers: Customer[];
  addCustomer: (cust: Partial<Customer>) => Promise<Customer | null>;
  updateCustomer: (id: string, cust: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllCustomers: (password: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  contracts: InstallmentContract[];
  createContract: (contractData: any) => Promise<InstallmentContract | null>;
  payInstallment: (
    contractId: string,
    installmentId: string,
    paymentDetails: {
      paidAmount: number;
      paymentMethod: string;
      notes: string;
      rolloverMode?: 'rollover_to_balance' | 'rollover_to_next' | 'partial_keep';
    }
  ) => Promise<{ success: boolean; receipt?: PaymentReceipt; error?: string }>;

  receipts: PaymentReceipt[];
  auditLogs: AuditLogEntry[];
  networkInfo: NetworkInfo | null;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isSyncing: boolean;
  lastSyncTime: Date;
  refreshData: () => Promise<void>;

  // Modals
  activeReceiptForPrint: PaymentReceipt | null;
  setActiveReceiptForPrint: (r: PaymentReceipt | null) => void;
  activeContractForPrint: InstallmentContract | null;
  setActiveContractForPrint: (c: InstallmentContract | null) => void;

  isLanModalOpen: boolean;
  setIsLanModalOpen: (open: boolean) => void;

  isNewContractModalOpen: boolean;
  setIsNewContractModalOpen: (open: boolean) => void;
  newContractInitialType: 'installment' | 'cash_loan';
  openNewContractModal: (type?: 'installment' | 'cash_loan', customerId?: string) => void;

  isOverdueAlertsModalOpen: boolean;
  setIsOverdueAlertsModalOpen: (open: boolean) => void;

  isDangerZoneModalOpen: boolean;
  setIsDangerZoneModalOpen: (open: boolean) => void;

  selectedCustomerIdForContract: string | null;
  setSelectedCustomerIdForContract: (id: string | null) => void;

  selectedProfileCustomer: Customer | null;
  setSelectedProfileCustomer: (c: Customer | null) => void;
  openCustomerProfile: (customerOrId: Customer | string) => void;

  downloadBackup: () => void;
  restoreBackup: (fileContent: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const defaultCompanySettings: CompanySettings = {
  companyName: 'شركة القمة لإدارة الأقساط والتمويل',
  phone: '07701234567',
  altPhone: '07809876543',
  address: 'شارع فلسطين - قرب ساحة بيروت',
  commercialRegister: 'CR-2026-8841',
  currency: 'دينار عراقي',
  currencySymbol: 'د.ع',
  logoUrl: '',
  receiptFooterNote: 'شكراً لتعاملكم الراقي. يرجى الاحتفاظ بهذا الوصل كوثيقة إثبات سداد رسمية.',
  termsConditions: 'تسدد الأقساط في موعدها الشهري المحدد دون تأخير. يحق للشركة اتخاذ الإجراءات القانونية عند التأخر لأكثر من 15 يوماً.',
  departments: [
    'قسم الأجهزة الكهربائية والمنزلية',
    'قسم الهواتف الذكية والإلكترونيات',
    'قسم المفروشات والأثاث',
    'قسم القروض والتمويل المالي',
    'قسم الدراجات والسيارات'
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session / Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('pos_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contracts, setContracts] = useState<InstallmentContract[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      return localStorage.getItem('pos_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('pos_active_tab', tab);
    } catch {
      // ignore storage errors (e.g. private browsing mode)
    }
  };
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Modals
  const [activeReceiptForPrint, setActiveReceiptForPrint] = useState<PaymentReceipt | null>(null);
  const [activeContractForPrint, setActiveContractForPrint] = useState<InstallmentContract | null>(null);
  const [isLanModalOpen, setIsLanModalOpen] = useState<boolean>(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState<boolean>(false);
  const [newContractInitialType, setNewContractInitialType] = useState<'installment' | 'cash_loan'>('installment');
  const [selectedCustomerIdForContract, setSelectedCustomerIdForContract] = useState<string | null>(null);
  const [selectedProfileCustomer, setSelectedProfileCustomer] = useState<Customer | null>(null);

  const openCustomerProfile = (customerOrId: Customer | string) => {
    if (typeof customerOrId === 'string') {
      const found = customers.find(c => c.id === customerOrId);
      if (found) setSelectedProfileCustomer(found);
    } else {
      setSelectedProfileCustomer(customerOrId);
    }
  };

  const [isOverdueAlertsModalOpen, setIsOverdueAlertsModalOpen] = useState<boolean>(false);
  const [isDangerZoneModalOpen, setIsDangerZoneModalOpen] = useState<boolean>(false);

  // Authentication methods
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('pos_current_user', JSON.stringify(data.user));
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_current_user');
   setActiveTab('dashboard');
  };

  // Open New Contract helper
  const openNewContractModal = (type: 'installment' | 'cash_loan' = 'installment', customerId?: string) => {
    setNewContractInitialType(type);
    setSelectedCustomerIdForContract(customerId || null);
    setIsNewContractModalOpen(true);
  };

  // Data fetching & real-time LAN sync
  const refreshData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [allDataRes, netRes] = await Promise.all([
        fetch('/api/data/all'),
        fetch('/api/network-info')
      ]);

      if (allDataRes.ok) {
        const data = await allDataRes.json();
        if (data.companySettings) setCompanySettings(data.companySettings);
        if (data.users) setUsersList(data.users);
        setCustomers(data.customers || []);
        setContracts(data.contracts || []);
        setReceipts(data.receipts || []);
        setAuditLogs(data.auditLogs || []);
      }

      if (netRes.ok) {
        const net = await netRes.json();
        setNetworkInfo(net);
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Poll sync every 5 seconds for live multi-device LAN syncing
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      fetch('/api/sync/state')
        .then(res => res.json())
        .then(() => refreshData())
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // COMPANY SETTINGS ACTIONS
  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          performedBy: currentUser
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data.settings);
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
    return false;
  };

  // USER MANAGEMENT
  const addUser = async (user: { username: string; password: string; name: string; role: UserRole }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, performedBy: currentUser })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (id: string, user: { name?: string; password?: string; role?: UserRole }) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, performedBy: currentUser })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // CUSTOMER ACTIONS
  const addCustomer = async (cust: Partial<Customer>) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cust, performedBy: currentUser })
      });
      if (res.ok) {
        const created = await res.json();
        await refreshData();
        return created;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updateCustomer = async (id: string, cust: Partial<Customer>) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cust, performedBy: currentUser })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}?performedBy=${currentUser?.name || ''}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // DANGER ZONE: DELETE ALL CUSTOMERS (REQUIRES MANAGER PASSWORD)
  const deleteAllCustomers = async (password: string) => {
    try {
      const res = await fetch('/api/danger/delete-all-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, performedBy: currentUser })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال' };
    }
  };

  // CONTRACT ACTIONS
  const createContract = async (contractData: any) => {
    try {
      const payload = {
        ...contractData,
        performedBy: currentUser
      };
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const contract = await res.json();
        await refreshData();
        return contract;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  // PAY INSTALLMENT
  const payInstallment = async (
    contractId: string,
    installmentId: string,
    paymentDetails: {
      paidAmount: number;
      paymentMethod: string;
      notes: string;
      rolloverMode?: 'rollover_to_balance' | 'rollover_to_next' | 'partial_keep';
    }
  ) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/pay-installment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentId,
          paidAmount: paymentDetails.paidAmount,
          paymentMethod: paymentDetails.paymentMethod,
          notes: paymentDetails.notes,
          rolloverMode: paymentDetails.rolloverMode,
          performedBy: currentUser
        })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true, receipt: data.receipt };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // BACKUP & RESTORE
  const downloadBackup = () => {
    window.location.href = '/api/backup';
  };

  const restoreBackup = async (fileContent: string, password: string) => {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupContent: fileContent, password, performedBy: currentUser })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        companySettings,
        updateCompanySettings,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        deleteAllCustomers,
        contracts,
        createContract,
        payInstallment,
        receipts,
        auditLogs,
        networkInfo,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        isSyncing,
        lastSyncTime,
        refreshData,
        activeReceiptForPrint,
        setActiveReceiptForPrint,
        activeContractForPrint,
        setActiveContractForPrint,
        isLanModalOpen,
        setIsLanModalOpen,
        isNewContractModalOpen,
        setIsNewContractModalOpen,
        newContractInitialType,
        openNewContractModal,
        isOverdueAlertsModalOpen,
        setIsOverdueAlertsModalOpen,
        isDangerZoneModalOpen,
        setIsDangerZoneModalOpen,
        selectedCustomerIdForContract,
        setSelectedCustomerIdForContract,
        selectedProfileCustomer,
        setSelectedProfileCustomer,
        openCustomerProfile,
        downloadBackup,
        restoreBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
