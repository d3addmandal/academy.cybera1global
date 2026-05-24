import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Target, Eye, Award, CheckCircle2, ArrowRight, Users, TrendingUp, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Cyber A1 Academy",
  description: "Cyber A1 Academy is the training division of Cyber A1 Global Solutions LLP — India's premier industry-focused cybersecurity training platform.",
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="bg-[#080b10] py-20">
        <div className="site-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">About Us</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">
              About <span className="text-red-500">Cyber A1 Academy</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              We are India&apos;s premier industry-focused cybersecurity training platform, committed to bridging the gap between education and enterprise-grade cybersecurity skills.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Cyber A1 Academy is the training division of Cyber A1 Global Solutions LLP, a cybersecurity company with real-world experience in VAPT, security assessments, compliance, and enterprise security solutions.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Founded with the mission to make quality cybersecurity education accessible, we combine industry expertise with practical learning methodologies to produce job-ready security professionals.
              </p>
            </div>
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-8 text-center">
              <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-4">Our Mission</h3>
              <p className="text-gray-400">To bridge the gap between theoretical cybersecurity education and real-world industry requirements, creating skilled professionals who can contribute from day one.</p>
            </div>
            <div className="bg-[#080b10] border border-gray-800 rounded-2xl p-8 text-center">
              <Eye className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-4">Our Vision</h3>
              <p className="text-gray-400">To be India&apos;s most trusted cybersecurity learning ecosystem, known for practical education, industry integration, and career excellence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f5f5f5]">
        <div className="site-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: "1000+", label: "Students Trained", icon: Users },
              { value: "20+", label: "Expert Trainers", icon: Award },
              { value: "50+", label: "Hands-On Labs", icon: Shield },
              { value: "100+", label: "Workshops Conducted", icon: Globe },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6">
                <Icon className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#080b10]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Join Us On This <span className="text-red-500">Journey</span>
          </h2>
          <p className="text-gray-400 mb-8">Whether you&apos;re a student, professional, or organization — we have a path for you.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/courses" className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
              Explore Programs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

