#!/usr/bin/env node

// Debug script to check Prisma client and models
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDB() {
  try {
    console.log('Checking Prisma client models...\n');
    
    // Check if nodeBaseMapConfig model exists
    console.log('Available models:');
    const models = Object.keys(prisma);
    models.forEach(model => {
      console.log(`- ${model}`);
    });
    
    // Check if nodeBaseMapConfig is accessible
    console.log('\nChecking nodeBaseMapConfig model:');
    if (prisma.nodeBaseMapConfig) {
      console.log('✅ nodeBaseMapConfig model is available');
      
      // Try to use the model
      try {
        const configs = await prisma.nodeBaseMapConfig.findMany();
        console.log(`✅ Found ${configs.length} base map configurations`);
      } catch (error) {
        console.log('❌ Error accessing nodeBaseMapConfig:', error.message);
      }
    } else {
      console.log('❌ nodeBaseMapConfig model is NOT available');
    }
    
    // Check nodes
    console.log('\nChecking nodes:');
    if (prisma.node) {
      const nodes = await prisma.node.findMany();
      console.log(`✅ Found ${nodes.length} nodes`);
      nodes.forEach(node => {
        console.log(`  - ${node.id}: ${node.name}`);
      });
    } else {
      console.log('❌ node model is NOT available');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDB();