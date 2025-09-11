/**
 * OTP Service
 * Handles OTP verification and user registration completion
 */

import firebaseService from './firebaseService.js';

class OTPService {
    constructor() {
        this.baseURL = 'http://localhost:5002/api/otp';
    }

    async sendOtp(email, firstName, lastName) {
        try {
            console.log('📩 Sending OTP to:', email);
            
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
            
            if (result.success) {
                console.log('✅ OTP sent successfully');
            } else {
                console.error('❌ OTP sending failed:', result.message);
            }
            
            return result;
        } catch (error) {
            console.error('❌ OTP sending failed:', error);
            return { success: false, message: 'Failed to send OTP' };
        }
    }

    async generateOTP(email, firstName, lastName) {
        return this.sendOtp(email, firstName, lastName);
    }

    async verifyOTP(email, otp) {
        try {
            console.log('🔐 Verifying OTP for:', email);
            
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
            
            if (result.success) {
                console.log('✅ OTP verification successful');
            } else {
                console.error('❌ OTP verification failed:', result.message);
            }
            
            return result;
        } catch (error) {
            console.error('❌ OTP verification failed:', error);
            return { success: false, message: 'Failed to verify OTP' };
        }
    }

    async resendOTP(email) {
        try {
            console.log('📩 Resending OTP to:', email);
            
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
            
            if (result.success) {
                console.log('✅ OTP resent successfully');
            } else {
                console.error('❌ OTP resend failed:', result.message);
            }
            
            return result;
        } catch (error) {
            console.error('❌ OTP resend failed:', error);
            return { success: false, message: 'Failed to resend OTP' };
        }
    }

    async completeRegistration(userData) {
        try {
            console.log('🔐 Completing registration for user:', userData.email);
            
            // Use the new completeRegistration method from firebaseService
            const result = await firebaseService.completeRegistration(userData);
            
            if (result.ok) {
                console.log('✅ Registration completed successfully');
                return { success: true, message: 'Registration completed successfully' };
            } else {
                throw new Error(result.error || 'Failed to complete registration');
            }
        } catch (error) {
            console.error('❌ Error completing registration:', error);
            return { success: false, message: 'Failed to complete registration' };
        }
    }
}

export default new OTPService();
