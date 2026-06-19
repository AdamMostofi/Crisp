import crypto from 'node:crypto';

const BASE62 =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function toBase62(num: bigint): string {
  if (num === BigInt(0)) return '0';
  let result = '';
  const base = BigInt(62);
  let n = num;
  while (n > BigInt(0)) {
    result = BASE62[Number(n % base)] + result;
    n = n / base;
  }
  return result;
}

/**
 * Generates a deterministic short code for a given URL.
 *
 * Takes the MD5 hash of the URL, reads the first 5 bytes (40 bits),
 * and encodes them in base62. This produces a 6-7 character string.
 *
 * An optional salt can be appended to the URL before hashing to
 * resolve collisions.
 */
export function generateShortCode(cleanUrl: string, salt: string = ''): string {
  const input = cleanUrl + salt;
  const hash = crypto.createHash('md5').update(input).digest();

  // Read first 5 bytes as a big-endian integer → ~7 base62 chars
  const num = BigInt('0x' + hash.subarray(0, 5).toString('hex'));

  return toBase62(num);
}
