
import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import SmoothScroll from "./components/common/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Next Hire - AI Powered Job Autofill",
    template: "%s | Next Hire"
  },
  description: "Autofill job applications in seconds with Next Hire. The smartest AI assistant for your job search.",
  keywords: ["job search", "autofill", "resume", "AI", "application"],
  authors: [{ name: "Nikhil Dhanda" }],
  creator: "Nikhil Dhanda",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://next-hire-bice.vercel.app",
    title: "Next Hire - AI Powered Job Autofill",
    description: "Autofill job applications in seconds with Next Hire.",
    siteName: "Next Hire",
    images: [
      {
        url: 'https://next-hire-bice.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Next Hire Preview',
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Hire - AI Powered Job Autofill",
    description: "Autofill job applications in seconds with Next Hire.",
    creator: "@nikhildhanda",
  },
  icons: {
    icon: "/nexthire-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${poppins.variable} antialiased bg-light dark:bg-dark`}
      >
        <SmoothScroll />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
