# Report PDF Formatting & Alignment Guide

This guide fixes overlapping data, truncated text, and alignment issues in report PDFs.

## ⚠️ CRITICAL ISSUES - Fix These First

### 1. Column Width & Text Truncation

**Problem:** Column headers and data are truncated (e.g., "Transac Number", "Paymen Method", "Status")

**Root Cause:** Columns too narrow, text not wrapping properly

**Solution:**
```javascript
// ✅ CORRECT - Calculate proper column widths based on content
function calculateColumnWidths(columns, pageWidth, margin) {
  const availableWidth = pageWidth - (margin * 2);
  const columnCount = columns.length;
  
  // Option 1: Equal width columns
  const equalWidth = availableWidth / columnCount;
  
  // Option 2: Proportional widths based on content type
  const columnWidths = columns.map((col, index) => {
    switch (col.type) {
      case 'number':
      case 'amount':
        return 60; // Narrower for numbers
      case 'date':
        return 80; // Medium for dates
      case 'status':
      case 'type':
        return 70; // Medium for short text
      case 'description':
      case 'name':
        return 120; // Wider for text
      default:
        return equalWidth;
    }
  });
  
  // Ensure total doesn't exceed available width
  const total = columnWidths.reduce((sum, w) => sum + w, 0);
  if (total > availableWidth) {
    const scale = availableWidth / total;
    return columnWidths.map(w => Math.floor(w * scale));
  }
  
  return columnWidths;
}

// Usage:
const COLUMNS = [
  { key: 'transaction_number', label: 'Transaction Number', type: 'text', width: 100 },
  { key: 'type', label: 'Type', type: 'type', width: 60 },
  { key: 'category', label: 'Category', type: 'text', width: 80 },
  { key: 'amount', label: 'Amount', type: 'amount', width: 70 },
  { key: 'currency', label: 'Currency', type: 'text', width: 50 },
  { key: 'date', label: 'Date', type: 'date', width: 80 },
  { key: 'payment_method', label: 'Payment Method', type: 'text', width: 90 },
  { key: 'status', label: 'Status', type: 'status', width: 70 },
  { key: 'description', label: 'Description', type: 'description', width: 120 },
  { key: 'reference_number', label: 'Reference Number', type: 'text', width: 100 },
  { key: 'tax_amount', label: 'Tax Amount', type: 'amount', width: 70 },
  { key: 'account_name', label: 'Account Name', type: 'text', width: 100 }
];
```

### 2. Date Formatting Issues

**Problem:** Dates showing as garbled text ("Thu Dec", "We2032c", "00:00:00")

**Root Cause:** Incorrect date formatting or text overflow

**Solution:**
```javascript
// ✅ CORRECT - Format dates properly and handle overflow
function formatDate(dateString, format = 'MM/DD/YYYY') {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

// For table cells - ensure date fits in column
function drawDateCell(doc, dateString, x, y, maxWidth) {
  const formatted = formatDate(dateString);
  const textWidth = doc.widthOfString(formatted);
  
  if (textWidth > maxWidth) {
    // Truncate or use smaller font
    doc.fontSize(8);
    doc.text(formatted.substring(0, 10), x, y, { width: maxWidth, ellipsis: true });
    doc.fontSize(9); // Reset
  } else {
    doc.text(formatted, x, y);
  }
}
```

### 3. Text Overflow & Wrapping

**Problem:** Text overlapping, not wrapping properly

**Solution:**
```javascript
// ✅ CORRECT - Handle text wrapping and overflow
function drawTextCell(doc, text, x, y, maxWidth, options = {}) {
  const fontSize = options.fontSize || 9;
  const maxHeight = options.maxHeight || 15;
  
  doc.fontSize(fontSize);
  
  // Measure text
  const textWidth = doc.widthOfString(text);
  
  if (textWidth <= maxWidth) {
    // Text fits - draw normally
    doc.text(text, x, y, { width: maxWidth });
  } else {
    // Text too long - wrap or truncate
    if (options.wrap) {
      // Multi-line wrapping
      const lines = doc.heightOfString(text, { width: maxWidth });
      if (lines * fontSize <= maxHeight) {
        doc.text(text, x, y, { width: maxWidth });
      } else {
        // Truncate with ellipsis
        doc.text(text, x, y, { width: maxWidth, ellipsis: true });
      }
    } else {
      // Single line with ellipsis
      doc.text(text, x, y, { width: maxWidth, ellipsis: true });
    }
  }
}
```

### 4. Table Layout with Proper Spacing

**Problem:** Columns misaligned, inconsistent spacing

