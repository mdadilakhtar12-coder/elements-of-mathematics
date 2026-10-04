param(
    [Parameter(Mandatory = $true)][string]$ProjectId,
    [Parameter(Mandatory = $true)][string]$AdminEmail,
    [Parameter(Mandatory = $true)][string]$GoogleServicesFile
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if ($ProjectId -notmatch '^[a-z][a-z0-9-]{4,28}[a-z0-9]$') { throw 'Enter a valid Firebase project ID.' }
if ($AdminEmail -notmatch '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$') {
    throw 'Enter a valid admin email.'
}
$taskConfig = Get-Content -Raw -LiteralPath $GoogleServicesFile | ConvertFrom-Json
if ($taskConfig.project_info.project_id -ne $ProjectId) { throw 'The Firebase config belongs to another project.' }
if (-not ($taskConfig.client | Where-Object { $_.client_info.android_client_info.package_name -eq 'com.elementsofmathematics.app' })) {
    throw 'The config must contain Android package com.elementsofmathematics.app.'
}
$taskUtf8 = New-Object System.Text.UTF8Encoding($false)
$taskAdminEmail = $AdminEmail.ToLowerInvariant()
$taskAppConfig = Join-Path $taskRoot 'app/src/main/java/com/elementsofmathematics/app/AppConfig.kt'
$taskText = [IO.File]::ReadAllText($taskAppConfig)
$taskText = [regex]::Replace($taskText, 'const val ADMIN_EMAIL = "[^"]*"', ('const val ADMIN_EMAIL = "' + $taskAdminEmail + '"'))
[IO.File]::WriteAllText($taskAppConfig, $taskText, $taskUtf8)
foreach ($taskRule in @('firebase/firestore.rules', 'firebase/storage.rules')) {
    $taskRulePath = Join-Path $taskRoot $taskRule
    $taskText = [IO.File]::ReadAllText($taskRulePath)
    $taskText = [regex]::Replace($taskText, 'request.auth.token.email == "[^"]*"', ('request.auth.token.email == "' + $taskAdminEmail + '"'))
    [IO.File]::WriteAllText($taskRulePath, $taskText, $taskUtf8)
}
$taskDestination = Join-Path $taskRoot 'app/google-services.json'
if ([IO.Path]::GetFullPath($GoogleServicesFile) -ne [IO.Path]::GetFullPath($taskDestination)) {
    Copy-Item -LiteralPath $GoogleServicesFile -Destination $taskDestination
}
$taskProjectJson = @{ projects = @{ default = $ProjectId } } | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path $taskRoot '.firebaserc'), $taskProjectJson, $taskUtf8)
Write-Output 'Local Firebase configuration is ready. Enable Email/Password authentication, create the admin account, and publish the rules before testing.'
