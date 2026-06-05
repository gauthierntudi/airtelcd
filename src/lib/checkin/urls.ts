import { getAppBaseUrl } from "@/lib/invitation-url";

export function checkinScanPath(token: string): string {
  return `/checkin/s/${token}`;
}

export function checkinScanAbsoluteUrl(token: string, baseUrl?: string): string {
  return `${getAppBaseUrl(baseUrl)}${checkinScanPath(token)}`;
}

export function checkinDisplayPath(): string {
  return "/checkin/display";
}
