/**
 * OTP Service
 * Handles OTP verification and user registration completion
 */

import firebaseService from './firebaseService.js';

class OTPService {
    constructor() {
        this.baseURL = 'http://localhost:5002/api/otp';
    }

    async generateOTP(email, firstName, lastName) {
        try {
            const response = await fetch(`${this.baseURL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error generating OTP:', error);
            return { success: false, message: 'Failed to generate OTP' };
        }
    }

    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${this.baseURL}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, message: 'Failed to verify OTP' };
        }
    }

    async resendOTP(email) {
        try {
            const response = await fetch(`${this.baseURL}/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error resending OTP:', error);
            return { success: false, message: 'Failed to resend OTP' };
        }
    }

    async completeRegistration(userData) {
        try {
            // Create user document in Firestore
            await firebaseService.createUserDocument(userData.uid, userData);
            
            // Mark email as verified in Firebase Auth
            // Note: Firebase doesn't allow programmatic email verification
            // We'll handle this by updating the user document
            
            console.log('✅ Registration completed successfully');
            return { success: true, message: 'Registration completed successfully' };
        } catch (error) {
            console.error('Error completing registration:', error);
            return { success: false, message: 'Failed to complete registration' };
        }
    }
}

export default new OTPService();
