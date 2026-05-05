import { CTASection } from "@/components/CtaSection";
import { DemoSection } from "@/components/DemoSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { StatsSection } from "@/components/StatsSection";
import { FAQSection } from "@/components/FAQSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ComparisonSection } from "@/components/ComparisonSection";

export default function HomePage() {
	return (
		<main className="min-h-screen bg-background">
			<div className="grid-pattern fixed inset-0 pointer-events-none" />

			<Navbar />
			<HeroSection />
			<StatsSection />
			<FeaturesSection />
			<TestimonialsSection />
			<HowItWorksSection />
			<DemoSection />
			<ComparisonSection />
			<FAQSection />
			<CTASection />
		</main>
	);
}
