export interface Event {
  id: string;
  slug: string;
  title: string;
  type: "workshop" | "bootcamp" | "seminar" | "ctf" | "hackathon" | "webinar";
  date: string;
  time: string;
  venue: string;
  mode: "online" | "offline" | "hybrid";
  description: string;
  image: string;
  tags: string[];
  registrationLink: string;
  isFree: boolean;
  isFeatured: boolean;
}

export const events: Event[] = [
  {
    id: "e1",
    slug: "cybersecurity-workshop-durgapur-2025",
    title: "Cybersecurity Foundations Workshop",
    type: "workshop",
    date: "2025-06-15",
    time: "10:00 AM – 4:00 PM",
    venue: "Cyber A1 Academy, Durgapur",
    mode: "offline",
    description: "A full-day hands-on workshop covering networking basics, ethical hacking fundamentals, and Kali Linux setup. Perfect for beginners.",
    image: "/images/events/event-workshop.jpg",
    tags: ["Beginner", "Workshop", "Ethical Hacking"],
    registrationLink: "#",
    isFree: true,
    isFeatured: true,
  },
  {
    id: "e2",
    slug: "vapt-bootcamp-june-2025",
    title: "VAPT 3-Day Intensive Bootcamp",
    type: "bootcamp",
    date: "2025-06-20",
    time: "9:00 AM – 6:00 PM",
    venue: "Cyber A1 Academy, Durgapur",
    mode: "hybrid",
    description: "An intensive 3-day bootcamp covering web application VAPT, network penetration testing, and report writing.",
    image: "/images/events/event-bootcamp.jpg",
    tags: ["VAPT", "Bootcamp", "Intermediate"],
    registrationLink: "#",
    isFree: false,
    isFeatured: true,
  },
  {
    id: "e3",
    slug: "capture-the-flag-july-2025",
    title: "Capture The Flag (CTF) Competition",
    type: "ctf",
    date: "2025-07-05",
    time: "10:00 AM – 8:00 PM",
    venue: "Online + Durgapur Campus",
    mode: "hybrid",
    description: "Compete in our quarterly CTF competition. Win prizes and get recognized by our hiring partner companies.",
    image: "/images/events/event-ctf.jpg",
    tags: ["CTF", "Competition", "All Levels"],
    registrationLink: "#",
    isFree: true,
    isFeatured: true,
  },
  {
    id: "e4",
    slug: "cloud-security-webinar-2025",
    title: "Cloud Security Best Practices — Free Webinar",
    type: "webinar",
    date: "2025-06-28",
    time: "6:00 PM – 8:00 PM",
    venue: "Online (Zoom)",
    mode: "online",
    description: "Free live webinar on AWS and Azure security best practices, common misconfigurations, and career opportunities in cloud security.",
    image: "/images/events/event-webinar.jpg",
    tags: ["Cloud Security", "Free", "Webinar"],
    registrationLink: "#",
    isFree: true,
    isFeatured: false,
  },
  {
    id: "e5",
    slug: "devsecops-hackathon-2025",
    title: "DevSecOps Hackathon 2025",
    type: "hackathon",
    date: "2025-07-19",
    time: "9:00 AM",
    venue: "Cyber A1 Academy, Durgapur",
    mode: "offline",
    description: "24-hour hackathon focused on building secure applications and implementing DevSecOps practices. Open for college teams.",
    image: "/images/events/event-hackathon.jpg",
    tags: ["Hackathon", "DevSecOps", "Teams"],
    registrationLink: "#",
    isFree: true,
    isFeatured: false,
  },
  {
    id: "e6",
    slug: "gdg-cybersecurity-talk-2025",
    title: "GDG Durgapur × Cyber A1 — Security Talk",
    type: "seminar",
    date: "2025-06-10",
    time: "5:00 PM – 7:00 PM",
    venue: "Online + Durgapur",
    mode: "hybrid",
    description: "A collaborative session with GDG Durgapur covering cybersecurity best practices for developers and the latest threat landscape.",
    image: "/images/events/event-gdg.jpg",
    tags: ["GDG", "Developers", "Security"],
    registrationLink: "#",
    isFree: true,
    isFeatured: false,
  },
];

export const getFeaturedEvents = (): Event[] =>
  events.filter((e) => e.isFeatured);
