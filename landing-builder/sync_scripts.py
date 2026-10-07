#!/usr/bin/env python3
"""Rewrite the <script src="templates/..."> block in index.html and editor.html
from the files present in templates/ (run after adding a template)."""
import glob, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
order = ['edu', 'salon', 're', 'clinic', 'fitness']
def key(p):
    n = os.path.basename(p); pre = n.split('-')[0]
    return (order.index(pre) if pre in order else 99, n)
files = sorted(glob.glob('templates/*.js'), key=key)
block = '\n'.join('<script src="%s"></script>' % f for f in files)
for page in ['index.html', 'editor.html']:
    s = open(page).read()
    s2 = re.sub(r'(?:<script src="templates/[^"]+"></script>\n?)+', block + '\n', s, count=1)
    open(page, 'w').write(s2)
print(len(files), 'templates linked')
