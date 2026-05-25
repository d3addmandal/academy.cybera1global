"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, FlaskConical, TrendingUp, Users, Building2,
  CheckCircle2, ArrowRight, ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Real Industry Exposure",
    description: "Work on real VAPT projects and learn enterprise reporting methodology.",
    points: ["Real-world security assessments", "Enterprise security workflows", "Professional reporting standards"],
  },
  {
    icon: FlaskConical,
    title: "Practical Learning",
    description: "Hands-on labs, real-world simulations and industry-grade tools.",
    points: ["Dedicated lab environments", "Virtual machines & attack ranges", "Cloud-based security labs"],
  },
  {
    icon: TrendingUp,
    title: "Career-Focused Training",
    description: "Career roadmap, interview preparation, resume building & placement support.",
    points: ["Resume & LinkedIn optimization", "Mock interview sessions", "Direct company referrals"],
  },
  {
    icon: Users,
    title: "Community & Events",
    description: "Active community, GDG Durgapur, workshops, DevFest & tech events.",
    points: ["GDG Durgapur community", "Monthly workshops & seminars", "CTF competitions"],
  },
  {
    icon: Building2,
    title: "Corporate Training Capability",
    description: "Custom training for organizations on latest security topics.",
    points: ["Tailored corporate programs", "Compliance training", "Security awareness"],
  },
];

const stats = [
  { value: "20+", label: "Expert Trainers" },
  { value: "50+", label: "Hands-on Labs" },
  { value: "1000+", label: "Students Trained" },
  { value: "100+", label: "Workshops & Events" },
];

export default function WhyCyberA1() {
  const [activeFeature, setActiveFeature] = useState(0);
  const active = features[activeFeature];

  return (
    <section className="py-20 bg-white">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Why cards */}
          <div>
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">
              Why Cyber A1 Academy?
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Why Students &amp; Organizations
              <br />
              <span className="text-red-600">Choose Cyber A1</span>
            </h2>
            <p className="text-gray-500 mb-10 max-w-lg">
              We combine enterprise-grade training with practical industry exposure to create job-ready cybersecurity professionals.
            </p>

            <div className="space-y-3">
              {features.map((feature, i) => (
                <button
                  key={feature.title}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    activeFeature === i
                      ? "border-red-600/40 bg-red-50 shadow-sm"
                      : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeFeature === i
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${activeFeature === i ? "text-red-700" : "text-gray-800"}`}>
                      {feature.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{feature.description}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                      activeFeature === i ? "text-red-600 translate-x-0.5" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Career roadmap / active feature detail */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-4 rounded-xl bg-[#080b10] border border-gray-800">
                  <p className="text-2xl font-black text-red-500">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active feature detail */}
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                  <active.icon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{active.title}</h3>
                  <p className="text-gray-500 text-sm">{active.description}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {active.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Choose your path */}
            <div className="bg-gradient-to-br from-red-900/30 to-red-950/20 border border-red-800/30 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">Choose Your Path</h3>
              <p className="text-gray-400 text-sm mb-4">
                Not sure where to start? Our counselors will build a personalized cybersecurity learning roadmap based on your goals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-500 transition-colors"
                >
                  Explore Programs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-gray-600 text-gray-300 font-semibold text-sm px-5 py-2.5 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  Free Counseling
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

