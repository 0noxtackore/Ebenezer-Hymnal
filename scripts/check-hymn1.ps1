$data = Invoke-RestMethod -Uri 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app/hymnario/hymns.json'
$found = @()
foreach ($h in $data) {
  if ($h.number -eq 1) { $found += $h }
}
Write-Output "Found: $($found.Count) hymns with number 1"
foreach ($h in $found) {
  Write-Output "ID=$($h.id) Title=$($h.title) Cat=$($h.category)"
}
