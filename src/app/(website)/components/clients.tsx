import { cn } from "@/lib/utils";
import StringLine from "./string-line";
import { motion } from "framer-motion";
import FadeOnScroll from "../fade-on-scroll";

export default function Clients() {
	const clients: { name: string; href?: string }[] = [
		{ name: "orithLabs", href: "https://orithlabs.in" },
		{ name: "aravaa", href: "https://aravaa.com" },
		{ name: "Blue Taxi" },
		{ name: "Noori" },
		{ name: "Propmile" },
	];
	return (
		<>
			<section
				id="clients"
				className="flex flex-col justify-center my-[20vh] space-y-4 max-w-4xl px-10 mx-auto"
			>
				<FadeOnScroll>
					<motion.div className="space-y-4">
						<h3 className="text-2xl tracking-[0.6rem]">Clients</h3>
						<p className="text-4xl sm:text-6xl child-gradient">
							I worked with some <span>innovative</span> agencies and also with
							some <span>amazing</span> clients independently to build their{" "}
							<span>top-notch products</span>.
						</p>
					</motion.div>
				</FadeOnScroll>
			</section>
			<section className="mb-[20vh]">
				<StringLine />
				{clients.map((client) => (
					<div key={client.name}>
						<p className="text-4xl sm:text-6xl leading-[80%] w-full max-w-4xl px-10 mb-4 mx-auto relative z-10">
							{client.href ? (
								<a
									href={client.href}
									target="_blank"
									rel="noreferrer"
									className="hover:text-gradient"
								>
									{client.name}
								</a>
							) : (
								client.name
							)}
						</p>
						{/* <hr className="border-slate-700" /> */}
						<StringLine />
					</div>
				))}
			</section>
		</>
	);
}
