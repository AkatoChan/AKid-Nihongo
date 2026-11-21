# Nihongo Master N4 - Windows PowerShell helper (requires Node.js + Rust + MSVC)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Error "Chua co Node.js. Cai Node.js LTS tai https://nodejs.org/" }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { Write-Error "Chua co Rust. Cai rustup tai https://rustup.rs/ va C++ Build Tools." }
if (-not (Test-Path node_modules)) { npm install; if($LASTEXITCODE -ne 0){throw "npm install failed"} }
npm run check:data; if($LASTEXITCODE -ne 0){throw "Content failed validation"}
npm run desktop:dev; if($LASTEXITCODE -ne 0){throw "Tauri dev failed; check Rust/MSVC/WebView2 prerequisites"}
