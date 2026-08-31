$ErrorActionPreference = 'Continue'
$key = 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM'

# ----- Cuentas NUEVAS (emails cortos @ebenezer.dev, passwords faciles) -----
$nuevas = @(
  @{ Nombre='Ramon Camacho';   Email='ramon@ebenezer.dev'; Pass='Ramon2026' },
  @{ Nombre='Oswaldo Eli';     Email='eli@ebenezer.dev';   Pass='Eli2026' },
  @{ Nombre='Oswaldo Tona';    Email='tona@ebenezer.dev';  Pass='Tona2026' },
  @{ Nombre='Isaac Rodriguez'; Email='isaac@ebenezer.dev'; Pass='Isaac2026' }
)

# ----- Cuentas VIEJAS a borrar (email y password del .txt anterior) -----
$viejas = @(
  @{ Email='ramon.camacho@ebenezerhymnal.dev'; Pass='hJP%M=FBfi6Cq^ao&vT6' },
  @{ Email='oswaldo.eli@ebenezerhymnal.dev';   Pass='ZzLKDA$C9ES^9qGxGNTj' },
  @{ Email='oswaldo.tona@ebenezerhymnal.dev';  Pass='kphVTVWw&?YMd7n4a@qT' },
  @{ Email='isaac.rodriguez@ebenezerhymnal.dev'; Pass='UentkM*tj76*AmDV3p?Y' },
  @{ Email='probe.973119141.test@ebenezerhymnal.dev'; Pass='ProbePass123!' }
)

function Delete-Account([string]$email, [string]$pass) {
  # 1) iniciar sesion para obtener idToken propio
  $login = @{ email=$email; password=$pass; returnSecureToken=$true } | ConvertTo-Json
  $tok = $null
  try {
    $lr = Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$key" `
          -Body $login -ContentType "application/json" -TimeoutSec 25
    $tok = $lr.idToken
  } catch {
    return "NO_LOGIN: $($_.Exception.Message)"
  }
  # 2) borrar la cuenta con su propio token
  $del = @{ idToken=$tok } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=$key" `
          -Body $del -ContentType "application/json" -TimeoutSec 25 | Out-Null
    return 'BORRADA'
  } catch {
    return "NO_DELETE: $($_.Exception.Message)"
  }
}

# ----- Crear nuevas -----
$lineas = New-Object System.Collections.Generic.List[string]
[void]$lineas.Add('=================================================')
[void]$lineas.Add(' CREDENCIALES DE USUARIOS - HIMNARIO EBENEZER ')
[void]$lineas.Add(' Firebase Authentication (Email/Contrasena) ')
[void]$lineas.Add(" Generadas: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$lineas.Add('=================================================')
[void]$lineas.Add('')

foreach ($u in $nuevas) {
  $body = @{ email=$u.Email; password=$u.Pass; returnSecureToken=$false } | ConvertTo-Json
  $estado = 'OK'
  $detalle = ''
  try {
    $r = Invoke-RestMethod -Method Post -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$key" `
          -Body $body -ContentType "application/json" -TimeoutSec 25
    $detalle = "uid=$($r.localId)"
    Write-Output "NUEVA CREADA: $($u.Email) (uid=$($r.localId))"
  } catch {
    $resp = $_.Exception.Response; $txt=''
    if ($resp) { $sr=New-Object IO.StreamReader($resp.GetResponseStream()); $txt=$sr.ReadToEnd() }
    if ($txt -match 'EMAIL_EXISTS') { $estado='OK'; $detalle='email ya existia (no se cambio pass)' }
    else { $estado='Error'; $detalle="creacion fallo: $txt"; Write-Output "FALLO crear $($u.Email): $txt" }
  }
  [void]$lineas.Add("Usuario   : $($u.Nombre)")
  [void]$lineas.Add("Email     : $($u.Email)")
  [void]$lineas.Add("Password  : $($u.Pass)")
  [void]$lineas.Add("Estado    : $estado | $detalle")
  [void]$lineas.Add('-------------------------------------------------')
}

# ----- Borrar viejas -----
Write-Output ''
Write-Output '--- Borrando cuentas viejas (@ebenezerhymnal.dev + probe) ---'
foreach ($v in $viejas) {
  $res = Delete-Account $v.Email $v.Pass
  Write-Output ("  $($v.Email) => $res")
}

$out = 'C:\Users\PC\Documents\PROGRAMATION\Flutter\Ebenezer-Hymnal\credenciales-firebase.txt'
[void]$lineas.Add('')
[void]$lineas.Add('NOTA: passwords faciles elegidas para desarrollo.')
$lineas -join "`r`n" | Set-Content -LiteralPath $out -Encoding UTF8
Write-Output ''
Write-Output "Archivo actualizado: $out"
