const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'twclid',
  'li_fat_id',
  'igshid',
  'ref',
  'referrer',
  'source',
  'sponsored',
  'affiliate_id',
  'click_id',
  '_ga',
  '_gl',
  'session_id',
  'user_id',
]);

/**
 * Strips known tracking parameters from a URL.
 * Returns the clean URL string, or null if the input is not a valid URL.
 */
export function sanitizeUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    const cleanParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!TRACKING_PARAMS.has(key)) {
        cleanParams.append(key, value);
      }
    }

    url.search = cleanParams.toString();
    url.hash = '';

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Returns the names of tracking parameters that were stripped from a URL.
 */
export function getStrippedParams(rawUrl: string): string[] {
  try {
    const url = new URL(rawUrl);
    const stripped: string[] = [];

    for (const [key] of url.searchParams.entries()) {
      if (TRACKING_PARAMS.has(key)) {
        stripped.push(key);
      }
    }

    return stripped;
  } catch {
    return [];
  }
}
