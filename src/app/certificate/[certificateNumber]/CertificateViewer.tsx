"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { downloadCertificatePdf, waitForImages } from "@/lib/certificate-pdf";

interface Props {
  certificateHtml: string;
  certificateNumber: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function CertificateViewer({ certificateHtml, certificateNumber, canvasWidth = 1123, canvasHeight = 794 }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);

  // Auto-fits the certificate to the available frame width so the whole thing is visible
  // without horizontal or vertical scrolling, on any screen size.
  useEffect(() => {
    function updateScale() {
      const width = wrapperRef.current?.clientWidth;
      if (!width) return;
      setScale(Math.min(1, width / canvasWidth));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [canvasWidth]);

  async function handleDownload() {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      await waitForImages(captureRef.current);
      await downloadCertificatePdf(captureRef.current, `${certificateNumber}.pdf`);
    } catch {
      // best-effort — no server round trip needed for a public download failure
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div ref={wrapperRef} className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
        <div style={{ width: canvasWidth * scale, height: canvasHeight * scale }}>
          <div style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}
            dangerouslySetInnerHTML={{ __html: certificateHtml }} />
        </div>
      </div>

      {/* Off-screen, full-resolution, untransformed copy used only for PDF generation —
          html2canvas doesn't correctly capture an element affected by a CSS transform
          (the scaled frame above is display-only). */}
      <div ref={captureRef} style={{ position: "fixed", left: -99999, top: 0, width: canvasWidth }}
        dangerouslySetInnerHTML={{ __html: certificateHtml }} aria-hidden="true" />

      <div className="no-print flex flex-wrap items-center gap-3 mt-6">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" /> {downloading ? "Preparing…" : "Download Certificate PDF"}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:border-gray-400 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Certificate
        </button>
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-gray-500 font-semibold px-5 py-2.5 rounded-lg hover:text-red-600 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" /> Verify Another Certificate
        </Link>
      </div>
    </>
  );
}
