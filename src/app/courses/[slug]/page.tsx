export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock, Monitor, BarChart3, FlaskConical, CheckCircle2, ArrowRight,
  Phone, User, Award, Cpu, ChevronRight, BookOpen, Calendar,
  Target, Wrench, Briefcase,
} from "lucide-react";
import { getCRMProgrammeBySlug, getCRMProgrammes } from "@/lib/content";
import FAQClient from "./FAQClient";
import ContactForm from "./ContactForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const programme = getCRMProgrammeBySlug(slug);
  if (!programme) return { title: "Course Not Found" };
  return {
    title: programme.title,
    description: programme.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const programme = getCRMProgrammeBySlug(slug);
  if (!programme) notFound();

  const stats = [
    { icon: Clock,      label: "Duration", value: programme.duration },
    { icon: Monitor,    label: "Mode",     value: programme.mode },
    { icon: BarChart3,  label: "Level",    value: programme.level },
    { icon: FlaskConical, label: "Labs",   value: programme.labsType },
  ];

  return (
    <div className="pt-24">
      {/* ── Hero ── */}
      <section className="relative bg-[#080b10] min-h-[calc(100vh-6rem)] flex items-center overflow-hidden">

        {/* Background image */}
        {programme.heroImage && (
          <img
            src={programme.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b10] via-[#080b10]/88 to-[#080b10]/55" />
        <div className="absolute inset-0 bg-[#080b10]/30" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080b10] to-transparent" />

        <div className="relative z-10 w-full site-container py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/courses" className="hover:text-gray-300 transition-colors">Courses</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">{programme.shortTitle} — {programme.title.split("—")[1]?.trim() || programme.shortTitle}</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
            {/* Left */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 text-red-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {programme.badge}
              </div>

              {/* Title */}
              <h1 className="font-black text-white leading-[1.05] mb-5">
                <span className="block text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-red-500 mb-1">
                  {programme.shortTitle}
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                  {programme.title.split("—")[1]?.trim() || programme.title}
                </span>
              </h1>

              {/* Description */}
              <p className="text-gray-400 text-[15px] lg:text-base leading-relaxed mb-8 max-w-[560px]">
                {programme.description}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-red-500 hover:shadow-[0_8px_25px_rgba(224,0,0,0.4)] transition-all"
                >
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-gray-600 text-gray-200 font-semibold px-6 py-3.5 rounded-xl hover:border-gray-400 hover:text-white transition-all"
                >
                  <Phone className="w-4 h-4" /> Get Syllabus
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-gray-600 text-gray-200 font-semibold px-6 py-3.5 rounded-xl hover:border-gray-400 hover:text-white transition-all"
                >
                  <Calendar className="w-4 h-4" /> Book Free Counseling
                </Link>
              </div>

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-0">
                {stats.map(({ icon: Icon, label, value }, i) => (
                  <div key={label} className="flex items-center">
                    <div className="flex items-center gap-2.5 pr-6">
                      <Icon className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
                        <p className="text-white font-bold text-sm leading-none">{value}</p>
                      </div>
                    </div>
                    {i < stats.length - 1 && (
                      <div className="w-px h-8 bg-gray-700 mr-6 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — contact form */}
            <ContactForm courseName={programme.shortTitle} />
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-gray-900 mb-3">Course Overview</h2>
              <p className="text-gray-500 leading-relaxed mb-8">{programme.overview}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  { Icon: Target,     title: "Beginner Friendly", desc: "No prior knowledge required" },
                  { Icon: FlaskConical, title: "Hands-On Labs",   desc: "Practical exercises & real environments" },
                  { Icon: Wrench,     title: "Industry Tools",    desc: "Work with popular cybersecurity tools" },
                  { Icon: Briefcase,  title: "Career Focused",    desc: "Build skills for real job opportunities" },
                ] as const).map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{title}</p>
                      <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 mb-5">Who Should Join?</h3>
              <ul className="space-y-3">
                {programme.bestFor.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="w-7 h-7 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      {programme.modules.length > 0 && (
        <section className="py-16 bg-[#f5f5f5]">
          <div className="site-container">
            <div className="text-center mb-10">
              <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">What You Will Learn</span>
              <h2 className="text-2xl font-black text-gray-900">Course Modules &amp; Syllabus</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programme.modules.map((mod) => (
                <div key={mod.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-red-200 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-black text-lg leading-none flex-shrink-0">{mod.number}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{mod.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{mod.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tools & Labs */}
      <section className="py-16 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-3 gap-10">
            {programme.labs.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-5"><span className="text-red-600">Hands-On Labs</span> You Will Experience</h3>
                <ul className="space-y-2">
                  {programme.labs.map((lab) => (
                    <li key={lab} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" /> {lab}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {programme.tools.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-5"><span className="text-red-600">Tools</span> You Will Master</h3>
                <div className="flex flex-wrap gap-2">
                  {programme.tools.map((tool) => (
                    <span key={tool} className="bg-[#080b10] border border-gray-700 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg">{tool}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-gray-900 mb-5">Certification &amp; <span className="text-red-600">Benefits</span></h3>
              <div className="bg-[#080b10] border border-gray-800 rounded-xl p-5">
                <Award className="w-8 h-8 text-red-500 mb-3" />
                <p className="text-white font-bold text-sm mb-3">{programme.certificationTitle}</p>
                {["Industry-oriented practical training", "Hands-on labs & real-world simulations", "Guided learning by industry experts", "Career guidance & roadmap support", "Eligibility for advanced programs"].map((pt) => (
                  <div key={pt} className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    <CheckCircle2 className="w-3 h-3 text-red-500 flex-shrink-0" /> {pt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      {programme.careerPaths.length > 0 && (
        <section className="py-16 bg-[#f5f5f5]">
          <div className="site-container">
            <h2 className="text-2xl font-black text-gray-900 mb-10">Where This Course <span className="text-red-600">Takes You</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {programme.careerPaths.map((path) => (
                <div key={path.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-red-200 hover:shadow-sm transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                    <Cpu className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{path.title}</h3>
                  <p className="text-gray-500 text-xs">{path.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ + Sample Certificate */}
      {(programme.faqs.length > 0 || programme.sampleCertificate) && (
        <FAQClient
          faqs={programme.faqs}
          sampleCertificate={programme.sampleCertificate}
        />
      )}

      {/* Bottom CTA */}
      <section className="py-16 bg-[#080b10]">
        <div className="site-container text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Start Your Cybersecurity Journey With <span className="text-red-500">Practical Industry-Focused Learning</span>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-500 transition-colors">
              Enroll Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-8 py-3.5 rounded-xl hover:border-gray-600 transition-colors">
              Talk To Counselor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
