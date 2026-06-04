import Link from "next/link";
import { VodacomLogo } from "@/components/branding/VodacomLogo";

export default function InviteNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <VodacomLogo variant="black" height={44} className="mb-8" />
      <h1 className="text-2xl font-bold text-vodacom-black">
        Invitation introuvable
      </h1>
      <p className="mt-2 text-vodacom-black/70">
        Ce lien n&apos;est pas valide ou a expiré.
      </p>
      <Link href="/" className="mt-6 text-vodacom-red hover:underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
