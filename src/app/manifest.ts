// src/app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Study Bank - Exam System",
    short_name: "StudyBank",
    description: "Institutional exam bank management system",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc", // Tu color bg-slate-50
    theme_color: "#0f172a",       // Tu color slate-900 (Header)
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}