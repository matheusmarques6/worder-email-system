/**
 * Workaround for Vercel ENOENT error with Next.js route groups.
 *
 * Vercel's file tracer expects a `page_client-reference-manifest.js` for every
 * route group page, but Next.js 15 doesn't always emit one (e.g. when a page
 * inside a route group is a server component that imports a client component).
 *
 * This script scans the build output and creates empty stub manifests wherever
 * a `page.js` exists but the corresponding manifest does not.
 */
import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SERVER_APP_DIR = join(process.cwd(), ".next", "server", "app");

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry === "page.js") {
      const manifest = join(dir, "page_client-reference-manifest.js");
      if (!existsSync(manifest)) {
        writeFileSync(
          manifest,
          'globalThis.__RSC_MANIFEST=globalThis.__RSC_MANIFEST||{};globalThis.__RSC_MANIFEST["/(dashboard)/page"]={"ssrModuleMapping":{},"edgeSSRModuleMapping":{},"clientModules":{},"entryCSSFiles":{}}\n'
        );
        console.log("Created stub manifest:", manifest.replace(process.cwd(), "."));
      }
    }
  }
}

walk(SERVER_APP_DIR);
console.log("Manifest fix complete.");
