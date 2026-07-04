/**
 * Client-side certificate PDF generation (html2canvas snapshot -> jsPDF page).
 *
 * All three heavy libraries are dynamically imported inside these functions
 * (never a top-level static import in a "use client" module) since they
 * touch `window`/`document` at module scope and must never execute during
 * SSR/build.
 */

const A4_LANDSCAPE_MM = { width: 297, height: 210 };

async function renderElementToJpeg(element: HTMLElement): Promise<string> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  return canvas.toDataURL("image/jpeg", 0.92);
}

/** Renders a single certificate element to a downloaded A4-landscape PDF. */
export async function downloadCertificatePdf(element: HTMLElement, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const imgData = await renderElementToJpeg(element);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(imgData, "JPEG", 0, 0, A4_LANDSCAPE_MM.width, A4_LANDSCAPE_MM.height);
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
    const imgData = await renderElementToJpeg(container);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(imgData, "JPEG", 0, 0, A4_LANDSCAPE_MM.width, A4_LANDSCAPE_MM.height);
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
