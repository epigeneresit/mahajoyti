# 🔌 API ENDPOINTS - Quick Reference

## Base URL
```
http://localhost:3001
```

---

## 📋 All Available Endpoints

### 1️⃣ **Get All Data**
```
GET /api/data
```
**Description:** Fetch all records from database

**Example:**
```bash
curl http://localhost:3001/api/data
```

**Response:**
```json
{
  "success": true,
  "totalRecords": 100,
  "currentPage": 1,
  "totalPages": 1,
  "recordsPerPage": 100,
  "data": [...]
}
```

---

### 2️⃣ **Get Data with Pagination**
```
GET /api/data?page={page}&limit={limit}
```
**Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 100, max: 100)

**Example:**
```bash
curl "http://localhost:3001/api/data?page=1&limit=10"
```

---

### 3️⃣ **Filter by District**
```
GET /api/data?district={district_name}
```
**Example:**
```bash
curl "http://localhost:3001/api/data?district=Mumbai"
```

---

### 4️⃣ **Filter by Status**
```
GET /api/data?status={status}
```
**Status values:** `Approved`, `Pending`, `Rejected`

**Example:**
```bash
curl "http://localhost:3001/api/data?status=Approved"
```

---

### 5️⃣ **Filter by Year**
```
GET /api/data?year={year}
```
**Example:**
```bash
curl "http://localhost:3001/api/data?year=2025"
```

---

### 6️⃣ **Filter by Gender**
```
GET /api/data?gender={gender}
```
**Gender values:** `Male`, `Female`, `Other`

**Example:**
```bash
curl "http://localhost:3001/api/data?gender=Female"
```

---

### 7️⃣ **Filter by Scheme Name**
```
GET /api/data?schemeName={scheme}
```
**Example:**
```bash
curl "http://localhost:3001/api/data?schemeName=Education%20Assistance"
```

---

### 8️⃣ **Filter by Beneficiary Category**
```
GET /api/data?beneficiaryCategory={category}
```
**Example:**
```bash
curl "http://localhost:3001/api/data?beneficiaryCategory=Student"
```

---

### 9️⃣ **Filter by Taluka**
```
GET /api/data?taluka={taluka_name}
```
**Example:**
```bash
curl "http://localhost:3001/api/data?taluka=Andheri"
```

---

### 🔟 **Search Records**
```
GET /api/data?search={search_term}
```
**Searches in:** Applicant Name, Mobile, Email, Aadhaar No

**Example:**
```bash
curl "http://localhost:3001/api/data?search=Rajesh"
curl "http://localhost:3001/api/data?search=9876543210"
```

---

### 1️⃣1️⃣ **Combined Filters**
```
GET /api/data?district={district}&status={status}&year={year}
```
**Combine any filters together!**

**Examples:**
```bash
# Mumbai, Approved, 2025
curl "http://localhost:3001/api/data?district=Mumbai&status=Approved&year=2025"

# Female applicants with Pending status
curl "http://localhost:3001/api/data?gender=Female&status=Pending"

# Search with pagination
curl "http://localhost:3001/api/data?search=Kumar&page=1&limit=5"
```

---

### 1️⃣2️⃣ **Get Specific Record by ID**
```
GET /api/data/:id
```
**Example:**
```bash
curl "http://localhost:3001/api/data/674bcd123456789abcdef012"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicantName": "Rajesh Kumar",
    "district": "Mumbai",
    ...
  }
}
```

---

### 1️⃣3️⃣ **Get Database Statistics**
```
GET /api/stats
```
**Example:**
```bash
curl http://localhost:3001/api/stats
```

**Response:**
```json
{
  "success": true,
  "totalRecords": 100,
  "latestUploadDate": "2025-11-21T10:30:00.000Z"
}
```

---

### 1️⃣4️⃣ **Upload Excel File**
```
POST /api/upload
Content-Type: multipart/form-data
```
**Example:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/your/file.xlsx"
```

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

---

### 1️⃣5️⃣ **Delete All Data** ⚠️
```
DELETE /api/data
```
**⚠️ WARNING: This deletes ALL data!**

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/data
```

