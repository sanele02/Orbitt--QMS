# Orbitt 🚀 -- Queue Management System(QMS)

Orbitt is a smart digital queue management system designed to reduce waiting times, improve patient flow, and modernise how service-based businesses (starting with medical practices) manage queues.

Built with accessibility and the South African context in mind, Orbitt works for **both smartphone and non-smartphone users**, supports **SMS notifications**, and is simple enough for clinics to adopt without disrupting their workflow.
 links: [www.orbit.co.za](https://orbitt.co.za) 
 alt link: https://orbit-4b990.firebaseapp.com

---

## 🌱 Origin Story

Orbitt was inspired by a personal experience.

Growing up, I was a frequently ill child and lived with epilepsy. This meant travelling often with my family to see different doctors—sometimes in entirely different provinces. On one particular visit, we left home early in the morning so we could arrive at a clinic as early as possible.

When we arrived, we joined a long line. There wasn’t enough time to get food, and we couldn’t leave the queue because there was a real risk that we would be skipped or pushed back if we stepped away. So we stayed in line, hungry, until after the consultation. Only then were we able to get something to eat.

That experience stayed with me.

Over time, I realised this wasn’t just our problem. Many practices are overcrowded, and patients are effectively trapped in queues—afraid to run errands, get food, or step outside because they might lose their place. Time is wasted, stress increases, and dignity is lost.

Orbitt was born from that insight: **people shouldn’t have to physically stand in line just to hold their place**.

---

## 🧠 Problem Orbitt Solves

Traditional queues waste time, overcrowd waiting rooms, and frustrate both clients and staff. Many existing digital solutions:

- Assume everyone has a smartphone  
- Are expensive or over-engineered  
- Don’t work well in smaller or local practices  

Orbitt solves this by offering a **lightweight, affordable, and inclusive queueing system**.

---

## ✨ Key Features

### 👥 Patient Features
- Join a queue by assisted entry  
- Receive **SMS alerts** when your turn is approaching  (feature not implemented yet)
- No app download required  
- Reduced physical waiting time  

### 🩺 Doctor / Staff Features
- Dashboard to view and manage the live queue  
- Call the next patient with one click
- Call the patient more than once
- Skip patient
- Queue display screen with voice announcements
- Profile settings
- View basic visit history  
- Simple and fast onboarding for staff  

### 📲 Accessibility
- Works for users **without smartphones**  
- SMS-based notifications for feature phones  
- Designed for low data usage  

---

## 🏗️ Tech Stack

- **Frontend:** Web-based UI (AI-assisted generation)  
- **Backend:** Firebase (Firestore + Auth)  
- **Hosting & Deployment:** Firebase Hosting  
- **Notifications:** SMS integration (planned / optional)  
- **Architecture:** Serverless-first approach  

> **Note on AI Usage:** Large portions of the frontend logic, UI scaffolding, and boilerplate code were generated using **Claude** and **Amazon Q**.

---

## 🧩 Challenges & Learnings

Building Orbitt exposed real-world engineering and system-design challenges that went beyond writing code. Below are key problems I encountered and how I solved them.

### 1. Queue State Management (Re-calling Patients)
**Problem:**  
After calling a patient, the system initially did not allow the same patient to be called again (e.g. if they didn’t respond or stepped away).

**Solution:**  
I introduced a controlled **state-reset loop** that transitions a queue item back into a callable state when required. This allowed staff to safely recall a patient without duplicating queue entries or breaking the flow.

**What I learned:**  

---

### 2. Payment Gateway & Webhooks
**Problem:**  
This was my first time working with a payment gateway. I did not know how to safely hide secret keys, merchant keys, and webhook links, and at first some of this data could not be trusted from the app alone.

**Solution:**  
I learned how to keep all secret keys out of the app and store them in the backend and environment settings. I also used webhooks so the backend, not the app, confirms when a payment is successful before updating Firestore.

**What I learned:**  
Secret keys must never be in the app. Payments should always be checked on the backend, not from the user’s screen.

---

### 3. Firestore Security Rules Breaking the App
**Problem:**  
Tightened Firestore rules initially broke reads/writes across the app, causing unexpected permission errors.

**Solution:**  
I redesigned **Firestore rules**  and y tested reads and writes to ensure least-privilege access without breaking functionality. Firebase rules affected my Login and sign-up pages

**What I learned:**  
Security rules are part of the application logic and must be designed and tested like code, which then made me further understand the role of people who work/specialize in security. 

---

### 4. Integrating AI-Generated Code
**Problem:**  
Some AI-generated frontend code conflicted with real backend constraints such as authentication state, async Firestore reads, and permissions.

**Solution:**  
Refactored AI outputs to align with Firebase Auth lifecycle, async Firestore reads, and deployment constraints. Treated AI code as a draft, not a final source of truth.

**What I learned:**  
AI accelerates development, but architectural ownership and validation remain human responsibilities.

---

### 5. Deployment & Environment Configuration
**Problem:**  
Environment misconfigurations caused differences between local behavior and production.

**Solution:**  
A hard reload worked most of the time(Ctrl+shift+R), and also clearing the Firebase cache.

**What I learned:**  
Even in serverless systems, DevOps discipline and environment consistency are essential.

---

Overall, these challenges strengthened Orbitt’s reliability and shaped my approach as a **Solution Architect & Lead Integrator**, with a strong focus on correctness, security, and real-world usability.

## 🔐 Authentication

- Secure login for doctors and staff    
- Patient access does not require an account  

---

## 🎯 Target Users

- General Practitioners (GPs)  
- Clinics and medical practices  
- Small to medium service-based businesses  
- Businesses operating in areas with mixed smartphone access  

---

## 📦 Deployment

Orbitt is designed to be:

- Easy to deploy  
- Easy to maintain  
- Easy to scale per clinic  

Each practice can run its own isolated instance or be onboarded into a shared platform.

---

## 🚧 Roadmap

- [ ] SMS notifications for queue alerts  
- [ ] Physical ticket printing integration  
- [ ] Analytics dashboard (wait times, peak hours)  
- [ ] Multi-branch support  
- [ ] Payments & subscriptions  

---

## 🤝 Contributing

This project is currently developed and maintained by a single developer. Contributions, ideas, and feedback are welcome.

If you’re interested in collaborating, feel free to reach out.

---

## 👨‍💻 Role & Authorship

**Sanele Mhlanga**  
**Solution Architect & Lead Integrator**

On Orbitt, my primary role was **solution architecture and system integration**, rather than traditional line-by-line development.

### Responsibilities included:
- Designing the overall system architecture  
- Defining product requirements and user flows  
- Connecting and configuring the backend (Firebase, Auth, Firestore, security)  
- Deployment, hosting, and DevOps decisions  
- Research into queueing systems, accessibility, and clinic workflows  

### AI Contribution
- **Claude** and **Amazon Q** were used extensively to generate:
  - UI components and layouts
  -  OTHER AI USED: CHAT GPT, DeepSeek, Copilot
  - Frontend logic and scaffolding  
  - Boilerplate and repetitive code  

Orbitt is therefore best described as an **AI-augmented build**, where human effort focused on **architecture, validation, integration, and real-world problem solving**.

South Africa

---

## 📄 License

This project is proprietary. All rights reserved unless otherwise stated.

---

> Orbitt is about **respecting people’s time** — especially where time matters most.
