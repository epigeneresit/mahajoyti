require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/excelData';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logging middleware
if (NODE_ENV === 'production') {
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limit for upload endpoint
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.'
  }
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));

// Database connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB');
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, err.message);
      if (retries === maxRetries) {
        console.error('Could not connect to MongoDB. Exiting...');
        process.exit(1);
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 10000)));
    }
  }
};

connectDB();

// Database Schema - Structured for Applicant Data
const dataSchema = new mongoose.Schema({
  applicantName: { type: String },
  district: { type: String },
  taluka: { type: String },
  year: { type: Number },
  portal: { type: String },
  schemeName: { type: String },
  applicationDate: { type: String },
  status: { type: String },
  amountSanctioned: { type: Number },
  beneficiaryCategory: { type: String },
  gender: { type: String },
  age: { type: Number },
  mobile: { type: String },
  email: { type: String },
  aadhaarNo: { type: String },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { strict: false });

// Create unique index on Aadhaar Number to prevent duplicates
dataSchema.index({ aadhaarNo: 1 }, { unique: true, sparse: true });

const Data = mongoose.model('Data', dataSchema);

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(xls|xlsx)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed'));
    }
  }
});

// Routes

// Home route - serve the upload page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload Excel file endpoint
app.post('/api/upload', uploadLimiter, upload.single('file'), async (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded' 
    });
  }

  try {
    // Parse Excel file
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty'
      });
    }

    // Map Excel columns to database schema
    const mappedData = jsonData.map(item => ({
      applicantName: item['Applicant Name'],
      district: item['District'],
      taluka: item['Taluka'],
      year: item['Year'],
      portal: item['Portal'],
      schemeName: item['Scheme Name'],
      applicationDate: item['Application Date'],
      status: item['Status'],
      amountSanctioned: item['Amount Sanctioned'],
      beneficiaryCategory: item['Beneficiary Category'],
      gender: item['Gender'],
      age: item['Age'],
      mobile: item['Mobile'],
      email: item['Email'],
      aadhaarNo: item['Aadhaar No'],
      uploadDate: new Date()
    }));

    // Remove duplicates based on Aadhaar Number
    const uniqueData = Array.from(
      new Map(
        mappedData
          .filter(item => item.aadhaarNo) // Only include records with Aadhaar
          .map(item => [item.aadhaarNo, item])
      ).values()
    );

    // Add records without Aadhaar
    const noAadhaarData = mappedData.filter(item => !item.aadhaarNo);
    const allData = [...uniqueData, ...noAadhaarData];

    if (allData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in Excel file'
      });
    }

    // Save data to database
    let savedCount = 0;
    let duplicateCount = 0;
    
    for (const item of allData) {
      try {
        await Data.create(item);
        savedCount++;
      } catch (err) {
        if (err.code === 11000) {
          duplicateCount++;
        } else {
          console.error('Error saving record:', err);
        }
      }
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      recordsProcessed: jsonData.length,
      uniqueRecordsSaved: savedCount,
      duplicatesRemoved: jsonData.length - savedCount
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Duplicate entry found. Some records already exist in database.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to process file: ' + error.message
      });
    }
  }
});

// Get all data from database
app.get('/api/data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    
    if (req.query.district) filter.district = new RegExp(req.query.district, 'i');
    if (req.query.taluka) filter.taluka = new RegExp(req.query.taluka, 'i');
    if (req.query.status) filter.status = new RegExp(req.query.status, 'i');
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.gender) filter.gender = new RegExp(req.query.gender, 'i');
    if (req.query.schemeName) filter.schemeName = new RegExp(req.query.schemeName, 'i');
    if (req.query.beneficiaryCategory) filter.beneficiaryCategory = new RegExp(req.query.beneficiaryCategory, 'i');
    if (req.query.search) {
      filter.$or = [
        { applicantName: new RegExp(req.query.search, 'i') },
        { mobile: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { aadhaarNo: new RegExp(req.query.search, 'i') }
      ];
    }

    const totalRecords = await Data.countDocuments(filter);
    const data = await Data.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      recordsPerPage: limit,
      filters: req.query,
      data: data
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data: ' + error.message
    });
  }
});

// Get specific record by ID
app.get('/api/data/:id', async (req, res) => {
  try {
    const record = await Data.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record: ' + error.message
    });
  }
});

// Delete all data (use with caution)
app.delete('/api/data', async (req, res) => {
  try {
    const result = await Data.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} records`
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete data: ' + error.message
    });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalRecords = await Data.countDocuments();
    const latestUpload = await Data.findOne().sort({ uploadDate: -1 });
    
    res.json({
      success: true,
      totalRecords,
      latestUploadDate: latestUpload ? latestUpload.uploadDate : null
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics: ' + error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 10MB.'
      });
    }
  }
  
  // Don't expose internal errors in production
  const message = NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
    
  res.status(err.status || 500).json({
    success: false,
    message: message
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n⏳ Received shutdown signal, closing server gracefully...');
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (NODE_ENV === 'production') {
    // In production, you might want to restart the process or alert monitoring
    gracefulShutdown();
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server is running in ${NODE_ENV} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/data`);
  console.log(`🗄️ Database: ${MONGODB_URI}`);
  console.log('='.repeat(50) + '\n');
});
