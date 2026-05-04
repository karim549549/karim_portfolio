import type { Metadata } from "next";
import { Geist, Anton } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Karim Khaled",
    default: "Karim Khaled | Digital Portfolio",
  },
  description: "A premium digital portfolio featuring interactive web experiences.",
};

// Force Static Site Generation (SSG) for the entire app for optimal performance
export const dynamic = "force-static";

import { MagneticCursor } from "@/components/ui/magnetic-cursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${anton.variable} h-full antialiased`}
    >
      <body className=" min-h-full flex flex-col">
        <MagneticCursor />
        {children}
      </body>
    </html>
  );
}
