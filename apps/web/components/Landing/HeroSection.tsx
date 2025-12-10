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
			<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col justify-center text-center min-h-[70vh]">
					<div
						className={`transition-all duration-1000 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 max-w-full mx-4 sm:mx-6 lg:mx-16 leading-tight">
							Transform Your Business with{" "}
							<span className="relative inline-block">
								<span className="relative z-10 bg-foreground text-background px-3 -mx-2">
									Intelligent
								</span>
								<span className="absolute bottom-0 left-0 w-full h-3 bg-primary/20 z-0 -translate-y-1"></span>
							</span>{" "}
							Chatbots
						</h1>
						<div className="flex justify-center">
							<p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-5xl  sm:mx-6 lg:mx-16 text-pretty">
								Create engaging, AI-powered chatbots that convert visitors into
								customers. Boost sales by upto 200% and provide 24/7 customer
								support with our revolutionary platform.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
							<Button
								size="lg"
								className="bg-primary text-primary-foreground hover:bg-primary/90 group cursor-pointer px-8 py-6 text-base font-medium"
							>
								Start Building Now
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-border hover:bg-accent bg-transparent cursor-pointer px-8 py-6 text-base font-medium"
							>
								Watch Live Demo
							</Button>
						</div>

						<div className="flex flex-wrap justify-center gap-8 mt-8 mx-4 sm:mx-6 lg:mx-16">
							<div className="text-center">
								<div className="text-3xl font-bold text-primary">300%</div>
								<div className="text-sm text-muted-foreground mt-1">
									Sales Boost
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-primary">24/7</div>
								<div className="text-sm text-muted-foreground mt-1">
									Customer Support
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-primary">99.9%</div>
								<div className="text-sm text-muted-foreground mt-1">Uptime</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
