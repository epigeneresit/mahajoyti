// DOM Elements
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('excel-file');
const fileLabel = document.querySelector('.file-label');
const fileName = document.getElementById('file-name');
const uploadBtn = document.getElementById('upload-btn');
const btnText = uploadBtn.querySelector('.btn-text');
const loader = uploadBtn.querySelector('.loader');
const uploadResult = document.getElementById('upload-result');

const totalRecordsEl = document.getElementById('total-records');
const latestUploadEl = document.getElementById('latest-upload');
const refreshStatsBtn = document.getElementById('refresh-stats');

const loadDataBtn = document.getElementById('load-data');
const dataContainer = document.getElementById('data-container');
const noDataEl = document.getElementById('no-data');
const dataTable = document.getElementById('data-table');
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// State
let currentPage = 1;
let totalPages = 1;

// API Base URL
const API_BASE = window.location.origin;

// File input change handler
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    fileLabel.classList.add('has-file');
  } else {
    fileName.textContent = 'Choose Excel file (.xls, .xlsx)';
    fileLabel.classList.remove('has-file');
  }
});

// Upload form submission
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = fileInput.files[0];
  if (!file) {
    showResult('Please select a file to upload', 'error');
    return;
  }

  // Show loading state
  uploadBtn.disabled = true;
  btnText.style.display = 'none';
  loader.style.display = 'block';
  hideResult();

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showResult(
        `✅ File uploaded successfully!<br>
        📊 Records processed: ${result.recordsProcessed}<br>
        💾 Unique records saved: ${result.uniqueRecordsSaved}<br>
        🔄 Duplicates removed: ${result.duplicatesRemoved}`,
        'success'
      );
      
      // Reset form
      uploadForm.reset();
      fileName.textContent = 'Choose Excel file (.xls, .xlsx)';
      fileLabel.classList.remove('has-file');
      
      // Refresh statistics
      fetchStats();
    } else {
      showResult(`❌ ${result.message}`, 'error');
    }

  } catch (error) {
    console.error('Upload error:', error);
    showResult(`❌ Failed to upload file. Make sure the server is running.`, 'error');
  } finally {
    // Reset button state
    uploadBtn.disabled = false;
    btnText.style.display = 'inline';
    loader.style.display = 'none';
  }
});

// Show result message
function showResult(message, type) {
  uploadResult.innerHTML = message;
  uploadResult.className = `result-message ${type}`;
  uploadResult.style.display = 'block';
}

// Hide result message
function hideResult() {
  uploadResult.style.display = 'none';
}

// Fetch statistics
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    const result = await response.json();

    if (result.success) {
      totalRecordsEl.textContent = result.totalRecords.toLocaleString();
      
      if (result.latestUploadDate) {
        const date = new Date(result.latestUploadDate);
        latestUploadEl.textContent = date.toLocaleString();
      } else {
        latestUploadEl.textContent = 'No uploads yet';
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    totalRecordsEl.textContent = 'Error';
    latestUploadEl.textContent = 'Error';
  }
}

// Refresh stats button
refreshStatsBtn.addEventListener('click', () => {
  refreshStatsBtn.disabled = true;
  refreshStatsBtn.textContent = 'Refreshing...';
  
  fetchStats().finally(() => {
    refreshStatsBtn.disabled = false;
    refreshStatsBtn.textContent = 'Refresh Stats';
  });
});

// Load data
loadDataBtn.addEventListener('click', async () => {
  currentPage = 1;
  await fetchData();
});

// Fetch data from API
async function fetchData() {
  loadDataBtn.disabled = true;
  loadDataBtn.textContent = 'Loading...';
  
  try {
    const response = await fetch(`${API_BASE}/api/data?page=${currentPage}&limit=10`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      displayData(result.data);
      totalPages = result.totalPages;
      updatePagination();
      
      dataContainer.style.display = 'block';
      noDataEl.style.display = 'none';
    } else {
      dataContainer.style.display = 'none';
      noDataEl.style.display = 'block';
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    dataContainer.style.display = 'none';
    noDataEl.textContent = 'Error loading data. Make sure the server is running.';
    noDataEl.style.display = 'block';
  } finally {
    loadDataBtn.disabled = false;
    loadDataBtn.textContent = 'Load Data';
  }
}

// Display data in table
function displayData(data) {
  if (data.length === 0) return;

  // Define the column order
  const columns = [
    { key: 'applicantName', label: 'Applicant Name' },
    { key: 'district', label: 'District' },
    { key: 'taluka', label: 'Taluka' },
    { key: 'year', label: 'Year' },
    { key: 'portal', label: 'Portal' },
    { key: 'schemeName', label: 'Scheme Name' },
    { key: 'applicationDate', label: 'Application Date' },
    { key: 'status', label: 'Status' },
    { key: 'amountSanctioned', label: 'Amount Sanctioned' },
    { key: 'beneficiaryCategory', label: 'Beneficiary Category' },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'aadhaarNo', label: 'Aadhaar No' }
  ];

  // Create table header
  tableHead.innerHTML = `
    <tr>
      ${columns.map(col => `<th>${col.label}</th>`).join('')}
    </tr>
  `;

  // Create table body
  tableBody.innerHTML = data.map(item => `
    <tr>
      ${columns.map(col => {
        let value = item[col.key];
        
        // Format amount with currency
        if (col.key === 'amountSanctioned' && value) {
          value = '₹' + value.toLocaleString('en-IN');
        }
        
        // Format status with color
        if (col.key === 'status') {
          const statusClass = value === 'Approved' ? 'status-approved' : 
                             value === 'Pending' ? 'status-pending' : 
                             value === 'Rejected' ? 'status-rejected' : '';
          return `<td><span class="${statusClass}">${value || '-'}</span></td>`;
        }
        
        return `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

// Update pagination controls
function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Previous page
prevPageBtn.addEventListener('click', async () => {
  if (currentPage > 1) {
    currentPage--;
    await fetchData();
  }
});

// Next page
nextPageBtn.addEventListener('click', async () => {
  if (currentPage < totalPages) {
    currentPage++;
    await fetchData();
  }
});

// Initialize: Fetch stats on page load
fetchStats();
