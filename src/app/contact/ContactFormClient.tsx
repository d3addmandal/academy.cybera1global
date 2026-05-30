"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useFormToken } from "@/hooks/useFormToken";

const programOptions = [
  "CCEH (3 Months)",
  "CCSE (12 Months)",
  "SOC Analyst Program",
  "VAPT Professional Program",
  "Cloud Security",
  "AI Security",
  "Corporate Training",
  "Institutional Partnership",
  "General Enquiry",
];


type State = { name: string; email: string; phone: string; city: string; program: string; message: string };

export default function ContactFormClient({ phone = "+91 8240 006 007" }: { phone?: string }) {
  const [form, setForm] = useState<State>({ name: "", email: "", phone: "", city: "", program: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { token, renderedAt } = useFormToken();

  function set(key: keyof State, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inquiryType: "counseling", _token: token, _t: renderedAt, _hp: "" }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        if (data.data?.whatsappUrl) setWhatsappUrl(data.data.whatsappUrl);
      } else {
        setError(data.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-1">Thank You!</h3>
          <p className="text-gray-500 text-sm">We have received your enquiry and will reach out shortly.</p>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#20c05c] transition-colors"
          >
            <MessageCircle className="w-5 h-5 fill-white" /> Continue on WhatsApp
          </a>
        )}
        <button
          onClick={() => { setDone(false); setWhatsappUrl(null); setForm({ name: "", email: "", phone: "", city: "", program: "", message: "" }); }}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Honeypot — invisible to humans, crawlers/bots will fill it */}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Full Name"
            required
            className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            required
            className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Preferred City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Enter your city"
            className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Interested In</label>
        <select
          value={form.program}
          onChange={(e) => set("program", e.target.value)}
          className="w-full border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 bg-white"
        >
          <option value="">Select Program / Topic</option>
          {programOptions.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us about your goals, current background, or any questions..."
          className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !token}
        className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving ? "Sending..." : <><span>Send Message</span> <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Or call us directly at <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-red-600 font-semibold">{phone}</a>
      </p>
    </form>
  );
}
