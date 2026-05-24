"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ { question: string; answer: string; }

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const half = Math.ceil(faqs.length / 2);
  const left = faqs.slice(0, half);
  const right = faqs.slice(half);

  return (
    <section className="py-16 bg-white">
      <div className="site-container">
        <div className="text-center mb-10">
          <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">FAQ</span>
          <h2 className="text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[left, right].map((group, gi) => (
            <div key={gi} className="space-y-3">
              {group.map((faq, i) => {
                const idx = gi * half + i;
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
    </section>
  );
}
