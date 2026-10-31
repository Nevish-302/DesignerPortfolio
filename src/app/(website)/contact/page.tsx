"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeOnScroll from "../fade-on-scroll";
import MagneticComponent from "../magnetic";
import StringLine from "../components/string-line";

const channels = [
	{ label: "Email", text: "shiven302@gmail.com", href: "mailto:shiven302@gmail.com" },
	{ label: "Phone", text: "+91 8800 303359", href: "tel:+918800303359" },
	{ label: "LinkedIn", text: "in/nevish302", href: "https://www.linkedin.com/in/nevish302/" },
	{ label: "GitHub", text: "Nevish-302", href: "https://github.com/Nevish-302" },
	{ label: "Instagram", text: "@nevish_302", href: "https://www.instagram.com/nevish_302/" },
];

export default function Contact() {
	return (
		<main className="z-10">
			<section className="max-w-4xl px-10 mx-auto pt-[10vh] pb-[8vh] space-y-4">
				<FadeOnScroll>
					<motion.div className="space-y-4">
						<h1 className="text-2xl tracking-[0.6rem]">Contact</h1>
						<p className="text-4xl sm:text-6xl child-gradient">
							Have something to <span>build</span>? Let&apos;s{" "}
							<span>talk</span>.
						</p>
					</motion.div>
				</FadeOnScroll>
			</section>

			<StringLine />
			{channels.map((c) => (
				<div key={c.label} className="pt-1 md:pt-5">
					<div className="grid grid-cols-7 md:gap-8 max-w-4xl mx-auto px-10 mb-5 relative z-10">
						<p className="col-span-7 md:col-span-2 mb-2 md:mb-0 text-2xl text-gradient tracking-widest">
							{c.label}
						</p>
						<div className="col-span-7 md:col-span-5">
							<MagneticComponent>
								<Link
									href={c.href}
									target="_blank"
									className="text-3xl sm:text-5xl underline underline-offset-4 normal-case"
								>
									{c.text}
								</Link>
							</MagneticComponent>
						</div>
					</div>
					<StringLine />
				</div>
			))}

			<div className="max-w-4xl px-10 mx-auto my-[10vh] space-y-4 text-xl sm:text-2xl text-slate-400 normal-case">
				<p>Delhi, India · open to full-stack and Flutter work, freelance or full-time.</p>
			</div>
		</main>
	);
}
