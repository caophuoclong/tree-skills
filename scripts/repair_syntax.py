import glob

def fix_errors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    # Revert `useTheme, BranchColors()` back to `useTheme()`
    content = content.replace("useTheme, BranchColors()", "useTheme()")
    
    # Check if there are other weird replacements like `useTheme, BranchColors, BranchColors()`
    content = content.replace("useTheme, BranchColors, BranchColors()", "useTheme()")

    # Let's cleanly fix the import if it's broken. E.g. `import { useTheme, BranchColors, BranchColors } from`
    content = content.replace("import { useTheme, BranchColors, BranchColors }", "import { useTheme, BranchColors }")
    content = content.replace("import { useTheme, BranchColors, BranchColors, BranchColors }", "import { useTheme, BranchColors }")
    
    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Repaired: {filepath}")

files = glob.glob('src/ui/**/*.tsx', recursive=True) + glob.glob('app/**/*.tsx', recursive=True)
for f in files:
    fix_errors(f)
