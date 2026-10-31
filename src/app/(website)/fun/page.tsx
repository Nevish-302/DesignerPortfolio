"use client";

import Link from "next/link";
import Matter from "matter-js";
import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";

const INK = "#0b0b0f";
const GOLD = "#f5b82e";
const CORAL = "#ff5b2e";
const PAPER = "#f4f1ea";

let sound = false;
let actx: AudioContext | null = null;
function blip(f = 440, d = 0.08, type: OscillatorType = "sine", g = 0.05) {
	if (!sound) return;
	if (!actx) actx = new AudioContext();
	const o = actx.createOscillator();
	const v = actx.createGain();
	o.type = type;
	o.frequency.value = f;
	v.gain.setValueAtTime(g, actx.currentTime);
	v.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d);
	o.connect(v);
	v.connect(actx.destination);
	o.start();
	o.stop(actx.currentTime + d);
}

const WORDS = ["NEVISH", "BUILDS", "THINGS", "PLAY"];

/* ------------------------------------------------------------------ */
/* 1. Particle type: text made of dots that flee the cursor, click to  */
/*    explode, then they spring back and morph into the next word.      */
/* ------------------------------------------------------------------ */
type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; text: boolean };

function ParticleHero() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const labelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const family = getComputedStyle(document.body).fontFamily;
		const mouse = { x: -9999, y: -9999 };
		let w = 0,
			h = 0,
			raf = 0,
			dead = false,
			word = 0,
			ps: P[] = [];

		// 8 colour steps from lime (calm) to coral (fast)
		const colors = Array.from({ length: 8 }, (_, i) => {
			const t = i / 7;
			return `rgb(${Math.round(245 + 10 * t)},${Math.round(184 - 93 * t)},46)`;
		});

		const sample = (text: string) => {
			const off = document.createElement("canvas");
			off.width = w;
			off.height = h;
			const c = off.getContext("2d")!;
			let size = Math.min(h * 0.45, w * 0.5);
			c.font = `${size}px ${family}`;
			size = Math.min(size, (size * w * 0.86) / c.measureText(text).width);
			c.font = `${size}px ${family}`;
			c.textAlign = "center";
			c.textBaseline = "middle";
			c.fillStyle = "#fff";
			c.fillText(text, w / 2, h / 2);
			const gap = w < 640 ? 4 : 5;
			const data = c.getImageData(0, 0, w, h).data;
			const pts: [number, number][] = [];
			for (let y = 0; y < h; y += gap)
				for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
			for (let i = pts.length - 1; i > 0; i--) {
				const j = (Math.random() * (i + 1)) | 0;
				[pts[i], pts[j]] = [pts[j], pts[i]];
			}
			return pts;
		};

		const setWord = (i: number) => {
			word = i % WORDS.length;
			if (labelRef.current) labelRef.current.textContent = `0${word + 1} / 0${WORDS.length}`;
			const pts = sample(WORDS[word]);
			while (ps.length < pts.length + 350)
				ps.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: 0, ty: 0, text: false });
			ps.length = pts.length + 350;
			ps.forEach((p, k) => {
				if (k < pts.length) {
					[p.tx, p.ty] = pts[k];
					p.text = true;
				} else {
					p.tx = Math.random() * w;
					p.ty = Math.random() * h;
					p.text = false;
				}
			});
		};

		const resize = () => {
			const r = canvas.getBoundingClientRect();
			w = Math.floor(r.width);
			h = Math.floor(r.height);
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.fillStyle = INK;
			ctx.fillRect(0, 0, w, h);
			setWord(word);
		};

		const tick = () => {
			ctx.globalAlpha = 1;
			ctx.fillStyle = "rgba(11,11,15,0.3)";
			ctx.fillRect(0, 0, w, h);
			for (const p of ps) {
				let ax = (p.tx - p.x) * 0.055;
				let ay = (p.ty - p.y) * 0.055;
				const dx = p.x - mouse.x;
				const dy = p.y - mouse.y;
				const d2 = dx * dx + dy * dy;
				if (d2 < 19600) {
					const d = Math.sqrt(d2) || 1;
					const f = (140 - d) / 140;
					ax += (dx / d) * f * 7;
					ay += (dy / d) * f * 7;
				}
				p.vx = (p.vx + ax) * 0.86;
				p.vy = (p.vy + ay) * 0.86;
				p.x += p.vx;
				p.y += p.vy;
				const level = Math.min(7, ((Math.abs(p.vx) + Math.abs(p.vy)) / 1.6) | 0);
				ctx.fillStyle = colors[level];
				ctx.globalAlpha = p.text ? 1 : 0.35;
				const s = p.text ? 2.4 : 1.3;
				ctx.fillRect(p.x, p.y, s, s);
			}
			if (!dead) raf = requestAnimationFrame(tick);
		};

		const move = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			mouse.x = e.clientX - r.left;
			mouse.y = e.clientY - r.top;
		};
		const leave = () => {
			mouse.x = mouse.y = -9999;
		};
		const down = () => {
			blip(90, 0.3, "sawtooth", 0.08);
			for (const p of ps) {
				const a = Math.random() * Math.PI * 2;
				const s = 8 + Math.random() * 16;
				p.vx = Math.cos(a) * s;
				p.vy = Math.sin(a) * s;
			}
			setWord(word + 1);
		};

		document.fonts.ready.then(() => {
			if (dead) return;
			resize();
			tick();
		});
		const auto = setInterval(() => setWord(word + 1), 6000);
		window.addEventListener("resize", resize);
		canvas.addEventListener("pointermove", move);
		canvas.addEventListener("pointerleave", leave);
		canvas.addEventListener("pointerdown", down);
		return () => {
			dead = true;
			cancelAnimationFrame(raf);
			clearInterval(auto);
			window.removeEventListener("resize", resize);
			canvas.removeEventListener("pointermove", move);
			canvas.removeEventListener("pointerleave", leave);
			canvas.removeEventListener("pointerdown", down);
		};
	}, []);

	return (
		<section className="relative h-screen w-full overflow-hidden">
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
			<p className="pointer-events-none absolute left-6 top-24 font-mono text-xs tracking-[0.3em] text-white/50">
				FUN LAB / <span ref={labelRef}>01 / 04</span>
			</p>
			<p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center font-mono text-xs tracking-[0.3em] text-white/50">
				MOVE TO DISTURB · CLICK TO EXPLODE · SCROLL ↓
			</p>
		</section>
	);
}

