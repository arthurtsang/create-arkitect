# Instructions: Creating New Components in User Projects

## Overview

Users can create React components in a scaffolded project (e.g., MyProject) to extend functionality, similar to arkitect-app’s components. These are dynamically loaded via import.meta.glob and rendered in content via eleventy shortcode {% react "ComponentName" %}.

## Steps

    Set Up the Component Directory:
        Path: MyProject/react/components/.
        Create this folder if it doesn’t exist (it might already from sad-template1’s JsonSchemaViewer).
    Create the Component File:
        Example: MyProject/react/components/MyComponent.jsx.
        Content:
        ```jsx

        import React from "react";

        const MyComponent = () => {
          return (
            <div style={{ border: "1px solid #3182ce", padding: "15px", borderRadius: "6px" }}>
              <h2>My Custom Component</h2>
              <p>This is a user-created component in MyProject.</p>
            </div>
          );
        };
        ```

        export default MyComponent;

        Notes: Keep it simple or add props/logic as needed. No need for export in package.json (unlike arkitect-app).
    Integrate into Content:
        Edit an .md file in MyProject/src/content/ (e.g., sad1/index.md):
        ```markdown
        title: Software Architecture Document (Simple)
        permalink: /sad/
        Simple SAD
        A basic architecture overview.
        <div data-react="MyComponent"></div>
        More content below the component.
        ```
        The data-react attribute tells DynamicContent to render MyComponent.
    Build and Run:
        Run:

        cd MyProject
        npm run build  # Regenerates routes.json and builds
        npm run start

        Visit http://localhost:3000/sad/—MyComponent should appear in the content.
    Verify Loading:
        Check console logs: "App v1.26: Loaded component: MyComponent".
        import.meta.glob("../react/components/*.jsx", { eager: true }) in App.jsx automatically picks up new .jsx files in react/components/.

## Tips

    Naming: Use unique PascalCase names (e.g., MyComponent) to avoid conflicts.
    Styling: Leverage MyProject/public/styles.css or add inline styles.
    Dependencies: Install extras via npm install in MyProject (e.g., npm install @mui/material).
