export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { getCRMEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events & Community â€” Workshops, Bootcamps, CTF & More",
  description: "Join Cyber A1 Academy cybersecurity events â€” workshops, bootcamps, CTF competitions, hackathons, webinars, and community meetups.",
};

const eventTypeStyle: Record<string, string> = {
  workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bootcamp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ctf: "bg-red-500/20 text-red-400 border-red-500/30",
  seminar: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  hackathon: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  webinar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default function EventsPage() {
  const events = getCRMEvents();

  return (
    <div className="pt-16">
      <section className="relative bg-[#080b10] py-16 overflow-hidden">
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Events</span>
          </div>
          <div className="max-w-3xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">Events &amp; Community</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Building A Strong <span className="text-red-500">Cybersecurity Community</span>
            </h1>
            <p className="text-gray-400">Our events, workshops, and community initiatives keep you connected and competitive.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">Upcoming Events</span>
              <h2 className="text-2xl font-black text-gray-900">Don&apos;t Miss Out</h2>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No events published yet.</p>
              <p className="text-sm mt-2">Create events in the CRM to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const style = eventTypeStyle[event.type] || eventTypeStyle.seminar;
                return (
                  <div key={event.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-red-500/30" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${style}`}>{event.type}</span>
                        {event.isFree && <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">FREE</span>}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-sm line-clamp-2">{event.title}</h3>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-red-500" />
                          {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-red-500" /> {event.time}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {event.mode === "online" ? "Online" : event.venue.split(",")[0]}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {event.tags.slice(0, 3).map((tag) => <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>)}
                      </div>
                      <a href={event.registrationLink || "#"} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-500 transition-colors">
                        Register Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="site-container max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Want to Host an Event at Your Institution?</h2>
          <p className="text-gray-500 mb-6">We conduct free/subsidized cybersecurity workshops at colleges and communities.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/institutions" className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
              Partner With Us <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


