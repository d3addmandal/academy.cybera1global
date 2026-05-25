export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Target, Eye, Award, FlaskConical, Users, BookOpen,
  Building2, CheckCircle2, ArrowRight, Cpu, Globe, BarChart3,
  Monitor, Zap, Star, type LucideIcon,
} from "lucide-react";
import { getAcademyPageContent } from "@/lib/content";
import type { AcademyPageContent } from "@/types/cms";

export const metadata: Metadata = {
  title: "Academy — Building Cybersecurity Professionals Through Practical Industry-Focused Training",
  description: "Cyber A1 Academy combines practical cybersecurity education, enterprise security exposure, and community-driven learning to help students and professionals build real-world security skills.",
};

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Target, Eye, Award, FlaskConical, Users, BookOpen,
  Building2, CheckCircle2, Cpu, Globe, BarChart3, Monitor, Zap, Star,
};

const DOMAIN_ICONS: LucideIcon[] = [Shield, Target, Monitor, Globe, Cpu, BookOpen, Zap, Building2, Award, CheckCircle2];

function getIcon(name: string): LucideIcon { return ICON_MAP[name] ?? Shield; }

const DEFAULTS: AcademyPageContent = {
  hero: {
    badge: "About Cyber A1 Academy",
    headline: "Building Cybersecurity Professionals Through Practical",
    headlineAccent: "Industry-Focused Training",
    description: "Cyber A1 Academy combines practical cybersecurity education, enterprise security exposure, and community-driven learning to help students and professionals build real-world security skills.",
    primaryCta: { text: "Explore Programs", href: "/courses" },
    secondaryCta: { text: "Book Counseling", href: "/contact" },
  },
  about: {
    title: "More Than A Training Institute",
    para1: "Cyber A1 Academy is the training division of Cyber A1 Global Solutions LLP, a cybersecurity company with real-world experience in VAPT, security assessments, compliance, and enterprise security solutions.",
    para2: "We bring industry workflows, methodologies, and practical knowledge into a structured learning environment to prepare learners for real cybersecurity careers.",
    bullets: ["Industry Professionals as Trainers", "Real VAPT & Security Project Exposure", "Practical Labs & Modern Infrastructure", "Community-Driven Learning Ecosystem"],
    mission: "To bridge the gap between theoretical cybersecurity education and real-world industry requirements.",
    vision: "To build a modern cybersecurity learning ecosystem focused on practical skills, enterprise readiness, and continuous innovation.",
  },
  why: {
    sectionLabel: "Why Learners Choose Cyber A1 Academy",
    title: "What Makes Us Different",
    items: [
      { id: "w1", icon: "Monitor", title: "Practical Learning Environment", description: "Real labs, attack scenarios, and industry-grade tools for hands-on learning." },
      { id: "w2", icon: "Building2", title: "Enterprise-Oriented Approach", description: "Training aligned with enterprise workflows, security standards and compliance." },
      { id: "w3", icon: "Users", title: "Industry-Led Mentorship", description: "Learn from security professionals with real industry experience." },
      { id: "w4", icon: "BarChart3", title: "Career Guidance & Roadmaps", description: "Personalized career paths, resume guidance & interview preparation." },
      { id: "w5", icon: "Globe", title: "Real Reporting Methodology", description: "Learn professional reporting standards used in real security assessments." },
      { id: "w6", icon: "Zap", title: "Community Learning Ecosystem", description: "Be part of an active community with events, workshops & knowledge sharing." },
      { id: "w7", icon: "FlaskConical", title: "Hands-On Labs", description: "Access to modern labs, cloud platforms & vulnerable environments." },
      { id: "w8", icon: "Cpu", title: "Modern Security Domains", description: "Training across multiple domains including AI Security, Cloud, SOC, etc." },
    ],
  },
  methodology: {
    sectionLabel: "Our Learning Methodology",
    title: "How We Train",
    steps: [
      { step: "01", title: "Fundamentals", description: "Build strong conceptual understanding of core cybersecurity concepts." },
      { step: "02", title: "Hands-On Labs", description: "Practice in real labs with actual tools and environments." },
      { step: "03", title: "Simulations", description: "Experience real-world attack scenarios and defenses." },
      { step: "04", title: "Reporting & Documentation", description: "Learn professional reporting and documentation." },
      { step: "05", title: "Assessments", description: "Regular assessments to evaluate skills and progress." },
      { step: "06", title: "Career Preparation", description: "Interview prep, resume building & soft skills training." },
      { step: "07", title: "Specialization", description: "Choose your path and become expert in Security, Cloud, SOC, etc." },
    ],
  },
  domains: ["Ethical Hacking", "VAPT (Assessments)", "SOC Operations", "Cloud Security", "AI Security", "Web Security", "Mobile Security", "Network Security", "Secure Coding", "GRC & Compliance"],
  labs: {
    title: "Learn With Industry-Grade Infrastructure",
    description: "Our labs are designed to give you a real cybersecurity experience with advanced tools, simulations, and enterprise-like environments.",
    bullets: ["Dedicated Practical Labs", "Virtual Machines & Attack Ranges", "Cloud Labs (AWS, Azure)", "Security Tools & Simulators", "Reporting & Documentation Platforms", "24/7 Lab Access for Practice"],
  },
  trainers: [
    { id: "t1", name: "Rahul Sharma", role: "Senior Penetration Tester", specialization: "VAPT & Red Teaming", exp: "8+ Years", certifications: "OSCP, CEH, CRTP" },
    { id: "t2", name: "Priya Singh", role: "SOC Team Lead", specialization: "SOC Operations & SIEM", exp: "6+ Years", certifications: "GCIH, CySA+" },
    { id: "t3", name: "Arijit Das", role: "Cloud Security Architect", specialization: "AWS & Azure Security", exp: "7+ Years", certifications: "AWS Security, CCSP" },
    { id: "t4", name: "Neha Roy", role: "Application Security Engineer", specialization: "Web App Security & Bug Bounty", exp: "5+ Years", certifications: "OSWE, CEH" },
  ],
  cta: {
    headline: "Start Building Real Cybersecurity Skills With Cyber A1 Academy",
    primaryCta: { text: "Book Free Counseling", href: "/contact" },
    secondaryCta: { text: "Contact Us", href: "/contact" },
  },
  updatedAt: "",
};

