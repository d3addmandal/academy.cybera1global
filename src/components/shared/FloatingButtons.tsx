"use client";
import { Phone, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types/cms";

interface Props {
  settings?: SiteSettings | null;
}

export default function FloatingButtons({ settings }: Props) {
  const phone = settings?.phone ?? "+918240006007";
  const whatsapp = (settings?.whatsapp ?? "+918240006007").replace(/\D/g, "");
  const telHref = `tel:${phone.replace(/\s/g, "")}`;
  const waHref = `https://wa.me/${whatsapp}`;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-center gap-3">
      {/* Phone / Caller button */}
      <a
        href={telHref}
        aria-label="Call us"
        className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(224,0,0,0.4)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(224,0,0,0.5)] hover:bg-red-500 transition-all duration-300"
      >
        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </a>
      {/* WhatsApp button */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(37,211,102,0.5)] transition-all duration-300"
      >
        <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
      </a>
    </div>
  );
}