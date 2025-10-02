# 🔐 NaCCER Portal Test Credentials

## Quick Login Credentials

### 👤 Regular Users (can create/edit their own proposals)
- **Email:** user@test.com  
- **Password:** password123
- **Name:** John Researcher
- **Department:** Computer Science

- **Email:** jane@test.com  
- **Password:** password123
- **Name:** Jane User
- **Department:** Biomedical Engineering

### 👨‍⚖️ Reviewers (can review all proposals, assign staff)
- **Email:** reviewer@test.com  
- **Password:** password123
- **Name:** Dr. Sarah Reviewer
- **Department:** Research Administration

- **Email:** admin@test.com  
- **Password:** admin123
- **Name:** Dr. Senior Reviewer
- **Department:** Administration

### 👨‍🔬 Research Staff (can view assigned proposals, submit reports)
- **Email:** staff@test.com  
- **Password:** password123
- **Name:** Alex Research Staff
- **Department:** Research Support

- **Email:** bob@test.com  
- **Password:** password123
- **Name:** Bob Staff Member
- **Department:** Technical Research

## 🎯 Testing Workflow

1. **As User (user@test.com):**
   - Login and create a new proposal
   - Edit your own proposals
   - View proposal status and feedback

2. **As Reviewer (reviewer@test.com):**
   - Login to see all submitted proposals
   - Review proposals and send feedback
   - Assign staff members to proposals
   - Approve/reject proposals

3. **As Staff (staff@test.com):**
   - Login to see assigned proposals
   - Submit research reports back to reviewers
   - Collaborate on proposal analysis

## 🔄 Complete Workflow Test
1. Create proposal with `user@test.com`
2. Review and assign staff with `reviewer@test.com`
3. Submit report with `staff@test.com`
4. Final decision with `reviewer@test.com`
5. User sees final result with `user@test.com`

## 🚀 URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** MongoDB running on localhost:27017

## 🔧 Reset Database
To reset all users and start fresh:
```bash
cd server
npm run seed
```