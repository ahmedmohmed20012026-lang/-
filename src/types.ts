export type UserRole = 'manager' | 'sales';

export interface CompanySettings {
  companyName: string;
  phone: string;
  altPhone?: string;
  address: string;
  commercialRegister?: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  receiptFooterNote: string;
  termsConditions: string;
  departments?: string[];
  updatedAt?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // Stored locally on the private LAN server
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType:
    | 'login'
    | 'create_customer'
    | 'update_customer'
    | 'delete_customer'
    | 'delete_all_customers'
    | 'create_contract'
    | 'pay_installment'
    | 'update_settings'
    | 'backup_download'
    | 'restore_database'
    | 'manage_user';
  details: string;
  amount?: number;
  ip?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber: string; // رقم الهوية / البطاقة الوطنية
  address: string;
  guarantorName: string; // اسم الكفيل الضامن
  guarantorPhone: string; // هاتف الكفيل
  guarantorJob?: string; // وظيفة الكفيل
  guarantorAddress?: string;
  notes?: string;
  createdAt: string;
}

export type ContractType = 'installment' | 'cash_loan';
export type InstallmentItemStatus = 'paid' | 'upcoming' | 'overdue';
export type ContractStatus = 'active' | 'completed' | 'overdue';

export interface InstallmentItem {
  id: string;
  installmentNumber: number; // رقم القسط مثلاً 1 من 12
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paidAmount: number;
  rolledOverAmount?: number; // المبلغ المرحل بدون فوائد
  paidDate?: string;
  status: InstallmentItemStatus;
  receiptNumber?: string;
  notes?: string;
  collectedBy?: string;
}

export interface InstallmentContract {
  id: string;
  contractNumber: string; // e.g. CNT-2026-001
  type: ContractType; // تقسيط سلعة/خدمة أو قرض نقدي
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  // تفاصيل البضاعة أو القرض
  itemNameOrDescription: string; // وصف الجهاز / السلعة أو الغرض من القرض
  department?: string; // القسم (كهربائيات، مفروشات، هواتف، قروض، إلخ)
  
  // المحرك المالي
  originalAmount: number; // رأس المال الأساسي / سعر الجهاز نقداً / أصل القرض
  downPayment: number; // المقدمة المسددة عند توقيع العقد
  netFinanceAmount: number; // المبلغ المتبقي للتمويل بعد طرح المقدمة
  profitRatePercent: number; // نسبة الفائدة / الربح
  manualProfitAmount: number; // مبلغ الربح المضاف
  totalWithProfit: number; // الإجمالي الكلي (الأصل + الفائدة المضافة)
  remainingBalance: number; // المبلغ المتبقي بذمة الزبون
  totalPaid: number; // إجمالي المبالغ المسددة حتى الآن
  
  durationMonths: number; // مدة السداد بالأشهر
  monthlyInstallment: number; // قيمة القسط الشهري
  startDate: string; // تاريخ بدء العقد
  status: ContractStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  
  schedule: InstallmentItem[];
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  contractId: string;
  contractNumber: string;
  installmentNumber: number;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  collectedBy: string;
  collectorRole: string;
  remainingContractBalance: number;
  notes?: string;
}

export interface NetworkInfo {
  serverStatus: 'online' | 'offline';
  localIpAddresses: string[];
  port: number;
  connectedClientsCount: number;
  nodeVersion: string;
  serverPlatform: string;
  uptimeSeconds: number;
  databasePath: string;
}

export interface DashboardStats {
  totalCapitalFinanced: number;
  totalProfitsProjected: number;
  totalPortfolioValue: number;
  totalCollectionsReceived: number;
  totalRemainingBalance: number;
  activeContractsCount: number;
  completedContractsCount: number;
  dueTodayCount: number;
  overdueCount: number;
}
