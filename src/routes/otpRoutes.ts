import { Request, Response, Router } from 'express';
import { EmailService } from '../services/emailService';
import { otpService } from '../services/otpService';
import { SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse } from '../types';

const router: Router = Router();
// DON'T create emailService here - environment variables might not be loaded yet!

// Send OTP endpoint
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email }: SendOTPRequest = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check rate limiting
    if (otpService.hasRecentOTP(email, 1)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another OTP'
      });
    }

    // Generate OTP
    const otp = otpService.generateOTP();
    
    // Store OTP
    otpService.storeOTP(email, otp, 3); // 3 minutes expiry

    // Create EmailService HERE - after env variables are loaded
    const emailService = new EmailService();
    
    // Send email
    const emailResult = await emailService.sendOTPEmail(email, otp);

    if (emailResult.success) {
      const response: SendOTPResponse = {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 3 * 60 // 3 minutes in seconds
      };
      
      console.log(`✅ OTP sent to ${email}: ${otp}`);
      res.json(response);
    } else {
      console.error(`❌ Failed to send OTP to ${email}: ${emailResult.message}`);
      res.status(500).json({
        success: false,
        message: emailResult.message || 'Failed to send OTP email. Please check server logs for details.'
      });
    }

  } catch (error: any) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP endpoint
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, otp }: VerifyOTPRequest = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Verify OTP
    const result = otpService.verifyOTP(email, otp);
    
    const response: VerifyOTPResponse = {
      success: result.success,
      message: result.message
    };

    if (result.success) {
      res.json(response);
    } else {
      res.status(400).json(response);
    }

  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Create EmailService here too
    const emailService = new EmailService();
    
    // Test email connection
    const emailConnection = await emailService.testConnection();
    const otpStats = otpService.getStats();

    res.json({
      success: true,
      message: 'OTP service is healthy',
      emailConnection,
      otpStats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Cleanup expired OTPs endpoint
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    otpService.cleanupExpiredOTPs();
    const stats = otpService.getStats();
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

export default router;

