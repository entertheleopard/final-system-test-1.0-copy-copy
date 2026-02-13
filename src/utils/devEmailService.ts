/**
 * Development-only email service for testing authentication flows
 * 
 * IMPORTANT: This is for DEVELOPMENT/TESTING ONLY
 * In production, replace this with a real email service (SendGrid, AWS SES, Resend, etc.)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const devEmailService = {
  /**
   * Simulates sending a verification email by logging to console
   * @param email - Recipient email address
   * @param code - 6-digit verification code
   */
  sendVerificationEmail: (email: string, code: string) => {
    if (!isDevelopment) {
      console.warn('devEmailService should only be used in development');
      return;
    }

    console.group('📧 [DEV] Verification Email Sent');
    console.log('To:', email);
    console.log('Subject: Verify your email address');
    console.log('Verification Code:', code);
    console.log('---');
    console.log('Email Body:');
    console.log(`
Hello,

Thank you for signing up! Please use the following code to verify your email address:

Verification Code: ${code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
The Team
    `);
    console.groupEnd();
  },

  /**
   * Simulates sending a password reset email by logging to console
   * @param email - Recipient email address
   */
  sendPasswordResetEmail: (email: string) => {
    if (!isDevelopment) {
      console.warn('devEmailService should only be used in development');
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetLink = `${window.location.origin}/auth/reset-password?token=${resetToken}`;

    console.group('📧 [DEV] Password Reset Email Sent');
    console.log('To:', email);
    console.log('Subject: Reset your password');
    console.log('Reset Link:', resetLink);
    console.log('---');
    console.log('Email Body:');
    console.log(`
Hello,

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The Team
    `);
    console.groupEnd();
  }
};
