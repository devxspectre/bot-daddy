"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
	{
		question: "How long does it take to set up a chatbot?",
		answer:
			"With our intuitive builder, you can set up a basic chatbot in under 5 minutes. Advanced configurations with custom workflows can take 30-60 minutes depending on complexity.",
	},
	{
		question: "Do I need technical skills to use Bot Daddy?",
		answer:
			"No technical skills are required! Our drag-and-drop interface is designed for non-technical users, though we also provide advanced options for developers.",
	},
	{
		question: "Can I integrate the chatbot with my existing tools?",
		answer:
			"Yes! We offer seamless integrations with popular CRM systems, e-commerce platforms, email marketing tools, and more than 1000+ app integrations.",
	},
	{
		question: "What languages does the chatbot support?",
		answer:
			"Our AI chatbot supports over 100 languages, allowing you to communicate with customers worldwide in their native language.",
	},
	{
		question: "Is there a limit to the number of conversations?",
		answer:
			"We offer various plans to fit your needs. Our starter plan includes 1,000 conversations per month, with unlimited options available for larger businesses.",
	},
	{
		question: "How secure is my data?",
		answer:
			"We use bank-level encryption and comply with GDPR, CCPA, and SOC 2 Type II standards. Your data is always secure and private with us.",
	},
];

export function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/10">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						Frequently Asked Questions
					</h2>
					<p className="text-xl text-muted-foreground text-pretty">
						Everything you need to know about our chatbot platform
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="border border-border rounded-xl overflow-hidden transition-all duration-300"
						>
							<button
								className="w-full flex justify-between items-center p-6 text-left bg-card hover:bg-accent/50 transition-colors"
								onClick={() => toggleFAQ(index)}
							>
								<span className="text-lg font-medium text-foreground">
									{faq.question}
								</span>
								{openIndex === index ? (
									<ChevronUp className="h-5 w-5 text-muted-foreground" />
								) : (
									<ChevronDown className="h-5 w-5 text-muted-foreground" />
								)}
							</button>
							<div
								className={`overflow-hidden transition-all duration-300 ${
									openIndex === index
										? "max-h-96 opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className="p-6 pt-0 text-muted-foreground border-t border-border">
									{faq.answer}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
