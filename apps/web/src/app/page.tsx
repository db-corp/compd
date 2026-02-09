import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import Testimonials from "@/components/landing/Testimonials";
import BigStat from "@/components/landing/BigStat";
import HowItWorks from "@/components/landing/HowItWorks";
import Comparison from "@/components/landing/Comparison";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-25">
      <Navbar />
      <Hero />
      <SocialProof />
      <Testimonials />
      <BigStat />
      <HowItWorks />
      <Comparison />
      <FeatureShowcase />
      <CtaBanner />
      <Footer />
    </div>
  );
}
