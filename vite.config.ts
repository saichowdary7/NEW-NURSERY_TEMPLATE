// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `npm run dev:https` serves over HTTPS with the local certificate in .cert/ (git-ignored), because
// phones only allow the live camera and AR on secure pages. Other scripts are unaffected.
const httpsDev = process.env["npm_lifecycle_event"] === "dev:https" && existsSync(".cert/dev-key.pem")
  ? { key: readFileSync(".cert/dev-key.pem"), cert: readFileSync(".cert/dev-cert.pem") }
  : undefined;

export default defineConfig({
  vite: {
    // model-viewer is imported lazily when a plant preview opens; pre-bundle it so the dev server
    // doesn't discover it late and serve a stale 404 for it.
    optimizeDeps: { include: ["@google/model-viewer"] },
    ...(httpsDev ? { server: { https: httpsDev } } : {}),
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
