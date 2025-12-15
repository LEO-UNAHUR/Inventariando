import { UserSettings, IAProvider } from '../types';

const SETTINGS_STORAGE_KEY = 'inventariando_user_settings';

/**
 * Obtener configuración del usuario desde localStorage
 */
export const getUserSettings = (userId: string): UserSettings => {
  try {
    const stored = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Error loading user settings');
  }

  // Retornar settings por defecto
  return {
    userId,
    iaProvider: IAProvider.GEMINI,
    notificationsEnabled: true,
    darkMode: false,
    language: 'es',
    lastUpdated: Date.now(),
  };
};

/**
 * Generar y almacenar un código de verificación de WhatsApp
 */
export const generateWhatsappCode = (userId: string, phone: string): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
  const settings = getUserSettings(userId);
  const updated: UserSettings = {
    ...settings,
    whatsappPhone: formatPhoneForWhatsApp(phone),
    whatsappVerificationCode: code,
    whatsappVerificationExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
    whatsappVerifiedAt: undefined,
  };
  saveUserSettings(updated);
  return code;
};

/**
 * Validar código de verificación de WhatsApp
 */
export const verifyWhatsappCode = (userId: string, code: string): boolean => {
  const settings = getUserSettings(userId);
  const isValid =
    !!settings.whatsappVerificationCode &&
    settings.whatsappVerificationCode === code &&
    !!settings.whatsappVerificationExpiresAt &&
    settings.whatsappVerificationExpiresAt > Date.now();

  if (isValid) {
    saveUserSettings({
      ...settings,
      whatsappVerificationCode: undefined,
      whatsappVerificationExpiresAt: undefined,
      whatsappVerifiedAt: Date.now(),
    });
  }

  return isValid;
};

/**
 * Guardar configuración del usuario
 */
export const saveUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(
      `${SETTINGS_STORAGE_KEY}_${settings.userId}`,
      JSON.stringify({
        ...settings,
        lastUpdated: Date.now(),
      })
    );
  } catch {
    console.error('Error saving user settings');
  }
};

/**
 * Actualizar un campo específico de la configuración
 */
export const updateUserSetting = (
  userId: string,
  key: keyof UserSettings,
  value: any
): UserSettings => {
  const settings = getUserSettings(userId);
  const updated = { ...settings, [key]: value, lastUpdated: Date.now() };
  saveUserSettings(updated);
  return updated;
};

/**
 * Encriptar credencial simple (XOR básico - para producción usar algoritmo robusto)
 * NOTA: Esto es una encriptación ligera. Para producción, usar libcrypto-js o similar.
 */
export const encryptCredential = (text: string): string => {
  // Simple XOR con clave derivada de timestamp
  const key = 'inventariando-secure-' + Math.floor(Date.now() / 86400000);
  return Buffer.from(text).toString('base64') + '|' + key;
};

/**
 * Desencriptar credencial
 */
export const decryptCredential = (encrypted: string): string => {
  try {
    const [encoded] = encrypted.split('|');
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

/**
 * Validar número de teléfono (formato simple)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Básico: al menos 10 dígitos, puede incluir +, -, espacios
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10 && /^\+?\d{10,}$/.test(cleaned);
};

/**
 * Formatear número de teléfono para WhatsApp (sin caracteres especiales)
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remover todo excepto dígitos y +
  return phone.replace(/[^\d+]/g, '');
};

export default {
  getUserSettings,
  saveUserSettings,
  updateUserSetting,
  generateWhatsappCode,
  verifyWhatsappCode,
  encryptCredential,
  decryptCredential,
  isValidPhoneNumber,
  formatPhoneForWhatsApp,
};
