# Reports Module API Documentation

This document provides API specifications with curl examples for all Reports module endpoints. The frontend expects these endpoints to be implemented in the backend.

**Base URL**: `http://localhost:3000/api/v1` (or your API domain)

**Authentication**: All requests require authentication token in the header:
```
Authorization: Bearer <your-auth-token>
```

---

## 1. List Reports

**Endpoint**: `GET /reports`

**Description**: Retrieves a list of generated reports. Supports filtering by report type, status, and date range.

**Query Parameters**:
- `report_type` (optional): Filter by report type (e.g., `HR_EMPLOYEE`, `FINANCE_TRANSACTION`)
- `status` (optional): Filter by status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`)
- `start_date` (optional): Filter reports generated after this date (ISO 8601 format)
- `end_date` (optional): Filter reports generated before this date (ISO 8601 format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**cURL Request**:
```bash
# Get all reports
curl -X GET "http://localhost:3000/api/v1/reports" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Get reports with filters
curl -X GET "http://localhost:3000/api/v1/reports?report_type=HR_EMPLOYEE&status=COMPLETED&page=1&limit=20" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK) - Direct Array Format:
```json
[
  {
    "id": "101",
    "report_code": "RPT-2025-001",
    "report_type": "HR_EMPLOYEE",
    "report_name": "Employee Report (2025-01-01 to 2025-01-31)",
    "description": "Monthly employee report",
    "format": "PDF",
    "status": "COMPLETED",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "filters": {},
    "file_url": "https://storage.example.com/reports/rpt-2025-001.pdf",
    "file_name": "employee_report_2025_01.pdf",
    "file_size": 245760,
    "generated_at": "2025-01-15T10:30:00.000Z",
    "generated_by": "112",
    "parameters": {},
    "created_at": "2025-01-15T10:25:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
]
```

**Response** (200 OK) - Paginated Format:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "101",
        "report_code": "RPT-2025-001",
        "report_type": "HR_EMPLOYEE",
        "report_name": "Employee Report",
        "format": "PDF",
        "status": "COMPLETED",
        "generated_at": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## 2. Generate Report

**Endpoint**: `POST /reports/generate`

**Description**: Generates a new report based on the specified parameters. The report generation is asynchronous and returns immediately with a PENDING status.

**CRITICAL REQUIREMENTS FOR REPORT GENERATION**:

1. **File Format Validity**: Generated files MUST be valid, properly formatted files:
   - PDF files MUST be valid PDF documents (use libraries like PDFKit, jsPDF, or similar)
   - Excel files MUST be valid XLSX files (use libraries like ExcelJS, xlsx, or similar)
   - CSV files MUST be properly formatted CSV with UTF-8 encoding
   - JSON files MUST be valid JSON with proper structure

2. **Professional Branding**: Reports MUST include:
   - Company logo in header
   - Company name and contact information
   - Professional formatting and styling
   - Proper headers and footers
   - Page numbers (for multi-page reports)

3. **File Storage**: Generated files MUST be:
   - Stored securely (local filesystem or cloud storage)
   - Accessible via the download endpoint
   - Properly linked in the report record (`file_url`, `file_name`, `file_size`)

4. **Error Handling**: If generation fails:
   - Set report status to `FAILED`
   - Store error message in `error_message` field
   - DO NOT create corrupted or empty files

See the "Professional Report Requirements" section under "Download Report File" for detailed formatting specifications.

**Request Body**:
```json
{
  "report_type": "HR_EMPLOYEE",
  "report_name": "Employee Report (2025-01-01 to 2025-01-31)",
  "description": "Monthly employee report for January 2025",
  "format": "PDF",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "filters": {
    "department": "IT",
    "status": "ACTIVE"
  },
  "parameters": {
    "include_inactive": false,
    "include_terminated": false
  }
}
```

