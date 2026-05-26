import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import ContactFormClient from "./ContactFormClient";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

const contactFaqs = [
  { id: "cf1", question: "What are your office hours?", answer: "Our office is open Monday to Saturday, 9:30 AM to 7:00 PM IST.", category: "contact" },
  { id: "cf2", question: "Do you have multiple locations?", answer: "Yes, we have centers in Durgapur (Head Office), Delhi, and Kolkata.", category: "contact" },
  { id: "cf3", question: "How can I book a free counseling session?", answer: "You can book via our website, WhatsApp, or by calling our helpline.", category: "contact" },
];

export const metadata: Metadata = {
  title: "Contact Us - Cyber A1 Academy",
  description:
    "Get in touch with Cyber A1 Academy. Book a free counseling session, enquire about programs, or reach out to our team in Durgapur, Delhi, or Kolkata.",
};

export default function ContactPage() {
  const settings = getSiteSettings();
  const phone = settings?.phone ?? "+91 8240 006 007";
  const email = settings?.email ?? "info@cybera1academy.com";
  const hours = settings?.hours ?? "Mon-Sat: 9:30 AM - 7:00 PM";
  const whatsapp = (settings?.whatsapp ?? "918240006007").replace(/\D/g, "");
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  const offices = [
    { city: "Durgapur (Head Office)", address: "Cyber A1 Academy, Durgapur, West Bengal", isPrimary: true },
    { city: "Delhi", address: "Delhi Office - Contact for exact address", isPrimary: false },
    { city: "Kolkata", address: "Kolkata Office - Contact for exact address", isPrimary: false },
  ];
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#080b10] py-16">
        <div className="site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Contact</span>
          </div>
          <div className="max-w-2xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">Get In Touch</span>
            <h1 className="text-4xl font-black text-white mb-4">
              Talk to Our <span className="text-red-500">Experts</span> &amp; Get Personalized Guidance
            </h1>
            <p className="text-gray-400">
              Book a free counseling session, enquire about programs, or reach out to our team. We&apos;re here to help you build your cybersecurity career.
            </p>
          </div>
        </div>
      </section>

      <div className="site-container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-6">Fill in the form below and our team will get back to you within 2 hours.</p>
              <ContactFormClient phone={phone} />
            </div>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick contact */}
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-5">Quick Contact</h3>
              <div className="space-y-4">
                <a href={telHref} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Phone className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Call Us</p>
                    <p className="text-white font-semibold">{phone}</p>
                  </div>
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                    <Mail className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Email Us</p>
                    <p className="text-white font-semibold text-sm">{email}</p>
                  </div>
                </a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-green-600/20 border border-green-600/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:border-green-600 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">WhatsApp</p>
                    <p className="text-white font-semibold">Chat with us now</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Office Hours</p>
                    <p className="text-white font-semibold text-sm">{hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="text-gray-900 font-bold text-lg mb-5">Our Locations</h3>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div key={office.city} className={`p-4 rounded-xl transition-colors ${office.isPrimary ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${office.isPrimary ? "text-red-600" : "text-gray-400"}`} />
                      <p className={`font-bold text-sm ${office.isPrimary ? "text-red-700" : "text-gray-700"}`}>{office.city}</p>
                      {office.isPrimary && <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">HQ</span>}
                    </div>
                    <p className="text-gray-500 text-xs ml-6">{office.address}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-gray-900 font-bold mb-4">Quick FAQs</h3>
              <div className="space-y-3">
                {contactFaqs.map((faq) => (
                  <div key={faq.id}>
                    <p className="text-gray-800 font-semibold text-sm mb-1">{faq.question}</p>
                    <p className="text-gray-500 text-xs">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


