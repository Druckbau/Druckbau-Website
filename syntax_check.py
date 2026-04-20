import re

with open('bundled.js', 'r', encoding='utf-8') as f:
    code = f.read()

# basic regex to find top level declarations
decls = re.findall(r'^(?:export\s+)?(const|let|class|function)\s+([a-zA-Z0-9_]+)', code, flags=re.MULTILINE)
seen = {}

for dtype, name in decls:
    if name in seen:
        print(f"Duplicate declaration found: {name} (previous: {seen[name]}, new: {dtype})")
    seen[name] = dtype

print("Finished checking.")
