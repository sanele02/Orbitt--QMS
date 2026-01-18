# How to Test PayFast Webhook

## ⚠️ Why Browser Test Failed

**You CANNOT test webhooks from a browser!**

Webhooks are designed to be called by PayFast servers, not browsers. When you try from a browser:
- ❌ CORS blocks the request
- ❌ Signature validation fails
- ❌ PayFast won't accept browser requests

## ✅ Correct Way to Test

### Step 1: Deploy the Webhook First

```bash
# Open Command Prompt in Orbit folder
firebase deploy --only functions:payfastWebhook
```

Wait for deployment to complete. You'll see:
```
✔ functions[payfastWebhook] Successful create operation.
```

### Step 2: Verify Deployment

```bash
firebase functions:list
```

You should see `payfastWebhook` in the list.

### Step 3: Test with PayFast Sandbox

**Option A: Use PayFast Sandbox (Recommended)**

1. Get PayFast sandbox credentials from: https://sandbox.payfast.co.za
2. Configure sandbox credentials:
   ```bash
   firebase functions:config:set payfast.merchant_id="10000100"
   firebase functions:config:set payfast.merchant_key="46f0cd694581a"
   firebase functions:config:set payfast.passphrase="jt7NOE43FZPn"
   ```
3. Redeploy:
   ```bash
   firebase deploy --only functions:payfastWebhook
   ```
4. Make a test payment through your app
5. PayFast sandbox will call your webhook
6. Check logs:
   ```bash
   firebase functions:log --only payfastWebhook
   ```

**Option B: Use cURL (Advanced)**

```bash
curl -X POST https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "m_payment_id": "YOUR_USER_ID",
    "payment_status": "COMPLETE",
    "amount_gross": "299.00",
    "item_name": "Orbit Starter Plan",
    "token": "test_token",
    "signature": "test_sig"
  }'
```

Note: This will fail signature validation but you'll see the webhook was called.

### Step 4: Monitor Logs

```bash
# View recent logs
firebase functions:log --only payfastWebhook

# Follow logs in real-time
firebase functions:log --only payfastWebhook --follow
```

### Step 5: Check Firestore

After a successful webhook call, check these collections:
1. **doctors** - Check `subscriptionStatus` updated to "active"
2. **payment_logs** - Check payment was logged
3. **mail** - Check confirmation email was queued

## 🧪 Testing Checklist

- [ ] Webhook deployed successfully
- [ ] Webhook URL added to PayFast dashboard
- [ ] Made test payment via PayFast sandbox
- [ ] Webhook received payment notification (check logs)
- [ ] Firestore updated correctly
- [ ] Email sent to user

## 🐛 Troubleshooting

**"Function not found"**
- Deploy the function first: `firebase deploy --only functions:payfastWebhook`

**"Invalid signature"**
- This is expected for manual tests
- Real PayFast payments will have valid signatures

**"No logs showing"**
- Wait 1-2 minutes for logs to appear
- Check you're looking at the right function: `--only payfastWebhook`

**"Firestore not updating"**
- Check the `m_payment_id` matches a real user ID in Firestore
- Check Firestore security rules allow writes

## 📊 What Success Looks Like

**In Firebase Logs:**
```
PayFast webhook received: { payment_status: 'COMPLETE', ... }
Subscription activated successfully
```

**In Firestore (doctors collection):**
```javascript
{
  subscriptionStatus: 'active',
  nextBillingDate: Timestamp (30 days from now),
  lastPaymentDate: Timestamp (now),
  lastPaymentAmount: 299
}
```

**In Firestore (payment_logs collection):**
```javascript
{
  doctorId: 'user123',
  amount: 299,
  status: 'success',
  timestamp: Timestamp (now)
}
```

## 🎯 Next Steps

1. Deploy webhook
2. Test with PayFast sandbox
3. Verify everything works
4. Switch to production PayFast credentials
5. Go live! 🚀
