/**
 * Deep Import Scanner - Finds ALL broken relative imports in the project.
 * Scans every .ts/.tsx file, resolves each relative import, and checks if the target exists.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IMPORT_REGEX = /(?:from\s+['"]|import\s*\(\s*['"])(\.\.?\/[^'"]+)['"]/g;

let brokenCount = 0;

function getAllFiles(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            results = results.concat(getAllFiles(fullPath));
        } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

function resolveImport(importPath, fromFile) {
    const dir = path.dirname(fromFile);
    const resolved = path.resolve(dir, importPath);

    // Try exact match
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return true;

    // Try with extensions
    for (const ext of EXTENSIONS) {
        if (fs.existsSync(resolved + ext)) return true;
    }

    // Try as directory with index
    for (const ext of EXTENSIONS) {
        if (fs.existsSync(path.join(resolved, 'index' + ext))) return true;
    }

    // Try .png, .jpg, .svg, .css, .json for assets
    for (const ext of ['.png', '.jpg', '.jpeg', '.svg', '.css', '.json', '.webp', '.gif']) {
        if (fs.existsSync(resolved + ext)) return true;
    }

    return false;
}

console.log('🔍 Deep Import Scanner - Scanning ALL files...\n');

const files = getAllFiles(SRC_DIR);
console.log(`Found ${files.length} source files to scan.\n`);

const broken = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    IMPORT_REGEX.lastIndex = 0;

    while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const importPath = match[1];
        if (!resolveImport(importPath, file)) {
            const relFile = path.relative(SRC_DIR, file).replace(/\\/g, '/');
            broken.push({ file: relFile, importPath, fullFile: file });
            brokenCount++;
        }
    }
}

if (broken.length === 0) {
    console.log('✅ All imports are valid! No broken imports found.');
} else {
    console.log(`❌ Found ${brokenCount} BROKEN IMPORTS:\n`);
    console.log('='.repeat(100));

    // Group by file
    const grouped = {};
    for (const b of broken) {
        if (!grouped[b.file]) grouped[b.file] = [];
        grouped[b.file].push(b.importPath);
    }

    for (const [file, imports] of Object.entries(grouped)) {
        console.log(`\n📁 ${file}`);
        for (const imp of imports) {
            console.log(`   ❌ ${imp}`);
        }
    }
    console.log('\n' + '='.repeat(100));
    console.log(`\nTotal: ${brokenCount} broken imports in ${Object.keys(grouped).length} files.`);
}
