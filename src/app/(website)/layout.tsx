import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import Header from "./header";
import Footer from "./footer";
import Cursor from "./cursor";
import { Person, WithContext } from "schema-dts";
import Script from "next/script";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
	title: "Shiven Upadhyay - Portfolio",
	description: "Full-Stack Software Engineer based in Delhi, India.",
	icons: ["favicon.svg"],
	keywords: [
		"Shiven Upadhyay",
		"Software Engineer",
		"Full-Stack Developer",
		"Engineer",
		"Developer",
		"Dhaka",
		"Bangladesh",
	],
	openGraph: {
		title: "Shiven Upadhyay - Portfolio",
		description: "Full-Stack Software Engineer based in Delhi, India.",
		images: [{ url: "https://tam11a.dev/screenshot.png" }],
		type: "website",
		countryName: "India",
		emails: ["shiven302@gmail.com"],
		phoneNumbers: ["+880 1768 161994", "+880 1521 579148"],
		siteName: "Shiven Upadhyay - Portfolio",
		url: "https://tam11a.dev",
	},
	verification: {
		google: "Z83sG39BadmJ0uyci-ndT3TCQ_sR_edLbjH43hNgRHs",
	},
};

const jsonLd: WithContext<Person> = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Shiven Upadhyay",
	additionalName: "nevish302",
	alternateName: "nevish302",
	disambiguatingDescription:
		"Full-Stack Software Engineer based in Delhi, India.",
	birthDate: "2002-11-06",
	email: "shiven302@@gmail.com",
	birthPlace: {
		"@type": "Place",
		address: {
			"@type": "PostalAddress",
			addressLocality: "Delhi",
			addressRegion: "Delhi",
			addressCountry: "India",
		},
	},
	address: {
		"@type": "PostalAddress",
		addressLocality: "Delhi",
		addressRegion: "Delhi",
		addressCountry: "India",
	},
	awards: [""],
	description: "Full-Stack Software Engineer based in Delhi, India.",
	gender: "Male",
	jobTitle: "Software Engineer",
	image: "https://tam11a.dev/tam.jpg",
	url: "https://tam11a.dev",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn(
					bebas.className,
					"cursor-none overflow-x-hidden overflow-y-auto relative"
				)}
			>
				<Header />
				{children}
				<Footer />
				<Cursor />
				{/* Add JSON-LD to your page */}
				<Script
					id="json-ld"
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				{/* ... */}
			</body>
		</html>
	);
}
