import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | EQUORA_FI",
};

export default function NotFound() {
  return (
    <>
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