**Solution:**
```javascript
// ✅ CORRECT - Proper table layout with fixed positions
function drawReportTable(doc, data, columns, startY) {
  const margin = 50;
  const pageWidth = 550; // Letter size minus margins
  const rowHeight = 20;
  const headerHeight = 25;
  
  // Calculate column positions
  let currentX = margin;
  const columnPositions = [];
  
  columns.forEach((col, index) => {
    columnPositions.push({
      x: currentX,
      width: col.width || 80,
      align: col.align || 'left',
      key: col.key
    });
    currentX += col.width || 80;
  });
  
  // Draw header
  doc.font('Helvetica-Bold').fontSize(9);
  let headerY = startY;
  
  columns.forEach((col, index) => {
    const pos = columnPositions[index];
    const label = col.label || col.key;
    
    // Handle long headers - truncate if needed
    const maxLabelWidth = pos.width - 5;
    const labelWidth = doc.widthOfString(label);
    
    if (labelWidth > maxLabelWidth) {
      // Truncate header
      const truncated = label.substring(0, Math.floor(maxLabelWidth / 5));
      doc.text(truncated, pos.x, headerY, { width: pos.width, align: pos.align });
    } else {
      doc.text(label, pos.x, headerY, { width: pos.width, align: pos.align });
    }
  });
  
  // Header underline
  doc.moveTo(margin, headerY + 15)
     .lineTo(pageWidth - margin, headerY + 15)
     .stroke();
  
  // Draw rows
  let currentY = headerY + headerHeight;
  doc.font('Helvetica').fontSize(8);
  
  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY > 750) { // Near bottom of page
      doc.addPage();
      currentY = margin + headerHeight;
      
      // Redraw header on new page
      columns.forEach((col, index) => {
        const pos = columnPositions[index];
        doc.font('Helvetica-Bold').fontSize(9);
        doc.text(col.label, pos.x, margin, { width: pos.width, align: pos.align });
      });
      doc.font('Helvetica').fontSize(8);
      doc.moveTo(margin, margin + 15)
         .lineTo(pageWidth - margin, margin + 15)
         .stroke();
      currentY = margin + headerHeight;
    }
    
    // Draw row data
    columns.forEach((col, index) => {
      const pos = columnPositions[index];
      const value = row[col.key] || '';
      const formattedValue = formatCellValue(value, col);
      
      // Draw cell with proper alignment and wrapping
      doc.text(
        formattedValue,
        pos.x,
        currentY,
        {
          width: pos.width - 2, // Small padding
          align: pos.align,
          ellipsis: true // Truncate if too long
        }
      );
    });
    
    currentY += rowHeight;
    
    // Row separator (optional, lighter line)
    if (rowIndex < data.length - 1) {
      doc.moveTo(margin, currentY - 5)
         .lineTo(pageWidth - margin, currentY - 5)
         .strokeColor('gray')
         .lineWidth(0.5)
         .stroke()
         .strokeColor('black')
         .lineWidth(1);
    }
  });
  
  return currentY;
}

// Format cell value based on column type
function formatCellValue(value, column) {
  if (value === null || value === undefined) return '';
  
  switch (column.type) {
    case 'date':
      return formatDate(value);
    case 'amount':
    case 'number':
      return formatNumber(value, column.decimals || 2);
    case 'currency':
      return value.toUpperCase();
    default:
      return String(value);
  }
}

function formatNumber(value, decimals = 2) {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
```

### 5. Complete Transaction Report Example

```javascript
const PDFDocument = require('pdfkit');

function generateTransactionReportPDF(report, transactions) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  
  const margin = 50;
  const pageWidth = 550;
  let y = margin;
  
  // Header
  doc.fontSize(20).font('Helvetica-Bold')
     .text('REPORT', margin, y, { width: pageWidth, align: 'center' });
  y += 25;
  
  doc.fontSize(14).font('Helvetica')
     .text(report.report_name || 'Transaction Report', margin, y, { width: pageWidth, align: 'center' });
  y += 30;
  
  // Report Information
  doc.fontSize(10).font('Helvetica-Bold').text('Report Information:', margin, y);
  y += 15;
  doc.font('Helvetica').fontSize(9);
  doc.text(`Report Code: ${report.report_code || report.id}`, margin, y);
  y += 12;
  doc.text(`Report Type: ${report.report_type}`, margin, y);
  y += 12;
  
  if (report.start_date && report.end_date) {
    const dateRange = `${formatDate(report.start_date)} - ${formatDate(report.end_date)}`;
    doc.text(`Date Range: ${dateRange}`, margin, y);
    y += 12;
  }
  
  if (report.generated_at) {
    doc.text(`Generated At: ${formatDate(report.generated_at)}`, margin, y);
    y += 20;
  }
  
  // Define columns with proper widths
  const columns = [
    { key: 'transaction_number', label: 'Transaction Number', type: 'text', width: 100, align: 'left' },
    { key: 'type', label: 'Type', type: 'text', width: 60, align: 'left' },
    { key: 'category', label: 'Category', type: 'text', width: 70, align: 'left' },
    { key: 'amount', label: 'Amount', type: 'amount', width: 70, align: 'right' },
    { key: 'currency', label: 'Currency', type: 'currency', width: 50, align: 'left' },
    { key: 'date', label: 'Date', type: 'date', width: 80, align: 'left' },
    { key: 'payment_method', label: 'Payment Method', type: 'text', width: 90, align: 'left' },
    { key: 'status', label: 'Status', type: 'status', width: 70, align: 'left' },
    { key: 'description', label: 'Description', type: 'text', width: 100, align: 'left' },
    { key: 'reference_number', label: 'Reference Number', type: 'text', width: 90, align: 'left' },
    { key: 'tax_amount', label: 'Tax Amount', type: 'amount', width: 70, align: 'right' },
    { key: 'account_name', label: 'Account Name', type: 'text', width: 90, align: 'left' }
  ];
  
  // Draw table
  y = drawReportTable(doc, transactions, columns, y);
  
  // Summary (if needed)
  if (transactions.length > 0) {
    y += 20;
    doc.font('Helvetica-Bold').fontSize(10).text('Summary:', margin, y);
    y += 15;
    doc.font('Helvetica').fontSize(9);
    
    const totalAmount = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalTax = transactions.reduce((sum, t) => sum + (parseFloat(t.tax_amount) || 0), 0);
    
    doc.text(`Total Transactions: ${transactions.length}`, margin, y);
    y += 12;
    doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, margin, y);
    y += 12;
    doc.text(`Total Tax: ${formatCurrency(totalTax)}`, margin, y);
  }
  
  return doc;
}

function formatCurrency(amount, currency = 'INR') {
  return `${currency} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return dateString;
  }
}

