import re
with open('translations.js', 'r') as f:
    text = f.read()

try:
    # Just a rudimentary checker. We can try deleting lines from bottom to top to binary search the syntax error since js2py/node isn't available
    pass