/* ------------------------------------------------------------------ */
/* 2. Marquees whose speed and skew react to scroll velocity.          */
/* ------------------------------------------------------------------ */
function Marquees({ scroller }: { scroller: RefObject<HTMLDivElement> }) {
	const rows = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const el = scroller.current!;
		let last = el.scrollTop,
			vel = 0,
			raf = 0;
		const x = [0, 0];
		const tick = () => {
			const dv = el.scrollTop - last;
			last = el.scrollTop;
			vel += (dv - vel) * 0.1;
			rows.current.forEach((row, i) => {
				if (!row) return;
				const half = row.scrollWidth / 2;
				const dir = i ? 1 : -1;
				x[i] += dir * (0.8 + Math.abs(vel) * 0.5);
				if (x[i] <= -half) x[i] += half;
				if (x[i] > 0) x[i] -= half;
				const skew = Math.max(-18, Math.min(18, vel * -0.8));
				row.style.transform = `translate3d(${x[i]}px,0,0) skewX(${skew}deg)`;
			});
			raf = requestAnimationFrame(tick);
		};
		tick();
		return () => cancelAnimationFrame(raf);
	}, [scroller]);

	const line = "FLUTTER ✦ REACT ✦ NODE ✦ GEMINI ✦ WHISPER ✦ PAYMENTS ✦ ";
	return (
		<section className="overflow-hidden py-[12vh]" style={{ background: PAPER }}>
			{[0, 1].map((i) => (
				<div
					key={i}
					ref={(n) => {
						rows.current[i] = n;
					}}
					className="flex w-max whitespace-nowrap text-[16vw] leading-[0.95] will-change-transform"
					style={
						i
							? { WebkitTextStroke: `2px ${INK}`, color: "transparent" }
							: { color: INK }
					}
				>
					<span>{line.repeat(2)}</span>
					<span>{line.repeat(2)}</span>
				</div>
			))}
		</section>
	);
}

