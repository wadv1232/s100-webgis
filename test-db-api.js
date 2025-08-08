#!/usr/bin/env node

// Test script to check the actual API endpoint
const { PrismaClient } = require('@prisma/client');

// Create a simple server to test the db import
const http = require('http');

// Simulate the exact same import as in the API route
const globalForPrisma = globalThis;

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

const server = http.createServer(async (req, res) => {
  if (req.url === '/test-db' && req.method === 'GET') {
    try {
      console.log('Testing db object in server context...');
      
      // Check if nodeBaseMapConfig is available
      if (db.nodeBaseMapConfig) {
        console.log('✅ db.nodeBaseMapConfig is available in server');
        
        // Check if updateMany method exists
        if (typeof db.nodeBaseMapConfig.updateMany === 'function') {
          console.log('✅ db.nodeBaseMapConfig.updateMany is available in server');
          
          // Try to use updateMany
          try {
            const result = await db.nodeBaseMapConfig.updateMany({
              where: { nodeId: 'test' },
              data: { isDefault: false }
            });
            console.log('✅ updateMany operation successful in server:', result);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Database operations working correctly',
              result 
            }));
          } catch (error) {
            console.log('❌ updateMany operation failed in server:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              error: error.message 
            }));
          }
        } else {
          console.log('❌ db.nodeBaseMapConfig.updateMany is NOT available in server');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'updateMany method not available' 
          }));
        }
      } else {
        console.log('❌ db.nodeBaseMapConfig is NOT available in server');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'nodeBaseMapConfig not available' 
        }));
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: error.message 
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/test-db to test database operations`);
});