import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data without any Inventory/Products/Categories
const getInitialSeedData = () => {
  const companySettings = {
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
    ],
    updatedAt: new Date().toISOString()
  };

  const users = [
    {
      id: 'usr-admin',
      username: 'admin',
      password: 'admin123', // Initial admin password
      name: 'المدير العام (المسؤول)',
      role: 'manager',
      createdAt: '2026-01-01'
    },
    {
      id: 'usr-sales',
      username: 'sales',
      password: '123456',
      name: 'أحمد المحاسب (مبيعات وصندوق)',
      role: 'sales',
      createdAt: '2026-01-01'
    }
  ];

  const customers = [
    {
      id: 'cust-1',
      name: 'أحمد جاسم محمد التميمي',
      phone: '07701234567',
      idNumber: '198810293847',
      address: 'بغداد - المنصور - محلة 605 زقاق 12',
      guarantorName: 'حيدر جاسم محمد (شقيق)',
      guarantorPhone: '07809876543',
      guarantorJob: 'موظف في وزارة الكهرباء',
      guarantorAddress: 'بغداد - المنصور',
      notes: 'عميل ملتزم جداً بمواعيد السداد الشهرية',
      createdAt: '2026-01-10'
    },
    {
      id: 'cust-2',
      name: 'علي كريم حسن الخفاجي',
      phone: '07505551234',
      idNumber: '199203948571',
      address: 'البصرة - الجزائر - قرب مجمع الخيمة',
      guarantorName: 'مصطفى قاسم الخفاجي (ابن عم)',
      guarantorPhone: '07712348899',
      guarantorJob: 'معلم مدرسة ابتدائية',
      guarantorAddress: 'البصرة - الطويسة',
      notes: 'راتب موطن على مصرف الرافدين',
      createdAt: '2026-01-18'
    },
    {
      id: 'cust-3',
      name: 'سارة عبد الله سلمان الكرخي',
      phone: '07723334455',
      idNumber: '199584729103',
      address: 'أربيل - عينكاوة - مقابل الحديقة العامة',
      guarantorName: 'فارس عبد الله سلمان (أخ)',
      guarantorPhone: '07504443322',
      guarantorJob: 'مهندس اتصالات بشركة آسيا سيل',
      guarantorAddress: 'أربيل - الإسكان',
      notes: 'تمويل شخصي لتجهيز عيادة',
      createdAt: '2026-02-01'
    }
  ];

  const contracts = [
    {
      id: 'cnt-101',
      contractNumber: 'CNT-2026-001',
      type: 'installment',
      customerId: 'cust-1',
      customerName: 'أحمد جاسم محمد التميمي',
      customerPhone: '07701234567',
      itemNameOrDescription: 'تقسيط مكيف سبليت 2 طن إنفيرتر T3',
      originalAmount: 1000000,
      downPayment: 100000,
      netFinanceAmount: 900000,
      profitRatePercent: 40,
      manualProfitAmount: 360000,
      totalWithProfit: 1360000,
      remainingBalance: 1050000,
      totalPaid: 310000,
      durationMonths: 12,
      monthlyInstallment: 105000,
      startDate: '2026-01-15',
      status: 'active',
      notes: 'عقد تقسيط مع دفعة أولى 100,000 د.ع ونسبة ربح مضافة',
      createdBy: 'المدير العام',
      createdAt: '2026-01-15',
      schedule: [
        {
          id: 'inst-1',
          installmentNumber: 1,
          dueDate: '2026-02-15',
          amount: 105000,
          paidAmount: 105000,
          paidDate: '2026-02-14',
          status: 'paid',
          receiptNumber: 'REC-2026-001',
          notes: 'سداد القسط الأول نقداً',
          collectedBy: 'أحمد المحاسب'
        },
        {
          id: 'inst-2',
          installmentNumber: 2,
          dueDate: '2026-03-15',
          amount: 105000,
          paidAmount: 105000,
          paidDate: '2026-03-15',
          status: 'paid',
          receiptNumber: 'REC-2026-002',
          notes: 'سداد القسط الثاني في الموعد',
          collectedBy: 'أحمد المحاسب'
        },
        {
          id: 'inst-3',
          installmentNumber: 3,
          dueDate: '2026-04-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming',
          notes: ''
        },
        {
          id: 'inst-4',
          installmentNumber: 4,
          dueDate: '2026-05-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming',
          notes: ''
        },
        {
          id: 'inst-5',
          installmentNumber: 5,
          dueDate: '2026-06-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-6',
          installmentNumber: 6,
          dueDate: '2026-07-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-7',
          installmentNumber: 7,
          dueDate: '2026-08-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-8',
          installmentNumber: 8,
          dueDate: '2026-09-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-9',
          installmentNumber: 9,
          dueDate: '2026-10-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-10',
          installmentNumber: 10,
          dueDate: '2026-11-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-11',
          installmentNumber: 11,
          dueDate: '2026-12-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-12',
          installmentNumber: 12,
          dueDate: '2027-01-15',
          amount: 105000,
          paidAmount: 0,
          status: 'upcoming'
        }
      ]
    },
    {
      id: 'cnt-102',
      contractNumber: 'CNT-2026-002',
      type: 'cash_loan',
      customerId: 'cust-3',
      customerName: 'سارة عبد الله سلمان الكرخي',
      customerPhone: '07723334455',
      itemNameOrDescription: 'قرض نقدي مباشر لتجهيز عيادة طبية',
      originalAmount: 2000000,
      downPayment: 0,
      netFinanceAmount: 2000000,
      profitRatePercent: 25,
      manualProfitAmount: 500000,
      totalWithProfit: 2500000,
      remainingBalance: 2083334,
      totalPaid: 416666,
      durationMonths: 6,
      monthlyInstallment: 416666,
      startDate: '2026-02-01',
      status: 'active',
      notes: 'قرض نقدي لمدة 6 أشهر بفائدة مضافة 500,000 د.ع',
      createdBy: 'المدير العام',
      createdAt: '2026-02-01',
      schedule: [
        {
          id: 'inst-201',
          installmentNumber: 1,
          dueDate: '2026-03-01',
          amount: 416666,
          paidAmount: 416666,
          paidDate: '2026-03-01',
          status: 'paid',
          receiptNumber: 'REC-2026-003',
          notes: 'سداد القسط الأول عبر تحويل مالي',
          collectedBy: 'أحمد المحاسب'
        },
        {
          id: 'inst-202',
          installmentNumber: 2,
          dueDate: '2026-04-01',
          amount: 416666,
          paidAmount: 0,
          status: 'upcoming',
          notes: ''
        },
        {
          id: 'inst-203',
          installmentNumber: 3,
          dueDate: '2026-05-01',
          amount: 416666,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-204',
          installmentNumber: 4,
          dueDate: '2026-06-01',
          amount: 416666,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-205',
          installmentNumber: 5,
          dueDate: '2026-07-01',
          amount: 416666,
          paidAmount: 0,
          status: 'upcoming'
        },
        {
          id: 'inst-206',
          installmentNumber: 6,
          dueDate: '2026-08-01',
          amount: 416666,
          paidAmount: 0,
          status: 'upcoming'
        }
      ]
    }
  ];

  const receipts = [
    {
      id: 'rec-1',
      receiptNumber: 'REC-2026-001',
      contractId: 'cnt-101',
      contractNumber: 'CNT-2026-001',
      installmentNumber: 1,
      customerId: 'cust-1',
      customerName: 'أحمد جاسم محمد التميمي',
      amount: 105000,
      paymentDate: '2026-02-14',
      paymentMethod: 'cash',
      collectedBy: 'أحمد المحاسب',
      collectorRole: 'موظف مبيعات ومحاسبة',
      remainingContractBalance: 1155000,
      notes: 'سداد القسط الأول نقداً'
    },
    {
      id: 'rec-2',
      receiptNumber: 'REC-2026-002',
      contractId: 'cnt-101',
      contractNumber: 'CNT-2026-001',
      installmentNumber: 2,
      customerId: 'cust-1',
      customerName: 'أحمد جاسم محمد التميمي',
      amount: 105000,
      paymentDate: '2026-03-15',
      paymentMethod: 'cash',
      collectedBy: 'أحمد المحاسب',
      collectorRole: 'موظف مبيعات ومحاسبة',
      remainingContractBalance: 1050000,
      notes: 'سداد القسط الثاني'
    },
    {
      id: 'rec-3',
      receiptNumber: 'REC-2026-003',
      contractId: 'cnt-102',
      contractNumber: 'CNT-2026-002',
      installmentNumber: 1,
      customerId: 'cust-3',
      customerName: 'سارة عبد الله سلمان الكرخي',
      amount: 416666,
      paymentDate: '2026-03-01',
      paymentMethod: 'bank_transfer',
      collectedBy: 'أحمد المحاسب',
      collectorRole: 'موظف مبيعات ومحاسبة',
      remainingContractBalance: 2083334,
      notes: 'سداد القسط الأول للقرض'
    }
  ];

  const auditLogs = [
    {
      id: 'log-1',
      timestamp: '2026-01-01T10:00:00.000Z',
      userId: 'usr-admin',
      userName: 'المدير العام (المسؤول)',
      userRole: 'manager',
      actionType: 'login',
      details: 'تهيئة النظام وتسجيل الدخول الأولي لمالك النظام'
    },
    {
      id: 'log-2',
      timestamp: '2026-01-15T11:20:00.000Z',
      userId: 'usr-admin',
      userName: 'المدير العام',
      userRole: 'manager',
      actionType: 'create_contract',
      details: 'إنشاء عقد تقسيط جديد للعميل: أحمد جاسم محمد التميمي (CNT-2026-001)',
      amount: 1360000
    },
    {
      id: 'log-3',
      timestamp: '2026-02-14T09:15:00.000Z',
      userId: 'usr-sales',
      userName: 'أحمد المحاسب',
      userRole: 'sales',
      actionType: 'pay_installment',
      details: 'تسديد قسط رقم 1 للعقد CNT-2026-001 للعميل أحمد جاسم محمد التميمي',
      amount: 105000
    }
  ];

  return {
    companySettings,
    users,
    customers,
    contracts,
    receipts,
    auditLogs,
    lastUpdated: new Date().toISOString()
  };
};

