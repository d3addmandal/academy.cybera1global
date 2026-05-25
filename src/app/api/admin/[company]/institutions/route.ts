import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { institutionsPageDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const data = institutionsPageDb.get(company) ?? defaultInstitutions();
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json();
  const data = institutionsPageDb.save(company, body);
  return NextResponse.json({ success: true, data });
}

function defaultInstitutions() {
  return {
    hero: {
      badge: "Institutional Collaboration",
      headline: "Partner With",
      headlineAccent: "Cyber A1 Academy",
      description: "Build the next generation of cybersecurity professionals. Partner with us for training, workshops, internships & placement support.",
      primaryCta: { text: "Partner With Us", href: "#partner-form" },
      stats: [
        { value: "25+", label: "Partner Institutions" },
        { value: "500+", label: "Students Placed" },
        { value: "100+", label: "Workshops Conducted" },
        { value: "50+", label: "Faculty Trained" },
      ],
    },
    services: [
      { id: "s1", icon: "BookOpen", title: "Workshops & Seminars", description: "One-day and multi-day cybersecurity workshops tailored for your students.", duration: "1-3 Days" },
      { id: "s2", icon: "Users", title: "Cybersecurity Clubs", description: "Help establish and mentor a cybersecurity club at your institution with ongoing activities.", duration: "Ongoing" },
      { id: "s3", icon: "Briefcase", title: "Internship Collaboration", description: "Provide real industry internships to your students at Cyber A1 Global Solutions LLP.", duration: "1-3 Months" },
      { id: "s4", icon: "GraduationCap", title: "Faculty Development Program", description: "Upskill your faculty members in modern cybersecurity concepts, tools, and methodologies.", duration: "3-5 Days" },
      { id: "s5", icon: "Zap", title: "Bootcamps & Hackathons", description: "Conduct intensive cybersecurity bootcamps and hackathons that build practical skills.", duration: "3-7 Days" },
      { id: "s6", icon: "Link2", title: "Industry Connect", description: "Bridge the gap between academic learning and industry requirements with guest lectures.", duration: "Ongoing" },
      { id: "s7", icon: "Heart", title: "Placement Support", description: "Comprehensive placement assistance including resume building, mock interviews, and referrals.", duration: "Semester-based" },
      { id: "s8", icon: "BookMarked", title: "Curriculum Support", description: "Advisory support to integrate cybersecurity content into your curriculum.", duration: "Semester-based" },
    ],
    models: [
      { id: "m1", title: "Cybersecurity Workshop", duration: "1 Day", participants: "30-200", cost: "Free / Nominal" },
      { id: "m2", title: "3-Day Bootcamp", duration: "3 Days", participants: "30-100", cost: "Subsidized" },
      { id: "m3", title: "7-Day Bootcamp", duration: "7 Days", participants: "20-60", cost: "Paid" },
      { id: "m4", title: "Faculty Development", duration: "3-5 Days", participants: "10-30", cost: "Institution Rate" },
      { id: "m5", title: "Semester Club Program", duration: "Ongoing", participants: "Unlimited", cost: "Custom" },
      { id: "m6", title: "Guest Lecture", duration: "2-3 Hours", participants: "50-500", cost: "Free" },
    ],
    cta: {
      headline: "Ready to Partner With Us?",
      description: "Fill out this form and our team will reach out within 24 hours.",
    },
    updatedAt: new Date().toISOString(),
  };
}
