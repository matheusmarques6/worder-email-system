import { promises as fs } from "node:fs";
import path from "node:path";

const appServerDir = path.join(process.cwd(), ".next", "server", "app");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    })
  );

  return files.flat();
}

async function ensureClientReferenceManifests() {
  try {
    await fs.access(appServerDir);
  } catch {
    console.log("[postbuild] .next/server/app não existe; pulando correção de manifests.");
    return;
  }

  const files = await walk(appServerDir);
  const pageFiles = files.filter((file) => file.endsWith(`${path.sep}page.js`));

  let created = 0;

  for (const pageFile of pageFiles) {
    const manifestFile = pageFile.replace(/page\.js$/, "page_client-reference-manifest.js");

    try {
      await fs.access(manifestFile);
      continue;
    } catch {
      await fs.mkdir(path.dirname(manifestFile), { recursive: true });
      await fs.writeFile(manifestFile, "module.exports = {};\n", "utf8");
      created += 1;
    }
  }

  console.log(`[postbuild] client-reference manifests criados: ${created}`);
}

ensureClientReferenceManifests().catch((error) => {
  console.error("[postbuild] erro ao criar manifests:", error);
  process.exitCode = 1;
});
