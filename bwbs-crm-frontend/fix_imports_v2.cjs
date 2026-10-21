const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const portalsDir = path.join(srcDir, 'portals');
const componentsDir = path.join(srcDir, 'components');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function fixImports(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Find all imports that go to components, services, hooks, assets, utils
    // Currently they might be ../ components, ../../components, ../../../components
    const targetDirs = ['components', 'services', 'hooks', 'assets', 'utils'];

    const fileDir = path.dirname(filePath);

    targetDirs.forEach(target => {
        // Exact path to the target folder e.g. src/components
        const targetAbs = path.join(srcDir, target);

        // Relative path from the current file's directory to the target folder
        // e.g. from src/portals/admin to src/components -> ../../components
        let relToTarget = path.relative(fileDir, targetAbs);

        // Ensure it's posix style with /
        relToTarget = relToTarget.split(path.sep).join('/');

        // Sometimes path.relative returns just `..`, add `./` if it doesn't start with `.`
        if (!relToTarget.startsWith('.')) {
            relToTarget = './' + relToTarget;
        }

        // Replace all variations of relative imports to this target
        // We look for from '.../target/ and from "../../target/
        const re = new RegExp(`from\\s+['"](?:\\.\\.\\/)+(?:employee-portal\\/)?${target}([^'"]*)['"]`, 'g');
        newContent = newContent.replace(re, `from '${relToTarget}$1'`);

        const reImport = new RegExp(`import\\s+['"](?:\\.\\.\\/)+(?:employee-portal\\/)?${target}([^'"]*)['"]`, 'g');
        newContent = newContent.replace(reImport, `import '${relToTarget}$1'`);
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        // console.log(`Fixed: ${filePath}`);
    }
}

walkDir(portalsDir, fixImports);
// also fix `src/components/` in case they have dirty imports to `employee-portal/services`
walkDir(componentsDir, fixImports);

console.log('Import paths recalculated.');
