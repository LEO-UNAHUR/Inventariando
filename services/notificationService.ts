
import { Product, StockMovement, AppNotification, NotificationType, NotificationSeverity, MovementType } from '../types';

export const generateNotifications = (products: Product[], movements: StockMovement[]): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  products.forEach(product => {
    // 1. Low Stock Alert (Existing logic, now notified)
    if (product.stock <= product.minStock) {
      notifications.push({
        id: `low-${product.id}`,
        productId: product.id,
        title: 'Stock Bajo',
        message: `Quedan solo ${product.stock} unidades de ${product.name}. (Mínimo: ${product.minStock})`,
        type: NotificationType.LOW_STOCK,
        severity: product.stock === 0 ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING,
        date: now
      });
    }

    // 2. Expiration Alert
    if (product.expirationDate) {
      const daysUntilExpiration = Math.ceil((product.expirationDate - now) / ONE_DAY);
      
      if (daysUntilExpiration <= 0) {
        notifications.push({
          id: `exp-passed-${product.id}`,
          productId: product.id,
          title: 'Producto Vencido',
          message: `${product.name} venció el ${new Date(product.expirationDate).toLocaleDateString('es-AR')}.`,
          type: NotificationType.EXPIRATION,
          severity: NotificationSeverity.CRITICAL,
          date: now
        });
      } else if (daysUntilExpiration <= 7) {
        notifications.push({
          id: `exp-week-${product.id}`,
          productId: product.id,
          title: 'Vence pronto',
          message: `${product.name} vence en ${daysUntilExpiration} días. Considera ponerlo en oferta.`,
          type: NotificationType.EXPIRATION,
          severity: NotificationSeverity.WARNING,
          date: now
        });
      } else if (daysUntilExpiration <= 30) {
        notifications.push({
          id: `exp-month-${product.id}`,
          productId: product.id,
          title: 'Vencimiento próximo',
          message: `${product.name} vence en ${daysUntilExpiration} días.`,
          type: NotificationType.EXPIRATION,
          severity: NotificationSeverity.INFO,
          date: now
        });
      }
    }

    // 3. Velocity / Replenishment Alert (Rotation based)
    // Calculate average daily consumption over the last 30 days
    if (product.stock > product.minStock) { // Only suggest if not already in low stock alert
      const thirtyDaysAgo = now - (30 * ONE_DAY);
      const recentOutMovements = movements.filter(m => 
        m.productId === product.id && 
        m.type === MovementType.OUT && 
        m.date >= thirtyDaysAgo
      );

      const totalOut = recentOutMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      
      if (totalOut > 0) {
        const dailyRate = totalOut / 30;
        const daysRemaining = Math.floor(product.stock / dailyRate);

        // If stock will run out in less than 5 days based on current speed
        if (daysRemaining < 5) {
          notifications.push({
            id: `vel-${product.id}`,
            productId: product.id,
            title: 'Alta Rotación',
            message: `${product.name} se agotará en aprox. ${daysRemaining} días al ritmo actual de ventas.`,
            type: NotificationType.VELOCITY,
            severity: NotificationSeverity.INFO,
            date: now
          });
        }
      }
    }
  });

  // Sort by severity (Critical first)
  const severityWeight = {
    [NotificationSeverity.CRITICAL]: 3,
    [NotificationSeverity.WARNING]: 2,
    [NotificationSeverity.INFO]: 1,
  };

  return notifications.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
};
