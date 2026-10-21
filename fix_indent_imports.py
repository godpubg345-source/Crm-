import os
import re

DOMAINS = {
    'identity': ['accounts', 'audit'],
    'crm': ['students', 'applications', 'visas'],
    'operations': ['branches', 'finance', 'tasks', 'governance', 'compliance', 'operations'],
    'engagement': ['campaigns', 'communications', 'messaging', 'appointments', 'reviews'],
    'partners': ['universities'],
    'platform': ['analytics', 'automation', 'magic_links', 'portal', 'resources', 'core', 'data', 'extras', 'requirements']
}

BASE_DIR = os.getcwd()

app_to_domain = {}
for domain, apps in DOMAINS.items():
    for app in apps:
        app_to_domain[app] = domain

py_files = []
for root, _, files in os.walk(os.path.join(BASE_DIR, 'apps')):
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
        
        sorted_apps = sorted(app_to_domain.keys(), key=len, reverse=True)
        for app in sorted_apps:
            domain = app_to_domain[app]
            new_prefix = f"apps.{domain}.{app}"
            
            # Match 1: `from app ` or `from app.module ` but preserve indentation
            # new_content = re.sub(rf"^(\s*)from\s+{app}\b", rf"\1from {new_prefix}", new_content, flags=re.MULTILINE)
            # Match 2: `import app ` or `import app.module ` but preserve indentation
            # new_content = re.sub(rf"^(\s*)import\s+{app}\b", rf"\1import {new_prefix}", new_content, flags=re.MULTILINE)
            
            # Use positive lookbehind for ^(\s*) to avoid capturing it, or just capture it in group 1
            pattern_from = re.compile(rf"^(\s*)from\s+{re.escape(app)}\b", re.MULTILINE)
            new_content = pattern_from.sub(rf"\1from {new_prefix}", new_content)
            
            pattern_import = re.compile(rf"^(\s*)import\s+{re.escape(app)}\b", re.MULTILINE)
            new_content = pattern_import.sub(rf"\1import {new_prefix}", new_content)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed imports in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print("Indented imports fixed.")