/* ------------------------------------------------------------------ */
/* 3. Flashlight: a coloured world hidden under a dull one. Hold to    */
/*    widen the beam.                                                  */
/* ------------------------------------------------------------------ */
function Flashlight() {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = ref.current!;
		const t = { x: el.clientWidth / 2, y: el.clientHeight / 2, r: 150 };
		const c = { ...t };
		let raf = 0;
		const tick = () => {
			c.x += (t.x - c.x) * 0.12;
			c.y += (t.y - c.y) * 0.12;
			c.r += (t.r - c.r) * 0.1;
			el.style.setProperty("--x", `${c.x}px`);
			el.style.setProperty("--y", `${c.y}px`);
			el.style.setProperty("--r", `${c.r}px`);
			raf = requestAnimationFrame(tick);
		};
		tick();
		const move = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			t.x = e.clientX - r.left;
			t.y = e.clientY - r.top;
		};
		const down = () => {
			t.r = 380;
			blip(180, 0.25, "triangle", 0.06);
		};
		const up = () => (t.r = 150);
		el.addEventListener("pointermove", move);
		el.addEventListener("pointerdown", down);
		window.addEventListener("pointerup", up);
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerdown", down);
			window.removeEventListener("pointerup", up);
		};
	}, []);

	const text =
		"flex h-full items-center justify-center px-6 text-center text-[13vw] leading-[0.9] sm:text-[11vw]";
	const mask = "radial-gradient(circle var(--r) at var(--x) var(--y), #000 98%, transparent 100%)";
	return (
		<section
			ref={ref}
			className="relative h-screen select-none overflow-hidden"
			style={{ background: INK }}
		>
			<div className={text} style={{ color: "#23232b" }}>
				I WRITE SERIOUS SOFTWARE
			</div>
			<div
				className={`${text} absolute inset-0`}
				style={{
					background: `conic-gradient(from 200deg at 50% 50%, ${CORAL}, ${GOLD}, #ff9ec4, #4d6bff, ${CORAL})`,
					color: INK,
					maskImage: mask,
					WebkitMaskImage: mask,
				}}
			>
				I MAKE STRANGE LITTLE WORLDS
			</div>
			<p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center font-mono text-xs tracking-[0.3em] text-white/50">
				HOLD TO WIDEN THE LIGHT
			</p>
		</section>
	);
}

/* ------------------------------------------------------------------ */
/* 4. Tilt cards with a glare that follows the pointer.                */
/* ------------------------------------------------------------------ */
const toys: { n: string; title: string; tag: string; from: string; to: string; href: string; shot: string }[] = [
	{ n: "01", title: "Crumb Count", tag: "Calories that show their work", from: "#ffb347", to: "#ff5e62", href: "https://crumbcount.vercel.app", shot: "/shots/crumbcount-m.png" },
	{ n: "02", title: "aravaa", tag: "Brew it. Log it. Repeat.", from: "#3b2314", to: "#c68b59", href: "https://aravaa.com", shot: "/shots/aravaa-m.png" },
	{ n: "03", title: "orithLabs", tag: "A studio site that takes leads", from: "#2a1aff", to: "#00e0ff", href: "https://orithlabs.in", shot: "/shots/orithlabs-m.png" },
	{ n: "04", title: "RouteCraft", tag: "AI trips tuned to your personality", from: "#7a5cff", to: "#4d6bff", href: "/projects", shot: "" },
];

function Card({ c }: { c: (typeof toys)[number] }) {
	const ref = useRef<HTMLAnchorElement>(null);
	const move = (e: React.PointerEvent) => {
		const el = ref.current!;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 18}deg) rotateX(${(0.5 - py) * 18}deg) scale(1.03)`;
		el.style.setProperty("--gx", `${px * 100}%`);
		el.style.setProperty("--gy", `${py * 100}%`);
	};
	return (
		<Link
			ref={ref}
			href={c.href}
			target={c.href.startsWith("http") ? "_blank" : undefined}
			onPointerMove={move}
			onPointerEnter={() => blip(520, 0.07, "triangle")}
			onPointerLeave={() => (ref.current!.style.transform = "")}
			className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl transition-transform duration-200 will-change-transform"
			style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})`, color: PAPER }}
		>
			<div className="relative min-h-0 flex-1 overflow-hidden">
				{c.shot && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={c.shot}
						alt={`${c.title} screenshot`}
						className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
					/>
				)}
				<span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-xs tracking-[0.3em] backdrop-blur">
					{c.n}
				</span>
			</div>
			<div className="p-5">
				<h3 className="text-5xl leading-[0.85]">{c.title}</h3>
				<p className="mt-2 font-mono text-xs tracking-widest opacity-90">{c.tag}</p>
			</div>
			<span
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{ background: "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,.28), transparent 55%)" }}
			/>
		</Link>
	);
}

