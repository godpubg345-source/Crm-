import os
import shutil
import re

DOMAINS = {
    'identity': ['accounts', 'audit'],
    'crm': ['students', 'applications', 'visas'],
    'operations': ['branches', 'finance', 'tasks', 'governance', 'compliance'],
    'engagement': ['campaigns', 'communications', 'messaging', 'appointments', 'reviews'],
    'partners': ['universities'],
    'platform': ['analytics', 'automation', 'magic_links', 'portal', 'resources']
}

BASE_DIR = os.getcwd()
APPS_DIR = os.path.join(BASE_DIR, 'apps')

if not os.path.exists(APPS_DIR):
    os.makedirs(APPS_DIR)

app_to_domain = {}
for domain, apps in DOMAINS.items():
    domain_path = os.path.join(APPS_DIR, domain)
    if not os.path.exists(domain_path):
        os.makedirs(domain_path)
    
    for app in apps:
        app_to_domain[app] = domain
        src = os.path.join(BASE_DIR, app)
        dst = os.path.join(domain_path, app)
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.move(src, dst)
            print(f"Moved {app} to {domain_path}")

# Update apps.py
for app, domain in app_to_domain.items():
    apps_py_path = os.path.join(APPS_DIR, domain, app, 'apps.py')
    if os.path.exists(apps_py_path):
        with open(apps_py_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_name = f"apps.{domain}.{app}"
        content = re.sub(r"name\s*=\s*['\"]" + app + r"['\"]", f"name = '{new_name}'", content)
        
        if 'label =' not in content:
            content = re.sub(f"(name = '{new_name}')", rf"\1\n    label = '{app}'", content)
            
        with open(apps_py_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {apps_py_path}")

# Update imports in all python files
py_files = []
for root, _, files in os.walk(BASE_DIR):
    if any(x in root for x in ['venv', '.git', '__pycache__', 'bwbs-crm-frontend', 'node_modules']):
        continue
    for file in files:
        if file.endswith('.py'):
            py_files.append(os.path.join(root, file))

for filepath in py_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        
        # Sort by length descending to prevent partial match issues (though \b protects us)
        sorted_apps = sorted(app_to_domain.keys(), key=len, reverse=True)
        for app in sorted_apps:
            domain = app_to_domain[app]
            new_prefix = f"apps.{domain}.{app}"
            
            # Replace `from app` or `from app.module`
            new_content = re.sub(rf"^from\s+{app}\b", f"from {new_prefix}", new_content, flags=re.MULTILINE)
            # Replace `import app` or `import app.module`
            new_content = re.sub(rf"^import\s+{app}\b", f"import {new_prefix}", new_content, flags=re.MULTILINE)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed imports in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print("Migration completed successfully.")
