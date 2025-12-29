# Auto Git Push Script
# Her 5 dakikada bir degisiklikleri commit ve push yapar

$interval = 300 # 5 dakika (saniye)

Write-Host "Auto-Push Script Baslatildi!" -ForegroundColor Green
Write-Host "Klasor: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Aralik: Her 5 dakika" -ForegroundColor Cyan
Write-Host "Durdurmak icin Ctrl+C" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Degisiklik var mi kontrol et
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "[$timestamp] Degisiklikler bulundu, commit ediliyor..." -ForegroundColor Yellow
        
        git add -A
        git commit -m "Auto-save: $timestamp"
        git push
        
        Write-Host "[$timestamp] Push tamamlandi!" -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] Degisiklik yok, bekleniyor..." -ForegroundColor Gray
    }
    
    Write-Host "[$timestamp] Sonraki kontrol: 5 dakika sonra" -ForegroundColor Cyan
    Write-Host ""
    
    Start-Sleep -Seconds $interval
}