const GLYPHS = "!<>-_/[]{}=+*^?#";
function Scramble({ text }: { text: string }) {
	const [out, setOut] = useState(text);
	const timer = useRef<ReturnType<typeof setInterval>>();
	const run = () => {
		clearInterval(timer.current);
		let f = 0;
		timer.current = setInterval(() => {
			f++;
			setOut(
				text
					.split("")
					.map((ch, i) => (ch === " " || i < f / 2 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
					.join("")
			);
			if (f / 2 >= text.length) clearInterval(timer.current);
		}, 35);
	};
	useEffect(() => {
		run();
		return () => clearInterval(timer.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <span onPointerEnter={run}>{out}</span>;
}

/* Pinned horizontal reel: vertical scroll drives sideways travel. */
function Toys({ scroller }: { scroller: RefObject<HTMLDivElement> }) {
	const section = useRef<HTMLElement>(null);
	const track = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: section,
		container: scroller,
		offset: ["start start", "end end"],
	});
	const x = useTransform(scrollYProgress, (p) =>
		track.current ? -p * (track.current.scrollWidth - window.innerWidth) : 0
	);
	const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

	return (
		<section ref={section} className="relative h-[400vh]" style={{ background: INK }}>
			<div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
				<motion.div ref={track} style={{ x }} className="flex w-max items-center gap-[5vw] px-[6vw] will-change-transform">
					<h2 className="w-[80vw] shrink-0 text-[22vw] leading-[0.85] sm:w-[48vw] sm:text-[12vw]" style={{ color: PAPER }}>
						<Scramble text="SELECTED" /> <span style={{ color: GOLD }}><Scramble text="TOYS" /></span>
					</h2>
					{toys.map((c) => (
						<div key={c.n} className="w-[78vw] shrink-0 sm:w-[30vw]">
							<Card c={c} />
						</div>
					))}
				</motion.div>
				<div className="absolute bottom-10 left-[6vw] right-[6vw] h-px bg-white/20">
					<motion.div className="h-px" style={{ width: bar, background: GOLD }} />
				</div>
				<p className="absolute bottom-14 left-[6vw] font-mono text-xs tracking-[0.3em] text-white/50">SCROLL →</p>
			</div>
		</section>
	);
}

/* ------------------------------------------------------------------ */
/* 5. Experience: panels stack on top of each other as you scroll.      */
/* ------------------------------------------------------------------ */
const jobs = [
	{
		co: "MadeEasy",
		role: "Software Engineer",
		when: "DEC 2024 TO NOW",
		year: "2024",
		bg: GOLD,
		tech: ["Node.js", "Redis", "RabbitMQ", "Whisper", "Gemini", "Juspay"],
		points: [
			"Built the answer-sheet evaluation platform from day one: evaluator and reviewer RBAC, org-scoped privileges, freelancer payouts, a collaborative PDF annotation canvas.",
			"Architected DART: paper generation, objective and subjective grading, Redis caching, CleverTap analytics, LLM auto-grading with a manual-review fallback.",
			"Led the payments portal: Juspay, CCAvenue and HDFC, GST-compliant invoices, EMI plans, refunds, course transfers.",
			"Built a video-to-notes pipeline: Whisper over RabbitMQ, then LLM-generated chunks, notes, topics and tags in the admin CMS.",
		],
	},
	{
		co: "Google Summer of Code",
		role: "Contributor · Liquid Galaxy",
		when: "MAY TO AUG 2024",
		year: "2024",
		bg: CORAL,
		tech: ["Flutter", "Google Earth", "Python", "Docker", "Gemma", "Gemini"],
		points: [
			"Worked with the Liquid Galaxy team and mentors on a Flutter app driving Google Earth.",
			"Shipped a work product submission, published on the Liquid Galaxy blog.",
		],
	},
	{
		co: "AmazedIT",
		role: "Full Stack Intern",
		when: "OCT TO DEC 2023",
		year: "2023",
		bg: PAPER,
		tech: ["Laravel", "Flutter", "MQTT", "OneSignal", "Google APIs"],
		points: [
			"Built a taxi service product: Laravel backend and admin panel, Flutter apps for riders and drivers.",
			"Wired in live updates over MQTT, push notifications with OneSignal and Google APIs.",
		],
	},
	{
		co: "Freelance",
		role: "MERN · Flutter · PHP",
		when: "SEP 2023 TO NOW",
		year: "2023",
		bg: "#4d6bff",
		tech: ["MERN", "Flutter", "PHP"],
		points: [
			"Flutter apps, including a company's internal payments app.",
			"A jewelry brand, frontend and backend.",
			"A property-selling website, frontend and backend.",
		],
	},
];

/* Pinned chapter: scroll picks the job, the whole screen floods to its colour. */
function Experience({ scroller }: { scroller: RefObject<HTMLDivElement> }) {
	const section = useRef<HTMLElement>(null);
	const [i, setI] = useState(0);
	const { scrollYProgress } = useScroll({
		target: section,
		container: scroller,
		offset: ["start start", "end end"],
	});
	useMotionValueEvent(scrollYProgress, "change", (p) =>
		setI(Math.max(0, Math.min(jobs.length - 1, Math.floor(p * jobs.length))))
	);
	const goTo = (n: number) =>
		scroller.current?.scrollTo({
			top: section.current!.offsetTop + n * window.innerHeight + 2,
			behavior: "smooth",
		});
	const j = jobs[i];
	useEffect(() => {
		blip(260 + i * 110, 0.18, "square", 0.03);
	}, [i]);

	return (
		<>
			<section className="px-4 pb-[6vh] pt-[14vh] sm:px-6" style={{ background: INK }}>
				<h2 className="mx-auto max-w-6xl text-[16vw] leading-[0.85] sm:text-[10vw]" style={{ color: PAPER }}>
					<Scramble text="THE WORK" /> <span style={{ color: GOLD }}>BEHIND IT</span>
				</h2>
			</section>
			<section ref={section} className="relative" style={{ height: `${jobs.length * 100}vh` }}>
				<motion.div
					className="sticky top-0 h-screen overflow-hidden"
					animate={{ backgroundColor: j.bg }}
					transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
					style={{ color: INK }}
				>
					{/* ghost year */}
					<AnimatePresence mode="wait">
						<motion.p
							key={j.year + i}
							initial={{ y: 120, opacity: 0 }}
							animate={{ y: 0, opacity: 0.12 }}
							exit={{ y: -120, opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="pointer-events-none absolute -bottom-[4vw] right-[-1vw] text-[38vw] leading-none"
						>
							{j.year}
						</motion.p>
					</AnimatePresence>

					<div className="relative mx-auto grid h-full max-w-[1500px] grid-cols-1 items-center gap-6 px-6 pb-16 pt-24 sm:grid-cols-[1.1fr_1fr] sm:px-12">
						{/* index of names */}
						<div className="flex flex-col">
							{jobs.map((x, k) => (
								<button
									key={x.co}
									onClick={() => goTo(k)}
									className="group flex items-baseline gap-4 text-left transition-all duration-500"
									style={{
										opacity: k === i ? 1 : 0.22,
										transform: k === i ? "translateX(1.5vw)" : "none",
									}}
								>
									<span className="font-mono text-xs tracking-[0.25em]">0{k + 1}</span>
									<span className="text-[11vw] leading-[0.95] group-hover:opacity-60 sm:text-[5.6vw]">{x.co}</span>
								</button>
							))}
						</div>

						{/* details */}
						<AnimatePresence mode="wait">
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -30 }}
								transition={{ duration: 0.4 }}
								className="max-h-full overflow-hidden"
							>
								<div className="flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3 font-mono text-xs tracking-[0.25em]" style={{ borderColor: INK }}>
									<span>{j.role.toUpperCase()}</span>
									<span>{j.when}</span>
								</div>
								<ul className="mt-5 space-y-3 font-sans text-sm normal-case leading-snug sm:text-base lg:text-lg">
									{j.points.map((t, k) => (
										<motion.li
											key={t}
											initial={{ opacity: 0, x: 40 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.15 + k * 0.1, duration: 0.5 }}
											className="flex gap-3"
										>
											<span>✦</span>
											<span>{t}</span>
										</motion.li>
									))}
								</ul>
								<div className="mt-6 flex flex-wrap gap-2">
									{j.tech.map((t, k) => (
										<motion.span
											key={t}
											initial={{ opacity: 0, scale: 0.6 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.5 + k * 0.05, type: "spring", stiffness: 300, damping: 18 }}
											className="rounded-full border-2 px-3 py-1 font-mono text-[11px] tracking-[0.2em]"
											style={{ borderColor: INK }}
										>
											{t.toUpperCase()}
										</motion.span>
									))}
								</div>
							</motion.div>
						</AnimatePresence>
					</div>

					{/* progress */}
					<div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 font-mono text-xs tracking-[0.25em] sm:left-12 sm:right-12">
						<span>0{i + 1} / 0{jobs.length}</span>
						<div className="h-[2px] flex-1" style={{ background: "rgba(11,11,15,.2)" }}>
							<motion.div className="h-full origin-left" style={{ scaleX: scrollYProgress, background: INK }} />
						</div>
						<span>SCROLL ↓</span>
					</div>
				</motion.div>
			</section>
		</>
	);
}

/* ------------------------------------------------------------------ */
/* 6. Numbers that count up, and the toolkit as bouncy chips.           */
/* ------------------------------------------------------------------ */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.6 });
	const [v, setV] = useState(0);
	useEffect(() => {
		if (!inView) return;
		const a = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (n) => setV(Math.round(n)) });
		return () => a.stop();
	}, [inView, to]);
	return (
		<span ref={ref}>
			{v}
			{suffix}
		</span>
	);
}

