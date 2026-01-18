# PayFast Webhook Setup Guide

## 1. Configure PayFast Credentials

```bash
firebase functions:config:set payfast.merchant_id="YOUR_MERCHANT_ID"
firebase functions:config:set payfast.merchant_key="YOUR_MERCHANT_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASSPHRASE"
```

## 2. Deploy the Webhook Function

```bash
cd functions
npm install
cd ..
firebase deploy --only functions:payfastWebhook
```

## 3. Get Your Webhook URL

After deployment, your webhook URL will be:
```
https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook
```

## 4. Configure PayFast Dashboard

1. Log into your PayFast merchant account
2. Go to **Settings** → **Integration**
3. Add the webhook URL:
   ```
   https://us-central1-orbit-4b990.cloudfunctions.net/payfastWebhook
   ```
4. Enable these notifications:
   - Payment Complete
   - Payment Failed
   - Subscription Created
   - Subscription Cancelled

## 5. Test the Webhook

### Using PayFast Sandbox:
1. Use sandbox credentials for testing
2. Webhook URL stays the same
3. PayFast will send test notifications

### What the Webhook Does:

**On COMPLETE Payment:**
- ✅ Updates subscription status to "active"
- ✅ Sets next billing date (+30 days)
- ✅ Logs payment in payment_logs collection
- ✅ Sends confirmation email to user

**On FAILED Payment:**
- ❌ Updates subscription status to "suspended"
- ❌ Logs failed payment
- ❌ Sends failure notification email

## 6. Update createPayFastPayment Function

The existing `createPayFastPayment` function already passes `m_payment_id: userId`, which the webhook uses to identify the doctor.

## 7. Firestore Structure

### doctors collection:
```javascript
{
  subscriptionStatus: 'active' | 'suspended' | 'trial',
  nextBillingDate: Timestamp,
  lastPaymentDate: Timestamp,
  lastPaymentAmount: number,
  payfastToken: string
}
```

### payment_logs collection:
```javascript
{
  doctorId: string,
  amount: number,
  status: 'success' | 'failed',
  paymentStatus: string,
  token: string,
  timestamp: Timestamp
}
```

## 8. Testing Checklist

- [ ] Deploy webhook function
- [ ] Configure PayFast webhook URL
- [ ] Test payment with sandbox
- [ ] Verify Firestore updates
- [ ] Check email notifications
- [ ] Test failed payment scenario
- [ ] Monitor function logs: `firebase functions:log --only payfastWebhook`

## 9. Production Checklist

- [ ] Switch to production PayFast credentials
- [ ] Update webhook URL in PayFast dashboard
- [ ] Test with real payment (small amount)
- [ ] Monitor for 24 hours
- [ ] Set up error alerts

## 10. Monitoring

```bash
# View webhook logs
firebase functions:log --only payfastWebhook

# Follow logs in real-time
firebase functions:log --only payfastWebhook --follow
```

## Troubleshooting

**Signature Mismatch:**
- Verify passphrase matches PayFast dashboard
- Check all parameters are included
- Ensure no extra spaces in values

**Webhook Not Firing:**
- Verify URL in PayFast dashboard
- Check function is deployed
- Test with PayFast sandbox

**Firestore Not Updating:**
- Check doctorId (m_payment_id) is correct
- Verify Firestore permissions
- Check function logs for errors
