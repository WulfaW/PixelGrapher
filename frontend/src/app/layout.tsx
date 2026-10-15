import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";
import "./globals.css";

const title = "PixelGrapher - GitHub Contribution Graph Art Generator";
const description =
  "Draw pixel art or type a word, preview it in 3D, and turn it into real commits on your GitHub contribution graph.";

export const metadata: Metadata = {
  metadataBase: new URL("https://pixel-grapher.vercel.app"),
  title,
  description,
  keywords: ["GitHub", "contribution graph", "commit art", "pixel art", "GitHub profile", "developer tools"],
  authors: [{ name: "WulfaW" }],
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "PixelGrapher",
    url: "/",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PixelGrapher: paint on your GitHub contribution graph" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

export const viewport: Viewport = { themeColor: "#22c55e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