const stats = [
	{ n: 2, s: "+", label: "YEARS SHIPPING" },
	{ n: 3, s: "", label: "HACKATHON PODIUMS" },
	{ n: 4, s: "", label: "PAYMENT GATEWAYS" },
	{ n: 1, s: "", label: "PAPER AT IIT GUWAHATI" },
];

const toolkit: [string, string[]][] = [
	["Backend", ["Node.js", "Express", "GraphQL", "Laravel", "Flask", "REST APIs", "Microservices"]],
	["Frontend", ["React", "Flutter", "Tailwind", "Bootstrap", "HTML", "CSS/SCSS"]],
	["Data & Infra", ["MySQL", "MongoDB", "Redis", "BigQuery", "Firebase", "AWS", "RabbitMQ", "Docker", "Sockets", "MQTT"]],
	["AI / LLM", ["Gemini", "Gemma", "Whisper", "LLM evaluation", "Prompt engineering"]],
	["Languages", ["JavaScript", "SQL", "Python", "PHP", "Dart", "C", "C++"]],
	["Tools", ["Git", "Postman", "NPM", "VS Code", "Android Studio", "Figma", "CleverTap", "OneSignal"]],
];

function Numbers() {
	return (
		<section className="px-6 py-[14vh]" style={{ background: PAPER, color: INK }}>
			<div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-12 sm:grid-cols-4">
				{stats.map((st) => (
					<div key={st.label}>
						<p className="text-[22vw] leading-[0.8] sm:text-[9vw]">
							<Counter to={st.n} suffix={st.s} />
						</p>
						<p className="mt-2 font-mono text-xs tracking-[0.25em]">{st.label}</p>
					</div>
				))}
			</div>
			<div className="mx-auto mt-[12vh] grid max-w-6xl gap-6 border-t-2 pt-8 font-mono text-xs tracking-[0.2em] sm:grid-cols-2" style={{ borderColor: INK }}>
				<p>EDUCATION: BTECH CSE (DATA SCIENCE), JSS ACADEMY OF TECHNICAL EDUCATION · 2021 TO PRESENT</p>
				<p>RESEARCH: RIC&apos;24, IIT GUWAHATI: DEEP LEARNING FOR KNOWLEDGE RETENTION IN CHILDREN UNDER SIX WITH DYSLEXIA</p>
			</div>
		</section>
	);
}

