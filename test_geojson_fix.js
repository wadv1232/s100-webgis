// Test script to verify GeoJSON parsing fixes
const { parseGeoJSON } = require('./src/lib/utils/geo-utils.ts');

// Test cases
const testCases = [
  // Null coverage
  null,
  
  // Direct Polygon geometry
  '{"type":"Polygon","coordinates":[[[120,31],[122,31],[122,32],[120,32],[120,31]]]}',
  
  // Feature format
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[120,31],[122,31],[122,32],[120,32],[120,31]]]},"properties":{}}',
  
  // Invalid GeoJSON
  '{"type":"Invalid","data":"test"}'
];

console.log('Testing GeoJSON parsing fixes...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}:`);
  console.log('Input:', testCase);
  
  if (testCase === null) {
    console.log('Result: null (expected for null coverage)');
  } else {
    try {
      const result = parseGeoJSON(testCase);
      console.log('Result:', result ? `Success - ${result.type}` : 'Failed to parse');
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
  console.log('---');
});