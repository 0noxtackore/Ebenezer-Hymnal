$ErrorActionPreference = 'Stop'
$key = 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM'
$dbUrl = 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app'

$login = @{ email='ramon@ebenezer.dev'; password='Ramon2026'; returnSecureToken=$true } | ConvertTo-Json
$lr = Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$key" -Body $login -ContentType "application/json" -TimeoutSec 30
$idToken = $lr.idToken
Write-Output "LOGIN OK"

$raw = Invoke-RestMethod -Uri "$dbUrl/hymnario.json" -TimeoutSec 30
$hymns = @($raw.hymns)
$categories = $raw.categories
Write-Output "DOWNLOADED: $($hymns.Count) hymns"

# Remove exact ID duplicates
$seen = @{}
$deduped = @()
foreach ($h in $hymns) {
  if (-not $seen.ContainsKey($h.id)) {
    $seen[$h.id] = $true
    $deduped += $h
  }
}
Write-Output "AFTER ID DEDUP: $($deduped.Count) (removed $($hymns.Count - $deduped.Count))"
$hymns = $deduped

# Remove chorus title duplicates (same normalized title + same category)
$chorusCats = @('Coros Lentos', 'Coros Rapidos', 'Gospel')
$seenChorus = @{}
$cleaned = @()
$removedTitles = @()
foreach ($h in $hymns) {
  $cat = ''
  if ($h.category) { $cat = $h.category }
  $isChorus = $chorusCats -contains $cat
  if ($isChorus) {
    $normTitle = $h.title.ToLower() -replace '[^a-z]', ''
    $key2 = "${cat}|${normTitle}"
    if ($seenChorus.ContainsKey($key2)) {
      $removedTitles += "$($h.number) - $($h.title) [$cat]"
      continue
    }
    $seenChorus[$key2] = $true
  }
  $cleaned += $h
}
Write-Output "AFTER TITLE DEDUP: $($cleaned.Count) (removed $($hymns.Count - $cleaned.Count))"
if ($removedTitles.Count -gt 0) {
  Write-Output "Removed chorus duplicates:"
  $removedTitles | ForEach-Object { Write-Output "  - $_" }
}
$hymns = $cleaned

# Clean titles: remove prefixes like A001, C001, CR001
foreach ($h in $hymns) {
  if ($h.title -match '^\s*[ACG]R?\d+\s*-\s*') {
    $newTitle = $h.title -replace '^\s*[ACG]R?\d+\s*-\s*', ''
    $newTitle = $newTitle.Trim()
    if ($newTitle) {
      Write-Output "RENAME: '$($h.title)' -> '$newTitle'"
      $h.title = $newTitle
    }
  }
}

# Renumber sequentially within each category
$catCounters = @{}
foreach ($h in $hymns) {
  $cat = 'Sin Categoria'
  if ($h.category) { $cat = $h.category }
  if (-not $catCounters.ContainsKey($cat)) { $catCounters[$cat] = 0 }
  $catCounters[$cat]++
  $oldNum = $h.number
  $h.number = $catCounters[$cat]
  if ($oldNum -ne $h.number) {
    Write-Output "RENUMBER [$cat]: $oldNum -> $($h.number) ($($h.title))"
  }
}

Write-Output ""
Write-Output "=== FINAL STATE ==="
Write-Output "Total: $($hymns.Count) hymns"
foreach ($cat in $catCounters.Keys) {
  Write-Output "  ${cat}: $($catCounters[$cat])"
}

$payload = @{ categories = $categories; hymns = $hymns } | ConvertTo-Json -Depth 10 -Compress
$uri = "$dbUrl/hymnario.json?auth=$idToken"
Invoke-RestMethod -Method Put -Uri $uri -Body $payload -ContentType 'application/json; charset=utf-8' -TimeoutSec 120 | Out-Null
Write-Output ""
Write-Output "UPLOAD OK"

$verify = Invoke-RestMethod -Uri "$dbUrl/hymnario.json" -TimeoutSec 30
Write-Output "VERIFY: $($verify.hymns.Count) hymns"
