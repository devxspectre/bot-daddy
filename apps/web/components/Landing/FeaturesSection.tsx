"use client";

import { useEffect, useState } from "react";
import { Bot, Zap, TrendingUp, Shield, Globe, BarChart3 } from "lucide-react";

const features = [
	{
		icon: Bot,
		title: "AI-Powered Intelligence",
		description:
			"Advanced natural language processing that understands customer intent and provides human-like responses.",
		benefit: "Reduce support tickets by 70%",
	},
	{
		icon: Zap,
		title: "Lightning Fast Setup",
		description:
			"Get your chatbot live in under 5 minutes with our drag-and-drop builder and pre-built templates.",
		benefit: "Launch in minutes, not weeks",
	},
	{
		icon: TrendingUp,
		title: "Conversion Optimization",
		description:
			"Smart lead qualification and product recommendations that turn visitors into paying customers.",
		benefit: "Boost conversion rates by 300%",
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description:
			"Bank-level encryption and compliance with GDPR, CCPA, and SOC 2 standards for complete peace of mind.",
		benefit: "Trusted by Fortune 500 companies",
	},
	{
		icon: Globe,
		title: "Multi-Channel Support",
		description:
			"Deploy across website, social media, and messaging platforms with unified conversation management.",
		benefit: "Reach customers everywhere",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description:
			"Deep insights into customer behavior, conversation patterns, and ROI tracking with real-time dashboards.",
		benefit: "Make data-driven decisions",
	},
];

export function FeaturesSection() {
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

		const element = document.getElementById("features-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return (
		<section
			id="features-section"
			className="py-20 px-4 sm:px-6 lg:px-8 bg-background text-foreground"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						Everything You Need to Succeed
					</h2>
					<p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
						Our comprehensive platform provides all the tools and features you
						need to create, deploy, and optimize chatbots that drive real
						business results.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className={`group p-6 bg-card border border-border rounded-xl transition-all duration-300 ${
								isVisible ? "animate-fade-in-scale" : "opacity-0"
							}`}
						>
							<div className="flex items-center mb-4">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<feature.icon className="w-6 h-6 text-primary" />
								</div>
							</div>

							<h3 className="text-xl font-semibold text-foreground mb-3">
								{feature.title}
							</h3>

							<p className="text-muted-foreground mb-4 text-pretty">
								{feature.description}
							</p>

							<div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
								{feature.benefit}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
