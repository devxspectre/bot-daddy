import { CTASection } from "@/components/Landing/CtaSection";
import { DemoSection } from "@/components/Landing/DemoSection";
import { FeaturesSection } from "@/components/Landing/FeaturesSection";
import { HeroSection } from "@/components/Landing/HeroSection";
import { Navbar } from "@/components/Landing/Navbar";
import { TestimonialsSection } from "@/components/Landing/TestimonialsSection";
import { StatsSection } from "@/components/Landing/StatsSection";
import { FAQSection } from "@/components/Landing/FAQSection";
import { HowItWorksSection } from "@/components/Landing/HowItWorksSection";
import { ComparisonSection } from "@/components/Landing/ComparisonSection";
export default function HomePage() {
	return (
		<main className="min-h-screen bg-background">
			<div className="grid-pattern fixed inset-0 pointer-events-none" />

			<Navbar />
			<HeroSection />
		{/*These sections are preserved for future */}
			{/* <StatsSection /> */}
			{/*<FeaturesSection />*/}
			{/* <TestimonialsSection /> */}
			<HowItWorksSection />
			<DemoSection />
			<ComparisonSection />
			<FAQSection />
			<CTASection />
		</main>
	);
}
