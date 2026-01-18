import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// sanele1238#@Test
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDfXhHNhjCmPl4MEkSLHeM8x6m0eN1NUY4",
  authDomain: "orbit-4b990.firebaseapp.com",
  projectId: "orbit-4b990",
  storageBucket: "orbit-4b990.firebasestorage.app",
  messagingSenderId: "40079677755",
  appId: "1:40079677755:web:72a525f25b5c61d1cb3f1e",
  measurementId: "G-ZYMS4LBF7L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check trial status
async function checkTrialStatus(user) {
    try {
        const docSnap = await getDoc(doc(db, 'doctors', user.uid));
        if (!docSnap.exists()) return 'dashboard.html';
        
        const userData = docSnap.data();
        
        // If already active subscription, go to dashboard
        if (userData.subscriptionStatus === 'active') {
            return 'dashboard.html';
        }
        
        // Check trial expiry using trialEndDate
        if (userData.subscriptionStatus === 'trial') {
            if (userData.trialEndDate) {
                const trialEnd = userData.trialEndDate.toDate ? userData.trialEndDate.toDate() : new Date(userData.trialEndDate);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                trialEnd.setHours(0, 0, 0, 0);
                
                if (now > trialEnd) {
                    return 'subscribe.html';
                }
            }
        }
        
        return 'dashboard.html';
    } catch (error) {
        console.error('Error checking trial:', error);
        return 'dashboard.html';
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorBox = document.getElementById('errorBox');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page from refreshing
        
        //inputs
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const loginBtn = document.getElementById('loginBtn');
        
        // Clear previous errors
        errorBox.style.display = 'none';
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Show loading
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        //firebase function
        console.log('Attempting login with:', email);
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                console.log('Login successful:', userCredential.user);
                showSuccess('Login successful! Redirecting...');
                
                const redirectUrl = await checkTrialStatus(userCredential.user);
                
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            })
            .catch((error) => {
                console.error('Login error code:', error.code);
                console.error('Login error message:', error.message);
                console.error('Full error:', error);
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
                
                let errorMessage;
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid email or password. Please check your credentials.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        errorMessage = 'Login failed: ' + error.message;
                }
                showError(errorMessage);
            });
    });
    
    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        errorBox.style.background = '#f44336';
        errorBox.style.color = 'white';
    }
    
    function showSuccess(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        errorBox.style.background = '#4CAF50';
        errorBox.style.color = 'white';
    }
    
    // Forgot password handler
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            
            if (!email) {
                showError('Please enter your email address first');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            console.log('Sending password reset to:', email);
            
            // Use Firebase's built-in password reset (will use your customized template)
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    showSuccess('Password reset email sent from sanelemhlanga70@gmail.com! Check your inbox.');
                })
                .catch((error) => {
                    console.error('Password reset error code:', error.code);
                    console.error('Password reset error:', error);
                    
                    let errorMessage;
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage = 'No account found with this email';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address';
                            break;
                        default:
                            errorMessage = 'Failed to send reset email: ' + error.message;
                    }
                    showError(errorMessage);
                });
        });
    }
    
    // Google Sign In
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function() {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                console.log('Google login successful:', result.user);
                showSuccess('Login successful! Redirecting...');
                
                const redirectUrl = await checkTrialStatus(result.user);
                
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } catch (error) {
                console.error('Google login error:', error);
                if (error.code !== 'auth/popup-closed-by-user') {
                    showError('Google sign-in failed: ' + error.message);
                }
            }
        });
    }
});