/* Toolkit playground: floating chips you can grab and throw around. */
const groupColors = [GOLD, CORAL, "#4d6bff", "#ff9ec4", "#c9b6ff", PAPER];

function Toolkit() {
	const stage = useRef<HTMLDivElement>(null);
	const els = useRef<(HTMLDivElement | null)[]>([]);
	const bodies = useRef<Matter.Body[]>([]);
	const [group, setGroup] = useState<number | null>(null);
	const inView = useInView(stage, { amount: 0.3 });
	const live = useRef(false);
	live.current = inView;
	let n = 0;
	const chips = toolkit.flatMap(([, items], gi) => items.map((t) => ({ t, gi, k: n++ })));

	useEffect(() => {
		const el = stage.current!;
		const { Engine, Bodies, Body, Composite, Events, Mouse, MouseConstraint } = Matter;
		const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
		const W = () => el.clientWidth;
		const H = () => el.clientHeight;
		const wall = (x: number, y: number, w: number, h: number) => Bodies.rectangle(x, y, w, h, { isStatic: true });
		const floor = wall(W() / 2, H() + 30, 6000, 60);
		const left = wall(-30, H() / 2, 60, 6000);
		const right = wall(W() + 30, H() / 2, 60, 6000);
		const size = chips.map((_, k) => [els.current[k]!.offsetWidth, els.current[k]!.offsetHeight]);
		const bs = chips.map((_, k) =>
			Bodies.rectangle(60 + Math.random() * Math.max(1, W() - 120), -80 - k * 70, size[k][0], size[k][1], {
				chamfer: { radius: size[k][1] / 2 },
				restitution: 0.35,
				friction: 0.3,
				frictionAir: 0.01,
			})
		);
		bodies.current = bs;
		Composite.add(engine.world, [floor, left, right]);

		let mc: Matter.MouseConstraint | null = null;
		if (!("ontouchstart" in window)) {
			const mouse = Mouse.create(el);
			const m = mouse as unknown as { mousewheel: EventListener };
			el.removeEventListener("wheel", m.mousewheel);
			el.removeEventListener("mousewheel", m.mousewheel);
			el.removeEventListener("DOMMouseScroll", m.mousewheel);
			mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
			Composite.add(engine.world, mc);
		}
		Events.on(engine, "collisionStart", () => blip(140 + Math.random() * 220, 0.04, "sine", 0.02));

		const ro = new ResizeObserver(() => {
			Body.setPosition(floor, { x: W() / 2, y: H() + 30 });
			Body.setPosition(left, { x: -30, y: H() / 2 });
			Body.setPosition(right, { x: W() + 30, y: H() / 2 });
		});
		ro.observe(el);

		let added = false;
		let last = performance.now();
		let raf = 0;
		const tick = (t: number) => {
			if (live.current) {
				if (!added) {
					added = true;
					Composite.add(engine.world, bs);
					els.current.forEach((e) => e && (e.style.visibility = "visible"));
				}
				Engine.update(engine, Math.min(32, t - last));
				bs.forEach((b, k) => {
					els.current[k]!.style.transform = `translate(${b.position.x - size[k][0] / 2}px,${b.position.y - size[k][1] / 2}px) rotate(${b.angle}rad)`;
				});
			}
			last = t;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			if (mc) Mouse.clearSourceEvents(mc.mouse);
			Composite.clear(engine.world, false);
			Engine.clear(engine);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pop = (gi: number) => {
		setGroup(group === gi ? null : gi);
		blip(300 + gi * 80, 0.12, "triangle");
		chips.forEach((c, k) => {
			if (c.gi === gi) Matter.Body.setVelocity(bodies.current[k], { x: (Math.random() - 0.5) * 8, y: -14 });
		});
	};

	return (
		<section className="py-[12vh]" style={{ background: INK, color: PAPER }}>
			<div className="mx-auto max-w-6xl px-6">
				<h2 className="text-[16vw] leading-[0.85] sm:text-[10vw]">
					<Scramble text="TOOLKIT" />
				</h2>
				<p className="mt-4 font-mono text-xs tracking-[0.25em] text-white/50">GRAB ANYTHING, THROW IT, TAP A GROUP TO MAKE IT JUMP</p>
				<div className="mt-6 flex flex-wrap gap-2">
					{toolkit.map(([g], gi) => (
						<button
							key={g}
							onClick={() => pop(gi)}
							className="rounded-full border-2 px-4 py-1 font-mono text-xs tracking-[0.2em] transition-colors"
							style={{
								borderColor: groupColors[gi],
								background: group === gi ? groupColors[gi] : "transparent",
								color: group === gi ? INK : groupColors[gi],
							}}
						>
							{g.toUpperCase()}
						</button>
					))}
				</div>
			</div>
			<div
				ref={stage}
				className="relative mx-3 mt-10 h-[85vh] cursor-grab touch-pan-y overflow-hidden rounded-3xl border border-white/10 active:cursor-grabbing sm:mx-6"
			>
				{chips.map(({ t, gi, k }) => (
					<div
						key={t}
						ref={(e) => {
							els.current[k] = e;
						}}
						className="pointer-events-none absolute left-0 top-0 select-none whitespace-nowrap rounded-full px-5 py-2 text-3xl will-change-transform sm:text-4xl"
						style={{
							visibility: "hidden",
							background: groupColors[gi],
							color: INK,
							opacity: group === null || group === gi ? 1 : 0.15,
							transition: "opacity .4s",
						}}
					>
						{t}
					</div>
				))}
			</div>
		</section>
	);
}

/* Glowing trail that follows the pointer across the whole experience. */
function Trail() {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const c = ref.current!;
		const ctx = c.getContext("2d")!;
		const pts: { x: number; y: number; t: number }[] = [];
		const size = () => {
			c.width = window.innerWidth;
			c.height = window.innerHeight;
		};
		size();
		const mv = (e: PointerEvent) => pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
		let raf = 0;
		const tick = () => {
			ctx.clearRect(0, 0, c.width, c.height);
			const now = performance.now();
			while (pts.length && now - pts[0].t > 450) pts.shift();
			ctx.lineCap = "round";
			for (let i = 1; i < pts.length; i++) {
				const a = 1 - (now - pts[i].t) / 450;
				ctx.strokeStyle = `rgba(245,184,46,${a * 0.9})`;
				ctx.lineWidth = a * 12;
				ctx.beginPath();
				ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
				ctx.lineTo(pts[i].x, pts[i].y);
				ctx.stroke();
			}
			raf = requestAnimationFrame(tick);
		};
		tick();
		window.addEventListener("pointermove", mv);
		window.addEventListener("resize", size);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("pointermove", mv);
			window.removeEventListener("resize", size);
		};
	}, []);
	return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-[5] mix-blend-difference" />;
}

