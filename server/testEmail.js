import dotenv from 'dotenv';
import emailService from './services/emailService.js';

// Load environment variables first
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  console.log('📧 Email Configuration:');
  console.log('   HOST:', process.env.EMAIL_HOST);
  console.log('   PORT:', process.env.EMAIL_PORT);
  console.log('   USER:', process.env.EMAIL_USER);
  console.log('   PASS:', process.env.EMAIL_PASS ? `***configured*** (length: ${process.env.EMAIL_PASS.length})` : 'NOT SET');
  console.log('   PASS VALUE:', process.env.EMAIL_PASS ? `"${process.env.EMAIL_PASS}"` : 'NOT SET');
  
  // Reinitialize email service to ensure fresh config
  console.log('\n🔄 Reinitializing email service...');
  emailService.reinitialize();
  
  try {
    // Test connection
    console.log('\n🔗 Testing SMTP connection...');
    const connectionTest = await emailService.testConnection();
    console.log('Connection result:', connectionTest);
    
    if (connectionTest.success) {
      console.log('\n📮 Sending test email...');
      const emailResult = await emailService.sendWelcomeEmail(
        process.env.EMAIL_USER,
        'Test User',
        'user'
      );
      console.log('Email result:', emailResult);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailService();