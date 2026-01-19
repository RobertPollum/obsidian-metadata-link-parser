# Metadata Link Parser

An Obsidian plugin that extracts URLs from markdown files and fetches article content, with optional ReadItLater integration.

## Features

- Extract URLs from frontmatter (`url`, `link`, `source`) or file content
- Fetch and append article content to existing files
- Create new notes from URLs
- Batch process folders or URL lists
- Context menu integration for files, folders, and editor
- Configurable URL transformation rules (proxy support)
- **Auto-processing**: Scheduled folder monitoring with smart content comparison
- Optional ReadItLater plugin integration for enhanced parsing

## Installation

### From Source

```bash
git clone https://github.com/RobertPollum/obsidian-RssItLater.git
cd obsidian-RssItLater
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` (if exists) to your vault:
```
<vault>/.obsidian/plugins/metadata-link-parser/
```

Enable the plugin in Obsidian Settings → Community Plugins.

## Usage

### Context Menu
- **Right-click a folder** → "Append articles to files in folder" or "Create notes from links"
- **Right-click a file** → "Append article to this file" or "Create note from link"

### Commands
- `Parse link from active file (create new note)`
- `Parse link and append to active file`
- `Parse links from folder`
- `Batch process URLs from file`

### File Format

```markdown
---
url: https://example.com/article
---

# My Notes
```

Or simply include a URL in the file content.

## Configuration

### URL Transformation
Configure rules in Settings to route URLs through proxies (e.g., for paywalled content).

### Auto Processing
Enable scheduled folder monitoring in Settings:
- **Watch folder**: Folder path to monitor
- **Frequency**: How often to check (5-360 minutes)
- **Content ratio**: Only process if fetched content is X times longer than existing (e.g., 2.0 = twice as long)

Files are marked with `article_processed: true` in frontmatter after processing to prevent duplicates.

## License

MIT
