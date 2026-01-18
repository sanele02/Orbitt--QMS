// Firebase Configuration
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
const firestore = firebase.firestore();
const auth = firebase.auth();

let currentCustomer = null;
let queueData = [];
let completedData = [];
let cancelledData = [];

// Sidebar Toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Logout
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

window.logout = logout;
window.toggleSidebar = toggleSidebar;

// Listen to Queue
function listenToQueue(businessId) {
    firestore.collection("queue")
        .where("assignedDoctorId", "==", businessId)
        .onSnapshot((snapshot) => {
            const allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            currentCustomer = allCustomers.find(p => p.status === "current");
            queueData = allCustomers.filter(p => p.status === "waiting");
            
            const todayCompleted = allCustomers.filter(p => {
                if (p.status !== "completed" || !p.timestampCompleted) return false;
                const completedDate = p.timestampCompleted.toDate();
                return completedDate >= today;
            });
            
            const todayCancelled = allCustomers.filter(p => {
                if (p.status !== "removed" || !p.timestampRemoved) return false;
                const removedDate = p.timestampRemoved.toDate();
                return removedDate >= today;
            });
            
            completedData = allCustomers.filter(p => p.status === "completed");
            cancelledData = allCustomers.filter(p => p.status === "removed");
            
            updateMetrics();
            updateHistory(todayCompleted, todayCancelled);
        });
}

// Update Metrics
function updateMetrics() {
    const totalCustomers = completedData.length + cancelledData.length;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('completedHistory').textContent = completedData.length;
    document.getElementById('cancelledCount').textContent = cancelledData.length;
}

// Open Display View
function openDisplayView() {
    const user = firebase.auth().currentUser;
    if (user) {
        window.open(`QueueDisplay.html?id=${user.uid}`, '_blank');
    }
}



// Update History
function updateHistory(todayCompleted, todayCancelled) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    const allHistory = [...todayCompleted, ...todayCancelled].sort((a, b) => {
        const timeA = a.timestampCompleted || a.timestampRemoved;
        const timeB = b.timestampCompleted || b.timestampRemoved;
        if (!timeA || !timeB) return 0;
        return timeB.toDate() - timeA.toDate();
    });
    
    if (allHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No history today</p>
            </div>
        `;
        return;
    }
    
    // Assign queue numbers to customers without them (based on timestamp)
    const customersWithTimestamp = allHistory.filter(c => c.timestampAdded);
    customersWithTimestamp.sort((a, b) => a.timestampAdded.toDate() - b.timestampAdded.toDate());
    
    allHistory.forEach(customer => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        const isCompleted = customer.status === 'completed';
        const statusColor = isCompleted ? '#10b981' : '#ef4444';
        const statusText = isCompleted ? 'Completed' : 'Cancelled';
        const statusIcon = isCompleted ? 'check-circle-fill' : 'x-circle-fill';
        const timestamp = customer.timestampCompleted || customer.timestampRemoved;
        const timeStr = timestamp ? timestamp.toDate().toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        }) : 'N/A';
        
        // Calculate queue number if missing
        let queueNum = customer.queueNumber;
        if (!queueNum && customer.timestampAdded) {
            queueNum = customersWithTimestamp.findIndex(c => c.id === customer.id) + 1;
        }
        
        item.innerHTML = `
            <div class="patient-info-item">
                <div class="q-number">#${queueNum || '?'}</div>
                <div class="patient-details-item">
                    <h4>${customer.patientFullName}</h4>
                    <p>${customer.patientPhoneNumber} • ${customer.patientGender} • ${timeStr}</p>
                </div>
            </div>
            <div style="color: ${statusColor}; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-${statusIcon}"></i> ${statusText}
            </div>
        `;
        historyList.appendChild(item);
    });
}



// Load User Info
async function loadUserInfo(user) {
    try {
        const doc = await firestore.collection("doctors").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('userFullName').textContent = data.fullName || 'User';
            document.getElementById('userAvatar').textContent = (data.fullName || 'U')[0].toUpperCase();
        }
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

// Auth State
auth.onAuthStateChanged((user) => {
    if (user) {
        loadUserInfo(user);
        listenToQueue(user.uid);
    } else {
        window.location.href = 'Login.html';
    }
});

// Make function global
window.openDisplayView = openDisplayView;
