#!/usr/bin/env node

// Debug script to check the db import in API context
const { PrismaClient } = require('@prisma/client');

// Simulate the import from '@/lib/db'
const globalForPrisma = globalThis;

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

async function debugAPIDB() {
  try {
    console.log('Checking db object in API context...\n');
    
    console.log('db object type:', typeof db);
    console.log('db constructor name:', db.constructor.name);
    
    // Check if nodeBaseMapConfig is accessible through db
    console.log('\nChecking db.nodeBaseMapConfig:');
    if (db.nodeBaseMapConfig) {
      console.log('✅ db.nodeBaseMapConfig is available');
      console.log('db.nodeBaseMapConfig type:', typeof db.nodeBaseMapConfig);
      
      // Check if updateMany method exists
      if (typeof db.nodeBaseMapConfig.updateMany === 'function') {
        console.log('✅ db.nodeBaseMapConfig.updateMany is available');
      } else {
        console.log('❌ db.nodeBaseMapConfig.updateMany is NOT available');
      }
      
      // Check available methods
      console.log('\nAvailable methods on db.nodeBaseMapConfig:');
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(db.nodeBaseMapConfig));
      methods.forEach(method => {
        if (typeof db.nodeBaseMapConfig[method] === 'function') {
          console.log(`  - ${method}`);
        }
      });
      
    } else {
      console.log('❌ db.nodeBaseMapConfig is NOT available');
    }
    
    // Try to actually use updateMany
    console.log('\nTesting updateMany operation:');
    try {
      const result = await db.nodeBaseMapConfig.updateMany({
        where: { nodeId: 'test' },
        data: { isDefault: false }
      });
      console.log('✅ updateMany operation successful:', result);
    } catch (error) {
      console.log('❌ updateMany operation failed:', error.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await db.$disconnect();
  }
}

debugAPIDB();