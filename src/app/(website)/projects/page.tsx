"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeOnScroll from "../fade-on-scroll";
import StringLine from "../components/string-line";

type Project = {
	title: string;
	year: string;
	blurb: string;
	stack: string;
	live?: string;
	repo?: string;
	shot?: string;
};

const projects: Project[] = [
	{
		title: "Crumb Count",
		year: "2026",
		blurb:
			"Calorie tracking that shows its work. Log a meal by typing a sentence or snapping a photo, with 6,410 foods and Indian portions (katori, bowl, glass). Workouts are tracked against published sports-science models.",
		stack: "Flutter · Next.js · Firebase · Liquid Glass shaders",
		live: "https://crumbcount.vercel.app",
		shot: "/shots/crumbcount-m.png",
		repo: "https://github.com/Nevish-302/count-calories",
	},
	{
		title: "aravaa",
		year: "2026",
		blurb:
			"The coffee companion app. Find great coffee nearby, log every brew, time it, and get recipes that fit your gear.",
		stack: "Next.js · Firebase · Google Places",
		live: "https://aravaa.com",
		shot: "/shots/aravaa-m.png",
	},
	{
		title: "orithLabs",
		year: "2026",
		blurb:
			"Marketing site for a software development studio, with a lead form backed by Firestore and rules-tested security.",
		stack: "Next.js 16 · Tailwind 4 · Firebase",
		live: "https://orithlabs.in",
		shot: "/shots/orithlabs-m.png",
	},
	{
		title: "Our Little Worlds",
		year: "2026",
		blurb: "A small interactive web experience.",
		stack: "TypeScript · Next.js",
		live: "https://our-little-worlds.vercel.app",
		repo: "https://github.com/Nevish-302/our-little-worlds",
	},
	{
		title: "Staff Web",
		year: "2026",
		blurb:
			"Restaurant staff platform in one app: kitchen display, admin and cashier, all backed by Square Orders. Client work, source is private.",
		stack: "Next.js · Square API · Firebase",
	},
	{
		title: "Ordering Web",
		year: "2026",
		blurb:
			"Customer ordering site with table QR codes, menu, cart and checkout by card or cash at the counter. Square is the system of record, so there is no database to run.",
		stack: "Next.js · Square Web Payments · App Hosting",
	},
	{
		title: "Structures Online",
		year: "2026",
		blurb:
			"Rebuild of a steel detailing company's site off Wix, with a scroll-driven 3D steel assembly.",
		stack: "Next.js · Three.js",
	},
	{
		title: "Not A Clip Factory",
		year: "2026",
		blurb:
			"Automation that cuts captioned 9:16 clips from Creative Commons talks, with face-tracked framing, and schedules them to Instagram and Facebook Reels.",
		stack: "Node · ffmpeg · Whisper · Meta Graph API",
		repo: "https://github.com/Nevish-302/clip-factory-poster",
	},
	{
		title: "RouteCraft",
		year: "2025",
		blurb:
			"Generative-AI travel app that builds a personalized itinerary for your personality, with a single place for events and ticket purchases.",
		stack: "Flutter · Gemini · Groq · Docker",
		repo: "https://github.com/Nevish-302/routeCraft",
	},
	{
		title: "iMobi Assistant",
		year: "2024",
		blurb: "Flutter assistant app prototype.",
		stack: "Flutter · Dart",
		repo: "https://github.com/Nevish-302/iMobiAssistant",
	},
	{
		title: "Food Catering",
		year: "2025",
		blurb: "Catering storefront, built end to end.",
		stack: "JavaScript · Node",
		live: "https://food-catering-mu.vercel.app",
		repo: "https://github.com/Nevish-302/FoodCatering",
	},
	{
		title: "JataYu",
		year: "2024",
		blurb:
			"Dual-platform disaster-response system connecting organizations and troops, with live tracking, real-time updates and secure comms.",
		stack: "React · Express · Socket.io · Python · Tkinter",
		repo: "https://github.com/Nevish-302/Jatayu",
	},
	{
		title: "Noori",
		year: "2024",
		blurb: "Client project: storefront frontend and API backend.",
		stack: "React · Express · MongoDB",
		live: "https://noori-frontend.vercel.app",
		repo: "https://github.com/Nevish-302/nooriFrontend",
	},
];

export default function Projects() {
	return (
		<main className="z-10">
			<section className="max-w-4xl px-10 mx-auto pt-[10vh] pb-[8vh] space-y-4">
				<FadeOnScroll>
					<motion.div className="space-y-4">
						<h1 className="text-2xl tracking-[0.6rem]">Projects</h1>
						<p className="text-4xl sm:text-6xl child-gradient">
							Things I&apos;ve <span>built</span>, from <span>apps</span> to{" "}
							<span>studios</span>.
						</p>
					</motion.div>
				</FadeOnScroll>
			</section>

			<StringLine />
			{projects.map((p) => (
				<div key={p.title} className="pt-1 md:pt-5 group">
					<div className="grid grid-cols-7 md:gap-8 max-w-4xl mx-auto px-10 mb-5 relative z-10">
						<p className="col-span-7 md:col-span-2 mb-2 md:mb-0 text-2xl sm:text-4xl text-slate-500">
							{p.year}
						</p>
						<div className="col-span-7 md:col-span-5 space-y-2">
							{p.shot && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={p.shot}
									alt={`${p.title} screenshot`}
									className="mb-4 h-96 w-auto max-w-full rounded-2xl border border-white/10 object-cover object-top"
								/>
							)}
							<h2 className="text-4xl sm:text-6xl leading-[80%] group-hover:text-gradient transition-colors">
								{p.title}
							</h2>
							<p className="text-xl sm:text-2xl text-slate-400 normal-case">
								{p.blurb}
							</p>
							<p className="text-lg sm:text-xl tracking-widest text-gradient">
								{p.stack}
							</p>
							<div className="flex gap-6 text-2xl pt-1">
								{p.live && (
									<Link
										href={p.live}
										target="_blank"
										className="underline underline-offset-4"
									>
										Live ↗
									</Link>
								)}
							</div>
						</div>
					</div>
					<StringLine />
				</div>
			))}

			<p className="max-w-4xl px-10 mx-auto my-[10vh] text-2xl">
				More on{" "}
				<Link
					href="https://github.com/Nevish-302"
					target="_blank"
					className="underline underline-offset-4"
				>
					GitHub ↗
				</Link>
			</p>
		</main>
	);
}
