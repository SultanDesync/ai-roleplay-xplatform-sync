# GUIDE: Prompt Laboratory Construction (V1.0)

This document is the official technical blueprint for building the "Prompt Laboratory" application. It is based on the "Unified Data Model" architecture.

## 1. Primary Goal
To create a "Crawl" and "Walk" V1.0 application that functions as a "Prompt Laboratory". This app will allow users to:
* Import character data from game files.
* View and edit every component of the prompt in a "Unified Data Model".
* Use AI Agents to summarize and improve prompt data.
* Export the final prompt for use in external chat applications or as a game-compatible `_override.json` file.

## 2. Core Architecture: The "Unified Data Model"
This is the foundational concept: **The UI (the HTML) is the "Single Source of Truth"**.

* **The "View" (The UI)**: A set of HTML text areas (`<textarea>`) and controls on the "Settings Page". On page load, these are pre-filled with "Defaults".
* **The "Loaders" (File Importers)**: JavaScript functions that read user-provided files (e.g., .csv, .txt, .json) and **populate** the "View," overwriting the default values.
* **The "Engine" (The Prompt Builder)**: A JavaScript function that **reads** the current `.value` from all HTML controls in the View to assemble the final prompt when the user sends a message.

## 3. Prompt Components & Sources

### Component 1: The Master Prompt
* **Note**: This component contains *only* the rules for the main chat interaction. Rules for AI Agents are defined in the "AI Agent Control Panel".
* **View**: A text area (`<textarea id="master-prompt">`).
* **Source 1 (Default)**: Pre-filled on page load.
* **Source 2 (Loader)**: An importer looks for a `[MASTER_PROMPT]` section in a user file (e.g., `_override.txt`) and overwrites the text area's content.

### Components 2 & 4: Character Data (Bio & History)
* **Note**: These components are loaded by the same UI controls and displayed together in the "Character Panel" for a streamlined UX.
* **View**:
    * A "Character Panel" UI section (`<section id="character-panel">`).
    * A dropdown (`<select id="npc-select">`) for convenience.
    * A text input (`<input id="npc-name-input">`) for "Smart Search".
    * A "Load" button (`<button id="load-npc-btn">`).
    * A text area for the bio (`<textarea id="character-bio">`).
    * An "AI Summarize Bio" button (`<button id="ai-summarize-bio">`).
    * A text area for the history (`<textarea id="conversation-history">`).
    * An "AI Summarize History" button (`<button id="ai-summarize-history">`).
* **Source 1 (Default)**:
    * `character-bio` is pre-filled with a generic default.
    * `conversation-history` is empty on page load.
* **Source 2 (Loader)**:
    * **Dropdown Source**: The `<select>` is populated by scanning the user-provided Conversations folder.
    * **Dropdown Logic**: Selecting a name (e.g., "Lydia") from the dropdown automatically populates the `npc-name-input` text field.
    * **"Load" Button Logic**: Clicking "Load" takes the name from `npc-name-input` and triggers two actions:
        1.  **Action A (Bio)**: Executes the "Smart Load" priority search (Override > CSV > Default) and populates the `character-bio` text area.
        2.  **Action B (History)**: Finds the `[name]_summary_1.txt` file, parses it for the **last summary paragraph**, and populates the `conversation-history` text area with *only* that paragraph, mirroring in-game "recency" memory.
    * **Text Input Logic**: The user can also ignore the dropdown, type any case-sensitive name directly into `npc-name-input`, and click "Load".
* **Source 3 (AI Agents)**:
    * **"AI Summarize Bio"**: Uses an LLM to generate a new, holistic bio. The meta-prompt reads the static bio (C2) and conversation history (C4) to synthesize an updated bio. The result **overwrites** the `character-bio` text area.
    * **"AI Summarize History"**: Uses an LLM to generate a new summary. The "AI Agent Control Panel" will provide an option to run this summarization on the **full chat log** instead of the default summary. The result **overwrites** the `conversation-history` text area.

### Component 3: The Player Bio
* **View**: A text area (`<textarea id="player-bio">`).
* **Source 1 (Default)**: Pre-filled on page load with a hard-coded default prompting the user for their description.
* **Source 2 (Loader)**: An importer looks for a `[PLAYER_BIO]` section in a user file (e.g., `_override.txt`) and overwrites the text area's content.

### Component 5: Session Context
* **View**: A set of UI dropdowns (`<select>`) and text fields on the "Settings Page".
* **Source 1 (Default)**: All controls have a pre-selected default value (e.g., Location: "A cozy inn").
* **Source 2 (User Edit)**: The user can change these values at any time; the Engine will read the currently selected value.

### Component 6: The User Input
* **View**: The main chat input box (`<input id="chat-input">`) on the "Chat Page".
* **Source**: The user's typed message.

## 4. AI Agent Control Panel (The "Laboratory" UI)
* **Note**: This new UI panel on the "Settings Page" defines the **qualitative rules** for the "AI Agent" buttons. The "Token Budget" system is removed for transparency.
* **View (Simple)**: A set of UI toggles and inputs for meta-rules, such as:
    * `[ ] Focus on relationship development`
    * `[ ] Focus on key facts and memories`
    * `[ ] Set target length: [under 500 words]` (A qualitative guideline)
    * `[ ] Inject theme: [e.g., 'betrayal']` (Text input)
    * `[ ] Set tone: [e.g., 'dark', 'heroic']` (Text input)
    * `[ ] **Use full chat log (slower, more accurate)**` (For "Summarize History" agent)
* **View (Advanced)**: A text area (`<textarea id="advanced-ai-rules">`) for power users to add free-text instructions.
* **Engine Logic (Meta-Prompts)**: When an "AI Agent" button is clicked, JavaScript builds a meta-prompt from the toggles, inputs, and advanced text area.

## 5. Final Construction (Engine Logic)
* **Note**: The "Engine" is now extremely simple. It is only responsible for **assembling** the final prompt from the text in the View. All token/length management is now the user's responsibility via the "AI Agent Control Panel" and the "Preview Prompt" button.
* **Simplified Pseudocode for the "Engine"**:
    ```javascript
    function buildFinalPrompt() {
        // 1. Read all data *directly* from the "View"
        let masterPrompt = document.getElementById('master-prompt').value;
        let npcBio = document.getElementById('character-bio').value;
        let playerBio = document.getElementById('player-bio').value;
        let history = document.getElementById('conversation-history').value;
        let sessionContext = getSessionContextFromUI(); // Reads dropdowns
        let userInput = document.getElementById('chat-input').value;

        // 2. Assemble the final prompt (no truncation)
        let finalPrompt = `
        ${masterPrompt}
        --- CHARACTER (NPC) BIO ---
        ${npcBio}
        --- PLAYER BIO ---
        ${playerBio}
        --- CONVERSATION HISTORY ---
        ${history}
        --- CURRENT SCENE & STATUS ---
        ${sessionContext}
        ---
        User: ${userInput}
        Character:
        `;
        
        return finalPrompt;
    }
    ```

## 6. Transparency Feature: "Preview Prompt"
* **View**: A button on the "Settings Page" (`<button id="preview-prompt">`).
* **Engine Logic**: When clicked, this button runs the `buildFinalPrompt()` function *without* user input (C6).
* **Action**: It displays the entire assembled prompt (C1-C5) in a popup or new text area.
* **Purpose**: This allows the user to **manually** check the prompt's length and content before sending it. This also provides the **V1.0 "Share" Feature**, allowing the user to copy the prompt for any external mobile chat app.