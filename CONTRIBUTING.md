# Contributing

Thanks for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/RobertPollum/obsidian-RssItLater.git
cd obsidian-RssItLater
npm install
```

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
```

## Project Structure

```
src/
├── plugin-main.ts              # Plugin entry point
├── parse-metadata-link.ts      # Core URL parsing logic
├── ReadItLaterStubs.ts         # ReadItLater API stubs
├── settings/
│   └── url-transformer-settings.ts
└── url-transformer/
    ├── url-transformer.ts      # URL transformation logic
    ├── transformation-config.ts
    ├── transformation-types.ts
    └── default-templates.ts
```

## Pull Requests

1. Fork the repo and create a feature branch
2. Make your changes
3. Test locally in an Obsidian vault
4. Submit a PR with a clear description

## Code Style

- TypeScript with strict mode
- Follow existing patterns in the codebase
- Keep changes focused and minimal
