/** Resolves a couple-pasted URL to either an embeddable iframe src (YouTube/
 * Vimeo) or signals a direct file the browser can play natively. Kept as a
 * pure function so it's trivially testable and reusable if a canvas video
 * element is ever added. */
export function resolveVideoEmbed(url: string): { kind: "iframe"; src: string } | { kind: "file"; src: string } {
  const youtubeMatch =
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/.exec(
      url
    );
  if (youtubeMatch) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  // Private/unlisted Vimeo videos require a hash suffix
  // (vimeo.com/123456789/abcdef1234) — dropping it produces an embed URL
  // Vimeo rejects for anything but a fully public video.
  const vimeoMatch = /vimeo\.com\/(\d+)(?:\/([\w]+))?/.exec(url);
  if (vimeoMatch) {
    const [, id, hash] = vimeoMatch;
    const src = hash
      ? `https://player.vimeo.com/video/${id}?h=${hash}`
      : `https://player.vimeo.com/video/${id}`;
    return { kind: "iframe", src };
  }

  return { kind: "file", src: url };
}
