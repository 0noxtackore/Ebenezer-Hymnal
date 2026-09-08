$ErrorActionPreference = 'Stop'
$key = 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM'
$dbUrl = 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app'

# Login
$login = @{ email='ramon@ebenezer.dev'; password='Ramon2026'; returnSecureToken=$true } | ConvertTo-Json
$lr = Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$key" -Body $login -ContentType "application/json" -TimeoutSec 30
$idToken = $lr.idToken
Write-Output "LOGIN OK"

# Load current DB categories
$raw = Invoke-RestMethod -Uri "$dbUrl/hymnario.json" -TimeoutSec 30
$categories = $raw.categories
Write-Output "Categories: $($categories.Count)"

# Load upload data
$hymns = Get-Content -LiteralPath 'C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\coros-upload.json' -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Output "Hymns to upload: $($hymns.Count)"

# Upload
$payload = @{ categories = $categories; hymns = $hymns } | ConvertTo-Json -Depth 10 -Compress
$uri = "$dbUrl/hymnario.json?auth=$idToken"
Invoke-RestMethod -Method Put -Uri $uri -Body $payload -ContentType 'application/json; charset=utf-8' -TimeoutSec 120 | Out-Null
Write-Output "UPLOAD OK"

# Verify
$verify = Invoke-RestMethod -Uri "$dbUrl/hymnario.json" -TimeoutSec 30
Write-Output "VERIFY: $($verify.hymns.Count) hymns"
