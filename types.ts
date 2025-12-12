export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number; // In ARS
  cost: number; // In ARS
  stock: number;
  minStock: number;
  lastUpdated: number;
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
  ANALYSIS = 'ANALYSIS',
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