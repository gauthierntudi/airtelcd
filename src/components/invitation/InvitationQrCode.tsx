"use client";

import QRCode from "react-qr-code";

type Props = {
  value: string;
  variant?: "default" | "overlay" | "desktop";
  className?: string;
};

const SIZES = {
  default: 200,
  overlay: 220,
  desktop: 88,
} as const;

/** QR SVG — variant overlay : blanc sur fond transparent (slide RSVP). */
export function InvitationQrCode({
  value,
  variant = "default",
  className = "",
}: Props) {
  const size = SIZES[variant];
  const onOverlay = variant === "overlay";

  return (
    <div
      className={className}
      role="img"
      aria-label="QR code invitation"
    >
      <QRCode
        value={value}
        size={size}
        level="L"
        bgColor={onOverlay ? "transparent" : "#ffffff"}
        fgColor={onOverlay ? "#ffffff" : "#000000"}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      />
    </div>
  );
}
