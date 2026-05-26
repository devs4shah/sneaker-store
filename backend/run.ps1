# Start backend with the local Spring profile (loads application-local.properties)
# First-time setup:
#   Copy-Item src\main\resources\application-local.properties.example `
#             src\main\resources\application-local.properties
#   Then edit application-local.properties with your Razorpay test keys.

$localFile = "src\main\resources\application-local.properties"
if (-not (Test-Path $localFile)) {
    Write-Host "ERROR: $localFile not found." -ForegroundColor Red
    Write-Host "Copy application-local.properties.example to application-local.properties and add your Razorpay keys."
    exit 1
}

Write-Host "Starting backend (profile: local)..." -ForegroundColor Green
mvn spring-boot:run
