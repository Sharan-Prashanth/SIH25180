import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

class EmailService {
  constructor() {
    console.log('🔧 Initializing Email Service...');
    try {
      this.transporter = this.createTransporter();
      this.isConfigured = !!this.transporter; // Set based on whether transporter was created
      console.log('📧 Email Service Status:', this.isConfigured ? '✅ CONFIGURED' : '⚠️ NOT CONFIGURED');
    } catch (error) {
      console.warn('⚠️ Email service initialization failed:', error.message);
      console.warn('📧 Email service will run in mock mode');
      this.transporter = null;
      this.isConfigured = false;
    }
  }

  // Reinitialize email service (useful for testing)
  reinitialize() {
    console.log('🔄 Reinitializing Email Service...');
    dotenv.config();
    try {
      this.transporter = this.createTransporter();
      this.isConfigured = !!this.transporter;
      console.log('📧 Email Service Status:', this.isConfigured ? '✅ CONFIGURED' : '⚠️ NOT CONFIGURED');
      return this.isConfigured;
    } catch (error) {
      console.warn('⚠️ Email service reinitialization failed:', error.message);
      this.transporter = null;
      this.isConfigured = false;
      return false;
    }
  }

  createTransporter() {
    console.log('🔧 Creating email transporter...');
    
    // Ensure credentials are properly loaded
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    console.log('📧 Credentials check:');
    console.log('   EMAIL_USER:', emailUser ? `${emailUser} ✅` : 'MISSING ❌');
    console.log('   EMAIL_PASS:', emailPass ? `configured (${emailPass.length} chars) ✅` : 'MISSING ❌');
    
    if (!emailUser || !emailPass) {
      console.warn('⚠️ Email credentials missing - cannot create transporter');
      return null;
    }

    // Clean up the password (remove any extra spaces but preserve the app password format)
    const cleanPassword = emailPass.trim();
    
    console.log('📧 Creating nodemailer transporter...');

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail service for better compatibility
        auth: {
          user: emailUser,
          pass: cleanPassword
        },
        tls: {
          rejectUnauthorized: false
        },
        // Force IPv4 connection
        family: 4,
        // Connection timeout
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        // Enable debug for troubleshooting
        debug: process.env.NODE_ENV === 'development'
      });
      
      console.log('✅ Email transporter created successfully');
      return transporter;
      
    } catch (error) {
      console.error('❌ Failed to create email transporter:', error.message);
      return null;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    // Check if email service is properly configured
    if (!this.isConfigured || !this.transporter) {
      console.log('\n📧 =============== EMAIL PREVIEW (CONFIG ISSUE) ===============');
      console.log(`📬 TO: ${to}`);
      console.log(`📌 SUBJECT: ${subject}`);
      console.log('📄 CONTENT PREVIEW:');
      console.log(textContent || this.stripHTML(htmlContent).substring(0, 200) + '...');
      console.log('📧 =============================================================\n');
      console.log('⚠️ Email service not configured - running in mock mode');
      
      return { 
        success: true, 
        messageId: `mock-${Date.now()}`,
        mode: 'mock-not-configured'
      };
    }

    // Force real email sending even in development (set SEND_REAL_EMAILS=true to enable)
    const sendRealEmails = process.env.NODE_ENV === 'production' || process.env.SEND_REAL_EMAILS === 'true';
    
    if (!sendRealEmails) {
      console.log('\n📧 =============== EMAIL PREVIEW ===============');
      console.log(`📬 TO: ${to}`);
      console.log(`📌 SUBJECT: ${subject}`);
      console.log('📄 CONTENT PREVIEW:');
      console.log(textContent || this.stripHTML(htmlContent).substring(0, 200) + '...');
      console.log('📧 =============================================\n');
      console.log('💡 To send real emails, set SEND_REAL_EMAILS=true in .env or NODE_ENV=production');
      
      return { 
        success: true, 
        messageId: `dev-${Date.now()}`,
        mode: 'development-mock'
      };
    }

    try {
      const mailOptions = {
        from: {
          name: 'NaCCER Portal',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHTML(htmlContent)
      };

      console.log(`📧 Attempting to send real email to ${to}...`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'production' };
    } catch (error) {
      console.error(`❌ Email send failed to ${to}:`, error.message);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('Invalid login')) {
        console.error('� Authentication failed - check EMAIL_USER and EMAIL_PASS in .env');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('🌐 Network error - check EMAIL_HOST and internet connection');
      }
      
      return { success: false, error: error.message, mode: 'production-failed' };
    }
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Welcome email template
  getWelcomeEmailTemplate(userName, userRole) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to NaCCER Portal!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to the <strong>National Centre for Clean Energy Research (NaCCER) Portal</strong>!</p>
            
            <p>Your account has been successfully created with the role: <strong>${userRole.toUpperCase()}</strong></p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3>🚀 Get Started:</h3>
              <ul>
                ${userRole === 'user' ? `
                  <li>📝 Create and submit your research proposals</li>
                  <li>📊 Track the progress of your submissions</li>
                  <li>💬 Collaborate with reviewers and staff</li>
                ` : userRole === 'reviewer' ? `
                  <li>📋 Review submitted proposals</li>
                  <li>👥 Assign staff members to approved projects</li>
                  <li>📝 Provide feedback to researchers</li>
                ` : `
                  <li>📄 Work on assigned research projects</li>
                  <li>📊 Submit progress reports</li>
                  <li>💬 Collaborate with reviewers and researchers</li>
                `}
              </ul>
            </div>
            
            <center>
              <a href="${process.env.CLIENT_URL}/login" class="button">🔐 Login to Portal</a>
            </center>
            
            <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br><strong>NaCCER Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 National Centre for Clean Energy Research. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Proposal status update template
  getProposalStatusEmailTemplate(userName, proposalTitle, oldStatus, newStatus, reviewerName, comment = null) {
    const getStatusColor = (status) => {
      switch(status) {
        case 'approved': return '#10B981';
        case 'rejected': return '#EF4444';
        case 'under_review': return '#F59E0B';
        case 'needs_revision': return '#8B5CF6';
        case 'assigned_to_staff': return '#F97316';
        default: return '#6B7280';
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'approved': return '✅';
        case 'rejected': return '❌';
        case 'under_review': return '🔍';
        case 'needs_revision': return '🔄';
        case 'assigned_to_staff': return '👥';
        default: return '📄';
      }
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-badge { padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; display: inline-block; margin: 5px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .comment-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 0 5px 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Proposal Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We have an update on your research proposal:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📝 ${proposalTitle}</h3>
              
              <div style="margin: 15px 0;">
                <p><strong>Status Changed:</strong></p>
                <span class="status-badge" style="background-color: ${getStatusColor(oldStatus)};">
                  ${getStatusIcon(oldStatus)} ${oldStatus.replace('_', ' ').toUpperCase()}
                </span>
                <span style="margin: 0 10px;">→</span>
                <span class="status-badge" style="background-color: ${getStatusColor(newStatus)};">
                  ${getStatusIcon(newStatus)} ${newStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <p><strong>Reviewed by:</strong> ${reviewerName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${comment ? `
              <div class="comment-box">
                <h4>💬 Reviewer Comments:</h4>
                <p style="margin: 5px 0;">${comment}</p>
              </div>
            ` : ''}
            
            <center>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">📊 View in Dashboard</a>
            </center>
            
            <p style="margin-top: 20px;">Stay updated on your research progress through the NaCCER Portal.</p>
            
            <p>Best regards,<br><strong>NaCCER Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 National Centre for Clean Energy Research. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Feedback notification template
  getFeedbackEmailTemplate(userName, proposalTitle, feedbackFrom, feedbackMessage) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .feedback-box { background: white; padding: 20px; border-left: 4px solid #8B5CF6; margin: 15px 0; border-radius: 0 8px 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Feedback Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>You have received new feedback on your research proposal:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📝 ${proposalTitle}</h3>
              <p><strong>Feedback from:</strong> ${feedbackFrom}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="feedback-box">
              <h4>💭 Feedback Message:</h4>
              <p style="line-height: 1.6; margin: 10px 0;">${feedbackMessage}</p>
            </div>
            
            <center>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">📋 View Full Feedback</a>
            </center>
            
            <p style="margin-top: 20px;">We encourage you to review this feedback and take appropriate action to improve your proposal.</p>
            
            <p>Best regards,<br><strong>NaCCER Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 National Centre for Clean Energy Research. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Staff assignment notification template
  getStaffAssignmentEmailTemplate(staffName, proposalTitle, authorName, reviewerName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .assignment-box { background: white; padding: 20px; border-left: 4px solid #F97316; margin: 15px 0; border-radius: 0 8px 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 New Project Assignment</h1>
          </div>
          <div class="content">
            <h2>Hello ${staffName}!</h2>
            <p>You have been assigned to work on a new research project:</p>
            
            <div class="assignment-box">
              <h3 style="color: #333; margin-top: 0;">📝 ${proposalTitle}</h3>
              <p><strong>Project Author:</strong> ${authorName}</p>
              <p><strong>Assigned by:</strong> ${reviewerName}</p>
              <p><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>📋 Your Responsibilities:</h4>
              <ul>
                <li>Review the project details and requirements</li>
                <li>Collaborate with the project author</li>
                <li>Submit regular progress reports</li>
                <li>Provide technical guidance and support</li>
              </ul>
            </div>
            
            <center>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">🚀 View Project Details</a>
            </center>
            
            <p style="margin-top: 20px;">Please log in to the portal to access all project materials and begin collaboration.</p>
            
            <p>Best regards,<br><strong>NaCCER Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 National Centre for Clean Energy Research. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName, userRole) {
    const subject = "🎉 Welcome to NaCCER Portal!";
    const htmlContent = this.getWelcomeEmailTemplate(userName, userRole);
    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send proposal status update email
  async sendProposalStatusEmail(userEmail, userName, proposalTitle, oldStatus, newStatus, reviewerName, comment = null) {
    const subject = `📊 Proposal Status Update: ${proposalTitle}`;
    const htmlContent = this.getProposalStatusEmailTemplate(userName, proposalTitle, oldStatus, newStatus, reviewerName, comment);
    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send feedback notification email
  async sendFeedbackEmail(userEmail, userName, proposalTitle, feedbackFrom, feedbackMessage) {
    const subject = `💬 New Feedback: ${proposalTitle}`;
    const htmlContent = this.getFeedbackEmailTemplate(userName, proposalTitle, feedbackFrom, feedbackMessage);
    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send staff assignment email
  async sendStaffAssignmentEmail(staffEmail, staffName, proposalTitle, authorName, reviewerName) {
    const subject = `👥 New Project Assignment: ${proposalTitle}`;
    const htmlContent = this.getStaffAssignmentEmailTemplate(staffName, proposalTitle, authorName, reviewerName);
    return await this.sendEmail(staffEmail, subject, htmlContent);
  }

  // Collaboration invitation template
  getCollaborationInviteEmailTemplate(inviteeEmail, proposalTitle, proposalId, inviterName, role, personalMessage = '') {
    const collaborationUrl = `${process.env.CLIENT_URL}/proposal/collaborate/${proposalId}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #EA580C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .invite-box { background: white; padding: 20px; border-left: 4px solid #EA580C; margin: 15px 0; border-radius: 0 8px 8px 0; }
          .proposal-id-box { background: #FEF3C7; padding: 10px; border-radius: 8px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Collaboration Invitation</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You have been invited to collaborate on a research proposal through the <strong>NaCCER Portal</strong>.</p>
            
            <div class="invite-box">
              <h3 style="color: #333; margin-top: 0;">📝 ${proposalTitle}</h3>
              <p><strong>Invited by:</strong> ${inviterName}</p>
              <p><strong>Your Role:</strong> ${role}</p>
              <p><strong>Invitation Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${personalMessage ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 0 8px 8px 0;">
                <h4>💬 Personal Message:</h4>
                <p style="margin: 5px 0; font-style: italic;">"${personalMessage}"</p>
              </div>
            ` : ''}
            
            <div class="proposal-id-box">
              <h4 style="margin: 0 0 10px 0; color: #92400E;">🔗 Quick Access</h4>
              <p style="margin: 5px 0; font-size: 14px;">Proposal ID: <strong>${proposalId}</strong></p>
              <div style="margin: 10px 0;">
                <a href="${collaborationUrl}" class="button" style="text-decoration: none;">
                  🚀 Click Here to Join Collaboration
                </a>
              </div>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>🎯 What You Can Do:</h4>
              <ul>
                <li>📝 Edit and review the proposal document</li>
                <li>💬 Participate in team discussions</li>
                <li>📊 Track version history and changes</li>
                <li>🤖 Collaborate with AI assistance</li>
                <li>📋 Add comments and suggestions</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">To get started, simply click the collaboration link above or log in to your NaCCER Portal account.</p>
            
            <p>Best regards,<br><strong>NaCCER Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 National Centre for Clean Energy Research. All rights reserved.</p>
            <p>This invitation was sent by ${inviterName}. If you have questions, please contact them directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send collaboration invitation email
  async sendCollaborationInviteEmail(inviteeEmail, proposalTitle, proposalId, inviterName, role, personalMessage = '') {
    const subject = `🤝 Collaboration Invitation: ${proposalTitle}`;
    const htmlContent = this.getCollaborationInviteEmailTemplate(inviteeEmail, proposalTitle, proposalId, inviterName, role, personalMessage);
    return await this.sendEmail(inviteeEmail, subject, htmlContent);
  }

  // Test email connectivity
  async testConnection() {
    // Check if email service is properly configured
    if (!this.isConfigured || !this.transporter) {
      console.log('⚠️ Email service not configured properly');
      console.log('💡 Please check EMAIL_USER and EMAIL_PASS in .env file');
      return { success: true, message: 'Email service not configured (running in mock mode)' };
    }

    const sendRealEmails = process.env.NODE_ENV === 'production' || process.env.SEND_REAL_EMAILS === 'true';
    
    if (!sendRealEmails) {
      console.log('✅ Email service running in development mode (mock emails)');
      console.log('💡 To test real email sending, set SEND_REAL_EMAILS=true in .env');
      return { success: true, message: 'Email service connected (development mode)' };
    }

    try {
      console.log('🔗 Testing real SMTP connection...');
      await this.transporter.verify();
      console.log('✅ Email service is ready to send real emails');
      return { success: true, message: 'Email service connected successfully' };
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      
      // Provide specific error guidance
      if (error.message.includes('Invalid login')) {
        console.error('🔑 Gmail authentication failed. Please check:');
        console.error('   1. EMAIL_USER is correct');
        console.error('   2. EMAIL_PASS is a valid App Password (not regular password)');
        console.error('   3. 2-Factor Authentication is enabled on Gmail');
        console.error('   4. App Password was generated from Gmail Security settings');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('🌐 Network/DNS error. Please check:');
        console.error('   1. Internet connection');
        console.error('   2. EMAIL_HOST setting (currently: ' + process.env.EMAIL_HOST + ')');
      }
      
      console.log('📧 Falling back to development mode for email testing');
      return { success: true, message: 'Email service connected (fallback to development mode)', warning: error.message };
    }
  }
}

export default new EmailService();