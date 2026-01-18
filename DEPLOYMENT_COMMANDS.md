# Orbit - Deployment Commands

## Step-by-Step Deployment

### STEP 1: Prepare Environment
```bash
cd c:\Users\Sanele\OneDrive\Desktop\Orbit
npm install
cd functions
npm install
cd ..
```

### STEP 2: Login to Firebase
```bash
firebase login
firebase use orbit-4b990
```

### STEP 3: Configure Twilio (SMS Service)

Get your credentials from: https://www.twilio.com/console

```bash
firebase functions:config:set twilio.account_sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
firebase functions:config:set twilio.auth_token="your_auth_token_here"
firebase functions:config:set twilio.phone_number="+1234567890"
```

**Example:**
```bash
firebase functions:config:set twilio.account_sid=" "
firebase functions:config:set twilio.auth_token=" "
firebase functions:config:set twilio.phone_number=" "
```

### STEP 4: Configure PayFast (Payment Service)

Get your credentials from: https://sandbox.payfast.co.za (for testing)

```bash
firebase functions:config:set payfast.merchant_id="10000100"
firebase functions:config:set payfast.merchant_key="46f1db3175061957"
firebase functions:config:set payfast.passphrase="your_custom_passphrase"
```

### STEP 5: Verify Configuration
```bash
firebase functions:config:get
```

You should see output like:
```json
{
  "twilio": {
    "account_sid": "AC...",
    "auth_token": "...",
    "phone_number": "+1..."
  },
  "payfast": {
    "merchant_id": "10000100",
    "merchant_key": "46f1db3175061957",
    "passphrase": "..."
  }
}
```

### STEP 6: Deploy Cloud Functions
```bash
firebase deploy --only functions
```

Wait for deployment to complete. You should see:
```
✔  Deploy complete!
```

### STEP 7: Deploy Hosting (Frontend)
```bash
firebase deploy --only hosting
```

### STEP 8: Verify Deployment
```bash
firebase functions:list
firebase functions:log
```

---

## Testing After Deployment

### Test 1: Check Functions Deployed
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

### Test 2: Check Hosting
Open in browser:
- https://orbit-4b990.web.app/
- https://orbit-4b990.web.app/Login.html
- https://orbit-4b990.web.app/dashboard.html

### Test 3: Test Login
1. Go to https://orbit-4b990.web.app/Login.html
2. Enter: sanele1238@gmail.com
3. Enter: sanele1238#@Test
4. Should redirect to dashboard

### Test 4: View Logs
```bash
firebase functions:log
```

---

## Troubleshooting Deployment

### Issue: "Permission denied" during deploy
**Solution:**
```bash
firebase logout
firebase login
firebase use orbit-4b990
firebase deploy --only functions
```

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

### Issue: "Node version mismatch"
**Solution:**
```bash
node --version  # Should be 22+
npm --version   # Should be 10+
```

If not, update Node.js from https://nodejs.org/

### Issue: "Functions deploy fails"
**Solution:**
```bash
cd functions
npm install
npm run lint
cd ..
firebase deploy --only functions
```

---

## Post-Deployment Checklist

- [ ] All functions deployed successfully
- [ ] Hosting deployed successfully
- [ ] Login page accessible
- [ ] Dashboard loads after login
- [ ] Twilio credentials configured
- [ ] PayFast credentials configured
- [ ] Firestore security rules updated
- [ ] Test account created
- [ ] SMS balance added to test account
- [ ] Payment gateway tested
- [ ] All features tested
- [ ] Logs reviewed for errors

---

## Useful Commands Reference

```bash
# View all configuration
firebase functions:config:get

# View function logs
firebase functions:log

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# List all functions
firebase functions:list

# Delete a function
firebase functions:delete functionName

# Test locally
firebase emulators:start --only functions

# Stop emulator
Ctrl + C

# Check Firebase project
firebase projects:list

# Switch project
firebase use orbit-4b990

# View Firestore
firebase firestore:indexes

# Export data
firebase firestore:export ./backup

# Import data
firebase firestore:import ./backup
```

---

## Production URLs

After deployment, your app is available at:

- **Main Site**: https://orbit-4b990.web.app/
- **Login**: https://orbit-4b990.web.app/Login.html
- **Dashboard**: https://orbit-4b990.web.app/dashboard.html
- **Profile**: https://orbit-4b990.web.app/ProfileSettings.html
- **PayFast Webhook**: https://us-central1-orbit-4b990.cloudfunctions.net/payFastWebhook

---

## Monitoring After Deployment

### View Real-time Logs
```bash
firebase functions:log --follow
```

### Monitor Firestore
1. Go to Firebase Console
2. Click Firestore Database
3. Check collections:
   - doctors
   - queue
   - sms_logs
   - payment_logs

### Monitor Functions
1. Go to Firebase Console
2. Click Functions
3. View execution stats
4. Check error rates

---

## Rollback (If Needed)

### Rollback Functions
```bash
# Delete current functions
firebase functions:delete sendSMSNotification
firebase functions:delete createPayFastPayment
firebase functions:delete payFastWebhook
firebase functions:delete getDoctorBilling
firebase functions:delete getQueueStats
firebase functions:delete testAuth

# Redeploy from backup
firebase deploy --only functions
```

### Rollback Hosting
```bash
firebase hosting:channel:list
firebase hosting:clone orbit-4b990:live orbit-4b990:backup
```

---

## Performance Optimization

### Optimize Functions
```bash
# Check function performance
firebase functions:log

# Monitor execution time
# Look for functions taking > 5 seconds
```

### Optimize Firestore
```bash
# Check indexes
firebase firestore:indexes

# Monitor read/write operations
# Go to Firebase Console → Firestore → Usage
```

---

## Security Verification

### Verify Security Rules
1. Go to Firebase Console
2. Click Firestore Database
3. Click Rules tab
4. Verify rules are in place

### Verify Authentication
1. Go to Firebase Console
2. Click Authentication
3. Verify Email/Password enabled
4. Check test account exists

### Verify Credentials
```bash
firebase functions:config:get
# Verify all credentials are set
```

---

## Backup Before Deployment

### Backup Firestore
```bash
firebase firestore:export ./backup-$(date +%Y%m%d-%H%M%S)
```

### Backup Code
```bash
git add .
git commit -m "Pre-deployment backup"
git push
```

---

## Final Verification

After deployment, verify everything works:

1. **Login Test**
   - Navigate to https://orbit-4b990.web.app/Login.html
   - Login with test credentials
   - Should redirect to dashboard

2. **Queue Test**
   - Add a patient to queue
   - Verify patient appears in queue list
   - Search for patient

3. **SMS Test**
   - Call a patient (click "Call" button)
   - Verify SMS is sent
   - Check balance deducted

4. **Payment Test**
   - Go to Profile Settings
   - Click "Add SMS Credits"
   - Verify PayFast redirect works

5. **Dashboard Test**
   - Verify stats display
   - Verify current patient shows
   - Verify sidebar toggle works

---

**Deployment Status**: Ready  
**Last Updated**: 2024  
**Firebase Project**: orbit-4b990
