"use client";

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

export default function PartnerForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Contact Person Name" className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="text" placeholder="Institution Name" className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="email" placeholder="Email Address" className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="tel" placeholder="Phone Number" className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <select className="w-full bg-[#080b10] border border-gray-700 text-gray-400 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-600">
        <option>Select Collaboration Type</option>
        {serviceOptions.map((s) => <option key={s}>{s}</option>)}
      </select>
      <textarea rows={4} placeholder="Tell us about your institution and collaboration requirements..." className="w-full bg-[#080b10] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none" />
      <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-500 transition-colors">
        Send Partnership Request
      </button>
    </form>
  );
}
