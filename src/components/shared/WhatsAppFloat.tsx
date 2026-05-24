"use client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/918240006007"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(37,211,102,0.5)] transition-all duration-300"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}
