import { NextRequest, NextResponse } from 'next/server';
import { sanitizeUrl, getStrippedParams } from '@/lib/sanitize';
import { generateShortCode } from '@/lib/codegen';
import { insertLink, getLink } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messyUrl: string | undefined = body.url;

    if (!messyUrl || typeof messyUrl !== 'string' || messyUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'url is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const cleanUrl = sanitizeUrl(messyUrl);
    if (!cleanUrl) {
      return NextResponse.json(
        { error: 'invalid url — must be a valid absolute URL' },
        { status: 400 }
      );
    }

    const strippedParams = getStrippedParams(messyUrl);

    // Generate short code (with collision resolution)
    let shortCode = generateShortCode(cleanUrl);
    let inserted = insertLink(shortCode, cleanUrl);
    let saltIndex = 1;

    while (!inserted && saltIndex < 10) {
      // Collision: same code, different URL → salt and re-hash
      const existingUrl = getLink(shortCode);
      if (existingUrl === cleanUrl) {
        // Same URL, already exists — deterministic dedup
        break;
      }
      shortCode = generateShortCode(cleanUrl, String(saltIndex));
      inserted = insertLink(shortCode, cleanUrl);
      saltIndex++;
    }

    if (!inserted) {
      // Existing record — fetch the real code if it exists
      // (this happens when the same URL was submitted before)
      // We need to find the already-stored code
      const existing = getLink(shortCode);
      if (existing !== cleanUrl) {
        return NextResponse.json(
          { error: 'failed to create short link after collision resolution' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      shortCode,
      cleanUrl,
      strippedParams,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'invalid JSON body' },
        { status: 400 }
      );
    }
    console.error('POST /api/shorten error:', err);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}
