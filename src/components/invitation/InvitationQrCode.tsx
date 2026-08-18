"use client";

import QRCode from "react-qr-code";
import { publicPath } from "@/lib/branding";

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

/** QR SVG — `H` pour laisser place au logo Airtel au centre (~18 %) sans casser le scan. */
export function InvitationQrCode({
  value,
  variant = "default",
  className = "",
}: Props) {
  const size = SIZES[variant];
  const onOverlay = variant === "overlay";
  const showMark = variant !== "desktop";

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="QR code invitation"
    >
      <QRCode
        value={value}
        size={size}
        level="H"
        bgColor={onOverlay ? "transparent" : "#ffffff"}
        fgColor={onOverlay ? "#ffffff" : "#111111"}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      />
      {showMark ? (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 flex h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22%] bg-white shadow-[0_0_0_3px_#fff]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicPath("/img/airtel-a.svg")}
            alt=""
            className="h-[72%] w-auto object-contain"
          />
        </span>
      ) : null}
    </div>
  );
}
