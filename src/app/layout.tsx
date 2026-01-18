import type { Metadata } from "next";
import "./globals.css";

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
        url: "https://studybank.isverceo.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Study Bank Open Graph Image",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
