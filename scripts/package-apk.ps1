param([string]$ApkUrl = "")
$ErrorActionPreference = "Stop"
$repoPath = Split-Path -Parent $PSScriptRoot
$gradleText = Get-Content -LiteralPath (Join-Path $repoPath "app/build.gradle.kts") -Raw
$versionName = [regex]::Match($gradleText, 'versionName\s*=\s*"([^"]+)"').Groups[1].Value
$versionCode = [int][regex]::Match($gradleText, 'versionCode\s*=\s*(\d+)').Groups[1].Value
if (-not $versionName -or $versionCode -lt 1) { throw "Could not read the app version" }
$sourcePath = Join-Path $repoPath "app/build/outputs/apk/debug/app-debug.apk"
if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Build and verify the APK before packaging" }
$deliveryPath = Join-Path $repoPath "delivery"
New-Item -ItemType Directory -Force -Path $deliveryPath | Out-Null
$fileName = "Elements-of-Mathematics-$versionName.apk"
$apkPath = Join-Path $deliveryPath $fileName
Copy-Item -LiteralPath $sourcePath -Destination $apkPath
$checksum = (Get-FileHash -LiteralPath $apkPath -Algorithm SHA256).Hash.ToLowerInvariant()
$notes = "Optional folders inside sections, nested navigation and moving PDFs/videos into folders."
$metadata = [ordered]@{ versionCode = $versionCode; versionName = $versionName; apkUrl = $ApkUrl; sha256 = $checksum; notes = $notes }
$metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $deliveryPath "release-$versionName.json") -Encoding utf8
@"
Version: $versionName
Version code: $versionCode
APK file: $fileName
APK SHA-256: $checksum

Upload this APK to a public HTTPS download URL, then use Admin Mode > Publish app update.
Use the same signing key for every update. Never replace it with a fresh CI debug key.
"@ | Set-Content -LiteralPath (Join-Path $deliveryPath "Release-$versionName.txt") -Encoding utf8
Get-Item -LiteralPath $apkPath | Select-Object FullName, Length
$metadata | ConvertTo-Json
