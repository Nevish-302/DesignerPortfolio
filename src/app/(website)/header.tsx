"use client";
import Image from "next/image";
import Link from "next/link";
import MagneticComponent from "./magnetic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "./nav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Header() {
	const [menu, setMenu] = useState(false);
	const pathname = usePathname();
	useEffect(() => setMenu(false), [pathname]); // close menu after navigating

	useEffect(() => {
		if (menu) {
			document.body.classList.remove("overflow-y-auto");
			document.body.classList.add("overflow-y-hidden");
		} else {
			document.body.classList.remove("overflow-y-hidden");
			document.body.classList.add("overflow-y-auto");
		}
	}, [menu]);

	return (
		<header className="flex flex-row items-center justify-between max-w-7xl mx-auto px-10 py-9 sticky top-0 z-50 min-h-14 pointer-events-none [&_*]:pointer-events-auto">
			<Link href="/">
				<Image
					src="/favicon.svg"
					alt="Shiven Upadhyay"
					width={50}
					height={50}
					className="h-12 opacity-0"
				/>
			</Link>
			<MagneticComponent>
				<Link
					href="/fun"
					className="rounded-full border border-foreground/40 px-5 py-2 text-xl tracking-widest transition-colors hover:bg-foreground hover:text-background"
				>
					FUN MODE ✦
				</Link>
			</MagneticComponent>
			<AnimatePresence mode="wait">
				{!menu && (
					<MagneticComponent>
						<p
							id="me-nu"
							className={cn("text-xl p-5 zoom-button z-10 text-foreground")}
							onClick={() => setMenu((m) => !m)}
						>
							ME-NU
						</p>
					</MagneticComponent>
				)}
			</AnimatePresence>
			<AnimatePresence mode="wait">
				{menu && (
					<>
						<Nav />
						<motion.div
							className="fixed top-0 right-0 backdrop-blur-sm blur-sm h-full w-full"
							onClick={() => setMenu((m) => !m)}
						/>
					</>
				)}
			</AnimatePresence>
			{menu && (
				<MagneticComponent>
					<p
						id="me-nu"
						className={cn(
							"text-xl p-5 zoom-button z-[1000] text-background fixed right-10",
							!menu && "hidden"
						)}
						onClick={() => setMenu((m) => !m)}
					>
						CLOSE
					</p>
				</MagneticComponent>
			)}
		</header>
	);
}
