import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Proposal from './models/Proposal.js';
import User from './models/User.js';

dotenv.config();

async function listProposals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const proposals = await Proposal.find({}).populate('author', 'name email');
    console.log(`\n📋 Found ${proposals.length} proposals:`);
    
    proposals.forEach((proposal, index) => {
      console.log(`\n${index + 1}. Proposal ID: ${proposal._id}`);
      console.log(`   Title: "${proposal.title}"`);
      console.log(`   Author: ${proposal.author?.name || 'Unknown'} (${proposal.author?.email || 'No email'})`);
      console.log(`   Status: ${proposal.status}`);
      console.log(`   Created: ${proposal.createdAt}`);
      console.log(`   Budget: $${proposal.budget}`);
    });

    console.log('\n🔗 You can test these proposal IDs in your frontend:');
    proposals.forEach((proposal, index) => {
      console.log(`   ${index + 1}. http://localhost:3001/proposal/track/${proposal._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

listProposals();