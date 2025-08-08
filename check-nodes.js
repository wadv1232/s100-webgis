#!/usr/bin/env node

// Script to check if nodes exist in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNodes() {
  try {
    console.log('Checking nodes in database...\n');
    
    // Check all nodes
    const nodes = await prisma.node.findMany();
    console.log('All nodes in database:');
    nodes.forEach(node => {
      console.log(`- ID: ${node.id}, Name: ${node.name}, Type: ${node.type}`);
    });
    
    console.log('\nChecking specific nodes:');
    
    // Check china-national node
    const chinaNode = await prisma.node.findUnique({
      where: { id: 'china-national' }
    });
    console.log(`china-national node: ${chinaNode ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Check shanghai-port node
    const shanghaiNode = await prisma.node.findUnique({
      where: { id: 'shanghai-port' }
    });
    console.log(`shanghai-port node: ${shanghaiNode ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Check base map configs
    console.log('\nBase map configurations:');
    const baseMapConfigs = await prisma.nodeBaseMapConfig.findMany();
    if (baseMapConfigs.length === 0) {
      console.log('No base map configurations found');
    } else {
      baseMapConfigs.forEach(config => {
        console.log(`- Node: ${config.nodeId}, Type: ${config.type}, Default: ${config.isDefault}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking nodes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNodes();