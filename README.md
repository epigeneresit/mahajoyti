# 📊 Excel to API System

A complete solution for uploading Excel files, storing data in MongoDB, and accessing it via REST API. Perfect for quickly converting Excel data into a consumable API for other projects.

## ✨ Features

- 📤 **Easy Excel Upload** - User-friendly web interface for uploading .xls and .xlsx files
- 🗄️ **MongoDB Storage** - Automatic data storage with duplicate detection based on Aadhaar Number
- 🔌 **REST API** - Full CRUD API endpoints to access your data
- 📊 **Data Preview** - View uploaded data directly in the browser with pagination
- 📈 **Statistics Dashboard** - Real-time stats showing total records and upload history
- 🎨 **Modern UI** - Clean, responsive design that works on all devices
- 🔒 **File Validation** - Only accepts valid Excel files with size limits
- 🚀 **Easy Integration** - Simple API for use in other projects
- 👤 **Applicant Management** - Specifically designed for applicant/beneficiary data tracking
- 🔐 **Production Ready** - Security headers, rate limiting, logging, and monitoring
- ⚡ **Performance Optimized** - Compression, caching headers, and pagination

## 📋 Excel File Format

Your Excel file should contain the following columns in order:

1. **Applicant Name** - Full name of the applicant
2. **District** - District name
3. **Taluka** - Taluka/Tehsil name
4. **Year** - Application year (numeric)
5. **Portal** - Portal name where application was submitted
6. **Scheme Name** - Name of the government scheme
7. **Application Date** - Date of application (any format)
8. **Status** - Application status (Approved/Pending/Rejected)
9. **Amount Sanctioned** - Sanctioned amount (numeric)
10. **Beneficiary Category** - Category of beneficiary
11. **Gender** - Gender (Male/Female/Other)
12. **Age** - Age in years (numeric)
13. **Mobile** - Mobile number
14. **Email** - Email address
15. **Aadhaar No** - Aadhaar number (used for duplicate detection)

### Sample Excel File

A sample Excel file (`sample_data.xlsx`) is included in the project with 5 sample records. Use this as a template for your data.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
  - Make sure MongoDB is running on `localhost:27017`

## 📦 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "c:\xampp\htdocs\EXCEL TO API"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Ensure MongoDB is running:**
   ```bash
   # On Windows (if MongoDB is installed as a service, it should already be running)
   # Otherwise, start it manually:
   mongod
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Windows
.\start-production.bat

# Linux/Mac
./start-production.sh

# Or using npm
npm run prod
```

The server will start on `http://localhost:3001`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## 🔒 Production Deployment

For production deployment, see the comprehensive guides:
- **[Production Guide](PRODUCTION_GUIDE.md)** - Complete deployment instructions
- **[Production Checklist](PRODUCTION_CHECKLIST.md)** - Pre-launch verification steps
- **[Security Advisory](SECURITY.md)** - Security considerations

Key production features:
- ✅ Security headers (Helmet)
- ✅ Rate limiting (100 req/15min, 10 uploads/15min)
- ✅ CORS configuration
- ✅ Response compression
- ✅ Access logging
- ✅ Graceful shutdown
- ✅ Error handling

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Upload Excel File
**POST** `/api/upload`

Upload an Excel file to store data in the database.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `file` field containing the Excel file

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "recordsProcessed": 100,
  "uniqueRecordsSaved": 95,
  "duplicatesRemoved": 5
}
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

---

#### 2. Get All Data
**GET** `/api/data`

Retrieve all stored data with pagination support.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Records per page (default: 100)

**Response:**
```json
{
  "success": true,
  "totalRecords": 1000,
  "currentPage": 1,
  "totalPages": 10,
  "recordsPerPage": 100,
  "data": [
    {
      "applicantName": "Rajesh Kumar",
      "district": "Mumbai",
      "taluka": "Andheri",
      "year": 2025,
      "portal": "Government Portal",
      "schemeName": "Education Assistance",
      "applicationDate": "2025-01-15",
      "status": "Approved",
      "amountSanctioned": 50000,
      "beneficiaryCategory": "Student",
      "gender": "Male",
      "age": 22,
      "mobile": "9876543210",
      "email": "rajesh.kumar@example.com",
      "aadhaarNo": "1234 5678 9012"
    }
  ]
}
```

