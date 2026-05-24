"use client";
import { ArrowRight } from "lucide-react";

export default function ContactFormClient() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Name *</label>
          <input type="text" placeholder="Full Name" className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address *</label>
          <input type="email" placeholder="your@email.com" className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number *</label>
          <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Preferred City</label>
          <select className="w-full border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 bg-white">
            <option>Select City</option>
            <option>Durgapur</option>
            <option>Delhi</option>
            <option>Kolkata</option>
            <option>Online</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Interested In</label>
        <select className="w-full border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 bg-white">
          <option>Select Program / Topic</option>
          <option>CCEH (3 Months)</option>
          <option>CCSE (12 Months)</option>
          <option>SOC Analyst Program</option>
          <option>VAPT Professional Program</option>
          <option>Cloud Security</option>
          <option>AI Security</option>
          <option>Corporate Training</option>
          <option>Institutional Partnership</option>
          <option>General Enquiry</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</label>
        <textarea rows={4} placeholder="Tell us about your goals, current background, or any questions..." className="w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 placeholder-gray-400 resize-none" />
      </div>
      <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2">
        Send Message <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-xs text-gray-400 text-center">
        Or call us directly at <a href="tel:+918240006007" className="text-red-600 font-semibold">+91 8240 006 007</a>
      </p>
    </form>
  );
}
