import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB for seeding...');

    // Clear existing users (optional - remove if you want to keep existing users)
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // Static test users
    const testUsers = [
      {
        name: 'John Researcher',
        email: 'user@test.com',
        password: 'password123',
        role: 'user',
        department: 'Computer Science',
        expertise: ['AI', 'Machine Learning', 'Data Science']
      },
      {
        name: 'Dr. Sarah Reviewer',
        email: 'reviewer@test.com',
        password: 'password123',
        role: 'reviewer',
        department: 'Research Administration',
        expertise: ['AI Review', 'Healthcare Tech', 'Innovation Management']
      },
      {
        name: 'Alex Research Staff',
        email: 'staff@test.com',
        password: 'password123',
        role: 'staff',
        department: 'Research Support',
        expertise: ['Technical Analysis', 'Research Methodology', 'Data Analysis']
      },
      {
        name: 'Dr. Senior Reviewer',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'reviewer',
        department: 'Administration',
        expertise: ['Policy Review', 'Budget Analysis', 'Strategic Planning']
      },
      {
        name: 'Jane User',
        email: 'jane@test.com',
        password: 'password123',
        role: 'user',
        department: 'Biomedical Engineering',
        expertise: ['Healthcare', 'Medical Devices', 'Biotechnology']
      },
      {
        name: 'Bob Staff Member',
        email: 'bob@test.com',
        password: 'password123',
        role: 'staff',
        department: 'Technical Research',
        expertise: ['Software Development', 'System Architecture', 'Cloud Computing']
      }
    ];

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      testUsers.map(async (userData) => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        return {
          ...userData,
          password: hashedPassword
        };
      })
    );

    // Insert users into database
    const createdUsers = await User.insertMany(hashedUsers);
    
    console.log('✅ Successfully created test users:');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('====================');
    
    testUsers.forEach((user, index) => {
      console.log(`\n👤 ${user.role.toUpperCase()} - ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   🏢 Department: ${user.department}`);
      console.log(`   🔬 Expertise: ${user.expertise.join(', ')}`);
    });

    console.log('\n🎯 QUICK TEST CREDENTIALS:');
    console.log('=========================');
    console.log('Regular User: user@test.com / password123');
    console.log('Reviewer: reviewer@test.com / password123');
    console.log('Staff: staff@test.com / password123');
    console.log('Senior Reviewer: admin@test.com / admin123');

    console.log('\n✨ Database seeded successfully!');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();