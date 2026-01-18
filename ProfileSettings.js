// ProfileSettings.js
// Make sure Firebase SDK is included in your HTML before this script

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-functions.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const funcs = getFunctions(app);

let doctorId = null;
let originalData = {};
let isEditMode = false;

// Utility to get selected days from buttons
function getSelectedDays() {
    const selected = [];
    document.querySelectorAll('.day-btn.active').forEach(btn => selected.push(btn.dataset.day));
    return selected;
}

// Utility to set day buttons from array
function setSelectedDays(days) {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', days.includes(btn.dataset.day));
    });
}

// Get monthly SMS count and payment due date
function getMonthlyStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Payment due date is 15th of current month
    const paymentDueDate = new Date(currentYear, currentMonth, 15);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
        currentMonth: `${monthNames[currentMonth]} ${currentYear}`,
        paymentDueDate: `${paymentDueDate.getDate()} ${monthNames[currentMonth]}`
    };
}

// Load profile from Firestore
async function loadProfile() {
    if (!doctorId) return;

    try {
        const docRef = doc(db, "doctors", doctorId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log("No profile found! Creating default document...");
            const currentUser = auth.currentUser;
            await setDoc(docRef, {
                doctorId: doctorId,
                fullName: currentUser?.displayName || "",
                phoneNumber: currentUser?.phoneNumber || "",
                email: currentUser?.email || "",
                clinicName: "",
                clinicAddress: "",
                operatingDays: [],
                workingHours: {
                    Monday: "",
                    Tuesday: "",
                    Wednesday: "",
                    Thursday: "",
                    Friday: "",
                    Saturday: "",
                    Sunday: ""
                },
                packageType: "",
                totalSmsSent: 0,
                timestampRegistered: serverTimestamp()
            });
            return loadProfile();
        }

        const data = docSnap.data();
        originalData = { ...data };

        // Fill form fields with fallback to Google account info
        const currentUser = auth.currentUser;
        const fields = {
            'fullName': data.fullName || currentUser?.displayName || "",
            'phoneNumber': data.phoneNumber || currentUser?.phoneNumber || "",
            'email': data.email || currentUser?.email || "",
            'businessName': data.businessName || "",
            'businessAddress': data.businessAddress || "",
            'businessType': data.businessType || "",
            'country': data.country || "",
            'senderId': data.doctorId || ""
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        // Update display names
        let fullName = data.fullName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User';
        document.getElementById('userName').textContent = fullName;
        document.getElementById('doctorNameDisplay').textContent = fullName;
        
        // Update avatar
        const initials = fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().substring(0, 2);
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('avatarDisplay').textContent = initials;

        // Set voice announcements toggle
        const voiceEnabled = data.voiceAnnouncementsEnabled !== false;
        document.getElementById('voiceToggle').checked = voiceEnabled;
        
        console.log('Profile data loaded:', data);
        console.log('Fields populated successfully');

        // Set package information
        const packageType = data.package || 'starter';
        const packageSelect = document.getElementById('packageSelect');
        if (packageSelect) packageSelect.value = packageType;
        
        const packageNames = {
            starter: 'Starter Plan',
            professional: 'Professional Plan',
            enterprise: 'Enterprise Plan'
        };
        const packagePrices = {
            starter: 'R299/month',
            professional: 'R799/month',
            enterprise: 'Custom'
        };
        
        document.getElementById('packageBadge').textContent = packageType.charAt(0).toUpperCase() + packageType.slice(1);
        document.getElementById('packageName').textContent = packageNames[packageType] || 'Starter Plan';
        document.getElementById('packagePrice').textContent = packagePrices[packageType] || 'R149/month';
        
        // Set billing information
        document.getElementById('currentPlan').textContent = packageNames[packageType] || 'Starter Plan';
        
        // Check subscription status
        const subscriptionStatus = data.subscriptionStatus || 'active';
        const statusBadge = document.getElementById('subscriptionStatusBadge');
        const statusText = document.getElementById('subscriptionStatusText');
        const trialEndRow = document.getElementById('trialEndRow');
        const amountRow = document.getElementById('amountRow');
        const nextBillingRow = document.getElementById('nextBillingRow');
        
        if (subscriptionStatus === 'trial') {
            statusBadge.textContent = 'Free Trial';
            statusBadge.className = 'status-badge active';
            
            // Show trial end date
            if (data.trialEndDate) {
                const trialEnd = data.trialEndDate.toDate ? data.trialEndDate.toDate() : new Date(data.trialEndDate);
                const now = new Date();
                const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                
                statusText.textContent = `Free Trial (${daysLeft} days left)`;
                
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                document.getElementById('trialEndDate').textContent = `${trialEnd.getDate()} ${monthNames[trialEnd.getMonth()]} ${trialEnd.getFullYear()}`;
                trialEndRow.style.display = 'flex';
            } else {
                statusText.textContent = 'Free Trial (30 Days)';
            }
            
            amountRow.style.display = 'none';
            nextBillingRow.style.display = 'none';
        } else {
            statusBadge.textContent = 'Active';
            statusBadge.className = 'status-badge active';
            statusText.textContent = 'Active Subscription';
            trialEndRow.style.display = 'none';
            amountRow.style.display = 'flex';
            nextBillingRow.style.display = 'flex';
            
            document.getElementById('currentAmount').textContent = packagePrices[packageType] || 'R299/month';
            
            // Use nextBillingDate from Firestore or calculate from subscription start
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (data.nextBillingDate) {
                const nextBilling = data.nextBillingDate.toDate ? data.nextBillingDate.toDate() : new Date(data.nextBillingDate);
                document.getElementById('nextBilling').textContent = `${nextBilling.getDate()} ${monthNames[nextBilling.getMonth()]} ${nextBilling.getFullYear()}`;
            } else if (data.subscriptionStartDate) {
                const startDate = data.subscriptionStartDate.toDate ? data.subscriptionStartDate.toDate() : new Date(data.subscriptionStartDate);
                const nextBilling = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
                document.getElementById('nextBilling').textContent = `${nextBilling.getDate()} ${monthNames[nextBilling.getMonth()]} ${nextBilling.getFullYear()}`;
            } else {
                document.getElementById('nextBilling').textContent = '-';
            }
        }


        
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error loading profile. Please try again.");
    }
}

// Save profile to Firestore
async function saveProfile() {
    if (!doctorId) return;

    try {
        const fullName = document.getElementById('fullName')?.value.trim() || "";
        const phoneNumber = document.getElementById('phoneNumber')?.value.trim() || "";

        if (!fullName || !phoneNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        const businessName = document.getElementById('businessName')?.value.trim() || "";
        const businessAddress = document.getElementById('businessAddress')?.value.trim() || "";
        const businessType = document.getElementById('businessType')?.value || "";
        const country = document.getElementById('country')?.value || "";
        const packageType = document.getElementById('packageSelect')?.value || 'starter';

        const docRef = doc(db, "doctors", doctorId);
        const updateData = {
            ...originalData,
            fullName,
            phoneNumber,
            businessName,
            businessAddress,
            businessType,
            country,
            packageType,
            updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, updateData, { merge: true });

        alert("Profile saved successfully!");
        originalData = { ...updateData };
        disableEditMode();
        
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Error saving profile. Please try again.");
    }
}

// Enable/disable edit mode
function enableEditMode() {
    console.log('Edit mode enabled');
    isEditMode = true;
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (editBtn) editBtn.style.display = "none";
    if (saveBtn) saveBtn.style.display = "inline-block";
    if (cancelBtn) cancelBtn.style.display = "inline-block";

    ['fullName','phoneNumber','businessName','businessAddress','businessType','country','packageSelect'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = false;
            element.style.backgroundColor = '#fff';
        }
    });
}

