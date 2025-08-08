#!/usr/bin/env node

// Test script to verify the final fix works correctly
// Using node's built-in fetch (Node.js 18+)

const baseUrl = 'http://localhost:3000';

async function testFinalFix() {
  console.log('Testing final fix - database and mock data consistency...\n');
  
  // Test 1: Save config for shanghai-port with admin token (should succeed)
  console.log('1. Testing admin saving config for shanghai-port...');
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
    console.log('Response:', result);
    if (response.ok && result.success) {
      console.log('✅ SUCCESS: Admin can save config for shanghai-port\n');
    } else {
      console.log('❌ FAILED: Admin cannot save config for shanghai-port\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: Save config for china-national with node-admin token (should succeed)
  console.log('2. Testing node-admin saving config for china-national...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/china-national/base-map/config`, {
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
    if (response.ok && result.success) {
      console.log('✅ SUCCESS: Node-admin can save config for china-national\n');
    } else {
      console.log('❌ FAILED: Node-admin cannot save config for china-national\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Try to save config for shanghai-port with node-admin token (should fail)
  console.log('3. Testing node-admin trying to save config for shanghai-port (should fail)...');
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
    console.log('Response:', result);
    if (response.status === 403) {
      console.log('✅ SUCCESS: Node-admin correctly blocked from managing shanghai-port\n');
    } else {
      console.log('❌ FAILED: Node-admin was not properly blocked\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 4: Load config for shanghai-port (should work)
  console.log('4. Testing loading config for shanghai-port...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/shanghai-port/base-map/config`, {
      headers: {
        'Authorization': 'Bearer admin@example.com'
      }
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    if (response.ok && result.success) {
      console.log('✅ SUCCESS: Can load config for shanghai-port\n');
    } else {
      console.log('❌ FAILED: Cannot load config for shanghai-port\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 5: Load config for china-national (should work)
  console.log('5. Testing loading config for china-national...');
  try {
    const response = await fetch(`${baseUrl}/api/nodes/china-national/base-map/config`, {
      headers: {
        'Authorization': 'Bearer node-admin@example.com'
      }
    });
    
    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', result);
    if (response.ok && result.success) {
      console.log('✅ SUCCESS: Can load config for china-national\n');
    } else {
      console.log('❌ FAILED: Cannot load config for china-national\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('🎉 Final fix testing completed!');
}

testFinalFix().catch(console.error);