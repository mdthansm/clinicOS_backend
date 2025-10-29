import { OTPRecord } from '../types';

// In-memory OTP storage (for development)
// In production, you might want to use Redis or a database
class OTPService {
  private otpRecords: Map<string, OTPRecord> = new Map();

  // Generate a random 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP with expiration
  storeOTP(email: string, otp: string, expiresInMinutes: number = 3): void {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    this.otpRecords.set(email.toLowerCase(), {
      otp,
      email: email.toLowerCase(),
      expiresAt,
      attempts: 0
    });

    console.log(`📝 OTP stored for ${email}: ${otp} (expires in ${expiresInMinutes} minutes)`);
  }

  // Verify OTP
  verifyOTP(email: string, inputOTP: string): { success: boolean; message: string } {
    const record = this.otpRecords.get(email.toLowerCase());

    if (!record) {
      return {
        success: false,
        message: 'OTP not found. Please request a new one.'
      };
    }

    // Check if OTP has expired
    if (new Date() > record.expiresAt) {
      this.otpRecords.delete(email.toLowerCase());
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempt limit
    if (record.attempts >= 3) {
      this.otpRecords.delete(email.toLowerCase());
      return {
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (record.otp !== inputOTP) {
      record.attempts++;
      this.otpRecords.set(email.toLowerCase(), record);
      return {
        success: false,
        message: 'Invalid OTP. Please try again.'
      };
    }

    // OTP is valid, remove it
    this.otpRecords.delete(email.toLowerCase());
    console.log(`✅ OTP verified successfully for ${email}`);
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  // Check if email has recent OTP (rate limiting)
  hasRecentOTP(email: string, cooldownMinutes: number = 1): boolean {
    const record = this.otpRecords.get(email.toLowerCase());
    
    if (!record) return false;
    
    const timeDiff = new Date(record.expiresAt).getTime() - Date.now();
    const remainingMinutes = timeDiff / (1000 * 60);
    
    return remainingMinutes > (3 - cooldownMinutes); // If more than cooldown time remaining
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [email, record] of this.otpRecords.entries()) {
      if (now > record.expiresAt) {
        this.otpRecords.delete(email);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
    }
  }

  // Get OTP statistics (for debugging)
  getStats(): { total: number; emails: string[] } {
    return {
      total: this.otpRecords.size,
      emails: Array.from(this.otpRecords.keys())
    };
  }
}

export const otpService = new OTPService();

