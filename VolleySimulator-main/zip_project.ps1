$sourcePath = "."
$destinationPath = "..\ligtahmin2_yedek.zip"
$excludeFolders = @("node_modules", ".next", ".git", ".vscode", "WinForms_Backup")

Get-ChildItem -Path $sourcePath -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($exclude in $excludeFolders) {
        if ($item.FullName -match "\\$exclude\\") {
            $shouldExclude = $true
            break
        }
    }
    return -not $shouldExclude
} | Compress-Archive -DestinationPath $destinationPath -Force

Write-Host "Proje başarıyla ziplendi: $destinationPath"
