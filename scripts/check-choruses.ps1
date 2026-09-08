$data = Invoke-RestMethod -Uri 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app/hymnario/hymns.json'
$chorusCats = @('Coros Lentos', 'Coros Rápidos', 'Gospel')
Write-Output "=== ALL CHORUS CATEGORIES ==="
foreach ($h in $data) {
  if ($chorusCats -contains $h.category) {
    Write-Output "Num=$($h.number) Key=$($h.musicKey) Scale=$($h.scale) Title=$($h.title) Cat=$($h.category) ID=$($h.id)"
  }
}
Write-Output ""
Write-Output "=== DUPLICATE NUMBERS ==="
$groups = $data | Group-Object number | Where-Object { $_.Count -gt 1 }
foreach ($g in $groups) {
  Write-Output "Number $($g.Name): $($g.Count) entries"
  foreach ($h in $g.Group) {
    Write-Output "  - Cat=$($h.category) Key=$($h.musicKey) Scale=$($h.scale) Title=$($h.title) ID=$($h.id)"
  }
}
