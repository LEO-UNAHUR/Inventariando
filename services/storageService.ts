import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const STORAGE_KEY = 'stockarg_inventory_v1';

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