export default function AcademyPage() {
  const cms = getAcademyPageContent() ?? DEFAULTS;
  const { hero, about, why, methodology, domains, labs, trainers, cta } = cms;

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative bg-[#080b10] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Academy</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">{hero.badge}</span>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                {hero.headline}{" "}
                <span className="text-red-500">{hero.headlineAccent}</span>
              </h1>
              <p className="text-gray-400 text-base leading-relaxed mb-8">{hero.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={hero.primaryCta.href} className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
                  {hero.primaryCta.text} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={hero.secondaryCta.href} className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors">
                  {hero.secondaryCta.text}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, label: "Industry Exposure", sub: "Real-world security assessments" },
                { icon: FlaskConical, label: "Practical Learning", sub: "Hands-on labs & simulations" },
                { icon: Award, label: "Career Focused", sub: "Roadmaps, mentors & placement" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-center hover:border-red-600/40 transition-colors">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-red-600/15 border border-red-600/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-white font-semibold text-xs">{label}</p>
                  <p className="text-gray-500 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / Mission & Vision */}
      <section id="mission" className="py-20 bg-white">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">{about.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{about.para1}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{about.para2}</p>
              {about.bullets.filter(Boolean).map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Target className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-white font-bold text-lg mb-3">Our Mission</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{about.mission}</p>
            </div>
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Eye className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-white font-bold text-lg mb-3">Our Vision</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{about.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">{why.sectionLabel}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">
              {why.title.replace("Different", "")} <span className="text-red-600">Different</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {why.items.map(({ id, icon, title, description }) => {
              const Icon = getIcon(icon);
              return (
                <div key={id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-red-200 hover:shadow-md transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Icon className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-20 bg-[#080b10]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-3 block">{methodology.sectionLabel}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white">
              {methodology.title.split(" ").slice(0, -1).join(" ")} <span className="text-red-500">{methodology.title.split(" ").at(-1)}</span>
            </h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {methodology.steps.map((item, i) => (
              <div key={item.step} className="flex-1 relative">
                <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-5 hover:border-red-600/40 transition-colors text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">{item.step}</div>
                  <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
                </div>
                {i < methodology.steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-2 z-10 w-4 h-0.5 bg-red-600/30" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Domains */}
      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Training Domains</span>
            <h2 className="text-3xl font-black text-gray-900">
              Explore Multiple <span className="text-red-600">Cybersecurity Domains</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {domains.filter(Boolean).map((name, i) => {
              const Icon = DOMAIN_ICONS[i % DOMAIN_ICONS.length];
              return (
                <Link key={name} href="/courses" className="group bg-gray-50 border border-gray-100 rounded-xl p-5 text-center hover:border-red-200 hover:bg-red-50 hover:shadow-sm transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-gray-700 font-semibold text-xs group-hover:text-red-700 transition-colors">{name}</p>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/courses" className="inline-flex items-center gap-2 border border-red-600/30 text-red-600 font-semibold px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300">
              View All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Labs */}
      <section id="labs" className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Labs & Infrastructure</span>
              <h2 className="text-3xl font-black text-gray-900 mb-4">{labs.title}</h2>
              <p className="text-gray-500 mb-6">{labs.description}</p>
              {labs.bullets.filter(Boolean).map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <FlaskConical className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">Lab {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section id="trainers" className="py-20 bg-white">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Our Team</span>
            <h2 className="text-3xl font-black text-gray-900">Meet Our <span className="text-red-600">Trainers</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-2xl">
                  {trainer.name.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{trainer.name}</h3>
                <p className="text-red-600 text-sm font-semibold mb-1">{trainer.role}</p>
                <p className="text-gray-500 text-xs mb-3">{trainer.specialization}</p>
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {trainer.certifications.split(",").map((c) => c.trim()).filter(Boolean).map((c) => (
                    <span key={c} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {trainer.exp} Experience
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#080b10]">
        <div className="site-container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">{cta.headline}</h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href={cta.primaryCta.href} className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-red-500 transition-colors">
              {cta.primaryCta.text} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={cta.secondaryCta.href} className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-8 py-3.5 rounded-xl hover:border-red-500 hover:text-red-400 transition-colors">
              {cta.secondaryCta.text}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
