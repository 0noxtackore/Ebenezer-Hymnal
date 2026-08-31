$ErrorActionPreference = 'Stop'
$key = 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM'
$dbUrl = 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app'

# --- 1) Autenticarse ---
$login = @{ email='ramon@ebenezer.dev'; password='Ramon2026'; returnSecureToken=$true } | ConvertTo-Json
$lr = Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$key" `
      -Body $login -ContentType "application/json" -TimeoutSec 30
$idToken = $lr.idToken
Write-Output "LOGIN OK: $($lr.email) (uid=$($lr.localId))"

# --- 2) Cargar datos locales ---
$data = Get-Content -LiteralPath 'C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\assets\hymns.json' -Raw -Encoding UTF8
$parsed = $data | ConvertFrom-Json
Write-Output ("DATOS LOCALES: categories=" + $parsed.categories.Count + " hymns=" + $parsed.hymns.Count)

# --- 3) Subir (PUT autenticado) al nodo hymnario ---
$uri = "$dbUrl/hymnario.json?auth=$idToken"
Invoke-RestMethod -Method Put -Uri $uri -Body $data -ContentType 'application/json; charset=utf-8' -TimeoutSec 120 | Out-Null
Write-Output 'UPLOAD PUT: OK'

# --- 4) Verificar lectura (publica) del nodo ---
$check = Invoke-RestMethod -Method Get -Uri "$dbUrl/hymnario.json" -TimeoutSec 30
Write-Output ("VERIFY: categories=" + $check.categories.Count + " hymns=" + $check.hymns.Count)
$h0 = $check.hymns[0]
Write-Output ("PRIMER himno: N$($h0.number) - $($h0.title) [cat=$($h0.category)]")
