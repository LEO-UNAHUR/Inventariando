// Minimal analytics service (Phase 1 - Beta.1)
// No external paid deps; ready for PostHog/Umami via fetch.

export type AnalyticsEvent =
  | 'app_opened'
  | 'feature_accessed'
  | 'product_added'
  | 'sale_completed'
  | 'inventory_updated'
  | 'ai_suggestion_used'
  | 'backup_created';

interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string; // e.g., PostHog capture endpoint
  apiKey?: string;   // user-provided or environment
}

let config: AnalyticsConfig = {
  enabled: false,
};

export function initAnalytics(opts: Partial<AnalyticsConfig>) {
  config = { ...config, ...opts, enabled: !!opts.enabled };
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!config.enabled || !config.endpoint || !config.apiKey) return;
  safePost({ type: 'identify', userId, properties });
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!config.enabled || !config.endpoint || !config.apiKey) return;
  safePost({ type: 'capture', event, properties, timestamp: Date.now() });
}

function safePost(body: Record<string, unknown>) {
  try {
    fetch(config.endpoint as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => void 0);
  } catch {
    // no-op
  }
}
