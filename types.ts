
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
  barcode?: string; // Optional barcode
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
  CUSTOMERS = 'CUSTOMERS',
  PROMOTIONS = 'PROMOTIONS',
  SECURITY = 'SECURITY',
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
  userId?: string; // Audit
  userName?: string; // Audit
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
  appliedPromotion?: string; // Name of promo applied
  originalPrice?: number;
}

export interface Sale {
  id: string;
  date: number;
  items: SaleItem[];
  total: number;
  profit: number; // Gross profit (Revenue - Cost of Goods)
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'CUENTA_CORRIENTE';
  customerId?: string; // Linked customer
  userId?: string; // Seller who made the sale
  userName?: string;
  fiscalType?: 'A' | 'B' | 'C' | 'X'; // AFIP Invoice Type 
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

// --- BI Interfaces ---

export interface DemandPrediction {
  productName: string;
  currentSales: number; // Last 30 days
  predictedSales: number; // Next 30 days
  trend: 'UP' | 'DOWN' | 'STABLE';
  confidence: number; // 0-100
}

export interface RestockRecommendation {
  productName: string;
  suggestedQuantity: number;
  reason: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BusinessIntelligence {
  marketInsights: string; // General text about seasonality/market
  predictions: DemandPrediction[];
  restockSuggestions: RestockRecommendation[];
}

// --- Sorting & Filtering ---

export type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_ASC' | 'STOCK_DESC';
export type ViewMode = 'LIST' | 'GRID';

// --- Users & Security ---

export enum Role {
  ADMIN = 'Administrador', // Full access
  MANAGER = 'Encargado', // Full access except critical settings/delete history
  SELLER = 'Vendedor', // POS, Stock View, Customers. No Finance/Suppliers.
}

export interface Session {
  id: string;
  deviceName: string;
  ip: string;
  lastActive: number;
  isCurrent: boolean;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string; // Keeping PIN for quick access in POS if needed
  password?: string; // For secure login
  is2FAEnabled: boolean;
  sessions?: Session[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  balance: number; // Cuenta corriente (Negative means they owe money, usually)
  loyaltyPoints: number;
  cuit?: string; // For Factura A
}

// --- Promotions ---

export enum PromotionType {
  PERCENTAGE = 'Porcentaje (%)', // X% off on product
  M_X_N = 'M x N (Ej: 2x1)', // Buy M get N
  BULK = 'Precio por Cantidad', // If qty > X, unit price is Y
}

export interface Promotion {
  id: string;
  name: string; // "Oferta Verano"
  type: PromotionType;
  targetProductId: string; // Which product applies
  value: number; // For Percentage: 20 (20%), For Bulk: new unit price
  m?: number; // For MxN: Buy 2
  n?: number; // For MxN: Pay 1
  minQuantity?: number; // For Bulk: Buy more than 5
  active: boolean;
}

// --- Backup ---

export interface Backup {
  id: string;
  date: number;
  size: string;
  data: string; // JSON string of all app data
  autoGenerated: boolean;
}
