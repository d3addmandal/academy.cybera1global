"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { downloadCertificatePdf, waitForImages } from "@/lib/certificate-pdf";

export default function CertificateViewer({ certificateHtml, certificateNumber }: { certificateHtml: string; certificateNumber: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      await waitForImages(containerRef.current);
      await downloadCertificatePdf(containerRef.current, `${certificateNumber}.pdf`);
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

      <div className="overflow-auto border border-gray-200 rounded-xl shadow-sm bg-white">
        <div ref={containerRef} style={{ width: 1123 }} dangerouslySetInnerHTML={{ __html: certificateHtml }} />
      </div>

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
