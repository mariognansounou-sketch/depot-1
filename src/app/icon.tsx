import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Pure geometric mark (no text) on purpose: @vercel/og — which next/og's
 * ImageResponse uses under the hood — only loads its bundled default font
 * when it needs to render a text node, and that font-loading code path has
 * a known Windows bug (it builds an invalid "file:" URL from a Windows
 * backslash path, throwing ERR_INVALID_URL and crashing every request to
 * this route in `next dev` on Windows). Avoiding text entirely sidesteps
 * the bug instead of depending on a library fix.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: "white",
            opacity: 0.95,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
