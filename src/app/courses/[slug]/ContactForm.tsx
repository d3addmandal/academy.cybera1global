"use client";
import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useFormToken } from "@/hooks/useFormToken";

const trustPoints = [
  "100% Practical Learning",
  "Industry Expert Trainers",
  "Certificate of Completion",
  "Placement & Career Support",
];


export default function ContactForm({ courseName }: { courseName?: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { token, renderedAt } = useFormToken();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, program: courseName ?? "", inquiryType: "course", _token: token, _t: renderedAt, _hp: "" }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        if (data.data?.whatsappUrl) setWhatsappUrl(data.data.whatsappUrl);
      } else {
        setError(data.error ?? "Submission failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#0d1117]/90 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-white font-bold text-lg mb-1">Get Course Details</h3>
      <p className="text-gray-400 text-sm mb-5">Talk to our expert now!</p>

      {done ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
          <p className="text-white font-semibold">Thank you! We will reach out shortly.</p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#20c05c] transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" /> Chat on WhatsApp
            </a>
          )}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Honeypot — invisible to humans, crawlers/bots will fill it */}
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
          <input
            type="text"
            placeholder="Your Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            required
            className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            placeholder="Enter your city"
            className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <button
            type="submit"
            disabled={saving || !token}
            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-500 hover:shadow-[0_6px_20px_rgba(224,0,0,0.4)] transition-all disabled:opacity-60"
          >
            {saving ? "Sending..." : "Request Callback"}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-2.5 pt-5 border-t border-gray-800">
        {trustPoints.map((pt) => (
          <div key={pt} className="flex items-center gap-2.5 text-gray-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
