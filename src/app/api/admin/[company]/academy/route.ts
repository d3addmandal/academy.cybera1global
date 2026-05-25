import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { academyPageDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const data = academyPageDb.get(company) ?? defaultAcademy();
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json();
  const data = academyPageDb.save(company, body);
  return NextResponse.json({ success: true, data });
}

function defaultAcademy() {
  return {
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
    updatedAt: new Date().toISOString(),
  };
}