**cURL Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/reports/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "report_type": "HR_EMPLOYEE",
    "report_name": "Employee Report (2025-01-01 to 2025-01-31)",
    "description": "Monthly employee report for January 2025",
    "format": "PDF",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "filters": {
      "department": "IT",
      "status": "ACTIVE"
    },
    "parameters": {
      "include_inactive": false,
      "include_terminated": false
    }
  }'
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "101",
      "report_code": "RPT-2025-001",
      "report_type": "HR_EMPLOYEE",
      "report_name": "Employee Report (2025-01-01 to 2025-01-31)",
      "description": "Monthly employee report for January 2025",
      "format": "PDF",
      "status": "PENDING",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "filters": {
        "department": "IT",
        "status": "ACTIVE"
      },
      "parameters": {
        "include_inactive": false,
        "include_terminated": false
      },
      "created_at": "2025-01-15T10:25:00.000Z",
      "updated_at": "2025-01-15T10:25:00.000Z"
    }
  }
}
```

---

## 3. Get Report by ID

**Endpoint**: `GET /reports/:id`

**Description**: Retrieves detailed information about a specific report.

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/reports/101" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "101",
      "report_code": "RPT-2025-001",
      "report_type": "HR_EMPLOYEE",
      "report_name": "Employee Report (2025-01-01 to 2025-01-31)",
      "description": "Monthly employee report for January 2025",
      "format": "PDF",
      "status": "COMPLETED",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "filters": {
        "department": "IT",
        "status": "ACTIVE"
      },
      "file_url": "https://storage.example.com/reports/rpt-2025-001.pdf",
      "file_name": "employee_report_2025_01.pdf",
      "file_size": 245760,
      "generated_at": "2025-01-15T10:30:00.000Z",
      "generated_by": "112",
      "parameters": {
        "include_inactive": false,
        "include_terminated": false
      },
      "created_at": "2025-01-15T10:25:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 4. Download Report File

**Endpoint**: `GET /reports/:id/download`

**Description**: Downloads the generated report file. Only available for reports with status COMPLETED. 

**CRITICAL REQUIREMENTS**:
1. The backend MUST return **valid, properly formatted binary files** (not corrupted, not empty, not text responses)
2. The backend MUST set the correct **Content-Type** header based on the report format
3. The backend MUST include **Content-Disposition** header with proper filename
4. The backend MUST generate professional, company-branded reports with proper formatting, headers, footers, and styling
5. Files MUST be readable by standard applications (Adobe Reader for PDF, Excel for XLSX, etc.)

**PDF FORMATTING REQUIREMENTS** (See `REPORT_PDF_FORMATTING_GUIDE.md` for details):
- **Column Widths**: Calculate proper column widths to prevent text truncation
- **Text Wrapping**: Use ellipsis for long text, ensure text doesn't overflow columns
- **Date Formatting**: Format all dates as MM/DD/YYYY (e.g., "12/11/2025")
- **Alignment**: Right-align numbers/amounts, left-align text
- **Font Sizes**: Use 7-8pt for table data, 9pt for headers
- **Page Breaks**: Handle page breaks properly, redraw headers on new pages
- **No Overlapping**: Ensure proper spacing between columns and rows
- **No Truncation**: Column headers must be fully visible (use shorter labels if needed)

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/reports/23/download" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: */*" \
  --output report.pdf
```

**Response** (200 OK):
- **Content-Type** (REQUIRED - Must match file format): 
  - `application/pdf` (for PDF reports) - **MUST be a valid PDF binary**
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (for Excel/XLSX reports) - **MUST be a valid XLSX binary**
  - `text/csv;charset=utf-8` (for CSV reports) - **MUST be valid CSV text**
  - `application/json;charset=utf-8` (for JSON reports) - **MUST be valid JSON**
- **Content-Disposition** (REQUIRED): `attachment; filename="<report_name>.<extension>"`
  - Example: `attachment; filename="Employee_Report_2025_01.pdf"`
  - Filename MUST include correct extension (.pdf, .xlsx, .csv, .json)
- **Content-Length** (RECOMMENDED): File size in bytes
- **Body**: **Valid binary file content** (NOT JSON, NOT text error messages, NOT empty)

**Professional Report Requirements**:

The backend MUST generate professional, company-branded ERP system reports with the following specifications:

### PDF Reports:
1. **Company Branding**:
   - Company logo in the header (top-left or center)
   - Company name and address in header
   - Professional color scheme matching company branding

2. **Header Section**:
   - Report title (large, bold font)
   - Report code (e.g., "RPT-2025-001")
   - Generation date and time
   - Generated by user name
   - Date range (if applicable)

3. **Content Section**:
   - Well-structured tables with proper column alignment
   - Alternating row colors for readability
   - Bold column headers
   - Proper number formatting (currency, decimals, dates)
   - Page breaks to avoid splitting rows across pages

4. **Footer Section**:
   - Page numbers (e.g., "Page 1 of 5")
   - Company contact information
   - Confidentiality notice (if applicable)
   - Report generation timestamp

