import bcrypt from "bcryptjs";
import crypto from "crypto";
import { usersDb, settingsDb, themeDb, navDb, homeDb, programmesDb, blogDb, eventsDb, testimonialsDb, trainersDb, companyExists } from "./db";

export async function seedCompany(slug: string): Promise<{ email: string }> {
  if (companyExists(slug)) return { email: "" };

  // Generate a cryptographically random password — NEVER hardcoded
  const tempPassword = [
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(4).toString("hex"),
  ].join("-");

  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const defaultEmail = `admin@${slug}.local`;

  usersDb.create(slug, {
    companySlug: slug,
    name: "Administrator",
    email: defaultEmail,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  // Log once to server console — check Vercel logs or local terminal for credentials
  console.log(
    `[SETUP] Company "${slug}" initialized.\n` +
    `  Email: ${defaultEmail}\n` +
    `  Password: ${tempPassword}\n` +
    `  !! Change this password immediately after first login !!`
  );

  // Initialize all defaults
  settingsDb.save(slug, {});
  themeDb.save(slug, {});
  navDb.save(slug, {});
  homeDb.save(slug, {});

  // Seed programmes from existing static data
  seedProgrammes(slug);
  seedBlogPosts(slug);
  seedEvents(slug);
  seedTestimonials(slug);
  seedTrainers(slug);

  return { email: defaultEmail };
}

function seedProgrammes(slug: string) {
  const programmes = [
    {
      slug: "cceh-certified-ethical-hacker",
      shortTitle: "CCEH",
      title: "CCEH — Cyber A1 Certified Ethical Hacker",
      badge: "Beginner-Friendly Career Track",
      category: "career-track" as const,
      level: "Beginner" as const,
      duration: "3 Months",
      mode: "Online / Offline",
      labsType: "Hands-On Practical",
      description: "A practical cybersecurity foundation program designed to help students and beginners build real-world skills in networking, ethical hacking, reconnaissance, vulnerability assessment, Linux, wireless security, and modern cyber threats.",
      overview: "CCEH is a 3-month foundation program that covers everything a beginner needs to start a career in cybersecurity. From networking basics to ethical hacking, scanning, enumeration, system hacking, malware, social engineering, and AI-based threats.",
      image: "/images/courses/cceh.jpg",
      heroImage: "/images/courses/cceh-hero.jpg",
      color: "#e00000",
      isFeatured: true,
      status: "published" as const,
      bestFor: ["Students & Freshers", "IT Beginners", "BCA / B.Tech Students", "Aspiring Ethical Hackers", "Career Switchers"],
      topics: ["Ethical Hacking", "Network Security", "System Hacking", "Linux", "Reconnaissance", "Malware Analysis"],
      modules: [
        { id: "m1", number: "01", title: "Networking Basics", description: "OSI, TCP/IP, DNS, DHCP, Subnetting, Wireless Basics, Protocols & more." },
        { id: "m2", number: "02", title: "Linux & Lab Setup", description: "Linux basics, commands, Kali Linux setup and practical lab environment." },
        { id: "m3", number: "03", title: "Ethical Hacking Fundamentals", description: "Hacking phases, attack vectors, tools and legal awareness." },
        { id: "m4", number: "04", title: "Reconnaissance", description: "WHOIS, Shodan, Maltego, Nmap, Passive & Active Recon techniques." },
        { id: "m5", number: "05", title: "Scanning & Vulnerability Assessment", description: "Nmap scanning, Nessus, OpenVAS, Banner Grabbing, Network Mapping." },
        { id: "m6", number: "06", title: "System Hacking Basics", description: "Gaining access, password cracking, privilege escalation, Metasploit basics." },
        { id: "m7", number: "07", title: "Malware & Threats", description: "Types of malware, ransomware, trojans, vishing, smishing, malware analysis concepts." },
        { id: "m8", number: "08", title: "Social Engineering", description: "Phishing, spear phishing, vishing, smishing, AI-based manipulation awareness." },
        { id: "m9", number: "09", title: "Wireless Security", description: "Wireless encryption, threats, attack methodologies and countermeasures." },
        { id: "m10", number: "10", title: "Cryptography Fundamentals", description: "Encryption basics, PKI, crypto attacks, disk & email encryption." },
      ],
      tools: ["Kali Linux", "Nmap", "Nessus", "OpenVAS", "Wireshark", "Metasploit", "Hashcat", "Shodan", "Burp Suite"],
      labs: ["Practical Network Setup", "Kali Linux Environment", "Reconnaissance Activities", "Vulnerability Scanning", "Wireshark Packet Analysis", "Controlled Phishing Simulation", "Metasploit Exploitation Basics"],
      certificationTitle: "Cyber A1 Certified Ethical Hacker (CCEH)",
      careerPaths: [
        { id: "cp1", title: "SOC Analyst (Beginner)", description: "Start your journey in Security Operations Center." },
        { id: "cp2", title: "Security Trainee", description: "Work with security teams and monitoring tools." },
        { id: "cp3", title: "VAPT Intern", description: "Learn vulnerability assessment & penetration testing." },
        { id: "cp4", title: "IT Security Support", description: "Grow in IT security operations and infrastructure." },
      ],
      faqs: [
        { id: "fq1", question: "Is CCEH suitable for beginners?", answer: "Yes, CCEH is designed from the ground up for students and freshers with no prior cybersecurity knowledge.", order: 0, isActive: true },
        { id: "fq2", question: "Do I need any coding knowledge?", answer: "No coding knowledge is required. The course focuses on practical tools and concepts.", order: 1, isActive: true },
        { id: "fq3", question: "Will I get access to practical labs?", answer: "Yes, you will get access to our dedicated lab environment throughout the program.", order: 2, isActive: true },
      ],
      order: 0,
    },
    {
      slug: "ccse-certified-cyber-security-expert",
      shortTitle: "CCSE",
      title: "CCSE — Cyber A1 Certified Cyber Security Expert",
      badge: "Comprehensive Cybersecurity Expert Program",
      category: "career-track" as const,
      level: "Beginner to Advanced" as const,
      duration: "12 Months",
      mode: "Online / Offline",
      labsType: "Hands-On Practical",
      description: "A comprehensive 12-month advanced cybersecurity expert program covering VAPT, security operations, incident response, and enterprise-grade security workflows.",
      overview: "CCSE is our flagship 12-month comprehensive program that transforms beginners into cybersecurity experts.",
      image: "/images/courses/ccse.jpg",
      heroImage: "/images/courses/ccse-hero.jpg",
      color: "#8b0000",
      isFeatured: true,
      status: "published" as const,
      bestFor: ["Serious Cybersecurity Career Seekers", "IT Professionals", "CCEH Graduates"],
      topics: ["VAPT", "Security Operations", "Incident Response", "Cloud Security", "Advanced Exploitation"],
      modules: [
        { id: "m1", number: "01", title: "Cybersecurity Foundations", description: "Complete networking, Linux, and security fundamentals." },
        { id: "m2", number: "02", title: "Ethical Hacking & VAPT", description: "Comprehensive VAPT methodology and real-world assessments." },
        { id: "m3", number: "03", title: "Web Application Security", description: "OWASP Top 10, web hacking, and secure coding." },
        { id: "m4", number: "04", title: "Cloud Security", description: "AWS, Azure security, cloud misconfigurations, and cloud VAPT." },
        { id: "m5", number: "05", title: "SOC Operations", description: "SIEM tools, log analysis, threat detection, and incident response." },
      ],
      tools: ["Kali Linux", "Burp Suite", "Metasploit", "Splunk", "Nessus", "OWASP ZAP", "Nmap"],
      labs: ["Full VAPT Lab Simulations", "SOC Blue Team Operations", "Cloud Security Labs", "Incident Response Drills"],
      certificationTitle: "Cyber A1 Certified Cyber Security Expert (CCSE)",
      careerPaths: [
        { id: "cp1", title: "Penetration Tester", description: "Conduct professional security assessments." },
        { id: "cp2", title: "SOC Analyst", description: "Work in enterprise security operations centers." },
        { id: "cp3", title: "Security Consultant", description: "Provide expert cybersecurity advisory services." },
      ],
      faqs: [
        { id: "fq1", question: "What is the difference between CCEH and CCSE?", answer: "CCEH is a 3-month foundation program while CCSE is a 12-month comprehensive expert-level program.", order: 0, isActive: true },
      ],
      order: 1,
    },
    {
      slug: "soc-analyst-program",
      shortTitle: "SOC Analyst",
      title: "SOC Analyst Program",
      badge: "Blue Team Career Track",
      category: "career-track" as const,
      level: "Intermediate" as const,
      duration: "3–6 Months",
      mode: "Online / Offline",
      labsType: "Hands-On SIEM Labs",
      description: "Master SOC operations, SIEM tools, threat detection, and incident response with real enterprise-grade simulations.",
      overview: "The SOC Analyst Program prepares you for a career in Security Operations Centers.",
      image: "/images/courses/soc.jpg",
      heroImage: "/images/courses/soc-hero.jpg",
      color: "#1a56db",
      isFeatured: true,
      status: "published" as const,
      bestFor: ["IT Professionals", "Network Engineers", "CCEH Graduates", "Blue Team Aspirants"],
      topics: ["SOC Fundamentals", "SIEM Tools", "Threat Detection", "Incident Response", "Log Analysis"],
      modules: [
        { id: "m1", number: "01", title: "SOC Fundamentals", description: "SOC architecture, roles, tiers, and workflows." },
        { id: "m2", number: "02", title: "SIEM Tools", description: "Splunk, Microsoft Sentinel, QRadar hands-on." },
        { id: "m3", number: "03", title: "Log Analysis", description: "Windows, Linux, firewall, and web server logs." },
        { id: "m4", number: "04", title: "Incident Response", description: "IR lifecycle, playbooks, and escalation procedures." },
      ],
      tools: ["Splunk", "Microsoft Sentinel", "QRadar", "Wazuh", "TheHive"],
      labs: ["SIEM Configuration Labs", "Incident Response Simulations", "Threat Hunting Exercises"],
      certificationTitle: "Cyber A1 Certified SOC Analyst",
      careerPaths: [
        { id: "cp1", title: "SOC Analyst L1/L2", description: "Work in enterprise security operations." },
        { id: "cp2", title: "Threat Intelligence Analyst", description: "Analyze and respond to cyber threats." },
      ],
      faqs: [
        { id: "fq1", question: "Do I need prior security experience?", answer: "Basic networking knowledge is helpful. The program starts from SOC fundamentals.", order: 0, isActive: true },
      ],
      order: 2,
    },
  ];

  programmes.forEach((p) => programmesDb.create(slug, p));
}

function seedBlogPosts(slug: string) {
  const posts = [
    {
      slug: "how-ai-is-transforming-cybersecurity",
      title: "How AI is Transforming Cybersecurity",
      excerpt: "Artificial intelligence is reshaping the cybersecurity landscape — from AI-powered threat detection to adversarial machine learning attacks.",
      content: "<p>The cybersecurity landscape is constantly evolving...</p>",
      category: "AI Security",
      tags: ["AI", "Machine Learning", "Threat Detection"],
      author: { name: "Arjun Mehta", role: "Senior Security Researcher", imageUrl: "" },
      publishedAt: "2025-05-18",
      readTime: "6 min read",
      image: "/images/blog/blog-ai.jpg",
      isFeatured: true,
      status: "published" as const,
      seo: { metaTitle: "How AI is Transforming Cybersecurity", metaDescription: "A deep dive into AI-powered cybersecurity threats and defenses." },
    },
    {
      slug: "vapt-vs-pen-testing-key-differences",
      title: "VAPT vs Pen Testing: Key Differences",
      excerpt: "Many professionals confuse VAPT with penetration testing. This article breaks down the key differences.",
      content: "<p>VAPT and penetration testing are often used interchangeably...</p>",
      category: "VAPT",
      tags: ["VAPT", "Penetration Testing", "Security Assessment"],
      author: { name: "Priya Nair", role: "Penetration Testing Lead", imageUrl: "" },
      publishedAt: "2025-05-12",
      readTime: "5 min read",
      image: "/images/blog/blog-vapt.jpg",
      isFeatured: true,
      status: "published" as const,
      seo: { metaTitle: "VAPT vs Pen Testing", metaDescription: "Understanding the key differences between VAPT and penetration testing." },
    },
    {
      slug: "soc-analyst-career-roadmap-2025",
      title: "SOC Analyst Career Roadmap 2025",
      excerpt: "Complete guide to becoming a SOC Analyst in 2025 — skills, certifications, tools, and the career path.",
      content: "<p>The SOC Analyst role is one of the most in-demand positions in cybersecurity...</p>",
      category: "Career",
      tags: ["SOC Analyst", "Career", "Blue Team"],
      author: { name: "Rohan Das", role: "SOC Team Lead", imageUrl: "" },
      publishedAt: "2025-05-08",
      readTime: "8 min read",
      image: "/images/blog/blog-soc.jpg",
      isFeatured: true,
      status: "published" as const,
      seo: { metaTitle: "SOC Analyst Career Roadmap 2025", metaDescription: "Complete guide to building a SOC Analyst career." },
    },
  ];
  posts.forEach((p) => blogDb.create(slug, p));
}

function seedEvents(slug: string) {
  const events = [
    {
      slug: "cybersecurity-workshop-2025",
      title: "Cybersecurity Foundations Workshop",
      type: "workshop" as const,
      date: "2025-06-15",
      time: "10:00 AM – 4:00 PM",
      venue: "Cyber A1 Academy, Durgapur",
      mode: "offline" as const,
      description: "A full-day hands-on workshop covering networking basics, ethical hacking fundamentals, and Kali Linux setup.",
      image: "/images/events/event-workshop.jpg",
      tags: ["Beginner", "Workshop", "Ethical Hacking"],
      registrationLink: "#",
      isFree: true,
      isFeatured: true,
      status: "published" as const,
    },
    {
      slug: "capture-the-flag-2025",
      title: "Capture The Flag (CTF) Competition",
      type: "ctf" as const,
      date: "2025-07-05",
      time: "10:00 AM – 8:00 PM",
      venue: "Online + Durgapur Campus",
      mode: "hybrid" as const,
      description: "Compete in our quarterly CTF competition. Win prizes and get recognized by our hiring partner companies.",
      image: "/images/events/event-ctf.jpg",
      tags: ["CTF", "Competition", "All Levels"],
      registrationLink: "#",
      isFree: true,
      isFeatured: true,
      status: "published" as const,
    },
  ];
  events.forEach((e) => eventsDb.create(slug, e));
}

function seedTestimonials(slug: string) {
  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Security Analyst",
      company: "Deloitte",
      companyLogoUrl: "",
      imageUrl: "",
      quote: "Thanks to Cyber A1 Academy, I started my cybersecurity journey from scratch and now I am working as a Security Analyst.",
      programme: "CCSE",
      rating: 5,
      linkedIn: "#",
      isFeatured: true,
      status: "published" as const,
      order: 0,
    },
    {
      name: "Sneha Kumari",
      role: "Security Engineer",
      company: "TCS",
      companyLogoUrl: "",
      imageUrl: "",
      quote: "The mentors are very supportive and industry experienced. I gained confidence to start my career in cybersecurity.",
      programme: "CCEH",
      rating: 5,
      linkedIn: "#",
      isFeatured: true,
      status: "published" as const,
      order: 1,
    },
    {
      name: "Ankit Verma",
      role: "Security Engineer",
      company: "Infosys",
      companyLogoUrl: "",
      imageUrl: "",
      quote: "Hands-on training and real projects gave me confidence. I got placed at Infosys right after completing the SOC Analyst program.",
      programme: "SOC Analyst",
      rating: 5,
      linkedIn: "#",
      isFeatured: true,
      status: "published" as const,
      order: 2,
    },
  ];
  testimonials.forEach((t) => testimonialsDb.create(slug, t));
}

