// force-dynamic: every request reads fresh CRM data so admin edits reflect immediately
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import {
  getSiteHome, getSiteSettings,
  getCRMFeaturedProgrammes, getCRMFeaturedBlogs,
  getCRMFeaturedEvents, getCRMFeaturedTestimonials, getCRMFAQs,
} from "@/lib/content";
import HeroSection from "@/sections/home/HeroSection";
import TrustStrip from "@/sections/home/TrustStrip";
import FeaturedPrograms from "@/sections/home/FeaturedPrograms";
import WhyAndRoadmap from "@/sections/home/WhyAndRoadmap";
import CareerRoadmap from "@/sections/home/CareerRoadmap";
import CorporateAndInstitutional from "@/sections/home/CorporateAndInstitutional";
import CommunitySection from "@/sections/home/CommunitySection";
import FAQSection from "@/sections/home/FAQSection";
import FinalCTA from "@/sections/home/FinalCTA";

export const metadata: Metadata = {
  title: "Cyber A1 Academy — Build Real Cybersecurity Skills For Industry & Enterprise",
  description:
    "Hands-on cybersecurity programs designed by security professionals. VAPT, cloud security, SOC operations, ethical hacking, and enterprise security workflows.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Read all CRM data fresh on every request
  const home = getSiteHome();
  const settings = getSiteSettings();

  const programmes = getCRMFeaturedProgrammes(home?.programmes?.featuredProgrammeIds);
  const blogs = getCRMFeaturedBlogs(home?.blog?.featuredPostIds);
  const events = getCRMFeaturedEvents(home?.events?.featuredEventIds);
  const testimonials = getCRMFeaturedTestimonials(home?.testimonials?.featuredTestimonialIds);
  const faqs = home?.faqs?.filter(f => f.isActive) ?? getCRMFAQs();

  return (
    <>
      <HeroSection content={home?.hero} />
      <TrustStrip items={home?.trustStrip} />
      <FeaturedPrograms
        programmes={programmes}
        config={home?.programmes}
      />
      {/* Why + Career Roadmap — side by side */}
      <section className="py-8 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-[3fr_7fr] gap-0 items-start">
            <div className="lg:pr-8 lg:border-r lg:border-gray-100">
              <WhyAndRoadmap why={home?.why} />
            </div>
            <div className="lg:pl-8">
              <CareerRoadmap roadmap={home?.careerRoadmap} />
            </div>
          </div>
        </div>
      </section>
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
      <FAQSection faqs={faqs} cardBgImage={home?.faqCardBgImage} />
      <FinalCTA cta={home?.cta} companyName={settings?.companyName} />
    </>
  );
}
