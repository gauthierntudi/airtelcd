import { CheckinGuestFlow } from "@/components/checkin/CheckinGuestFlow";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: "Check-in invitation — Vodacom Privilege Golf",
};

export default async function CheckinScanPage({ params }: Props) {
  const { token } = await params;
  return <CheckinGuestFlow token={token} />;
}
