import Link from "next/link";
import { ArrowRight, BookOpen, Users, Briefcase, GraduationCap, Zap, Link2, Heart, BookMarked } from "lucide-react";

const services = [
  { icon: BookOpen, label: "Workshops & Seminars" },
  { icon: GraduationCap, label: "Faculty Development" },
  { icon: Users, label: "Cybersecurity Clubs" },
  { icon: Zap, label: "Bootcamps & Hackathons" },
  { icon: Briefcase, label: "Internship Collaboration" },
  { icon: Link2, label: "Industry Connect" },
  { icon: Heart, label: "Placement Support" },
  { icon: BookMarked, label: "Curriculum Support" },
];

export default function InstitutionalCollaboration() {
  return (
    <section className="py-20 bg-[#080b10]">
      <div className="site-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-[#080b10] border border-gray-800 p-8">
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Institutional Collaboration</p>
                  <p className="text-gray-600 text-xs mt-1">Replace with: /images/institution.jpg</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 bg-[#0d1117] border border-red-600/30 rounded-xl p-4 shadow-xl">
              <p className="text-red-500 font-black text-2xl">25+</p>
              <p className="text-gray-400 text-xs">Partner Institutions</p>
            </div>
          </div>

          {/* Right */}
          <div className="order-1 lg:order-2">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-3 block">
              Institutional Collaboration
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Partner With{" "}
              <span className="text-red-500">Cyber A1 Academy</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Build the next generation of cybersecurity professionals. Partner with us for training, workshops, internships &amp; placement support.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {services.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-[#0d1117] border border-gray-800 rounded-lg p-3 hover:border-red-600/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/institutions"
              className="inline-flex items-center gap-2 border border-red-600/40 text-red-500 font-semibold px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              Partner With Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

