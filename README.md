# Orbit - Queue Management System

A modern, SMS-powered queue management system for clinics with real-time dashboard, payment integration, and automated patient notifications.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Firebase CLI
- Twilio Account
- PayFast Account (South Africa)

### Installation
```bash
npm install
cd functions && npm install && cd ..
firebase login
firebase use orbit-4b990
```

### Configuration
See [DEPLOYMENT_COMMANDS.md](DEPLOYMENT_COMMANDS.md) for detailed setup.

### Deploy
```bash
firebase deploy --only functions
firebase deploy --only hosting
```

---

## 📋 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[CONFIGURATION.md](CONFIGURATION.md)** - Configuration reference and API specs
- **[DEPLOYMENT_COMMANDS.md](DEPLOYMENT_COMMANDS.md)** - Step-by-step deployment
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview and architecture

---

## ✨ Features

### Queue Management
- Add patients to queue
- Real-time queue display
- Call next patient (sends SMS)
- Remove patients from queue
- Search patients by name/phone
- Track queue statistics

### SMS Notifications
- Automatic SMS when patient called
- Twilio integration
- Cost tracking (R0.95 per SMS)
- Balance management
- SMS history logging

### Payments
- PayFast integration
- Add SMS credits
- Payment history
- Automatic balance updates
- Transaction logging

### Dashboard
- Real-time statistics
- Current patient display
- Average wait time calculation
- Patient queue visualization
- Sidebar navigation

### Profile Management
- Update doctor information
- View clinic details
- Manage operating hours
- View billing history
- Reset password

---

## 🏗️ Architecture

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap Icons
- Firebase SDK
- Real-time Firestore listeners

### Backend
- Firebase Cloud Functions (Node.js 22)
- Firestore Database
- Firebase Authentication

### External Services
- Twilio (SMS)
- PayFast (Payments)
- Firebase Hosting

---

## 📁 Project Structure

```
Orbit/
├── index.html                 # Landing page
├── Login.html                 # Login page
├── dashboard.html             # Dashboard
├── ProfileSettings.html       # Profile page
├── auth.js                    # Authentication
├── dashboard.js               # Dashboard logic
├── ProfileSettings.js         # Profile logic
├── functions/
│   ├── index.js               # Cloud Functions
│   └── package.json           # Dependencies
├── SETUP_GUIDE.md             # Setup guide
├── CONFIGURATION.md           # Configuration
├── DEPLOYMENT_COMMANDS.md     # Deployment
├── PROJECT_SUMMARY.md         # Summary
└── README.md                  # This file
```

---

## 🔧 Configuration

### Twilio (SMS)
```bash
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
```

### PayFast (Payments)
```bash
firebase functions:config:set payfast.merchant_id="YOUR_ID"
firebase functions:config:set payfast.merchant_key="YOUR_KEY"
firebase functions:config:set payfast.passphrase="YOUR_PASS"
```

---

## 🚀 Deployment

### Step 1: Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### Step 2: Configure Services
```bash
firebase functions:config:set twilio.account_sid="..."
firebase functions:config:set payfast.merchant_id="..."
```

### Step 3: Deploy
```bash
firebase deploy --only functions
firebase deploy --only hosting
```

### Step 4: Verify
```bash
firebase functions:list
firebase functions:log
```

---

## 🧪 Testing

### Login Test
1. Go to https://orbit-4b990.web.app/Login.html
2. Enter: sanele1238@gmail.com
3. Enter: sanele1238#@Test
4. Should redirect to dashboard

### Queue Test
1. Add patient to queue
2. Verify patient appears
3. Search for patient
4. Call patient (sends SMS)

### Payment Test
1. Go to Profile Settings
2. Click "Add SMS Credits"
3. Verify PayFast redirect

---

## 📊 Cloud Functions

### Available Functions

| Function | Type | Purpose |
|----------|------|---------|
| sendSMSNotification | Callable | Send SMS to patient |
| createPayFastPayment | Callable | Create payment link |
| payFastWebhook | HTTP | Handle payment confirmation |
| getDoctorBilling | Callable | Get billing information |
| getQueueStats | Callable | Get queue statistics |
| testAuth | Callable | Test authentication |

---

## 🔐 Security

- Firebase Authentication (email/password)
- Firestore security rules
- PayFast signature verification
- HTTPS only
- Encrypted credentials
- No sensitive data in logs

---

## 📈 Monitoring

### View Logs
```bash
firebase functions:log
firebase functions:log --follow
```

### Monitor Firestore
- Firebase Console → Firestore → Data
- Check collections for data integrity

### Monitor Payments
- Firebase Console → Firestore → payment_logs
- Verify all transactions recorded

---

## 🐛 Troubleshooting

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

---

## 📚 Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [PayFast Docs](https://www.payfast.co.za/documentation)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

## 🔗 Production URLs

- **Main Site**: https://orbit-4b990.web.app/
- **Login**: https://orbit-4b990.web.app/Login.html
- **Dashboard**: https://orbit-4b990.web.app/dashboard.html
- **Profile**: https://orbit-4b990.web.app/ProfileSettings.html

---

## 📝 License

Proprietary - Orbit Queue Management System

---

## 👤 Support

For issues or questions:
1. Check documentation files
2. Review function logs: `firebase functions:log`
3. Check Firestore security rules
4. Verify environment variables

---

**Status**: ✅ Ready for Deployment  
**Version**: 1.0  
**Firebase Project**: orbit-4b990  
**Last Updated**: 2024
