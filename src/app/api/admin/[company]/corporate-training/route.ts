import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { corporatePageDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const data = corporatePageDb.get(company) ?? defaultCorporate();
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json();
  const data = corporatePageDb.save(company, body);
  return NextResponse.json({ success: true, data });
}

function defaultCorporate() {
  return {
    hero: {
      badge: "Corporate Training Solutions",
      headline: "Empower Your Team With",
      headlineAccent: "Cybersecurity Skills",
      description: "We design role-based and industry-specific cybersecurity training programs to meet your organization's security goals. From security awareness to advanced VAPT workshops.",
      primaryCta: { text: "Request Corporate Proposal", href: "/contact" },
    },
    programs: [
      { id: "p1", icon: "Eye", title: "Security Awareness Training", description: "Educate your employees about cybersecurity best practices, threat awareness, and safe digital behavior.", duration: "1 Day", mode: "Online / Offline", audience: "All Employees" },
      { id: "p2", icon: "Target", title: "Phishing Simulation", description: "Real-world phishing simulations to test and improve your team's phishing awareness and response.", duration: "Ongoing", mode: "Online", audience: "All Employees" },
      { id: "p3", icon: "Code", title: "Secure Coding Training", description: "Train your development team on secure coding practices, OWASP guidelines, and code review techniques.", duration: "2-3 Days", mode: "Offline", audience: "Developers" },
      { id: "p4", icon: "Cloud", title: "Cloud Security Workshops", description: "Hands-on workshops covering AWS and Azure security configurations, IAM best practices, and cloud VAPT basics.", duration: "2 Days", mode: "Hybrid", audience: "Cloud/DevOps Teams" },
      { id: "p5", icon: "Shield", title: "SOC Awareness Training", description: "Understand SOC operations, SIEM tools, incident response workflows, and threat detection for your IT teams.", duration: "1 Day", mode: "Online / Offline", audience: "IT/Security Teams" },
      { id: "p6", icon: "CheckCircle2", title: "Compliance Awareness Training", description: "ISO 27001, GDPR, PCI DSS compliance training tailored for your organizational roles and responsibilities.", duration: "1 Day", mode: "Online / Offline", audience: "Management & IT" },
      { id: "p7", icon: "Zap", title: "Red Team Awareness Session", description: "Understand red team methodologies, attack simulations, and how attackers think — from a defensive perspective.", duration: "Half Day", mode: "Online", audience: "Security Teams" },
      { id: "p8", icon: "Users", title: "Custom Enterprise Training", description: "Fully customized training programs designed around your organization's specific industry, tools, and threat landscape.", duration: "Custom", mode: "Online / Offline", audience: "Organization-wide" },
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
      { id: "i1", icon: "Building2", name: "IT Services Companies" },
      { id: "i2", icon: "Shield", name: "Banking & Finance" },
      { id: "i3", icon: "Users", name: "Healthcare Organizations" },
      { id: "i4", icon: "Award", name: "Government Enterprises" },
      { id: "i5", icon: "BookOpen", name: "Educational Institutions" },
      { id: "i6", icon: "BarChart3", name: "E-commerce Platforms" },
    ],
    process: [
      { step: "01", title: "Requirement Analysis", description: "We analyze your organization's specific needs, industry, and security gaps." },
      { step: "02", title: "Program Design", description: "Custom curriculum designed for your team's roles and responsibilities." },
      { step: "03", title: "Trainer Assignment", description: "Expert trainers matched to your domain and technical requirements." },
      { step: "04", title: "Training Delivery", description: "Flexible delivery via online, offline, or hybrid modes." },
      { step: "05", title: "Assessment", description: "Post-training assessments to measure knowledge and identify gaps." },
      { step: "06", title: "Certification & Report", description: "Participation certificates and detailed training report provided." },
    ],
    cta: { headline: "Request a Corporate Proposal", primaryCta: { text: "Request Corporate Proposal", href: "/contact" } },
    updatedAt: new Date().toISOString(),
  };
}
