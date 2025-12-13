"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
	"No setup fees or hidden costs",
	"Cancel anytime, no questions asked",
	"Dedicated onboarding support",
	"99.9% uptime guarantee",
];

export function CTASection() {
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

		const element = document.getElementById("cta-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return (
		<section id="cta-section" className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto text-center">
				<div className={`${isVisible ? "animate-slide-up" : "opacity-0"}`}>
					<h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
						Ready to Transform Your Business?
					</h2>

					<p className="text-xl text-muted-foreground mb-8 text-pretty">
						Join over 10,000 merchants who&apos;ve increased their sales by 300% with
						our AI chatbots. Start building today and see results within
						24 hours.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
						<Button
							size="lg"
							className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 animate-pulse-glow group text-lg px-8 py-4 border-0 shadow-lg shadow-primary/25"
						>
							Start Building Now
							<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-border hover:bg-accent text-lg px-8 py-4 bg-transparent"
						>
							Schedule a Demo
						</Button>
					</div>

					<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${benefits.length} gap-4 text-sm`}>
						{benefits.map((benefit, index) => (
							<div
								key={index}
								className={`flex items-center justify-center space-x-2 text-muted-foreground ${
									isVisible ? "animate-fade-in-scale" : "opacity-0"
								}`}
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
								<span className="text-center">{benefit}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="mt-20 pt-12 border-t border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="col-span-1 md:col-span-2">
							<div className="flex items-center space-x-2 mb-4">
								<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
									<span className="text-primary-foreground font-bold text-sm">
										BD
									</span>
								</div>
								<span className="text-xl font-bold text-foreground">
									Bot Daddy
								</span>
							</div>
							<p className="text-muted-foreground mb-4 max-w-md">
								Empowering businesses worldwide with intelligent chatbot
								solutions that drive growth and enhance customer experience.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-foreground mb-4">Product</h4>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Features
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Pricing
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Templates
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Integrations
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-foreground mb-4">Support</h4>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Documentation
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Help Center
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Contact Us
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Status
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
						<p>
							&copy; 2025 Bot Daddy. All rights reserved. Built with ❤️ for
							merchants worldwide.
						</p>
					</div>
				</div>
			</footer>
		</section>
	);
}
