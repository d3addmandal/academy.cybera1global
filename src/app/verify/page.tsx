"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!certificateNumber.trim()) return;
    setIsChecking(true);
    try {
      const res = await fetch("/api/certificate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: certificateNumber.trim() }),
      });
      const data = await res.json();
      if (data.success) router.push(`/certificate/${data.data.certificateNumber}`);
      else setError(data.error || "Certificate not found. Please check the number and try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#080b10] flex items-start justify-center">
      <div className="site-container max-w-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Verify a Certificate</h1>
        <p className="text-gray-400 mb-8">Enter the certificate number printed on the certificate, or scan its QR code directly.</p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            placeholder="e.g. CERT-2026-A3F9K2QP"
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
          />
          <button
            type="submit"
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> {isChecking ? "Checking…" : "Verify"}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
