# Orbit Configuration Reference

## Quick Setup Commands

### 1. Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 2. Firebase Setup
```bash
firebase login
firebase use orbit-4b990
```

### 3. Configure Twilio (SMS)
```bash
firebase functions:config:set twilio.account_sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
firebase functions:config:set twilio.auth_token="your_auth_token_here"
firebase functions:config:set twilio.phone_number="+1234567890"
```

### 4. Configure PayFast (Payments)
```bash
firebase functions:config:set payfast.merchant_id="10000100"
firebase functions:config:set payfast.merchant_key="46f1db3175061957"
firebase functions:config:set payfast.passphrase="your_passphrase"
```

### 5. Deploy Functions
```bash
firebase deploy --only functions
```

---

## Environment Variables

### Twilio
- `TWILIO_ACCOUNT_SID` - From Twilio Console
- `TWILIO_AUTH_TOKEN` - From Twilio Console
- `TWILIO_PHONE_NUMBER` - Your Twilio number (e.g., +1234567890)

### PayFast
- `PAYFAST_MERCHANT_ID` - From PayFast Dashboard
- `PAYFAST_MERCHANT_KEY` - From PayFast Dashboard
- `PAYFAST_PASSPHRASE` - Your custom passphrase

### Firebase
- `FIREBASE_PROJECT_ID` - orbit-4b990
- `FIREBASE_API_KEY` - In auth.js and dashboard.js

---

## Firestore Collections

### doctors
```json
{
  "fullName": "Dr. John Doe",
  "email": "john@clinic.com",
  "phoneNumber": "+27821234567",
  "clinicName": "City Medical Center",
  "clinicAddress": "123 Main St, City",
  "balance": 100.50,
  "totalSmsSent": 45,
  "operatingDays": ["mon", "tue", "wed", "thu", "fri"],
  "workingHours": {
    "Monday": "08:00-17:00",
    "Tuesday": "08:00-17:00"
  }
}
```

### queue
```json
{
  "patientFullName": "John Smith",
  "patientPhoneNumber": "+27821234567",
  "patientGender": "Male",
  "assignedDoctorId": "uid_of_doctor",
  "status": "waiting",
  "timestampAdded": "2024-01-15T10:30:00Z",
  "smsNotified": false
}
```

### sms_logs
```json
{
  "doctorId": "uid_of_doctor",
  "queueId": "queue_document_id",
  "patientPhoneNumber": "+27821234567",
  "message": "Hello John, it's your turn...",
  "status": "sent",
  "cost": 0.95,
  "twilioSid": "SM1234567890abcdef",
  "sentAt": "2024-01-15T10:35:00Z"
}
```

### payment_logs
```json
{
  "doctorId": "uid_of_doctor",
  "amount": 50.00,
  "currency": "ZAR",
  "status": "succeeded",
  "payFastPaymentId": "1234567890",
  "paymentId": "ORB_1234567890_abc123",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

---

## Cloud Functions

### sendSMSNotification
**Type:** Callable  
**Input:**
```javascript
{
  doctorId: "uid",
  queueId: "queue_id",
  patientPhone: "+27821234567",
  patientName: "John Smith"
}
```
**Output:**
```javascript
{
  success: true,
  messageSid: "SM1234567890",
  cost: 0.95,
  newBalance: 99.55
}
```

### createPayFastPayment
**Type:** Callable  
**Input:**
```javascript
{
  doctorId: "uid",
  amount: 100
}
```
**Output:**
```javascript
{
  success: true,
  paymentData: { /* PayFast form data */ },
  signature: "md5_hash",
  paymentUrl: "https://sandbox.payfast.co.za/eng/process",
  paymentId: "ORB_1234567890_abc123"
}
```

### getDoctorBilling
**Type:** Callable  
**Input:**
```javascript
{
  doctorId: "uid"
}
```
**Output:**
```javascript
{
  balance: 99.55,
  totalSmsSent: 45,
  totalSpent: 42.75,
  smsRate: 0.95,
  recentSMS: [ /* array of SMS logs */ ],
  recentPayments: [ /* array of payments */ ]
}
```

### getQueueStats
**Type:** Callable  
**Input:**
```javascript
{
  doctorId: "uid"
}
```
**Output:**
```javascript
{
  activeQueue: 5,
  completed: 12,
  cancelled: 1,
  total: 18,
  avgWaitTime: 15
}
```

---

## Testing

### Test Authentication
```javascript
const testAuth = firebase.functions().httpsCallable('testAuth');
testAuth().then(result => console.log(result.data));
```

### Test SMS Sending
```javascript
const sendSMS = firebase.functions().httpsCallable('sendSMSNotification');
sendSMS({
  doctorId: 'uid',
  queueId: 'queue_id',
  patientPhone: '+27821234567',
  patientName: 'John'
}).then(result => console.log(result.data));
```

### Test Payment Creation
```javascript
const createPayment = firebase.functions().httpsCallable('createPayFastPayment');
createPayment({
  doctorId: 'uid',
  amount: 100
}).then(result => console.log(result.data));
```

---

## Deployment Checklist

- [ ] Twilio credentials configured
- [ ] PayFast credentials configured
- [ ] Firebase authentication enabled
- [ ] Firestore security rules updated
- [ ] Cloud Functions deployed
- [ ] Test account created
- [ ] SMS balance added
- [ ] Payment gateway tested
- [ ] All features tested
- [ ] Logs reviewed

---

## Useful Commands

```bash
# View all config
firebase functions:config:get

# View logs
firebase functions:log

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# Test locally
firebase emulators:start --only functions

# List all functions
firebase functions:list

# Delete a function
firebase functions:delete functionName
```

---

## Common Issues & Solutions

### SMS Not Sending
- Check Twilio balance
- Verify phone number format
- Check doctor balance
- Review function logs

### Payment Not Processing
- Verify PayFast credentials
- Check webhook URL
- Verify signature generation
- Review function logs

### Firestore Permission Denied
- Check security rules
- Verify user authentication
- Check doctorId matches uid
- Review Firestore rules

### Functions Not Deploying
- Check Node.js version (22+)
- Verify Firebase CLI installed
- Check internet connection
- Review error messages

---

**Last Updated:** 2024
