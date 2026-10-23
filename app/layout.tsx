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
  title: "ResQvanta AI — From Human Panic to Informed Action",
  description:
    "Universal Emergency Information & Multilingual Triage Assistant built for PromptWars × ALTA School of Technology. Powered by Google Gemini AI with English, Hindi, Marathi, and Gujarati support.",
  keywords: [
    "ResQvanta",
    "PromptWars",
    "ALTA School of Technology",
    "Hack2Skill",
    "Google Gemini",
    "Emergency Triage",
    "Disaster Response",
    "112 India",
  ],
  authors: [{ name: "Harshit Raj" }],
  openGraph: {
    title: "ResQvanta AI — From Human Panic to Informed Action",
    description:
      "Universal Multilingual Emergency Triage Assistant built for PromptWars × ALTA School of Technology.",
    type: "website",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('resqvanta_theme');
                  var theme = (saved === 'dark' || saved === 'light') ? saved : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
