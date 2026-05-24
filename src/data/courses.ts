export interface CourseModule {
  number: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  category: "career-track" | "specialized" | "corporate" | "institutional";
  level: "Beginner" | "Intermediate" | "Advanced" | "Beginner to Advanced";
  duration: string;
  mode: string;
  labsType: string;
  description: string;
  overview: string;
  image: string;
  heroImage: string;
  color: string;
  featured: boolean;
  bestFor: string[];
  topics: string[];
  modules: CourseModule[];
  tools: string[];
  labs: string[];
  certificationTitle: string;
  careerPaths: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const courses: Course[] = [
  {
    id: "cceh",
    slug: "cceh-certified-ethical-hacker",
    title: "CCEH — Cyber A1 Certified Ethical Hacker",
    shortTitle: "CCEH",
    badge: "Beginner-Friendly Career Track",
    category: "career-track",
    level: "Beginner",
    duration: "3 Months",
    mode: "Online / Offline",
    labsType: "Hands-On Practical",
    description: "A practical cybersecurity foundation program designed to help students and beginners build real-world skills in networking, ethical hacking, reconnaissance, vulnerability assessment, Linux, wireless security, and modern cyber threats.",
    overview: "CCEH is a 3-month foundation program that covers everything a beginner needs to start a career in cybersecurity. From networking basics to ethical hacking, scanning, enumeration, system hacking, malware, social engineering, and AI-based threats. You will gain practical skills through hands-on labs and real-world simulations.",
    image: "/images/courses/cceh.jpg",
    heroImage: "/images/courses/cceh-hero.jpg",
    color: "#e00000",
    featured: true,
    bestFor: ["Students & Freshers", "IT Beginners", "BCA / B.Tech Students", "Aspiring Ethical Hackers", "Career Switchers", "Security Enthusiasts", "Future SOC Analysts"],
    topics: ["Ethical Hacking", "Network Security", "System Hacking", "Linux", "Reconnaissance", "Malware Analysis"],
    modules: [
      { number: "01", title: "Networking Basics", description: "OSI, TCP/IP, DNS, DHCP, Subnetting, Wireless Basics, Protocols & more." },
      { number: "02", title: "Linux & Lab Setup", description: "Linux basics, commands, Kali Linux setup and practical lab environment." },
      { number: "03", title: "Ethical Hacking Fundamentals", description: "Hacking phases, attack vectors, tools and legal awareness." },
      { number: "04", title: "Reconnaissance", description: "WHOIS, Shodan, Maltego, Nmap, Passive & Active Recon techniques." },
      { number: "05", title: "Scanning & Vulnerability Assessment", description: "Nmap scanning, Nessus, OpenVAS, Banner Grabbing, Network Mapping." },
      { number: "06", title: "Enumeration", description: "SNMP, LDAP, NetBIOS enumeration with tools like SMBWalk, Enum4Linux." },
      { number: "07", title: "System Hacking Basics", description: "Gaining access, password cracking, privilege escalation, Metasploit basics." },
      { number: "08", title: "Malware & Threats", description: "Types of malware, ransomware, trojans, vishing, smishing, malware analysis concepts." },
      { number: "09", title: "Social Engineering", description: "Phishing, spear phishing, vishing, smishing, AI-based manipulation awareness." },
      { number: "10", title: "Sniffing & Spoofing", description: "Packet sniffing, ARP poisoning, MiTM attacks using Wireshark, Ettercap." },
      { number: "11", title: "Denial-of-Service Attacks", description: "DoS & DDoS concepts and controlled attack simulations." },
      { number: "12", title: "Wireless Security", description: "Wireless encryption, threats, attack methodologies and countermeasures." },
      { number: "13", title: "Cryptography Fundamentals", description: "Encryption basics, PKI, crypto attacks, disk & email encryption." },
      { number: "14", title: "Cyber Security with AI", description: "AI in cybersecurity, deepfake awareness, AI phishing, AI-assisted recon & risks." },
    ],
    tools: ["Kali Linux", "Nmap", "Nessus", "OpenVAS", "Wireshark", "Metasploit", "Hashcat", "John The Ripper", "Maltego", "Shodan", "Burp Suite", "Ettercap"],
    labs: ["Practical Network Setup", "Kali Linux Environment", "Reconnaissance Activities", "Vulnerability Scanning", "Wireshark Packet Analysis", "Controlled Phishing Simulation", "Wireless Security Demonstrations", "Metasploit Exploitation Basics"],
    certificationTitle: "Cyber A1 Certified Ethical Hacker (CCEH)",
    careerPaths: [
      { title: "SOC Analyst (Beginner)", description: "Start your journey in Security Operations Center." },
      { title: "Security Trainee", description: "Work with security teams and monitoring tools." },
      { title: "VAPT Intern", description: "Learn vulnerability assessment & penetration testing." },
      { title: "IT Security Support", description: "Grow in IT security operations and infrastructure." },
    ],
    faqs: [
      { question: "Is CCEH suitable for beginners?", answer: "Yes, absolutely. CCEH is designed from the ground up for students and freshers with no prior cybersecurity knowledge." },
      { question: "Do I need any coding knowledge?", answer: "No coding knowledge is required. The course focuses on practical tools and concepts." },
      { question: "Will I get access to practical labs?", answer: "Yes, you will get access to our dedicated lab environment throughout the program." },
      { question: "Is this course online or offline?", answer: "We offer both online and offline modes to suit your schedule." },
      { question: "Will I get recordings of sessions?", answer: "Yes, recordings of all sessions are provided for enrolled students." },
      { question: "What happens after completing CCEH?", answer: "You can enroll in CCSE, join our SOC Analyst track, or directly apply for junior security roles." },
      { question: "Is this course job-oriented?", answer: "Yes. The curriculum is designed with real industry requirements and placement support is provided." },
      { question: "Can working professionals join?", answer: "Yes. We have weekend batches designed for working professionals." },
      { question: "Do you provide placement assistance?", answer: "Yes, we provide resume building, interview preparation, and placement support." },
    ],
  },
  {
    id: "ccse",
    slug: "ccse-certified-cyber-security-expert",
    title: "CCSE — Cyber A1 Certified Cyber Security Expert",
    shortTitle: "CCSE",
    badge: "Comprehensive Cybersecurity Expert Program",
    category: "career-track",
    level: "Beginner to Advanced",
    duration: "12 Months",
    mode: "Online / Offline",
    labsType: "Hands-On Practical",
    description: "A comprehensive 12-month advanced cybersecurity expert program covering VAPT, security operations, incident response, and enterprise-grade security workflows.",
    overview: "CCSE is our flagship 12-month comprehensive program that transforms beginners into cybersecurity experts. It covers everything from foundational concepts to advanced VAPT, cloud security, AI security, and real-world enterprise security operations.",
    image: "/images/courses/ccse.jpg",
    heroImage: "/images/courses/ccse-hero.jpg",
    color: "#8b0000",
    featured: true,
    bestFor: ["Serious Cybersecurity Career Seekers", "IT Professionals", "CCEH Graduates", "Career Changers"],
    topics: ["VAPT", "Security Operations", "Incident Response", "Cloud Security", "Advanced Exploitation", "Report Writing"],
    modules: [
      { number: "01", title: "Cybersecurity Foundations", description: "Complete networking, Linux, and security fundamentals." },
      { number: "02", title: "Ethical Hacking & VAPT", description: "Comprehensive VAPT methodology and real-world assessments." },
      { number: "03", title: "Web Application Security", description: "OWASP Top 10, web hacking, and secure coding." },
      { number: "04", title: "Network Security Advanced", description: "Advanced network attacks, firewall bypass, and defense." },
      { number: "05", title: "Cloud Security", description: "AWS, Azure security, cloud misconfigurations, and cloud VAPT." },
      { number: "06", title: "SOC Operations", description: "SIEM tools, log analysis, threat detection, and incident response." },
      { number: "07", title: "AI in Cybersecurity", description: "AI-driven attacks, deepfakes, and AI-powered defense tools." },
      { number: "08", title: "Red Team Operations", description: "Advanced exploitation, post-exploitation, and red team methodology." },
      { number: "09", title: "Malware Analysis", description: "Static and dynamic analysis, reverse engineering basics." },
      { number: "10", title: "GRC & Compliance", description: "Governance, risk management, and compliance frameworks." },
      { number: "11", title: "Report Writing & Documentation", description: "Professional security assessment reporting standards." },
      { number: "12", title: "Career Preparation", description: "Resume building, mock interviews, and placement support." },
    ],
    tools: ["Kali Linux", "Burp Suite", "Metasploit", "Cobalt Strike", "Splunk", "Nessus", "OWASP ZAP", "Nmap", "Wireshark", "AWS Security Tools"],
    labs: ["Full VAPT Lab Simulations", "SOC Blue Team Operations", "Red Team Exercises", "Cloud Security Labs", "Incident Response Drills", "Malware Analysis Sandbox"],
    certificationTitle: "Cyber A1 Certified Cyber Security Expert (CCSE)",
    careerPaths: [
      { title: "Penetration Tester", description: "Conduct professional security assessments." },
      { title: "SOC Analyst", description: "Work in enterprise security operations centers." },
      { title: "Security Consultant", description: "Provide expert cybersecurity advisory services." },
      { title: "VAPT Analyst", description: "Specialize in vulnerability assessment & pen testing." },
    ],
    faqs: [
      { question: "What is the difference between CCEH and CCSE?", answer: "CCEH is a 3-month foundation program while CCSE is a 12-month comprehensive expert-level program covering advanced topics." },
      { question: "Can beginners join CCSE directly?", answer: "Yes, CCSE starts from fundamentals. However, we recommend CCEH first for the best learning experience." },
      { question: "Is placement guaranteed?", answer: "We provide strong placement support including resume building, mock interviews, and direct referrals to our hiring partners." },
    ],
  },
  {
    id: "soc-analyst",
    slug: "soc-analyst-program",
    title: "SOC Analyst Program",
    shortTitle: "SOC Analyst",
    badge: "Blue Team Career Track",
    category: "career-track",
    level: "Intermediate",
    duration: "3–6 Months",
    mode: "Online / Offline",
    labsType: "Hands-On SIEM Labs",
    description: "Master SOC operations, SIEM tools, threat detection, and incident response with real enterprise-grade simulations.",
    overview: "The SOC Analyst Program prepares you for a career in Security Operations Centers. Learn SIEM tools, log analysis, threat hunting, and incident response with hands-on experience in enterprise environments.",
    image: "/images/courses/soc.jpg",
    heroImage: "/images/courses/soc-hero.jpg",
    color: "#1a56db",
    featured: true,
    bestFor: ["IT Professionals", "Network Engineers", "CCEH Graduates", "Blue Team Aspirants"],
    topics: ["SOC Fundamentals", "SIEM Tools", "Threat Detection", "Incident Response", "Log Analysis", "Threat Hunting"],
    modules: [
      { number: "01", title: "SOC Fundamentals", description: "SOC architecture, roles, tiers, and workflows." },
      { number: "02", title: "SIEM Tools", description: "Splunk, Microsoft Sentinel, QRadar hands-on." },
      { number: "03", title: "Log Analysis", description: "Windows, Linux, firewall, and web server logs." },
      { number: "04", title: "Threat Detection", description: "IOC identification, threat intelligence feeds." },
      { number: "05", title: "Incident Response", description: "IR lifecycle, playbooks, and escalation procedures." },
      { number: "06", title: "Threat Hunting", description: "Proactive threat hunting techniques and tools." },
    ],
    tools: ["Splunk", "Microsoft Sentinel", "QRadar", "Wazuh", "TheHive", "MISP", "Velociraptor"],
    labs: ["SIEM Configuration Labs", "Incident Response Simulations", "Threat Hunting Exercises", "Log Correlation Practice"],
    certificationTitle: "Cyber A1 Certified SOC Analyst",
    careerPaths: [
      { title: "SOC Analyst L1/L2", description: "Work in enterprise security operations." },
      { title: "Threat Intelligence Analyst", description: "Analyze and respond to cyber threats." },
      { title: "Incident Responder", description: "Lead incident response operations." },
    ],
    faqs: [
      { question: "Do I need prior security experience?", answer: "Basic networking knowledge is helpful. The program starts from SOC fundamentals." },
      { question: "Which SIEM tools will I learn?", answer: "You will work with Splunk, Microsoft Sentinel, and QRadar among others." },
    ],
  },
  {
    id: "vapt",
    slug: "vapt-professional-program",
    title: "VAPT Professional Program",
    shortTitle: "VAPT Pro",
    badge: "Advanced Penetration Testing",
    category: "career-track",
    level: "Intermediate",
    duration: "3–6 Months",
    mode: "Online / Offline",
    labsType: "Real-World VAPT Labs",
    description: "Master professional vulnerability assessment and penetration testing with real-world methodologies, tools, and reporting standards.",
    overview: "The VAPT Professional Program provides comprehensive training in web, network, API, and mobile application penetration testing following industry standards like PTES, OWASP, and NIST.",
    image: "/images/courses/vapt.jpg",
    heroImage: "/images/courses/vapt-hero.jpg",
    color: "#e00000",
    featured: false,
    bestFor: ["Security Professionals", "Developers", "Network Engineers", "Bug Bounty Hunters"],
    topics: ["Web Application VAPT", "Network VAPT", "API Testing", "Mobile App Testing", "Report Writing", "CRTP"],
    modules: [
      { number: "01", title: "VAPT Methodology", description: "PTES, OWASP Testing Guide, NIST framework." },
      { number: "02", title: "Web App Penetration Testing", description: "OWASP Top 10, SQL injection, XSS, CSRF, SSRF." },
      { number: "03", title: "Network Penetration Testing", description: "Internal/external network VAPT methodology." },
      { number: "04", title: "API Security Testing", description: "REST API testing, authentication flaws, IDOR." },
      { number: "05", title: "Mobile Application Testing", description: "Android/iOS app security testing basics." },
      { number: "06", title: "Professional Report Writing", description: "CVSS scoring, professional security reports." },
    ],
    tools: ["Burp Suite Pro", "Metasploit", "Nmap", "OWASP ZAP", "SQLMap", "Nikto", "Gobuster"],
    labs: ["Web App VAPT Simulation", "Network Assessment Labs", "API Security Testing", "Reporting Practice"],
    certificationTitle: "Cyber A1 VAPT Professional",
    careerPaths: [
      { title: "Penetration Tester", description: "Conduct professional security assessments for organizations." },
      { title: "Security Researcher", description: "Research and disclose security vulnerabilities." },
      { title: "Bug Bounty Hunter", description: "Earn from ethical hacking on bug bounty platforms." },
    ],
    faqs: [
      { question: "Is CCEH required before VAPT?", answer: "It is highly recommended. CCEH builds the foundation for advanced VAPT training." },
      { question: "Will I work on real targets?", answer: "Yes, you work on controlled lab environments simulating real enterprise scenarios." },
    ],
  },
  {
    id: "ai-security",
    slug: "ai-security-fundamentals",
    title: "AI Security Fundamentals",
    shortTitle: "AI Security",
    badge: "Next-Gen Security Domain",
    category: "career-track",
    level: "Beginner",
    duration: "2–3 Months",
    mode: "Online / Offline",
    labsType: "AI Security Labs",
    description: "Understand AI-driven threats, machine learning security, adversarial attacks, and how to defend against AI-powered cyberattacks.",
    overview: "AI Security Fundamentals prepares you for the next generation of cybersecurity challenges including deepfakes, AI-powered phishing, adversarial ML attacks, and AI-driven threat intelligence.",
    image: "/images/courses/ai-security.jpg",
    heroImage: "/images/courses/ai-security-hero.jpg",
    color: "#7c3aed",
    featured: true,
    bestFor: ["AI Enthusiasts", "IT Professionals", "Security Researchers", "Data Scientists"],
    topics: ["AI in Cybersecurity", "ML Security", "Adversarial Attacks", "Deepfake Detection", "AI Threat Intelligence"],
    modules: [
      { number: "01", title: "AI & ML Fundamentals", description: "Introduction to AI, ML, and deep learning basics." },
      { number: "02", title: "AI-Powered Threats", description: "Deepfakes, AI phishing, automated attacks." },
      { number: "03", title: "Adversarial Machine Learning", description: "Evasion attacks, data poisoning, model attacks." },
      { number: "04", title: "AI for Threat Detection", description: "Using AI/ML for anomaly detection and threat hunting." },
      { number: "05", title: "AI Security Tools", description: "Practical tools for AI-powered security operations." },
    ],
    tools: ["Python", "TensorFlow", "Scikit-learn", "Adversarial Robustness Toolbox", "Splunk AI"],
    labs: ["Deepfake Detection Lab", "Adversarial Attack Simulations", "AI Phishing Analysis", "ML Model Security Testing"],
    certificationTitle: "Cyber A1 AI Security Fundamentals Certificate",
    careerPaths: [
      { title: "AI Security Researcher", description: "Research AI threats and defensive AI systems." },
      { title: "ML Security Engineer", description: "Secure machine learning pipelines and models." },
      { title: "Threat Intelligence Analyst", description: "Use AI to analyze and respond to threats." },
    ],
    faqs: [
      { question: "Do I need programming experience?", answer: "Basic Python knowledge is helpful but not mandatory for the beginner track." },
      { question: "What makes this course unique?", answer: "This is one of the very few programs focusing specifically on AI-powered threats and defenses." },
    ],
  },
  {
    id: "web-app-security",
    slug: "web-application-security",
    title: "Web Application Security",
    shortTitle: "Web App Security",
    badge: "OWASP Focused Program",
    category: "specialized",
    level: "Intermediate",
    duration: "3–4 Months",
    mode: "Online / Offline",
    labsType: "Web Hacking Labs",
    description: "Master OWASP Top 10, web hacking techniques, secure coding practices, and web application penetration testing.",
    overview: "This program provides in-depth training on web application security covering OWASP Top 10 vulnerabilities, manual and automated testing, secure development, and professional web VAPT.",
    image: "/images/courses/web-security.jpg",
    heroImage: "/images/courses/web-security-hero.jpg",
    color: "#0891b2",
    featured: true,
    bestFor: ["Web Developers", "Security Engineers", "QA Professionals", "Bug Bounty Hunters"],
    topics: ["OWASP Top 10", "Web Hacking", "Secure Coding", "API Security", "Authentication Flaws"],
    modules: [
      { number: "01", title: "Web Technologies Overview", description: "HTTP/S, REST, GraphQL, authentication mechanisms." },
      { number: "02", title: "OWASP Top 10", description: "In-depth study of all OWASP Top 10 vulnerabilities." },
      { number: "03", title: "SQL Injection & XSS", description: "Manual exploitation and automated scanning." },
      { number: "04", title: "Authentication & Session", description: "Auth flaws, session hijacking, JWT attacks." },
      { number: "05", title: "API Security Testing", description: "REST and GraphQL API security assessment." },
      { number: "06", title: "Secure Coding Practices", description: "Defensive coding techniques and code review." },
    ],
    tools: ["Burp Suite", "OWASP ZAP", "SQLMap", "Nikto", "Gobuster", "Postman"],
    labs: ["OWASP Juice Shop Labs", "DVWA Exploitation", "Real API Security Testing", "Secure Code Review"],
    certificationTitle: "Cyber A1 Web Application Security Certificate",
    careerPaths: [
      { title: "Web Security Tester", description: "Specialize in web application security assessments." },
      { title: "Secure Developer", description: "Build security into web development workflows." },
      { title: "Bug Bounty Hunter", description: "Hunt web vulnerabilities on major platforms." },
    ],
    faqs: [
      { question: "Should I know web development?", answer: "Basic understanding of HTML, HTTP, and web applications is helpful." },
      { question: "Will I practice on real applications?", answer: "Yes, you will work on intentionally vulnerable web applications in our controlled labs." },
    ],
  },
  {
    id: "cloud-security",
    slug: "cloud-security-program",
    title: "Cloud Security Program",
    shortTitle: "Cloud Security",
    badge: "AWS & Azure Security",
    category: "career-track",
    level: "Intermediate",
    duration: "3–6 Months",
    mode: "Online / Offline",
    labsType: "Cloud Lab Environments",
    description: "Master cloud security across AWS and Azure, covering cloud misconfigurations, IAM security, cloud VAPT, and compliance.",
    overview: "The Cloud Security Program prepares you for securing cloud infrastructure across AWS and Azure. Learn to identify and remediate cloud misconfigurations, conduct cloud VAPT, and implement cloud security best practices.",
    image: "/images/courses/cloud-security.jpg",
    heroImage: "/images/courses/cloud-security-hero.jpg",
    color: "#0284c7",
    featured: true,
    bestFor: ["Cloud Engineers", "DevOps Professionals", "Security Architects", "IT Administrators"],
    topics: ["AWS Security", "Azure Security", "Cloud Threats", "IAM Security", "Cloud VAPT", "Compliance"],
    modules: [
      { number: "01", title: "Cloud Fundamentals", description: "Cloud architecture, services, and security shared responsibility." },
      { number: "02", title: "AWS Security", description: "IAM, VPC security, S3 hardening, CloudTrail, GuardDuty." },
      { number: "03", title: "Azure Security", description: "Azure AD, Security Center, network security, compliance." },
      { number: "04", title: "Cloud Misconfigurations", description: "Common cloud security misconfigurations and remediation." },
      { number: "05", title: "Cloud VAPT", description: "Penetration testing cloud environments professionally." },
      { number: "06", title: "DevSecOps", description: "Integrating security into cloud CI/CD pipelines." },
    ],
    tools: ["AWS Security Tools", "Azure Security Center", "Prowler", "ScoutSuite", "Terraform", "CloudSploit"],
    labs: ["AWS Misconfiguration Labs", "Azure Security Hardening", "Cloud VAPT Simulations", "IAM Security Analysis"],
    certificationTitle: "Cyber A1 Cloud Security Certificate",
    careerPaths: [
      { title: "Cloud Security Engineer", description: "Secure cloud infrastructure for enterprises." },
      { title: "Cloud Penetration Tester", description: "Conduct professional cloud security assessments." },
      { title: "Security Architect", description: "Design secure cloud architectures." },
    ],
    faqs: [
      { question: "Do I need cloud experience?", answer: "Basic cloud knowledge is helpful. The program covers fundamentals before advancing to security." },
      { question: "Which certifications does this prepare for?", answer: "This program aligns with AWS Security Specialty and Azure Security Engineer certifications." },
    ],
  },
  {
    id: "bug-bounty",
    slug: "bug-bounty-training",
    title: "Bug Bounty Training",
    shortTitle: "Bug Bounty",
    badge: "Earn While You Learn",
    category: "specialized",
    level: "Intermediate",
    duration: "2–3 Months",
    mode: "Online",
    labsType: "Real Bug Bounty Labs",
    description: "Learn to find and report security vulnerabilities on bug bounty platforms like HackerOne, Bugcrowd, and earn while building your skills.",
    overview: "Bug Bounty Training teaches you the mindset, methodology, and practical skills needed to earn from ethical hacking through bug bounty programs. Learn recon, hunting techniques, and professional report writing.",
    image: "/images/courses/bug-bounty.jpg",
    heroImage: "/images/courses/bug-bounty-hero.jpg",
    color: "#f59e0b",
    featured: false,
    bestFor: ["VAPT Professionals", "Web Security Testers", "Security Researchers", "Ethical Hackers"],
    topics: ["Bug Bounty Methodology", "Recon Techniques", "Vulnerability Hunting", "Report Writing", "HackerOne", "Bugcrowd"],
    modules: [
      { number: "01", title: "Bug Bounty Fundamentals", description: "Platform overview, scope, rules of engagement." },
      { number: "02", title: "Advanced Reconnaissance", description: "Passive and active recon for bug bounty." },
      { number: "03", title: "Vulnerability Hunting", description: "XSS, IDOR, SSRF, business logic flaws." },
      { number: "04", title: "Report Writing", description: "Writing high-quality, professional bug reports." },
      { number: "05", title: "Earning Strategy", description: "How to maximize earnings and build reputation." },
    ],
    tools: ["Burp Suite", "Nuclei", "Amass", "Subfinder", "Httpx", "FFuf"],
    labs: ["Recon Practice Labs", "Vulnerability Discovery Exercises", "Report Writing Practice"],
    certificationTitle: "Cyber A1 Bug Bounty Specialist Certificate",
    careerPaths: [
      { title: "Bug Bounty Hunter", description: "Earn from bug bounty programs globally." },
      { title: "Security Researcher", description: "Conduct independent security research." },
    ],
    faqs: [
      { question: "Can beginners join?", answer: "We recommend completing CCEH or Web App Security before this program." },
      { question: "Will I earn during the course?", answer: "You will practice on intentionally vulnerable apps and learn to hunt on real programs after the course." },
    ],
  },
];

export const getCourseBySlug = (slug: string): Course | undefined =>
  courses.find((c) => c.slug === slug);

export const getFeaturedCourses = (): Course[] =>
  courses.filter((c) => c.featured);

export const getCoursesByCategory = (
  category: Course["category"]
): Course[] => courses.filter((c) => c.category === category);
