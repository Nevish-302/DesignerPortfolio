import FadeOnScroll from "../fade-on-scroll";
import { motion } from "framer-motion";

export default function Experience() {
	return (
		<section
			id="experience"
			className="flex flex-col justify-center mt-[20vh] mb-[5vh]  max-w-4xl px-10 mx-auto"
		>
			<FadeOnScroll>
				<motion.div className="space-y-4">
					<h3 className="text-2xl tracking-[0.6rem]">Experience</h3>
					<p className="text-4xl sm:text-6xl child-gradient">
					Over <span>two years</span> building production platforms at MadeEasy: answer-sheet evaluation,
					<span> payments</span>, and <span>AI-driven</span> assessment and video-to-notes pipelines.
					</p>
				</motion.div>
			</FadeOnScroll>
		</section>
	);
}
