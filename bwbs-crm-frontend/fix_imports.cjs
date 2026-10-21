const fs = require('fs');
const path = require('path');

const portalsDir = path.join(__dirname, 'src', 'portals');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function updateImports(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Since files moved from `src/pages` (depth 1) to `src/portals/domain` (depth 2),
    // they need an extra `../` for top-level src folders.
    // We look for imports starting with `../components`, `../services`, `../hooks`, `../assets`

    newContent = newContent.replace(/from\s+['"]\.\.\/(components|services|hooks|assets|utils)\//g, "from '../../$1/");
    newContent = newContent.replace(/import\s+['"]\.\.\/(components|services|hooks|assets|utils)\//g, "import '../../$1/");

    // Some files were in deeper folders, effectively depth 2 moving to depth 3
    // e.g. src/pages/Marketing/CampaignBuilder.tsx -> src/portals/admin/Marketing/CampaignBuilder.tsx
    // where it had `../../components` -> now needs `../../../components`
    newContent = newContent.replace(/from\s+['"]\.\.\/\.\.\/(components|services|hooks|assets|utils)\//g, "from '../../../$1/");
    newContent = newContent.replace(/import\s+['"]\.\.\/\.\.\/(components|services|hooks|assets|utils)\//g, "import '../../../$1/");

    // Fix references to empPortal service inside employee portal
    newContent = newContent.replace(/from\s+['"]\.\.\/services\/empPortal['"]/g, "from '../../services/empPortal'");
    newContent = newContent.replace(/from\s+['"]\.\.\/services([^'"]*)['"]/g, "from '../../services$1'");

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir(portalsDir, updateImports);

// Also need to fix imports inside `src/components/` that might be pointing to pages
// Example: src/components/DashboardLayout.tsx had `../employee-portal`
function updateComponents(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/from\s+['"]\.\.\/employee-portal\/services\/empPortal['"]/g, "from '../services/empPortal'");

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated Component: ${filePath}`);
    }
}

const componentsDir = path.join(__dirname, 'src', 'components');
if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, updateComponents);
}