function disableEditMode() {
    isEditMode = false;
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (editBtn) editBtn.style.display = "inline-block";
    if (saveBtn) saveBtn.style.display = "none";
    if (cancelBtn) cancelBtn.style.display = "none";

    ['fullName','phoneNumber','businessName','businessAddress','businessType','country','packageSelect'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = true;
            element.style.backgroundColor = '#f5f5f5';
        }
    });
}

// Cancel edit, restore original values
function cancelEdit() {
    document.getElementById('fullName').value = originalData.fullName || "";
    document.getElementById('phoneNumber').value = originalData.phoneNumber || "";
    document.getElementById('businessName').value = originalData.businessName || "";
    document.getElementById('businessAddress').value = originalData.businessAddress || "";
    document.getElementById('businessType').value = originalData.businessType || "";
    document.getElementById('country').value = originalData.country || "";
    const packageSelect = document.getElementById('packageSelect');
    if (packageSelect) packageSelect.value = originalData.packageType || 'starter';
    disableEditMode();
}



// Firebase auth check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        doctorId = user.uid;
        console.log("User authenticated:", doctorId);
        
        // Check trial expiry
        try {
            const docSnap = await getDoc(doc(db, 'doctors', user.uid));
            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.subscriptionStatus === 'trial') {
                    if (userData.trialEndDate) {
                        const trialEnd = userData.trialEndDate.toDate ? userData.trialEndDate.toDate() : new Date(userData.trialEndDate);
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        trialEnd.setHours(0, 0, 0, 0);
                        
                        if (now > trialEnd) {
                            window.location.href = "subscribe.html";
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking trial:', error);
        }
        
        await loadProfile();
    } else {
        console.log("No user authenticated, redirecting to login");
        window.location.href = "login.html";
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Set payment due date
    const stats = getMonthlyStats();
    const paymentDueDateElement = document.querySelector('.stat-value#paymentDueDate');
    if (paymentDueDateElement) {
        paymentDueDateElement.textContent = stats.paymentDueDate;
    }
    
    // Wait a bit for elements to be ready
    setTimeout(() => {
        disableEditMode();
        
        // Attach button event listeners
        const editBtn = document.getElementById('editBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        console.log('Edit button found:', editBtn);
        
        if (editBtn) {
            editBtn.addEventListener('click', enableEditMode);
            editBtn.onclick = enableEditMode;
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', saveProfile);
            saveBtn.onclick = saveProfile;
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelEdit);
            cancelBtn.onclick = cancelEdit;
        }
        
        // Add day button click handlers
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    btn.classList.toggle('active');
                }
            });
        });
        

    }, 100);
});



