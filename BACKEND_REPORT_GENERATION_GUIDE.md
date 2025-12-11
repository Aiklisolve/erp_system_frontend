# Backend Report Generation Troubleshooting Guide

## Problem: Invalid File Format Error

If you're seeing "Invalid File Format" errors when downloading reports, this means the backend is not generating valid files. This guide will help you fix the issue.

## ⚠️ NEW: PDF Formatting Issues

If you're seeing **overlapping data, truncated text, garbled dates, or alignment issues** in report PDFs, see:
- **`REPORT_PDF_FORMATTING_GUIDE.md`** - Complete guide for fixing column widths, text wrapping, date formatting, and table layout

## Common Issues and Solutions

### 1. Backend Returning JSON Instead of File

**Symptom**: Error message says "Backend returned JSON error instead of file"

**Problem**: The download endpoint is returning JSON error responses instead of binary file content.

**Solution**:
```javascript
// ❌ WRONG - Don't do this:
app.get('/reports/:id/download', (req, res) => {
  if (!report.file_url) {
    return res.json({ error: 'File not found' }); // This is wrong!
  }
  // ...
});

// ✅ CORRECT - Return proper HTTP status codes:
app.get('/reports/:id/download', (req, res) => {
  if (!report.file_url) {
    return res.status(404).json({ error: 'File not found' });
  }
  // Send file
  res.sendFile(path);
});
```

### 2. PDF Files Not Starting with %PDF Magic Bytes

**Symptom**: Error message says "Expected PDF file but file does not have PDF magic bytes"

**Problem**: The PDF file is corrupted, incomplete, or not a valid PDF.

**Solution**: Use proper PDF generation libraries:

#### Node.js/Express Example:
```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

app.get('/reports/:id/download', async (req, res) => {
  const doc = new PDFDocument();
  
  // Set headers BEFORE writing to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
  
  // Pipe PDF directly to response
  doc.pipe(res);
  
  // Add content
  doc.fontSize(20).text('Report Title', 100, 100);
  doc.text('Report content here...', 100, 150);
  
  // Finalize PDF
  doc.end();
});
```

#### Python/Flask Example:
```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO

@app.route('/reports/<id>/download')
def download_report(id):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add content
    p.drawString(100, 750, "Report Title")
    p.drawString(100, 700, "Report content here...")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'report-{id}.pdf'
    )
```

### 3. Excel Files Not Starting with PK (ZIP) Magic Bytes

**Symptom**: Error message says "Expected Excel/XLSX file but file does not have ZIP magic bytes"

**Problem**: XLSX files are ZIP archives. The file must be a valid ZIP file.

**Solution**: Use proper Excel generation libraries:

#### Node.js/Express Example:
```javascript
const ExcelJS = require('exceljs');

app.get('/reports/:id/download', async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add data
  worksheet.columns = [
    { header: 'Column 1', key: 'col1', width: 10 },
    { header: 'Column 2', key: 'col2', width: 10 }
  ];
  
  worksheet.addRow({ col1: 'Data 1', col2: 'Data 2' });
  
  // Set headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="report-${id}.xlsx"`);
  
  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});
```

#### Python/Flask Example:
```python
from openpyxl import Workbook
from io import BytesIO

@app.route('/reports/<id>/download')
def download_report(id):
    wb = Workbook()
    ws = wb.active
    
    # Add data
    ws['A1'] = 'Column 1'
    ws['B1'] = 'Column 2'
    ws['A2'] = 'Data 1'
    ws['B2'] = 'Data 2'
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'report-{id}.xlsx'
    )
```

### 4. HTML Error Pages Instead of Files

**Symptom**: Error message says "Backend returned HTML error page instead of file"

**Problem**: The backend is returning HTML error pages (like 404 or 500 error pages) instead of file content.

**Solution**: Ensure error handling returns proper JSON responses, not HTML:

```javascript
// ❌ WRONG - Express default error handler returns HTML
app.use((err, req, res, next) => {
  res.status(500).send(err.message); // This might return HTML
});

