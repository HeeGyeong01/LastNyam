import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/owner/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg", "nyamcat.png"],
      manifest: {
        name: "LASTNYAM 점주앱",
        short_name: "점주앱",
        description: "LASTNYAM 점주용 웹앱",
        theme_color: "#FF5C00",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/owner/",
        scope: "/owner/",
        orientation: "portrait",
        icons: [
          {
            src: "/owner/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/owner/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // base URL을 포함한 fallback 경로 설정
        navigateFallback: "/owner/index.html",
        navigateFallbackAllowlist: [
          // /owner/로 시작하는 경로만 Service Worker가 처리
          /^\/owner\/.*/,
        ],
        navigateFallbackDenylist: [
          // API 경로는 Service Worker가 처리하지 않음
          /^\/api\/.*/,
          /^\/owner\/api\/.*/,
          // 외부 도메인도 제외
          /^https:\/\/.*/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
});