function drawReportTable(doc, data, columns, startY) {
  const margin = 50;
  const pageWidth = 550;
  const rowHeight = 18;
  const headerHeight = 20;
  
  // Calculate positions
  let currentX = margin;
  const positions = columns.map(col => {
    const pos = { x: currentX, width: col.width, align: col.align || 'left', key: col.key };
    currentX += col.width;
    return pos;
  });
  
  // Header
  doc.font('Helvetica-Bold').fontSize(8);
  let y = startY;
  
  columns.forEach((col, i) => {
    const pos = positions[i];
    const label = col.label;
    doc.text(label, pos.x, y, { 
      width: pos.width - 2, 
      align: pos.align,
      ellipsis: true // Truncate long headers
    });
  });
  
  doc.moveTo(margin, y + 12).lineTo(pageWidth - margin, y + 12).stroke();
  
  // Rows
  y += headerHeight;
  doc.font('Helvetica').fontSize(7);
  
  data.forEach((row, rowIndex) => {
    // Page break check
    if (y > 750) {
      doc.addPage();
      y = margin + headerHeight;
      // Redraw header
      doc.font('Helvetica-Bold').fontSize(8);
      columns.forEach((col, i) => {
        doc.text(col.label, positions[i].x, margin, { 
          width: positions[i].width - 2, 
          align: positions[i].align 
        });
      });
      doc.moveTo(margin, margin + 12).lineTo(pageWidth - margin, margin + 12).stroke();
      doc.font('Helvetica').fontSize(7);
    }
    
    // Draw row
    columns.forEach((col, i) => {
      const pos = positions[i];
      const value = formatCellValue(row[col.key], col);
      doc.text(value, pos.x, y, { 
        width: pos.width - 2, 
        align: pos.align,
        ellipsis: true // Prevent overflow
      });
    });
    
    y += rowHeight;
  });
  
  return y;
}

function formatCellValue(value, column) {
  if (value === null || value === undefined || value === '') return '';
  
  switch (column.type) {
    case 'date':
      return formatDate(value);
    case 'amount':
      return formatNumber(parseFloat(value) || 0);
    case 'currency':
      return String(value).toUpperCase();
    case 'status':
    case 'type':
      return String(value).substring(0, 15); // Limit length
    default:
      return String(value);
  }
}

function formatNumber(value, decimals = 2) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
```

## Key Fixes Summary

1. **Column Widths**: Calculate based on content type, ensure total fits page width
2. **Text Wrapping**: Use `ellipsis: true` and `width` parameter to prevent overflow
3. **Date Formatting**: Always format dates as MM/DD/YYYY, handle invalid dates
4. **Alignment**: Use fixed X positions for columns, right-align numbers
5. **Font Sizes**: Use smaller fonts (7-8pt) for table data, 9pt for headers
6. **Page Breaks**: Check Y position, add new page and redraw headers when needed
7. **Cell Formatting**: Format values based on column type (date, number, text)

## Testing Checklist

- [ ] All column headers visible and not truncated
- [ ] Dates formatted correctly (MM/DD/YYYY)
- [ ] Numbers right-aligned
- [ ] Text doesn't overlap between columns
- [ ] Long text truncated with ellipsis
- [ ] Table fits within page margins
- [ ] Page breaks work correctly with headers on each page
- [ ] All data visible and readable

