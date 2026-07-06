import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "https://cherryflix.vercel.app"),
  title: {
    default: "Cherryflix: Watch Anime & Movies Online | Private Streaming",
    template: "%s | Cherryflix",
  },
  description:
    "Cherryflix is your private, ad-free space to stream anime series and movies online. Invite-only access, so you can watch your favorites anywhere, on any device, anytime.",
  keywords: [
    "watch anime online",
    "anime streaming",
    "stream anime and movies",
    "ad-free anime",
    "private streaming site",
    "watch movies online",
    "anime episodes",
    "Cherryflix",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Cherryflix",
    title: "Cherryflix: Watch Anime & Movies Online",
    description:
      "Your private, ad-free space to stream anime series and movies. Invite-only, watch anywhere, anytime.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cherryflix: Watch Anime & Movies Online",
    description:
      "Your private, ad-free space to stream anime series and movies. Invite-only, watch anywhere.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
