import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

/** Icône Lucide avec tailles cohérentes — https://lucide.dev */
export function LucideIcon({
  icon: Icon,
  size = 16,
  className = "",
  strokeWidth = 2,
}: Props) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-hidden
    />
  );
}