/* Chapter dots on the right edge; click to jump. */
function Chapters({ scroller }: { scroller: RefObject<HTMLDivElement> }) {
	const [names, setNames] = useState<string[]>([]);
	const [active, setActive] = useState(0);
	useEffect(() => {
		const el = scroller.current!;
		const secs = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
		setNames(secs.map((x) => x.dataset.chapter!));
		const on = () => {
			const mid = el.scrollTop + el.clientHeight / 2;
			let k = 0;
			secs.forEach((x, i) => {
				if (x.offsetTop <= mid) k = i;
			});
			setActive(k);
		};
		on();
		el.addEventListener("scroll", on, { passive: true });
		return () => el.removeEventListener("scroll", on);
	}, [scroller]);
	const jump = (k: number) => {
		const x = scroller.current!.querySelectorAll<HTMLElement>("[data-chapter]")[k];
		scroller.current!.scrollTo({ top: x.offsetTop, behavior: "smooth" });
	};
	return (
		<div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-3 text-white mix-blend-difference sm:flex">
			{names.map((nm, k) => (
				<button key={nm} onClick={() => jump(k)} className="group flex items-center gap-3 font-mono text-[10px] tracking-[0.25em]">
					<span className={`transition-opacity ${k === active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>{nm}</span>
					<span
						className="block rounded-full bg-white transition-all"
						style={{ width: k === active ? 28 : 8, height: 8 }}
					/>
				</button>
			))}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* 7. Outro: letters that hop when you touch them.                     */
/* ------------------------------------------------------------------ */
function Outro() {
	return (
		<section
			className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-[10vh] text-center"
			style={{ background: GOLD, color: INK }}
		>
			<h2 className="flex text-[28vw] leading-[0.8] sm:text-[22vw]">
				{"SAY HI".split("").map((ch, i) => (
					<span
						key={i}
						className="inline-block whitespace-pre transition-transform duration-300 ease-out hover:-translate-y-[0.18em] hover:rotate-[-8deg]"
					>
						{ch}
					</span>
				))}
			</h2>
			<a
				href="mailto:shiven302@gmail.com"
				className="rounded-full px-10 py-5 font-mono text-sm tracking-[0.3em] transition-transform hover:scale-110"
				style={{ background: INK, color: GOLD }}
			>
				SHIVEN302@GMAIL.COM
			</a>
			<div className="flex gap-8 font-mono text-xs tracking-[0.3em]">
				<a href="https://github.com/Nevish-302" target="_blank">GITHUB</a>
				<a href="https://www.linkedin.com/in/nevish302/" target="_blank">LINKEDIN</a>
				<Link href="/">BACK TO SITE</Link>
			</div>
		</section>
	);
}

function Preloader() {
	const [n, setN] = useState(0);
	const [gone, setGone] = useState(false);
	useEffect(() => {
		const id = setInterval(() => setN((v) => Math.min(100, v + 1 + ((Math.random() * 4) | 0))), 40);
		return () => clearInterval(id);
	}, []);
	useEffect(() => {
		if (n >= 100) {
			const t = setTimeout(() => setGone(true), 350);
			return () => clearTimeout(t);
		}
	}, [n]);
	return (
		<motion.div
			className="pointer-events-none absolute inset-0 z-[700] flex items-end justify-between p-6"
			style={{ background: GOLD, color: INK }}
			initial={{ y: 0 }}
			animate={{ y: gone ? "-100%" : 0 }}
			transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
		>
			<span className="font-mono text-xs tracking-[0.3em]">LOADING FUN</span>
			<span className="text-[32vw] leading-[0.75]">{n}</span>
		</motion.div>
	);
}

export default function Fun() {
	const scroller = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ container: scroller });
	const [snd, setSnd] = useState(false);

	return (
		<div className="fixed inset-0 z-[500]" style={{ background: INK }}>
			<Preloader />
			<div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 font-mono text-xs tracking-[0.3em] text-white mix-blend-difference">
				<Link href="/" className="pointer-events-auto">← BACK</Link>
				<button
					className="pointer-events-auto"
					onClick={() => {
						sound = !snd;
						setSnd(!snd);
						blip(660, 0.15, "triangle", 0.08);
					}}
				>
					SOUND {snd ? "ON" : "OFF"}
				</button>
			</div>
			<motion.div
				className="absolute left-0 top-0 z-10 h-1 w-full origin-left"
				style={{ scaleX: scrollYProgress, background: CORAL }}
			/>
			<Chapters scroller={scroller} />
			<div ref={scroller} className="h-full overflow-y-auto overscroll-contain">
				<div data-chapter="HELLO"><ParticleHero /></div>
				<div data-chapter="STACK"><Marquees scroller={scroller} /></div>
				<div data-chapter="LIGHT"><Flashlight /></div>
				<div data-chapter="TOYS"><Toys scroller={scroller} /></div>
				<div data-chapter="WORK"><Experience scroller={scroller} /></div>
				<div data-chapter="NUMBERS"><Numbers /></div>
				<div data-chapter="TOOLKIT"><Toolkit /></div>
				<div data-chapter="SAY HI"><Outro /></div>
			</div>
			<Trail />
		</div>
	);
}
