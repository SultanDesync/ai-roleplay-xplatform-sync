# character_overrides

Place your JSON overrides here. The app will try to load `character_overrides/overrides.json` on startup.

Format:

```
{
  "<key>": "<override value>",
  "char_001": "Override from JSON",
  "npc_bob": "Bob-specific override"
}
```

Notes:
- The JSON file is optional. If missing, the app will proceed without JSON overrides.
- Keys should correspond to the identifiers you plan to resolve (e.g., character_id).
- UI Overrides in the Settings section take priority over this file. CSV entries are lower priority than this file.
