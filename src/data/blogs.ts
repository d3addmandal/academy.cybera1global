export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: { name: string; role: string; image: string };
  publishedAt: string;
  readTime: string;
  image: string;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "how-ai-is-transforming-cybersecurity",
    title: "How AI is Transforming Cybersecurity",
    excerpt: "Artificial intelligence is reshaping the cybersecurity landscape — from AI-powered threat detection to adversarial machine learning attacks. Here's what you need to know.",
    content: "",
    category: "AI Security",
    tags: ["AI", "Machine Learning", "Threat Detection", "Cybersecurity"],
    author: { name: "Arjun Mehta", role: "Senior Security Researcher", image: "/images/authors/author-1.jpg" },
    publishedAt: "2025-05-18",
    readTime: "6 min read",
    image: "/images/blog/blog-ai-cybersecurity.jpg",
    featured: true,
  },
  {
    id: "b2",
    slug: "vapt-vs-pen-testing-key-differences",
    title: "VAPT vs Pen Testing: Key Differences",
    excerpt: "Many professionals confuse VAPT with penetration testing. This article breaks down the key differences, methodologies, and when to use each approach.",
    content: "",
    category: "VAPT",
    tags: ["VAPT", "Penetration Testing", "Security Assessment"],
    author: { name: "Priya Nair", role: "Penetration Testing Lead", image: "/images/authors/author-2.jpg" },
    publishedAt: "2025-05-12",
    readTime: "5 min read",
    image: "/images/blog/blog-vapt.jpg",
    featured: true,
  },
  {
    id: "b3",
    slug: "soc-analyst-career-roadmap-2025",
    title: "SOC Analyst Career Roadmap 2025",
    excerpt: "Complete guide to becoming a SOC Analyst in 2025 — skills, certifications, tools, and the career path from junior analyst to senior SOC engineer.",
    content: "",
    category: "Career",
    tags: ["SOC Analyst", "Career", "Blue Team", "SIEM"],
    author: { name: "Rohan Das", role: "SOC Team Lead", image: "/images/authors/author-3.jpg" },
    publishedAt: "2025-05-08",
    readTime: "8 min read",
    image: "/images/blog/blog-soc.jpg",
    featured: true,
  },
  {
    id: "b4",
    slug: "top-10-cybersecurity-skills-in-demand",
    title: "Top 10 Cybersecurity Skills in Demand",
    excerpt: "The cybersecurity job market is booming. These are the top 10 skills that employers are actively looking for in 2025 and beyond.",
    content: "",
    category: "Career",
    tags: ["Skills", "Career", "Job Market", "Cybersecurity"],
    author: { name: "Sneha Roy", role: "Career Counselor", image: "/images/authors/author-4.jpg" },
    publishedAt: "2025-05-01",
    readTime: "7 min read",
    image: "/images/blog/blog-skills.jpg",
    featured: false,
  },
  {
    id: "b5",
    slug: "owasp-top-10-explained-2025",
    title: "OWASP Top 10 Explained — 2025 Edition",
    excerpt: "A comprehensive breakdown of the OWASP Top 10 web application security risks in 2025 with real examples and how to protect against each.",
    content: "",
    category: "Web Security",
    tags: ["OWASP", "Web Security", "Vulnerabilities"],
    author: { name: "Arjun Mehta", role: "Senior Security Researcher", image: "/images/authors/author-1.jpg" },
    publishedAt: "2025-04-25",
    readTime: "10 min read",
    image: "/images/blog/blog-owasp.jpg",
    featured: false,
  },
  {
    id: "b6",
    slug: "cloud-security-best-practices-aws-azure",
    title: "Cloud Security Best Practices for AWS & Azure",
    excerpt: "Essential cloud security practices every organization should implement on AWS and Azure to prevent breaches and misconfigurations.",
    content: "",
    category: "Cloud Security",
    tags: ["AWS", "Azure", "Cloud Security", "Best Practices"],
    author: { name: "Vikram Iyer", role: "Cloud Security Architect", image: "/images/authors/author-5.jpg" },
    publishedAt: "2025-04-18",
    readTime: "9 min read",
    image: "/images/blog/blog-cloud.jpg",
    featured: false,
  },
];

export const blogCategories = [
  "All",
  "AI Security",
  "VAPT",
  "Career",
  "Web Security",
  "Cloud Security",
  "SOC",
  "Red Teaming",
];

export const getBlogBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((b) => b.slug === slug);

export const getFeaturedBlogs = (): BlogPost[] =>
  blogPosts.filter((b) => b.featured).slice(0, 3);
