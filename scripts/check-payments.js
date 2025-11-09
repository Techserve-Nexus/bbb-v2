const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function checkPayments() {
  try {
    // Read .env file manually
    const envPath = path.join(__dirname, '..', '.env');
    let mongoUri = 'mongodb://localhost:27017/bbb_layout';
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=(.+)/);
      if (match) {
        mongoUri = match[1].trim();
      }
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get payments collection
    const paymentsCollection = db.collection('payments');
    
    // Count total payments
    const totalPayments = await paymentsCollection.countDocuments();
    console.log('📊 Total Payments:', totalPayments);
    
    // Count by status
    const statusCounts = await paymentsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📈 Payments by Status:');
    statusCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });
    
    // Count by payment method
    const methodCounts = await paymentsCollection.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n💳 Payments by Method:');
    methodCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });
    
    // Get recent Razorpay payments
    console.log('\n🔥 Recent Razorpay Payments:');
    const recentRazorpay = await paymentsCollection.find(
      { paymentMethod: 'razorpay' }
    ).sort({ createdAt: -1 }).limit(5).toArray();
    
    if (recentRazorpay.length === 0) {
      console.log('  No Razorpay payments found.');
    } else {
      recentRazorpay.forEach((payment, index) => {
        console.log(`\n  ${index + 1}. Registration: ${payment.registrationId}`);
        console.log(`     Order ID: ${payment.razorpayOrderId || 'N/A'}`);
        console.log(`     Payment ID: ${payment.razorpayPaymentId || 'N/A'}`);
        console.log(`     Amount: ₹${payment.amount}`);
        console.log(`     Status: ${payment.status}`);
        console.log(`     Created: ${payment.createdAt}`);
      });
    }
    
    // Get recent Manual payments
    console.log('\n\n📝 Recent Manual Payments:');
    const recentManual = await paymentsCollection.find(
      { paymentMethod: 'manual' }
    ).sort({ createdAt: -1 }).limit(5).toArray();
    
    if (recentManual.length === 0) {
      console.log('  No manual payments found.');
    } else {
      recentManual.forEach((payment, index) => {
        console.log(`\n  ${index + 1}. Registration: ${payment.registrationId}`);
        console.log(`     UPI ID: ${payment.upiId || 'N/A'}`);
        console.log(`     Transaction ID: ${payment.transactionId || 'N/A'}`);
        console.log(`     Amount: ₹${payment.amount}`);
        console.log(`     Status: ${payment.status}`);
        console.log(`     Verified By: ${payment.verifiedBy || 'Not verified'}`);
        console.log(`     Created: ${payment.createdAt}`);
      });
    }
    
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkPayments();
