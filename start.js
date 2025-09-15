#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Audit Dashboard...\n');

// Check if Node.js is installed
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  'database/init.js'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles.join(', '));
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📥 Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully');
      startServer();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🔧 Starting backend server...');
  
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down...');
    server.kill('SIGTERM');
    process.exit(0);
  });
  
  console.log('\n✅ Backend server started successfully!');
  console.log('📊 API available at: http://localhost:3000/api');
  console.log('🔍 Health check: http://localhost:3000/api/health');
  console.log('\n🌐 Open your frontend files in a browser:');
  console.log('   - Main Dashboard: Untitled-1.html');
  console.log('   - Company Pages: carol.html, grand-vision.html, sunglass-hut.html');
  console.log('\n👤 Default admin credentials:');
  console.log('   Email: admin@2025');
  console.log('   Password: audit@2025');
  console.log('\nPress Ctrl+C to stop the server');
}



