import nodemailer from 'nodemailer';

// Email service using nodemailer for Gmail SMTP
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Gmail SMTP configuration - using SSL on port 465
    const emailConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465 (SSL), false for other ports
      auth: { 
        user: process.env.SMTP_EMAIL?.trim(), 
        pass: process.env.SMTP_APP_PASSWORD?.trim().replace(/\s/g, '') // Remove all spaces from app password
      },
      logger: true, // Enable logging
      debug: true   // Enable debug output
    };

    console.log('📧 Initializing Email Service with config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
      passConfigured: !!emailConfig.auth.pass
    });

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  // Send OTP email
  async sendOTPEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Attempting to send OTP to:', email);
      const trimmedEmail = process.env.SMTP_EMAIL?.trim();
      const trimmedPassword = process.env.SMTP_APP_PASSWORD?.trim().replace(/\s/g, '');
      console.log('📧 SMTP Config:', {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: trimmedEmail,
        pass: trimmedPassword ? `***configured (${trimmedPassword.length} chars)***` : 'NOT_SET'
      });

      // Verify transporter configuration first
      console.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #0f766e; margin-top: 0;">🏥 ClinicOS - Login OTP</h2>
            <p style="color: #333; font-size: 16px;">Your one-time password for login is:</p>
            <div style="background: #f0fdfa; border: 2px dashed #14b8a6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; letter-spacing: 8px; color: #0f766e; font-weight: bold;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">⏱️ This code expires in <strong>3 minutes</strong></p>
            <p style="color: #666; font-size: 14px;">🔒 Do not share this code with anyone for security reasons.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated message from ClinicOS. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `;

      console.log('📤 Sending email...');
      const info = await this.transporter.sendMail({
        from: {
          name: 'ClinicOS',
          address: process.env.SMTP_EMAIL?.trim() || '',
        },
        to: email,
        subject: '🔐 Your ClinicOS Login OTP',
        html,
        text: `Your ClinicOS OTP is: ${otp} (valid for 3 minutes). Do not share this code with anyone.`,
      });

      console.log('✅ OTP email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Response:', info.response);
      
      return { 
        success: true, 
        message: 'OTP email sent successfully' 
      };

    } catch (error: any) {
      console.error('❌ SMTP send error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error response:', error.response);
      
      // More detailed error messages
      let errorMessage = 'Failed to send OTP email';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Authentication failed. Please check your email and app password.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Could not connect to Gmail SMTP server. Check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing SMTP connection...');
      const trimmedEmail = process.env.SMTP_EMAIL?.trim();
      const trimmedPassword = process.env.SMTP_APP_PASSWORD?.trim().replace(/\s/g, '');
      console.log('📧 Config:', {
        host: 'smtp.gmail.com',
        port: 465,
        user: trimmedEmail,
        pass: trimmedPassword ? `***configured (${trimmedPassword.length} chars)***` : 'NOT_SET'
      });
      
      await this.transporter.verify();
      console.log('✅ SMTP connection test successful!');
      return true;
    } catch (error: any) {
      console.error('❌ SMTP connection test failed!');
      console.error('❌ Error:', error.message);
      console.error('❌ Code:', error.code);
      
      if (error.code === 'EAUTH') {
        console.error('❌ Authentication error: Check your email and app password');
      } else if (error.code === 'ECONNECTION') {
        console.error('❌ Connection error: Cannot reach Gmail SMTP server');
      }
      
      return false;
    }
  }
}

