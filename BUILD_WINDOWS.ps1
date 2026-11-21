# Builds an NSIS Windows installer, requires Internet the first time for packages.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path node_modules)) { npm install; if($LASTEXITCODE -ne 0){throw "npm install failed"} }
npm run check:data; if($LASTEXITCODE -ne 0){throw "Content failed validation"}
npm run desktop:build; if($LASTEXITCODE -ne 0){throw "Windows build failed"}
Write-Host "Look for the installer under src-tauri\target\release\bundle\nsis\"
