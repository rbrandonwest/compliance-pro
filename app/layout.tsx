import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Business Annual Report Filing | Florida Annual Reports Made Simple",
    template: "%s | Business Annual Report Filing",
  },
  description: "File your Florida annual report quickly and securely. Automated filing with Sunbiz, compliance monitoring, and registered agent services. Avoid penalties and maintain your corporate veil.",
  keywords: ["Florida annual report", "Sunbiz filing", "business compliance", "annual report filing", "Florida LLC", "corporate filing", "registered agent"],
  openGraph: {
    type: "website",
    title: "Business Annual Report Filing",
    description: "File your Florida annual report quickly and securely. Automated filing, compliance monitoring, and registered agent services.",
    siteName: "Business Annual Report Filing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Annual Report Filing",
    description: "File your Florida annual report quickly and securely.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
