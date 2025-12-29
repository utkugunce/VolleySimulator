$currentDir = Get-Location
$tempDir = "..\ligtahmin2_temp_upload"
$zipPath = "..\ligtahmin2_upload.zip"

# Clean up previous attempts
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

New-Item -ItemType Directory -Path $tempDir | Out-Null

# Define folders/files to INCLUDE (Whitelist approach is safer here)
$foldersToCopy = @("app", "public", ".vscode")
$filesToCopy = @(
    "package.json", 
    "tsconfig.json", 
    "next.config.ts", 
    "tailwind.config.ts", 
    "postcss.config.mjs", 
    ".eslintrc.json",
    "eslint.config.mjs",
    "next-env.d.ts",
    "README.md",
    ".gitignore"
)

# Copy Folders
foreach ($folder in $foldersToCopy) {
    if (Test-Path "$currentDir\$folder") {
        Copy-Item -Path "$currentDir\$folder" -Destination "$tempDir\$folder" -Recurse
    }
}

# Copy Files
foreach ($file in $filesToCopy) {
    if (Test-Path "$currentDir\$file") {
        Copy-Item -Path "$currentDir\$file" -Destination "$tempDir\$file"
    }
}

# Zip it
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Cleanup temp
Remove-Item -Recurse -Force $tempDir

Write-Host "SUCCESS: Zip created at $zipPath"
