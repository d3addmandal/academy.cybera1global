"use client";
import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";

const serviceOptions = [
  "Workshops & Seminars",
  "Cybersecurity Clubs",
  "Internship Collaboration",
  "Faculty Development Program",
  "Bootcamps & Hackathons",
  "Industry Connect",
  "Placement Support",
  "Curriculum Support",
];

type State = { name: string; company: string; email: string; phone: string; program: string; message: string };

export default function PartnerForm() {
  const [form, setForm] = useState<State>({ name: "", company: "", email: "", phone: "", program: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ ...form, inquiryType: "institutional" }),
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

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-400" />
        <div>
          <p className="text-white font-bold text-lg mb-1">Request Received!</p>
          <p className="text-gray-400 text-sm">Our partnerships team will contact you within 24 hours.</p>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#20c05c] transition-colors"
          >
            <MessageCircle className="w-5 h-5 fill-white" /> Chat on WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Contact Person Name *" value={form.name} onChange={(e) => set("name", e.target.value)} required className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="text" placeholder="Institution Name" value={form.company} onChange={(e) => set("company", e.target.value)} className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={(e) => set("phone", e.target.value)} required className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <select value={form.program} onChange={(e) => set("program", e.target.value)} className="w-full bg-[#080b10] border border-gray-700 text-gray-400 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-600">
        <option value="">Select Collaboration Type</option>
        {serviceOptions.map((s) => <option key={s}>{s}</option>)}
      </select>
      <textarea rows={4} placeholder="Tell us about your institution and collaboration requirements..." value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none" />
      <button type="submit" disabled={saving} className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60">
        {saving ? "Sending..." : "Send Partnership Request"}
      </button>
    </form>
  );
}