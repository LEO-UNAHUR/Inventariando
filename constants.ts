import { Category, Product, User, Role } from './types';

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
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Dueño (Admin)',
    role: Role.ADMIN,
    pin: '1111',
    password: 'admin',
    avatar: 'AVATAR_1',
    is2FAEnabled: true,
    sessions: [
      {
        id: 's1',
        deviceName: 'PC Escritorio (Windows)',
        ip: '192.168.1.5',
        lastActive: Date.now(),
        isCurrent: true,
      },
      {
        id: 's2',
        deviceName: 'Samsung S21',
        ip: '192.168.1.12',
        lastActive: Date.now() - 3600000,
        isCurrent: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Juan (Encargado)',
    role: Role.MANAGER,
    pin: '2222',
    password: 'juan',
    avatar: 'AVATAR_2',
    is2FAEnabled: false,
    sessions: [
      {
        id: 's3',
        deviceName: 'Tablet Mostrador',
        ip: '192.168.1.20',
        lastActive: Date.now(),
        isCurrent: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Sofía (Vendedora)',
    role: Role.SELLER,
    pin: '3333',
    password: 'sofia',
    avatar: 'AVATAR_3',
    is2FAEnabled: false,
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
