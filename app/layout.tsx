import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TraceLink — Missing Person OSINT Intelligence",
  description:
    "OSINT aggregation, lead scoring, and bulletin generation for missing person investigations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col md:flex-row">
        <Navbar />
        <main className="flex-1 min-w-0">{children}</main>
      </body>
    </html>
  );
}
