# 🚀 Webhook Deployment Checklist

## Before You Start

- [ ] You have Firebase CLI installed
- [ ] You're logged into Firebase: `firebase login`
- [ ] You have PayFast merchant credentials

---

## Step 1: Configure PayFast

Open Command Prompt in your Orbit folder and run:

```bash
firebase functions:config:set payfast.merchant_id="YOUR_MERCHANT_ID"
firebase functions:config:set payfast.merchant_key="YOUR_MERCHANT_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASSPHRASE"
```

✅ **Done?** Move to Step 2

---

## Step 2: Deploy Webhook

```bash
firebase deploy --only functions:payfastWebhook
```

Wait for this message:
```
✔ functions[payfastWebhook] Successful create operation.
```

✅ **Done?** Move to Step 3

---

## Step 3: Verify Deployment

```bash
firebase functions:list
```

You should see `payfastWebhook` in the list.

✅ **Done?** Move to Step 4

---

## Step 4: Add Webhook to PayFast

1. Login to PayFast merchant dashboard
2. Go to **Settings** → **Integration**
3. Add webhook URL:
   ```
   https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook
   ```
4. Enable notifications:
   - ✅ Payment Complete
   - ✅ Payment Failed
   - ✅ Subscription Created

✅ **Done?** Move to Step 5

---

## Step 5: Test with Sandbox

1. Use PayFast sandbox credentials:
   ```bash
   firebase functions:config:set payfast.merchant_id="10000100"
   firebase functions:config:set payfast.merchant_key="46f0cd694581a"
   firebase functions:config:set payfast.passphrase="jt7NOE43FZPn"
   ```

2. Redeploy:
   ```bash
   firebase deploy --only functions:payfastWebhook
   ```

3. Make a test payment through your app

4. Check logs:
   ```bash
   firebase functions:log --only payfastWebhook
   ```

✅ **Done?** Move to Step 6

---

## Step 6: Switch to Production

1. Update to production credentials:
   ```bash
   firebase functions:config:set payfast.merchant_id="YOUR_PROD_ID"
   firebase functions:config:set payfast.merchant_key="YOUR_PROD_KEY"
   firebase functions:config:set payfast.passphrase="YOUR_PROD_PASS"
   ```

2. Update payment URL in `functions/index.js`:
   ```javascript
   // Change from:
   paymentUrl: 'https://sandbox.payfast.co.za/eng/process'
   // To:
   paymentUrl: 'https://www.payfast.co.za/eng/process'
   ```

3. Redeploy:
   ```bash
   firebase deploy --only functions
   ```

✅ **Done?** You're live! 🎉

---

## Monitoring

```bash
# View logs
firebase functions:log --only payfastWebhook

# Follow in real-time
firebase functions:log --only payfastWebhook --follow
```

---

## Troubleshooting

**Deployment fails?**
- Check you're in the Orbit folder
- Run `cd functions && npm install && cd ..`
- Try again

**Webhook not receiving calls?**
- Verify URL in PayFast dashboard
- Check function is deployed: `firebase functions:list`
- Check PayFast sandbox is configured

**Signature validation fails?**
- Verify passphrase matches PayFast exactly
- Check no extra spaces in credentials

---

## ✅ Success Indicators

- [ ] Function deployed successfully
- [ ] Webhook URL added to PayFast
- [ ] Test payment processed
- [ ] Logs show "Payment Confirmed"
- [ ] Firestore updated with subscription
- [ ] Email sent to user

**All checked? You're done! 🎉**
