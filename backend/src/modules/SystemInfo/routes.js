import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// System info endpoint - Using your existing auth middleware
router.get('/system-info', protect, restrictTo('admin'), (req, res) => {
  
  try {
    let backendPkg = {};
    let frontendPkg = {};
    
    // Try different path configurations
    const possibleBackendPaths = [
      path.join(__dirname, '../../package.json'),
      path.join(__dirname, '../package.json'),
      path.join(process.cwd(), 'package.json'),
    ];
    
    const possibleFrontendPaths = [
      path.join(__dirname, '../../../frontend/package.json'),
      path.join(__dirname, '../../frontend/package.json'),
      path.join(process.cwd(), '../frontend/package.json'),
      path.join(process.cwd(), 'frontend/package.json'),
    ];

    // Find and read backend package.json
    for (const pkgPath of possibleBackendPaths) {
      if (fs.existsSync(pkgPath)) {
        backendPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        break;
      }
    }

    // Find and read frontend package.json
    for (const pkgPath of possibleFrontendPaths) {
      if (fs.existsSync(pkgPath)) {
        frontendPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        break;
      }
    }

    // System info
    const systemInfo = {
      appName: backendPkg.name || 'MERN Marketplace',
      appVersion: backendPkg.version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    };

    const response = {
      ...systemInfo,
      backend: {
        name: backendPkg.name || 'backend',
        version: backendPkg.version || '1.0.0',
        description: backendPkg.description || 'Backend API',
        dependencies: backendPkg.dependencies || {},
        devDependencies: backendPkg.devDependencies || {},
      },
      frontend: {
        name: frontendPkg.name || 'frontend',
        version: frontendPkg.version || '1.0.0',
        description: frontendPkg.description || 'Frontend Application',
        dependencies: frontendPkg.dependencies || {},
        devDependencies: frontendPkg.devDependencies || {},
      },
    };
    
    res.json(response);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ 
      message: 'Failed to load system info', 
      error: err.message
    });
  }
});

// Test endpoint without auth
router.get('/test', (req, res) => {
  res.json({ 
    message: 'System route is working!',
    timestamp: new Date().toISOString()
  });
});

// Auth test endpoint - to verify authentication works
router.get('/auth-test', protect, restrictTo('admin'), (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    }
  });
});

export default router;