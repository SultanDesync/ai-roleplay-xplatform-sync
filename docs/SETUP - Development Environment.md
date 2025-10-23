# Project Setup Guide (V1.0 - Web-First)

This guide outlines the **two** core environments you need to build and test the V1.0 "Smart Importer." The project is now a "web-first" application, meaning our primary development will be in HTML, CSS, and JavaScript.

## Part 1: The Development Environment (The "Lab")

This is where you will **build** the `index.html` web app.

1.  **Code Editor**: Visual Studio Code (VS Code)
    * **Recommendation**: Install the "Live Server" extension from the VS Code marketplace.
### 2. Project Folder Structure
This is the official project workspace. Your V1.0 structure must be simple and clean:

/Horizontal_Immersion/
│
├── /docs/
│   ├── DESIGN - Smart Importer V1.0.md
│   ├── SETUP - Development Environment.md
│   └── PROCESS - AI Agent Roster.md
│
├── index.html          <-- Your V1.0 web app
├── style.css           <-- Your visual themes and styling
├── app.js              <-- Your core JavaScript logic
└── README.md           <-- Your project's central navigation hub

3.  **Version Control**: Git
    * `git init` in your `/Horizontal_Immersion/` folder.
    * Create a `.gitignore` file.
    * Create your repository on GitHub.
    * Link your local folder to the GitHub repo.

## Part 2: The Test Environment (The "Test-Bed")

This is where you will **validate** your app's functionality in a "clean room" Skyrim build.

1.  **Mod Manager**: Mod Organizer 2 (MO2)
    * Create a new, dedicated profile named "H.I. Dev-Test".
2.  **Core Test-Bed Mod List**:
    * **[Engine]**: SKSE, Address Library for SKSE Plugins, PapyrusUtil SE
    * **[Utilities]**: Alternate Start - Live Another Life
    * **[Core Dependency]**: Mantella (and its requirements)
3.  **Initial Save File (The "Control")**:
    * Launch Skyrim using the "SKSE" executable in your "H.I. Dev-Test" profile.
    * Use "Alternate Start" to create a new character.
    * Confirm Mantella is working and create one test conversation.
    * Save your game. This is now your "golden" save file for testing.