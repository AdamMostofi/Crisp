"use client";

import { useState, type FormEvent, useRef } from "react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

interface ShortenResult {
  shortCode: string;
  cleanUrl: string;
  strippedParams: string[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setShowResult(false);
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a URL first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data);
      requestAnimationFrame(() => setShowResult(true));
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  function copyShortUrl() {
    if (!result) return;
    const shortUrl = `${window.location.origin}/s/${result.shortCode}`;
    navigator.clipboard.writeText(shortUrl).catch(() => {
      const el = document.createElement("input");
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const shortUrlDisplay = result ? `${origin}/s/${result.shortCode}` : "";

  return (
    <AnimatedGridPattern
      width={40}
      height={40}
      primaryColor="var(--color-primary)"
      glowColor="var(--color-primary)"
      gridLineColor="var(--color-primary)"
      gridLineOpacity={0.15}
      glowRadius={2}
      rotated
      className="min-h-dvh bg-bg"
    >
      <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-12">
        <main className="w-full max-w-[640px] mx-auto flex flex-col items-center gap-10">
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.01em] text-balance">
            Crisp
          </h1>
          <p className="mt-2 text-sm text-muted">
            Paste a messy URL. Get a clean, short link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/page?utm_source=twitter&..."
            aria-label="URL to clean and shorten"
            className="w-full px-4 py-3 rounded-[8px] border border-border bg-bg text-ink placeholder:text-muted text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       transition-[box-shadow, border-color] duration-[var(--duration-fast)] ease-out"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[6px] bg-primary text-white text-sm font-semibold
                       hover:bg-primary-hover hover:shadow-[0_0_12px_var(--color-primary)] hover:scale-[1.02]
                       active:scale-[0.95] active:shadow-[0_0_6px_var(--color-primary)]
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                       transition-[background-color,opacity,transform,box-shadow] duration-[var(--duration-fast)] ease-out"
          >
            {loading ? "Cleaning…" : "Clean & Shorten"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="w-full px-4 py-3 rounded-[8px] bg-error-bg border border-error-border text-error text-sm animate-[fade-in_var(--duration-fast)_ease-out]"
          >
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className="w-full flex flex-col gap-5 p-5 rounded-[8px] border border-surface bg-surface"
            style={{
              animation: showResult
                ? "fade-up 300ms ease-out both"
                : "none",
            }}
          >
            {/* Short URL */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.75rem] font-semibold text-muted tracking-[0.01em] uppercase">
                Short link
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-[6px] bg-code-bg text-sm font-mono break-all">
                  {shortUrlDisplay}
                </code>
                <button
                  onClick={copyShortUrl}
                  aria-label={copied ? "Copied" : "Copy short URL"}
                  className="shrink-0 px-3 py-2 rounded-[6px] bg-primary text-white text-xs font-semibold
                             hover:bg-primary-hover active:scale-[0.97]
                             transition-[background-color,transform] duration-[var(--duration-fast)] ease-out"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Clean URL */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.75rem] font-semibold text-muted tracking-[0.01em] uppercase">
                Clean URL
              </span>
              <code className="block px-3 py-2 rounded-[6px] bg-code-bg text-sm font-mono break-all">
                {result.cleanUrl}
              </code>
            </div>

            {/* Stripped params */}
            {result.strippedParams.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.75rem] font-semibold text-muted tracking-[0.01em] uppercase">
                  Stripped {result.strippedParams.length} tracking param
                  {result.strippedParams.length > 1 ? "s" : ""}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.strippedParams.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-0.5 rounded-full bg-tag-bg text-accent text-[0.75rem] font-mono font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-4 text-[0.75rem] text-muted text-center">
          <p>no accounts &middot; no tracking &middot; just clean links</p>
        </footer>
      </main>
      </div>
    </AnimatedGridPattern>
  );
}
