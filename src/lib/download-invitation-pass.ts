import { toPng } from "html-to-image";

function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image de fond introuvable"));
  });
}

export function invitationPassFilename(firstName: string | null | undefined): string {
  const slug =
    firstName
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "invitation";
  return `vodacom-privilege-golf-${slug}.png`;
}

/** Capture un élément DOM et déclenche le téléchargement PNG. */
export async function downloadInvitationPassPng(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const bg = element.querySelector<HTMLImageElement>("img[data-pass-bg]");
  if (bg) await waitForImage(bg);
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
