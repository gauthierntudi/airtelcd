import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/branding";

type Props = {
  href?: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function VodacomIcon({
  href,
  size = 44,
  className = "",
  priority = false,
}: Props) {
  const image = (
    <Image
      src={BRAND.icon}
      alt="Airtel RSVP"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
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
