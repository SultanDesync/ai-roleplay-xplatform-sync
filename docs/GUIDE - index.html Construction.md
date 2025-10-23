# index.html Construction Guide & Standards
## V1.0 "Smart Importer"

This document outlines the logical construction order for our single-file index.html application and establishes our core development standards.

### 1. Core Standard: Client-Side Application (No Backend)

This is the most critical standard for V1.0. The architecture specifies a single `index.html` file that runs entirely in the user's browser. It has **no backend server**.

All file handling (.csv, .txt) will be done locally in the browser using the **FileReader API**. We will not use `<form>` tags for file processing.

### 2. Logical Construction Order

We will build `index.html` in the following distinct layers.

#### Part 1: The HTML Skeleton (The "Shell")
This is the foundational structure of the webpage. It includes the `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` tags. The `<head>` will contain `<meta>` tags for character set and mobile viewport scaling, as well as the `<title>`.

#### Part 2: The UI Layout (The "Rooms")
We will create two main `<section>` elements inside the `<body>` to serve as our primary views: a "Setup View" and a "Main App View". The main view will be hidden by default.

* **Standard**: We will use semantic HTML tags (`<main>`, `<section>`, etc.). Every interactive element must have a unique `id` attribute for JavaScript access.

#### Part 3: The Smart Importer UI (The "Front Door")
The "Setup View" section will contain the UI for loading the main CSV file. This will consist of an `<input type="file">` and a `<button>` to trigger the import logic.

* **Standard**: We will use a `<button>` tag, not `<input type="submit">`, as our logic is client-side.

#### Part 4: The Main Application UI (The "Furniture")
The hidden "Main App View" section will contain the core application interface. This includes:
* A `<select>` dropdown for character selection.
* Two `<input type="file">` elements for loading `_summary.txt` and `_override.txt` files.
* A `<div>` for the chat window and an `<input type="text">` for user input.
* A `<div>` containing `<button>` elements for the Actions Menu.
* A final `<button>` for the export function.

#### Part 5: The JavaScript (The "Plumbing & Electricity")
The JavaScript code will be placed in a single `<script>` tag just before the closing `</body>` tag.

* **Standard**: Placing the script at the end ensures all HTML elements are loaded before the script tries to find them.

The script's logic will first add event listeners to the interactive elements. The importer function, tied to the load button, will use `FileReader` to read the selected CSV, parse it, save it to `localStorage`, and then switch the UI from the setup view to the main app view.

#### Part 6: The CSS (The "Paint")
Styling will be placed in a `<style>` tag within the `<head>` to uphold our "V1.0, Not V0.0" philosophy.

* **Standard**: We will use CSS classes for styling and reserve IDs for JavaScript hooks. This makes styles reusable and improves maintainability.