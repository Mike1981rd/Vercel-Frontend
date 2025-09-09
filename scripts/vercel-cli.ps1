$ErrorActionPreference = 'Stop'

# Resolve repo root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir '..')

# Load token if not present
if (-not $env:VERCEL_TOKEN) {
  $envFile = Join-Path $RootDir '.secure/vercel.env'
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
        $parts = $_.Split('=',2)
        if ($parts.Length -eq 2) { [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1]) }
      }
    }
  } elseif (Test-Path "$HOME/.vercel-token") {
    Get-Content "$HOME/.vercel-token" | ForEach-Object {
      if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
        $parts = $_.Split('=',2)
        if ($parts.Length -eq 2) { [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1]) }
      }
    }
  }
}

if (-not $env:VERCEL_TOKEN) {
  Write-Warning "[vercel-cli] No VERCEL_TOKEN set. Using Git-based deploys or existing session."
}

npx vercel @args

