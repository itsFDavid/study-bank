import type { Metadata, Viewport } from "next";
import "./globals.css";

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Study Bank",
  description: "Create, manage, and quiz yourself with custom question banks.",
  keywords: [
    "study bank",
    "question bank",
    "flashcards",
    "quiz",
    "education",
    "learning",
    "study app",
    "custom quizzes",
    "exam preparation",
  ],
  authors: [{ name: "David", url: "https://itsfdavid.com" }],
  openGraph: {
    title: "Study Bank",
    description:
      "Create, manage, and quiz yourself with custom question banks.",
    url: "https://studybank.isverceo.com",
    siteName: "Study Bank",
    images: [
      {
        url: "https://studybank.isverceo.com/icon.jpeg",
        width: 1200,
        height: 630,
        alt: "Study Bank Open Graph Image",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  icons: {
    icon: "/icons/icon-512x512.png",
    apple: "/icons/icon-512x512.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a", // Color de la barra de estado del celular
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Se siente más nativo si el usuario no puede hacer zoom pellizcando
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
