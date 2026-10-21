/**
 * Fix all hardcoded navigation paths in admin portal components.
 * Adds /admin prefix to navigate() calls and Link to="" that go to admin routes.
 */
const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, 'src', 'portals', 'admin');

// Admin routes that need /admin prefix
const adminRoutes = [
    'leads', 'students', 'tasks', 'finance', 'branches', 'partners',
    'visas', 'marketing', 'operations', 'governance', 'automation',
    'hr', 'messaging', 'appointments', 'resources', 'compliance',
    'reviews', 'settings', 'leaderboard', 'audit-logs', 'communications',
    'dashboard', 'analytics', 'predictive-analytics'
];

function getAllFiles(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
            results.push(fullPath);
        }
    }
    return results;
}

let totalFixes = 0;

for (const file of getAllFiles(ADMIN_DIR)) {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;
    const basename = path.relative(ADMIN_DIR, file);

    for (const route of adminRoutes) {
        // Fix navigate('/route...')
        const navPattern = new RegExp(`navigate\\('/${route}`, 'g');
        if (navPattern.test(content)) {
            content = content.replace(new RegExp(`navigate\\('/${route}`, 'g'), `navigate('/admin/${route}`);
            changed = true;
            totalFixes++;
        }

        // Fix to="/route..."
        const toPattern = new RegExp(`to="/${route}`, 'g');
        if (toPattern.test(content)) {
            content = content.replace(new RegExp(`to="/${route}`, 'g'), `to="/admin/${route}`);
            changed = true;
            totalFixes++;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf-8');
        console.log('FIXED:', basename);
    }
}

console.log(`\nTotal pattern fixes: ${totalFixes}`);
console.log('Done!');
