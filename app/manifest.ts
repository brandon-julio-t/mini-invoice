import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mini Invoice",
    short_name: "MinV",
    description: "A simple invoicing app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#252525",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
