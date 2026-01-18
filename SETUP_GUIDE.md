# Orbit - Setup & Deployment Guide

## Overview
Orbit is a queue management system with SMS notifications, payments, and real-time dashboard. This guide covers setup, configuration, and deployment.

---

## 1. PREREQUISITES

### Required Tools
- Node.js 22+ (check: `node --version`)
- Firebase CLI (install: `npm install -g firebase-tools`)
- Git (for version control)

### Accounts Needed
- Firebase Project (orbit-4b990) ✅
- Twilio Account (for SMS)
- PayFast Account (for payments - South Africa)

---

## 2. LOCAL SETUP

### Step 1: Install Dependencies
```bash
cd Orbit
npm install
cd functions
npm install
cd ..
```

### Step 2: Firebase Login
```bash
firebase login
firebase use orbit-4b990
```

### Step 3: Verify Firebase Connection
```bash
firebase projects:list
```

---

## 3. CONFIGURE CLOUD FUNCTIONS

### Twilio Configuration
Get credentials from https://www.twilio.com/console

```bash
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_AUTH_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
```

### PayFast Configuration (Sandbox)
Get credentials from https://sandbox.payfast.co.za

```bash
firebase functions:config:set payfast.merchant_id="YOUR_MERCHANT_ID"
firebase functions:config:set payfast.merchant_key="YOUR_MERCHANT_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASSPHRASE"
```

### Verify Configuration
```bash
firebase functions:config:get
```

---

## 4. FIRESTORE DATABASE SETUP

### Create Collections
The following collections are auto-created when data is added:

1. **doctors** - Doctor profiles
   - Fields: fullName, email, phoneNumber, clinicName, clinicAddress, balance, totalSmsSent

2. **queue** - Patient queue
   - Fields: patientFullName, patientPhoneNumber, patientGender, assignedDoctorId, status, timestampAdded

3. **sms_logs** - SMS history
   - Fields: doctorId, queueId, patientPhoneNumber, message, status, cost, sentAt

4. **payment_logs** - Payment history
   - Fields: doctorId, amount, status, payFastPaymentId, createdAt

5. **pending_payments** - Pending transactions
   - Fields: doctorId, amount, status, paymentId, createdAt

