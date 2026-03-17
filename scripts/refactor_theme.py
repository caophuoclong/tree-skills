import os
import sys
import re

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'useTheme' in content and 'createStyles' in content:
        print(f"Already refactored: {filepath}")
        return

    # Replace import
    content = re.sub(
        r"import \{([^}]*)Colors([^}]*)\} from '@\/src\/ui\/(tokens|tokens\/colors)';",
        r"import {\1useTheme\2} from '@/src/ui/tokens';",
        content
    )
    
    # If the file imports Colors from some other relative path
    content = re.sub(
        r"import \{([^}]*)Colors([^}]*)\} from '\.\.\/ui\/tokens';",
        r"import {\1useTheme\2} from '../ui/tokens';",
        content
    )

    # Convert StyleSheet.create to createStyles
    content = content.replace("const styles = StyleSheet.create({", "const createStyles = (colors: any) => StyleSheet.create({")
    
    # Replace Colors. with colors.
    content = content.replace("Colors.", "colors.")

    # We need to inject `const { colors } = useTheme();` and `const styles = React.useMemo(() => createStyles(colors), [colors]);`
    # inside the main export default function.
    
    # Find export default function
    func_match = re.search(r'export default function\s+\w+\s*\([^)]*\)\s*{', content)
    
    if func_match:
        func_start = func_match.end()
        injection = "\n  const { colors } = useTheme();\n  const styles = React.useMemo(() => createStyles(colors), [colors]);\n"
        # If React is not imported, we use useMemo directly, let's just use useMemo and insert import if needed
        # Assuming React is imported or we can just use useMemo
        
        content = content[:func_start] + injection + content[func_start:]
        
        # Add useMemo to react import if it's there
        if 'useMemo' not in content:
            if 'import React' in content and 'useMemo' not in content:
                content = content.replace('import React', 'import React, { useMemo }')
            else:
                content = content.replace('import {', 'import { useMemo,', 1) # simple hack
                
        content = content.replace("React.useMemo", "useMemo")
        
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Refactored: {filepath}")

if __name__ == '__main__':
    for filepath in sys.argv[1:]:
        print(f"Processing {filepath}...")
        refactor_file(filepath)
