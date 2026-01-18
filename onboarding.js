// Interactive Onboarding Tour
const tourSteps = [
    {
        title: "Welcome to Orbit! 🎉",
        description: "Let's take a quick interactive tour. We'll show you exactly how to use each feature.",
        target: null,
        position: "center"
    },
    {
        title: "Your Dashboard",
        description: "This shows your queue statistics: total customers waiting, average wait time, and customers served today.",
        target: ".stats-grid",
        position: "bottom"
    },
    {
        title: "Current Customer",
        description: "This card shows who you're currently serving. When empty, it prompts you to call the next customer.",
        target: ".current-patient-card",
        position: "bottom"
    },
    {
        title: "Add to Queue Button",
        description: "Click this button to add new customers to your queue. They'll automatically get a queue number.",
        target: ".btn-primary",
        position: "bottom",
        highlight: true
    },
    {
        title: "Search Customers",
        description: "Use this search bar to quickly find customers by name or phone number in your queue.",
        target: ".search-bar",
        position: "bottom"
    },
    {
        title: "Queue List",
        description: "Here's your waiting list. Click 'Call' to serve a customer, or 'Remove' to take them out of the queue.",
        target: ".queue-section",
        position: "top"
    },
    {
        title: "Sidebar Navigation",
        description: "Use the sidebar to navigate between Dashboard, Queue Management, and Profile Settings.",
        target: ".sidebar",
        position: "right"
    },
    {
        title: "Profile Settings",
        description: "Click here to manage your business details, subscription, and account settings.",
        target: "a[href='ProfileSettings.html']",
        position: "right",
        highlight: true
    },
    {
        title: "You're All Set! 🚀",
        description: "You're ready to start! Add your first customer to begin managing your queue.",
        target: null,
        position: "center"
    }
];

let currentTourStep = 0;
let spotlight = null;
let tooltip = null;

function startTour() {
    createSpotlight();
    createTooltip();
    showTourStep(0);
}

function createSpotlight() {
    spotlight = document.createElement('div');
    spotlight.className = 'onboarding-spotlight';
    document.body.appendChild(spotlight);
}

function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    document.body.appendChild(tooltip);
}

function showTourStep(stepIndex) {
    currentTourStep = stepIndex;
    const step = tourSteps[stepIndex];
    
    if (step.position === 'center') {
        // Show center modal
        hideSpotlight();
        showCenterModal(step, stepIndex);
    } else {
        // Show tooltip with spotlight
        showSpotlightTooltip(step, stepIndex);
    }
}

function showCenterModal(step, stepIndex) {
    const overlay = document.getElementById('onboardingOverlay');
    const modal = document.querySelector('.onboarding-modal');
    
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === tourSteps.length - 1;
    
    overlay.classList.add('active');
    modal.innerHTML = `
        ${!isLast ? '<button class="skip-btn" onclick="endTour()">Skip Tour</button>' : ''}
        <div class="onboarding-icon">${isFirst ? '○' : '✓'}</div>
        <h2>${step.title}</h2>
        <p>${step.description}</p>
        <div class="onboarding-steps">
            ${tourSteps.map((_, i) => `
                <div class="step-dot ${i === stepIndex ? 'active' : ''}"></div>
            `).join('')}
        </div>
        <div class="onboarding-buttons">
            ${!isFirst ? '<button class="btn-onboarding btn-secondary" onclick="previousTourStep()">Back</button>' : ''}
            <button class="btn-onboarding btn-primary" onclick="${isLast ? 'completeTour()' : 'nextTourStep()'}">
                ${isLast ? 'Start Using Orbit' : 'Next'}
            </button>
        </div>
    `;
}

function showSpotlightTooltip(step, stepIndex) {
    const overlay = document.getElementById('onboardingOverlay');
    overlay.classList.remove('active');
    
    const target = document.querySelector(step.target);
    if (!target) {
        nextTourStep();
        return;
    }
    
    // Position spotlight
    const rect = target.getBoundingClientRect();
    spotlight.style.top = `${rect.top - 10}px`;
    spotlight.style.left = `${rect.left - 10}px`;
    spotlight.style.width = `${rect.width + 20}px`;
    spotlight.style.height = `${rect.height + 20}px`;
    spotlight.style.display = 'block';
    
    // Position tooltip
    positionTooltip(step, rect, stepIndex);
    
    // Scroll element into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function positionTooltip(step, targetRect, stepIndex) {
    const isLast = stepIndex === tourSteps.length - 1;
    
    tooltip.innerHTML = `
        <h3>${step.title}</h3>
        <p>${step.description}</p>
        <div class="tooltip-buttons">
            ${stepIndex > 0 ? '<button class="tooltip-btn-secondary" onclick="previousTourStep()">Back</button>' : ''}
            <button class="tooltip-btn-primary" onclick="nextTourStep()">
                ${isLast ? 'Finish' : 'Next'}
            </button>
        </div>
        <div class="tooltip-arrow ${step.position}"></div>
    `;
    
    tooltip.style.display = 'block';
    
    const tooltipRect = tooltip.getBoundingClientRect();
    let top, left;
    
    switch(step.position) {
        case 'bottom':
            top = targetRect.bottom + 20;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'top':
            top = targetRect.top - tooltipRect.height - 20;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.right + 20;
            break;
        case 'left':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.left - tooltipRect.width - 20;
            break;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

function hideSpotlight() {
    if (spotlight) spotlight.style.display = 'none';
    if (tooltip) tooltip.style.display = 'none';
}

function nextTourStep() {
    if (currentTourStep < tourSteps.length - 1) {
        showTourStep(currentTourStep + 1);
    } else {
        completeTour();
    }
}

function previousTourStep() {
    if (currentTourStep > 0) {
        showTourStep(currentTourStep - 1);
    }
}

async function completeTour() {
    await markOnboardingComplete();
    endTour();
}

function endTour() {
    hideSpotlight();
    const overlay = document.getElementById('onboardingOverlay');
    overlay.classList.remove('active');
    
    if (spotlight) spotlight.remove();
    if (tooltip) tooltip.remove();
    spotlight = null;
    tooltip = null;
}

async function markOnboardingComplete() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            await firebase.firestore().collection('doctors').doc(user.uid).update({
                onboardingCompleted: true,
                onboardingCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking onboarding complete:', error);
        }
    }
}

async function checkOnboardingStatus() {
    // Check if user just signed up
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newUser') === 'true';
    
    if (isNewUser) {
        // Remove parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Start tour for new users
        setTimeout(() => {
            startTour();
        }, 2000);
    }
}

// Make functions global
window.startTour = startTour;
window.nextTourStep = nextTourStep;
window.previousTourStep = previousTourStep;
window.completeTour = completeTour;
window.endTour = endTour;
window.checkOnboardingStatus = checkOnboardingStatus;
