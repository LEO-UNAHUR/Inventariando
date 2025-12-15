import jsPDF from 'jspdf';
import { Sale, Product } from '../types';
import { formatCurrency } from '../constants';

/**
 * Generar PDF de factura de venta
 */
export const generateSalePDF = (sale: Sale, products: Product[], companyName: string = 'Inventariando') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(companyName, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Factura #${sale.id.slice(0, 8)}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Fecha: ${new Date(sale.date).toLocaleDateString('es-AR')}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Hora: ${new Date(sale.date).toLocaleTimeString('es-AR')}`, margin, yPosition);
  yPosition += 10;

  // Items
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  // Header de tabla
  doc.setFont(undefined, 'bold');
  doc.text('Producto', margin, yPosition);
  doc.text('Cantidad', margin + contentWidth * 0.5, yPosition);
  doc.text('Precio', margin + contentWidth * 0.7, yPosition);
  doc.text('Total', margin + contentWidth * 0.85, yPosition);
  yPosition += 6;

  // Línea divisora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);

  // Items
  sale.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const productName = product?.name || 'Producto desconocido';
    const total = item.quantity * item.price;

    doc.text(productName.substring(0, 30), margin, yPosition);
    doc.text(item.quantity.toString(), margin + contentWidth * 0.5, yPosition);
    doc.text(formatCurrency(item.price), margin + contentWidth * 0.7, yPosition);
    doc.text(formatCurrency(total), margin + contentWidth * 0.85, yPosition);
    yPosition += 6;
  });

  // Línea divisora
  yPosition += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // Totales
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);

  // Calcular subtotal (monto antes de descuentos/impuestos)
  const subtotal = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  doc.text('TOTAL:', margin + contentWidth * 0.6, yPosition);
  doc.text(formatCurrency(sale.total), margin + contentWidth * 0.85, yPosition);
  yPosition += 10;

  // Método de pago
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Método de pago: ${sale.paymentMethod || 'No especificado'}`, margin, yPosition);
  yPosition += 5;

  // Nota fiscal
  if (sale.fiscalType) {
    doc.text(`Tipo: ${sale.fiscalType}`, margin, yPosition);
    yPosition += 5;
  }

  // Footer
  yPosition += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Gracias por su compra!', pageWidth / 2, yPosition, { align: 'center' });

  // Guardar
  const fileName = `factura_${sale.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Generar PDF de etiqueta de producto (para imprimir)
 */
export const generateProductLabelPDF = (product: Product, quantity: number = 1) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150], // Etiqueta pequeña
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 5;
  let yPosition = margin;

  // Nombre producto
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(product.name.substring(0, 20), margin, yPosition);
  yPosition += 8;

  // Categoría
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Categoría: ${product.category}`, margin, yPosition);
  yPosition += 5;

  // Precio
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatCurrency(product.price)}`, margin, yPosition);
  yPosition += 10;

  // Barcode (si existe)
  if (product.barcode) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`SKU: ${product.barcode}`, margin, yPosition);
    yPosition += 5;
  }

  // Stock
  doc.setFontSize(9);
  doc.text(`Stock: ${product.stock} unidades`, margin, yPosition);

  const fileName = `etiqueta_${product.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};

export default {
  generateSalePDF,
  generateProductLabelPDF,
};
