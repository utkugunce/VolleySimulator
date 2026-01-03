import os

def generate_core_context(root_dir):
    # Core directories to include completely
    core_dirs = [
        'app/context', 
        'app/hooks', 
        'app/utils', 
        'lib'
    ]
    
    # Specific core files
    core_files = [
        'app/types.ts',
        'package.json',
        'next.config.ts',
        'tsconfig.json',
        'README.md',
        'middleware.ts' # If exists
    ]
    
    # Output files
    output_core = os.path.join(root_dir, 'project_core_context.md')
    output_tree = os.path.join(root_dir, 'project_tree_structure.md')
    
    # 1. Generate Tree Structure
    print("Generating file tree...")
    with open(output_tree, 'w', encoding='utf-8') as tree_file:
        tree_file.write("# Project File Structure\n\n```\n")
        for root, dirs, files in os.walk(root_dir):
            # Skip hidden and excluded dirs
            dirs[:] = [d for d in dirs if d not in ['.git', '.next', 'node_modules', '.gemini', 'coverage']]
            
            level = root.replace(root_dir, '').count(os.sep)
            indent = ' ' * 4 * (level)
            tree_file.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                tree_file.write(f"{subindent}{f}\n")
        tree_file.write("```\n")
        
    # 2. Generate Core Context
    print("Generating core context...")
    with open(output_core, 'w', encoding='utf-8') as outfile:
        outfile.write("# Project Core Context (Types, State, Utils)\n\n")
        
        # Process individual files
        for rel_path in core_files:
            file_path = os.path.join(root_dir, rel_path)
            if os.path.exists(file_path):
                write_file(outfile, file_path, root_dir)
                
        # Process directories
        for rel_dir in core_dirs:
            dir_path = os.path.join(root_dir, rel_dir)
            if not os.path.exists(dir_path):
                continue
                
            for root, dirs, files in os.walk(dir_path):
                for f in files:
                    if f.endswith(('.ts', '.tsx', '.json')):
                        file_path = os.path.join(root, f)
                        write_file(outfile, file_path, root_dir)

def write_file(outfile, file_path, root_dir):
    try:
        if os.path.getsize(file_path) > 100 * 1024:
            rel_path = os.path.relpath(file_path, root_dir)
            outfile.write(f"## File: {rel_path} (SKIPPED - TOO LARGE)\n\n")
            return
            
        with open(file_path, 'r', encoding='utf-8') as infile:
            content = infile.read()
            rel_path = os.path.relpath(file_path, root_dir)
            outfile.write(f"## File: {rel_path}\n")
            outfile.write(f"```typescript\n{content}\n```\n\n")
            print(f"Packed: {rel_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    if os.path.basename(current_dir) == 'scripts':
        root_dir = os.path.dirname(current_dir)
    else:
        root_dir = current_dir
        
    generate_core_context(root_dir)
    print("Done! Generated 'project_core_context.md' and 'project_tree_structure.md'")
