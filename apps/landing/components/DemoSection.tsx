"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, MessageCircle, User, Bot } from "lucide-react";

const chatMessages = [
	{
		type: "user",
		message: "Hi, I'm looking for a new laptop for work",
		time: "2:34 PM",
	},
	{
		type: "bot",
		message:
			"I'd be happy to help you find the perfect laptop! What type of work will you be using it for?",
		time: "2:34 PM",
	},
	{
		type: "user",
		message: "Mostly design work and video editing",
		time: "2:35 PM",
	},
	{
		type: "bot",
		message:
			'Great! For design and video editing, I recommend our MacBook Pro 16" or the Dell XPS 15. Both have powerful processors and excellent displays. Would you like to see the specifications?',
		time: "2:35 PM",
	},
	{
		type: "user",
		message: "Yes, show me the MacBook Pro specs",
		time: "2:36 PM",
	},
	{
		type: "bot",
		message:
			'MacBook Pro 16" - M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display. Perfect for your needs! Current price: $2,499. Would you like to add it to cart?',
		time: "2:36 PM",
	},
];

export function DemoSection() {
	const [isVisible, setIsVisible] = useState(false);
	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		const element = document.getElementById("demo-section");
		if (element) observer.observe(element);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (currentMessageIndex < chatMessages.length) {
			timer = setTimeout(() => {
				setCurrentMessageIndex((prev) => prev + 1);
			}, 2000);
		} else {
			timer = setTimeout(() => {
				setCurrentMessageIndex(0);
			}, 3000);
		}

		return () => clearTimeout(timer);
	}, [currentMessageIndex]);

	return (
		<section
			id="demo-section"
			className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						See Your Chatbot in Action
					</h2>
					<p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
						Watch how our AI-powered chatbot engages customers, qualifies leads,
						and drives sales with natural, intelligent conversations.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className={`${isVisible ? "animate-slide-up" : "opacity-0"}`}>
						<div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
							<div className="bg-primary text-primary-foreground p-4 flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
									<Bot className="w-5 h-5" />
								</div>
								<div>
									<div className="font-semibold">Sales Assistant</div>
									<div className="text-xs opacity-80 flex items-center">
										<div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
										Online now
									</div>
								</div>
							</div>

							<div className="h-[550px] p-4 space-y-4 bg-background/50">
								{chatMessages
									.slice(0, currentMessageIndex)
									.map((msg, index) => (
										<div
											key={index}
											className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
										>
											<div
												className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
													msg.type === "user"
														? "bg-primary text-primary-foreground"
														: "bg-accent text-accent-foreground"
												}`}
											>
												<div className="flex items-center space-x-2 mb-1">
													{msg.type === "user" ? (
														<User className="w-4 h-4" />
													) : (
														<Bot className="w-4 h-4" />
													)}
													<span className="text-xs opacity-70">{msg.time}</span>
												</div>
												<p className="text-sm">{msg.message}</p>
											</div>
										</div>
									))}

								{currentMessageIndex < chatMessages.length && (() => {
									const nextMessage = chatMessages[currentMessageIndex];
									const isUserMessage = nextMessage.type === "user";
									return (
										<div className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
											<div className={`px-4 py-2 rounded-lg ${isUserMessage ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
												<div className="flex items-center space-x-2">
													{isUserMessage ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
													<div className="flex space-x-1">
														<div className="w-2 h-2 bg-current rounded-full animate-bounce" />
														<div
															className="w-2 h-2 bg-current rounded-full animate-bounce"
															style={{ animationDelay: "0.1s" }}
														/>
														<div
															className="w-2 h-2 bg-current rounded-full animate-bounce"
															style={{ animationDelay: "0.2s" }}
														/>
													</div>
												</div>
											</div>
										</div>
									);
								})()}
							</div>

							<div className="p-4 border-t border-border bg-card">
								<div className="flex items-center space-x-2">
									<div className="flex-1 bg-input rounded-lg px-3 py-2 text-sm text-muted-foreground">
										Type your message...
									</div>
									<Button size="sm" className="animate-pulse-glow">
										<MessageCircle className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div
						className={`space-y-8 ${isVisible ? "animate-fade-in-scale" : "opacity-0"}`}
						style={{ animationDelay: "0.3s" }}
					>
						<div className="text-center">
							<p className="text-sm text-muted-foreground mt-2">
								Watch a real conversation in action
							</p>
						</div>

						<div className="space-y-6">
							<div className="flex items-start space-x-4 p-4 bg-card border border-border rounded-lg">
								<div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
									<span className="text-green-500 text-sm font-bold">1</span>
								</div>
								<div>
									<h4 className="font-semibold text-foreground mb-1">
										Intelligent Understanding
									</h4>
									<p className="text-sm text-muted-foreground">
										AI analyzes customer intent and provides relevant product
										recommendations
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-4 p-4 bg-card border border-border rounded-lg">
								<div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
									<span className="text-blue-500 text-sm font-bold">2</span>
								</div>
								<div>
									<h4 className="font-semibold text-foreground mb-1">
										Personalized Responses
									</h4>
									<p className="text-sm text-muted-foreground">
										Tailored suggestions based on customer needs and preferences
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-4 p-4 bg-card border border-border rounded-lg">
								<div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
									<span className="text-purple-500 text-sm font-bold">3</span>
								</div>
								<div>
									<h4 className="font-semibold text-foreground mb-1">
										Seamless Conversion
									</h4>
									<p className="text-sm text-muted-foreground">
										Guides customers from inquiry to purchase with natural
										conversation flow
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
