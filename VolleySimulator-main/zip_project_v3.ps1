$zipPath = "..\final_upload_clean.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

$tempDir = "..\temp_clean_build"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

$filesToZip = @()

# 1. Add specific root files
$rootFiles = @("package.json", "tsconfig.json", "next.config.ts", "tailwind.config.ts", "postcss.config.mjs", "next-env.d.ts", "README.md", "globals.d.ts", ".eslintrc.json", "eslint.config.mjs")
foreach ($f in $rootFiles) {
    if (Test-Path $f) {
        Copy-Item $f "$tempDir\$f"
        $filesToZip += $f
    }
}

# 2. Add 'app' folder
if (Test-Path "app") {
    New-Item -ItemType Directory -Path "$tempDir\app" | Out-Null
    Copy-Item "app\*" "$tempDir\app" -Recurse
    $appFiles = Get-ChildItem "app" -Recurse -File
    $filesToZip += $appFiles.FullName
}

# 3. Add 'public' folder
if (Test-Path "public") {
    New-Item -ItemType Directory -Path "$tempDir\public" | Out-Null
    Copy-Item "public\*" "$tempDir\public" -Recurse
    $publicFiles = Get-ChildItem "public" -Recurse -File
    $filesToZip += $publicFiles.FullName
}

Write-Host "Toplam Dosya Sayısı: $($filesToZip.Count)"

if ($filesToZip.Count -gt 500) {
    Write-Warning "UYARI: Dosya sayısı beklenenden fazla! Lütfen kontrol edin."
    Get-ChildItem $tempDir -Recurse | Select-Object FullName
}
else {
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
    Write-Host "Zip oluşturuldu: $zipPath"
    Write-Host "Lütfen SADECE bu dosyayı yüklediğinizden emin olun."
}

Remove-Item -Recurse -Force $tempDir
