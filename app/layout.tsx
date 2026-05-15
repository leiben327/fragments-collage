import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  Homemade_Apple,
  Indie_Flower,
  Inter,
  Newsreader,
  Shadows_Into_Light,
  Special_Elite,
  Spectral,
} from "next/font/google";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const indieFlower = Indie_Flower({
  variable: "--font-indie",
  subsets: ["latin"],
  weight: ["400"],
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows",
  subsets: ["latin"],
  weight: ["400"],
});

const newsreader = Newsreader({
  variable: "--font-news",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const interMood = Inter({
  variable: "--font-inter-mood",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const specialEliteMood = Special_Elite({
  variable: "--font-special-elite-mood",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const homemadeAppleMood = Homemade_Apple({
  variable: "--font-homemade-apple-mood",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

function siteMetadataBase(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

const siteTitle = "Fragments — mood collages from your camera roll";
const siteDescription =
  "Turn forgotten photos into emotional collages, draw gentle creative challenges, and save pieces to your device — free, slow, and mobile-friendly. No account required.";

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  applicationName: "Fragments",
  title: {
    default: siteTitle,
    template: "%s · Fragments",
  },
  description: siteDescription,
  keywords: [
    "collage",
    "mood board",
    "camera roll",
    "memory",
    "creative challenge",
    "PWA",
  ],
  authors: [{ name: "Fragments" }],
  creator: "Fragments",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fragments",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fragments",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8d4cf" },
    { media: "(prefers-color-scheme: dark)", color: "#3d3832" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spectral.variable} ${caveat.variable} ${indieFlower.variable} ${shadowsIntoLight.variable} ${newsreader.variable} ${interMood.variable} ${specialEliteMood.variable} ${homemadeAppleMood.variable} h-full`}
    >
      <body className="grain min-h-dvh antialiased selection:bg-blush/60 selection:text-ink">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
