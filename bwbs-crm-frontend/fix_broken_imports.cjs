const fs = require('fs');
const path = require('path');

const fixes = [
    { dir: 'src/portals/admin/BranchCommandCenter/modals', from: '../../../../components/Modal', to: '../components/Modal' },
    { dir: 'src/portals/admin/BranchCommandCenter/tabs', from: '../../../../components/KPICard', to: '../components/KPICard' },
];

for (const fix of fixes) {
    if (!fs.existsSync(fix.dir)) { console.log('SKIP dir:', fix.dir); continue; }
    for (const f of fs.readdirSync(fix.dir)) {
        if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
        const fp = path.join(fix.dir, f);
        let c = fs.readFileSync(fp, 'utf-8');
        if (c.includes(fix.from)) {
            c = c.replaceAll(fix.from, fix.to);
            fs.writeFileSync(fp, c, 'utf-8');
            console.log('FIXED:', fp, '|', fix.from, '->', fix.to);
        }
    }
}
console.log('All done!');