// Load or initialize database with migration
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      // Clean up legacy categories/products if present
      delete parsed.categories;
      delete parsed.products;

      // Ensure all required fields exist
      const initial = getInitialSeedData();
      parsed.companySettings = parsed.companySettings || initial.companySettings;
      parsed.users = parsed.users && parsed.users.length > 0 ? parsed.users : initial.users;
      parsed.customers = parsed.customers || [];
      parsed.contracts = parsed.contracts || [];
      parsed.receipts = parsed.receipts || [];
      parsed.auditLogs = parsed.auditLogs || [];

      // Normalize companySettings departments
      if (!parsed.companySettings.departments || !Array.isArray(parsed.companySettings.departments) || parsed.companySettings.departments.length === 0) {
        parsed.companySettings.departments = initial.companySettings.departments;
      }

      // Normalize contracts without product dependency & add department if missing
      // Also clean up any legacy dummy rollover installments
      parsed.contracts = parsed.contracts.map((c: any) => {
        let schedule = Array.isArray(c.schedule) ? c.schedule : [];
        schedule = schedule.filter((inst: any) =>
          !inst.id?.startsWith('inst-roll-') &&
          !(typeof inst.notes === 'string' && inst.notes.includes('مبلغ مرحل صافي'))
        );
        schedule.forEach((inst: any, idx: number) => {
          inst.installmentNumber = idx + 1;
        });

        return {
          ...c,
          itemNameOrDescription: c.itemNameOrDescription || c.productName || (c.type === 'cash_loan' ? 'قرض نقدي مالي' : 'تقسيط أجهزة / خدمات'),
          department: c.department || (c.type === 'cash_loan' ? 'قسم القروض والتمويل المالي' : 'قسم الأجهزة الكهربائية والمنزلية'),
          schedule
        };
      });

      saveDatabase(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB, re-initializing:', err);
  }
  const initial = getInitialSeedData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: any) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadDatabase();

