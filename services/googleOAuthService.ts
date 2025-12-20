/**
 * Google OAuth Service
 * Handles OAuth popup flow for Google authentication
 * User authenticates in a popup window and token is returned via postMessage
 */

// @ts-expect-error: Vite env types not present in this runtime context
const GOOGLE_OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_OAUTH_REDIRECT_URI = `${window.location.origin}/google-oauth-callback`;
const GOOGLE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/generative-language';

/**
 * Opens a Google OAuth popup window
 * Returns a promise that resolves with the access token when authentication completes
 */
export const openGoogleOAuthPopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate state for security
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    // Google OAuth authorization endpoint
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_OAUTH_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', GOOGLE_OAUTH_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', GOOGLE_OAUTH_SCOPE);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('access_type', 'online');

    // Open popup
    const popup = window.open(
      authUrl.toString(),
      'google-oauth',
      'width=500,height=600,left=100,top=100'
    );

    if (!popup) {
      reject(
        new Error(
          'No se pudo abrir la ventana de autenticación. Verifica que los popups no estén bloqueados.'
        )
      );
      return;
    }

    // Listen for message from callback window
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.startsWith(window.location.origin)) {
        return;
      }

      if (event.data.type === 'GOOGLE_OAUTH_TOKEN') {
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (!popup.closed) popup.close();

        if (event.data.token) {
          resolve(event.data.token);
        } else {
          reject(new Error(event.data.error || 'Error en la autenticación'));
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout after 10 minutes
    const timeout = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      if (!popup.closed) popup.close();
      reject(new Error('Tiempo agotado en la autenticación de Google'));
    }, 10 * 60 * 1000);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        reject(new Error('Ventana cerrada por el usuario'));
      }
    }, 1000);
  });
};

/**
 * Validates a Google access token by attempting to fetch user info
 */
export const validateGoogleToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Extracts token from OAuth callback URL
 * Called from the callback page
 */
export const extractTokenFromCallback = (): string | null => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
};

/**
 * Sends token back to parent window
 * Called from the callback page
 */
export const sendTokenToParent = (token: string | null) => {
  if (window.opener) {
    window.opener.postMessage(
      {
        type: 'GOOGLE_OAUTH_TOKEN',
        token: token,
        error: token ? null : 'No se pudo obtener el token',
      },
      window.location.origin
    );
  }
};
