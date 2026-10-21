import os
import re

BASE_DIR = os.getcwd()

def fix_migrations():
    for root, _, files in os.walk(os.path.join(BASE_DIR, 'apps')):
        if 'migrations' in root:
            for file in files:
                if file.endswith('.py') and file != '__init__.py':
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    
                    # Fix `import apps.domain.app` to `import apps.domain.app as app`
                    # but only if it's imported globally like that for migrations.
                    # Or just replace usage of `core.` with `apps.platform.core.`
                    
                    # Find all imported apps
                    # e.g., `import apps.platform.core.fields`
                    # Actually, we can just replace the usages in the file if they match the app name.
                    # A better way for migrations is to just change `core.fields` to `apps.platform.core.fields`
                    
                    new_content = re.sub(r'(?<!\.)\bcore\.fields\b', 'apps.platform.core.fields', new_content)
                    new_content = re.sub(r'(?<!\.)\bcore\.validators\b', 'apps.platform.core.validators', new_content)
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed migration {filepath}")

if __name__ == '__main__':
    fix_migrations()