// ✅ CORRECT - Return JSON for API endpoints
app.use((err, req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).send(err.message);
  }
});
```

### 5. Empty Files

**Symptom**: Error message says "Downloaded file is empty"

**Problem**: The file generation process is not writing content to the file, or the file stream is not being properly closed.

**Solution**: Ensure files are fully written before sending:

```javascript
// ✅ CORRECT - Ensure file is complete
const fs = require('fs');
const path = require('path');

app.get('/reports/:id/download', async (req, res) => {
  const filePath = path.join(__dirname, 'reports', `report-${id}.pdf`);
  
  // Check if file exists and has content
  const stats = await fs.promises.stat(filePath);
  if (stats.size === 0) {
    return res.status(500).json({ error: 'File is empty' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
  res.setHeader('Content-Length', stats.size);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
```

## Required Response Headers

Your download endpoint MUST set these headers:

```javascript
// For PDF files:
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="report-123.pdf"');
res.setHeader('Content-Length', fileSize); // Optional but recommended

// For Excel files:
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename="report-123.xlsx"');

// For CSV files:
res.setHeader('Content-Type', 'text/csv;charset=utf-8');
res.setHeader('Content-Disposition', 'attachment; filename="report-123.csv"');

// For JSON files:
res.setHeader('Content-Type', 'application/json;charset=utf-8');
res.setHeader('Content-Disposition', 'attachment; filename="report-123.json"');
```

## Testing Your Backend

### Test with cURL:

```bash
# Test PDF download
curl -X GET "http://localhost:3000/api/v1/reports/23/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test.pdf \
  -v

# Check if it's a valid PDF
file test.pdf
# Should output: test.pdf: PDF document, version 1.4

# Check PDF magic bytes
head -c 4 test.pdf
# Should output: %PDF
```

### Test File Validity:

```bash
# For PDF files
pdfinfo test.pdf  # Should show PDF metadata

# For Excel files
unzip -l test.xlsx  # Should list ZIP contents (XLSX is a ZIP file)

# For CSV files
head test.csv  # Should show readable text
```

## Recommended Libraries

### PDF Generation:
- **Node.js**: `pdfkit`, `jsPDF`, `pdfmake`
- **Python**: `reportlab`, `weasyprint`, `fpdf`
- **Java**: `iText`, `Apache PDFBox`
- **PHP**: `TCPDF`, `FPDF`

### Excel Generation:
- **Node.js**: `exceljs`, `xlsx`
- **Python**: `openpyxl`, `xlsxwriter`, `pandas`
- **Java**: `Apache POI`
- **PHP**: `PhpSpreadsheet`

## Checklist

Before deploying, ensure:

- [ ] Files start with correct magic bytes (%PDF for PDF, PK for XLSX)
- [ ] Content-Type header matches file type
- [ ] Content-Disposition header includes filename with extension
- [ ] Files are not empty (size > 0)
- [ ] Error responses return JSON, not HTML
- [ ] Files can be opened by standard applications (Adobe Reader, Excel, etc.)
- [ ] File generation completes before sending response
- [ ] Proper error handling for missing files

## Debugging Tips

1. **Check Response Headers**: Use browser DevTools Network tab to see Content-Type
2. **Check File Content**: Download file manually and check first few bytes
3. **Test with Standard Tools**: Try opening file with Adobe Reader/Excel
4. **Check Backend Logs**: Look for errors during file generation
5. **Validate File Size**: Ensure files are not 0 bytes
6. **Test Different Formats**: Try generating PDF, Excel, CSV separately

## Still Having Issues?

If files are still not working:

1. Check browser console for detailed error messages
2. Verify backend is using correct libraries
3. Test file generation independently (not through API)
4. Check file permissions and storage paths
5. Verify authentication token is valid
6. Check CORS headers if accessing from different domain