**Example:**
```javascript
fetch('http://localhost:3000/api/data?page=1&limit=50')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

#### 3. Get Specific Record
**GET** `/api/data/:id`

Retrieve a specific record by its MongoDB ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "applicantName": "Rajesh Kumar",
    "district": "Mumbai",
    "taluka": "Andheri",
    "year": 2025,
    "portal": "Government Portal",
    "schemeName": "Education Assistance",
    "applicationDate": "2025-01-15",
    "status": "Approved",
    "amountSanctioned": 50000,
    "beneficiaryCategory": "Student",
    "gender": "Male",
    "age": 22,
    "mobile": "9876543210",
    "email": "rajesh.kumar@example.com",
    "aadhaarNo": "1234 5678 9012"
  }
}
```

---

#### 4. Get Statistics
**GET** `/api/stats`

Get database statistics including total records and latest upload date.

**Response:**
```json
{
  "success": true,
  "totalRecords": 1000,
  "latestUploadDate": "2025-11-21T10:30:00.000Z"
}
```

---

#### 5. Delete All Data
**DELETE** `/api/data`

⚠️ **WARNING:** This deletes all data from the database. Use with caution!

**Response:**
```json
{
  "success": true,
  "message": "Deleted 1000 records"
}
```

## 🔄 Using the API in Other Projects

### Example: Node.js/Express Project

```javascript
const axios = require('axios');

// Fetch data
async function getData() {
  try {
    const response = await axios.get('http://localhost:3000/api/data');
    const data = response.data.data;
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getData();
```

### Example: React/Next.js Project

```javascript
import { useEffect, useState } from 'react';

function DataComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/data')
      .then(res => res.json())
      .then(result => setData(result.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>{JSON.stringify(item)}</div>
      ))}
    </div>
  );
}
```

### Example: Python Project

```python
import requests

# Fetch data
response = requests.get('http://localhost:3000/api/data')
data = response.json()

if data['success']:
    for record in data['data']:
        print(record)
```

## 📁 Project Structure

```
EXCEL TO API/
├── public/
│   ├── index.html      # Main upload interface
│   ├── styles.css      # Styling
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server and API endpoints
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🔧 Configuration

### Database Configuration

By default, the application connects to MongoDB at:
```
mongodb://localhost:27017/excelData
```

To change this, modify the connection string in `server.js`:
```javascript
mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### Port Configuration

The server runs on port 3000 by default. To change this, modify the `PORT` constant in `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

### File Upload Limits

The default file size limit is 10MB. To change this, modify the multer configuration in `server.js`:
```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Change this value
});
```

## 🛡️ Data Deduplication

The system automatically removes duplicate entries during upload based on **Aadhaar Number**. If multiple records have the same Aadhaar Number, only the first occurrence will be saved. Records without Aadhaar Numbers are saved without duplicate checking.

## ⚠️ Important Notes

1. **MongoDB Must Be Running**: Ensure MongoDB is running before starting the application
2. **Excel Format**: Only .xls and .xlsx files are supported
3. **File Size**: Maximum file size is 10MB (configurable)
4. **Dynamic Schema**: The system accepts Excel files with any column structure
5. **CORS Enabled**: The API can be accessed from other origins

## 🐛 Troubleshooting

### Server won't start
- Ensure MongoDB is running: `mongod`
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`

### File upload fails
- Check file format (.xls or .xlsx)
- Ensure file size is under 10MB
- Verify the Excel file is not corrupted

### Cannot connect to database
- Ensure MongoDB is running on `localhost:27017`
- Check MongoDB connection string in `server.js`
- Verify MongoDB service is started

### API returns no data
- Upload an Excel file first through the web interface
- Check database has records: Use MongoDB Compass or CLI
- Verify the server is running

## 📝 Dependencies

- **express** - Web framework
- **multer** - File upload handling
- **xlsx** - Excel file parsing
- **mongoose** - MongoDB object modeling
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-reload (dev dependency)

## 🚀 Deployment Tips

For production deployment:

1. **Use environment variables** for sensitive data:
   ```javascript
   const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/excelData';
   const PORT = process.env.PORT || 3000;
   ```

2. **Add authentication** to protect API endpoints

3. **Use a production MongoDB instance** (MongoDB Atlas, etc.)

4. **Enable HTTPS** for secure file uploads

5. **Add rate limiting** to prevent abuse

6. **Set up logging** for better monitoring

## 📄 License

ISC

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with Node.js, Express, MongoDB, and ❤️**
