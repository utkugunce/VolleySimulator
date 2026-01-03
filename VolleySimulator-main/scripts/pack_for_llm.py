import os

def pack_project(root_dir, output_prefix):
    # Files to include (extensions)
    extensions = ['.ts', '.tsx', '.css', '.md', '.json']
    
    # Directories to include (whitelisted)
    include_dirs = ['app', 'components', 'lib', 'types', 'utils', 'hooks', 'public']
    
    # Explicit files to include
    include_files = ['package.json', 'next.config.ts', 'tsconfig.json', 'README.md', 'tailwind.config.ts']
    
    # Directories to exclude
    exclude_dirs = ['node_modules', '.next', '.git', '.gemini', 'scripts', 'coverage']

    # Specific files to exclude (large data)
    exclude_files = ['package-lock.json', 'pnpm-lock.yaml', 'vsl-data.json', '1lig-data.json', 'cev-cl-data.json']

    # Max size per file (approx 100KB)
    MAX_SIZE = 100 * 1024
    
    current_part = 1
    current_size = 0
    current_file = None
    
    def open_new_part():
        nonlocal current_file, current_part, current_size
        if current_file:
            current_file.close()
        
        filename = f"{output_prefix}_part_{current_part}.md"
        current_file = open(filename, 'w', encoding='utf-8')
        current_file.write(f"# Project Application Context - Part {current_part}\n\n")
        current_size = 0
        print(f"Created {filename}")
        current_part += 1

    def write_content(content):
        nonlocal current_size
        if not current_file:
            open_new_part()
            
        # If adding this content exceeds limit (and we have written something), start new part
        if current_size + len(content) > MAX_SIZE and current_size > 0:
            open_new_part()
            
        current_file.write(content)
        current_size += len(content)

    open_new_part()

    # 1. Write specific root files
    for filename in include_files:
        file_path = os.path.join(root_dir, filename)
        if os.path.exists(file_path):
            process_file(file_path, root_dir, write_content)

    # 2. Walk through whitelisted directories
    for dir_name in include_dirs:
        dir_path = os.path.join(root_dir, dir_name)
        if not os.path.exists(dir_path):
            continue
            
        for root, dirs, files in os.walk(dir_path):
            # Remove excluded directories from traversal
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                    
                _, ext = os.path.splitext(file)
                if ext in extensions:
                    file_path = os.path.join(root, file)
                    process_file(file_path, root_dir, write_content)
    
    if current_file:
        current_file.close()

def process_file(file_path, root_dir, write_func):
    try:
        # Check file size - limit to 50KB to avoid massive dumps
        if os.path.getsize(file_path) > 50 * 1024:
            rel_path = os.path.relpath(file_path, root_dir)
            write_func(f"## File: {rel_path} (SKIPPED - TOO LARGE)\n\n")
            return

        with open(file_path, 'r', encoding='utf-8') as infile:
            content = infile.read()
            rel_path = os.path.relpath(file_path, root_dir)
            
            output = f"## File: {rel_path}\n```\n{content}\n```\n\n"
            write_func(output)
            print(f"Packed: {rel_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    if os.path.basename(current_dir) == 'scripts':
        root_dir = os.path.dirname(current_dir)
    else:
        root_dir = current_dir
        
    output_prefix = os.path.join(root_dir, 'project_context')
    
    print(f"Packing project from {root_dir}...")
    pack_project(root_dir, output_prefix)
    print("Done!")
