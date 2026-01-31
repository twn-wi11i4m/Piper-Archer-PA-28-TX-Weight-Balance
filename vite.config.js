import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "Piper Archer PA-28-TX Weight & Balance",
        short_name: "PA-28 W&B",
        description:
          "Weight and balance calculator for the Piper Archer PA-28-TX.",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
