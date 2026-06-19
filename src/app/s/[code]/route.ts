import { NextRequest, NextResponse } from 'next/server';
import { getLink } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const cleanUrl = getLink(code);

  if (!cleanUrl) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Not found — Crisp</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100dvh; margin: 0; padding: 2rem;
      background: #fafaf9; color: #1c1917; text-align: center;
    }
    h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.025em; margin: 0; }
    p { color: #a8a29e; margin-top: 0.5rem; }
    a { color: #0d9488; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (prefers-color-scheme: dark) {
      body { background: #0c0a09; color: #e7e5e4; }
      p { color: #57534e; }
    }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>This short link doesn&apos;t exist.</p>
  <p><a href="/">Create one →</a></p>
</body>
</html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return NextResponse.redirect(cleanUrl, 302);
}
