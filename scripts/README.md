# 🧹 SkillPort Community Project Cleanup Tools

This directory contains comprehensive cleanup tools for the SkillPort Community project. These tools help remove unnecessary files, empty directories, and unused assets while preserving essential code and referenced files.

## 📁 Files Overview

- **`cleanup-project.js`** - Basic cleanup script with file reference analysis
- **`smart-cleanup.js`** - Advanced cleanup with smart analysis and detailed reporting
- **`cleanup-config.json`** - Configuration file for customization
- **`cleanup.sh`** - Bash wrapper script for easy execution
- **`README.md`** - This documentation file

## 🚀 Quick Start

### Option 1: Using the Bash Script (Recommended)

```bash
# Generate a report to see what will be deleted (safe)
./scripts/cleanup.sh report

# Execute cleanup after reviewing the report
./scripts/cleanup.sh clean

# Run advanced smart cleanup
./scripts/cleanup.sh smart
```

### Option 2: Using Node.js Directly

```bash
# Basic cleanup - generate report only
node scripts/cleanup-project.js

# Basic cleanup - execute deletion
node scripts/cleanup-project.js --confirm

# Smart cleanup - generate report only
node scripts/smart-cleanup.js

# Smart cleanup - execute deletion
node scripts/smart-cleanup.js --confirm
```

## 🛠️ Features

### Basic Cleanup (`cleanup-project.js`)
- ✅ Removes files with extensions: `.md`, `.log`, `.tmp`, `.temp`, `.cache`, `.bak`, `.old`
- ✅ Preserves essential documentation files (README.md, package.json, etc.)
- ✅ Analyzes HTML, JS, CSS files for references
- ✅ Removes empty directories recursively
- ✅ Safe operation with confirmation prompts
- ✅ Detailed logging of all operations

### Smart Cleanup (`smart-cleanup.js`)
- ✅ All features of basic cleanup
- ✅ Advanced file reference analysis
- ✅ Import/require statement tracking
- ✅ Asset file detection and analysis
- ✅ Detailed reporting with JSON export
- ✅ Configuration file support
- ✅ Project structure analysis
- ✅ File size and type statistics

## 📊 What Gets Cleaned

### Files Deleted
- **Documentation files**: `.md` files (except essential ones)
- **Log files**: `.log`, `.tmp`, `.temp` files
- **Cache files**: `.cache`, `.bak`, `.old` files
- **System files**: `.DS_Store`, `Thumbs.db`
- **Temporary files**: `.swp`, `.swo`, `.pid` files

### Files Preserved
- **Essential docs**: README.md, CONTRIBUTING.md, LICENSE.md, CHANGELOG.md
- **Configuration**: package.json, firebase.json, firestore.rules, .gitignore
- **Source code**: All .js, .ts, .html, .css files
- **Referenced assets**: Images, fonts, and other assets referenced in code
- **Node modules**: All dependencies in node_modules/
- **Git files**: All .git directory contents

### Directories Skipped
- `node_modules/` - Dependencies
- `.git/` - Git repository
- `dist/`, `build/` - Build outputs
- `coverage/` - Test coverage
- `.vscode/`, `.idea/` - IDE settings

## ⚙️ Configuration

Edit `cleanup-config.json` to customize the cleanup behavior:

```json
{
  "cleanup": {
    "deleteExtensions": [".md", ".log", ".tmp"],
    "essentialFiles": ["README.md", "package.json"],
    "skipDirectories": ["node_modules", ".git"],
    "smartAnalysis": {
      "enabled": true,
      "checkImports": true,
      "checkReferences": true
    }
  }
}
```

## 📋 Usage Examples

### 1. Generate Report Only (Safe)
```bash
./scripts/cleanup.sh report
```
This will analyze your project and show what files would be deleted without actually deleting anything.

### 2. Execute Cleanup
```bash
./scripts/cleanup.sh clean
```
This will prompt for confirmation and then delete the identified files.

### 3. Smart Analysis
```bash
./scripts/cleanup.sh smart
```
This runs the advanced cleanup with detailed analysis and reporting.

## 📊 Report Output

The cleanup tools generate detailed reports showing:

- **Project Statistics**: Total files, directories, file types
- **Files to Delete**: List of files that will be removed
- **Files Skipped**: Files that are preserved with reasons
- **References**: How files are referenced in your code
- **Space Saved**: Amount of disk space that will be freed

### Example Report
```
📊 DETAILED CLEANUP REPORT
==========================

📈 Project Statistics:
   - Total files: 1,234
   - Total directories: 89
   - File types: .js(456), .html(123), .css(78), .md(45), .log(12)

🗑️  Files to delete (23):
   - docs/old-readme.md (2.3KB, .md)
   - logs/debug.log (1.2MB, .log)
   - temp/cache.tmp (456KB, .tmp)

⚠️  Files skipped (5):
   - README.md (Essential file)
   - client/images/logo.png (Referenced in code)
   - package.json (Essential file)

📊 Summary:
   - Files to delete: 23
   - Files skipped: 5
   - Referenced files: 1,206
   - Essential files: 12
```

## 🔒 Safety Features

### Dry Run Mode
- Always generates a report first
- Requires explicit confirmation before deletion
- Shows exactly what will be deleted

### Reference Analysis
- Analyzes HTML, JS, CSS files for file references
- Preserves any file that's referenced in code
- Tracks import/require statements

### Essential File Protection
- Never deletes essential configuration files
- Preserves important documentation
- Protects source code and assets

### Backup Recommendations
- Always commit your changes before running cleanup
- Consider creating a backup branch
- Review the report carefully before confirming

## 🐛 Troubleshooting

### Common Issues

**"Permission denied" errors**
```bash
chmod +x scripts/cleanup.sh
chmod +x scripts/cleanup-project.js
chmod +x scripts/smart-cleanup.js
```

**"Node.js not found"**
- Ensure Node.js is installed and in your PATH
- Try using `nodejs` instead of `node` on some systems

**"Files not being deleted"**
- Check file permissions
- Ensure files aren't locked by other processes
- Verify the files aren't in skip directories

### Getting Help

```bash
# Show help for basic cleanup
node scripts/cleanup-project.js --help

# Show help for smart cleanup
node scripts/smart-cleanup.js --help

# Show help for bash script
./scripts/cleanup.sh help
```

## 🔄 Integration with CI/CD

You can integrate these cleanup tools into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Cleanup project
  run: |
    node scripts/cleanup-project.js --confirm
    git add -A
    git commit -m "Cleanup: Remove unnecessary files" || exit 0
```

## 📝 Best Practices

1. **Always run report first**: Use `./scripts/cleanup.sh report` before executing cleanup
2. **Review the output**: Check what files will be deleted
3. **Commit changes**: Ensure your work is saved before cleanup
4. **Test after cleanup**: Verify your project still works correctly
5. **Regular maintenance**: Run cleanup periodically to keep project clean

## 🤝 Contributing

To improve these cleanup tools:

1. Edit the configuration in `cleanup-config.json`
2. Modify the analysis logic in the JavaScript files
3. Add new file type patterns as needed
4. Test thoroughly before committing changes

## 📄 License

These cleanup tools are part of the SkillPort Community project and follow the same license terms.

---

**Happy Cleaning! 🧹✨**
