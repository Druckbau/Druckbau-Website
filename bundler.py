import re

files_order = [
    'translations.js',
    'js/utils.js',
    'js/db.js',
    'js/store.js',
    'js/products.js',
    'js/cart.js',
    'js/checkout.js',
    'js/reviews.js',
    'js/ui.js',
    'js/admin.js',
    'script.js'
]

output = ''

for fpath in files_order:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Remove imports
            content = re.sub(r'^import\s+.*?;?\n', '', content, flags=re.MULTILINE)
            # Remove top level exports for functions and const/let
            content = re.sub(r'^export\s+(function|const|let|var|async\s+function|class|default)\b', r'\1', content, flags=re.MULTILINE)
            content = re.sub(r'^export\s+\{.*?\};?\n', '', content, flags=re.MULTILINE)
            output += f'\n// --- {fpath} ---\n' + content
    except Exception as e:
        print(f"Error reading {fpath}: {e}")

with open('bundled.js', 'w', encoding='utf-8') as f:
    f.write(output)
print("Bundling complete.")
