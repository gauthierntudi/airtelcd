import { toPng } from "html-to-image";

function isMobileSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Safari/i.test(navigator.userAgent) &&
    !/Chrome|CriOS|FxiOS|OPiOS|EdgiOS/i.test(navigator.userAgent) &&
    /Mobile|iP(ad|hone|od)/i.test(navigator.userAgent)
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture image impossible"));
    reader.readAsDataURL(blob);
  });
}

/** Charge l'image en data URL — Safari iOS ne peint pas toujours les src relatives dans le canvas. */
async function imageSrcToDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;

  const url =
    src.startsWith("http://") || src.startsWith("https://")
      ? src
      : new URL(src, window.location.origin).href;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Image de fond introuvable");
  return blobToDataUrl(await res.blob());
}

async function waitForDecodedImage(img: HTMLImageElement): Promise<void> {
  if (img.decode) {
    await img.decode();
  } else if (!img.complete || img.naturalWidth === 0) {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image de fond introuvable"));
    });
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Intègre img08 (ou autre fond) en base64 avant capture — requis sur iPhone. */
async function embedPassBackground(element: HTMLElement): Promise<void> {
  const bg = element.querySelector<HTMLImageElement>("img[data-pass-bg]");
  if (!bg) return;

  const rawSrc = bg.getAttribute("src") ?? bg.src;
  const dataUrl = await imageSrcToDataUrl(rawSrc);
  bg.crossOrigin = "anonymous";
  bg.src = dataUrl;
  await waitForDecodedImage(bg);
}

async function capturePassPng(element: HTMLElement): Promise<string> {
  const options = { cacheBust: true, pixelRatio: 2 as const };

  if (isMobileSafari()) {
    try {
      await toPng(element, { ...options, pixelRatio: 1 });
    } catch {
      /* warm-up Safari — 1er passage vide, 2e avec le fond */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return toPng(element, options);
}

export function invitationPassFilename(fullName: string | null | undefined): string {
  const slug =
    fullName
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
  await embedPassBackground(element);

  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const dataUrl = await capturePassPng(element);

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
