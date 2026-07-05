/**
 * Client-side certificate PDF generation (html2canvas snapshot -> jsPDF page).
 *
 * All three heavy libraries are dynamically imported inside these functions
 * (never a top-level static import in a "use client" module) since they
 * touch `window`/`document` at module scope and must never execute during
 * SSR/build.
 */

const A4_LANDSCAPE_MM = { width: 297, height: 210 };

interface RenderedImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function renderElementToJpeg(element: HTMLElement): Promise<RenderedImage> {
  // SVG certificate templates render as a bare <svg> at the top of the container. html2canvas
  // re-implements rendering itself and has no support for <foreignObject> — it paints a solid
  // black box where the nested HTML should be — so SVG templates take the native rasterization
  // path instead (serialize -> Image -> canvas), which uses the browser's own SVG engine and
  // handles foreignObject, gradients, and web fonts exactly as the live preview shows them.
  const root = element.firstElementChild;
  if (root && root.tagName.toLowerCase() === "svg") {
    return renderSvgToJpeg(root as unknown as SVGSVGElement);
  }

  // IMPORTANT: `element` must not itself be affected by a CSS transform (e.g. a
  // `scale(...)` used elsewhere purely to shrink an on-screen preview) — html2canvas
  // does not correctly account for that when sizing its capture, and ends up rasterizing
  // only part of the content stretched across the full output, cutting the rest off.
  // Callers must pass a dedicated, untransformed, full-resolution element.
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height };
}

async function renderSvgToJpeg(svg: SVGSVGElement): Promise<RenderedImage> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const width = clone.viewBox?.baseVal?.width || Number(clone.getAttribute("width")) || 1123;
  const height = clone.viewBox?.baseVal?.height || Number(clone.getAttribute("height")) || 794;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("width")) clone.setAttribute("width", String(width));
  if (!clone.getAttribute("height")) clone.setAttribute("height", String(height));

  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to rasterize SVG certificate template."));
      img.src = url;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** "Contain" fit centered on an A4 landscape page — preserves the certificate's own aspect ratio (whatever the template's canvas size is) instead of stretching it to exactly fill 297x210mm, which would distort a design that isn't already in that ratio. */
function fitWithinPage(imgWidth: number, imgHeight: number): { w: number; h: number; x: number; y: number } {
  const pageW = A4_LANDSCAPE_MM.width;
  const pageH = A4_LANDSCAPE_MM.height;
  const imgAspect = imgWidth / imgHeight;
  const pageAspect = pageW / pageH;

  const w = imgAspect > pageAspect ? pageW : pageH * imgAspect;
  const h = imgAspect > pageAspect ? pageW / imgAspect : pageH;
  return { w, h, x: (pageW - w) / 2, y: (pageH - h) / 2 };
}

/** Renders a single certificate element to a downloaded A4-landscape PDF. */
export async function downloadCertificatePdf(element: HTMLElement, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { dataUrl, width, height } = await renderElementToJpeg(element);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const { w, h, x, y } = fitWithinPage(width, height);
  pdf.addImage(dataUrl, "JPEG", x, y, w, h);
  pdf.save(filename);
}

/**
 * Renders many certificates to individual PDFs and zips them into one
 * download. Capped in the UI (~25 at a time) for browser responsiveness —
 * not a server constraint, since none of this touches the server.
 *
 * A single hidden container element is reused across certificates rather
 * than requiring N simultaneously-mounted elements: `renderInto` is called
 * once per certificate number and must repopulate `container` with that
 * certificate's markup (and wait for its images to load) before resolving.
 */
export async function downloadCertificatesZip(
  certificateNumbers: string[],
  container: HTMLElement,
  renderInto: (certificateNumber: string, container: HTMLElement) => Promise<void>,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let i = 0; i < certificateNumbers.length; i++) {
    const certificateNumber = certificateNumbers[i];
    await renderInto(certificateNumber, container);
    const { dataUrl, width, height } = await renderElementToJpeg(container);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const { w, h, x, y } = fitWithinPage(width, height);
    pdf.addImage(dataUrl, "JPEG", x, y, w, h);
    const bytes = pdf.output("arraybuffer");
    zip.file(`${certificateNumber}.pdf`, bytes);
    onProgress?.(i + 1, certificateNumbers.length);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificates-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Waits for every <img> inside a container to finish loading (or fail) before snapshotting — html2canvas needs images already decoded. */
export function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  ).then(() => undefined);
}