### Firestore Security Rules
Update in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doctors can only read/write their own data
    match /doctors/{doctorId} {
      allow read, write: if request.auth.uid == doctorId;
    }
    
    // Queue data - doctors can read their own queue
    match /queue/{queueId} {
      allow read: if request.auth.uid == resource.data.assignedDoctorId;
      allow write: if request.auth.uid == resource.data.assignedDoctorId;
    }
    
    // SMS logs - doctors can read their own
    match /sms_logs/{logId} {
      allow read: if request.auth.uid == resource.data.doctorId;
    }
    
    // Payment logs - doctors can read their own
    match /payment_logs/{paymentId} {
      allow read: if request.auth.uid == resource.data.doctorId;
    }
  }
}
```

---

## 5. FIREBASE AUTHENTICATION SETUP

### Enable Email/Password Auth
1. Go to Firebase Console → Authentication
2. Click "Sign-in method"
3. Enable "Email/Password"

### Create Test Doctor Account
```
Email: sanele1238@gmail.com
Password: sanele1238#@Test
```

---

## 6. DEPLOY CLOUD FUNCTIONS

### Test Locally (Optional)
```bash
firebase emulators:start --only functions
```

### Deploy to Production
```bash
firebase deploy --only functions
```

### Verify Deployment
```bash
firebase functions:list
firebase functions:log
```

---

## 7. CLOUD FUNCTIONS OVERVIEW

### Available Functions

#### 1. **testAuth** (Callable)
- Tests if user is authenticated
- Returns: `{ success: true, uid: "user_id" }`

#### 2. **sendSMSNotification** (Callable)
- Sends SMS to patient when called
- Input: `{ doctorId, queueId, patientPhone, patientName }`
- Deducts R0.95 from doctor's balance
- Returns: `{ success, messageSid, cost, newBalance }`

#### 3. **createPayFastPayment** (Callable)
- Creates payment link for SMS credits
- Input: `{ doctorId, amount }`
- Returns: `{ paymentData, signature, paymentUrl, paymentId }`

#### 4. **payFastWebhook** (HTTP)
- Receives payment confirmation from PayFast
- Auto-updates doctor balance on success
- Logs all transactions

#### 5. **getDoctorBilling** (Callable)
- Gets doctor's billing info
- Returns: `{ balance, totalSmsSent, totalSpent, recentSMS, recentPayments }`

#### 6. **getQueueStats** (Callable)
- Gets queue statistics for today
- Returns: `{ activeQueue, completed, cancelled, total, avgWaitTime }`

---

## 8. FRONTEND INTEGRATION

### Dashboard Features
- Real-time queue display
- Add patients to queue
- Call next patient (sends SMS)
- Search patients
- View statistics

### Profile Settings
- Update doctor info
- View billing history
- Add SMS credits
- Reset password

### Login Page
- Email/password authentication
- Error handling
- Redirect to dashboard on success

---

## 9. TESTING CHECKLIST

### Authentication
- [ ] Login with valid credentials
- [ ] Reject invalid credentials
- [ ] Redirect to dashboard on success
- [ ] Logout functionality works

### Queue Management
- [ ] Add patient to queue
- [ ] Display queue in real-time
- [ ] Call next patient
- [ ] Remove patient from queue
- [ ] Search patients

### SMS Notifications
- [ ] SMS sends when patient called
- [ ] Balance deducts correctly
- [ ] SMS logs recorded
- [ ] Error handling for insufficient balance

### Payments
- [ ] Create payment link
- [ ] PayFast redirect works
- [ ] Payment confirmation updates balance
- [ ] Payment history displays

### Dashboard
- [ ] Stats update in real-time
- [ ] Current patient displays
- [ ] Average wait time calculates
- [ ] Sidebar toggle works

---

## 10. TROUBLESHOOTING

### Issue: "Twilio credentials not configured"
**Solution:**
```bash
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
firebase deploy --only functions
```

### Issue: "PayFast not configured"
**Solution:**
```bash
firebase functions:config:set payfast.merchant_id="YOUR_ID"
firebase functions:config:set payfast.merchant_key="YOUR_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASS"
firebase deploy --only functions
```

### Issue: SMS not sending
1. Check Twilio balance
2. Verify phone number format (+27...)
3. Check function logs: `firebase functions:log`
4. Verify doctor has sufficient balance

### Issue: Payment webhook not working
1. Verify PayFast credentials
2. Check webhook URL in PayFast settings
3. Verify signature generation
4. Check function logs for errors

### Issue: Firestore permission denied
1. Check security rules
2. Verify user is authenticated
3. Check doctorId matches auth.uid
4. Review Firestore rules in console

---

## 11. DEPLOYMENT CHECKLIST

Before going live:

- [ ] All environment variables configured
- [ ] Firestore security rules updated
- [ ] Firebase authentication enabled
- [ ] Cloud Functions deployed
- [ ] SMS credits added to test account
- [ ] Payment gateway tested
- [ ] All features tested locally
- [ ] Error handling verified
- [ ] Logs reviewed for errors
- [ ] Backup created

---

## 12. MONITORING & MAINTENANCE

### View Logs
```bash
firebase functions:log
```

### Monitor Firestore
- Firebase Console → Firestore → Data
- Check collections for data integrity

### Monitor Payments
- Firebase Console → Firestore → payment_logs
- Verify all transactions recorded

### Monitor SMS
- Firebase Console → Firestore → sms_logs
- Check delivery status

---

## 13. PRODUCTION URLS

- **Dashboard:** https://orbit-4b990.web.app/dashboard.html
- **Login:** https://orbit-4b990.web.app/Login.html
- **Profile:** https://orbit-4b990.web.app/ProfileSettings.html
- **PayFast Webhook:** https://us-central1-orbit-4b990.cloudfunctions.net/payFastWebhook

---

## 14. SUPPORT & RESOURCES

- Firebase Docs: https://firebase.google.com/docs
- Twilio Docs: https://www.twilio.com/docs
- PayFast Docs: https://www.payfast.co.za/documentation
- Cloud Functions: https://firebase.google.com/docs/functions

---

**Last Updated:** 2024
**Version:** 1.0
