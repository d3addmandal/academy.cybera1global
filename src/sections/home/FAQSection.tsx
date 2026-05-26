"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";
import type { FAQ } from "@/types/cms";

const DEFAULT_FAQS: FAQ[] = [
  { id: "f1", question: "Who can join Cyber A1 Academy programs?", answer: "Anyone interested in cybersecurity - students, freshers, IT professionals, working professionals, and career switchers. We have programs for every level.", order: 0, isActive: true },
  { id: "f2", question: "Do I need coding knowledge to start?", answer: "No coding knowledge is required for our foundation programs like CCEH.", order: 1, isActive: true },
  { id: "f3", question: "Is this program beginner friendly?", answer: "Absolutely! Our programs are structured from the ground up so anyone can start, even without a technical background.", order: 2, isActive: true },
  { id: "f4", question: "Do you provide practical labs?", answer: "Yes, we have dedicated lab environments including virtual machines, attack ranges, and SIEM environments.", order: 3, isActive: true },
  { id: "f5", question: "Do you offer placement assistance?", answer: "Yes, we provide resume building, mock interviews, and direct referrals to our hiring partners.", order: 4, isActive: true },
  { id: "f6", question: "Are the classes online or offline?", answer: "We offer both online and offline modes to suit your schedule.", order: 5, isActive: true },
];

function FAQItem({ faq, open, setOpen }: { faq: FAQ; open: string | null; setOpen: (id: string | null) => void }) {
  const isOpen = open === faq.id;
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(isOpen ? null : faq.id)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className={`text-sm font-medium leading-snug transition-colors ${isOpen ? "text-red-600" : "text-gray-700 group-hover:text-red-600"}`}>
          {faq.question}
        </span>
        <span className={`flex-shrink-0 mt-0.5 transition-colors ${isOpen ? "text-red-600" : "text-gray-400 group-hover:text-red-500"}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-500 leading-relaxed">{faq.answer}</div>
      )}
    </div>
  );
}

export default function FAQSection({ faqs, cardBgImage }: { faqs?: FAQ[] | null; cardBgImage?: string | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const display = (faqs && faqs.length > 0) ? faqs : DEFAULT_FAQS;
  const half = Math.ceil(display.length / 2);
  const left = display.slice(0, half);
  const right = display.slice(half);

  return (
    <section className="py-8 bg-white">
      <div className="site-container">
        <div className="grid lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_330px] gap-10 xl:gap-14 items-start">

          {/* ── Left: header + 2-col FAQ grid ── */}
          <div>
            <p className="text-red-600 text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl lg:text-[2.25rem] font-black text-gray-900 leading-tight mb-8">
              Have Questions? We&apos;ve Got Answers.
            </h2>

            <div className="grid sm:grid-cols-2 gap-x-10">
              {[left, right].map((group, gi) => (
                <div key={gi} className="divide-y divide-gray-100">
                  {group.map((faq) => (
                    <FAQItem key={faq.id} faq={faq} open={open} setOpen={setOpen} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: "Still have questions?" card ── */}
          <div
            className="relative rounded-2xl p-7 overflow-hidden min-h-[280px]"
            style={
              cardBgImage
                ? { backgroundImage: `url(${cardBgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { backgroundColor: "#080d18" }
            }
          >
            {/* Dark overlay when using a background image */}
            {cardBgImage && (
              <div className="absolute inset-0 bg-[#080d18]/80 pointer-events-none" />
            )}

            {/* Big "?" bubble */}
            <div className="absolute -top-2 right-4 w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-[0_8px_30px_rgba(220,0,0,0.45)] z-10">
              <span className="text-white font-black text-5xl leading-none select-none">?</span>
            </div>

            {/* Chat dots bubble */}
            <div className="absolute top-16 right-20 w-12 h-12 rounded-full bg-red-800/60 flex items-center justify-center z-10 shadow-md">
              <span className="text-red-200 text-base font-black leading-none">&#8226;&#8226;&#8226;</span>
            </div>

            {/* Blue glow dot */}
            <div className="absolute bottom-7 right-7 w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_12px_4px_rgba(59,130,246,0.5)] z-10" />

            {/* Small red dot accent */}
            <div className="absolute bottom-14 right-5 w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />

            {/* Content */}
            <div className="relative z-20 mt-14">
              <h3 className="text-white font-bold text-xl leading-snug mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-7">
                Talk to our experts and get personalized guidance.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-5 py-3 rounded-lg hover:bg-red-500 hover:shadow-[0_6px_20px_rgba(220,0,0,0.4)] transition-all"
              >
                Book Free Counseling <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
