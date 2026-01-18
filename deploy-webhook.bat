@echo off
echo ========================================
echo   PayFast Webhook Deployment
echo ========================================
echo.

echo Step 1: Installing dependencies...
cd functions
call npm install
cd ..
echo.

echo Step 2: Deploying webhook function...
call firebase deploy --only functions:payfastWebhook
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your webhook URL is:
echo https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook
echo.
echo Next steps:
echo 1. Copy the webhook URL above
echo 2. Go to PayFast dashboard
echo 3. Add webhook URL in Settings -^> Integration
echo.
pause
