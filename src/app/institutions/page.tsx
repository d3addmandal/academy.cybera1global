import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, Users, Briefcase, GraduationCap, Zap, Link2, Heart,
  BookMarked, ArrowRight, Phone, Star, Building2, Shield, Globe, Award
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PartnerForm from "./PartnerForm";
import type { InstitutionsPageContent } from "@/types/cms";
import { getInstitutionsPageContent, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institutional Collaboration - Partner With Cyber A1 Academy",
  description:
    "Partner with Cyber A1 Academy for cybersecurity workshops, bootcamps, faculty development, internship programs, and placement support for your institution.",
};

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, Users, Briefcase, GraduationCap, Zap, Link2, Heart,
  BookMarked, Building2, Shield, Globe, Award, Star,
};

const DEFAULTS: InstitutionsPageContent = {
  hero: {
    badge: "Institutional Collaboration",
    headline: "Partner With",
    headlineAccent: "Cyber A1 Academy",
    description: "Build the next generation of cybersecurity professionals. Partner with us for training, workshops, internships & placement support.",
    primaryCta: { text: "Partner With Us", href: "#partner-form" },
    stats: [
      { value: "25+",  label: "Partner Institutions" },
      { value: "500+", label: "Students Placed" },
      { value: "100+", label: "Workshops Conducted" },
      { value: "50+",  label: "Faculty Trained" },
    ],
  },
  services: [
    { id: "1", icon: "BookOpen",     title: "Workshops & Seminars",      description: "One-day and multi-day cybersecurity workshops tailored for your students. Covering practical tools, ethical hacking basics, and career pathways.",                   duration: "1-3 Days" },
    { id: "2", icon: "Users",        title: "Cybersecurity Clubs",       description: "Help establish and mentor a cybersecurity club at your institution with ongoing activities, challenges, and industry exposure.",                                          duration: "Ongoing" },
    { id: "3", icon: "Briefcase",    title: "Internship Collaboration",  description: "Provide real industry internships to your students at Cyber A1 Global Solutions LLP with hands-on VAPT and security project exposure.",                                 duration: "1-3 Months" },
    { id: "4", icon: "GraduationCap",title: "Faculty Development Program",description: "Upskill your faculty members in modern cybersecurity concepts, tools, and methodologies through structured programs.",                                                   duration: "3-5 Days" },
    { id: "5", icon: "Zap",          title: "Bootcamps & Hackathons",    description: "Conduct intensive cybersecurity bootcamps and hackathons that build practical skills and foster competitive spirit.",                                                     duration: "3-7 Days" },
    { id: "6", icon: "Link2",        title: "Industry Connect",          description: "Bridge the gap between academic learning and industry requirements with guest lectures, industry visits, and networking events.",                                          duration: "Ongoing" },
    { id: "7", icon: "Heart",        title: "Placement Support",         description: "Comprehensive placement assistance including resume building, mock interviews, and direct referrals to hiring partners.",                                                  duration: "Semester-based" },
    { id: "8", icon: "BookMarked",   title: "Curriculum Support",        description: "Advisory support to integrate cybersecurity content into your curriculum aligned with industry standards and certifications.",                                             duration: "Semester-based" },
  ],
  models: [
    { id: "1", title: "Cybersecurity Workshop", duration: "1 Day",    participants: "30-200",     cost: "Free / Nominal" },
    { id: "2", title: "3-Day Bootcamp",          duration: "3 Days",   participants: "30-100",     cost: "Subsidized" },
    { id: "3", title: "7-Day Bootcamp",          duration: "7 Days",   participants: "20-60",      cost: "Paid" },
    { id: "4", title: "Faculty Development",     duration: "3-5 Days", participants: "10-30",      cost: "Institution Rate" },
    { id: "5", title: "Semester Club Program",   duration: "Ongoing",  participants: "Unlimited",  cost: "Custom" },
    { id: "6", title: "Guest Lecture",           duration: "2-3 Hours",participants: "50-500",     cost: "Free" },
  ],
  cta: {
    headline: "Ready to Partner With Us?",
    description: "Fill out this form and our team will reach out within 24 hours.",
  },
  updatedAt: "",
};

export default function InstitutionsPage() {
  const cms = getInstitutionsPageContent() ?? DEFAULTS;
  const settings = getSiteSettings();
  const phone = settings?.phone ?? "+91 8240 006 007";
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#080b10] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Institutions</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">{cms.hero.badge}</span>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                {cms.hero.headline} <span className="text-red-500">{cms.hero.headlineAccent}</span> To Build Cybersecurity Excellence
              </h1>
              <p className="text-gray-400 mb-8 leading-relaxed">{cms.hero.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={cms.hero.primaryCta.href} className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
                  {cms.hero.primaryCta.text} <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={telHref} className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors">
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {cms.hero.stats.map((stat) => (
                <div key={stat.label} className="bg-[#0d1117] border border-gray-800 rounded-xl p-5 text-center">
                  <p className="text-3xl font-black text-red-500 mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">What We Offer</span>
            <h2 className="text-3xl font-black text-gray-900">
              Collaboration <span className="text-red-600">Services</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cms.services.map((svc) => {
              const Icon = ICON_MAP[svc.icon] ?? Star;
              return (
                <div key={svc.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-red-200 hover:shadow-md transition-all duration-300 group flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{svc.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1">{svc.description}</p>
                  <span className="text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full self-start">{svc.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collaboration Models */}
      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="text-center mb-12">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">Collaboration Models</span>
            <h2 className="text-3xl font-black text-gray-900">
              Choose The Right <span className="text-red-600">Engagement Model</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#080b10] text-gray-300">
                  <th className="px-5 py-4 text-left font-semibold">Program</th>
                  <th className="px-5 py-4 text-left font-semibold">Duration</th>
                  <th className="px-5 py-4 text-left font-semibold">Participants</th>
                  <th className="px-5 py-4 text-left font-semibold">Cost</th>
                  <th className="px-5 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {cms.models.map((row, i) => (
                  <tr key={row.id} className={`border-t border-gray-100 hover:bg-red-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-5 py-4 font-semibold text-gray-900">{row.title}</td>
                    <td className="px-5 py-4 text-gray-600">{row.duration}</td>
                    <td className="px-5 py-4 text-gray-600">{row.participants}</td>
                    <td className="px-5 py-4 text-gray-600">{row.cost}</td>
                    <td className="px-5 py-4">
                      <Link href="#partner-form" className="text-red-600 font-semibold text-xs border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                        Enquire
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Partner form */}
      <section id="partner-form" className="py-20 bg-[#080b10]">
        <div className="site-container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">{cms.cta.headline}</h2>
            <p className="text-gray-400">{cms.cta.description}</p>
          </div>
          <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5 sm:p-8">
            <PartnerForm />
          </div>
        </div>
      </section>
    </div>
  );
}
