"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const SMALL = 50;
const HOVER = 88;
const PRESS = 112;
const LINKS = "a, button, .zoom-button, [role=button]";

export default function Cursor() {
	useGSAP(() => {
		if ("ontouchstart" in window) return;

		gsap.set(".cursor", { xPercent: -50, yPercent: -50, width: SMALL, height: SMALL });
		const moveX = gsap.quickTo(".cursor", "x", { duration: 0.2, ease: "power3.out" });
		const moveY = gsap.quickTo(".cursor", "y", { duration: 0.2, ease: "power3.out" });

		let hovering = false;
		const size = (s: number) =>
			gsap.to(".cursor", { width: s, height: s, duration: 0.3, ease: "power3.out" });

		const onMove = (e: MouseEvent) => {
			moveX(e.clientX);
			moveY(e.clientY);
			gsap.to(".cursor", { opacity: 1, duration: 0.2 });
			const over = !!(e.target as Element).closest?.(LINKS);
			if (over !== hovering) {
				hovering = over;
				size(over ? HOVER : SMALL);
			}
		};
		const onDown = () => size(PRESS);
		const onUp = () => size(hovering ? HOVER : SMALL);
		const onLeave = () => gsap.to(".cursor", { opacity: 0, duration: 0.2 });

		document.addEventListener("mousemove", onMove);
		document.addEventListener("mousedown", onDown);
		document.addEventListener("mouseup", onUp);
		document.documentElement.addEventListener("mouseleave", onLeave);
		return () => {
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("mouseup", onUp);
			document.documentElement.removeEventListener("mouseleave", onLeave);
		};
	}, []);

	return (
		<div className="cursor fixed top-0 left-0 mix-blend-difference bg-slate-300 opacity-0 pointer-events-none select-none rounded-full z-[10000]" />
	);
}
