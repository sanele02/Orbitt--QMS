// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfXhHNhjCmPl4MEkSLHeM8x6m0eN1NUY4",
  authDomain: "orbit-4b990.firebaseapp.com",
  projectId: "orbit-4b990",
  storageBucket: "orbit-4b990.firebasestorage.app",
  messagingSenderId: "40079677755",
  appId: "1:40079677755:web:72a525f25b5c61d1cb3f1e",
  measurementId: "G-ZYMS4LBF7L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Handle contact form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            businessName: formData.get('clinic') || '',
            message: formData.get('message') || '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'new'
        };
        
        // Store lead in Firestore
        const leadRef = await db.collection('contact_leads').add(data);
        
        // Send email to admin
        await db.collection('mail').add({
            to: 'sanelemhlanga70@gmail.com',
            message: {
                subject: '🚀 New Lead from Orbit Website',
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
                                        
                                        <!-- Alert Badge -->
                                        <tr>
                                            <td style="padding: 30px 30px 20px 30px; text-align: center;">
                                                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; border-radius: 50px; font-size: 20px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                                    🚀 New Lead Alert
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 20px 40px;">
                                                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">A new potential customer has submitted a contact form on your website!</p>
                                                
                                                <!-- Lead Details Box -->
                                                <div style="background: linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                                    <h3 style="margin: 0 0 20px 0; color: #059669; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">💼 Lead Details</h3>
                                                    <table width="100%" cellpadding="8" cellspacing="0">
                                                        <tr>
                                                            <td style="color: #6b7280; font-size: 14px; width: 120px;">Name:</td>
                                                            <td style="font-weight: 600; color: #1f2937; font-size: 14px;">${data.name}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #6b7280; font-size: 14px;">Email:</td>
                                                            <td style="font-weight: 600; color: #1f2937; font-size: 14px;">${data.email}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #6b7280; font-size: 14px;">Phone:</td>
                                                            <td style="font-weight: 600; color: #1f2937; font-size: 14px;">${data.phone || 'Not provided'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #6b7280; font-size: 14px;">Business:</td>
                                                            <td style="font-weight: 600; color: #1f2937; font-size: 14px;">${data.businessName || 'Not provided'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #6b7280; font-size: 14px; vertical-align: top;">Message:</td>
                                                            <td style="font-weight: 600; color: #1f2937; font-size: 14px;">${data.message || 'No message provided'}</td>
                                                        </tr>
                                                        <tr style="border-top: 2px solid #10b981;">
                                                            <td style="padding-top: 15px; color: #059669; font-weight: 700; font-size: 14px;">Lead ID:</td>
                                                            <td style="padding-top: 15px; font-weight: 700; font-size: 14px; color: #059669;">${leadRef.id}</td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                
                                                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 25px 0;">Follow up with this lead as soon as possible to maximize conversion potential.</p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer Banner -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px 40px; text-align: center;">
                                                <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 15px; font-weight: 500;">New lead notification from Orbit! 🎆</p>
                                                <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">This is an automated notification. Check your Firestore console for more details.</p>
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
        
        // Send confirmation email to customer
        await db.collection('mail').add({
            to: data.email,
            message: {
                subject: 'Thank you for contacting Orbit - We\'ll be in touch soon!',
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
                                        
                                        <!-- Success Badge -->
                                        <tr>
                                            <td style="padding: 30px 30px 20px 30px; text-align: center;">
                                                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; border-radius: 50px; font-size: 20px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                                    ✅ Message Received
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 20px 40px;">
                                                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">Hi <strong>${data.name}</strong>,</p>
                                                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for your interest in Orbit! We've received your message and our team will get back to you within <strong style="color: #059669;">24 hours</strong>.</p>
                                                
                                                <!-- Next Steps Box -->
                                                <div style="background: linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                                    <h3 style="margin: 0 0 20px 0; color: #059669; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">🚀 What's Next?</h3>
                                                    <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                                                        <li style="margin-bottom: 10px;">Our team will review your inquiry</li>
                                                        <li style="margin-bottom: 10px;">We'll contact you within 24 hours</li>
                                                        <li style="margin-bottom: 10px;">Get a personalized demo of Orbit</li>
                                                        <li>Start your 30-day free trial</li>
                                                    </ul>
                                                </div>
                                                
                                                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 25px 0;">In the meantime, feel free to explore our features or start your free trial!</p>
                                                
                                                <!-- CTA Button -->
                                                <div style="text-align: center; margin: 35px 0;">
                                                    <a href="https://orbit-4b990.web.app/Signup.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Start Free Trial →</a>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer Banner -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px 40px; text-align: center;">
                                                <p style="color: rgba(255,255,255,0.9); margin: 0 0 8px 0; font-size: 15px; font-weight: 500;">Thank you for choosing Orbit! 🎆</p>
                                                <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">Questions? Reply to this email or contact us at hello@orbitqueue.com</p>
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
        
        // Show success message
        alert('Thank you for your message! We\'ll get back to you within 24 hours. You should also receive a confirmation email shortly.');
        
        // Reset the form
        event.target.reset();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Sorry, there was an error sending your message. Please try again or contact us directly.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle hash links, not external links
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// Optional: Add active state to navigation on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Mobile menu toggle function
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('mobile-open');
}