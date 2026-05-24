"use client";
import { CheckCircle2 } from "lucide-react";

const trustPoints = [
  "100% Practical Learning",
  "Industry Expert Trainers",
  "Certificate of Completion",
  "Placement & Career Support",
];

export default function ContactForm() {
  return (
    <div className="bg-[#0d1117]/90 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-white font-bold text-lg mb-1">Get Course Details</h3>
      <p className="text-gray-400 text-sm mb-5">Talk to our expert now!</p>

      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
        />
        <select className="w-full bg-[#080b10] border border-gray-700 text-gray-400 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 transition-colors">
          <option value="">Select City</option>
          <option>Durgapur</option>
          <option>Delhi</option>
          <option>Kolkata</option>
          <option>Online</option>
        </select>
        <button
          type="submit"
          className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-500 hover:shadow-[0_6px_20px_rgba(224,0,0,0.4)] transition-all"
        >
          Request Callback
        </button>
      </form>

      {/* Trust points */}
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
