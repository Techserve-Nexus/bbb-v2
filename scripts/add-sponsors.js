// Script to add initial sponsors to database
// Run with: node scripts/add-sponsors.js

const mongoose = require('mongoose');

// Sponsor Schema
const SponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  website: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Platinum', 'Gold', 'Silver'], 
    required: true 
  },
  description: { type: String, required: true },
  socialLinks: { type: Map, of: String },
}, {
  timestamps: true,
});

// Initial sponsors data
const sponsorsData = [
  {
    name: "Chess Masters India",
    logo: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=CMI",
    website: "https://example.com/chess-masters",
    category: "Platinum",
    description: "Leading chess training academy in India",
    socialLinks: {
      facebook: "https://facebook.com/chessmasters",
      twitter: "https://twitter.com/chessmasters",
      instagram: "https://instagram.com/chessmasters",
      linkedin: "https://linkedin.com/company/chessmasters"
    }
  },
  {
    name: "Global Connect Technologies",
    logo: "https://via.placeholder.com/150/3B82F6/FFFFFF?text=GCT",
    website: "https://example.com/global-connect",
    category: "Platinum",
    description: "Technology solutions for sports events",
    socialLinks: {
      linkedin: "https://linkedin.com/company/globalconnect",
      twitter: "https://twitter.com/globalconnect",
      website: "https://globalconnect.com"
    }
  },
  {
    name: "Strategy Plus Consulting",
    logo: "https://via.placeholder.com/150/F7931E/FFFFFF?text=SPC",
    website: "https://example.com/strategy-plus",
    category: "Gold",
    description: "Strategic consulting for sports organizations",
    socialLinks: {
      linkedin: "https://linkedin.com/company/strategyplus",
      twitter: "https://twitter.com/strategyplus"
    }
  },
  {
    name: "Elite Events Management",
    logo: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=EEM",
    website: "https://example.com/elite-events",
    category: "Gold",
    description: "Professional event management services",
    socialLinks: {
      facebook: "https://facebook.com/eliteevents",
      instagram: "https://instagram.com/eliteevents",
      website: "https://eliteevents.com"
    }
  },
  {
    name: "Innovation Labs",
    logo: "https://via.placeholder.com/150/10B981/FFFFFF?text=IL",
    website: "https://example.com/innovation-labs",
    category: "Gold",
    description: "Tech innovation for competitive sports",
    socialLinks: {
      twitter: "https://twitter.com/innovationlabs",
      linkedin: "https://linkedin.com/company/innovationlabs",
      instagram: "https://instagram.com/innovationlabs"
    }
  },
  {
    name: "Community First Foundation",
    logo: "https://via.placeholder.com/150/EC4899/FFFFFF?text=CFF",
    website: "https://example.com/community-first",
    category: "Silver",
    description: "Supporting grassroots sports development",
    socialLinks: {
      facebook: "https://facebook.com/communityfirst",
      instagram: "https://instagram.com/communityfirst"
    }
  },
  {
    name: "Sports Arena India",
    logo: "https://via.placeholder.com/150/F59E0B/FFFFFF?text=SAI",
    website: "https://example.com/sports-arena",
    category: "Silver",
    description: "Premium sports facilities and venues",
    socialLinks: {
      instagram: "https://instagram.com/sportsarena",
      facebook: "https://facebook.com/sportsarena",
      website: "https://sportsarena.in"
    }
  },
  {
    name: "Digital Champions",
    logo: "https://via.placeholder.com/150/06B6D4/FFFFFF?text=DC",
    website: "https://example.com/digital-champions",
    category: "Silver",
    description: "Digital marketing for sports events",
    socialLinks: {
      twitter: "https://twitter.com/digitalchamps",
      linkedin: "https://linkedin.com/company/digitalchampions",
      facebook: "https://facebook.com/digitalchampions"
    }
  }
];

async function addSponsors() {
  try {
    // Get MongoDB URI from environment or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bbb-chess';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create Sponsor model
    const Sponsor = mongoose.models.Sponsor || mongoose.model('Sponsor', SponsorSchema);

    // Check if sponsors already exist
    const existingCount = await Sponsor.countDocuments();
    console.log(`📊 Existing sponsors: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Sponsors already exist. Do you want to:');
      console.log('   1. Skip (default)');
      console.log('   2. Clear and re-add');
      console.log('\nTo clear and re-add, run: node scripts/add-sponsors.js --force');
      
      if (!process.argv.includes('--force')) {
        console.log('✅ Skipping. Use --force flag to override.');
        await mongoose.connection.close();
        return;
      }

      console.log('🗑️  Clearing existing sponsors...');
      await Sponsor.deleteMany({});
      console.log('✅ Cleared existing sponsors');
    }

    // Add sponsors
    console.log('➕ Adding sponsors...');
    const result = await Sponsor.insertMany(sponsorsData);
    console.log(`✅ Added ${result.length} sponsors successfully!`);

    // Display added sponsors
    console.log('\n📋 Added Sponsors:');
    result.forEach((sponsor, index) => {
      console.log(`   ${index + 1}. ${sponsor.name} (${sponsor.category})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Done! Sponsors have been added to the database.');
  } catch (error) {
    console.error('❌ Error adding sponsors:', error);
    process.exit(1);
  }
}

// Run the script
addSponsors();
