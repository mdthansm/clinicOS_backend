# ClinicOS Backend

A standalone backend service for the ClinicOS application, handling OTP (One-Time Password) sending and verification via email.

## Features

- ✅ **OTP Sending** - Send OTP emails via Gmail SMTP
- ✅ **OTP Verification** - Verify OTP codes with rate limiting
- ✅ **Rate Limiting** - Prevent spam and abuse
- ✅ **Email Templates** - Beautiful HTML email templates
- ✅ **Health Checks** - Monitor service status
- ✅ **Auto Cleanup** - Remove expired OTPs automatically

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=your-16-char-app-password
PORT=3001
NODE_ENV=development
```

**To generate a Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password to your `.env` file

### 3. Test SMTP Configuration
```bash
npm run test-smtp
```

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Or build and start
npm run build
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`)

## API Endpoints

### POST `/api/otp/send`
Send OTP to email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 180
}
```

### POST `/api/otp/verify`
Verify OTP code.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### GET `/api/otp/health`
Check service health and email connection.

**Response:**
```json
{
  "success": true,
  "message": "OTP service is healthy",
  "emailConnection": true,
  "otpStats": {
    "total": 0,
    "emails": []
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/otp/cleanup`
Manually trigger cleanup of expired OTPs.

### GET `/health`
Simple health check endpoint.

### GET `/`
API information and available endpoints.

## Configuration

### Environment Variables
- `SMTP_EMAIL` - Your Gmail address (required)
- `SMTP_APP_PASSWORD` - Your Gmail app password (16 characters, required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### CORS Configuration
The server is configured to accept requests from:
- `http://localhost:3000` (React web apps)
- `http://localhost:8081` (Expo development)
- `exp://192.168.1.100:8081` (Expo on network)
- Any Expo development URL
- Any local network IP address

You can modify CORS settings in `src/server.ts` if needed.

## Project Structure

```
clinicOS_backend/
├── src/
│   ├── routes/
│   │   └── otpRoutes.ts      # API routes
│   ├── services/
│   │   ├── emailService.ts   # Email sending via SMTP
│   │   └── otpService.ts     # OTP management and storage
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── server.ts             # Main server file
│   └── test-smtp.ts          # SMTP test script
├── dist/                     # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env                      # Environment variables (create this)
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run watch` - Watch mode for development
- `npm run test-smtp` - Test SMTP connection and send test email

## Security Features

- **Rate Limiting** - 1 minute cooldown between OTP requests per email
- **Attempt Limiting** - Maximum 3 attempts per OTP
- **Expiration** - OTPs expire after 3 minutes
- **Input Validation** - Email format validation
- **CORS Protection** - Restricted to authorized origins
- **Error Handling** - Comprehensive error handling and logging

## Development

### Testing the API

```bash
# Health check
curl http://localhost:3001/api/otp/health

# Send OTP
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify OTP
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## Production Deployment

### Option 1: Render (Recommended)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy!

### Option 2: Railway

1. Connect GitHub repository
2. Railway auto-detects Node.js
3. Add environment variables
4. Deploy automatically

### Option 3: Heroku

1. Create `Procfile`: `web: npm start`
2. Set buildpacks for Node.js
3. Configure environment variables
4. Deploy

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify Gmail app password is correct (not regular password)
3. Run `npm run test-smtp` to diagnose
4. Check server logs for error messages

### CORS Issues
1. Ensure client app is running on allowed origins
2. Check CORS configuration in `src/server.ts`
3. Verify request headers include `Content-Type: application/json`

### OTP Verification Failing
1. Check if OTP has expired (3 minutes)
2. Verify email address matches exactly (case-insensitive)
3. Check attempt limit (max 3 attempts)
4. Look for typos in OTP code

### Port Already in Use
Change the `PORT` in your `.env` file to a different port.

## Dependencies

- **express** - Web framework
- **nodemailer** - Email sending
- **cors** - CORS middleware
- **dotenv** - Environment variable management
- **typescript** - TypeScript support
- **ts-node** - TypeScript execution

## Support

For issues or questions:
1. Check the server logs
2. Test API endpoints with curl or Postman
3. Verify environment configuration
4. Test SMTP connection with `npm run test-smtp`

## License

MIT

