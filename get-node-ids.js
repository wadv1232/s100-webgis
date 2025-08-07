#!/usr/bin/env node

// Script to get the mapping between mock node IDs and database node IDs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getNodeIds() {
  try {
    console.log('Getting node ID mappings...\n');
    
    const nodes = await prisma.node.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        code: true
      }
    });
    
    console.log('Node ID mappings:');
    nodes.forEach(node => {
      console.log(`- Name: ${node.name}`);
      console.log(`  Database ID: ${node.id}`);
      console.log(`  Code: ${node.code}`);
      console.log(`  Type: ${node.type}`);
      console.log('');
    });
    
    // Create mapping based on node names
    const mapping = {};
    nodes.forEach(node => {
      if (node.name.includes('全球根节点')) {
        mapping['global-root'] = node.id;
      } else if (node.name.includes('国家级节点')) {
        mapping['china-national'] = node.id;
      } else if (node.name.includes('东海分局')) {
        mapping['east-china-sea'] = node.id;
      } else if (node.name.includes('上海港')) {
        mapping['shanghai-port'] = node.id;
      } else if (node.name.includes('宁波港')) {
        mapping['ningbo-port'] = node.id;
      }
    });
    
    console.log('Mock ID to Database ID mapping:');
    Object.entries(mapping).forEach(([mockId, dbId]) => {
      console.log(`  ${mockId} -> ${dbId}`);
    });
    
  } catch (error) {
    console.error('Error getting node IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getNodeIds();