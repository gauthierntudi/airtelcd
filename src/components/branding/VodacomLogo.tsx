import Image from "next/image";
import Link from "next/link";
import { logoSrc, type LogoVariant } from "@/lib/branding";

type Props = {
  variant?: LogoVariant;
  href?: string;
  /** Hauteur d'affichage en px */
  height?: number;
  className?: string;
  priority?: boolean;
};

export function VodacomLogo({
  variant = "white",
  href,
  height = 40,
  className = "",
  priority = false,
}: Props) {
  const src = logoSrc(variant);
  const width = Math.round(height * 4.2);

  const image = (
    <Image
      src={src}
      alt="Vodacom Privilège"
      width={width}
      height={height}
      className={`h-auto w-auto object-contain object-left ${className}`}
      style={{ maxHeight: height }}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}
