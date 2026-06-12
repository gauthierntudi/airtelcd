import { CheckinDisplayScreen } from "@/components/checkin/CheckinDisplayScreen";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: "Check-in — Vodacom Privilège Golf",
  description: "Borne d'accueil — scannez le QR code pour vérifier votre invitation",
};

export default async function CheckinDisplayTokenPage({ params }: Props) {
  const { token } = await params;
  return <CheckinDisplayScreen token={token} />;
}
