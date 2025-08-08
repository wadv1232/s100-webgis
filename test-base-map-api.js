#!/usr/bin/env node

// Test script to verify base map configuration API with correct database IDs
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

// Database node IDs
const nodeIds = {
  shanghaiPort: 'cme0nkyy3000lustwru9b23ny',
  chinaNational: 'cme0nkyun000hustwcvsbpu7v'
};

async function testBaseMapAPI() {
  console.log('Testing Base Map Configuration API with correct database IDs...\n');
  
  // Test 1: Save config for shanghai-port with admin token
  console.log('1. Testing admin saving config for shanghai-port...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/${nodeIds.shanghaiPort}/base-map/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin@example.com'
      },
      body: JSON.stringify({
        type: 'osm',
        isDefault: true
      })
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    console.log('✅ Expected: Success\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: Save config for china-national with node-admin token
  console.log('2. Testing node-admin saving config for china-national...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/${nodeIds.chinaNational}/base-map/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer node-admin@example.com'
      },
      body: JSON.stringify({
        type: 'satellite',
        isDefault: true
      })
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    console.log('✅ Expected: Success\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Try to save config for shanghai-port with node-admin token (should fail)
  console.log('3. Testing node-admin trying to save config for shanghai-port (should fail)...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/${nodeIds.shanghaiPort}/base-map/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer node-admin@example.com'
      },
      body: JSON.stringify({
        type: 'osm',
        isDefault: true
      })
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    console.log('✅ Expected: 403 Forbidden\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 4: Load config for shanghai-port
  console.log('4. Testing loading config for shanghai-port...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/${nodeIds.shanghaiPort}/base-map/config`, {
      headers: {
        'Authorization': 'Bearer admin@example.com'
      }
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    console.log('✅ Expected: Success with config data\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBaseMapAPI().catch(console.error);