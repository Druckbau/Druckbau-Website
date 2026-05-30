import os
import glob

html_files = glob.glob('*.html')
favicon_tag = '    <link rel="icon" type="image/jpeg" href="logo.jpg">\n'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # Check if favicon already exists
    has_favicon = any('rel="icon"' in line for line in lines)
    if has_favicon:
        continue

    # Find the title tag and insert after
    for i, line in enumerate(lines):
        if '<title>' in line:
            lines.insert(i + 1, favicon_tag)
            break
            
    with open(file, 'w', encoding='utf-8') as f:
        f.writelines(lines)
        print(f"Added favicon to {file}")
