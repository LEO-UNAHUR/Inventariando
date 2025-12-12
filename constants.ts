import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Yerba Mate Playadito 1kg',
    description: 'Yerba mate suave elaborada con palo.',
    category: Category.ALMACEN,
    price: 3500,
    cost: 2200,
    stock: 24,
    minStock: 10,
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    name: 'Fernet Branca 750ml',
    description: 'Aperitivo de hierbas, ideal para compartir.',
    category: Category.BEBIDAS,
    price: 9500,
    cost: 7000,
    stock: 12,
    minStock: 5,
    lastUpdated: Date.now(),
  },
  {
    id: '3',
    name: 'Galletitas Chocolinas 170g',
    description: 'Galletitas de chocolate clásicas.',
    category: Category.ALMACEN,
    price: 1200,
    cost: 800,
    stock: 5,
    minStock: 15, // Low stock simulation
    lastUpdated: Date.now(),
  },
  {
    id: '4',
    name: 'Lavandina Ayudín 1L',
    description: 'Lavandina clásica para desinfección.',
    category: Category.LIMPIEZA,
    price: 1800,
    cost: 1100,
    stock: 30,
    minStock: 8,
    lastUpdated: Date.now(),
  }
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};