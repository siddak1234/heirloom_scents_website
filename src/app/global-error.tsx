"use client";

/**
 * Catches failures in the root layout itself. Without this file such a failure
 * renders nothing at all — it must therefore ship its own <html> and <body>,
 * and cannot rely on the app's fonts or stylesheet having loaded.
 */
export default function GlobalError({ reset }: { readonly reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#f3f2f2",
          color: "#201f1d",
          fontFamily: "Georgia, serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 400 }}>
            Heirloom Scents is briefly unavailable.
          </h1>
          <p style={{ color: "#5f5e5d", marginTop: "1rem" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.9rem 2rem",
              border: "1px solid #b68235",
              background: "transparent",
              color: "#7d5411",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
