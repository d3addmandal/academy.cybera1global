"use client";
import { useState } from "react";
import { Plus, Minus, Award, ShieldOff } from "lucide-react";

interface FAQ { question: string; answer: string; }

interface Props {
  faqs: FAQ[];
  sampleCertificate?: string;
}

function ProtectedCertificate({ url }: { url: string }) {
  return (
    <div className="sticky top-28 flex flex-col h-full">
      {/* Own header — separate from FAQ */}
      <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">Certificate</span>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Sample Certificate</h2>

      {/* Certificate image — protected */}
      <div
        className="relative rounded-xl overflow-hidden border border-gray-100 shadow-lg select-none flex-1"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className="w-full aspect-[1.41/1]"
          style={{
            backgroundImage: `url(${url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Pointer blocker */}
        <div className="absolute inset-0" style={{ zIndex: 10 }} />
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 11 }}
        >
          <span
            className="text-red-600 font-black text-5xl opacity-[0.10] select-none"
            style={{ transform: "rotate(-30deg)", letterSpacing: "0.3em" }}
          >
            SAMPLE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <ShieldOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <p className="text-[10px] text-gray-400">For viewing only — not downloadable</p>
      </div>
    </div>
  );
}

export default function FAQClient({ faqs, sampleCertificate }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const hasCert = Boolean(sampleCertificate);
  const half = Math.ceil(faqs.length / 2);
  const left = faqs.slice(0, half);
  const right = faqs.slice(half);

  return (
    <section className="py-16 bg-white">
      <div className="site-container">
        <div className={`gap-12 ${hasCert ? "grid lg:grid-cols-2" : ""}`}>

          {/* ── FAQ panel (own header) ── */}
          <div>
            <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">FAQ</span>
            <h2 className="text-2xl font-black text-gray-900 mb-8">Frequently Asked Questions</h2>

            <div className={`grid gap-4 ${hasCert ? "grid-cols-1" : "lg:grid-cols-2"}`}>
              {(hasCert ? [faqs] : [left, right]).map((group, gi) => (
                <div key={gi} className="space-y-3">
                  {group.map((faq, i) => {
                    const idx = hasCert ? i : gi * half + i;
                    const isOpen = open === idx;
                    return (
                      <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${isOpen ? "border-red-200" : "border-gray-100"}`}>
                        <button
                          onClick={() => setOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className={`font-semibold text-sm ${isOpen ? "text-red-700" : "text-gray-800"}`}>{faq.question}</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Certificate panel (own header) ── */}
          {hasCert && <ProtectedCertificate url={sampleCertificate!} />}
        </div>
      </div>
    </section>
  );
}
