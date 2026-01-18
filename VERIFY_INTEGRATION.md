# Orbit - Integration Verification Guide

## Quick Verification Steps

### Step 1: Verify Cloud Functions Deployed
```bash
firebase functions:list
```

Expected output:
```
✔ sendSMSNotification
✔ createPayFastPayment
✔ payFastWebhook
✔ getDoctorBilling
✔ getQueueStats
✔ testAuth
```

### Step 2: Verify Frontend Files Updated
Check these files have been updated:
- [x] dashboard.js - sendSMSNotification connected
- [x] ProfileSettings.js - Payment functions connected
- [x] ProfileSettings.html - Add SMS Credits button added

### Step 3: Test Login
1. Open: https://orbit-4b990.web.app/Login.html
2. Email: sanele1238@gmail.com
3. Password: sanele1238#@Test
4. Should redirect to dashboard

### Step 4: Test Queue Management
1. Click "Add to Queue"
2. Fill in patient details
3. Click "Add to Queue"
4. Verify patient appears in queue

### Step 5: Test SMS Integration
1. Click "Call" on a patient
2. Check browser console for function call
3. Verify SMS sent message appears
4. Check Firestore for SMS log entry

### Step 6: Test Payment Integration
1. Go to Profile Settings
2. Click "Add SMS Credits"
3. Enter amount (e.g., 50)
4. Should redirect to PayFast

### Step 7: Check Function Logs
```bash
firebase functions:log
```

Look for:
- sendSMSNotification calls
- createPayFastPayment calls
- No error messages

---

## Integration Points

### Dashboard → sendSMSNotification
**File:** dashboard.js  
**Function:** moveToCurrentPatient()  
**Calls:** sendSMSNotification()  
**Status:** ✅ Connected

### Profile → createPayFastPayment
**File:** ProfileSettings.js  
**Function:** handleAddSmsCredits()  
**Calls:** createPayFastPayment()  
**Status:** ✅ Connected

### Profile → getDoctorBilling
**File:** ProfileSettings.js  
**Function:** loadSmsRate()  
**Calls:** getDoctorBilling()  
**Status:** ✅ Connected

### PayFast → payFastWebhook
**Endpoint:** https://us-central1-orbit-4b990.cloudfunctions.net/payFastWebhook  
**Status:** ✅ Ready

---

## Browser Console Checks

Open browser console (F12) and look for:

### Successful SMS Send
```
SMS sent: {success: true, messageSid: "SM...", cost: 0.95, newBalance: 99.05}
```

### Successful Payment Creation
```
Payment created: {success: true, paymentData: {...}, signature: "...", paymentUrl: "..."}
```

### Successful Billing Load
```
Billing data: {balance: 100, totalSmsSent: 5, smsRate: 0.95, ...}
```

---

## Firestore Verification

### Check SMS Logs
1. Firebase Console → Firestore
2. Collection: sms_logs
3. Should see entries with:
   - doctorId
   - patientPhoneNumber
   - status: "sent"
   - cost: 0.95

### Check Payment Logs
1. Firebase Console → Firestore
2. Collection: payment_logs
3. Should see entries with:
   - doctorId
   - amount
   - status: "succeeded"

### Check Queue
1. Firebase Console → Firestore
2. Collection: queue
3. Should see entries with:
   - patientFullName
   - assignedDoctorId
   - status: "waiting" or "current"

---

## Common Issues & Fixes

### Issue: "sendSMSNotification is not a function"
**Fix:** Ensure dashboard.js is loaded and functions are globally available
```javascript
window.sendSMSNotification = sendSMSNotification;
```

### Issue: "Firebase functions not initialized"
**Fix:** Ensure Firebase SDK is loaded before calling functions
```html
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-functions.js"></script>
```

### Issue: "Permission denied" on Firestore
**Fix:** Check security rules allow the operation
```
match /queue/{queueId} {
  allow read, write: if request.auth.uid == resource.data.assignedDoctorId;
}
```

### Issue: SMS not sending
**Fix:** Check Twilio credentials and balance
```bash
firebase functions:config:get
# Verify twilio.account_sid and twilio.auth_token are set
```

### Issue: Payment not redirecting
**Fix:** Check PayFast credentials and form data
```bash
firebase functions:log
# Look for createPayFastPayment errors
```

---

## Performance Checks

### Function Execution Time
```bash
firebase functions:log
```

Look for execution times:
- sendSMSNotification: < 5 seconds
- createPayFastPayment: < 3 seconds
- getDoctorBilling: < 2 seconds

### Firestore Queries
Check Firebase Console → Firestore → Usage
- Read operations should be minimal
- Write operations should be logged

---

## Security Verification

### Check Authentication
1. Try accessing dashboard without login
2. Should redirect to login page
3. Try accessing functions without auth
4. Should return "unauthenticated" error

### Check Authorization
1. Login as doctor A
2. Try accessing doctor B's data
3. Should be denied
4. Check Firestore rules enforce this

### Check Payment Security
1. Verify PayFast signature validation
2. Check webhook only accepts POST
3. Verify signature matches

---

## Final Checklist

- [ ] All 6 Cloud Functions deployed
- [ ] Dashboard SMS integration working
- [ ] Profile payment integration working
- [ ] Profile billing info loading
- [ ] SMS logs appearing in Firestore
- [ ] Payment logs appearing in Firestore
- [ ] Balance updating correctly
- [ ] No errors in function logs
- [ ] Authentication working
- [ ] Authorization working
- [ ] PayFast webhook configured
- [ ] Twilio credentials set
- [ ] PayFast credentials set

---

## Next Steps

1. **Deploy to Production**
   ```bash
   firebase deploy
   ```

2. **Monitor Logs**
   ```bash
   firebase functions:log --follow
   ```

3. **Test All Features**
   - Login
   - Add patient
   - Send SMS
   - Add credits
   - View billing

4. **Go Live**
   - Share URL with users
   - Monitor for issues
   - Collect feedback

---

**Verification Status:** Ready to Deploy ✅
