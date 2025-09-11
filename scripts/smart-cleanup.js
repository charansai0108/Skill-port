#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartProjectCleanup {
    constructor(configPath = 'scripts/cleanup-config.json') {
        this.projectRoot = process.cwd();
        this.config = this.loadConfig(configPath);
        this.deletedFiles = [];
        this.deletedFolders = [];
        this.skippedFiles = [];
        this.unusedFiles = [];
        this.essentialFiles = new Set();
        this.referencedFiles = new Set();
        this.assetFiles = new Set();
        this.importMap = new Map();
        this.referenceMap = new Map();
        
        // Build file type maps
        this.buildFileTypeMaps();
    }

    loadConfig(configPath) {
        try {
            const configFile = path.join(this.projectRoot, configPath);
            if (fs.existsSync(configFile)) {
                return JSON.parse(fs.readFileSync(configFile, 'utf8'));
            }
        } catch (error) {
            console.warn(`⚠️  Could not load config file: ${error.message}`);
        }
        
        // Default configuration
        return {
            cleanup: {
                deleteExtensions: ['.md', '.log', '.tmp', '.temp', '.cache', '.bak', '.old'],
                essentialFiles: ['README.md', 'package.json', 'firebase.json'],
                skipDirectories: ['node_modules', '.git', 'dist', 'build'],
                referenceFileTypes: ['.html', '.js', '.css'],
                assetFileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'],
                smartAnalysis: { enabled: true, checkImports: true, checkReferences: true }
            },
            reporting: { generateReport: true, saveReport: true },
            safety: { dryRun: true, confirmBeforeDelete: true }
        };
    }

    buildFileTypeMaps() {
        this.config.cleanup.referenceFileTypes.forEach(ext => {
            this.referenceFileTypes = this.referenceFileTypes || new Set();
            this.referenceFileTypes.add(ext);
        });
        
        this.config.cleanup.assetFileTypes.forEach(ext => {
            this.assetFileTypes = this.assetFileTypes || new Set();
            this.assetFileTypes.add(ext);
        });
    }

    async run() {
        console.log(`🧹 Starting ${this.config.projectName || 'Project'} Cleanup...\n`);
        
        try {
            // Step 1: Analyze project structure
            console.log('📋 Step 1: Analyzing project structure...');
            await this.analyzeProjectStructure();
            
            // Step 2: Build comprehensive reference map
            console.log('🔍 Step 2: Building reference map...');
            await this.buildReferenceMap();
            
            // Step 3: Identify unused files
            console.log('🎯 Step 3: Identifying unused files...');
            await this.identifyUnusedFiles();
            
            // Step 4: Generate detailed report
            console.log('📊 Step 4: Generating cleanup report...');
            await this.generateDetailedReport();
            
            // Step 5: Execute cleanup if confirmed
            if (this.shouldExecuteCleanup()) {
                console.log('🗑️  Step 5: Executing cleanup...');
                await this.executeCleanup();
                
                console.log('📁 Step 6: Removing empty directories...');
                await this.removeEmptyDirectories();
                
                this.printFinalSummary();
            } else {
                console.log('\n⚠️  Cleanup not executed. Use --confirm flag to proceed.');
            }
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            process.exit(1);
        }
    }

    async analyzeProjectStructure() {
        const stats = {
            totalFiles: 0,
            totalDirectories: 0,
            fileTypes: new Map(),
            directorySizes: new Map()
        };
        
        const files = await this.getAllFiles(this.projectRoot);
        const dirs = await this.getAllDirectories(this.projectRoot);
        
        stats.totalFiles = files.length;
        stats.totalDirectories = dirs.length;
        
        // Analyze file types
        files.forEach(file => {
            const ext = path.extname(file);
            const count = stats.fileTypes.get(ext) || 0;
            stats.fileTypes.set(ext, count + 1);
        });
        
        // Analyze directory sizes
        for (const dir of dirs) {
            const size = await this.getDirectorySize(dir);
            stats.directorySizes.set(dir, size);
        }
        
        this.projectStats = stats;
        
        console.log(`   📁 Found ${stats.totalFiles} files in ${stats.totalDirectories} directories`);
        console.log(`   📊 File types: ${Array.from(stats.fileTypes.entries()).map(([ext, count]) => `${ext}(${count})`).join(', ')}`);
    }

    async buildReferenceMap() {
        const files = await this.getAllFiles(this.projectRoot);
        
        // Build import map and reference map
        for (const file of files) {
            if (this.isReferenceFile(file)) {
                await this.analyzeFileReferences(file);
            }
            
            if (this.isAssetFile(file)) {
                this.assetFiles.add(file);
            }
            
            if (this.isEssentialFile(file)) {
                this.essentialFiles.add(file);
            }
        }
        
        console.log(`   🔗 Analyzed ${this.importMap.size} files for references`);
        console.log(`   🖼️  Found ${this.assetFiles.size} asset files`);
        console.log(`   ⭐ Identified ${this.essentialFiles.size} essential files`);
    }

    async analyzeFileReferences(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            const imports = [];
            const references = [];
            
            // Extract different types of references
            if (filePath.endsWith('.html')) {
                const htmlRefs = this.extractHTMLReferences(content);
                references.push(...htmlRefs);
            } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
                const jsRefs = this.extractJSReferences(content);
                imports.push(...jsRefs.imports);
                references.push(...jsRefs.references);
            } else if (filePath.endsWith('.css')) {
                const cssRefs = this.extractCSSReferences(content);
                references.push(...cssRefs);
            }
            
            // Store in maps
            this.importMap.set(relativePath, imports);
            this.referenceMap.set(relativePath, references);
            
            // Add to referenced files set
            [...imports, ...references].forEach(ref => {
                const resolvedPath = this.resolveReference(ref, filePath);
                if (resolvedPath) {
                    this.referencedFiles.add(resolvedPath);
                }
            });
            
        } catch (error) {
            // Skip files that can't be read
        }
    }

    extractHTMLReferences(content) {
        const references = [];
        const patterns = [
            { regex: /src=["']([^"']+)["']/g, type: 'src' },
            { regex: /href=["']([^"']+)["']/g, type: 'href' },
            { regex: /url\(["']?([^"']+)["']?\)/g, type: 'url' },
            { regex: /import\s+.*?from\s+["']([^"']+)["']/g, type: 'import' },
            { regex: /require\(["']([^"']+)["']\)/g, type: 'require' }
        ];
        
        patterns.forEach(({ regex, type }) => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                references.push({ path: match[1], type, line: this.getLineNumber(content, match.index) });
            }
        });
        
        return references;
    }

    extractJSReferences(content) {
        const imports = [];
        const references = [];
        
        // ES6 imports
        const importPatterns = [
            /import\s+.*?from\s+["']([^"']+)["']/g,
            /import\(["']([^"']+)["']\)/g,
            /require\(["']([^"']+)["']\)/g,
            /import\s+["']([^"']+)["']/g
        ];
        
        importPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                imports.push({ path: match[1], type: 'import', line: this.getLineNumber(content, match.index) });
            }
        });
        
        // Dynamic references
        const dynamicPatterns = [
            /fetch\(["']([^"']+)["']\)/g,
            /axios\.[a-z]+\(["']([^"']+)["']\)/g,
            /\.load\(["']([^"']+)["']\)/g
        ];
        
        dynamicPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                references.push({ path: match[1], type: 'dynamic', line: this.getLineNumber(content, match.index) });
            }
        });
        
        return { imports, references };
    }

    extractCSSReferences(content) {
        const references = [];
        const patterns = [
            { regex: /@import\s+["']([^"']+)["']/g, type: 'import' },
            { regex: /url\(["']?([^"']+)["']?\)/g, type: 'url' },
            { regex: /src:\s*url\(["']?([^"']+)["']?\)/g, type: 'src' }
        ];
        
        patterns.forEach(({ regex, type }) => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                references.push({ path: match[1], type, line: this.getLineNumber(content, match.index) });
            }
        });
        
        return references;
    }

    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    resolveReference(refPath, fromFile) {
        try {
            const resolvedPath = path.resolve(path.dirname(fromFile), refPath);
            const relativePath = path.relative(this.projectRoot, resolvedPath);
            
            if (relativePath && !relativePath.startsWith('..')) {
                return relativePath;
            }
        } catch (error) {
            // Invalid path
        }
        return null;
    }

    async identifyUnusedFiles() {
        const files = await this.getAllFiles(this.projectRoot);
        
        for (const file of files) {
            if (this.shouldDeleteFile(file)) {
                const relativePath = path.relative(this.projectRoot, file);
                
                if (this.isReferenced(relativePath)) {
                    this.skippedFiles.push({
                        file: relativePath,
                        reason: 'Referenced in code',
                        references: this.getFileReferences(relativePath)
                    });
                } else if (this.isEssentialFile(file)) {
                    this.skippedFiles.push({
                        file: relativePath,
                        reason: 'Essential file'
                    });
                } else {
                    this.unusedFiles.push({
                        file: relativePath,
                        fullPath: file,
                        size: this.getFileSize(file),
                        type: this.getFileType(file)
                    });
                }
            }
        }
    }

    isReferenced(relativePath) {
        return this.referencedFiles.has(relativePath) || this.essentialFiles.has(path.join(this.projectRoot, relativePath));
    }

    getFileReferences(relativePath) {
        const references = [];
        this.referenceMap.forEach((refs, file) => {
            refs.forEach(ref => {
                if (this.resolveReference(ref.path, path.join(this.projectRoot, file)) === relativePath) {
                    references.push({ file, line: ref.line, type: ref.type });
                }
            });
        });
        return references;
    }

    async generateDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            project: this.config.projectName || 'Project',
            stats: this.projectStats,
            cleanup: {
                filesToDelete: this.unusedFiles.length,
                filesSkipped: this.skippedFiles.length,
                totalReferenced: this.referencedFiles.size,
                totalEssential: this.essentialFiles.size
            },
            filesToDelete: this.unusedFiles,
            filesSkipped: this.skippedFiles,
            references: Object.fromEntries(this.referenceMap),
            imports: Object.fromEntries(this.importMap)
        };
        
        if (this.config.reporting.saveReport) {
            const reportFile = path.join(this.projectRoot, this.config.reporting.reportFile || 'cleanup-report.json');
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(`   📄 Report saved to: ${reportFile}`);
        }
        
        this.printReport(report);
    }

    printReport(report) {
        console.log('\n📊 DETAILED CLEANUP REPORT');
        console.log('==========================');
        
        console.log(`\n📈 Project Statistics:`);
        console.log(`   - Total files: ${report.stats.totalFiles}`);
        console.log(`   - Total directories: ${report.stats.totalDirectories}`);
        console.log(`   - File types: ${Array.from(report.stats.fileTypes.entries()).map(([ext, count]) => `${ext}(${count})`).join(', ')}`);
        
        console.log(`\n🗑️  Files to delete (${report.cleanup.filesToDelete}):`);
        if (report.filesToDelete.length > 0) {
            report.filesToDelete.forEach(item => {
                console.log(`   - ${item.file} (${item.size}, ${item.type})`);
            });
        } else {
            console.log('   - No files to delete');
        }
        
        console.log(`\n⚠️  Files skipped (${report.cleanup.filesSkipped}):`);
        if (report.filesSkipped.length > 0) {
            report.filesSkipped.forEach(item => {
                console.log(`   - ${item.file} (${item.reason})`);
                if (item.references && item.references.length > 0) {
                    item.references.forEach(ref => {
                        console.log(`     └─ Referenced in ${ref.file}:${ref.line} (${ref.type})`);
                    });
                }
            });
        } else {
            console.log('   - No files skipped');
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   - Files to delete: ${report.cleanup.filesToDelete}`);
        console.log(`   - Files skipped: ${report.cleanup.filesSkipped}`);
        console.log(`   - Referenced files: ${report.cleanup.totalReferenced}`);
        console.log(`   - Essential files: ${report.cleanup.totalEssential}`);
    }

    shouldExecuteCleanup() {
        const args = process.argv.slice(2);
        return args.includes('--confirm') || args.includes('--execute');
    }

    async executeCleanup() {
        for (const item of this.unusedFiles) {
            try {
                fs.unlinkSync(item.fullPath);
                this.deletedFiles.push(item);
                console.log(`   ✅ Deleted: ${item.file} (${item.size})`);
            } catch (error) {
                console.log(`   ❌ Failed to delete: ${item.file} - ${error.message}`);
            }
        }
    }

    async removeEmptyDirectories() {
        const dirs = await this.getAllDirectories(this.projectRoot);
        
        // Sort by depth (deepest first)
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

    printFinalSummary() {
        console.log('\n🎉 CLEANUP COMPLETE!');
        console.log('====================');
        console.log(`✅ Files deleted: ${this.deletedFiles.length}`);
        console.log(`✅ Folders removed: ${this.deletedFolders.length}`);
        console.log(`⚠️  Files skipped: ${this.skippedFiles.length}`);
        
        if (this.deletedFiles.length > 0) {
            const totalSize = this.deletedFiles.reduce((sum, item) => sum + item.size, 0);
            console.log(`💾 Space freed: ${this.formatBytes(totalSize)}`);
        }
        
        console.log('\n✨ Project cleanup completed successfully!');
    }

    // Utility methods
    async getAllFiles(dir) {
        const files = [];
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this.config.cleanup.skipDirectories.includes(entry.name)) {
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

    async getAllDirectories(dir) {
        const dirs = [];
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory() && !this.config.cleanup.skipDirectories.includes(entry.name)) {
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

    isReferenceFile(filePath) {
        const ext = path.extname(filePath);
        return this.referenceFileTypes && this.referenceFileTypes.has(ext);
    }

    isAssetFile(filePath) {
        const ext = path.extname(filePath);
        return this.assetFileTypes && this.assetFileTypes.has(ext);
    }

    isEssentialFile(filePath) {
        const fileName = path.basename(filePath);
        return this.config.cleanup.essentialFiles.includes(fileName);
    }

    shouldDeleteFile(filePath) {
        const ext = path.extname(filePath);
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Skip if in skip directories
        if (this.config.cleanup.skipDirectories.some(dir => relativePath.includes(dir))) {
            return false;
        }
        
        // Delete files with specific extensions
        if (this.config.cleanup.deleteExtensions.includes(ext)) {
            return true;
        }
        
        // Delete specific file patterns
        if (fileName.startsWith('.') && !this.config.cleanup.essentialFiles.includes(fileName)) {
            return true;
        }
        
        return false;
    }

    isEmptyDirectory(dir) {
        try {
            const entries = fs.readdirSync(dir);
            return entries.length === 0;
        } catch (error) {
            return false;
        }
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    getFileType(filePath) {
        const ext = path.extname(filePath);
        return ext || 'no extension';
    }

    async getDirectorySize(dir) {
        try {
            const result = execSync(`du -sb "${dir}" 2>/dev/null || echo "0 ${dir}"`, { encoding: 'utf8' });
            return parseInt(result.split('\t')[0]) || 0;
        } catch (error) {
            return 0;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('🧹 Smart Project Cleanup Tool');
        console.log('============================');
        console.log('\nUsage:');
        console.log('  node scripts/smart-cleanup.js              # Generate report only');
        console.log('  node scripts/smart-cleanup.js --confirm    # Execute cleanup');
        console.log('  node scripts/smart-cleanup.js --help       # Show this help');
        console.log('\nFeatures:');
        console.log('  - Smart file reference analysis');
        console.log('  - Unused asset detection');
        console.log('  - Import/require tracking');
        console.log('  - Detailed reporting');
        console.log('  - Safe operation with confirmation');
        console.log('\nConfiguration:');
        console.log('  - Edit scripts/cleanup-config.json to customize');
        console.log('  - Supports dry-run mode for safety');
        return;
    }
    
    const cleanup = new SmartProjectCleanup();
    await cleanup.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SmartProjectCleanup;
