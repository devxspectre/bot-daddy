"use client";

import { useEffect, useState } from "react";
import { Database, Bot, Zap, ArrowRight } from "lucide-react";

const steps = [
	{
		icon: Database,
		title: "1. Connect Your Data",
		description:
			"Import data from your website, PDF documents, or Notion pages in seconds. We support all major data sources.",
	},
	{
		icon: Bot,
		title: "2. Customize Your AI",
		description:
			"Define your chatbot's persona, tone, and knowledge base access. Make it truly yours with our intuitive builder.",
	},
	{
		icon: Zap,
		title: "3. Deploy Instantly",
		description:
			"Embed the chatbot on your website with just few lines of code. Go live immediately.",
	},
];

export function HowItWorksSection() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		const element = document.getElementById("how-it-works-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return (
		<section
			id="how-it-works-section"
			className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
		>
			<div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
			
			<div className="max-w-7xl mx-auto relative z-10">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						How It Works
					</h2>
					<p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
						From signup to solved tickets in three simple steps.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
					<div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-primary/20 -z-10" />

					{steps.map((step, index) => (
						<div
							key={index}
							className={`flex flex-col items-center text-center transition-all duration-500 ${
								isVisible ? "animate-slide-up" : "opacity-0"
							}`}
							style={{ animationDelay: `${index * 0.2}s` }}
						>
							<div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6 relative group hover:border-primary/50 transition-colors">
								<div className="absolute inset-0 bg-primary/5 rounded-2xl" />
								<step.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
								<div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold text-muted-foreground">
									{index + 1}
								</div>
							</div>
							
							<h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
							<p className="text-muted-foreground text-pretty px-4">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
