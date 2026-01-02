$interval = 600 # 10 minutes
while ($true) {
    Write-Host "Checking for changes..."
    $status = git status --porcelain
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "Changes detected. Committing and pushing... ($timestamp)"
        git add .
        git commit -m "Auto-save: $timestamp"
        git push
        Write-Host "Push complete."
    } else {
        Write-Host "No changes detected."
    }
    Write-Host "Waiting for $interval seconds..."
    Start-Sleep -Seconds $interval
}
