# Project Design Document: Horizontal Immersion V1.0 - "The Smart Importer"

## 1. Project Goal
To create a "Crawl" and "Walk" application (V1.0) that extends the single-player RPG experience. This application will allow users to engage in out-of-game, text-based roleplay that seamlessly syncs with their in-game character's memory and provides tangible, in-game rewards.

## 2. Core Philosophy
* **"V1.0, Not V0.0"**: The product must be a "joy to use," not a "clunky hack." Aesthetics, a clean UI, and a simple workflow are foundational features, not add-ons.
* **"Transparent Construction"**: The user will be empowered as a co-creator. The app will be open, and its mechanics (prompts, themes) will be user-editable.
* **"Decoupled, Not Replaced"**: The app is an *extension* of Mantella, not a replacement. It will be designed to be 100% compatible with Mantella's file structure.
* **"Crawl, Walk, Run"**: V1.0 will rely on **Manual File Sync**. Automated cloud sync is a "Run" (V2.0) feature.

## 3. V1.0 Architecture: The index.html "Smart Importer"
The V1.0 product will be a **single-file web application (index.html)** that runs in any modern browser, on both desktop and mobile. It will have no backend and will rely on user-provided files.

## 4. V1.0 Foundational Features (The "Walk" Step)
1.  **Smart CSV Importer (One-Time Setup)**:
    The app's first-time setup will prompt the user to import their database. The app will also prompt the user to (optionally) import Lydia_summary_1.txt and Lydia_override.txt for that character.
2.  **The Prompt Construction Engine**:
    This is the app's core IP. The app *must* build the prompt. It will programmatically combine three sources:
    * Our Hard-Coded "Master Prompt" (Including the "don't narrate for me" and "((OOC))" rules).
    * The Character Bio (from the override file if provided, or the CSV if not).
    * The Conversation History (from the imported summary.txt file).
3.  **The Core Experience (Chat & Actions)**:
    A clean, themed chat interface for roleplaying. A simple "Actions Menu" UI (e.g., "Brawl," "Give Item"). JavaScript will inject corresponding text (e.g., "I start a brawl") and hidden prompt rules (e.g., "Narrate a brawl and add REWARD:gold,10 to the actions file") into the chat.
4.  **The "Closed-Loop" Export**:
    When the session is complete, an "Export" button will call the LLM one last time to generate a new conversation summary and provide the user with two "download" files: `Lydia_summary_1.txt` (the newly generated summary) and `actions.txt` (a simple list of commands, e.g., REWARD:gold,10).
5.  **V1.0 In-Game Component (The "Payoff" Mod)**:
    A "hello world" level Skyrim mod. The mod's *only* function is to run a simple Papyrus script that reads the user-placed `actions.txt` file, grants the rewards, and then clears the file.
## 5. Glossary of Terms (V1.0)

This glossary provides a single, consistent definition for the core concepts of the Horizontal Immersion project. Its purpose is to eliminate ambiguity.

* **Actions Menu**: A user interface element within the Smart Importer that allows a player to select pre-defined actions (e.g., "Brawl"). These selections inject corresponding text and hidden rules into the chat prompt to generate in-game rewards.

* **Closed-Loop Export**: The process of ending a roleplay session by clicking the "Export" button. This action generates an updated conversation summary file (`Lydia_summary_1.txt`) and a rewards file (`actions.txt`) for the user to download and place in their game directory.

* **Crawl, Walk, Run**: The development philosophy for staggering feature implementation across major versions. V1.0 constitutes the "Crawl" and "Walk" phase, focusing on a functional application with **Manual File Sync**. "Run" (V2.0) features, like automated cloud sync, are deferred.

* **Decoupled, Not Replaced**: The principle that the V1.0 application is an *extension* of the Skyrim mod Mantella, not a replacement for it. It must maintain 100% compatibility with Mantella's file structure.

* **Golden Save**: The initial, "clean room" Skyrim save file created in the **Test-Bed** environment. This save is used as a consistent baseline for testing the functionality of the exported `summary.txt` and `actions.txt` files.

* **Manual File Sync**: The core data transfer method for V1.0. The user is responsible for manually importing their character files into the web app and later downloading the exported files and placing them in the correct game folders.

* **Payoff Mod**: The small, "hello world" level Skyrim mod that completes the gameplay loop. Its sole function is to read the `actions.txt` file, parse the commands, grant the player the specified rewards, and then clear the file to prevent duplication.

* **Prompt Construction Engine**: The core intellectual property of the V1.0 app. It is the JavaScript logic that programmatically combines the hard-coded "Master Prompt," the character's bio, and the existing conversation history to create the final prompt sent to the LLM.

* **Smart Importer**: The official name for the V1.0 application. It is a single-file web application (`index.html`) that runs entirely in the user's browser, using JavaScript to parse and manage user-provided game files without a backend.

* **The Lab**: The "Development Environment". This consists of the local project folder containing the source code (`index.html`, `app.js`, etc.), the VS Code editor, and Git for version control. This is where the application is built.

* **The Test-Bed**: The "Test Environment". This is a dedicated, clean installation of Skyrim managed by Mod Organizer 2, containing only the essential mods required to validate the app's functionality (e.g., Mantella). This is where the application is validated.

* **Transparent Construction**: The core philosophy that the user should be empowered as a co-creator. The application's mechanics, such as prompts and themes, are designed to be open and user-editable.