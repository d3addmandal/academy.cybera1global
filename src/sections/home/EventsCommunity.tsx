// Replaced by CommunitySection.tsx — kept to avoid breaking imports
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ExternalLink } from "lucide-react";
import { getCRMFeaturedEvents } from "@/lib/content";
const getFeaturedEvents = getCRMFeaturedEvents;

const eventTypes: Record<string, string> = {
  workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bootcamp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ctf: "bg-red-500/20 text-red-400 border-red-500/30",
  seminar: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  hackathon: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  webinar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default function EventsCommunity() {
  const events = getFeaturedEvents();

  return (
    <section className="py-20 bg-white">
      <div className="site-container">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Events */}
          <div>
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">
              Events &amp; Community
            </span>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">
                Building A Strong{" "}
                <span className="text-red-600">Cybersecurity Community</span>
              </h2>
            </div>

            {/* Event gallery */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center group hover:border-red-600/40 transition-colors cursor-pointer"
                >
                  <div className="text-center p-2">
                    <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-red-600/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-gray-600 text-xs">Event {i}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 border border-red-600/30 text-red-600 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              Explore Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">
                  Upcoming Events
                </span>
                <h2 className="text-3xl font-black text-gray-900">
                  Don&apos;t Miss Out
                </h2>
              </div>
              <Link href="/events" className="text-red-600 text-sm font-semibold hover:text-red-700">
                See All →
              </Link>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-red-200 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${
                          eventTypes[event.type] || eventTypes.seminar
                        }`}
                      >
                        {event.type}
                      </span>
                      <h3 className="text-gray-900 font-bold text-sm mt-2">{event.title}</h3>
                    </div>
                    {event.isFree && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 whitespace-nowrap flex-shrink-0">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.mode === "online" ? "Online" : event.venue.split(",")[0]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {event.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <Link href={`/events`} className="text-red-600 text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">
                      Register <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