---

## 💻 Code Examples

### JavaScript (Fetch)
```javascript
// Get all approved applicants from Mumbai
fetch('http://localhost:3001/api/data?district=Mumbai&status=Approved')
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.totalRecords} records`);
    data.data.forEach(applicant => {
      console.log(`${applicant.applicantName} - ₹${applicant.amountSanctioned}`);
    });
  });
```

### JavaScript (Axios)
```javascript
const axios = require('axios');

async function getApplicants() {
  const response = await axios.get('http://localhost:3001/api/data', {
    params: {
      district: 'Mumbai',
      status: 'Approved',
      year: 2025,
      page: 1,
      limit: 50
    }
  });
  
  return response.data;
}
```

### Python
```python
import requests

# Get all data
response = requests.get('http://localhost:3001/api/data')
data = response.json()

print(f"Total Records: {data['totalRecords']}")
for applicant in data['data']:
    print(f"{applicant['applicantName']} - {applicant['district']}")

# With filters
params = {
    'district': 'Mumbai',
    'status': 'Approved',
    'year': 2025
}
filtered = requests.get('http://localhost:3001/api/data', params=params)
print(filtered.json())
```

### PHP
```php
<?php
// Get all data
$url = 'http://localhost:3001/api/data';
$response = file_get_contents($url);
$data = json_decode($response, true);

echo "Total Records: " . $data['totalRecords'] . "\n";

// With filters
$params = http_build_query([
    'district' => 'Mumbai',
    'status' => 'Approved',
    'year' => 2025
]);

$filtered = file_get_contents("http://localhost:3001/api/data?$params");
$filteredData = json_decode($filtered, true);
?>
```

---

## 🎯 Common Use Cases

### 1. Get all approved applications
```
GET /api/data?status=Approved
```

### 2. Get pending applications from a specific district
```
GET /api/data?district=Mumbai&status=Pending
```

### 3. Get all female beneficiaries
```
GET /api/data?gender=Female
```

### 4. Search for a specific applicant by name
```
GET /api/data?search=Rajesh Kumar
```

### 5. Get applications by mobile number
```
GET /api/data?search=9876543210
```

### 6. Get all applications for a scheme
```
GET /api/data?schemeName=Education Assistance
```

### 7. Get applications from 2025
```
GET /api/data?year=2025
```

### 8. Complex filter: Female, Approved, Mumbai, 2025
```
GET /api/data?gender=Female&status=Approved&district=Mumbai&year=2025
```

---

## 🧪 Testing Tools

### Option 1: Web Interface
Open: http://localhost:3001/api-test.html

### Option 2: Browser
Simply paste URL in browser address bar

### Option 3: Postman
Import endpoints and test with Postman

### Option 4: cURL
Use command line examples above

### Option 5: Your Code
Integrate directly into your project

---

## 📊 Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "totalRecords": 100,
  "currentPage": 1,
  "totalPages": 10,
  "recordsPerPage": 10,
  "filters": { ...applied_filters... },
  "data": [
    {
      "_id": "674bcd123456789abcdef012",
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
      "aadhaarNo": "1234 5678 9012",
      "uploadDate": "2025-11-21T10:30:00.000Z"
    }
  ]
}
```

---

## ⚡ Quick Tips

1. **Case Insensitive:** All text filters are case-insensitive
2. **Partial Match:** Text filters match partial strings
3. **Combine Filters:** Use multiple filters together with `&`
4. **URL Encode:** Encode special characters in URLs
5. **Pagination:** Use `page` and `limit` for large datasets
6. **Search:** Use `search` parameter for quick lookups

---

## 🔗 Quick Links

- **Main Upload Page:** http://localhost:3001
- **API Test Console:** http://localhost:3001/api-test.html
- **Get All Data:** http://localhost:3001/api/data
- **Get Stats:** http://localhost:3001/api/stats

---

**Your data is ready to use! Copy any endpoint and start integrating! 🚀**
