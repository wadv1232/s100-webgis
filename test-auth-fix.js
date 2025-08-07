#!/usr/bin/env node

// Test script to verify the authentication fix for base map configuration
const fetch = require('node-fetch');

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing authentication fix for base map configuration...\n');
  
  // Test 1: Try to save config for shanghai-port with node-admin token (should fail)
  console.log('1. Testing node-admin trying to save config for shanghai-port (should fail)...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/shanghai-port/base-map/config`, {
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
    console.log(`Response:`, result);
    console.log('Expected: 403 Forbidden\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 2: Try to save config for shanghai-port with admin token (should succeed)
  console.log('2. Testing admin trying to save config for shanghai-port (should succeed)...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/shanghai-port/base-map/config`, {
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
    console.log(`Response:`, result);
    console.log('Expected: 200 Success\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 3: Try to save config for china-national with node-admin token (should succeed)
  console.log('3. Testing node-admin trying to save config for china-national (should succeed)...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/china-national/base-map/config`, {
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
    console.log(`Response:`, result);
    console.log('Expected: 200 Success\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 4: Try to save config for china-national with admin token (should succeed)
  console.log('4. Testing admin trying to save config for china-national (should succeed)...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/china-national/base-map/config`, {
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
    console.log(`Response:`, result);
    console.log('Expected: 200 Success\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth().catch(console.error);