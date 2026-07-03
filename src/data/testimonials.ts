export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  companyLogo: string;
  image: string;
  quote: string;
  program: string;
  rating: number;
  linkedIn?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Rahul Sharma",
    role: "Security Analyst",
    company: "Deloitte",
    companyLogo: "/images/companies/deloitte.png",
    image: "/images/students/student-1.jpg",
    quote: "Thanks to Cyber A1 Academy, I started my cybersecurity journey from scratch and now I am working as a Security Analyst. The hands-on labs and mentors are excellent.",
    program: "CCSE",
    rating: 5,
    linkedIn: "#",
  },
  {
    id: "t2",
    name: "Sneha Kumari",
    role: "Security Engineer",
    company: "TCS",
    companyLogo: "/images/companies/tcs.png",
    image: "/images/students/student-2.jpg",
    quote: "The mentors are very supportive and industry experienced. I gained confidence to start my career in cybersecurity through the CCEH program.",
    program: "CCEH",
    rating: 5,
    linkedIn: "#",
  },
  {
    id: "t3",
    name: "Ankit Verma",
    role: "Security Engineer",
    company: "Infosys",
    companyLogo: "/images/companies/infosys.png",
    image: "/images/students/student-3.jpg",
    quote: "Hands-on training and real projects gave me confidence. I got placed at Infosys right after completing the SOC Analyst program.",
    program: "SOC Analyst",
    rating: 5,
    linkedIn: "#",
  },
  {
    id: "t4",
    name: "Priya Singh",
    role: "Penetration Tester",
    company: "Wipro",
    companyLogo: "/images/companies/wipro.png",
    image: "/images/students/student-4.jpg",
    quote: "Cyber A1 Academy helped me build practical skills. The labs and guidance are excellent. I'm now working as a Penetration Tester at Wipro.",
    program: "VAPT Professional",
    rating: 5,
    linkedIn: "#",
  },
  {
    id: "t5",
    name: "Mohammed Farhan",
    role: "SOC Analyst",
    company: "Accenture",
    companyLogo: "/images/companies/accenture.png",
    image: "/images/students/student-5.jpg",
    quote: "The SOC Analyst program gave me real-world exposure to SIEM tools and incident response. The instructors have deep industry experience.",
    program: "SOC Analyst",
    rating: 5,
    linkedIn: "#",
  },
  {
    id: "t6",
    name: "Ritu Agarwal",
    role: "Cloud Security Engineer",
    company: "IBM",
    companyLogo: "/images/companies/ibm.png",
    image: "/images/students/student-6.jpg",
    quote: "The Cloud Security program was exactly what I needed to transition into cloud security. Highly structured and practical.",
    program: "Cloud Security",
    rating: 5,
    linkedIn: "#",
  },
];

export const partnerCompanies = [
  { name: "Deloitte", logo: "/images/companies/deloitte.png" },
  { name: "TCS", logo: "/images/companies/tcs.png" },
  { name: "Wipro", logo: "/images/companies/wipro.png" },
  { name: "Infosys", logo: "/images/companies/infosys.png" },
  { name: "Accenture", logo: "/images/companies/accenture.png" },
  { name: "IBM", logo: "/images/companies/ibm.png" },
  { name: "Cognizant", logo: "/images/companies/cognizant.png" },
  { name: "HCL", logo: "/images/companies/hcl.png" },
];
