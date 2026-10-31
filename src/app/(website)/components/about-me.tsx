"use client";

import { motion } from "framer-motion";

import FadeOnScroll from "../fade-on-scroll";

export default function AboutMe() {
	return (
		<section
			id="about-me"
			className="flex flex-col justify-center min-h-svh space-y-4 max-w-4xl px-10 mx-auto"
		>
			<FadeOnScroll>
				<motion.div className="space-y-4">
					<h3 className="text-2xl tracking-[0.6rem] box">About Me</h3>
					<p className="text-4xl sm:text-6xl child-gradient box">
					I&apos;m a software engineer building <span>web and mobile products</span>,
					from <span>payment flows</span> and admin dashboards to <span>AI-powered apps</span>.
					</p>
				</motion.div>
			</FadeOnScroll>
		</section>
	);
}
