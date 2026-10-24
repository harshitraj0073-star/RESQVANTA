import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0891b2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://resqvanta-ai.vercel.app"),
  title: "ResQvanta AI — From Human Panic to Informed Action",
  description:
    "Universal Multilingual Emergency Triage Assistant built for PromptWars × ALTA School of Technology. Powered by Google Gemini AI with English, Hindi, Marathi, and Gujarati support, 3D planetary telemetry, and 112 emergency dispatch packets.",
  keywords: [
    "ResQvanta",
    "ResQvanta AI",
    "PromptWars",
    "ALTA School of Technology",
    "Hack2Skill",
    "Google Gemini",
    "Emergency Triage",
    "Disaster Management",
    "112 India",
    "Civic Technology",
    "AI for Good",
  ],
  authors: [{ name: "Harshit Raj", url: "https://github.com/harshitraj0073-star" }],
  creator: "Harshit Raj",
  publisher: "ResQvanta AI",
  formatDetection: {
    telephone: true,
    email: false,
    address: true,
  },
  openGraph: {
    title: "ResQvanta AI — From Human Panic to Informed Action",
    description:
      "Universal Multilingual Emergency Information & Triage Assistant powered by Google Gemini AI. Featuring 3D planetary telemetry, sub-160-char 112 SMS dispatch packets, and 4 Indian languages.",
    url: "https://resqvanta-ai.vercel.app",
    siteName: "ResQvanta AI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResQvanta AI — Planetary Emergency Intelligence Grid",
    description:
      "Universal Multilingual Emergency Information & Triage Assistant powered by Google Gemini AI.",
    creator: "@harshitraj",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
