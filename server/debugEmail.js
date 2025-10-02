import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Email Configuration Debug');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `"${process.env.EMAIL_PASS}"` : 'NOT SET');
console.log('EMAIL_PASS (length):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS);

// Check if credentials are truthy
console.log('\n🔍 Credential Validation:');
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('Both exist:', !!(process.env.EMAIL_USER && process.env.EMAIL_PASS));

// Check for any whitespace issues
if (process.env.EMAIL_PASS) {
    console.log('\n🔍 Password Analysis:');
    console.log('Raw password:', JSON.stringify(process.env.EMAIL_PASS));
    console.log('Trimmed password:', JSON.stringify(process.env.EMAIL_PASS.trim()));
    console.log('Character codes:', [...process.env.EMAIL_PASS].map(c => c.charCodeAt(0)));
}