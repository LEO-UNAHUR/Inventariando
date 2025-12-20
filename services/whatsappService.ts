import { Sale, Product } from '../types';
import { formatCurrency } from '../constants';

/**
 * Generar mensaje de WhatsApp con detalles de venta
 */
export const generateSaleWhatsAppMessage = (
  sale: Sale,
  products: Product[],
  customerName?: string
): string => {
  const saleDate = new Date(sale.date).toLocaleDateString('es-AR');
  const saleTime = new Date(sale.date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🛒 *Resumen de Venta*\n\n`;
  message += `📅 ${saleDate} ${saleTime}\n`;
  message += `📍 Factura: #${sale.id.slice(0, 8)}\n`;

  if (customerName) {
    message += `👤 Cliente: ${customerName}\n`;
  }

  message += `\n*Productos:*\n`;

  sale.items.forEach((item, index) => {
    const product = products.find((p) => p.id === item.productId);
    const productName = product?.name || 'Producto desconocido';
    const total = item.quantity * item.price;

    message += `${index + 1}. ${productName}\n`;
    message += `   └─ ${item.quantity}x ${formatCurrency(item.price)} = ${formatCurrency(total)}\n`;
  });

  message += `\n*Totales:*\n`;

  // Calcular subtotal (monto antes de descuentos/impuestos)
  const subtotal = sale.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (subtotal !== sale.total) {
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;
  }

  message += `💰 *TOTAL: ${formatCurrency(sale.total)}*\n`;
  message += `💳 Pago: ${sale.paymentMethod || 'No especificado'}`;

  return message;
};

/**
 * Generar mensaje de WhatsApp con detalles de producto
 */
export const generateProductWhatsAppMessage = (product: Product, quantity: number = 1): string => {
  const total = product.price * quantity;

  let message = `📦 *${product.name}*\n\n`;
  message += `💵 Precio: ${formatCurrency(product.price)}\n`;
  message += `📊 Stock disponible: ${product.stock} unidades\n`;

  if (product.description) {
    message += `📝 Descripción: ${product.description}\n`;
  }

  if (quantity > 1) {
    message += `\n🔢 Cantidad: ${quantity}\n`;
    message += `💰 Subtotal: ${formatCurrency(total)}\n`;
  }

  message += `\n✨ Categoría: ${product.category}`;

  return message;
};

/**
 * Generar URL de WhatsApp Web para enviar mensaje
 * @param phoneNumber Número de teléfono (con código de país, ej: 5491234567890)
 * @param message Mensaje a enviar
 */
export const generateWhatsAppWebLink = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  // Remover espacios y caracteres especiales del número
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Generar URL de WhatsApp para aplicación mobile
 */
export const generateWhatsAppAppLink = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
  return `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
};

/**
 * Compartir venta por WhatsApp (abre Web si está disponible)
 */
export const shareViaWhatsApp = (
  sale: Sale,
  products: Product[],
  phoneNumber: string,
  customerName?: string
) => {
  const message = generateSaleWhatsAppMessage(sale, products, customerName);
  const webLink = generateWhatsAppWebLink(phoneNumber, message);

  // Intenta abrir la app, si falla abre Web
  window.open(generateWhatsAppAppLink(phoneNumber, message), '_blank');

  // Fallback a Web después de 1 segundo si la app no abre
  setTimeout(() => {
    window.open(webLink, '_blank');
  }, 1000);
};

/**
 * Compartir producto por WhatsApp
 */
export const shareProductViaWhatsApp = (
  product: Product,
  phoneNumber: string,
  quantity: number = 1
) => {
  const message = generateProductWhatsAppMessage(product, quantity);
  const webLink = generateWhatsAppWebLink(phoneNumber, message);

  window.open(generateWhatsAppAppLink(phoneNumber, message), '_blank');

  setTimeout(() => {
    window.open(webLink, '_blank');
  }, 1000);
};

export default {
  generateSaleWhatsAppMessage,
  generateProductWhatsAppMessage,
  generateWhatsAppWebLink,
  generateWhatsAppAppLink,
  shareViaWhatsApp,
  shareProductViaWhatsApp,
};
