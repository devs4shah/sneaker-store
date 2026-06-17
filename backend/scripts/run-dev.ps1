# Starts backend with application-local.properties (not Windows RAZORPAY_* env overrides).
$ErrorActionPreference = "Stop"

$razorpayEnvVars = @(
    "RAZORPAY_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_SECRET"
)

foreach ($name in $razorpayEnvVars) {
    if (Test-Path "Env:$name") {
        Write-Host "Removing stale env var: $name"
        Remove-Item "Env:$name"
    }
}

$backendRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $backendRoot
Write-Host "Starting backend from $backendRoot"
Write-Host "Razorpay keys load from application-local.properties (profile: local)"
Write-Host ""

& mvn spring-boot:run "-Dspring-boot.run.profiles=local"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend exited with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
