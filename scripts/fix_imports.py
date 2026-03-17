import glob
import re

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    
    # Replace `import React, { useMemo }, { ` with `import React, { useMemo, `
    content = re.sub(r"import React, \{ useMemo \}, \{ ([^}]+) \}", r"import React, { useMemo, \1 }", content)
    
    # What if it's `import React, { useMemo }, {` ? (no space before/after bracket)
    content = re.sub(r"import React, \{useMemo\}, \{([^}]+)\}", r"import React, {useMemo, \1}", content)
    
    # More robust regex for this specific error:
    content = re.sub(r"import React, \{\s*useMemo\s*\}, \{\s*([^}]+)\s*\}", r"import React, { useMemo, \1 }", content)

    # Some files might have `import React, { useMemo } from 'react';` followed by another `import` which is fine.
    
    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed React import syntax in: {filepath}")

files = glob.glob('src/ui/**/*.tsx', recursive=True) + glob.glob('app/**/*.tsx', recursive=True)
for f in files:
    fix_imports(f)
