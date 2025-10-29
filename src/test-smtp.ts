import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSMTP() {
  console.log('\n🔍 SMTP Connection Test\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check environment variables
  console.log('📧 Email:', process.env.SMTP_EMAIL || '❌ NOT SET');
  console.log('🔑 App Password:', process.env.SMTP_APP_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
    console.error('❌ Missing SMTP credentials in .env file!\n');
    console.error('Please create a .env file with:');
    console.error('SMTP_EMAIL=your-email@gmail.com');
    console.error('SMTP_APP_PASSWORD=your-app-password\n');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD,
    },
    logger: true,
    debug: true
  });

  try {
    console.log('🔄 Testing connection to Gmail SMTP...\n');
    await transporter.verify();
    console.log('\n✅ SUCCESS! SMTP connection is working!\n');
    
    // Send test email
    console.log('📤 Sending test email...\n');
    const info = await transporter.sendMail({
      from: {
        name: 'ClinicOS Test',
        address: process.env.SMTP_EMAIL!
      },
      to: process.env.SMTP_EMAIL,
      subject: '✅ SMTP Test Successful',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0f766e;">✅ SMTP Configuration Test</h2>
          <p>Your SMTP settings are working correctly!</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: smtp.gmail.com</li>
            <li>Port: 465 (SSL)</li>
            <li>Email: ${process.env.SMTP_EMAIL}</li>
          </ul>
          <p>You can now use this configuration for your ClinicOS backend.</p>
        </div>
      `,
      text: 'SMTP test successful! Your email configuration is working.'
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed! Your SMTP is ready to use.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error: any) {
    console.error('\n❌ SMTP Test Failed!\n');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n❌ Authentication Error!');
      console.error('\nPossible solutions:');
      console.error('1. Verify your email address is correct');
      console.error('2. Make sure you\'re using an App Password, not your regular Gmail password');
      console.error('3. Generate a new App Password:');
      console.error('   - Go to https://myaccount.google.com/security');
      console.error('   - Enable 2-Step Verification if not already enabled');
      console.error('   - Go to App Passwords');
      console.error('   - Create a new app password for "Mail"');
      console.error('   - Copy the 16-character password to your .env file');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n❌ Connection Error!');
      console.error('\nPossible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Make sure port 465 is not blocked by your firewall');
      console.error('3. Try disabling VPN if you\'re using one');
    }
    
    console.error('\n');
    process.exit(1);
  }
}

testSMTP();

