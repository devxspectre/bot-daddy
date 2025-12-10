import { CTASection } from "@/components/Landing/CtaSection";
import { DemoSection } from "@/components/Landing/DemoSection";
import { FeaturesSection } from "@/components/Landing/FeaturesSection";
import { HeroSection } from "@/components/Landing/HeroSection";
import { Navbar } from "@/components/Landing/Navbar";
import { TestimonialsSection } from "@/components/Landing/TestimonialsSection";
import { StatsSection } from "@/components/Landing/StatsSection";
import { FAQSection } from "@/components/Landing/FAQSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid-pattern fixed inset-0 pointer-events-none" />
      <Navbar />
      <HeroSection />
      <StatsSection />
      {/*<FeaturesSection />*/}
      <TestimonialsSection />
      <DemoSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
