import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { careerPageDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const data = careerPageDb.get(company) ?? defaultCareer();
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json();
  const data = careerPageDb.save(company, body);
  return NextResponse.json({ success: true, data });
}

function defaultCareer() {
  return {
    hero: {
      headline: "Build Your Cybersecurity Career With",
      headlineAccent: "100% Practical Support",
      description: "From your first day to your first job — we provide comprehensive career support including resume building, mock interviews, portfolio development, and direct placement assistance.",
      stats: [
        { value: "100%", label: "Placement Support" },
        { value: "500+", label: "Students Placed" },
        { value: "50+", label: "Hiring Partners" },
        { value: "95%", label: "Satisfaction Rate" },
      ],
    },
    services: [
      { id: "cs1", icon: "FileText", title: "Resume & LinkedIn Optimization", description: "Our career team helps you build an ATS-friendly resume and a strong LinkedIn profile that attracts recruiters." },
      { id: "cs2", icon: "MessageSquare", title: "Interview Preparation", description: "Technical and HR mock interviews with real feedback from industry professionals." },
      { id: "cs3", icon: "Briefcase", title: "Portfolio Development", description: "Guidance on building a strong security portfolio with real projects, CTF writeups, and assessment reports." },
      { id: "cs4", icon: "TrendingUp", title: "Job & Internship Opportunities", description: "Direct referrals to our network of hiring partners and job opportunities shared with placed students." },
      { id: "cs5", icon: "Target", title: "Career Roadmap Guidance", description: "Personalized career roadmap sessions based on your current skills and target roles." },
      { id: "cs6", icon: "Users", title: "Alumni Network Access", description: "Connect with our alumni who are placed in top organizations for guidance and mentorship." },
    ],
    journey: [
      { id: "j1", step: "01", icon: "BookOpen", title: "Join Program", description: "Enroll in any of our cybersecurity programs." },
      { id: "j2", step: "02", icon: "FlaskConical", title: "Learn & Practice", description: "Build skills through labs and real projects." },
      { id: "j3", step: "03", icon: "Briefcase", title: "Work on Projects", description: "Apply skills on real security assessments." },
      { id: "j4", step: "04", icon: "BarChart3", title: "Get Assessed", description: "Evaluated on practical skills and knowledge." },
      { id: "j5", step: "05", icon: "Target", title: "Career Guidance", description: "Resume, LinkedIn, and interview preparation." },
      { id: "j6", step: "06", icon: "Zap", title: "Placement Preparation", description: "Company connect, referrals, and job applications." },
      { id: "j7", step: "07", icon: "CheckCircle2", title: "Grow in Your Career", description: "Ongoing support and alumni network access." },
    ],
    roles: [
      "Penetration Tester", "SOC Analyst (L1/L2/L3)", "Security Engineer", "Cloud Security Engineer",
      "VAPT Analyst", "Application Security Engineer", "Threat Intelligence Analyst", "Incident Responder",
      "Security Consultant", "Red Team Operator", "Bug Bounty Hunter", "GRC Analyst",
      "DevSecOps Engineer", "Security Architect",
    ],
    cta: {
      headline: "Ready to Start Your Cybersecurity Journey?",
      primaryCta: { text: "Explore Programs", href: "/courses" },
      secondaryCta: { text: "Book Free Counseling", href: "/contact" },
    },
    updatedAt: new Date().toISOString(),
  };
}
