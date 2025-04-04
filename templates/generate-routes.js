// create-arkitect/templates/scripts/generate-routes.js
import { promises as fs } from "fs";
import path from "path";

async function generateRoutes() {
  const contentDir = path.join(process.cwd(), "src/content");
  const routes = [];

  async function scanDir(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await scanDir(fullPath);
      } else if (file.name.endsWith(".md")) {
        const content = await fs.readFile(fullPath, "utf8");
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch) {
          const frontMatter = frontMatterMatch[1];
          const titleMatch = frontMatter.match(/^title:\s*(.+)$/m);
          const permalinkMatch = frontMatter.match(/^permalink:\s*(.+)$/m);
          const tocMatch = frontMatter.match(/^toc:\n((?:\s*-\s*.+\n)+)/m);

          if (titleMatch && permalinkMatch) {
            const route = {
              path: permalinkMatch[1].trim(),
              breadcrumb: titleMatch[1].trim(),
            };

            if (tocMatch) {
              const tocLines = tocMatch[1].split("\n").filter(Boolean);
              route.toc = tocLines.map((line) => {
                const title = line.match(/title:\s*(.+)/)?.[1];
                const url = line.match(/url:\s*(.+)/)?.[1];
                return { title, url };
              }).filter((item) => item.title && item.url);
            } else {
              route.toc = [];
            }

            routes.push(route);
          }
        }
      }
    }
  }

  await scanDir(contentDir);
  routes.sort((a, b) => a.path.split("/").length - b.path.split("/").length);
  routes.unshift({ path: "/", breadcrumb: "Home" });
  await fs.mkdir(path.join(process.cwd(), "src/_data"), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), "src/_data/routes.json"),
    JSON.stringify(routes, null, 2)
  );
}

generateRoutes().catch(console.error);