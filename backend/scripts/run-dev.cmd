@echo off
REM Clears stale RAZORPAY_* env vars, then starts Spring Boot with application-local.properties.
set RAZORPAY_KEY=
set RAZORPAY_KEY_ID=
set RAZORPAY_KEY_SECRET=
set RAZORPAY_SECRET=

cd /d "%~dp0.."
echo Removing stale RAZORPAY_* overrides for this session...
echo Starting backend (profile: local)...
call mvn spring-boot:run -Dspring-boot.run.profiles=local
