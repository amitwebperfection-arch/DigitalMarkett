import mongoose from 'mongoose';
import Order from '../backend/src/modules/orders/model.js';
import License from '../backend/src/modules/licenses/model.js';
import { MONGO_URI } from '../backend/src/config/env.js';
import '../backend/src/modules/products/model.js';

// Generate a unique license key
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  let key = '';
  for (let i = 0; i < segments; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
};

async function migrateLicenses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all completed orders
    const completedOrders = await Order.find({ 
      status: 'completed',
      paymentStatus: 'completed'
    }).populate('items.product');

    console.log(`Found ${completedOrders.length} completed orders`);

    let licensesCreated = 0;
    let licensesSkipped = 0;

    for (const order of completedOrders) {
      console.log(`\nProcessing order ${order._id}...`);

      for (const item of order.items) {
        if (!item.product) {
          console.log(`⚠️ Product not found for item in order ${order._id}`);
          continue;
        }

        // Check if license already exists
        const existingLicense = await License.findOne({
          user: order.user,
          product: item.product._id,
          order: order._id
        });

        if (existingLicense) {
          console.log(`⏭️ License already exists for product ${item.product._id}`);
          licensesSkipped++;
          continue;
        }

        // Create new license
        const license = await License.create({
          user: order.user,
          product: item.product._id,
          order: order._id,
          licenseKey: generateLicenseKey(),
          status: 'active',
          maxActivations: 1,
          activations: [],
          downloadCount: 0,
          expiresAt: null,
          createdAt: order.createdAt // Use order creation date
        });

        console.log(`✅ Created license ${license.licenseKey} for product ${item.product.title}`);
        licensesCreated++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Licenses created: ${licensesCreated}`);
    console.log(`⏭️ Licenses skipped (already exist): ${licensesSkipped}`);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run the migration
migrateLicenses();