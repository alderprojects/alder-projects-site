import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alder Projects — Thoughtful Home Renovations in Vermont",
  description:
    "Alder Projects connects Vermont homeowners with skilled, vetted craftspeople for renovations done right — on time, on budget, and built to last.",
  keywords: [
    "Vermont home renovation",
    "home improvement Vermont",
    "kitchen remodel Vermont",
    "bathroom renovation Vermont",
    "Vermont contractors",
    "home projects Vermont",
  ],
  metadataBase: new URL("https://alderprojects.com"),
  openGraph: {
    title: "Alder Projects — Thoughtful Home Renovations in Vermont",
    description:
      "Connecting Vermont homeowners with skilled, vetted craftspeople.",
    url: "https://alderprojects.com",
    siteName: "Alder Projects",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alder Projects",
    description:
      "Thoughtful renovations for Vermont homes. Done right, built to last.",
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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-darker text-white antialiased">
        {children}
      </body>
    </html>
  );
}
