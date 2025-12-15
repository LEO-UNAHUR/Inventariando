/**
 * App Metadata & Utilities
 * Obtiene información de la app como versión, año, desarrollador y país del usuario
 */

// Obtener versión desde package.json (en build-time será reemplazado)
export const getAppVersion = (): string => {
  // Usar versión hard-coded del package.json
  return '1.4.1';
};

// Obtener año actual
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

// Nombre del desarrollador
export const getDeveloperName = (): string => {
  return 'Leonardo Esteves';
};

// Emoji de la marca
export const getBrandEmoji = (): string => {
  return '🧉';
};

// Obtener país del usuario basado en idioma/localización
export const getUserCountryFlag = async (): Promise<string> => {
  try {
    // Intenta obtener país del navegador (menos preciso pero no requiere API)
    const languageTag = navigator.language || 'es-AR';
    const region = languageTag.split('-')[1] || 'AR';
    
    // Intentar obtener país más preciso desde API (opcional, comentado por default)
    // const response = await fetch('https://ipapi.co/json/');
    // const data = await response.json();
    // return countryCodeToFlag(data.country_code);
    
    return countryCodeToFlag(region);
  } catch {
    // Default a Argentina (🇦🇷)
    return '🇦🇷';
  }
};

/**
 * Convierte código de país ISO 3166-1 alpha-2 a emoji de bandera
 * Ejemplo: 'AR' -> '🇦🇷'
 */
export const countryCodeToFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

/**
 * Formato completo del pie de página
 */
export const getFooterText = async (): Promise<string> => {
  const version = getAppVersion();
  const year = getCurrentYear();
  const developer = getDeveloperName();
  const emoji = getBrandEmoji();
  const flag = await getUserCountryFlag();
  
  return `Inventariando v${version} • © ${year} ${developer} ${emoji} ${flag}`;
};
