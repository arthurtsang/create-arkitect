#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

const projectName = process.argv[2] || "my-arkitect";
const createDir = path.join(__dirname, "templates");

async function scaffold() {
  const projectDir = path.join(process.cwd(), projectName);
  await fs.mkdir(projectDir, { recursive: true });

  const structure = {
    ".eleventy.js": await fs.readFile(path.join(createDir, ".eleventy.js"), "utf8"),
    "src": {
      "_data": { "nav.json": await fs.readFile(path.join(createDir, "nav.json"), "utf8") },
      "_includes": {
        "layout.njk": await fs.readFile(path.join(createDir, "layout.njk"), "utf8"),
        "nav.njk": await fs.readFile(path.join(createDir, "nav.njk"), "utf8"),
        "header.njk": await fs.readFile(path.join(createDir, "header.njk"), "utf8")
      },
      "content": { "index.md": await fs.readFile(path.join(createDir, "index.md"), "utf8") }
    },
    "react": { 
      "main.jsx": await fs.readFile(path.join(createDir, "main.jsx"), "utf8"),
      "App.jsx": await fs.readFile(path.join(createDir, "App.jsx"), "utf8")
    },
    "public": {
      "styles.css": await fs.readFile(path.join(createDir, "styles.css"), "utf8"),
      "favicon.ico": await fs.readFile(path.join(__dirname, "favicon.ico"))
    },
    "scripts": {
      "generate-routes.js": await fs.readFile(path.join(createDir, "generate-routes.js"), "utf8")
    },
    "vite.config.js": await fs.readFile(path.join(createDir, "vite.config.js"), "utf8"),
    "package.json": await fs.readFile(path.join(createDir, "package.json"), "utf8"),
    "README.md": await fs.readFile(path.join(createDir, "README.md"), "utf8")
  };

  async function writeStructure(dir, obj) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path.join(dir, key);
      if (typeof value === "string" || Buffer.isBuffer(value)) {
        await fs.writeFile(fullPath, value);
      } else {
        await fs.mkdir(fullPath, { recursive: true });
        await writeStructure(fullPath, value);
      }
      console.log(`Created: ${fullPath}`);
    }
  }

  await writeStructure(projectDir, structure);

  console.log("Setting up dependencies...");
  execSync(`cd ${projectDir} && npm init -y && npm install @arthurtsang/arkitect-app --force`, { stdio: "inherit" });
  execSync(`cd ${projectDir} && npm install`, { stdio: "inherit" });

  console.log(`Created ${projectDir} successfully! Run 'cd ${projectDir} && npm run build' to get started.`);
}

scaffold().catch(console.error);