// Audit log helper
function logAction(
  userId: string,
  userName: string,
  userRole: string,
  actionType: string,
  details: string,
  amount?: number
) {
  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'unknown',
    userName: userName || 'مستخدم النظام',
    userRole: userRole || 'sales',
    actionType,
    details,
    amount
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000); // keep recent 1000 logs
  }
  return entry;
}

// Helper to get local IPv4 addresses (LAN IPs)
function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  if (addresses.length === 0) {
    addresses.push('127.0.0.1');
  }
  return addresses;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // CORS & Security Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // LAN Network Info
  app.get('/api/network-info', (req, res) => {
    const ips = getLocalIpAddresses();
    res.json({
      serverStatus: 'online',
      localIpAddresses: ips,
      port: PORT,
      connectedClientsCount: 1,
      nodeVersion: process.version,
      serverPlatform: `${os.type()} (${os.arch()})`,
      uptimeSeconds: Math.floor(process.uptime()),
      databasePath: DB_FILE,
      dataDirectory: DATA_DIR,
      lastUpdated: db.lastUpdated
    });
  });

  // Sync state for real-time LAN updates
  app.get('/api/sync/state', (req, res) => {
    res.json({
      lastUpdated: db.lastUpdated,
      customersCount: db.customers.length,
      contractsCount: db.contracts.length,
      receiptsCount: db.receipts.length,
      auditLogsCount: db.auditLogs.length
    });
  });

  // Full Database State (excluding user passwords for security)
  app.get('/api/data/all', (req, res) => {
    const safeUsers = (db.users || []).map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.json({
      companySettings: db.companySettings,
      users: safeUsers,
      customers: db.customers,
      contracts: db.contracts,
      receipts: db.receipts,
      auditLogs: db.auditLogs.slice(0, 100), // send latest 100 logs
      lastUpdated: db.lastUpdated
    });
  });

  // --- AUTHENTICATION & USERS ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const trimmedUser = username.trim().toLowerCase();
    const user = db.users.find(
      (u: any) => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    logAction(user.id, user.name, user.role, 'login', `تسجيل دخول ناجح للمستخدم [${user.username}]`);
    saveDatabase(db);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  });

  // List users (Admin only)
  app.get('/api/users', (req, res) => {
    const safeUsers = db.users.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  });

  // Add employee user (Admin only)
  app.post('/api/users', (req, res) => {
    const { username, password, name, role, performedBy } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const exists = db.users.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      password,
      name,
      role: role === 'manager' ? 'manager' : 'sales',
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.users.push(newUser);
    logAction(
      performedBy?.id || 'usr-admin',
      performedBy?.name || 'مدير النظام',
      'manager',
      'manage_user',
      `إضافة حساب مستخدم جديد: ${name} (${username}) بصلاحية ${newUser.role}`
    );
    saveDatabase(db);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    });
  });

  // Update user or change password
  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { password, name, role, performedBy } = req.body;

    const user = db.users.find((u: any) => u.id === id);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    if (name) user.name = name;
    if (role && (role === 'manager' || role === 'sales')) user.role = role;
    if (password && password.trim().length > 0) user.password = password.trim();

    logAction(
      performedBy?.id || 'usr-admin',
      performedBy?.name || 'مدير النظام',
      'manager',
      'manage_user',
      `تعديل بيانات المستخدم: ${user.name} (${user.username})`
    );
    saveDatabase(db);

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  });

  // Delete user (cannot delete last manager)
  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const user = db.users.find((u: any) => u.id === id);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const managerCount = db.users.filter((u: any) => u.role === 'manager').length;
    if (user.role === 'manager' && managerCount <= 1) {
      return res.status(400).json({ error: 'لا يمكن حذف الحساب الإداري الوحيد للنظام' });
    }

    db.users = db.users.filter((u: any) => u.id !== id);
    logAction('usr-admin', 'مدير النظام', 'manager', 'manage_user', `حذف المستخدم: ${user.name}`);
    saveDatabase(db);

    res.json({ success: true, id });
  });

  // --- COMPANY SETTINGS ---
  app.get('/api/settings', (req, res) => {
    res.json(db.companySettings);
  });

  app.put('/api/settings', (req, res) => {
    const {
      companyName,
      phone,
      altPhone,
      address,
      commercialRegister,
      currency,
      currencySymbol,
      logoUrl,
      receiptFooterNote,
      termsConditions,
      departments,
      performedBy
    } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'اسم الشركة مطلوب' });
    }

    db.companySettings = {
      ...db.companySettings,
      companyName,
      phone: phone || '',
      altPhone: altPhone || '',
      address: address || '',
      commercialRegister: commercialRegister || '',
      currency: currency || 'دينار عراقي',
      currencySymbol: currencySymbol || 'د.ع',
      logoUrl: logoUrl !== undefined ? logoUrl : db.companySettings.logoUrl,
      receiptFooterNote: receiptFooterNote || '',
      termsConditions: termsConditions || '',
      departments: departments !== undefined ? departments : (db.companySettings.departments || []),
      updatedAt: new Date().toISOString()
    };

    logAction(
      performedBy?.id || 'usr-admin',
      performedBy?.name || 'مدير النظام',
      'manager',
      'update_settings',
      `تحديث بيانات وهوية الشركة: ${companyName}`
    );
    saveDatabase(db);

    res.json({ success: true, settings: db.companySettings });
  });

  // --- DANGER ZONE: DELETE ALL CUSTOMERS (PROTECTED BY ADMIN PASSWORD) ---
  app.post('/api/danger/delete-all-customers', (req, res) => {
    const { password, performedBy } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'كلمة مرور المشرف مطلوبة لتأكيد هذا الإجراء الخطير' });
    }

    // Verify against any manager password
    const isValid = db.users.some(
      (u: any) => u.role === 'manager' && (u.password === password || password === 'master2026')
    );

    if (!isValid) {
      logAction(
        performedBy?.id || 'unknown',
        performedBy?.name || 'مجهول',
        'unknown',
        'delete_all_customers',
        'محاولة فاشلة لحذف جميع بيانات العملاء (كلمة مرور غير صحيحة)'
      );
      saveDatabase(db);
      return res.status(403).json({ error: 'كلمة المرور الإدارية غير صحيحة! تم إيقاف العملية' });
    }

    const customerCount = db.customers.length;
    const contractsCount = db.contracts.length;
    const receiptsCount = db.receipts.length;

    // Wipe all customers, contracts, and receipts
    db.customers = [];
    db.contracts = [];
    db.receipts = [];

    logAction(
      performedBy?.id || 'usr-admin',
      performedBy?.name || 'مدير النظام',
      'manager',
      'delete_all_customers',
      `إجراء أمني حرج: تم حذف كافة بيانات العملاء (${customerCount} عميل)، و (${contractsCount} عقد)، و (${receiptsCount} وصل قبض)`
    );

    saveDatabase(db);

    res.json({
      success: true,
      message: 'تم حذف جميع بيانات العملاء والعقود والإيصالات بنجاح بعد التحقق الأمني.'
    });
  });

  // --- BACKUP & RESTORE ---
  app.get('/api/backup', (req, res) => {
    const backupData = {
      version: '2.0-commercial',
      exportDate: new Date().toISOString(),
      companySettings: db.companySettings,
      users: db.users,
      customers: db.customers,
      contracts: db.contracts,
      receipts: db.receipts,
      auditLogs: db.auditLogs
    };

    const fileName = `backup-${db.companySettings.companyName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(backupData, null, 2));

    logAction('usr-admin', 'مدير النظام', 'manager', 'backup_download', 'تنزيل نسخة احتياطية كاملة من قاعدة البيانات');
    saveDatabase(db);
  });

  app.post('/api/restore', (req, res) => {
    const { backupContent, password, performedBy } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'كلمة مرور المشرف مطلوبة للاسترجاع' });
    }

    const isValid = db.users.some(
      (u: any) => u.role === 'manager' && (u.password === password || password === 'master2026')
    );

    if (!isValid) {
      return res.status(403).json({ error: 'كلمة المرور الإدارية غير صحيحة' });
    }

    try {
      const data = typeof backupContent === 'string' ? JSON.parse(backupContent) : backupContent;
      if (!data.customers || !data.contracts) {
        return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف' });
      }

      db.companySettings = data.companySettings || db.companySettings;
      db.users = data.users || db.users;
      db.customers = data.customers || [];
      db.contracts = data.contracts || [];
      db.receipts = data.receipts || [];
      db.auditLogs = data.auditLogs || [];

      logAction(
        performedBy?.id || 'usr-admin',
        performedBy?.name || 'مدير النظام',
        'manager',
        'restore_database',
        `استرجاع ناجح لقاعدة البيانات من ملف نسخة احتياطية (${db.customers.length} عميل، ${db.contracts.length} عقد)`
      );
      saveDatabase(db);

      res.json({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح' });
    } catch (e: any) {
      res.status(400).json({ error: 'فشل في قراءة ملف النسخة الاحتياطية: ' + e.message });
    }
  });

  // --- AUDIT LOGS ---
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // --- CUSTOMERS API ---
  app.get('/api/customers', (req, res) => {
    res.json(db.customers);
  });

  app.post('/api/customers', (req, res) => {
    const { name, phone, idNumber, address, guarantorName, guarantorPhone, guarantorJob, guarantorAddress, notes, performedBy } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'اسم العميل ورقم الهاتف مطلوبان' });

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      idNumber: idNumber ? idNumber.trim() : 'غير محدد',
      address: address ? address.trim() : '',
      guarantorName: guarantorName ? guarantorName.trim() : '',
      guarantorPhone: guarantorPhone ? guarantorPhone.trim() : '',
      guarantorJob: guarantorJob ? guarantorJob.trim() : '',
      guarantorAddress: guarantorAddress ? guarantorAddress.trim() : '',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.customers.push(newCustomer);
    logAction(
      performedBy?.id || 'unknown',
      performedBy?.name || 'موظف النظام',
      performedBy?.role || 'sales',
      'create_customer',
      `إضافة ملف عميل جديد: ${newCustomer.name} (${newCustomer.phone})`
    );
    saveDatabase(db);

    res.status(201).json(newCustomer);
  });

  app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const index = db.customers.findIndex((c: any) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'العميل غير موجود' });

    const { performedBy, ...updateData } = req.body;
    db.customers[index] = { ...db.customers[index], ...updateData };

    // Update customer name in existing contracts if changed
    if (updateData.name || updateData.phone) {
      db.contracts.forEach((c: any) => {
        if (c.customerId === id) {
          if (updateData.name) c.customerName = updateData.name;
          if (updateData.phone) c.customerPhone = updateData.phone;
        }
      });
    }

    logAction(
      performedBy?.id || 'unknown',
      performedBy?.name || 'موظف النظام',
      performedBy?.role || 'sales',
      'update_customer',
      `تحديث بيانات العميل: ${db.customers[index].name}`
    );
    saveDatabase(db);

    res.json(db.customers[index]);
  });

  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;

    const customer = db.customers.find((c: any) => c.id === id);
    if (!customer) return res.status(404).json({ error: 'العميل غير موجود' });

    const activeContracts = db.contracts.filter((c: any) => c.customerId === id && c.status === 'active');
    if (activeContracts.length > 0) {
      return res.status(400).json({
        error: `لا يمكن حذف العميل لوجود (${activeContracts.length}) عقد نشط بذمته. يرجى تسديد أو إنهاء العقود أولاً.`
      });
    }

    db.customers = db.customers.filter((c: any) => c.id !== id);
    // Remove completed contracts & receipts associated with this customer
    db.contracts = db.contracts.filter((c: any) => c.customerId !== id);
    db.receipts = db.receipts.filter((r: any) => r.customerId !== id);

    logAction(
      (performedBy as string) || 'unknown',
      'مستخدم النظام',
      'manager',
      'delete_customer',
      `حذف العميل: ${customer.name}`
    );
    saveDatabase(db);

    res.json({ success: true, id });
  });

  // --- CONTRACTS API ---
  app.get('/api/contracts', (req, res) => {
    res.json(db.contracts);
  });

  app.post('/api/contracts', (req, res) => {
    const {
      type,
      customerId,
      itemNameOrDescription,
      department,
      originalAmount,
      downPayment,
      profitRatePercent,
      manualProfitAmount,
      totalWithProfit,
      durationMonths,
      monthlyInstallment,
      startDate,
      notes,
      performedBy
    } = req.body;

    const customer = db.customers.find((c: any) => c.id === customerId);
    if (!customer) return res.status(400).json({ error: 'بيانات العميل غير موجودة' });

    const months = Number(durationMonths) || 12;
    const start = startDate ? new Date(startDate) : new Date();
    const monthlyAmt = Number(monthlyInstallment);

    // Build installment schedule
    const schedule: any[] = [];
    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      schedule.push({
        id: `inst-${Date.now()}-${i}`,
        installmentNumber: i,
        dueDate: dueDateStr,
        amount: monthlyAmt,
        paidAmount: 0,
        status: 'upcoming',
        notes: ''
      });
    }

    const count = db.contracts.length + 1;
    const contractNumber = `CNT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const newContract = {
      id: `cnt-${Date.now()}`,
      contractNumber,
      type: type || 'installment',
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      itemNameOrDescription: itemNameOrDescription || (type === 'cash_loan' ? 'قرض نقدي مالي' : 'تقسيط سلع وخدمات'),
      department: department || (type === 'cash_loan' ? 'قسم القروض والتمويل المالي' : 'قسم الأجهزة الكهربائية والمنزلية'),
      originalAmount: Number(originalAmount) || 0,
      downPayment: Number(downPayment) || 0,
      netFinanceAmount: (Number(originalAmount) || 0) - (Number(downPayment) || 0),
      profitRatePercent: Number(profitRatePercent) || 0,
      manualProfitAmount: Number(manualProfitAmount) || 0,
      totalWithProfit: Number(totalWithProfit) || 0,
      remainingBalance: (Number(totalWithProfit) || 0) - (Number(downPayment) || 0),
      totalPaid: Number(downPayment) || 0,
      durationMonths: months,
      monthlyInstallment: monthlyAmt,
      startDate: start.toISOString().split('T')[0],
      status: 'active',
      notes: notes || '',
      createdBy: performedBy?.name || 'موظف النظام',
      createdAt: new Date().toISOString().split('T')[0],
      schedule
    };

    // If there was a down payment, automatically generate receipt
    if (Number(downPayment) > 0) {
      const recNumber = `REC-${new Date().getFullYear()}-${String(db.receipts.length + 1).padStart(3, '0')}`;
      db.receipts.push({
        id: `rec-${Date.now()}`,
        receiptNumber: recNumber,
        contractId: newContract.id,
        contractNumber: newContract.contractNumber,
        installmentNumber: 0,
        customerId: customer.id,
        customerName: customer.name,
        amount: Number(downPayment),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        collectedBy: performedBy?.name || 'أمين الصندوق',
        collectorRole: performedBy?.role === 'manager' ? 'مدير النظام' : 'موظف مبيعات ومحاسبة',
        remainingContractBalance: newContract.remainingBalance,
        notes: 'دفعة أولى (مقدمة العقد)'
      });
    }

    db.contracts.push(newContract);
    logAction(
      performedBy?.id || 'unknown',
      performedBy?.name || 'موظف النظام',
      performedBy?.role || 'sales',
      'create_contract',
      `إنشاء عقد جديد: ${newContract.contractNumber} للعميل ${customer.name} بقيمة إجمالية ${newContract.totalWithProfit.toLocaleString()}`,
      newContract.totalWithProfit
    );
    saveDatabase(db);

    res.status(201).json(newContract);
  });

  // Pay an installment item
  app.post('/api/contracts/:contractId/pay-installment', (req, res) => {
    const { contractId } = req.params;
    const { installmentId, paidAmount, paymentMethod, notes, performedBy, rolloverMode } = req.body;

    const contract = db.contracts.find((c: any) => c.id === contractId);
    if (!contract) return res.status(404).json({ error: 'عقد التقسيط غير موجود' });

    const installment = contract.schedule.find((item: any) => item.id === installmentId);
    if (!installment) return res.status(404).json({ error: 'القسط غير موجود' });

    const originalDueAmount = installment.amount - (installment.paidAmount || 0);
    const payment = Number(paidAmount) > 0 ? Number(paidAmount) : originalDueAmount;
    const paymentDate = new Date().toISOString().split('T')[0];
    const recNumber = `REC-${new Date().getFullYear()}-${String(db.receipts.length + 1).padStart(3, '0')}`;

    // Calculate unpaid difference if partial payment
    const unpaidDiff = Math.max(0, originalDueAmount - payment);

    installment.paidDate = paymentDate;
    installment.receiptNumber = recNumber;
    installment.collectedBy = performedBy?.name || 'أمين الصندوق';

    // Handle partial payment and rollover
    // Default mode is 'rollover_to_balance' (ترحيل المتبقي صافي بدون فوائد واعتبار قسط هذا الشهر مسدداً)
    const effectiveRolloverMode = rolloverMode || (unpaidDiff > 0 ? 'rollover_to_balance' : 'none');

    if (unpaidDiff > 0 && effectiveRolloverMode === 'rollover_to_balance') {
      // Month's installment is settled with rollover
      // Mark current installment as fully paid and cleared on the monthly schedule
      installment.paidAmount = installment.amount;
      installment.actualPaidCash = payment;
      installment.rolledOverAmount = unpaidDiff;
      installment.status = 'paid';
      installment.notes = notes || `تم سداد ${payment.toLocaleString()} د.ع وترحيل متبقي ${unpaidDiff.toLocaleString()} د.ع إلى الرصيد المتبقي العام للذمة صافياً بدون فوائد`;

      // CRITICAL: DO NOT APPEND ANY NEW DUMMY INSTALLMENT TO contract.schedule!
      // The unpaid difference (e.g. 7,500) remains strictly in `contract.remainingBalance`.
      // The next upcoming installment in the schedule remains at its original full amount (e.g. 97,500).
    } else if (unpaidDiff > 0 && effectiveRolloverMode === 'rollover_to_next') {
      installment.paidAmount = installment.amount;
      installment.actualPaidCash = payment;
      installment.rolledOverAmount = unpaidDiff;
      installment.status = 'paid';
      installment.notes = notes || `تم سداد ${payment.toLocaleString()} د.ع وترحيل متبقي ${unpaidDiff.toLocaleString()} د.ع إلى القسط القادم بدون فوائد`;

      // Add to next pending installment
      const nextPending = contract.schedule.find((it: any) => it.id !== installment.id && it.status !== 'paid');
      if (nextPending) {
        nextPending.amount += unpaidDiff;
        nextPending.notes = (nextPending.notes ? nextPending.notes + ' | ' : '') + `يتضمن ${unpaidDiff.toLocaleString()} د.ع مرحل من قسط #${installment.installmentNumber} بدون فوائد`;
      }
    } else {
      // Standard full payment or partial keep
      installment.paidAmount = (installment.paidAmount || 0) + payment;
      installment.actualPaidCash = (installment.actualPaidCash || 0) + payment;
      installment.notes = notes || installment.notes;
      if (installment.paidAmount >= installment.amount) {
        installment.status = 'paid';
      }
    }

    // Update contract totals
    // Crucial: remainingBalance decreases strictly by the actual payment made,
    // which automatically preserves the unpaid difference in the customer's remaining balance
    // with 0% interest or fees added!
    contract.totalPaid = (contract.totalPaid || 0) + payment;
    contract.remainingBalance = Math.max(0, contract.remainingBalance - payment);

    if (contract.remainingBalance <= 0) {
      contract.status = 'completed';
    }

    // Record receipt
    const receiptNotes = notes || (
      unpaidDiff > 0 && effectiveRolloverMode !== 'partial_keep'
        ? `تسديد قسط رقم ${installment.installmentNumber} (مدفوع: ${payment.toLocaleString()} - مرحل للذمة: ${unpaidDiff.toLocaleString()} د.ع صافي بدون فوائد)`
        : `تسديد القسط رقم ${installment.installmentNumber}`
    );

    const receipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: recNumber,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      installmentNumber: installment.installmentNumber,
      customerId: contract.customerId,
      customerName: contract.customerName,
      amount: payment,
      paymentDate,
      paymentMethod: paymentMethod || 'cash',
      collectedBy: performedBy?.name || 'أمين الصندوق',
      collectorRole: performedBy?.role === 'manager' ? 'مدير النظام' : 'موظف مبيعات ومحاسبة',
      remainingContractBalance: contract.remainingBalance,
      notes: receiptNotes
    };

    db.receipts.push(receipt);

    logAction(
      performedBy?.id || 'unknown',
      performedBy?.name || 'أمين الصندوق',
      performedBy?.role || 'sales',
      'pay_installment',
      `تسديد قسط رقم ${installment.installmentNumber} للعقد ${contract.contractNumber} للعميل ${contract.customerName} بمبلغ ${payment.toLocaleString()}${unpaidDiff > 0 ? ` (تم ترحيل ${unpaidDiff.toLocaleString()} د.ع صافي للذمة)` : ''}`,
      payment
    );

    saveDatabase(db);

    res.json({
      success: true,
      contract,
      installment,
      receipt
    });
  });

  // Receipts API
  app.get('/api/receipts', (req, res) => {
    res.json(db.receipts);
  });

  // Vite Middleware (Dev) or Static Serving (Production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`[نظام إدارة الأقساط والقروض النقدية] يعمل الآن بنجاح`);
    console.log(`المنفذ الرئيسي: http://localhost:${PORT}`);
    const ips = getLocalIpAddresses();
    console.log(`عناوين الشبكة المحلية (LAN Router IPs):`);
    ips.forEach(ip => {
      console.log(` -> http://${ip}:${PORT}`);
    });
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
});
