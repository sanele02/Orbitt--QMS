// Firebase Configuration //orbit-4b990.firebaseapp.com
const firebaseConfig = {
  apiKey: "AIzaSyDfXhHNhjCmPl4MEkSLHeM8x6m0eN1NUY4",
  authDomain: "orbit-4b990.firebaseapp.com",
  projectId: "orbit-4b990",
  storageBucket: "orbit-4b990.firebasestorage.app",
  messagingSenderId: "40079677755",
  appId: "1:40079677755:web:72a525f25b5c61d1cb3f1e",
  measurementId: "G-ZYMS4LBF7L"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

// Show error modal
function showError(title, message, redirectUrl = null) {
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').classList.add('active');
  
  if (redirectUrl) {
    window.errorRedirectUrl = redirectUrl;
  }
}

// Close error modal
function closeErrorModal() {
  document.getElementById('errorModal').classList.remove('active');
  if (window.errorRedirectUrl) {
    window.location.href = window.errorRedirectUrl;
    window.errorRedirectUrl = null;
  }
}

window.closeErrorModal = closeErrorModal;

// Sign Up with Email
async function signUpWithEmail(event) {
  //isProcessingEmailSignup = true;
  event.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const businessName = document.getElementById('businessName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const businessType = document.getElementById('businessType').value;
  const country = document.getElementById('country').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const packageType = document.getElementById('package').value;
  const termsAccepted = document.getElementById('terms').checked;

  // Validation
  if (!businessName || businessName.length < 2) {
    showError('Invalid Business Name', 'Please enter your business name (at least 2 characters).');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showError('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  const phoneRegex = /^(\+27|0)[0-9]{9}$/;
  if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
    showError('Invalid Phone', 'Please enter a valid South African phone number (e.g., 0821234567 or +27821234567).');
    return;
  }

  if (!businessType) {
    showError('Business Type Required', 'Please select your business type.');
    return;
  }

  if (!country) {
    showError('Country Required', 'Please select your country.');
    return;
  }

  if (!password || password.length < 6) {
    showError('Weak Password', 'Password must be at least 6 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    showError('Password Mismatch', 'The passwords you entered do not match. Please try again.');
    return;
  }

  if (!termsAccepted) {
    showError('Terms Required', 'Please accept the Terms and Conditions to continue.');
    return;
  }

  try {
    // Check if email already exists in Firestore (excluding deleted accounts)
    const existingUsers = await firestore.collection('doctors')
      .where('email', '==', email)
      .get();
    
    const activeUser = existingUsers.docs.find(doc => !doc.data().deleted);
    if (activeUser) {
      showError('Account Already Exists', 'This email is already registered. Please login instead.', 'Login.html');
      return;
    }
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    await firestore.collection('doctors').doc(user.uid).set({
      fullName: fullName,
      businessName: businessName,
      email: email,
      phone: phone,
      businessType: businessType,
      country: country,
      packageType: packageType,
      termsAccepted: termsAccepted,
      subscriptionStatus: 'trial',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      onboardingCompleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      authProvider: 'email'
    });

    // Send welcome email
    await firestore.collection('mail').add({
      to: email,
      message: {
        subject: '🎉 Welcome to Orbit - Your Free Trial Starts Now!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                  <tr>
                      <td align="center">
                          <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                              <!-- Header Banner -->
                              <tr>
                                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                      <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 2px;">○ ORBIT</h1>
                                      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px;">QUEUE MANAGEMENT SYSTEM</p>
                                  </td>
                              </tr>
                              
                              <!-- Welcome Badge -->
                              <tr>
                                  <td style="padding: 30px 30px 20px 30px; text-align: center;">
                                      <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; border-radius: 50px; font-size: 20px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                          🎉 Welcome to Orbit!
                                      </div>
                                  </td>
                              </tr>
                              
                              <!-- Content -->
                              <tr>
                                  <td style="padding: 20px 40px;">
                                      <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 10px 0;">Hi <strong>${fullName}</strong>,</p>
                                      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for signing up for Orbit Queue Management System! We're excited to help you streamline your queue operations.</p>
                                      
                                      <!-- Trial Info Box -->
                                      <div style="background: linear-gradient(to bottom, #dbeafe 0%, #ffffff 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                          <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🚀 Your Free Trial</h3>
                                          <table width="100%" cellpadding="8" cellspacing="0">
                                              <tr>
                                                  <td style="color: #6b7280; font-size: 14px;">Trial Duration:</td>
                                                  <td style="text-align: right; font-weight: 600; color: #1f2937; font-size: 14px;">30 Days</td>
                                              </tr>
                                              <tr>
                                                  <td style="color: #6b7280; font-size: 14px;">Started:</td>
                                                  <td style="text-align: right; font-weight: 600; color: #1f2937; font-size: 14px;">${trialStartDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                              </tr>
                                              <tr style="border-top: 2px solid #3b82f6;">
                                                  <td style="padding-top: 15px; color: #1f2937; font-weight: 700; font-size: 16px;">Trial Ends:</td>
                                                  <td style="padding-top: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #1e40af;">${trialEndDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                              </tr>
                                          </table>
                                      </div>
                                      
                                      <!-- Features List -->
                                      <div style="margin: 30px 0;">
                                          <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">✨ What you can do:</h3>
                                          <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                              <li>Add customers to your queue instantly</li>
                                              <li>Display queue on a public screen</li>
                                              <li>Voice announcements for called customers</li>
                                              <li>Track queue statistics and history</li>
                                              <li>Manage multiple queues efficiently</li>
                                          </ul>
                                      </div>
                                      
                                      <!-- CTA Button -->
                                      <div style="text-align: center; margin: 35px 0;">
                                          <a href="https://orbit-4b990.web.app/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Get Started →</a>
                                      </div>
                                      
                                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">Need help? Contact us at <a href="mailto:sanelemhlanga70@gmail.com" style="color: #667eea; text-decoration: none;">sanelemhlanga70@gmail.com</a></p>
                                  </td>
                              </tr>
                              
                              <!-- Footer Banner -->
                              <tr>
                                  <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px 40px; text-align: center;">
                                      <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 15px; font-weight: 500;">Welcome to the Orbit family! 🚀</p>
                                      <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">This is an automated email. Please do not reply to this message.</p>
                                      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                                          <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">© 2024 Orbit Queue Management System. All rights reserved.</p>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
        `
      }
    });

    window.location.href = 'dashboard.html?newUser=true';
  } catch (error) {
    console.error('Sign up error:', error);
    if (error.code === 'auth/email-already-in-use') {
      showError('Account Already Exists', 'This email is already registered. Please login instead.', 'Login.html');
    } else {
      showError('Sign Up Failed', error.message);
    }
  }
}

// Sign Up with Google
async function signUpWithGoogle() {
  isProcessingGoogleSignup = true;
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // Check if user already exists in Firestore (excluding deleted accounts)
    const existingUsers = await firestore.collection('doctors')
      .where('email', '==', user.email)
      .get();
    
    const activeUser = existingUsers.docs.find(doc => !doc.data().deleted);
    if (activeUser) {
      await auth.signOut();
      isProcessingGoogleSignup = false;
      showError('Account Already Exists', 'This email is already registered. Please login instead.', 'Login.html');
      return;
    }

    const docRef = firestore.collection('doctors').doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists && !docSnap.data()?.deleted) {
      await auth.signOut();
      isProcessingGoogleSignup = false;
      showError('Account Already Exists', 'This account already exists. Please login instead.', 'Login.html');
      return;
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    await docRef.set({
      fullName: user.displayName || '',
      businessName: '',
      email: user.email,
      phone: user.phoneNumber || '',
      businessType: '',
      country: '',
      packageType: 'starter',
      subscriptionStatus: 'trial',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      onboardingCompleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      authProvider: 'google'
    });

    // Send welcome email
    await firestore.collection('mail').add({
      to: user.email,
      message: {
        subject: '🎉 Welcome to Orbit - Your Free Trial Starts Now!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                  <tr>
                      <td align="center">
                          <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                              <!-- Header Banner -->
                              <tr>
                                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                      <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 2px;">○ ORBIT</h1>
                                      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px;">QUEUE MANAGEMENT SYSTEM</p>
                                  </td>
                              </tr>
                              
                              <!-- Welcome Badge -->
                              <tr>
                                  <td style="padding: 30px 30px 20px 30px; text-align: center;">
                                      <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; border-radius: 50px; font-size: 20px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                          🎉 Welcome to Orbit!
                                      </div>
                                  </td>
                              </tr>
                              
                              <!-- Content -->
                              <tr>
                                  <td style="padding: 20px 40px;">
                                      <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 10px 0;">Hi <strong>${user.displayName || 'there'}</strong>,</p>
                                      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for signing up for Orbit Queue Management System! We're excited to help you streamline your queue operations.</p>
                                      
                                      <!-- Trial Info Box -->
                                      <div style="background: linear-gradient(to bottom, #dbeafe 0%, #ffffff 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                          <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">🚀 Your Free Trial</h3>
                                          <table width="100%" cellpadding="8" cellspacing="0">
                                              <tr>
                                                  <td style="color: #6b7280; font-size: 14px;">Trial Duration:</td>
                                                  <td style="text-align: right; font-weight: 600; color: #1f2937; font-size: 14px;">30 Days</td>
                                              </tr>
                                              <tr>
                                                  <td style="color: #6b7280; font-size: 14px;">Started:</td>
                                                  <td style="text-align: right; font-weight: 600; color: #1f2937; font-size: 14px;">${trialStartDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                              </tr>
                                              <tr style="border-top: 2px solid #3b82f6;">
                                                  <td style="padding-top: 15px; color: #1f2937; font-weight: 700; font-size: 16px;">Trial Ends:</td>
                                                  <td style="padding-top: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #1e40af;">${trialEndDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                              </tr>
                                          </table>
                                      </div>
                                      
                                      <!-- Features List -->
                                      <div style="margin: 30px 0;">
                                          <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">✨ What you can do:</h3>
                                          <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                              <li>Add customers to your queue instantly</li>
                                              <li>Display queue on a public screen</li>
                                              <li>Voice announcements for called customers</li>
                                              <li>Track queue statistics and history</li>
                                              <li>Manage multiple queues efficiently</li>
                                          </ul>
                                      </div>
                                      
                                      <!-- CTA Button -->
                                      <div style="text-align: center; margin: 35px 0;">
                                          <a href="https://orbit-4b990.web.app/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Get Started →</a>
                                      </div>
                                      
                                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">Need help? Contact us at <a href="mailto:sanelemhlanga70@gmail.com" style="color: #667eea; text-decoration: none;">sanelemhlanga70@gmail.com</a></p>
                                  </td>
                              </tr>
                              
                              <!-- Footer Banner -->
                              <tr>
                                  <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px 40px; text-align: center;">
                                      <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 15px; font-weight: 500;">Welcome to the Orbit family! 🚀</p>
                                      <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">This is an automated email. Please do not reply to this message.</p>
                                      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                                          <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">© 2024 Orbit Queue Management System. All rights reserved.</p>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
        `
      }
    });

    isProcessingGoogleSignup = false;
    window.location.href = 'dashboard.html?newUser=true';
  } catch (error) {
    console.error('Google sign up error:', error);
    isProcessingGoogleSignup = false;
    if (error.code !== 'auth/popup-closed-by-user') {
      showError('Sign Up Failed', error.message);
    }
  }
}

// Check if already logged in
let isProcessingGoogleSignup = false;
auth.onAuthStateChanged(user => {
  if (user && !isProcessingGoogleSignup) {
    window.location.href = 'dashboard.html';
  }
});
