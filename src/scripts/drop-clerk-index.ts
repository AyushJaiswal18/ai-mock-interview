import { connect } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirenext';

async function dropClerkIndex() {
  try {
    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const connection = await connect(MONGODB_URI);
    const db = connection.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Drop the clerkId index
    try {
      await db.collection('users').dropIndex('clerkId_1');
      console.log('✅ Dropped clerkId_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  clerkId_1 index does not exist');
      } else {
        console.error('❌ Error dropping index:', error);
      }
    }

    // List all indexes
    const indexes = await db.collection('users').indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((index: any) => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

dropClerkIndex();
