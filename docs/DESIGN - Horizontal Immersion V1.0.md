# Project Design Document: Horizontal Immersion V1.0 - "The Prompt Laboratory"

## 1. Project Goal
To create a "Crawl" and "Walk" application (V1.0) that acts as a "Prompt Laboratory". This application will allow users to import character data, use AI agents to manage and edit all prompt components in a transparent UI, and export the final prompt for use in external chat applications or as a game-compatible settings file.

## 2. Core Philosophy
* **"V1.0, Not V0.0"**: The product must be a "joy to use," not a "clunky hack." Aesthetics, a clean UI, and a simple workflow are foundational features, not add-ons.
* **"Transparent Construction"**: The user will be empowered as a co-creator. The app will be open, and its mechanics (prompts, themes) will be user-editable.
* **"Decoupled, Not Replaced"**: The app is an *extension* of Mantella, not a replacement. It is designed to be 100% compatible with Mantella's file-reading structure.
* **"Crawl, Walk, Run"**: V1.0 will rely on **Manual File Sync** (imports). Automated cloud sync is a "Run" (V2.0) feature.

## 3. V1.0 Architecture: The index.html "Prompt Laboratory"
The V1.0 product will be a **single-file web application (index.html)** that runs in any modern browser, on both desktop and mobile. It will have **no backend** and will rely on user-provided files handled by the browser's FileReader API.

## 4. V1.0 Foundational Features (The "Walk" Step)
The V1.0 feature set has been **pivoted** from the original "Closed-Loop" model to a "Prompt Laboratory" model. This change was necessary due to the technical constraints of a browser-based application, which cannot write files to a user's local directory.

1.  **The "Unified Data Model"**: The UI is the single source of truth. The application consists of HTML controls (like `<textarea>`) that are pre-filled with defaults.
2.  **File Loaders**: JavaScript functions read user-provided files (CSV, .txt, .json) and use their content to *populate* the UI's text areas, overwriting the defaults.
3.  **The "Prompt Laboratory" UI**: The user can view and directly edit every component of the prompt (Master Prompt, Character Bio, History, etc.) in the UI.
4.  **AI Agent Control Panel**: A dedicated UI panel allows the user to manage the rules for built-in AI agents, such as "AI Summarize Bio" or "AI Summarize History."
5.  **The Prompt Construction Engine**: The engine's logic is now to simply *read* the current values from all UI text areas and assemble them into a final prompt string.
6.  **"Share" & Export Features**: The primary outputs are:
    * A **"Preview Prompt"** button that lets the user copy the final prompt for use in external mobile chat apps.
    * An export function for a game-compatible `_override.json` file.

## 5. Glossary of Terms (V1.0)
This glossary provides a single, consistent definition for the core concepts of the project.

* **AI Agent Control Panel**: A UI section that allows the user to define the qualitative rules and meta-prompts for the in-app AI agents (e.g., "Summarize History").
* **Crawl, Walk, Run**: The development philosophy for staggering feature implementation across major versions.
* **Decoupled, Not Replaced**: The principle that the V1.0 application is an *extension* of Mantella, not a replacement.
* **Golden Save**: The initial, "clean room" Skyrim save file created in the **Test-Bed** environment, used to test the compatibility of file *imports*.
* **Manual File Sync**: The core data transfer method for V1.0. The user is responsible for manually *importing* their character files into the web app.
* **Prompt Construction Engine**: The JavaScript logic that reads the current values from all UI text areas (the Unified Data Model) to assemble the final, complete prompt string.
* **Prompt Laboratory**: The official name for the V1.0 application. It is a single-file web app where users can import, edit, and manage all components of a prompt.
* **The Lab**: The "Development Environment" (local project folder, VS Code, Git).
* **The Test-Bed**: The "Test Environment" (a clean, dedicated installation of Skyrim) used to validate the app's file *import* functionality.
* **Transparent Construction**: The core philosophy that the user should be empowered as a co-creator.
* **Unified Data Model**: The core architecture of V1.0. The principle that the UI's HTML elements (e.g., text areas) are the single source of truth for all prompt data.