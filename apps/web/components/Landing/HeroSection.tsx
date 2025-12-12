"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
			{/* Background Elements */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse-glow" />
				<div className="absolute top-40 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 animate-pulse-glow" style={{ animationDelay: "1s" }} />
			</div>

			<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="flex flex-col justify-center text-center min-h-[70vh]">
					<div
						className={`transition-all duration-1000 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 max-w-full mx-4 sm:mx-6 lg:mx-16 leading-tight">
							<span className="block mb-2 font-bold tracking-tight">
								Sit Back.
							</span>
							<span className="block">
								<span className="relative inline-block">
									<span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent pr-2">
										Bot Daddy
									</span>
								</span>
								is taking care of your customers
							</span>
						</h1>
						<div className="flex justify-center">
							<p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-5xl sm:mx-6 lg:mx-16 text-pretty">
								Intelligent chatbots that turn site traffic into revenue
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
							<Button
								size="lg"
								className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity border-0 cursor-pointer px-8 py-6 text-base font-medium shadow-lg shadow-primary/25"
							>
								Start Building Now
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-primary/20 hover:bg-primary/5 hover:text-primary bg-background/50 backdrop-blur-sm cursor-pointer px-8 py-6 text-base font-medium"
							>
								Watch Live Demo
							</Button>
						</div>

						<div className="flex flex-wrap justify-center gap-8 mt-8 mx-4 sm:mx-6 lg:mx-16">
							<div className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
								<div className="text-3xl font-bold text-primary">300%</div>
								<div className="text-sm text-muted-foreground mt-1">
									Sales Boost
								</div>
							</div>
							<div className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
								<div className="text-3xl font-bold text-secondary">24/7</div>
								<div className="text-sm text-muted-foreground mt-1">
									Customer Support
								</div>
							</div>
							<div className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
								<div className="text-3xl font-bold text-accent">99.9%</div>
								<div className="text-sm text-muted-foreground mt-1">Uptime</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
