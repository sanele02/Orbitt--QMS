// ===================================================================
// ORBIT QUEUE MANAGEMENT SYSTEM - PUBLIC DISPLAY
// ===================================================================
// This file handles the public-facing queue display that customers
// see on TV screens or monitors in the waiting area. It shows:
// - Current serving number
// - Next 3 customers in line
// - Total people waiting
// - Voice announcements when customers are called
// ===================================================================

// Firebase Configuration - same as dashboard, connects to Orbit project
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase services (no auth needed for public display)
const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore(); // Only need database access

// ===================================================================
// GLOBAL VARIABLES FOR DISPLAY STATE
// ===================================================================

let currentCustomer = null;
let queueData = [];
let lastStatusMap = new Map(); // Track last known status for each customer

// ===================================================================
// VOICE ANNOUNCEMENT SYSTEM
// ===================================================================

function announceQueue(number) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Customer number ${number}, please come to the counter`);
        utterance.rate = 0.8;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
        console.log('Playing voice for customer:', number);
    }
}

// ===================================================================
// URL PARAMETER HANDLING
// ===================================================================

// Extract the business ID from the URL parameters
// Example URL: QueueDisplay.html?id=doctor123
const urlParams = new URLSearchParams(window.location.search);
const businessId = urlParams.get('id'); // Gets the 'id' parameter value

// If no business ID is provided, show error message
if (!businessId) {
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:white;font-size:24px;text-align:center;padding:20px;">Please provide a business ID in the URL</div>';
}

// ===================================================================
// REAL-TIME QUEUE LISTENING AND VOICE ANNOUNCEMENTS
// ===================================================================

/**
 * Sets up real-time listeners for queue changes and voice settings
 * This function monitors the Firestore database for any changes to:
 * - Queue status (waiting, called, current, etc.)
 * - Voice announcement settings
 * - New patients being called
 * 
 * @param {string} businessId - The doctor's unique ID to filter queue data
 */
function listenToQueue(businessId) {
    // ===================================================================
    // VOICE SETTINGS LISTENER
    // ===================================================================
    // Listen to the doctor's settings to check if voice announcements are enabled
    firestore.collection('doctors').doc(businessId).onSnapshot((doc) => {
        if (doc.exists) {
            // Get voice setting, default to enabled if not set
            window.voiceEnabled = doc.data().voiceAnnouncementsEnabled !== false;
        }
    });
    
    // ===================================================================
    // QUEUE DATA LISTENER
    // ===================================================================
    // Listen to all queue changes for this specific doctor
    firestore.collection("queue")
        .where("assignedDoctorId", "==", businessId) // Only this doctor's patients
        .onSnapshot((snapshot) => {
            // Convert Firestore documents to JavaScript objects
            const allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Find the patient currently being served (status = "current")
            const newCurrentCustomer = allCustomers.find(p => p.status === "current");
            
            // Find all patients who have been called (status = "called")
            const calledCustomers = allCustomers.filter(p => p.status === "called");
            
            // Voice announcement when status changes to "called"
            if (window.voiceEnabled !== false) {
                calledCustomers.forEach(customer => {
                    const lastStatus = lastStatusMap.get(customer.id);
                    if (lastStatus !== "called") {
                        console.log('Status changed to called, announcing customer:', customer.queueNumber);
                        announceQueue(customer.queueNumber);
                        lastStatusMap.set(customer.id, "called");
                    }
                });
            }
            
            // Update status map for all customers
            allCustomers.forEach(customer => {
                lastStatusMap.set(customer.id, customer.status);
            });
            
            // ===================================================================
            // CURRENT CUSTOMER ANNOUNCEMENT
            // ===================================================================
            // Announce when a customer moves to "current" status (being served)
            if (window.voiceEnabled && newCurrentCustomer && (!currentCustomer || currentCustomer.id !== newCurrentCustomer.id)) {
                announceQueue(newCurrentCustomer.queueNumber);
            }
            
            // ===================================================================
            // UPDATE DISPLAY DATA
            // ===================================================================
            // Update global variables with new data
            currentCustomer = newCurrentCustomer;
            
            // Filter queue to only show waiting, called, and skipped patients
            // (excludes completed, removed, and current patients)
            queueData = allCustomers.filter(p => p.status === "waiting" || p.status === "called" || p.status === "skipped");
            
            // Update the visual display with new data
            updateDisplay();
        });
}

// ===================================================================
// DISPLAY UPDATE FUNCTIONS
// ===================================================================

/**
 * Updates the visual display with current queue information
 * This function refreshes all the numbers and queue boxes shown to customers
 */
function updateDisplay() {
    // Get references to HTML elements that need updating
    const currentNumber = document.getElementById('currentNumber'); // Large "NOW SERVING" number
    const peopleInLine = document.getElementById('peopleInLine'); // Total waiting count
    const nextThreeGrid = document.getElementById('nextThreeGrid'); // Next 3 customers boxes
    
    // ===================================================================
    // UPDATE CURRENT SERVING NUMBER
    // ===================================================================
    if (currentCustomer) {
        // Show the queue number of the patient being served
        currentNumber.textContent = currentCustomer.queueNumber;
    } else {
        // Show dash if no one is currently being served
        currentNumber.textContent = '-';
    }
    
    // ===================================================================
    // UPDATE WAITING COUNT
    // ===================================================================
    // Show total number of people still waiting (includes called and skipped)
    peopleInLine.textContent = queueData.length;
    
    // ===================================================================
    // UPDATE NEXT 3 CUSTOMERS DISPLAY
    // ===================================================================
    // Clear existing boxes
    nextThreeGrid.innerHTML = '';
    
    // If no one is waiting, show "No one waiting" message
    if (queueData.length === 0) {
        nextThreeGrid.innerHTML = '<div class="empty-next">No one waiting</div>';
        return;
    }
    
    // Sort queue by queue number (1, 2, 3, etc.) to show in correct order
    const sortedQueue = [...queueData].sort((a, b) => {
        return (a.queueNumber || 0) - (b.queueNumber || 0);
    });
    
    // Take only the first 3 customers from the sorted queue
    const nextThree = sortedQueue.slice(0, 3);
    
    // Create a box for each of the next 3 customers
    nextThree.forEach((customer) => {
        const box = document.createElement('div');
        box.className = 'next-queue-box'; // CSS class for styling
        box.textContent = customer.queueNumber; // Show their queue number
        nextThreeGrid.appendChild(box); // Add to the display
    });
}

// ===================================================================
// INITIALIZATION
// ===================================================================

// Start listening to queue changes if a business ID was provided
if (businessId) {
    listenToQueue(businessId);
}
