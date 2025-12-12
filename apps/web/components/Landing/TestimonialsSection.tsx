"use client";

import { useEffect, useState } from "react";

const testimonials = [
	{
		name: "Sarah Johnson",
		role: "CTO at TechGrowth",
		content:
			"Bot Daddy transformed our customer service. We've reduced support tickets by 70% while improving response quality.",
		avatar: "SJ",
		rating: 5,
	},
	{
		name: "Michael Chen",
		role: "Founder at StartupHub",
		content:
			"Within 30 days, our conversion rate increased by 250%. The AI understands customer needs better than our human team.",
		avatar: "MC",
		rating: 5,
	},
	{
		name: "Emily Rodriguez",
		role: "Marketing Director at RetailPro",
		content:
			"The ROI has been incredible. Our sales team is now focusing on qualified leads while the bot handles initial inquiries.",
		avatar: "ER",
		rating: 5,
	},
	{
		name: "David Kim",
		role: "E-commerce Manager at GlobalShop",
		content:
			"Deploying across all our channels was seamless. The analytics dashboard gives us insights we never had before.",
		avatar: "DK",
		rating: 5,
	},
	{
		name: "Lisa Thompson",
		role: "Customer Success at ServiceFirst",
		content:
			"Our customer satisfaction scores improved from 3.2 to 4.7 out of 5. The bot even handles complex queries we thought required humans.",
		avatar: "LT",
		rating: 5,
	},
	{
		name: "James Wilson",
		role: "CEO at QuickSolutions",
		content:
			"Setup took less than 5 minutes. We're seeing 3x more qualified leads and our team can focus on closing deals.",
		avatar: "JW",
		rating: 5,
	},
];

export function TestimonialsSection() {
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

		const element = document.getElementById("testimonials-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return (
		<section id="testimonials-section" className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						Trusted by Industry Leaders
					</h2>
					<p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
						Join thousands of businesses transforming their customer experience
						with AI
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className={`p-6 bg-card border border-border rounded-xl transition-all duration-500 ${
								isVisible ? "animate-fade-in-scale" : "opacity-0"
							}`}
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							<div className="flex mb-4">
								{[...Array(testimonial.rating)].map((_, i) => (
									<svg
										key={i}
										className="w-5 h-5 text-yellow-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>

							<p className="text-muted-foreground mb-6 text-pretty">
								&quot;{testimonial.content}&quot;
							</p>

							<div className="flex items-center">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
									{testimonial.avatar}
								</div>
								<div>
									<div className="font-semibold text-foreground">
										{testimonial.name}
									</div>
									<div className="text-sm text-muted-foreground">
										{testimonial.role}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{
					//For future when we have companies onboarded.
					/*<div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Trusted by leading companies worldwide
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-xl font-bold text-foreground/40">
              Company A
            </div>
            <div className="text-xl font-bold text-foreground/40">
              Company B
            </div>
            <div className="text-xl font-bold text-foreground/40">
              Company C
            </div>
            <div className="text-xl font-bold text-foreground/40">
              Company D
            </div>
            <div className="text-xl font-bold text-foreground/40">
              Company E
            </div>
          </div>
        </div>*/
				}
			</div>
		</section>
	);
}
