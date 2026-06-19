import { describe, it, expect } from 'vitest';
import { sanitizeUrl, getStrippedParams } from '@/lib/sanitize';
import { generateShortCode } from '@/lib/codegen';
import { insertLink, getLink } from '@/lib/db';

// ── Edge case: sanitizeUrl ─────────────────────────────────────

describe('sanitizeUrl edge cases', () => {
  it('handles URLs with only tracking params (strips everything)', () => {
    const result = sanitizeUrl('https://example.com/page?utm_source=twitter');
    expect(result).toBe('https://example.com/page');
  });

  it('handles URLs with no query string at all', () => {
    expect(sanitizeUrl('https://example.com/page')).toBe(
      'https://example.com/page'
    );
  });

  it('handles URLs with special characters in params', () => {
    const result = sanitizeUrl(
      'https://example.com/page?q=hello%20world&utm_campaign=summer+sale'
    );
    expect(result).toBe('https://example.com/page?q=hello+world');
  });

  it('handles URLs with port numbers', () => {
    const result = sanitizeUrl(
      'https://example.com:8080/page?utm_source=twitter&keep=ok'
    );
    expect(result).toBe('https://example.com:8080/page?keep=ok');
  });

  it('handles international characters in URL path', () => {
    const result = sanitizeUrl(
      'https://example.com/café/page?utm_source=twitter'
    );
    expect(result).toBe('https://example.com/caf%C3%A9/page');
  });

  it('handles already-clean URLs (no tracking params)', () => {
    const url = 'https://example.com/page?q=search&v=1';
    expect(sanitizeUrl(url)).toBe(url);
  });
});

// ── Unit: sanitizeUrl ──────────────────────────────────────────

describe('sanitizeUrl', () => {
  it('strips utm_* parameters', () => {
    const result = sanitizeUrl(
      'https://example.com/page?utm_source=twitter&utm_medium=social&keep=ok'
    );
    expect(result).toBe('https://example.com/page?keep=ok');
  });

  it('strips social click IDs', () => {
    const result = sanitizeUrl(
      'https://example.com/page?fbclid=abc123&gclid=def456&keep=ok'
    );
    expect(result).toBe('https://example.com/page?keep=ok');
  });

  it('strips referral tags and session noise', () => {
    const result = sanitizeUrl(
      'https://example.com/page?ref=news&_ga=xyz&source=google&keep=ok'
    );
    expect(result).toBe('https://example.com/page?keep=ok');
  });

  it('preserves URLs with no params', () => {
    const url = 'https://example.com/page';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('preserves non-tracking params', () => {
    const result = sanitizeUrl('https://example.com/page?v=1&q=hello');
    expect(result).toBe('https://example.com/page?v=1&q=hello');
  });

  it('strips the hash fragment', () => {
    const result = sanitizeUrl('https://example.com/page#section');
    expect(result).toBe('https://example.com/page');
  });

  it('returns null for invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBeNull();
    expect(sanitizeUrl('')).toBeNull();
  });
});

// ── Unit: getStrippedParams ────────────────────────────────────

describe('getStrippedParams', () => {
  it('reports which tracking params were stripped', () => {
    const params = getStrippedParams(
      'https://example.com/page?utm_source=twitter&fbclid=abc&keep=ok'
    );
    expect(params.sort()).toEqual(['fbclid', 'utm_source']);
  });

  it('returns empty array when nothing is stripped', () => {
    expect(getStrippedParams('https://example.com/page')).toEqual([]);
  });

  it('returns empty array for invalid URL', () => {
    expect(getStrippedParams('')).toEqual([]);
  });
});

// ── Unit: generateShortCode ────────────────────────────────────

describe('generateShortCode', () => {
  it('produces a deterministic 6-7 char code for the same URL', () => {
    const code1 = generateShortCode('https://example.com/page');
    const code2 = generateShortCode('https://example.com/page');
    expect(code1).toBe(code2);
    expect(code1.length).toBeGreaterThanOrEqual(6);
    expect(code1.length).toBeLessThanOrEqual(7);
  });

  it('produces different codes for different URLs', () => {
    const code1 = generateShortCode('https://example.com/page');
    const code2 = generateShortCode('https://example.com/other');
    expect(code1).not.toBe(code2);
  });

  it('produces a different code with a salt', () => {
    const code1 = generateShortCode('https://example.com/page');
    const code2 = generateShortCode('https://example.com/page', '1');
    expect(code1).not.toBe(code2);
  });

  it('only uses alphanumeric characters', () => {
    const code = generateShortCode('https://example.com/page');
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

// ── Integration: shorten + store + redirect cycle ──────────────

describe('shorten and redirect cycle', () => {
  it('stores a link and retrieves it for redirect', async () => {
    const messyUrl =
      'https://example.com/page?utm_source=twitter&fbclid=abc&keep=ok';
    const cleanUrl = sanitizeUrl(messyUrl);
    expect(cleanUrl).toBe('https://example.com/page?keep=ok');

    const shortCode = generateShortCode(cleanUrl!);

    // Insert into DB
    const inserted = await insertLink(shortCode, cleanUrl!);
    expect(inserted).toBe(true);

    // Retrieve from DB
    const storedUrl = await getLink(shortCode);
    expect(storedUrl).toBe(cleanUrl);

    // Verify the cycle: messy URL → clean → short code → stored → retrievable
    const stripped = getStrippedParams(messyUrl);
    expect(stripped.sort()).toEqual(['fbclid', 'utm_source']);
  });

  it('deduplicates: same URL returns the same short code', () => {
    const url = 'https://example.com/page?utm_source=twitter';
    const clean = sanitizeUrl(url)!;
    const code1 = generateShortCode(clean);
    const code2 = generateShortCode(clean);
    expect(code1).toBe(code2);
  });
});
