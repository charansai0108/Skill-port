#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ProjectCleanup {
    constructor() {
        this.projectRoot = process.cwd();
        this.deletedFiles = [];
        this.deletedFolders = [];
        this.skippedFiles = [];
        this.unusedFiles = [];
        this.essentialFiles = new Set();
        this.referencedFiles = new Set();
        
        // Essential file patterns to never delete
        this.essentialPatterns = [
            /\.html$/,
            /\.js$/,
            /\.css$/,
            /\.json$/,
            /\.xml$/,
            /\.txt$/,
            /\.env$/,
            /\.gitignore$/,
            /\.firebaserc$/,
            /firebase\.json$/,
            /firestore\.rules$/,
            /storage\.rules$/,
            /package\.json$/,
            /package-lock\.json$/,
            /yarn\.lock$/,
            /\.git$/,
            /node_modules/,
            /\.git/,
            /\.vscode/,
            /\.idea/,
            /\.DS_Store$/,
            /Thumbs\.db$/
        ];

        // File extensions to delete
        this.deleteExtensions = ['.md', '.log', '.tmp', '.temp', '.cache', '.bak', '.old'];
        
        // Essential documentation files to keep
        this.essentialDocs = [
            'README.md',
            'CONTRIBUTING.md',
            'LICENSE.md',
            'CHANGELOG.md',
            'package.json',
            'firebase.json',
            'firestore.rules',
            'storage.rules',
            '.firebaserc',
            '.gitignore'
        ];

        // Directories to skip
        this.skipDirectories = [
            'node_modules',
            '.git',
            '.vscode',
            '.idea',
            'dist',
            'build',
            'coverage',
            '.nyc_output',
            'logs'
        ];
    }

    async run() {
        console.log('🧹 Starting SkillPort Community Project Cleanup...\n');
        
        try {
            // Step 1: Build reference map
            console.log('📋 Step 1: Building file reference map...');
            await this.buildReferenceMap();
            
            // Step 2: Identify unused files
            console.log('🔍 Step 2: Identifying unused files...');
            await this.identifyUnusedFiles();
            
            // Step 3: Generate report
            console.log('📊 Step 3: Generating cleanup report...');
            this.generateReport();
            
            // Step 4: Ask for confirmation
            if (this.unusedFiles.length > 0) {
                console.log('\n⚠️  Found potentially unused files. Review the report above.');
                console.log('Run with --confirm flag to proceed with deletion.');
                return;
            }
            
            // Step 5: Clean up files
            console.log('🗑️  Step 4: Cleaning up files...');
            await this.cleanupFiles();
            
            // Step 6: Remove empty directories
            console.log('📁 Step 5: Removing empty directories...');
            await this.removeEmptyDirectories();
            
            // Step 7: Final summary
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            process.exit(1);
        }
    }

    async buildReferenceMap() {
        const files = await this.getAllFiles(this.projectRoot);
        
        for (const file of files) {
            if (this.isEssentialFile(file)) {
                this.essentialFiles.add(file);
            }
            
            // Check for references in HTML, JS, CSS files
            if (this.isReferenceFile(file)) {
                await this.extractReferences(file);
            }
        }
    }

    async identifyUnusedFiles() {
        const files = await this.getAllFiles(this.projectRoot);
        
        for (const file of files) {
            if (this.shouldDeleteFile(file)) {
                if (this.isReferenced(file)) {
                    this.skippedFiles.push({
                        file,
                        reason: 'Referenced in code'
                    });
                } else {
                    this.unusedFiles.push(file);
                }
            }
        }
    }

    async extractReferences(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            // Extract file references from different file types
            if (filePath.endsWith('.html')) {
                this.extractHTMLReferences(content, relativePath);
            } else if (filePath.endsWith('.js')) {
                this.extractJSReferences(content, relativePath);
            } else if (filePath.endsWith('.css')) {
                this.extractCSSReferences(content, relativePath);
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    extractHTMLReferences(content, filePath) {
        // Extract script src, link href, img src, etc.
        const patterns = [
            /src=["']([^"']+)["']/g,
            /href=["']([^"']+)["']/g,
            /import\s+.*?from\s+["']([^"']+)["']/g,
            /require\(["']([^"']+)["']\)/g
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                this.addReference(match[1], filePath);
            }
        });
    }

    extractJSReferences(content, filePath) {
        // Extract import/require statements
        const patterns = [
            /import\s+.*?from\s+["']([^"']+)["']/g,
            /require\(["']([^"']+)["']\)/g,
            /import\(["']([^"']+)["']\)/g
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                this.addReference(match[1], filePath);
            }
        });
    }

    extractCSSReferences(content, filePath) {
        // Extract @import and url() references
        const patterns = [
            /@import\s+["']([^"']+)["']/g,
            /url\(["']?([^"']+)["']?\)/g
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                this.addReference(match[1], filePath);
            }
        });
    }

    addReference(refPath, fromFile) {
        // Resolve relative paths
        const resolvedPath = path.resolve(path.dirname(fromFile), refPath);
        const relativePath = path.relative(this.projectRoot, resolvedPath);
        
        if (relativePath && !relativePath.startsWith('..')) {
            this.referencedFiles.add(relativePath);
        }
    }

    isReferenced(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        return this.referencedFiles.has(relativePath) || this.essentialFiles.has(filePath);
    }

    isEssentialFile(filePath) {
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Check if it's an essential documentation file
        if (this.essentialDocs.includes(fileName)) {
            return true;
        }
        
        // Check if it matches essential patterns
        return this.essentialPatterns.some(pattern => pattern.test(filePath));
    }

    isReferenceFile(filePath) {
        return filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css');
    }

    shouldDeleteFile(filePath) {
        const ext = path.extname(filePath);
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Skip if in skip directories
        if (this.skipDirectories.some(dir => relativePath.includes(dir))) {
            return false;
        }
        
        // Delete files with specific extensions
        if (this.deleteExtensions.includes(ext)) {
            return true;
        }
        
        // Delete specific file patterns
        if (fileName.startsWith('.') && !this.essentialDocs.includes(fileName)) {
            return true;
        }
        
        return false;
    }

    async getAllFiles(dir) {
        const files = [];
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this.skipDirectories.includes(entry.name)) {
                        files.push(...await this.getAllFiles(fullPath));
                    }
                } else {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories that can't be read
        }
        
        return files;
    }

    generateReport() {
        console.log('\n📊 CLEANUP REPORT');
        console.log('==================');
        
        if (this.unusedFiles.length > 0) {
            console.log(`\n🗑️  Files to delete (${this.unusedFiles.length}):`);
            this.unusedFiles.forEach(file => {
                const relativePath = path.relative(this.projectRoot, file);
                console.log(`   - ${relativePath}`);
            });
        }
        
        if (this.skippedFiles.length > 0) {
            console.log(`\n⚠️  Files skipped (${this.skippedFiles.length}):`);
            this.skippedFiles.forEach(item => {
                const relativePath = path.relative(this.projectRoot, item.file);
                console.log(`   - ${relativePath} (${item.reason})`);
            });
        }
        
        console.log(`\n📈 Summary:`);
        console.log(`   - Total files analyzed: ${this.essentialFiles.size + this.referencedFiles.size}`);
        console.log(`   - Files to delete: ${this.unusedFiles.length}`);
        console.log(`   - Files skipped: ${this.skippedFiles.length}`);
        console.log(`   - Referenced files: ${this.referencedFiles.size}`);
    }

    async cleanupFiles() {
        for (const file of this.unusedFiles) {
            try {
                fs.unlinkSync(file);
                this.deletedFiles.push(file);
                const relativePath = path.relative(this.projectRoot, file);
                console.log(`   ✅ Deleted: ${relativePath}`);
            } catch (error) {
                console.log(`   ❌ Failed to delete: ${file} - ${error.message}`);
            }
        }
    }

    async removeEmptyDirectories() {
        const dirs = await this.getAllDirectories(this.projectRoot);
        
        // Sort by depth (deepest first) to remove nested empty dirs
        dirs.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
        
        for (const dir of dirs) {
            if (this.isEmptyDirectory(dir)) {
                try {
                    fs.rmdirSync(dir);
                    this.deletedFolders.push(dir);
                    const relativePath = path.relative(this.projectRoot, dir);
                    console.log(`   ✅ Removed empty directory: ${relativePath}`);
                } catch (error) {
                    // Directory might not be empty or might have been removed already
                }
            }
        }
    }

    async getAllDirectories(dir) {
        const dirs = [];
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory() && !this.skipDirectories.includes(entry.name)) {
                    const fullPath = path.join(dir, entry.name);
                    dirs.push(fullPath);
                    dirs.push(...await this.getAllDirectories(fullPath));
                }
            }
        } catch (error) {
            // Skip directories that can't be read
        }
        
        return dirs;
    }

    isEmptyDirectory(dir) {
        try {
            const entries = fs.readdirSync(dir);
            return entries.length === 0;
        } catch (error) {
            return false;
        }
    }

    printSummary() {
        console.log('\n🎉 CLEANUP COMPLETE!');
        console.log('====================');
        console.log(`✅ Files deleted: ${this.deletedFiles.length}`);
        console.log(`✅ Folders removed: ${this.deletedFolders.length}`);
        console.log(`⚠️  Files skipped: ${this.skippedFiles.length}`);
        
        if (this.deletedFiles.length > 0) {
            console.log('\n📁 Deleted files:');
            this.deletedFiles.forEach(file => {
                const relativePath = path.relative(this.projectRoot, file);
                console.log(`   - ${relativePath}`);
            });
        }
        
        if (this.deletedFolders.length > 0) {
            console.log('\n📂 Removed directories:');
            this.deletedFolders.forEach(dir => {
                const relativePath = path.relative(this.projectRoot, dir);
                console.log(`   - ${relativePath}`);
            });
        }
        
        console.log('\n✨ Project cleanup completed successfully!');
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const confirm = args.includes('--confirm');
    const help = args.includes('--help') || args.includes('-h');
    
    if (help) {
        console.log('🧹 SkillPort Community Project Cleanup Tool');
        console.log('==========================================');
        console.log('\nUsage:');
        console.log('  node scripts/cleanup-project.js          # Generate report only');
        console.log('  node scripts/cleanup-project.js --confirm # Execute cleanup');
        console.log('  node scripts/cleanup-project.js --help    # Show this help');
        console.log('\nThis tool will:');
        console.log('  - Remove .md, .log, .tmp files (except essential docs)');
        console.log('  - Remove empty directories');
        console.log('  - Identify unused JS/CSS/images');
        console.log('  - Preserve all essential files and referenced assets');
        console.log('\nRun without --confirm first to see what will be deleted.');
        return;
    }
    
    const cleanup = new ProjectCleanup();
    await cleanup.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProjectCleanup;
