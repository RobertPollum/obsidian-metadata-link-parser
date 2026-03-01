# Release Guide

This project uses automated GitHub Actions workflows to handle releases. There are three types of releases:

## 🚀 Stable Releases

**Trigger:** Push a version tag (e.g., `1.2.0`)

**Workflow:** `.github/workflows/release.yml`

### How to Create a Stable Release

1. Update the version in `package.json`:
   ```bash
   npm version patch  # for 1.0.0 -> 1.0.1
   npm version minor  # for 1.0.0 -> 1.1.0
   npm version major  # for 1.0.0 -> 2.0.0
   ```

2. This will automatically:
   - Update `manifest.json` and `versions.json` via the `version-bump.mjs` script
   - Create a git commit
   - Create a git tag

3. Push the changes and tag:
   ```bash
   git push && git push --tags
   ```

4. GitHub Actions will automatically:
   - Build the plugin
   - Create a GitHub release
   - Upload `main.js`, `manifest.json`, and `styles.css` (if exists)
   - Generate release notes

### Version Tag Format
- Must follow semantic versioning: `MAJOR.MINOR.PATCH`
- Examples: `1.0.0`, `1.2.3`, `2.0.0`

---

## 🧪 Beta Releases

**Trigger:** Push to `beta` branch or manual workflow dispatch

**Workflow:** `.github/workflows/beta-release.yml`

### How to Create a Beta Release

#### Option 1: Push to Beta Branch
1. Create and checkout the beta branch:
   ```bash
   git checkout -b beta
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add new feature for testing"
   ```

3. Push to the beta branch:
   ```bash
   git push origin beta
   ```

4. The workflow will automatically create a beta release with version format:
   - `{base_version}-beta.{timestamp}.{commit_hash}`
   - Example: `1.1.0-beta.20240207142530.a1b2c3d`

#### Option 2: Manual Workflow Dispatch
1. Go to **Actions** tab in GitHub
2. Select **Beta Release** workflow
3. Click **Run workflow**
4. Optionally specify a custom version suffix (e.g., `beta.1`, `rc.1`)
5. Click **Run workflow** button

### Beta Release Features
- Marked as pre-release on GitHub
- Includes commit hash and timestamp
- Contains installation instructions
- Auto-generates release notes

---

## 🌙 Nightly Releases

**Trigger:** Automated daily at 2 AM UTC (if there are new commits) or manual workflow dispatch

**Workflow:** `.github/workflows/nightly-release.yml`

### How Nightly Releases Work

1. **Automatic Schedule:**
   - Runs every day at 2 AM UTC
   - Only creates a release if there were commits in the last 24 hours
   - Automatically cleans up old nightly releases (keeps last 7)

2. **Manual Trigger:**
   - Go to **Actions** tab in GitHub
   - Select **Nightly Release** workflow
   - Click **Run workflow**
   - This will create a nightly release regardless of recent commits

### Nightly Version Format
- `{base_version}-nightly.{YYYYMMDD}.{commit_hash}`
- Example: `1.1.0-nightly.20240207.a1b2c3d`

### Nightly Release Features
- Marked as pre-release
- Automatically deletes old nightly releases (keeps only last 7)
- Includes warning about stability
- Auto-generates release notes from recent commits

---

## 📦 Release Assets

All releases include:
- `main.js` - The compiled plugin code
- `manifest.json` - Plugin manifest with version info
- `styles.css` - Styling (if the file exists)

---

## 🔧 Workflow Permissions

The workflows use `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional setup is required.

---

## 📋 Best Practices

### For Stable Releases
- Always test thoroughly before creating a stable release
- Follow semantic versioning principles
- Update changelog or release notes manually if needed
- Ensure all tests pass

### For Beta Releases
- Use beta releases to test new features with early adopters
- Clearly communicate what's being tested
- Use the beta branch for feature development
- Merge to main only after beta testing is complete

### For Nightly Releases
- Nightly builds are for bleeding-edge testing
- Expect potential instability
- Useful for continuous integration testing
- Automatically cleaned up to avoid clutter

---

## 🐛 Troubleshooting

### Release Failed to Build
- Check the Actions tab for error logs
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json`

### Tag Already Exists
- Delete the tag locally: `git tag -d <tag_name>`
- Delete the tag remotely: `git push origin :refs/tags/<tag_name>`
- Delete the release on GitHub if it was created
- Create a new tag with the correct version

### Beta/Nightly Not Triggering
- Verify the branch name is correct (`beta` for beta releases)
- Check workflow permissions in repository settings
- Ensure Actions are enabled for the repository

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Obsidian Plugin Development](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
