// Types for OTP service
export interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

