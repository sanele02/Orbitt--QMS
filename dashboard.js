// ===================================================================
// ORBIT QUEUE MANAGEMENT SYSTEM - DASHBOARD
// ===================================================================
// This file handles the main dashboard functionality for managing
// the patient queue. It includes adding patients, calling patients,
// skipping patients, and real-time queue updates.
// ===================================================================

// Firebase Configuration - connects to the Orbit Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyDfXhHNhjCmPl4MEkSLHeM8x6m0eN1NUY4",
  authDomain: "orbit-4b990.firebaseapp.com",
  projectId: "orbit-4b990",
  storageBucket: "orbit-4b990.firebasestorage.app",
  messagingSenderId: "40079677755",
  appId: "1:40079677755:web:72a525f25b5c61d1cb3f1e",
  measurementId: "G-ZYMS4LBF7L"
};

// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore(); // Database for storing queue data
const auth = firebase.auth(); // Authentication for user login

// ===================================================================
// GLOBAL VARIABLES
// ===================================================================
// These variables store the current state of the dashboard

let queueData = []; // Array of all patients in the queue
let currentCustomer = null; // The patient currently being served
let servedCount = 0; // Number of patients served today
let filteredQueue = []; // Filtered queue for search functionality
let selectedPatientId = null; // ID of patient selected in action modal
let lastAction = null; // Stores last action for undo functionality
let undoTimeout = null; // Timer for auto-hiding undo notification

// ===================================================================
// UI FUNCTIONS - SIDEBAR AND MODALS
// ===================================================================

/**
 * Toggles the sidebar between expanded and collapsed states
 * Used when clicking the logo/hamburger menu
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed'); // Add/remove 'collapsed' CSS class
}

/**
 * Closes the "Add Patient" modal and clears all form fields
 * Resets the form to its initial state
 */
function closeAddModal() {
    // Hide the modal by removing the 'active' class
    document.getElementById('addModal').classList.remove('active');
    
    // Clear all form inputs
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientGender').value = '';
    
    // Reset phone number border color (in case it was red from validation)
    document.getElementById('patientPhone').style.borderColor = '';
}

// ===================================================================
// PATIENT MANAGEMENT - ADD CUSTOMER TO QUEUE
// ===================================================================

/**
 * Adds a new customer to the Firestore queue
 * This function handles form validation, queue number generation,
 * and saving the patient data to the database
 * 
 * @param {Event} event - The form submission event
 */
async function addCustomer(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values and trim whitespace
    const name = document.getElementById('patientName').value.trim();
    const phone = document.getElementById('patientPhone').value.trim();
    const gender = document.getElementById('patientGender').value;

    // Validate that all fields are filled
    if (!name || !phone || !gender) {
        alert("Please fill in all fields");
        return;
    }

    // Validate phone number format (South African format)
    // Accepts: +27xxxxxxxxx or 0xxxxxxxxx (9 digits after +27 or 0)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert("Invalid phone number");
        return;
    }

    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in");
        return;
    }

    try {
        // Get today's date in YYYY-MM-DD format for queue organization
        const today = new Date().toISOString().split('T')[0];
        
        // Query existing queue entries for this doctor from today only
        // This ensures queue numbers reset daily
        const allQueueSnapshot = await firestore.collection("queue")
            .where("assignedDoctorId", "==", user.uid)
            .where("queueDate", "==", today)
            .get();
        
        // Find the highest queue number for today and increment by 1
        // This ensures sequential numbering: 1, 2, 3, etc.
        let nextQueueNumber = 1;
        allQueueSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.queueNumber && data.queueNumber >= nextQueueNumber) {
                nextQueueNumber = data.queueNumber + 1;
            }
        });

        // Create new patient document in Firestore
        const docRef = await firestore.collection("queue").add({
            patientFullName: name,
            patientPhoneNumber: phone,
            patientGender: gender,
            assignedDoctorId: user.uid, // Link to current doctor
            senderId: user.uid, // Who added this patient
            status: "waiting", // Initial status
            queueNumber: nextQueueNumber, // Auto-generated number
            queueDate: today, // Today's date for daily reset
            callAttempts: 0, // Number of times patient has been called
            timestampAdded: firebase.firestore.FieldValue.serverTimestamp() // When added
        });

        // Optional: Get updated waiting count (not currently used)
        const waitingSnapshot = await firestore.collection("queue")
            .where("assignedDoctorId", "==", user.uid)
            .where("status", "==", "waiting")
            .get();

        // Show success message and close modal
        alert('Customer added to queue!');
        closeAddModal();
    } catch (error) {
        // Handle any errors during the add process
        console.error(error);
        alert("Failed to add customer.");
    }
}


