import os
import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'BranchuseTheme' in content:
        content = content.replace('BranchuseTheme', 'BranchColors')
        
    # Also need to make sure Colors is imported if some files still need it,
    # but useTheme provides colors. We'll add Colors import if it's missing but BranchColors is there.
    if 'BranchColors' in content and 'import { ' in content and 'from \'@/src/ui/tokens\'' in content:
        if 'BranchColors' not in content.split('from \'@/src/ui/tokens\'')[0]:
           content = content.replace("useTheme", "useTheme, BranchColors")

    # The python script might not have injected `const { colors } = useTheme();` into functional components without `export default function`
    # Let's check for `export function`
    if 'useTheme' in content and 'const { colors } = useTheme();' not in content:
        # Find export function
        import re
        func_match = re.search(r'export function\s+\w+\s*\([^)]*\)\s*{', content)
        if func_match:
            func_start = func_match.end()
            injection = "\n  const { colors } = useTheme();\n  const styles = React.useMemo(() => createStyles(colors), [colors]);\n"
            content = content[:func_start] + injection + content[func_start:]
            content = content.replace("React.useMemo", "useMemo")
            if 'useMemo' not in content.split('from')[0]:
                content = content.replace('import React', 'import React, { useMemo }')

    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Fixed: {filepath}")

import glob

files = glob.glob('src/ui/**/*.tsx', recursive=True) + glob.glob('app/**/*.tsx', recursive=True)
for f in files:
    fix_file(f)
