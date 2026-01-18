# 🚀 Deploy PayFast Webhook - Quick Start

## Step 1: Configure PayFast (One-Time Setup)

```bash
firebase functions:config:set payfast.merchant_id="YOUR_MERCHANT_ID"
firebase functions:config:set payfast.merchant_key="YOUR_MERCHANT_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASSPHRASE"
```

## Step 2: Deploy Webhook

### Option A: Double-click (Windows)
```
deploy-webhook.bat
```

### Option B: Manual
```bash
cd functions
npm install
cd ..
firebase deploy --only functions:payfastWebhook
```

## Step 3: Copy Webhook URL

```
https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook
```

## Step 4: Add to PayFast Dashboard

1. Login to PayFast
2. Settings → Integration
3. Paste webhook URL
4. Enable notifications

## Step 5: Test

Open `test-webhook.html` in browser and test!

---

## That's It! 🎉

Your subscription system is now fully automated:
- ✅ Payments processed automatically
- ✅ Subscriptions renewed monthly
- ✅ Emails sent automatically
- ✅ No manual work required

## Monitor

```bash
firebase functions:log --only payfastWebhook --follow
```
