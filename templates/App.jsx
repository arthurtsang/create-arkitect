// remcs/react/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Breadcrumb from "@angryart/arkitect-app/Breadcrumb";
import routes from "../src/_data/routes.json";

const componentModules = import.meta.glob("../react/components/*.jsx", { eager: true });
const components = {};
for (const [path, module] of Object.entries(componentModules)) {
  const componentName = path.split("/").pop().replace(".jsx", "");
  components[componentName] = module.default;
  console.log("App v1.19: Loaded component:", componentName);
}

const App = () => {
  console.log("App v1.19: Starting render");
  const [layoutData, setLayoutData] = useState(null);

  useEffect(() => {
    console.log("App v1.19: useEffect running");
    const layout = document.querySelector(".layout");
    if (!layout) {
      console.error("App v1.19: Layout element not found");
      setLayoutData({ error: "Layout not found" });
      return;
    }
    const header = layout.querySelector(".top-header")?.outerHTML || "";
    const nav = layout.querySelector(".left-nav")?.outerHTML || "";
    const content = layout.querySelector(".content")?.innerHTML || "";
    console.log("App v1.19: Layout found, hydration complete");
    console.log("App v1.19: Header:", header);
    console.log("App v1.19: Nav:", nav);
    console.log("App v1.19: Content:", content);
    setLayoutData({ header, nav, content });
  }, []);

  if (!layoutData) {
    return null;
  }

  if (layoutData.error) {
    return <div>Error: {layoutData.error}</div>;
  }

  return (
    <BrowserRouter>
      <Breadcrumb routes={routes} />
      <div className="layout">
        <header
          className="top-header"
          dangerouslySetInnerHTML={{ __html: layoutData.header }}
        />
        <div className="content-wrapper">
          <nav
            className="left-nav"
            dangerouslySetInnerHTML={{ __html: layoutData.nav }}
          />
          <div className="main-container">
            <div className="breadcrumb-wrapper">
              {/* Empty for layout consistency */}
            </div>
            <main className="content">
              {layoutData.content ? (
                <DynamicContent content={layoutData.content} />
              ) : (
                "No content available"
              )}
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

const DynamicContent = ({ content }) => {
  console.log("DynamicContent: Starting render with content:", content);
  try {
    const elements = [];
    let lastIndex = 0;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const reactElements = doc.querySelectorAll("[data-react]");

    console.log("DynamicContent: Found data-react elements:", reactElements.length);

    reactElements.forEach((el, index) => {
      const componentName = el.getAttribute("data-react");
      const Component = components[componentName];

      const htmlBefore = content.substring(lastIndex, content.indexOf(el.outerHTML));
      if (htmlBefore) {
        elements.push(
          <span
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: htmlBefore }}
          />
        );
      }

      if (Component) {
        console.log("DynamicContent: Rendering component:", componentName);
        elements.push(<Component key={`component-${index}`} />);
      } else {
        console.warn(`DynamicContent: Component ${componentName} not found`);
        elements.push(
          <span
            key={`missing-${index}`}
            dangerouslySetInnerHTML={{ __html: el.outerHTML }}
          />
        );
      }

      lastIndex = content.indexOf(el.outerHTML) + el.outerHTML.length;
    });

    const htmlAfter = content.substring(lastIndex);
    if (htmlAfter) {
      elements.push(
        <span key="html-end" dangerouslySetInnerHTML={{ __html: htmlAfter }} />
      );
    }

    console.log("DynamicContent: Rendered elements:", elements);
    return <>{elements}</>;
  } catch (error) {
    console.error("DynamicContent: Error during render:", error.message);
    return <div>Error in DynamicContent: {error.message}</div>;
  }
};

export default App;