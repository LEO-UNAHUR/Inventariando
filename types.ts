
export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number; // In ARS
  cost: number; // In ARS (Primary/Default cost)
  stock: number;
  minStock: number;
  lastUpdated: number;
  expirationDate?: number; // Timestamp
  suppliers?: ProductSupplierInfo[]; // List of suppliers for this product
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface ProductSupplierInfo {
  supplierId: string;
  cost: number;
  lastPurchaseDate?: number;
}

export enum Category {
  ALMACEN = 'Almacén',
  BEBIDAS = 'Bebidas',
  LIMPIEZA = 'Limpieza',
  PERFUMERIA = 'Perfumería',
  KIOSCO = 'Kiosco',
  FRESCOS = 'Frescos',
  OTROS = 'Otros',
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  HISTORY = 'HISTORY',
  ANALYSIS = 'ANALYSIS',
  SUPPLIERS = 'SUPPLIERS',
  FINANCE = 'FINANCE',
  SALES = 'SALES',
}

export interface InventoryStats {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
}

export interface AISuggestion {
  description: string;
  category: string;
  suggestedPrice?: number;
}

export enum MovementType {
  IN = 'ENTRADA',
  OUT = 'SALIDA',
  ADJUSTMENT = 'AJUSTE',
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  date: number;
  reason?: string;
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  EXPIRATION = 'expiration',
  VELOCITY = 'velocity'
}

export enum NotificationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface AppNotification {
  id: string;
  productId: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  date: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the moment of sale
  cost: number; // Cost at the moment of sale (for profit calc)
}

export interface Sale {
  id: string;
  date: number;
  items: SaleItem[];
  total: number;
  profit: number; // Gross profit (Revenue - Cost of Goods)
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO';
}

export enum ExpenseCategory {
  ALQUILER = 'Alquiler',
  SERVICIOS = 'Servicios (Luz/Agua/Internet)',
  SUELDOS = 'Sueldos',
  IMPUESTOS = 'Impuestos/Tasas',
  MANTENIMIENTO = 'Mantenimiento',
  OTROS = 'Otros Gastos',
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: number;
}
