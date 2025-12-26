import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Lisco - Build Amazing Career Pages",
    template: "%s | Lisco"
  },
  description: "Create beautiful, customizable career pages for your company. Manage job postings and attract top talent with ease.",
  keywords: ["career pages", "job board", "recruitment", "ATS", "hiring", "careers"],
  authors: [{ name: "Lisco" }],
  creator: "Lisco",
  icons: {
    icon: "/tie.png",
    shortcut: "/tie.png",
    apple: "/tie.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Lisco",
    title: "Lisco - Build Amazing Career Pages",
    description: "Create beautiful, customizable career pages for your company. Manage job postings and attract top talent with ease.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lisco - Build Amazing Career Pages",
    description: "Create beautiful, customizable career pages for your company. Manage job postings and attract top talent with ease.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
