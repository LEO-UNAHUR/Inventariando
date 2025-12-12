
import { Product, StockMovement, Supplier, Sale, Expense } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const STORAGE_KEY = 'stockarg_inventory_v1';
const HISTORY_KEY = 'stockarg_history_v1';
const SUPPLIER_KEY = 'stockarg_suppliers_v1';
const SALES_KEY = 'stockarg_sales_v1';
const EXPENSES_KEY = 'stockarg_expenses_v1';

export const getStoredProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed data if empty
    return INITIAL_PRODUCTS;
  } catch (error) {
    console.error("Error loading products", error);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products", error);
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
    console.error("Error loading history", error);
    return [];
  }
};

export const saveStoredMovements = (movements: StockMovement[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(movements));
  } catch (error) {
    console.error("Error saving history", error);
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
    console.error("Error loading suppliers", error);
    return [];
  }
};

export const saveStoredSuppliers = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(SUPPLIER_KEY, JSON.stringify(suppliers));
  } catch (error) {
    console.error("Error saving suppliers", error);
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
    console.error("Error loading sales", error);
    return [];
  }
};

export const saveStoredSales = (sales: Sale[]): void => {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error("Error saving sales", error);
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
    console.error("Error loading expenses", error);
    return [];
  }
};

export const saveStoredExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses", error);
  }
};
