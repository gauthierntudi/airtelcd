import Image from "next/image";
import Link from "next/link";
import { brandIconSrc } from "@/lib/branding";

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
      src={brandIconSrc()}
      alt="Airtel RSVP"
      width={size}
      height={size}
      unoptimized
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
