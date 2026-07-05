// force-dynamic: every request reads fresh CRM data so admin edits reflect immediately
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import {
  ensureFreshData,
  getSiteHome, getSiteSettings,
  getCRMFeaturedProgrammes, getCRMFeaturedBlogs,
  getCRMFeaturedEvents, getCRMFeaturedTestimonials, getCRMFAQs,
  getCRMFeaturedTrainers,
} from "@/lib/content";
import HeroSection from "@/sections/home/HeroSection";
import TrustStrip from "@/sections/home/TrustStrip";
import StatsStrip from "@/sections/home/StatsStrip";
import FeaturedPrograms from "@/sections/home/FeaturedPrograms";
import WhyAndRoadmap from "@/sections/home/WhyAndRoadmap";
import CareerRoadmap from "@/sections/home/CareerRoadmap";
import TrainersSection from "@/sections/home/TrainersSection";
import CorporateAndInstitutional from "@/sections/home/CorporateAndInstitutional";
import CommunitySection from "@/sections/home/CommunitySection";
import FAQSection from "@/sections/home/FAQSection";
import FinalCTA from "@/sections/home/FinalCTA";

export const metadata: Metadata = {
  title: "Cyber A1 Academy - Build Real Cybersecurity Skills For Industry & Enterprise",
  description:
    "Hands-on cybersecurity programs designed by security professionals. VAPT, cloud security, SOC operations, ethical hacking, and enterprise security workflows.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // Read all CRM data fresh on every request
  await ensureFreshData();
  const home = getSiteHome();
  const settings = getSiteSettings();

  const programmes = getCRMFeaturedProgrammes(home?.programmes?.featuredProgrammeIds);
  const blogs = getCRMFeaturedBlogs(home?.blog?.featuredPostIds);
  const events = getCRMFeaturedEvents(home?.events?.featuredEventIds);
  const testimonials = getCRMFeaturedTestimonials(home?.testimonials?.featuredTestimonialIds);
  const faqs = home?.faqs?.filter(f => f.isActive) ?? getCRMFAQs();
  const trainers = getCRMFeaturedTrainers();

  return (
    <>
      <HeroSection content={home?.hero} />
      <TrustStrip items={home?.trustStrip} />
      <StatsStrip stats={home?.stats} />
      <FeaturedPrograms
        programmes={programmes}
        config={home?.programmes}
      />
      {/* Why + Career Roadmap — side by side */}
      <section className="py-12 bg-white">
        <div className="w-full px-5 lg:px-0 lg:w-[95%] mx-auto">
          <div className="grid lg:grid-cols-[30%_1fr] gap-0 items-stretch">
            <div className="lg:pr-10 lg:border-r lg:border-gray-100 pb-8 lg:pb-0 h-full">
              <WhyAndRoadmap why={home?.why} />
            </div>
            <div className="lg:pl-10">
              <CareerRoadmap roadmap={home?.careerRoadmap} />
            </div>
          </div>
        </div>
      </section>
      <TrainersSection trainers={trainers} />
      <CorporateAndInstitutional
        corporate={home?.corporate}
        institutional={home?.institutional}
      />
      <CommunitySection
        events={events}
        testimonials={testimonials}
        blogs={blogs}
        hiringPartners={home?.testimonials?.hiringPartners}
        eventsConfig={home?.events}
        blogConfig={home?.blog}
      />
      <FAQSection faqs={faqs} />
      <FinalCTA cta={home?.cta} companyName={settings?.companyName} phone={settings?.phone} />
    </>
  );
}
