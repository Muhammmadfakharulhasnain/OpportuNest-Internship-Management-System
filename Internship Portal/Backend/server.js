const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const emailService = require('./services/emailService');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

// Add process monitoring for memory issues
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.log('🔄 Attempting graceful shutdown...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Attempting graceful shutdown...');
  process.exit(1);
});

// Monitor memory usage
const monitorMemory = () => {
  const used = process.memoryUsage();
  const memoryMB = Math.round(used.heapUsed / 1024 / 1024);
  
  if (memoryMB > 200) { // Alert if memory usage exceeds 200MB
    console.warn(`⚠️  High memory usage: ${memoryMB}MB`);
    
    if (memoryMB > 500) { // Force garbage collection if over 500MB
      if (global.gc) {
        global.gc();
        console.log('🗑️  Forced garbage collection');
      }
    }
  }
};

// Check memory every 30 seconds
setInterval(monitorMemory, 30000);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Serve static files from public directory (for email assets)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Enhanced static file serving with error handling
app.use('/uploads', (req, res, next) => {
  // Decode URL to handle special characters
  const decodedPath = decodeURIComponent(req.path);
  const filePath = path.join(__dirname, 'uploads', decodedPath);
  
  // Check if file exists before serving
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    // Serve the file with the decoded path
    req.url = decodedPath; // Update the request URL to the decoded version
    express.static(path.join(__dirname, 'uploads'))(req, res, next);
  } else {
    console.log(`❌ File not found: ${req.path}`);
    console.log(`❌ Decoded path: ${decodedPath}`);
    console.log(`❌ Full path: ${filePath}`);
    res.status(404).json({
      success: false,
      message: 'File not found',
      requestedFile: req.path,
      decodedPath: decodedPath,
      fullPath: filePath
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check endpoint hit!');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5005
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/adminNew')); // New Admin management routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/students', require('./routes/students')); // Student routes
app.use('/api/supervisors', require('./routes/supervisors')); // Supervisor routes
app.use('/api/supervision-requests', require('./routes/supervisionRequests')); // Supervision request routes
app.use('/api/supervisor-reports', require('./routes/supervisorReports')); // Supervisor report routes
app.use('/api/notifications', require('./routes/notifications')); // Notification routes
app.use('/api/company-profile', require('./routes/companyProfile')); // Company profile routes
app.use('/api/companies', require('./routes/companies')); // Registered companies routes for student dashboard
app.use('/api/offer-letters', require('./routes/offerLetters')); // Offer letter routes
app.use('/api/misconduct-reports', require('./routes/misconductReports')); // Misconduct report routes
app.use('/api/internship-appraisals', require('./routes/internshipAppraisals')); // Internship appraisal routes
app.use('/api/progress-reports', require('./routes/progressReports')); // Progress report routes
app.use('/api/joining-reports', require('./routes/joiningReports')); // Joining report routes
app.use('/api/supervisor-chat', require('./routes/supervisorChat')); // Supervisor chat routes
app.use('/api/student-chat', require('./routes/studentChat')); // Student chat routes
app.use('/api/completion-certificates', require('./routes/completionCertificates')); // Completion certificate routes
app.use('/api/supervisor-evaluations', require('./routes/supervisorEvaluations')); // Supervisor evaluation routes
app.use('/api/final-evaluation', require('./routes/finalEvaluation')); // Final evaluation routes
app.use('/api/test-data', require('./routes/testData')); // Test data routes (for development)

// Debug middleware for weekly reports
app.use('/api/weekly-reports', (req, res, next) => {
  console.log(`📍 WEEKLY REPORTS DEBUG: ${req.method} ${req.path}`);
  console.log(`📋 Headers:`, req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

app.use('/api/weekly-reports', require('./routes/weeklyReports')); // Weekly report routes
app.use('/api/internship-reports', require('./routes/internshipReports')); // Internship report routes
app.use('/api/internee-evaluations', require('./routes/interneeEvaluations')); // Internee evaluation routes
app.use('/api/test-jobs', require('./routes/testJobs')); // Test routes for debugging

// Add a file check endpoint for debugging
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  const result = {};
  
  ['cvs', 'certificates', 'profiles'].forEach(dir => {
    const dirPath = path.join(uploadsPath, dir);
    if (fs.existsSync(dirPath)) {
      result[dir] = fs.readdirSync(dirPath);
    } else {
      result[dir] = 'Directory not found';
    }
  });
  
  res.json({
    success: true,
    uploadsPath,
    files: result
  });
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Initialize email service and start server
const startServer = async () => {
  try {
    // Verify email service connection
    await emailService.verifyConnection();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('✅ Email service initialized');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();