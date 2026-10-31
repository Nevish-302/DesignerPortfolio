import StringLine from "./string-line";
import FadeOnScroll from "../fade-on-scroll";
import { motion } from "framer-motion";

const items = [
	{
		title: "Research Paper at RIC'24",
		detail: "IIT Guwahati · Deep learning for knowledge retention in children with dyslexia",
	},
	{ title: "2nd Place · Design-A-Thorn", detail: "Global MLH Hackathon" },
	{ title: "2nd Place · HackMVP", detail: "Delhi University" },
	{ title: "2nd Place · HackVIPS 5.0", detail: "VIPS College" },
	{ title: "Flipkart Grid 6.0", detail: "Robotics Finalist" },
	{ title: "Workshop Lead", detail: "Git, GitHub and Flutter at GDSC College" },
];

export default function Achievements() {
	return (
		<>
			<section
				id="achievements"
				className="flex flex-col justify-center my-[20vh] space-y-4 max-w-4xl px-10 mx-auto"
			>
				<FadeOnScroll>
					<motion.div className="space-y-4">
						<h3 className="text-2xl tracking-[0.6rem]">Achievements</h3>
						<p className="text-4xl sm:text-6xl child-gradient">
							Hackathon <span>podiums</span>, a <span>published paper</span> and
							a <span>robotics</span> finals run.
						</p>
					</motion.div>
				</FadeOnScroll>
			</section>
			<section className="mb-[20vh]">
				<StringLine />
				{items.map((item) => (
					<div key={item.title}>
						<div className="w-full max-w-4xl px-10 mb-4 mx-auto">
							<p className="text-4xl sm:text-5xl leading-[80%]">{item.title}</p>
							<p className="text-gradient text-xl sm:text-2xl tracking-widest mt-2">
								{item.detail}
							</p>
						</div>
						<StringLine />
					</div>
				))}
			</section>
		</>
	);
}
