"use client";

const programOptions = [
  "Security Awareness Training",
  "Phishing Simulation",
  "Secure Coding Training",
  "Cloud Security Workshops",
  "SOC Awareness Training",
  "Compliance Awareness Training",
  "Red Team Awareness Session",
  "Custom Enterprise Training",
];

export default function EnquiryForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Your Name" className="w-full bg-[#0d1117] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="text" placeholder="Company Name" className="w-full bg-[#0d1117] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="email" placeholder="Email Address" className="w-full bg-[#0d1117] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
        <input type="tel" placeholder="Phone Number" className="w-full bg-[#0d1117] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600" />
      </div>
      <select className="w-full bg-[#0d1117] border border-gray-700 text-gray-400 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-red-600">
        <option>Select Training Type</option>
        {programOptions.map((p) => <option key={p}>{p}</option>)}
      </select>
      <textarea rows={4} placeholder="Tell us about your requirements (number of employees, preferred dates, specific topics...)" className="w-full bg-[#0d1117] border border-gray-700 text-white text-sm px-4 py-3 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none" />
      <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-500 transition-colors">
        Submit Enquiry
      </button>
    </form>
  );
}
