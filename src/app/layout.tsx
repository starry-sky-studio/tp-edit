import { Providers } from "@/components/providers/providers";
import { SonnerToaster } from "@/components/ui/sonner-toaster";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/css/globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
});

export const metadata: Metadata = {
	title: "tp-edit",
	description:
		"tp-edit is a modern markdown editor with real-time collaboration and AI assistance."
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					{children}
					<SonnerToaster />
				</Providers>
			</body>
		</html>
	);
}
