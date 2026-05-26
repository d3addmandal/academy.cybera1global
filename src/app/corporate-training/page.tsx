import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Target, Code, Cloud, Eye, CheckCircle2, Users, Zap,
  ArrowRight, Building2, Phone, BarChart3, Award, BookOpen, Star, Cpu, Lock, Globe
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import type { CorporatePageContent } from "@/types/cms";
import { getCorporatePageContent, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Training - Cybersecurity Solutions for Organizations",
  description:
    "Custom cybersecurity training programs for organizations. Security awareness, VAPT workshops, SOC training, phishing simulations, compliance, and red team awareness.",
};

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Target, Code, Cloud, Eye, CheckCircle2, Users, Zap,
  Building2, BarChart3, Award, BookOpen, Globe, Lock, Cpu, Star,
};

const DEFAULTS: CorporatePageContent = {
  hero: {
    badge: "Corporate Training Solutions",
    headline: "Empower Your Team With",
    headlineAccent: "Cybersecurity Skills",
    description: "We design role-based and industry-specific cybersecurity training programs to meet your organization's security goals. From security awareness to advanced VAPT workshops.",
    primaryCta: { text: "Request Corporate Proposal", href: "/contact" },
  },
  programs: [
    { id: "1", icon: "Eye",          title: "Security Awareness Training",   description: "Educate your employees about cybersecurity best practices, threat awareness, and safe digital behavior.",             duration: "1 Day",    mode: "Online / Offline", audience: "All Employees" },
    { id: "2", icon: "Target",       title: "Phishing Simulation",           description: "Real-world phishing simulations to test and improve your team's phishing awareness and response.",                  duration: "Ongoing",  mode: "Online",           audience: "All Employees" },
    { id: "3", icon: "Code",         title: "Secure Coding Training",        description: "Train your development team on secure coding practices, OWASP guidelines, and code review techniques.",             duration: "2-3 Days", mode: "Offline",          audience: "Developers" },
    { id: "4", icon: "Cloud",        title: "Cloud Security Workshops",      description: "Hands-on workshops covering AWS and Azure security configurations, IAM best practices, and cloud VAPT basics.",      duration: "2 Days",   mode: "Hybrid",           audience: "Cloud/DevOps Teams" },
    { id: "5", icon: "Shield",       title: "SOC Awareness Training",        description: "Understand SOC operations, SIEM tools, incident response workflows, and threat detection for your IT teams.",        duration: "1 Day",    mode: "Online / Offline", audience: "IT/Security Teams" },
    { id: "6", icon: "CheckCircle2", title: "Compliance Awareness Training", description: "ISO 27001, GDPR, PCI DSS compliance training tailored for your organizational roles and responsibilities.",         duration: "1 Day",    mode: "Online / Offline", audience: "Management & IT" },
    { id: "7", icon: "Zap",          title: "Red Team Awareness Session",    description: "Understand red team methodologies, attack simulations, and how attackers think from a defensive perspective.",      duration: "Half Day", mode: "Online",           audience: "Security Teams" },
    { id: "8", icon: "Users",        title: "Custom Enterprise Training",    description: "Fully customized training programs designed around your organization's specific industry, tools, and threat landscape.", duration: "Custom", mode: "Online / Offline", audience: "Organization-wide" },
  ],
  benefits: [
    "Reduce the risk of data breaches through employee awareness",
    "Build a security-first culture across your organization",
    "Meet compliance requirements (ISO 27001, GDPR, PCI DSS)",
    "Improve incident response readiness",
    "Train technical teams with hands-on practical exercises",
    "Customized content based on your industry and threat landscape",
    "Flexible delivery — online, offline, or hybrid",
    "Post-training assessment and certification",
  ],
  industries: [
    { id: "1", icon: "Building2", name: "IT Services Companies" },
    { id: "2", icon: "Shield",    name: "Banking & Finance" },
    { id: "3", icon: "Users",     name: "Healthcare Organizations" },
    { id: "4", icon: "Award",     name: "Government Enterprises" },
    { id: "5", icon: "BookOpen",  name: "Educational Institutions" },
    { id: "6", icon: "BarChart3", name: "E-commerce Platforms" },
  ],
  process: [
    { step: "01", title: "Requirement Analysis", description: "We analyze your organization's specific needs, industry, and security gaps." },
    { step: "02", title: "Program Design",        description: "Custom curriculum designed for your team's roles and responsibilities." },
    { step: "03", title: "Trainer Assignment",    description: "Expert trainers matched to your domain and technical requirements." },
    { step: "04", title: "Training Delivery",     description: "Flexible delivery via online, offline, or hybrid modes." },
    { step: "05", title: "Assessment",            description: "Post-training assessments to measure knowledge and identify gaps." },
    { step: "06", title: "Certification & Report", description: "Participation certificates and detailed training report provided." },
  ],
  cta: { headline: "Request a Corporate Proposal", primaryCta: { text: "Request Proposal", href: "/contact" } },
  updatedAt: "",
};

export default function CorporateTrainingPage() {
  const cms = getCorporatePageContent() ?? DEFAULTS;
  const settings = getSiteSettings();
  const phone = settings?.phone ?? "+91 8240 006 007";
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#080b10] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Corporate Training</span>
          </div>
          <div className="max-w-3xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">{cms.hero.badge}</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {cms.hero.headline}{" "}
              <span className="text-red-500">{cms.hero.headlineAccent}</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed mb-8">{cms.hero.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={cms.hero.primaryCta.href} className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
                {cms.hero.primaryCta.text} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={telHref} className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors">
                <Phone className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Our Programs</span>
            <h2 className="text-3xl font-black text-gray-900">
              Comprehensive <span className="text-red-600">Training Solutions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cms.programs.map((prog) => {
              const Icon = ICON_MAP[prog.icon] ?? Star;
              return (
                <div key={prog.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-red-200 hover:shadow-lg transition-all duration-300 group flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{prog.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{prog.description}</p>
                  <div className="border-t border-gray-100 pt-4 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-gray-700 font-semibold">{prog.duration}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Mode:</span>
                      <span className="text-gray-700 font-semibold">{prog.mode}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">For:</span>
                      <span className="text-gray-700 font-semibold">{prog.audience}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Corporate Training */}
      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Why Corporate Training?</span>
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                Why Organizations Choose <span className="text-red-600">Cyber A1</span>
              </h2>
              <p className="text-gray-500 mb-6">
                Human error is responsible for over 85% of cybersecurity breaches. Our corporate training programs help your team become the strongest line of defense.
              </p>
              <ul className="space-y-3">
                {cms.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-gray-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-6">Industries We Train</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cms.industries.map((ind) => {
                  const Icon = ICON_MAP[ind.icon] ?? Star;
                  return (
                    <div key={ind.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{ind.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 bg-[#080b10] border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-3">Don&apos;t see your industry? We train all sectors.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-500 transition-colors">
                  Request Custom Proposal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#080b10]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-3 block">How It Works</span>
            <h2 className="text-3xl font-black text-white">
              Our Training <span className="text-red-500">Process</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cms.process.map((s) => (
              <div key={s.step} className="bg-[#0d1117] border border-gray-800 rounded-xl p-5 text-center hover:border-red-600/40 transition-colors">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">
                  {s.step}
                </div>
                <h3 className="text-white font-bold text-xs mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-20 bg-white" id="enquire">
        <div className="site-container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Get In Touch</span>
            <h2 className="text-3xl font-black text-gray-900">
              Request a <span className="text-red-600">Corporate Proposal</span>
            </h2>
          </div>
          <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-5 sm:p-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
