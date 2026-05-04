"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { APP_URL } from "@/config";

export function HeroSection() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
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
								Customer Service on Autopilot
							</span>
							<span className="block">
								Powered by
								<span className="relative inline-block">
									<span className="relative z-10 text-primary px-2">
										Orkesta
									</span>
								</span>
							</span>
						</h1>
						<div className="flex justify-center">
							<p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-5xl sm:mx-6 lg:mx-16 text-pretty">
								AI-powered automations managing customers 24/7. You focus on everything else.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
							<Button
								size="lg"
								className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-0 cursor-pointer px-8 py-6 text-base font-medium shadow-lg shadow-primary/25"
								onClick={() => window.location.href = `${APP_URL}/signin`}
							>
								Start Building Now
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
