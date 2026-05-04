"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

const features = [
	{
		name: "Setup Time",
		us: "Minutes",
		them: "Weeks",
	},
	{
		name: "Training Required",
		us: "Zero (Auto-ingest)",
		them: "Manual Rules",
	},
	{
		name: "Understanding",
		us: "AI Context Aware",
		them: "Keyword Matching",
	},
	{
		name: "24/7 Availability",
		us: true,
		them: true,
	},
	{
		name: "Multi-language",
		us: "100+ (Native)",
		them: "Limited/Paid Add-on",
	},
	{
		name: "Maintenance",
		us: "Automated",
		them: "Constant Updates",
	},
];

export function ComparisonSection() {
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

		const element = document.getElementById("comparison-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return (
		<section
			id="comparison-section"
			className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
		>
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Why Choose Orkesta?
					</h2>
					<p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
						Stop settling for dumb chatbots. Upgrade to intelligence.
					</p>
				</div>

				<div
					className={`overflow-x-auto rounded-2xl border border-border shadow-lg bg-card transition-all duration-700 ${
						isVisible ? "animate-fade-in-scale" : "opacity-0"
					}`}
				>
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-border">
								<th className="p-6 text-lg font-medium text-muted-foreground w-1/3">
									Feature
								</th>
								<th className="p-6 text-xl font-bold text-foreground bg-primary/5 w-1/3 relative overflow-hidden">
									<div className="absolute top-0 left-0 w-full h-1 bg-primary" />
									Orkesta
								</th>
								<th className="p-6 text-lg font-medium text-muted-foreground w-1/3">
									Traditional Chatbots
								</th>
							</tr>
						</thead>
						<tbody>
							{features.map((feature, index) => (
								<tr
									key={index}
									className={`border-b border-border/50 last:border-0 hover:bg-muted/5 transition-colors`}
								>
									<td className="p-6 font-medium text-foreground">
										{feature.name}
									</td>
									<td className="p-6 font-semibold text-primary bg-primary/5">
										{typeof feature.us === "boolean" ? (
											feature.us ? (
												<Check className="w-6 h-6 text-green-500" />
											) : (
												<X className="w-6 h-6 text-red-500" />
											)
										) : (
											feature.us
										)}
									</td>
									<td className="p-6 text-muted-foreground">
										{typeof feature.them === "boolean" ? (
											feature.them ? (
												<Check className="w-6 h-6 text-green-500" />
											) : (
												<X className="w-6 h-6 text-red-500" />
											)
										) : (
											feature.them
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
