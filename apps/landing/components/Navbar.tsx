"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";
import { APP_URL } from "@/config";

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`top-0 w-full z-50 py-10 transition-all duration-300 ${isScrolled
				? "bg-background/80 backdrop-blur-md border-b border-border"
				: "bg-transparent"
				}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-8">
					<div className="flex items-center">
						<img src="/Logo.png" alt="Orkesta Logo" className="h-18 w-auto" />
						<span className="text-xl font-bold text-foreground ml-2">Orkesta</span>
					</div>

					<div className="hidden md:flex items-center space-x-4">
						<Button
							className="bg-primary text-lg text-primary-foreground hover:bg-primary/90 transition-colors animate-pulse-glow cursor-pointer border-0 w-40 justify-center"
							onClick={() => {
								window.location.href = `${APP_URL}/signin`;
							}}
						>
							<span className="flex items-center gap-2">
								<span>Sign In</span>
								<ChevronRight className="h-4 w-4" />
							</span>
						</Button>
					</div>

					<div className="md:hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{isMobileMenuOpen && (
					<div className="md:hidden bg-card border border-border rounded-lg mt-2 p-4 animate-slide-up">
						<div className="flex flex-col space-y-4">
							<a
								href="#features"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								Features
							</a>
							<a
								href="#demo"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								Demo
							</a>
							<a
								href="#pricing"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								Pricing
							</a>
							<a
								href="#contact"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								Contact
							</a>
							<div className="flex flex-col space-y-2 pt-4 border-t border-border">
								<Button variant="ghost" className="justify-start" onClick={() => window.location.href = `${APP_URL}/signin`}>
									Sign In
								</Button>
								<Button className="justify-start" onClick={() => window.location.href = `${APP_URL}/signin`}>Start Building</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
