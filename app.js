/*
	App JS (V1.0)
	- CSV Importer implemented with FileReader API (no backend)
	- Lightweight CSV parser (handles quotes and commas inside quotes)
*/

document.addEventListener('DOMContentLoaded', () => {
	// Elements
	const btnImport = document.getElementById('btn-import');
	const fileInput = document.getElementById('file-input');
	const fileInfo = document.getElementById('file-info');
	const defaultParamInput = document.getElementById('default-param');
	const btnResetDefault = document.getElementById('btn-reset-default');
	const characterNameInput = document.getElementById('character-name');
	const characterBioTextarea = document.getElementById('character-biography');
	const bioSourceLine = document.getElementById('bio-source');
	const knownCharactersSelect = document.getElementById('known-characters');
	const btnChooseFolder = document.getElementById('btn-choose-folder');
	const folderStatus = document.getElementById('folder-status');
	const btnChooseOverrides = document.getElementById('btn-choose-overrides');
	const overridesStatus = document.getElementById('overrides-status');
	const btnLookup = document.getElementById('btn-lookup');
	const inputConvoFolder = document.getElementById('input-convo-folder');
	const inputOverridesFolder = document.getElementById('input-overrides-folder');
  const btnResetBio = document.getElementById('btn-reset-bio');
	const btnExportProfile = document.getElementById('btn-export-profile');

	if (!btnImport || !fileInput || !fileInfo || !characterNameInput || !characterBioTextarea) return; // Early exit if UI not present

	// State
	const DEFAULT_PARAM = 'Default Biography';
	const state = {
		defaultParam: DEFAULT_PARAM,
		defaultFromFile: null, // text loaded from defaults/default_biography.txt
		overridesDir: null, // FileSystemDirectoryHandle
		overridesFiles: null, // Map lower filename -> File (fallback)
		csvEntries: {}, // { name: biographyFromCSV }
		csvRows: [], // raw CSV rows
		csvByName: {}, // name -> full row array
		knownCharacters: [], // [{ folderName, parsedName }]
		currentName: '',
	};

	// Persistence helpers (localStorage)
	const LS_KEYS = {
		defaultParam: 'app.defaultParam',
		knownCharacters: 'app.knownCharacters', // store names only (no handles)
	};
	function loadFromStorage() {
		try {
			const dp = localStorage.getItem(LS_KEYS.defaultParam);
			if (dp !== null) state.defaultParam = dp;
			const kc = localStorage.getItem(LS_KEYS.knownCharacters);
			if (kc) {
				const names = JSON.parse(kc);
				if (Array.isArray(names)) {
					state.knownCharacters = names.map((folderName) => ({ folderName, parsedName: parseCharacterNameFromFolder(folderName) }));
				}
			}
		} catch (e) {
			console.warn('LocalStorage load failed:', e);
		}
	}
	function saveToStorage() {
		try {
			localStorage.setItem(LS_KEYS.defaultParam, state.defaultParam);
			localStorage.setItem(LS_KEYS.knownCharacters, JSON.stringify(state.knownCharacters.map((x) => x.folderName)));
		} catch (e) {
			console.warn('LocalStorage save failed:', e);
		}
	}

	function refreshDefaultParamInput() {
		if (defaultParamInput) defaultParamInput.value = state.defaultParam;
	}

	function supportsDirectoryPicker() {
		return typeof window.showDirectoryPicker === 'function';
	}

	function parseCharacterNameFromFolder(folderName) {
		// Expected format: "Erk - 0350B8" -> "Erk"
		const parts = String(folderName).split(' - ');
		const name = (parts[0] || '').trim();
		return name || String(folderName).trim();
	}

	function sortByName(a, b) {
		return a.parsedName.localeCompare(b.parsedName, undefined, { sensitivity: 'base' });
	}

	// Populate Known Characters dropdown
	function populateKnownCharactersSelect() {
		const select = knownCharactersSelect;
		const status = folderStatus;
		if (!select) return;
		// Clear
		select.innerHTML = '';
		const placeholder = document.createElement('option');
		placeholder.value = '';
		placeholder.textContent = state.knownCharacters.length ? '-- select a character --' : '-- none loaded --';
		select.appendChild(placeholder);

		// Options
		const items = [...state.knownCharacters].sort(sortByName);
		for (const item of items) {
			const opt = document.createElement('option');
			opt.value = item.folderName;
			opt.textContent = item.folderName; // show original folder label with ref
			select.appendChild(opt);
		}

		// on change -> set character name input
		select.onchange = () => {
			const folderName = select.value;
			if (!folderName) return;
			const parsed = parseCharacterNameFromFolder(folderName);
			characterNameInput.value = parsed;
			// update current name
			state.currentName = parsed;
		};

		if (status && !supportsDirectoryPicker()) {
			status.textContent = 'Directory picker not supported. Using fallback file input (Chrome/Edge recommended).';
		}
	}

	// Choose conversations folder (Known Characters) with fallback
	function setupFolderChooser() {
		const btn = btnChooseFolder;
		const status = folderStatus;
		if (!btn) return;

		if (supportsDirectoryPicker()) {
			btn.addEventListener('click', async () => {
				try {
					if (status) status.textContent = 'Opening folder picker…';
					const dir = await window.showDirectoryPicker();
					const found = [];
					for await (const [name, handle] of dir.entries()) {
						if (handle.kind === 'directory') {
							found.push({ folderName: name, parsedName: parseCharacterNameFromFolder(name) });
						}
					}
					state.knownCharacters = found.sort(sortByName);
					populateKnownCharactersSelect();
					saveToStorage();
					if (status) status.textContent = `Loaded ${state.knownCharacters.length} known characters from folder.`;
				} catch (e) {
					if (status) status.textContent = 'Folder selection canceled or failed.';
					console.warn('Folder pick error:', e);
				}
			});
			} else if (inputConvoFolder) {
				btn.addEventListener('click', () => {
					if (status) status.textContent = 'Using fallback folder picker…';
					inputConvoFolder.value = '';
					inputConvoFolder.click();
				});
				inputConvoFolder.addEventListener('change', (e) => {
					const files = Array.from(e.target.files || []);
					const set = new Set();
					for (const f of files) {
						const rel = String(f.webkitRelativePath || f.name);
						if (!rel) continue;
						const segs = rel.split('/').filter(Boolean);
						if (!segs.length) continue;
						// Heuristic: pick the first segment that looks like a character folder
						// Expected pattern: "Name - REF"; if none found, fall back to segs[0] or segs[1]
						let candidate = segs.find(s => s.includes(' - '));
						if (!candidate) {
							candidate = segs.length > 1 ? segs[0] : segs[0];
						}
						if (candidate && candidate !== '.' && candidate !== '..') {
							set.add(candidate);
						}
					}
					const found = Array.from(set).map((folderName) => ({ folderName, parsedName: parseCharacterNameFromFolder(folderName) }));
					state.knownCharacters = found.sort(sortByName);
					populateKnownCharactersSelect();
					saveToStorage();
					if (status) status.textContent = `Loaded ${state.knownCharacters.length} known characters from fallback.`;
				});
		} else {
			btn.disabled = true;
			if (status) status.textContent = 'Directory selection unavailable in this environment.';
		}
	}

	// Find a JSON file by name inside a directory handle
	async function findJsonFileHandleByName(dirHandle, name) {
		const exact = `${name}.json`;
		try {
			const fh = await dirHandle.getFileHandle(exact, { create: false });
			return fh;
		} catch {}
		const target = name.toLowerCase() + '.json';
		for await (const [entryName, handle] of dirHandle.entries()) {
			if (handle.kind === 'file' && entryName.toLowerCase() === target) {
				return handle;
			}
		}
		return null;
	}

	function findCaseInsensitiveInMap(map, lowerKey) {
		if (map.has(lowerKey)) return map.get(lowerKey);
		const base = lowerKey.toLowerCase();
		for (const [k, v] of map.entries()) {
			if (k.toLowerCase() === base) return v;
		}
		return null;
	}

	function extractBiographyTextStrict(data) {
		if (data && typeof data === 'object') {
			if (typeof data.bio === 'string') return data.bio; // spec
			if (typeof data.biography === 'string') return data.biography;
			if (typeof data.text === 'string') return data.text;
		}
		return null;
	}

		async function loadDefaultBiographyFromFile() {
			try {
				// Prefer Orion.json (bio field)
				const resOrion = await fetch('defaults/Orion.json', { cache: 'no-store' });
				if (resOrion.ok) {
					const js = await resOrion.json();
					const text = extractBiographyTextStrict(js);
					if (text && text.trim().length) {
						state.defaultFromFile = text;
						return;
					}
				}
			} catch (e) {}
			try {
				const res = await fetch('defaults/default_biography.txt', { cache: 'no-store' });
				if (res.ok) {
					const text = await res.text();
					if (text && text.trim().length) {
						state.defaultFromFile = text;
					}
				}
			} catch (e) {
				// optional; ignore if missing
			}
		}

	// Overrides loader via FS Access or fallback
	async function readOverrideFromFolder(name) {
		const lcTarget = (name + '.json').toLowerCase();
		// Fallback Map first
		if (state.overridesFiles && state.overridesFiles.size) {
			const file = state.overridesFiles.get(lcTarget) || findCaseInsensitiveInMap(state.overridesFiles, lcTarget);
			if (file) {
				try {
					const content = await file.text();
					const data = JSON.parse(content);
					const text = extractBiographyTextStrict(data);
					return { text, path: file.name };
				} catch (e) {
					console.warn('Failed to read override JSON (fallback):', e);
				}
			}
		}
		// Directory handle
		if (state.overridesDir) {
			const fh = await findJsonFileHandleByName(state.overridesDir, name);
			if (fh) {
				try {
					const file = await fh.getFile();
					const content = await file.text();
					const data = JSON.parse(content);
					const text = extractBiographyTextStrict(data);
					return { text, path: file.name };
				} catch (e) {
					console.warn('Failed to read override JSON:', e);
				}
			}
		}
		return { text: null, path: null };
	}

	async function resolveBiography(name) {
		const key = name.trim();
		const defaultVal = state.defaultFromFile ?? state.defaultParam;
		if (!key) return { value: defaultVal, source: 'Default' };

		// 1) JSON in overrides folder
		const { text, path } = await readOverrideFromFolder(key);
		if (text) return { value: text, source: `JSON (${path})` };

		// 2) CSV
		if (key in state.csvEntries) return { value: state.csvEntries[key], source: 'CSV' };

		// 3) Default
		return { value: defaultVal, source: 'Default' };
	}

	async function updateBiographyUI() {
		const name = state.currentName.trim();
		if (!name) {
			characterBioTextarea.value = '';
			bioSourceLine.textContent = 'Enter a character name and click Lookup.';
			return;
		}
		bioSourceLine.textContent = 'Resolving…';
		const { value, source } = await resolveBiography(name);
		if (name !== state.currentName.trim()) return; // stale
		characterBioTextarea.value = value || '';
		bioSourceLine.textContent = `Source: ${source}`;
	}

	// CSV import (no preview)
	btnImport.addEventListener('click', () => fileInput.click());
	fileInput.addEventListener('change', (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;

		const kb = (file.size / 1024).toFixed(1);
		fileInfo.textContent = `Loading: ${file.name} (${kb} KB)`;

		const reader = new FileReader();
		reader.onload = (evt) => {
			const text = evt.target && evt.target.result ? String(evt.target.result) : '';
			if (!text) {
				fileInfo.textContent = 'CSV is empty or could not be read.';
				return;
			}
			try {
				const rows = parseCSV(text);
				const { map, count } = csvRowsToMap(rows);
				state.csvEntries = map;
				state.csvRows = rows;
				state.csvByName = buildCsvIndexByName(rows);
				fileInfo.textContent = `CSV loaded: ${count} entries.`;
			} catch (err) {
				console.error(err);
				fileInfo.textContent = 'Failed to parse CSV. See console for details.';
			}
		};
		reader.onerror = (evt) => {
			console.error('Error reading file:', evt);
			fileInfo.textContent = 'Error reading file.';
		};
		reader.readAsText(file);
	});

	// Default param wiring
	if (defaultParamInput) {
		defaultParamInput.addEventListener('input', (e) => {
			state.defaultParam = e.target.value;
			saveToStorage();
		});
	}
	if (btnResetDefault) {
		btnResetDefault.addEventListener('click', () => {
			state.defaultParam = DEFAULT_PARAM;
			refreshDefaultParamInput();
			saveToStorage();
		});
	}

	// Character name wiring (defer resolution until Lookup)
	characterNameInput.addEventListener('input', () => {
		state.currentName = characterNameInput.value || '';
	});
	if (btnLookup) {
		btnLookup.addEventListener('click', () => {
			updateBiographyUI();
		});
	}

	// Reset to default content (does not persist)
	if (btnResetBio) {
		btnResetBio.addEventListener('click', () => {
			const defaultVal = state.defaultFromFile ?? state.defaultParam;
			characterBioTextarea.value = defaultVal || '';
			bioSourceLine.textContent = 'Source: Default (Reset)';
		});
	}

	// Export Profile (.json): build from current bio and CSV columns
	if (btnExportProfile) {
		btnExportProfile.addEventListener('click', async () => {
			const name = (state.currentName || '').trim();
			if (!name) {
				bioSourceLine.textContent = 'Please enter a character name before exporting.';
				return;
			}
			const bioText = characterBioTextarea.value || '';
			let row = state.csvByName[name];
			if (!row) {
				row = findInsensitiveInObject(state.csvByName, name);
			}
			const getCol = (idx) => (Array.isArray(row) && row.length > idx ? String(row[idx] ?? '') : '');
			// Columns: A=0 name, B=1 voice_model, C=2 bio, G=6 race, I=8 species
			const profile = {
				name: name || getCol(0) || name,
				voice_model: getCol(1),
				bio: bioText,
				race: getCol(6),
				species: getCol(8),
			};
			try {
				const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${name || 'character'}-profile.json`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
				bioSourceLine.textContent = `Exported ${a.download}`;
			} catch (e) {
				console.error('Export failed:', e);
				bioSourceLine.textContent = 'Failed to export profile. See console.';
			}
		});
	}

	// Choose overrides folder with fallback
	if (btnChooseOverrides) {
		btnChooseOverrides.addEventListener('click', async () => {
			if (supportsDirectoryPicker()) {
				try {
					if (overridesStatus) overridesStatus.textContent = 'Opening overrides folder…';
					const dir = await window.showDirectoryPicker();
					state.overridesDir = dir;
					state.overridesFiles = null; // prefer handle
					if (overridesStatus) overridesStatus.textContent = 'Overrides folder selected.';
				} catch (e) {
					if (overridesStatus) overridesStatus.textContent = 'Overrides folder selection canceled or failed.';
					console.warn('Overrides folder pick error:', e);
				}
			} else if (inputOverridesFolder) {
				inputOverridesFolder.value = '';
				inputOverridesFolder.click();
			}
		});
	}
	if (inputOverridesFolder) {
		inputOverridesFolder.addEventListener('change', async (e) => {
			try {
				const files = Array.from(e.target.files || []);
				const map = new Map();
				for (const f of files) {
					map.set(f.name.toLowerCase(), f);
				}
				state.overridesFiles = map;
				state.overridesDir = null;
				if (overridesStatus) overridesStatus.textContent = `Overrides loaded (${files.length} files).`;
			} catch (err) {
				if (overridesStatus) overridesStatus.textContent = 'Failed to load overrides via fallback.';
			}
		});
	}

	// Init
	loadFromStorage();
	refreshDefaultParamInput();
	populateKnownCharactersSelect();
	setupFolderChooser();
	loadDefaultBiographyFromFile();
});

// Lightweight CSV parser supporting quotes and escaped quotes ("")
function parseCSV(text, delimiter = ',') {
	const rows = [];
	let cur = '';
	let row = [];
	let inQuotes = false;

	const pushCell = () => {
		row.push(cur);
		cur = '';
	};

	const pushRow = () => {
		// Avoid pushing an extra empty row for trailing newline
		if (row.length > 0 || cur.length > 0) {
			pushCell();
			rows.push(row);
			row = [];
		}
	};

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"') {
				// Lookahead for escaped quote
				if (i + 1 < text.length && text[i + 1] === '"') {
					cur += '"';
					i++; // skip next
				} else {
					inQuotes = false;
				}
			} else {
				cur += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === delimiter) {
				pushCell();
			} else if (char === '\n') {
				pushRow();
			} else if (char === '\r') {
				// Handle CRLF by ignoring \r; \n will close the row
			} else {
				cur += char;
			}
		}
	}

	// Push last cell/row if any
	if (inQuotes) {
		// Unterminated quotes: treat remaining as a cell
		inQuotes = false;
	}
	if (cur.length > 0 || row.length > 0) {
		pushCell();
		rows.push(row);
	}

	return rows;
}

// Transform parsed CSV rows into { key: value } map using header detection
function csvRowsToMap(rows) {
	// Requirement: Key from Column A (index 0), Value from Column C (index 2)
	// Exact full-cell match on key. Trim whitespace. Skip header if first row looks like a header.
	if (!rows || !rows.length) return { map: {}, count: 0 };

	const map = {};

	const maybeHeader = rows[0] || [];
	const h0 = (maybeHeader[0] || '').toString().trim().toLowerCase();
	const looksLikeHeader = h0 === 'name' || h0 === 'character' || h0 === 'character name' || h0 === 'character_name' || h0 === 'id' || h0 === 'key';

	const startIdx = looksLikeHeader ? 1 : 0;
	for (let i = startIdx; i < rows.length; i++) {
		const r = rows[i];
		if (!Array.isArray(r) || r.length < 3) continue; // need at least A,B,C
		const key = (r[0] || '').toString().trim();
		if (!key) continue;
		const val = (r[2] ?? '').toString();
		map[key] = val;
	}

	return { map, count: Object.keys(map).length };
}

// Build an index from character name (column A) to the full row array
function buildCsvIndexByName(rows) {
	const index = {};
	if (!rows || !rows.length) return index;
	const maybeHeader = rows[0] || [];
	const h0 = (maybeHeader[0] || '').toString().trim().toLowerCase();
	const looksLikeHeader = h0 === 'name' || h0 === 'character' || h0 === 'character name' || h0 === 'character_name' || h0 === 'id' || h0 === 'key';
	const startIdx = looksLikeHeader ? 1 : 0;
	for (let i = startIdx; i < rows.length; i++) {
		const r = rows[i];
		if (!Array.isArray(r) || r.length < 1) continue;
		const key = (r[0] || '').toString().trim();
		if (!key) continue;
		index[key] = r;
	}
	return index;
}

// Case-insensitive key lookup for a plain object map
function findInsensitiveInObject(obj, key) {
	if (!obj || !key) return undefined;
	if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
	const target = String(key).toLowerCase();
	for (const k of Object.keys(obj)) {
		if (k.toLowerCase() === target) return obj[k];
	}
	return undefined;
}
