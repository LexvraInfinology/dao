import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found | EQUORA_FI',
  description: 'The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track.',
};

export default function NotFound() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          box-sizing: border-box;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          color-scheme: light;
        }
        *, *::before, *::after {
          box-sizing: inherit;
        }
        html:has(.nf-root),
        body:has(.nf-root) {
          margin: 0;
          background: #f6f9ff !important;
        }

        /* EQUORA_FI theme tokens (sampled from the dashboard) */
        .nf-root {
          --bg: #f6f9ff;
          --border: #e2eaf7;
          --primary: #1769ff;
          --primary-dark: #003eb3;
          --ink: #071b49;
          --muted: #64748b;

          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          text-align: center;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          font-family: var(--font-sans, "Inter", system-ui, -apple-system, "Segoe UI", sans-serif);
        }

        .nf-glow {
          position: absolute;
          top: 10%;
          left: 50%;
          width: min(620px, 90vw);
          height: 330px;
          transform: translateX(-50%);
          background: radial-gradient(closest-side, rgba(23, 105, 255, 0.09), rgba(23, 105, 255, 0));
          pointer-events: none;
        }

        .nf-art {
          position: relative;
          width: min(500px, 86vw);
        }

        /* multiply blends the illustration's white backdrop into the page bg */
        .nf-img {
          width: 100%;
          height: auto;
          display: block;
          mix-blend-mode: multiply;
          user-select: none;
        }

        .nf-float {
          animation: nf-float 4.5s ease-in-out infinite;
          will-change: transform;
        }

        .nf-shadow {
          width: 44%;
          height: 11px;
          margin: -4px auto 0;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(7, 27, 73, 0.14), rgba(7, 27, 73, 0));
          animation: nf-shadow 4.5s ease-in-out infinite;
        }

        .nf-title {
          margin: 20px 0 0;
          font-size: clamp(24px, 3.2vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
          animation: nf-rise 0.7s 0.1s both ease-out;
        }

        .nf-text {
          margin: 10px 0 0;
          max-width: 390px;
          font-size: 15px;
          line-height: 1.55;
          color: var(--muted);
          animation: nf-rise 0.7s 0.2s both ease-out;
        }

        .nf-btn {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 24px;
          border-radius: 999px;
          background: var(--primary);
          color: #fff;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(23, 105, 255, 0.22);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          animation: nf-rise 0.7s 0.3s both ease-out;
        }
        .nf-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(0, 62, 179, 0.28);
        }
        .nf-btn:hover svg {
          transform: translateX(-3px);
        }
        .nf-btn svg {
          transition: transform 0.2s ease;
        }
        .nf-btn:focus-visible {
          outline: 3px solid rgba(23, 105, 255, 0.35);
          outline-offset: 3px;
        }

        @keyframes nf-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes nf-shadow {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(0.85); opacity: 0.65; }
        }
        @keyframes nf-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-float, .nf-shadow, .nf-title, .nf-text, .nf-btn {
            animation: none;
          }
        }
      `,
        }}
      />
      <main className="nf-root">
        <div className="nf-glow" aria-hidden="true"></div>
        <div className="nf-art">
          <div className="nf-float">
            <img
              className="nf-img"
              alt="404 – page not found"
              width={1000}
              height={560}
              src="/not-found-illustration.jpg"
            />
          </div>
          <div className="nf-shadow" aria-hidden="true"></div>
        </div>
        <h1 className="nf-title">Page not found</h1>
        <p className="nf-text">
          The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track.
        </p>
        <Link href="/" className="nf-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Go back home
        </Link>
      </main>
    </>
  );
}
