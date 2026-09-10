import type { CanvasFrame, CanvasImageElement } from "./types";

export interface ResolveQrElementsUrls {
  /** The event's public site link -- what a "siteLink" QR encodes, and the
   * fallback for "inviteLink" when no specific guest is being rendered for
   * (a generic, non-personalized export). */
  siteUrl: string;
  /** A specific guest's personal invite link, only present when rendering a
   * per-guest export. */
  inviteUrl?: string;
}

/** Turns every `qr` element in `frames` into an equivalent `image` element
 * pointing at a real, scannable QR code -- CanvasRenderer/CanvasEditor/
 * CanvasPdfDocument never need to know about QR codes or URLs at all; they
 * just render an image. Call this once, right before handing frames to one
 * of those renderers for an actual export (PDF download, etc.) -- it's
 * async (QR generation), which none of those renderers can be. */
export async function resolveCanvasQrElements(
  frames: CanvasFrame[],
  urls: ResolveQrElementsUrls
): Promise<CanvasFrame[]> {
  const hasQr = frames.some((frame) => frame.elements.some((element) => element.type === "qr"));
  if (!hasQr) return frames;

  const QRCode = (await import("qrcode")).default;
  const dataUrlCache = new Map<string, string>();
  const dataUrlFor = async (target: string) => {
    const cached = dataUrlCache.get(target);
    if (cached) return cached;
    const dataUrl = await QRCode.toDataURL(target, { margin: 1, width: 480 });
    dataUrlCache.set(target, dataUrl);
    return dataUrl;
  };

  return Promise.all(
    frames.map(async (frame) => ({
      ...frame,
      elements: await Promise.all(
        frame.elements.map(async (element) => {
          if (element.type !== "qr") return element;
          const target = element.source === "inviteLink" ? (urls.inviteUrl ?? urls.siteUrl) : urls.siteUrl;
          const imageUrl = await dataUrlFor(target);
          const resolved: CanvasImageElement = {
            id: element.id,
            type: "image",
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            rotation: element.rotation,
            zIndex: element.zIndex,
            hidden: element.hidden,
            desktopOnly: element.desktopOnly,
            animationDuration: element.animationDuration,
            imageUrl,
            objectFit: "contain",
            borderRadius: 0,
          };
          return resolved;
        })
      ),
    }))
  );
}
