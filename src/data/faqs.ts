export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const homeFaqs: FAQ[] = [
  {
    id: "f1",
    question: "Who can join Cyber A1 Academy programs?",
    answer: "Anyone interested in cybersecurity can join — students, freshers, IT professionals, working professionals, and career switchers. We have programs designed for every experience level from complete beginners to advanced practitioners.",
    category: "general",
  },
  {
    id: "f2",
    question: "Do I need coding knowledge to start?",
    answer: "No coding knowledge is required for our foundation programs like CCEH. However, basic programming knowledge in Python is beneficial for advanced courses.",
    category: "prerequisites",
  },
  {
    id: "f3",
    question: "Is this program beginner friendly?",
    answer: "Yes, absolutely. Our CCEH and introductory programs start from absolute basics — networking, Linux, and core concepts — so anyone can learn cybersecurity from scratch.",
    category: "prerequisites",
  },
  {
    id: "f4",
    question: "Do you provide practical labs?",
    answer: "Yes, we have dedicated practical lab environments including virtual machines, attack ranges, vulnerable applications, cloud labs, and SIEM environments for hands-on learning.",
    category: "labs",
  },
  {
    id: "f5",
    question: "Do you offer placement assistance?",
    answer: "Yes, we provide comprehensive placement support including resume building, LinkedIn optimization, mock interviews, and direct referrals to our hiring partner companies.",
    category: "placement",
  },
  {
    id: "f6",
    question: "Are the classes online or offline?",
    answer: "We offer both online and offline modes. You can choose based on your preference. Weekend batches and weekday batches are available for both modes.",
    category: "mode",
  },
  {
    id: "f7",
    question: "What certifications will I receive?",
    answer: "Upon program completion, you receive a Cyber A1 Academy industry-recognized certificate. Additionally, our programs prepare you for global certifications like CEH, CompTIA Security+, and AWS Security Specialty.",
    category: "certification",
  },
  {
    id: "f8",
    question: "Can working professionals join your programs?",
    answer: "Yes! We have specially designed weekend batches and evening batches for working professionals who want to upskill or transition into cybersecurity.",
    category: "general",
  },
];

export const contactFaqs: FAQ[] = [
  {
    id: "cf1",
    question: "What are your office hours?",
    answer: "Our office is open Monday to Saturday, 9:30 AM to 7:00 PM IST.",
    category: "contact",
  },
  {
    id: "cf2",
    question: "Do you have multiple locations?",
    answer: "Yes, we have centers in Durgapur (Head Office), Delhi, and Kolkata.",
    category: "contact",
  },
  {
    id: "cf3",
    question: "How can I book a free counseling session?",
    answer: "You can book a free counseling session through our website, WhatsApp, or by calling our helpline at +91 8240 006 007.",
    category: "contact",
  },
];
