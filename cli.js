#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");
const faviconData = require("fs").readFileSync(path.join(__dirname, "favicon.ico"));  // Read from file

const projectName = process.argv[2] || "my-arkitect";

async function scaffold() {
  const projectDir = path.join(process.cwd(), projectName);
  await fs.mkdir(projectDir, { recursive: true });

  const structure = {
    ".eleventy.js": eleventyConfig,
    "src": {
      "content": { "index.md": indexTemplate },
      "_includes": { "layout.njk": layoutTemplate }
    },
    "react": {
      "components": { "Toggle.jsx": toggleComponent },
      "main.jsx": reactEntry
    },
    "public": {
      "styles.css": cssTemplate,
      "favicon.ico": faviconData
    },
    "vite.config.js": viteConfig,
    "package.json": packageJson(projectName),
    "README.md": readmeTemplate
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
    }
  }

  await writeStructure(projectDir, structure);

  console.log("Setting up dependencies...");
  execSync(`cd ${projectName} && npm init -y && npm link @angryart/arkitect-app`, { stdio: "inherit" });
  execSync(`cd ${projectName} && npm install`, { stdio: "inherit" });

  console.log(`Created ${projectName} successfully! Run 'cd ${projectName} && npm run build' to get started.`);
}

const layoutTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/public/styles.css">
    <link rel="icon" href="/public/favicon.ico" type="image/x-icon">
    <script type="module" src="/dist/main.js"></script>
  </head>
  <body>
    <main>{{ content | safe }}</main>
    <div id="react-root"></div>
  </body>
</html>
`;
const indexTemplate = `---
title: Arkitect Demo
layout: layout.njk
permalink: /index.html
---
# Welcome to Arkitect
This is a sample page. Below is an interactive React component.`;
const eleventyConfig = `
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("public/favicon.ico");
  eleventyConfig.addPassthroughCopy("public/styles.css");
  eleventyConfig.addPassthroughCopy("dist");
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
};
`;
const reactEntry = `
import React from "react";
import ReactDOM from "react-dom/client";
import Toggle from "./components/Toggle.jsx";

ReactDOM.createRoot(document.getElementById("react-root")).render(
  <div>
    <h2>Interactive Section</h2>
    <Toggle />
  </div>
);
`;
const toggleComponent = `
import React, { useState } from "react";

export default function Toggle() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Hide" : "Show"} Details
      </button>
      {isOpen && <p>Collapsible section built with React!</p>}
    </div>
  );
}
`;
const viteConfig = `
import { defineConfig } from "vite";
import { getDefaultViteConfig } from "@angryart/arkitect-app";

export default defineConfig({
  ...getDefaultViteConfig(),
  publicDir: false
});
`;
const cssTemplate = `body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; } button { padding: 8px 16px; cursor: pointer; }`;
const packageJson = (name) => JSON.stringify({
  name,
  version: "0.1.0",
  type: "module",
  scripts: {
    "build:vite": "vite build",
    "build:eleventy": "eleventy",
    "build": "npm run build:vite && npm run build:eleventy",
    "start": "npm run build && npx serve _site"
  },
  devDependencies: {
    "@11ty/eleventy": "^3.0.0",
    "vite": "^5.4.16",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "@angryart/arkitect-app": "^0.1.0"
  },
  overrides: {
    "inflight": "^1.0.6",
    "rimraf": "^5.0.0",
    "glob": "^11.0.0"
  }
}, null, 2);
const readmeTemplate = `# Arkitect\nA framework for building architecture documentation sites.\n\n## Get Started\n1. \`npm run build\` - Builds the site.\n2. \`npm start\` - Serves it locally.\n\nAdd Markdown files to \`src/content/\` and React components to \`react/components/\`.`;

scaffold().catch(console.error);