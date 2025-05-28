import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivery Tracker",
  description: "Delivery Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-black`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
