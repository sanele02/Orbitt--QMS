# Orbitt 🚀  
(Orbit – Queue Management System) www.orbitt.co.za
- Primary domain: https://orbitt.co.za
- Additional domain: https://orbit-4b990.firebaseapp.com

Orbitt is a modern **queue management system for clinics**.  
It helps patients avoid standing in long lines and helps clinics manage queues better.

Orbitt uses **SMS**, a **real-time dashboard**, and **online payments** to make waiting easier and more fair.

Built with the South African context in mind.

---

## 🌱 Origin Story

Orbitt started from a real-life problem.

Growing up, I was often sick and lived with epilepsy. My family and I had to travel to different doctors, sometimes in other provinces. One day, we left home very early to get to a doctor on time.

When we arrived, the queue was already long. We could not leave to buy food because we were scared we would lose our place in the line. We stayed hungry until after seeing the doctor.

Later, I realised this happens to many people. Clinics are full, and patients are scared to leave the line even for basic needs.

Orbitt was created from this idea:  
**People should not have to stand in line just to keep their place.**

---

## 🧠 Problem Orbitt Solves

- Long waiting times
- Overcrowded clinics
- Patients afraid to leave queues
- Systems that assume everyone has a smartphone
- Expensive or complex queue software

Orbitt solves this by letting patients **wait remotely** and get **SMS alerts** when it is almost their turn.

---

## ✨ Features

### Queue Management
- Add patients to a queue
- See the queue in real time
- Call next patient (sends SMS)
- Re-call a patient if needed
- Remove patients from queue
- Search patients by name or phone
- Track queue stats

### SMS Notifications
- Automatic SMS when patient is called
- Twilio integration
- SMS cost tracking (± R0.95 per SMS)
- SMS balance management
- SMS history logging

### Payments
- PayFast integration (South Africa)
- Buy SMS credits
- Payment history
- Automatic balance updates
- Payment logs

### Dashboard
- Live queue view
- Current patient display
- Average wait time
- Queue stats
- Simple sidebar navigation

### Accessibility
- No app needed
- Works on feature phones
- SMS-based alerts
- Low data usage

---

## 📸 Screenshots
*(Add screenshots here)*

## LANDING PAGE 
<img width="1892" height="857" alt="image" src="https://github.com/user-attachments/assets/0c0171eb-dca5-4508-ad66-edb901042380" />

## DASHBOARD
<img width="1896" height="866" alt="image" src="https://github.com/user-attachments/assets/9a8d2d7f-e945-4e0d-a80c-6e3d6863bafa" />

## ADDING A NEW PERSON IN THE LINE
<img width="1896" height="854" alt="image" src="https://github.com/user-attachments/assets/daab975a-e71f-4212-ada0-2f2283ace124" />

## ACTION MENU ALLOWING USER TO CALL, SKIP, OR MOVE TO THE NOW SERVING SECTION(ARRIVED)
<img width="1896" height="851" alt="image" src="https://github.com/user-attachments/assets/f06147a4-effd-4500-9403-6104ae769c0c" />

##  QUEUE MANAGEMENT PAGE
<img width="1877" height="857" alt="image" src="https://github.com/user-attachments/assets/fafacf64-4829-4e93-9a29-052ca2392e48" />

## Queue Display PAGE
<img width="1907" height="866" alt="image" src="https://github.com/user-attachments/assets/26cef37e-13d7-4d73-b2ca-45f194122a83" />

## PROFILE SETTINGS PAGE
<img width="1887" height="862" alt="image" src="https://github.com/user-attachments/assets/02b88cec-a174-4422-9240-4c760bf64634" />


---

## 🏗️ Tech Stack

### Frontend
- HTML, CSS, JavaScript
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

> **AI Usage Note:**  
Large parts of the frontend and boilerplate code were generated using **Claude** and **Amazon Q**.  
AI was used as a tool — system design, fixes, integration, and deployment were done manually.

---

## 🧩 Challenges & Learnings

### 1) Queue State Problem
**Problem:**  
After calling a patient, the system could not call them again.

**Solution:**  
I added a loop to reset the patient state so staff can safely re-call them.

**What I learned:**  
Queues need clear states and rules.

---

### 2) Payment Gateway & Webhooks
**Problem:**  
This was my first time using a payment system. I did not know how to safely hide secret keys, merchant keys, and webhook links.

**Solution:**  
I moved all secret keys to the backend and environment settings.  
Payments are confirmed using webhooks, not the app screen.

**What I learned:**  
Secret keys must never be in the app. Payments must be checked on the backend.

---

### 3) Firestore Rules Breaking the App
**Problem:**  
After locking down Firestore rules, parts of the app stopped working.

**Solution:**  
I rewrote the rules using roles (patient, staff, admin) and tested each one.

**What I learned:**  
Security rules are part of the app and must be tested like code.

---

### 4) AI Code Issues
**Problem:**  
Some AI-generated code did not match real backend rules.

**Solution:**  
I fixed auth flow, async data loading, and permissions manually.

**What I learned:**  
AI helps speed things up, but humans must check and fix logic.

---

### 5) Deployment Problems
**Problem:**  
The app worked locally but behaved differently after deployment.

**Solution:**  
I fixed environment setup and Firebase project configs.

**What I learned:**  
Deployment matters, even in serverless apps.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Firebase CLI
- Twilio account
- PayFast account

### Install
```bash
npm install
cd functions && npm install && cd ..
firebase login
firebase use orbit-4b990
```
```
### Deploy
firebase deploy --only functions
firebase deploy --only hosting
```
```
### 📁 Project Structure
Orbit/
├── index.html
├── Login.html
├── dashboard.html
├── ProfileSettings.html
├── auth.js
├── dashboard.js
├── ProfileSettings.js
├── functions/
│   ├── index.js
│   └── package.json
├── SETUP_GUIDE.md
├── CONFIGURATION.md
├── DEPLOYMENT_COMMANDS.md
├── PROJECT_SUMMARY.md
└── README.md
```
---

## 🔐 Security Notes

- Firebase Authentication is used
- Firestore security rules are enabled
- Secrets are stored in Firebase config
- No merchant keys in frontend code
---
## 🔗 Live URLs
- Primary domain: https://orbitt.co.za
- Additional domain: https://orbit-4b990.firebaseapp.com
---
## 👨‍💻 Role & Authorship

**Sanele Mhlanga**
Solution Architect & Lead Integrator

My role focused on:
- System design
- Backend setup (Firebase, Firestore, Auth)
- Payment & SMS integration
- Fixing bugs
- Deployment & configuration
- Research and best practices
- **This project is an AI-assisted build, with human ownership of design and integration.**
- **South Africa 🇿🇦**

  ### License
  - This project is proprietary. All rights reserved unless otherwise stated.
 
  > **Orbitt is about respecting people’s time — especially where time matters most.**  
