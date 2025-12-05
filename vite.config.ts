import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer()
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner()
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "^/auth/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/doctor/doctors/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/user/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/employee/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/appointment/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/billing/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/doctor/specializations/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
      "^/doctor/designations/.*": {
        target: "http://192.168.0.197:7001",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