function seedTrainers(slug: string) {
  const trainers = [
    {
      slug: "rahul-sharma",
      name: "Rahul Sharma",
      designation: "Senior Penetration Tester & Lead Trainer",
      specialization: "VAPT & Red Teaming",
      bio: "Rahul is a seasoned cybersecurity professional with 8+ years of experience in offensive security, VAPT, and red teaming engagements. He has worked with enterprise clients across BFSI, IT, and government sectors, helping them identify and remediate critical security vulnerabilities. At Cyber A1 Academy, he leads the CCSE and VAPT programmes with a practical, lab-focused approach.",
      experience: "8+ Years",
      certifications: ["OSCP", "CEH", "CRTP"],
      imageUrl: "",
      linkedIn: "#",
      github: "#",
      courses: ["cceh-certified-ethical-hacker", "ccse-certified-cyber-security-expert"],
      isFeatured: true,
      status: "published" as const,
      order: 0,
    },
    {
      slug: "priya-singh",
      name: "Priya Singh",
      designation: "SOC Team Lead & Security Trainer",
      specialization: "SOC Operations & SIEM",
      bio: "Priya brings 6+ years of blue team experience to the classroom, having led SOC operations for financial and healthcare organizations. Her expertise in SIEM tools, threat detection, and incident response gives students a real-world perspective on defensive security. She heads the SOC Analyst Programme at Cyber A1 Academy.",
      experience: "6+ Years",
      certifications: ["GCIH", "CySA+", "Security+"],
      imageUrl: "",
      linkedIn: "#",
      courses: ["soc-analyst-program"],
      isFeatured: true,
      status: "published" as const,
      order: 1,
    },
    {
      slug: "arijit-das",
      name: "Arijit Das",
      designation: "Cloud Security Architect & Trainer",
      specialization: "AWS & Azure Security",
      bio: "Arijit is a cloud security architect with 7+ years of experience securing cloud infrastructure across AWS and Azure environments. He specializes in cloud misconfiguration assessments, IAM security, and cloud-native threat modeling. He trains students on real-world cloud VAPT methodologies and DevSecOps practices.",
      experience: "7+ Years",
      certifications: ["AWS Security Specialty", "CCSP", "AZ-500"],
      imageUrl: "",
      linkedIn: "#",
      courses: ["ccse-certified-cyber-security-expert"],
      isFeatured: true,
      status: "published" as const,
      order: 2,
    },
    {
      slug: "neha-roy",
      name: "Neha Roy",
      designation: "Application Security Engineer & Trainer",
      specialization: "Web Application Security & Bug Bounty",
      bio: "Neha is an application security engineer with 5+ years of experience in web and mobile security assessments, code reviews, and bug bounty programs. Her hands-on approach to OWASP Top 10, API security, and secure coding practices has helped hundreds of students break into the AppSec domain.",
      experience: "5+ Years",
      certifications: ["OSWE", "CEH", "BSCP"],
      imageUrl: "",
      linkedIn: "#",
      github: "#",
      courses: ["ccse-certified-cyber-security-expert"],
      isFeatured: true,
      status: "published" as const,
      order: 3,
    },
  ];
  trainers.forEach((t) => trainersDb.create(slug, t));
}