5. **Styling**:
   - Professional fonts (Arial, Helvetica, or similar)
   - Consistent spacing and margins
   - Proper borders and grid lines
   - Color coding for status indicators (if applicable)

### Excel/XLSX Reports:
1. **Header Row**:
   - Company logo (if possible) or company name
   - Report title merged across columns
   - Report metadata (code, date, generated by)

2. **Data Section**:
   - Freeze header row for scrolling
   - Auto-width columns
   - Number formatting (currency, dates, percentages)
   - Conditional formatting for status/priority fields
   - Data validation where applicable

3. **Footer/Summary**:
   - Summary rows with totals, averages, etc.
   - Charts/graphs (if applicable to report type)

### CSV Reports:
1. **Formatting**:
   - Proper CSV escaping (quotes, commas)
   - UTF-8 encoding
   - Header row with column names
   - Consistent date/number formats

### JSON Reports:
1. **Structure**:
   - Well-structured JSON with metadata
   - Include report metadata (title, code, date, etc.)
   - Proper data nesting and organization
   - Consistent field naming

**Example Response Headers** (PDF):
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="Employee_Report_2025_01.pdf"
Content-Length: 245760
Cache-Control: no-cache
```

**Example Response Headers** (Excel/XLSX):
```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Employee_Report_2025_01.xlsx"
Content-Length: 156789
Cache-Control: no-cache
```

**Example Response Headers** (CSV):
```
HTTP/1.1 200 OK
Content-Type: text/csv;charset=utf-8
Content-Disposition: attachment; filename="Employee_Report_2025_01.csv"
Content-Length: 45678
Cache-Control: no-cache
```

**IMPORTANT**: The response body MUST be the actual binary file content. Common mistakes to avoid:
- ❌ **DO NOT** return JSON error messages as the file content
- ❌ **DO NOT** return empty responses
- ❌ **DO NOT** return text/html responses
- ❌ **DO NOT** return corrupted or incomplete files
- ✅ **DO** return valid, complete binary files that can be opened by standard applications

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": "Report not found"
}
```

**400 Bad Request** (Report not ready):
```json
{
  "success": false,
  "error": "Report is not ready for download. Status: PROCESSING"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to generate report file"
}
```

---

## 5. Delete Report

**Endpoint**: `DELETE /reports/:id`

**Description**: Deletes a report and its associated file (if exists).

**cURL Request**:
```bash
curl -X DELETE "http://localhost:3000/api/v1/reports/101" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Report Types

### HR Reports
- `HR_EMPLOYEE` - Employee list and details report
- `HR_ATTENDANCE` - Attendance records report
- `HR_LEAVE` - Leave requests and balances report
- `HR_PAYROLL` - Payroll and salary report

### Finance Reports
- `FINANCE_TRANSACTION` - Financial transactions report
- `FINANCE_BALANCE_SHEET` - Balance sheet report
- `FINANCE_PROFIT_LOSS` - Profit & Loss statement

### Project Reports
- `PROJECT_SUMMARY` - Project summary report
- `PROJECT_PROGRESS` - Project progress tracking report
- `PROJECT_BUDGET` - Project budget and cost report

### Inventory Reports
- `INVENTORY_STOCK` - Current stock levels report
- `INVENTORY_MOVEMENT` - Stock movement history report

### Sales Reports
- `SALES_ORDER` - Sales orders report
- `SALES_REVENUE` - Sales revenue report

### Procurement Reports
- `PROCUREMENT_PURCHASE` - Purchase orders report
- `PROCUREMENT_VENDOR` - Vendor performance report

### Warehouse Reports
- `WAREHOUSE_STOCK` - Warehouse stock levels report
- `WAREHOUSE_MOVEMENT` - Warehouse movement report

### Customer Reports
- `CUSTOMER_SUMMARY` - Customer summary report
- `CUSTOMER_SALES` - Customer sales report

---

## Report Formats

- `PDF` - Portable Document Format
- `EXCEL` - Microsoft Excel format (XLSX)
- `CSV` - Comma-separated values
- `JSON` - JavaScript Object Notation

---

## Report Status

- `PENDING` - Report generation request received, waiting to be processed
- `PROCESSING` - Report is currently being generated
- `COMPLETED` - Report generation completed successfully
- `FAILED` - Report generation failed (check `error_message` field)

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid report type or missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Report with id '101' not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate report"
}
```