// --- Listen to Firestore Queue in Real-time ---
function listenToQueue(businessId) {
    firestore.collection("queue")
        .where("assignedDoctorId", "==", businessId)
        .onSnapshot((snapshot) => {
            const allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            queueData = allCustomers.filter(p => p.status === "waiting" || p.status === "called" || p.status === "skipped");
            
            const currentCustomerData = allCustomers.find(p => p.status === "current");
            if (currentCustomerData && (!currentCustomer || currentCustomer.id !== currentCustomerData.id)) {
                currentCustomer = currentCustomerData;
                updateCurrentPatientDisplay();
            } else if (!currentCustomerData) {
                currentCustomer = null;
                updateCurrentPatientDisplay();
            }
            
            filteredQueue = [...queueData];
            updateQueue();
            updateTotalCount();
        });
}

// --- Move Customer to Current ---
async function moveToCurrentPatient(customerId) {
    try {
        const customer = queueData.find(p => p.id === customerId);
        if (!customer) return;

        if (currentCustomer) {
            await firestore.collection("queue").doc(currentCustomer.id).update({
                status: "completed",
                timestampCompleted: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await firestore.collection("queue").doc(customerId).update({
            status: "current",
            timestampCalled: firebase.firestore.FieldValue.serverTimestamp()
        });

        currentCustomer = { ...customer, status: "current" };
        updateCurrentPatientDisplay();
        servedCount++;
        document.getElementById('seenToday').textContent = servedCount;
    } catch (error) {
        console.error("Error moving customer:", error);
        alert("Failed to call customer.");
    }
}

// --- Cancel Customer ---
async function cancelPatient(customerId) {
    if (!confirm('Are you sure you want to remove this customer from the queue?')) return;

    try {
        await firestore.collection("queue").doc(customerId).update({
            status: "removed",
            timestampRemoved: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Customer removed from queue');
    } catch (error) {
        console.error("Error removing customer:", error);
        alert("Failed to remove customer.");
    }
}

// --- Update Current Customer Display ---
function updateCurrentPatientDisplay() {
    const currentCard = document.getElementById('currentPatientCard');
    const currentName = document.getElementById('currentPatientName');
    const currentMeta = document.getElementById('currentPatientMeta');
    const currentStatus = document.getElementById('currentStatus');

    if (currentCustomer) {
        currentCard.classList.remove('empty');
        currentName.textContent = currentCustomer.patientFullName;
        currentMeta.textContent = `${currentCustomer.patientPhoneNumber} • ${currentCustomer.patientGender}`;
        currentStatus.textContent = 'Being Served';
        currentStatus.className = 'status-badge current';
    } else {
        currentCard.classList.add('empty');
        currentName.textContent = 'No customer currently';
        currentMeta.textContent = 'Click "Call" on a customer to start service';
        currentStatus.textContent = 'Waiting';
        currentStatus.className = 'status-badge';
    }
}

// --- Search Queue ---
function searchQueue() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredQueue = searchTerm === '' ? [...queueData] : queueData.filter(customer =>
        customer.patientFullName.toLowerCase().includes(searchTerm) ||
        customer.patientPhoneNumber.includes(searchTerm)
    );
    updateQueue();
}

// --- Update Queue Display ---
function updateQueue() {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = '';

    if (filteredQueue.length === 0) {
        queueList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No customers in queue</p>
            </div>
        `;
        return;
    }

    const sortedQueue = [...filteredQueue].sort((a, b) => {
        return (a.queueNumber || 0) - (b.queueNumber || 0);
    });

    sortedQueue.forEach((customer) => {
        const queueItem = document.createElement('div');
        let itemClass = 'queue-item';
        if (customer.status === 'called') itemClass += ' called';
        if (customer.status === 'skipped') itemClass += ' skipped';
        
        queueItem.className = itemClass;
        const callAttempts = customer.callAttempts || 0;
        const attemptsText = callAttempts > 0 ? ` (Called ${callAttempts}x)` : '';
        let statusText = '';
        if (customer.status === 'called') statusText = ' • Called';
        if (customer.status === 'skipped') statusText = ' • Skipped';
        
        queueItem.innerHTML = `
            <div class="patient-info-item">
                <div class="q-number">#${customer.queueNumber}</div>
                <div class="patient-details-item">
                    <h4>${customer.patientFullName}${attemptsText}</h4>
                    <p>${customer.patientPhoneNumber} • ${customer.patientGender}${statusText}</p>
                </div>
            </div>
            <div class="queue-actions">
                <button class="btn-small btn-done" onclick="showPatientActionModal('${customer.id}')"><i class="bi bi-check-lg"></i> Call</button>
                <button class="btn-small btn-cancel" onclick="cancelPatient('${customer.id}')"><i class="bi bi-x-lg"></i> Remove</button>
            </div>
        `;
        queueList.appendChild(queueItem);
    });
}

// --- Calculate Average Wait Time ---
function calculateAverageWaitTime() {
    if (queueData.length === 0) {
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = '0m';
        return;
    }
    
    const now = new Date();
    let totalWaitTime = 0;
    
    queueData.forEach(customer => {
        if (customer.timestampAdded && customer.timestampAdded.toDate) {
            const addedTime = customer.timestampAdded.toDate();
            const waitTime = (now - addedTime) / (1000 * 60);
            totalWaitTime += waitTime;
        }
    });
    
    const averageWait = Math.round(totalWaitTime / queueData.length);
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = `${averageWait}m`;
}

// --- Update Total Count Display ---
function updateTotalCount() {
    const count = queueData.length;
    document.getElementById('totalInQueue').textContent = count;
    calculateAverageWaitTime();
}

// --- Logout ---
function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}

// --- Load User Profile ---
async function loadUserProfile(userId) {
    try {
        const docRef = firestore.collection("doctors").doc(userId);
        const docSnap = await docRef.get();
        
        let fullName = auth.currentUser?.email?.split('@')[0] || 'User';
        
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data.fullName && data.fullName.trim()) {
                fullName = data.fullName;
            }
        }
        
        document.getElementById('userFullName').textContent = fullName;
        const initials = fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().substring(0, 2);
        document.getElementById('userAvatar').textContent = initials;
    } catch (error) {
        console.error('Error loading user profile:', error);
        const fallbackName = auth.currentUser?.email?.split('@')[0] || 'User';
        document.getElementById('userFullName').textContent = fallbackName;
        document.getElementById('userAvatar').textContent = 'U';
    }
}

// --- Update Queue Number Display ---
function updateQueueNumber() {
    const qNumberDisplay = document.getElementById('qNumberDisplay');
    if (qNumberDisplay) {
        qNumberDisplay.textContent = `#${queueData.length + 1} (Auto-generated)`;
    }
}

// --- Add to openAddModal to update queue number ---
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    updateQueueNumber();
}

// --- Patient Action Modal Functions ---
function showPatientActionModal(patientId) {
    console.log('Opening patient action modal for:', patientId);
    const patient = queueData.find(p => p.id === patientId);
    if (!patient) {
        console.error('Patient not found:', patientId);
        alert('Patient not found in queue');
        return;
    }
    
    selectedPatientId = patientId;
    const modal = document.getElementById('patientActionModal');
    const title = document.getElementById('patientActionTitle');
    
    if (!modal || !title) {
        console.error('Modal elements not found');
        alert('Modal elements missing. Please refresh the page.');
        return;
    }
    
    title.textContent = `Patient #${patient.queueNumber} — Select an action`;
    modal.classList.add('active');
    console.log('Modal opened successfully');
}

function closePatientActionModal() {
    // Clear countdown when modal is closed
    if (window.currentCountdown) {
        clearInterval(window.currentCountdown);
        window.currentCountdown = null;
    }
    
    // Hide countdown display
    const countdownDisplay = document.getElementById('countdownDisplay');
    if (countdownDisplay) {
        countdownDisplay.style.display = 'none';
    }
    
    document.getElementById('patientActionModal').classList.remove('active');
    selectedPatientId = null;
}

async function handlePatientAction(action) {
    if (!selectedPatientId) {
        console.error('No patient selected');
        return;
    }
    
    // Clear countdown when user takes action
    if (window.currentCountdown) {
        clearInterval(window.currentCountdown);
        window.currentCountdown = null;
    }
    
    const patientId = selectedPatientId;
    const patient = queueData.find(p => p.id === patientId);
    if (!patient) {
        console.error('Patient not found:', patientId);
        return;
    }
    
    // Only close modal for skip and arrived actions
    if (action === 'skip' || action === 'arrived') {
        closePatientActionModal();
    }
    
    switch (action) {
        case 'call':
            await handlePatientCall(patientId);
            break;
        case 'skip':
            await handleSkipPatient(patientId);
            break;
        case 'arrived':
            await handlePatientArrived(patientId);
            break;
    }
}

async function handlePatientArrived(patientId) {
    try {
        console.log('Processing patient arrival for:', patientId);
        
        // Clear countdown if running
        if (window.currentCountdown) {
            clearInterval(window.currentCountdown);
            document.getElementById('countdownDisplay').style.display = 'none';
        }
        
        if (currentCustomer) {
            console.log('Completing current customer:', currentCustomer.id);
            await firestore.collection("queue").doc(currentCustomer.id).update({
                status: "completed",
                timestampCompleted: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('Setting new current patient:', patientId);
        await firestore.collection("queue").doc(patientId).update({
            status: "current",
            timestampCalled: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        servedCount++;
        const seenTodayEl = document.getElementById('seenToday');
        if (seenTodayEl) {
            seenTodayEl.textContent = servedCount;
        }
        
        enableActionButtons();
        console.log('Patient arrival processed successfully');
    } catch (error) {
        console.error("Detailed error handling patient arrival:", error);
        alert(`Failed to process patient arrival: ${error.message}`);
        enableActionButtons();
    }
}

// Helper function to enable action buttons
function enableActionButtons() {
    console.log('=== ENABLE ACTION BUTTONS ===');
    const callBtn = document.querySelector('.btn-call');
    const skipBtn = document.querySelector('.btn-skip');
    console.log('Call button found for enable:', !!callBtn);
    console.log('Skip button found for enable:', !!skipBtn);
    if (callBtn) {
        callBtn.disabled = false;
        console.log('Call button enabled');
    }
    if (skipBtn) {
        skipBtn.disabled = false;
        console.log('Skip button enabled');
    }
}

async function handlePatientCall(patientId) {
    try {
        console.log('=== HANDLE PATIENT CALL START ===');
        console.log('Calling patient:', patientId);
        const patient = queueData.find(p => p.id === patientId);
        if (!patient) {
            console.error('Patient not found in queue data');
            alert('Patient not found');
            return;
        }
        
        // Disable Call and Skip buttons immediately
        console.log('Disabling buttons...');
        const callBtn = document.querySelector('.btn-call');
        const skipBtn = document.querySelector('.btn-skip');
        console.log('Call button found:', !!callBtn);
        console.log('Skip button found:', !!skipBtn);
        if (callBtn) {
            callBtn.disabled = true;
            console.log('Call button disabled');
        }
        if (skipBtn) {
            skipBtn.disabled = true;
            console.log('Skip button disabled');
        }
        
        console.log('Updating Firestore status to called...');
        await firestore.collection("queue").doc(patientId).update({
            status: "called",
            lastCallTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Firestore updated successfully');
        
        // Start 4-second countdown in modal
        console.log('Starting countdown...');
        startCountdown(patientId);
        
        console.log('Patient called successfully');
        console.log('=== HANDLE PATIENT CALL END ===');
    } catch (error) {
        console.error("Error calling patient:", error);
        alert(`Failed to call patient: ${error.message}`);
        // Re-enable buttons on error
        enableActionButtons();
    }
}

// Countdown function with visual display
function startCountdown(patientId) {
    console.log('=== START COUNTDOWN ===');
    let countdown = 4;
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownTimer = document.getElementById('countdownTimer');
    
    console.log('Countdown display element:', !!countdownDisplay);
    console.log('Countdown timer element:', !!countdownTimer);
    
    if (!countdownDisplay || !countdownTimer) {
        console.error('Countdown elements not found!');
        return;
    }
    
    // Show countdown display
    countdownDisplay.style.display = 'block';
    countdownTimer.textContent = countdown;
    console.log('Countdown display shown, starting at:', countdown);
    
    const countdownInterval = setInterval(async () => {
        countdown--;
        console.log('Countdown tick:', countdown);
        
        if (countdown > 0) {
            countdownTimer.textContent = countdown;
        } else {
            console.log('Countdown finished, cleaning up...');
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';
            
            // Auto-reset patient to waiting and re-enable buttons (but keep modal open)
            try {
                const currentDoc = await firestore.collection("queue").doc(patientId).get();
                if (currentDoc.exists && currentDoc.data().status === "called") {
                    await firestore.collection("queue").doc(patientId).update({
                        status: "waiting"
                    });
                    console.log('Auto-reset patient to waiting after countdown');
                }
                enableActionButtons();
                // DO NOT close modal - let user manually close it
            } catch (error) {
                console.error('Error in countdown reset:', error);
                enableActionButtons();
            }
        }
    }, 1000);
    
    // Store interval ID to clear it if user takes action
    window.currentCountdown = countdownInterval;
    console.log('Countdown interval stored');
}

async function handleSkipPatient(patientId) {
    try {
        console.log('Skipping patient:', patientId);
        const patient = queueData.find(p => p.id === patientId);
        if (!patient) {
            console.error('Patient not found in queue data');
            alert('Patient not found');
            return;
        }
        
        // Clear countdown if running
        if (window.currentCountdown) {
            clearInterval(window.currentCountdown);
            document.getElementById('countdownDisplay').style.display = 'none';
        }
        
        await firestore.collection("queue").doc(patientId).update({
            status: "skipped", // Change to skipped status for visual highlighting
            timestampSkipped: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        enableActionButtons();
        console.log('Patient skipped');
    } catch (error) {
        console.error("Error skipping patient:", error);
        alert(`Failed to skip patient: ${error.message}`);
        enableActionButtons();
    }
}

function showConfirmationModal(action, patientId) {
    const modal = document.getElementById('confirmationModal');
    const title = document.getElementById('confirmationTitle');
    const message = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    const patient = queueData.find(p => p.id === patientId);
    
    if (action === 'remove') {
        title.textContent = 'Remove Patient';
        message.textContent = `Are you sure you want to remove ${patient.patientFullName} from the queue? This action cannot be undone.`;
        confirmBtn.textContent = 'Remove';
        confirmBtn.onclick = () => confirmRemovePatient(patientId);
    }
    
    modal.classList.add('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('active');
}

async function confirmRemovePatient(patientId) {
    try {
        console.log('Removing patient:', patientId);
        
        await firestore.collection("queue").doc(patientId).update({
            status: "removed",
            timestampRemoved: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeConfirmationModal();
        
        // Store for undo
        const patient = queueData.find(p => p.id === patientId);
        if (patient) {
            lastAction = {
                type: 'remove',
                patientId: patientId,
                patientData: { ...patient },
                timestamp: Date.now()
            };
        }
        
        showUndoNotification('Patient removed from queue');
        console.log('Remove patient processed successfully');
    } catch (error) {
        console.error("Detailed error removing patient:", error);
        alert(`Failed to remove patient: ${error.message}`);
    }
}

function confirmAction() {
    // This will be set dynamically by showConfirmationModal
}

function showUndoNotification(message) {
    const notification = document.getElementById('undoNotification');
    const messageEl = document.getElementById('undoMessage');
    
    messageEl.textContent = message;
    notification.style.display = 'block';
    
    // Clear existing timeout
    if (undoTimeout) {
        clearTimeout(undoTimeout);
    }
    
    // Auto-hide after 30 seconds
    undoTimeout = setTimeout(() => {
        notification.style.display = 'none';
        lastAction = null;
    }, 30000);
}

async function undoLastAction() {
    if (!lastAction) return;
    
    try {
        if (lastAction.type === 'skip') {
            await firestore.collection("queue").doc(lastAction.patientId).update({
                status: "waiting",
                queueNumber: lastAction.originalQueueNumber,
                timestampSkipped: firebase.firestore.FieldValue.delete()
            });
        } else if (lastAction.type === 'remove') {
            await firestore.collection("queue").doc(lastAction.patientId).update({
                status: "waiting",
                timestampRemoved: firebase.firestore.FieldValue.delete()
            });
        }
        
        document.getElementById('undoNotification').style.display = 'none';
        lastAction = null;
        
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }
    } catch (error) {
        console.error("Error undoing action:", error);
        alert("Failed to undo action.");
    }
}

// --- Initialize Dashboard ---
document.addEventListener('DOMContentLoaded', function () {
    updateCurrentPatientDisplay();
    
    auth.onAuthStateChanged(async user => {
        if (user) {
            // Check if user account still exists in Firestore
            try {
                const docSnap = await firestore.collection('doctors').doc(user.uid).get();
                if (!docSnap.exists || docSnap.data()?.deleted) {
                    alert('Your account has been deleted. Please sign up again.');
                    await auth.signOut();
                    window.location.href = "index.html";
                    return;
                }
                
                // Check trial expiry
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
            } catch (error) {
                console.error('Error checking user:', error);
            }
            
            loadUserProfile(user.uid);
            listenToQueue(user.uid);
            
            // Check onboarding
            setTimeout(() => {
                checkOnboardingStatus();
            }, 2000);
        } else {
            window.location.href = "index.html";
        }
    });
    
    const phoneInput = document.getElementById('patientPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const phone = this.value.trim();
            const phoneRegex = /^(\+27|0)[0-9]{9}$/;
            this.style.borderColor = phone && !phoneRegex.test(phone.replace(/\s/g, '')) ? '#ef4444' : '';
        });
    }
});

// --- Make functions globally available ---
window.toggleSidebar = toggleSidebar;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.addPatient = addCustomer;
window.searchQueue = searchQueue;
window.moveToCurrentPatient = moveToCurrentPatient;
window.cancelPatient = cancelPatient;
window.logout = logout;
window.showPatientActionModal = showPatientActionModal;
window.closePatientActionModal = closePatientActionModal;
window.handlePatientAction = handlePatientAction;
window.closeConfirmationModal = closeConfirmationModal;
window.confirmAction = confirmAction;
window.undoLastAction = undoLastAction;