// Handle Manage Subscription
function handleManageSubscription() {
    alert('Subscription management will be integrated with Paystack soon.');
}

// Handle View Invoices
function handleViewInvoices() {
    alert('Invoice history will be available soon.');
}

// Delete Account
function handleDeleteAccount() {
    document.getElementById('deleteAccountModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteAccountModal').style.display = 'none';
    document.getElementById('deleteConfirmInput').value = '';
    document.querySelectorAll('input[name="deleteReason"]').forEach(r => r.checked = false);
    document.getElementById('deleteFeedback').value = '';
}

async function confirmDeleteAccount() {
    const reason = document.querySelector('input[name="deleteReason"]:checked')?.value;
    const feedback = document.getElementById('deleteFeedback').value.trim();
    const confirmText = document.getElementById('deleteConfirmInput').value.trim();
    
    if (!reason) {
        alert('Please select a reason for deleting your account.');
        return;
    }
    
    if (confirmText.toUpperCase() !== 'DELETE') {
        alert('Please type DELETE to confirm.');
        return;
    }
    
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Save deletion feedback
        await setDoc(doc(db, 'account_deletions', user.uid), {
            userId: user.uid,
            email: user.email,
            reason: reason,
            feedback: feedback,
            deletedAt: serverTimestamp()
        });
        
        // Mark account as deleted
        await setDoc(doc(db, 'doctors', user.uid), { 
            deleted: true, 
            deletedAt: serverTimestamp(),
            deleteReason: reason
        }, { merge: true });
        
        // Delete Firebase Auth account
        await user.delete();
        
        alert('Account deleted successfully. We appreciate your feedback.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Delete account error:', error);
        if (error.code === 'auth/requires-recent-login') {
            alert('For security, please log out and log back in before deleting your account.');
        } else {
            alert('Failed to delete account: ' + error.message);
        }
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Toggle voice announcements
async function toggleVoiceAnnouncements() {
    if (!doctorId) return;
    
    const voiceToggle = document.getElementById('voiceToggle');
    const enabled = voiceToggle.checked;
    
    try {
        await setDoc(doc(db, 'doctors', doctorId), {
            voiceAnnouncementsEnabled: enabled
        }, { merge: true });
        
        console.log('Voice announcements:', enabled ? 'enabled' : 'disabled');
    } catch (error) {
        console.error('Error updating voice settings:', error);
        voiceToggle.checked = !enabled;
    }
}

// Attach logout to button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
        voiceToggle.addEventListener('change', toggleVoiceAnnouncements);
    }
});

// Make functions globally available
window.enableEditMode = enableEditMode;
window.saveProfile = saveProfile;
window.cancelEdit = cancelEdit;
window.handleManageSubscription = handleManageSubscription;
window.handleViewInvoices = handleViewInvoices;
window.handleDeleteAccount = handleDeleteAccount;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteAccount = confirmDeleteAccount;
window.logout = logout;