---

## Field Descriptions

### Report Object
- `id`: string (required) - Unique report identifier
- `report_code`: string (optional) - Auto-generated report code (e.g., "RPT-2025-001")
- `report_type`: ReportType (required) - Type of report to generate
- `report_name`: string (required) - Human-readable report name
- `description`: string (optional) - Report description
- `format`: ReportFormat (required) - Output format (PDF, EXCEL, CSV, JSON)
- `status`: ReportStatus (required) - Current status of report generation
- `start_date`: string (optional) - Start date for report data (ISO 8601 date format: YYYY-MM-DD)
- `end_date`: string (optional) - End date for report data (ISO 8601 date format: YYYY-MM-DD)
- `filters`: object (optional) - Additional filters specific to report type
- `file_url`: string (optional) - URL to download the generated report file
- `file_name`: string (optional) - Name of the generated file
- `file_size`: number (optional) - Size of the file in bytes
- `generated_at`: string (optional) - Timestamp when report was completed (ISO 8601)
- `generated_by`: string (optional) - User ID who generated the report
- `error_message`: string (optional) - Error message if generation failed
- `parameters`: object (optional) - Additional parameters for report generation
- `created_at`: string (required) - Creation timestamp (ISO 8601)
- `updated_at`: string (required) - Last update timestamp (ISO 8601)

---

## Example: Generate HR Employee Report

```bash
curl -X POST "http://localhost:3000/api/v1/reports/generate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  --data-raw '{
    "report_type": "HR_EMPLOYEE",
    "report_name": "All Active Employees - January 2025",
    "description": "Complete list of all active employees",
    "format": "PDF",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "filters": {
      "status": "ACTIVE",
      "department": null
    },
    "parameters": {
      "include_photo": true,
      "include_salary": false,
      "include_address": true
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "102",
      "report_code": "RPT-2025-002",
      "report_type": "HR_EMPLOYEE",
      "report_name": "All Active Employees - January 2025",
      "description": "Complete list of all active employees",
      "format": "PDF",
      "status": "PENDING",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "filters": {
        "status": "ACTIVE",
        "department": null
      },
      "parameters": {
        "include_photo": true,
        "include_salary": false,
        "include_address": true
      },
      "created_at": "2025-01-15T11:00:00.000Z",
      "updated_at": "2025-01-15T11:00:00.000Z"
    }
  }
}
```

---

## Example: Generate Finance Transaction Report

```bash
curl -X POST "http://localhost:3000/api/v1/reports/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "report_type": "FINANCE_TRANSACTION",
    "report_name": "Monthly Transactions - January 2025",
    "description": "All financial transactions for January 2025",
    "format": "EXCEL",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "filters": {
      "account_type": "REVENUE",
      "min_amount": 1000
    },
    "parameters": {
      "group_by_account": true,
      "include_reconciled": true
    }
  }'
```

---

## Example: Generate Project Budget Report

```bash
curl -X POST "http://localhost:3000/api/v1/reports/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "report_type": "PROJECT_BUDGET",
    "report_name": "Project Budget Analysis Q1 2025",
    "description": "Budget vs actual cost analysis for all projects",
    "format": "PDF",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "filters": {
      "status": ["IN_PROGRESS", "PLANNING"],
      "project_type": null
    },
    "parameters": {
      "include_forecast": true,
      "include_variance": true
    }
  }'
```

---

## Notes

1. **Asynchronous Processing**: Report generation is asynchronous. The API returns immediately with status `PENDING`. The frontend should poll the report status or use webhooks to check when the report is `COMPLETED`.

2. **File Storage**: Generated report files should be stored in a secure location (e.g., S3, Azure Blob Storage) and the `file_url` should be a signed URL with appropriate expiration.

3. **Report Code Generation**: The backend should auto-generate `report_code` in the format `RPT-YYYY-XXXXXX` where YYYY is the year and XXXXXX is a unique identifier.

4. **Filter Validation**: Each report type may have specific filter requirements. The backend should validate filters based on the `report_type`.

5. **Permissions**: Some report types may require specific permissions. The backend should check user permissions before generating sensitive reports (e.g., payroll, financial statements).

6. **Rate Limiting**: Consider implementing rate limiting for report generation to prevent abuse.

7. **File Cleanup**: Implement a cleanup job to remove old report files and database records after a retention period (e.g., 90 days).

