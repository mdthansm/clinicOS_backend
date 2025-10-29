import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import otpRoutes from './routes/otpRoutes';
import { EmailService } from './services/emailService';

// Load environment variables FIRST
// Only load .env file in development or if the file exists
const isProduction = process.env.NODE_ENV === 'production';
const envPath = path.join(__dirname, '../.env');

if (!isProduction) {
  // In development, try to load .env file
  console.log('🔧 Loading environment from:', envPath);
  if (fs.existsSync(envPath)) {
    const envResult = dotenv.config({ path: envPath });
    if (envResult.error) {
      console.warn('⚠️ Warning: Error loading .env file:', envResult.error.message);
    } else {
      console.log('✅ .env file loaded successfully');
    }
  } else {
    console.log('⚠️ .env file not found, using system environment variables');
    // Try loading from default location as fallback
    dotenv.config(); // This won't error if .env doesn't exist
  }
} else {
  // In production, use system environment variables (set by hosting platform)
  console.log('🔧 Production mode: Using system environment variables');
  // In production, also try loading .env as a fallback (useful for troubleshooting)
  // This won't override existing env vars, only fills in missing ones
  dotenv.config({ path: envPath, override: false });
}

// Debug environment variables (without showing sensitive data)
console.log('🔍 Environment check:');
console.log('  SMTP_EMAIL:', process.env.SMTP_EMAIL || '❌ NOT SET');
console.log('  SMTP_APP_PASSWORD:', process.env.SMTP_APP_PASSWORD ? '✅ SET (***hidden***)' : '❌ NOT SET');
console.log('  PORT:', process.env.PORT || '3001 (default)');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development (default)');

// Additional debugging for production
if (isProduction) {
  console.log('\n🔍 Debug: Checking all environment variable keys...');
  const envKeys = Object.keys(process.env).filter(key => 
    key.includes('SMTP') || key.includes('EMAIL') || key === 'PORT' || key === 'NODE_ENV'
  );
  if (envKeys.length > 0) {
    console.log('  Found environment keys:', envKeys.join(', '));
  } else {
    console.log('  ⚠️ No SMTP-related environment variables found');
  }
}

// Validate required environment variables (warn but don't exit - allows diagnostic endpoint)
const hasSMTPCredentials = !!(process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD);

if (!hasSMTPCredentials) {
  console.error('');
  console.error('⚠️ WARNING: Missing required environment variables!');
  console.error('');
  
  if (isProduction) {
    console.error('Production environment detected. Please set the following environment variables');
    console.error('in your hosting platform\'s dashboard (Render/Railway/etc.):');
    console.error('');
    console.error('  SMTP_EMAIL=your-email@gmail.com');
    console.error('  SMTP_APP_PASSWORD=your-16-char-app-password');
    console.error('');
    console.error('For Render:');
    console.error('  1. Go to your service dashboard');
    console.error('  2. Navigate to "Environment" tab');
    console.error('  3. Add SMTP_EMAIL and SMTP_APP_PASSWORD variables');
    console.error('  4. Click "Save Changes"');
    console.error('  5. Manually redeploy: "Manual Deploy" → "Deploy latest commit"');
    console.error('');
    console.error('⚠️ Server will start but OTP functionality will not work until credentials are set!');
  } else {
    console.error('Development environment: Please ensure your .env file contains:');
    console.error('  SMTP_EMAIL=your-email@gmail.com');
    console.error('  SMTP_APP_PASSWORD=your-16-char-app-password');
  }
  
  console.error('');
  console.error('To generate an App Password:');
  console.error('1. Go to https://myaccount.google.com/security');
  console.error('2. Enable 2-Step Verification');
  console.error('3. Go to App Passwords');
  console.error('4. Generate a new app password for "Mail"');
  console.error('');
} else {
  console.log('✅ SMTP credentials found');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006',
    'exp://localhost:8081',
    /^exp:\/\/.*/, // Allow all Expo URLs
    /^http:\/\/192\.168\.\d+\.\d+:8081$/, // Allow local network
    /^http:\/\/192\.168\.\d+\.\d+:3005$/, // Allow backend access from mobile
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow any local network port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📨 [${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/otp', otpRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏥 ClinicOS Backend - OTP Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/otp/send': 'Send OTP to email',
      'POST /api/otp/verify': 'Verify OTP',
      'GET /api/otp/health': 'Health check',
      'POST /api/otp/cleanup': 'Cleanup expired OTPs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  console.error('❌ Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'POST /api/otp/send',
      'POST /api/otp/verify',
      'GET /api/otp/health'
    ]
  });
});

// Start server
async function startServer() {
  try {
    console.log('\n🚀 Starting ClinicOS Backend...\n');
    
    // Test email connection on startup only if credentials are available
    if (hasSMTPCredentials) {
      console.log('📧 Testing email service...');
      const emailService = new EmailService();
      const emailConnection = await emailService.testConnection();
      
      if (!emailConnection) {
        console.error('\n❌ CRITICAL: Email service connection failed!');
        if (isProduction) {
          console.error('❌ Please check your SMTP credentials in your hosting platform\'s environment variables\n');
        } else {
          console.error('❌ Please check your SMTP credentials in .env file\n');
        }
        process.exit(1);
      }
      
      console.log('✅ Email service connection successful');
    } else {
      console.warn('⚠️ Skipping email service test - SMTP credentials not configured');
    }

    app.listen(PORT, () => {
      console.log('\n✅ ClinicOS Backend started successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server:        http://localhost:${PORT}`);
      console.log(`📧 Email Service: ${hasSMTPCredentials ? '✅ Configured' : '❌ Not Configured'}`);
      console.log(`🌍 Environment:   ${process.env.NODE_ENV || 'development'}`);
      console.log(`📬 SMTP Email:    ${process.env.SMTP_EMAIL || 'Not Set'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📋 Available endpoints:');
      console.log(`  POST http://localhost:${PORT}/api/otp/send`);
      console.log(`  POST http://localhost:${PORT}/api/otp/verify`);
      console.log(`  GET  http://localhost:${PORT}/api/otp/health`);
      console.log(`  GET  http://localhost:${PORT}/health`);
      console.log(`  GET  http://localhost:${PORT}/env-check`);
      console.log('\n✨ Ready to accept requests!\n');
    });

    // Cleanup expired OTPs every 5 minutes
    setInterval(() => {
      console.log('🧹 Running scheduled OTP cleanup...');
    }, 5 * 60 * 1000);

  } catch (error: any) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

