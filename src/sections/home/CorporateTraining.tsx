import Link from "next/link";
import { ArrowRight, Shield, Target, Code, Cloud, Eye, CheckCircle2, Users, Zap } from "lucide-react";

const services = [
  { icon: Eye, label: "Security Awareness" },
  { icon: Target, label: "SOC Awareness" },
  { icon: Shield, label: "Phishing Simulation" },
  { icon: CheckCircle2, label: "Compliance Awareness" },
  { icon: Code, label: "Secure Coding" },
  { icon: Zap, label: "Red Team Awareness" },
  { icon: Cloud, label: "Cloud Security Workshops" },
  { icon: Users, label: "Custom Training Programs" },
];

export default function CorporateTraining() {
  return (
    <section className="py-20 bg-[#050505]">
      <div className="site-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-3 block">
              Corporate Training Solutions
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Empower Your Team With
              <br />
              <span className="text-red-500">Cybersecurity Skills</span>
            </h2>
            <p className="text-gray-400 mb-8">
              We design role-based and industry-specific training programs to meet your organization&apos;s security goals.
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
              href="/corporate-training"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-500 hover:shadow-[0_8px_25px_rgba(224,0,0,0.35)] transition-all duration-300"
            >
              Train Your Team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-[#080b10] border border-gray-800 p-8">
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <Building2Icon className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Corporate Training Session</p>
                  <p className="text-gray-600 text-xs mt-1">Replace with: /images/corporate-training.jpg</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#0d1117] border border-red-600/30 rounded-xl p-4 shadow-xl">
              <p className="text-red-500 font-black text-2xl">500+</p>
              <p className="text-gray-400 text-xs">Professionals Trained</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}

