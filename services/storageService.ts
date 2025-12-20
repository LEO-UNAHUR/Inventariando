import {
  Product,
  StockMovement,
  Supplier,
  Sale,
  Expense,
  Customer,
  Promotion,
  Backup,
  User,
  DataLog,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS } from '../constants';

const STORAGE_KEY = 'inventariando_products_v1';
const HISTORY_KEY = 'inventariando_history_v1';
const SUPPLIER_KEY = 'inventariando_suppliers_v1';
const SALES_KEY = 'inventariando_sales_v1';
const EXPENSES_KEY = 'inventariando_expenses_v1';
const CUSTOMERS_KEY = 'inventariando_customers_v1';
const PROMOTIONS_KEY = 'inventariando_promotions_v1';
const BACKUPS_KEY = 'inventariando_backups_v1';
const USERS_KEY = 'inventariando_users_v1';
const DATA_LOGS_KEY = 'inventariando_data_logs_v1';
const NOTIFICATIONS_DISMISSED_KEY = 'inventariando_notif_dismissed_v1';
const NOTIFICATIONS_READ_KEY = 'inventariando_notif_read_v1';

export const getStoredProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed data if empty
    return INITIAL_PRODUCTS;
  } catch (error) {
    console.error('Error loading products', error);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products', error);
  }
};

export const getStoredMovements = (): StockMovement[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading history', error);
    return [];
  }
};

export const saveStoredMovements = (movements: StockMovement[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(movements));
  } catch (error) {
    console.error('Error saving history', error);
  }
};

export const getStoredSuppliers = (): Supplier[] => {
  try {
    const stored = localStorage.getItem(SUPPLIER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading suppliers', error);
    return [];
  }
};

export const saveStoredSuppliers = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(SUPPLIER_KEY, JSON.stringify(suppliers));
  } catch (error) {
    console.error('Error saving suppliers', error);
  }
};

export const getStoredSales = (): Sale[] => {
  try {
    const stored = localStorage.getItem(SALES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading sales', error);
    return [];
  }
};

export const saveStoredSales = (sales: Sale[]): void => {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving sales', error);
  }
};

export const getStoredExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem(EXPENSES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading expenses', error);
    return [];
  }
};

export const saveStoredExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses', error);
  }
};

export const getStoredCustomers = (): Customer[] => {
  try {
    const stored = localStorage.getItem(CUSTOMERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading customers', error);
    return [];
  }
};

export const saveStoredCustomers = (customers: Customer[]): void => {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error('Error saving customers', error);
  }
};

export const getStoredPromotions = (): Promotion[] => {
  try {
    const stored = localStorage.getItem(PROMOTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading promotions', error);
    return [];
  }
};

export const saveStoredPromotions = (promotions: Promotion[]): void => {
  try {
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
  } catch (error) {
    console.error('Error saving promotions', error);
  }
};

export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return INITIAL_USERS;
  } catch (error) {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users', error);
  }
};

// --- DATA LOGS ---

export const getStoredLogs = (): DataLog[] => {
  try {
    const stored = localStorage.getItem(DATA_LOGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const saveLog = (log: DataLog): void => {
  try {
    const logs = getStoredLogs();
    // Keep last 50 logs
    const newLogs = [log, ...logs].slice(0, 50);
    localStorage.setItem(DATA_LOGS_KEY, JSON.stringify(newLogs));
  } catch (error) {
    console.error('Error saving data log', error);
  }
};

// --- NOTIFICATIONS ---

export const getDismissedNotifications = (): string[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_DISMISSED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveDismissedNotifications = (ids: string[]) => {
  localStorage.setItem(NOTIFICATIONS_DISMISSED_KEY, JSON.stringify(ids));
};

export const getReadNotifications = (): string[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveReadNotifications = (ids: string[]) => {
  localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(ids));
};

// --- BACKUP SYSTEM ---

export const createBackup = (autoGenerated: boolean = false): Backup => {
  const data = {
    products: getStoredProducts(),
    movements: getStoredMovements(),
    suppliers: getStoredSuppliers(),
    sales: getStoredSales(),
    expenses: getStoredExpenses(),
    customers: getStoredCustomers(),
    promotions: getStoredPromotions(),
    users: getStoredUsers(),
  };

  const json = JSON.stringify(data);
  const sizeInKB = (new TextEncoder().encode(json).length / 1024).toFixed(2) + ' KB';

  const backup: Backup = {
    id: crypto.randomUUID(),
    date: Date.now(),
    size: sizeInKB,
    data: json,
    autoGenerated,
  };

  const backups = getStoredBackups();
  // Keep max 10 backups
  const newBackups = [backup, ...backups].slice(0, 10);
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(newBackups));

  return backup;
};

export const getStoredBackups = (): Backup[] => {
  try {
    const stored = localStorage.getItem(BACKUPS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const restoreBackup = (backupId: string): boolean => {
  try {
    const backups = getStoredBackups();
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return false;

    const data = JSON.parse(backup.data);

    if (data.products) saveStoredProducts(data.products);
    if (data.movements) saveStoredMovements(data.movements);
    if (data.suppliers) saveStoredSuppliers(data.suppliers);
    if (data.sales) saveStoredSales(data.sales);
    if (data.expenses) saveStoredExpenses(data.expenses);
    if (data.customers) saveStoredCustomers(data.customers);
    if (data.promotions) saveStoredPromotions(data.promotions);
    if (data.users) saveStoredUsers(data.users);

    return true;
  } catch (e) {
    console.error('Restore failed', e);
    return false;
  }
};

export const deleteBackup = (backupId: string) => {
  const backups = getStoredBackups();
  const newBackups = backups.filter((b) => b.id !== backupId);
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(newBackups));
  return newBackups;
};
