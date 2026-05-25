import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, MessageSquare, Users, Briefcase, TrendingUp,
  CheckCircle2, ArrowRight, Star, Target,
  BookOpen, FlaskConical, BarChart3, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCRMTestimonials, getCareerPageContent } from "@/lib/content";
import type { CareerPageContent } from "@/types/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career & Placement — Build Your Cybersecurity Career",
  description:
    "Comprehensive career support at Cyber A1 Academy — resume building, LinkedIn optimization, mock interviews, portfolio development, and direct company referrals.",
};

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, MessageSquare, Users, Briefcase, TrendingUp, CheckCircle2,
  Target, BookOpen, FlaskConical, BarChart3, Zap, Star,
};

const DEFAULTS: CareerPageContent = {
  hero: {
    headline: "Build Your Cybersecurity Career With",
    headlineAccent: "100% Practical Support",
    description: "From your first day to your first job — we provide comprehensive career support including resume building, mock interviews, portfolio development, and direct placement assistance.",
    stats: [
      { value: "100%", label: "Placement Support" },
      { value: "500+", label: "Students Placed" },
      { value: "50+",  label: "Hiring Partners" },
      { value: "95%",  label: "Satisfaction Rate" },
    ],
  },
  services: [
    { id: "1", icon: "FileText",     title: "Resume & LinkedIn Optimization", description: "Our career team helps you build an ATS-friendly resume and a strong LinkedIn profile that attracts recruiters." },
    { id: "2", icon: "MessageSquare",title: "Interview Preparation",           description: "Technical and HR mock interviews with real feedback from industry professionals." },
    { id: "3", icon: "Briefcase",    title: "Portfolio Development",           description: "Guidance on building a strong security portfolio with real projects, CTF writeups, and assessment reports." },
    { id: "4", icon: "TrendingUp",   title: "Job & Internship Opportunities",  description: "Direct referrals to our network of hiring partners and job opportunities shared with placed students." },
    { id: "5", icon: "Target",       title: "Career Roadmap Guidance",         description: "Personalized career roadmap sessions based on your current skills and target roles." },
    { id: "6", icon: "Users",        title: "Alumni Network Access",           description: "Connect with our alumni who are placed in top organizations for guidance and mentorship." },
  ],
  journey: [
    { id: "1", step: "01", icon: "BookOpen",     title: "Join Program",           description: "Enroll in any of our cybersecurity programs." },
    { id: "2", step: "02", icon: "FlaskConical", title: "Learn & Practice",       description: "Build skills through labs and real projects." },
    { id: "3", step: "03", icon: "Briefcase",    title: "Work on Projects",       description: "Apply skills on real security assessments." },
    { id: "4", step: "04", icon: "BarChart3",    title: "Get Assessed",           description: "Evaluated on practical skills and knowledge." },
    { id: "5", step: "05", icon: "Target",       title: "Career Guidance",        description: "Resume, LinkedIn, and interview preparation." },
    { id: "6", step: "06", icon: "Zap",          title: "Placement Preparation",  description: "Company connect, referrals, and job applications." },
    { id: "7", step: "07", icon: "CheckCircle2", title: "Grow in Your Career",    description: "Ongoing support and alumni network access." },
  ],
  roles: [
    "Penetration Tester",
    "SOC Analyst (L1/L2/L3)",
    "Security Engineer",
    "Cloud Security Engineer",
    "VAPT Analyst",
    "Application Security Engineer",
    "Threat Intelligence Analyst",
    "Incident Responder",
    "Security Consultant",
    "Red Team Operator",
    "Bug Bounty Hunter",
    "GRC Analyst",
    "DevSecOps Engineer",
    "Security Architect",
  ],
  cta: {
    headline: "Ready to Start Your Cybersecurity Journey?",
    primaryCta: { text: "Explore Programs", href: "/courses" },
    secondaryCta: { text: "Book Free Counseling", href: "/contact" },
  },
  updatedAt: "",
};

export default function CareerPlacementPage() {
  const cms = getCareerPageContent() ?? DEFAULTS;
  const testimonials = getCRMTestimonials();
  const partnerCompanies = testimonials.length > 0
    ? testimonials.map((t) => ({ name: t.company, logo: t.companyLogoUrl }))
    : [{ name: "Deloitte", logo: "" }, { name: "TCS", logo: "" }, { name: "Wipro", logo: "" }, { name: "Infosys", logo: "" }, { name: "Accenture", logo: "" }];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative bg-[#080b10] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Career &amp; Placement</span>
          </div>
          <div className="max-w-3xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">Career &amp; Placement</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {cms.hero.headline}{" "}
              <span className="text-red-500">{cms.hero.headlineAccent}</span>
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">{cms.hero.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cms.hero.stats.map((s) => (
                <div key={s.label} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-red-500">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career Services */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Career Support</span>
            <h2 className="text-3xl font-black text-gray-900">
              Everything You Need To <span className="text-red-600">Land Your Dream Job</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cms.services.map((svc) => {
              const Icon = ICON_MAP[svc.icon] ?? Star;
              return (
                <div key={svc.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:border-red-200 hover:shadow-md transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{svc.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{svc.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Your Journey */}
      <section className="py-20 bg-[#080b10]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-3 block">Your Journey With Us</span>
            <h2 className="text-3xl font-black text-white">
              From Enrollment To <span className="text-red-500">Employment</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {cms.journey.map((step) => {
              const Icon = ICON_MAP[step.icon] ?? Star;
              return (
                <div key={step.step} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-center hover:border-red-600/40 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="w-7 h-7 mx-auto mb-2 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs">
                    {step.step}
                  </div>
                  <h3 className="text-white font-bold text-xs mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-xs">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles you can land */}
      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Career Opportunities</span>
            <h2 className="text-3xl font-black text-gray-900">
              Roles You Can <span className="text-red-600">Target</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {cms.roles.map((role) => (
              <span key={role} className="bg-[#080b10] border border-gray-700 text-gray-300 font-semibold text-sm px-4 py-2 rounded-full hover:border-red-600/50 hover:text-red-400 transition-all cursor-pointer">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Partners */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="text-center mb-10">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Hiring Partners</span>
            <h2 className="text-3xl font-black text-gray-900">
              Our Students Work At <span className="text-red-600">Top Organizations</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {partnerCompanies.map((company) => (
              <div key={company.name} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center aspect-square hover:border-red-200 hover:shadow-sm transition-all">
                <span className="text-gray-600 font-bold text-xs text-center">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Success Stories</span>
            <h2 className="text-3xl font-black text-gray-900">
              Hear From Our <span className="text-red-600">Placed Students</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-red-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#080b10]">
        <div className="site-container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            {cms.cta.headline}
          </h2>
          <p className="text-gray-400 mb-8">Enroll today and get access to our comprehensive placement support program.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={cms.cta.primaryCta.href} className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-red-500 transition-colors">
              {cms.cta.primaryCta.text} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={cms.cta.secondaryCta.href} className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-8 py-3.5 rounded-xl hover:border-red-500 hover:text-red-400 transition-colors">
              {cms.cta.secondaryCta.text}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}