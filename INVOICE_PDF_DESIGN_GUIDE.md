# Invoice PDF Design Troubleshooting Guide

This guide helps backend developers fix common PDF design issues in invoice generation.

## Critical Design Issues - Alignment & Formatting

### ⚠️ CRITICAL: Currency Symbol Display Issue

**Problem:** Currency symbol showing as `1` instead of proper symbol (₹, $, INR, etc.)

**Root Cause:** Incorrect character encoding or font issue with currency symbols

**Solution:**
```javascript
// ❌ WRONG - May show as "1" due to encoding issues
doc.text(`1 ${amount}`, x, y);

// ✅ CORRECT - Use proper currency formatting
function formatCurrency(amount, currency = 'INR') {
  // Use Unicode currency symbols or text
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = currencySymbols[currency] || currency;
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol} ${formatted}`;
}

// Or use text-based format if symbols don't work:
function formatCurrencyText(amount, currency = 'INR') {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${currency} ${formatted}`;
}
```

### ⚠️ CRITICAL: Alignment & Lining Issues

**Problem:** Text not properly aligned, columns misaligned, numbers not right-aligned

**Solution:**
```javascript
// ✅ CORRECT - Proper alignment for invoice PDF
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  size: 'LETTER', // or 'A4'
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

// Define column positions (fixed X coordinates)
const COLUMNS = {
  LEFT_MARGIN: 50,
  ITEM_NAME: 50,
  QTY: 300,
  UNIT_PRICE: 350,
  TAX_PERCENT: 420,
  TOTAL: 480,
  RIGHT_EDGE: 550
};

// Helper for right-aligned text
function rightAlignText(doc, text, x, y, options = {}) {
  const width = doc.widthOfString(text, options);
  doc.text(text, x - width, y, options);
}

// Example: Amount summary with proper alignment
function drawAmountSummary(doc, invoice, startY) {
  const labelX = 350;  // Fixed position for labels
  const amountX = 480; // Fixed position for amounts (right edge)
  let y = startY;
  
  doc.fontSize(10);
  
  // Subtotal
  doc.text('Subtotal:', labelX, y, { align: 'right' });
  rightAlignText(doc, formatCurrency(invoice.subtotal, invoice.currency), amountX, y);
  y += 20;
  
  // Discount (if exists)
  if (invoice.discount_amount && invoice.discount_amount > 0) {
    doc.text('Discount:', labelX, y, { align: 'right' });
    rightAlignText(doc, `-${formatCurrency(invoice.discount_amount, invoice.currency)}`, amountX, y);
    y += 20;
  }
  
  // Tax
  doc.text('Tax:', labelX, y, { align: 'right' });
  rightAlignText(doc, formatCurrency(invoice.tax_amount, invoice.currency), amountX, y);
  y += 20;
  
  // Shipping (if exists)
  if (invoice.shipping_amount && invoice.shipping_amount > 0) {
    doc.text('Shipping:', labelX, y, { align: 'right' });
    rightAlignText(doc, formatCurrency(invoice.shipping_amount, invoice.currency), amountX, y);
    y += 20;
  }
  
  // Separator line
  doc.moveTo(labelX - 50, y + 5)
     .lineTo(amountX, y + 5)
     .stroke();
  
  // Total (bold, larger)
  y += 15;
  doc.font('Helvetica-Bold').fontSize(12);
  doc.text('Total Amount:', labelX, y, { align: 'right' });
  rightAlignText(doc, formatCurrency(invoice.total_amount, invoice.currency), amountX, y);
}
```

### ⚠️ CRITICAL: Calculation Verification

**Problem:** Total amounts don't match calculations (subtotal + tax - discount + shipping)

**Solution:**
```javascript
// ✅ CORRECT - Verify calculations before displaying
function verifyInvoiceCalculations(invoice) {
  // Calculate subtotal from items
  const calculatedSubtotal = invoice.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);
  
  // Calculate tax from items
  const calculatedTax = invoice.items.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unit_price;
    const lineDiscount = (lineSubtotal * (item.discount || 0)) / 100;
    const lineAfterDiscount = lineSubtotal - lineDiscount;
    const lineTax = (lineAfterDiscount * (item.tax_rate || 0)) / 100;
    return sum + lineTax;
  }, 0);
  
  // Calculate total
  const discountAmount = invoice.discount_amount || 0;
  const shippingAmount = invoice.shipping_amount || 0;
  const calculatedTotal = calculatedSubtotal - discountAmount + calculatedTax + shippingAmount;
  
  // Verify against invoice data (allow small rounding differences)
  const tolerance = 0.01;
  const subtotalMatch = Math.abs(calculatedSubtotal - invoice.subtotal) < tolerance;
  const taxMatch = Math.abs(calculatedTax - invoice.tax_amount) < tolerance;
  const totalMatch = Math.abs(calculatedTotal - invoice.total_amount) < tolerance;
  
  if (!subtotalMatch || !taxMatch || !totalMatch) {
    console.error('⚠️ Calculation mismatch detected:', {
      subtotal: { calculated: calculatedSubtotal, invoice: invoice.subtotal, match: subtotalMatch },
      tax: { calculated: calculatedTax, invoice: invoice.tax_amount, match: taxMatch },
      total: { calculated: calculatedTotal, invoice: invoice.total_amount, match: totalMatch }
    });
    
    // Use calculated values to ensure correctness
    return {
      subtotal: calculatedSubtotal,
      tax_amount: calculatedTax,
      total_amount: calculatedTotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount
    };
  }
  
  return {
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    total_amount: invoice.total_amount,
    discount_amount: discountAmount,
    shipping_amount: shippingAmount
  };
}
```

## Common Design Issues and Solutions

### 1. Missing Fields in PDF

**Symptoms:**
- PO Number not showing
- Reference Number missing
- Project information absent
- Customer Tax ID/GSTIN not displayed

**Solution:**
Ensure all invoice fields are included in the PDF template, even if they're optional:

```javascript
// ✅ CORRECT - Include all fields with conditional rendering
if (invoice.po_number) {
  doc.text(`PO Number: ${invoice.po_number}`, x, y);
}
if (invoice.reference_number) {
  doc.text(`Reference Number: ${invoice.reference_number}`, x, y);
}
if (invoice.customer_tax_id) {
  doc.text(`GSTIN: ${invoice.customer_tax_id}`, x, y);
}
```

### 2. Incorrect Currency Formatting

**Symptoms:**
- Amounts showing as "2000" instead of "INR 2,000.00"
- Missing decimal places
- No thousand separators

**Solution:**
Format all currency values consistently:

```javascript
// ✅ CORRECT - Format currency properly
function formatCurrency(amount, currency = 'INR') {
  return `${currency} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Usage:
doc.text(`Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}`, x, y);
doc.text(`Tax: ${formatCurrency(invoice.tax_amount, invoice.currency)}`, x, y);
doc.text(`Total: ${formatCurrency(invoice.total_amount, invoice.currency)}`, x, y);
```

### 3. Poor Layout and Alignment

**Symptoms:**
- Text overlapping
- Numbers not aligned
- Sections too close together
- Unprofessional appearance

**Solution:**
Use proper spacing and alignment:

```javascript
// ✅ CORRECT - Use proper spacing and alignment
const margin = 50;
const lineHeight = 20;
let yPosition = margin;

// Header
doc.fontSize(24).text('INVOICE', margin, yPosition, { align: 'center' });
yPosition += 40;

// Invoice Details (Left Column)
doc.fontSize(10).text('Invoice Details:', margin, yPosition);
yPosition += lineHeight;
doc.text(`Date: ${formatDate(invoice.invoice_date)}`, margin, yPosition);
yPosition += lineHeight;
doc.text(`Due Date: ${formatDate(invoice.due_date)}`, margin, yPosition);
yPosition += lineHeight;

// Bill To (Right Column)
const rightColumnX = 300;
yPosition = margin + 40;
doc.text('Bill To:', rightColumnX, yPosition);
yPosition += lineHeight;
doc.text(invoice.customer_name, rightColumnX, yPosition);
yPosition += lineHeight;

// Amounts (Right-aligned)
const amountX = 450;
doc.text(formatCurrency(invoice.subtotal), amountX, yPosition, { align: 'right' });
```

### 4. Date Formatting Issues

**Symptoms:**
- Dates showing as "2025-12-11" instead of "12/11/2025"
- Incorrect date format

**Solution:**
Format dates consistently:

```javascript
// ✅ CORRECT - Format dates properly
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Usage:
doc.text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, x, y);
doc.text(`Due Date: ${formatDate(invoice.due_date)}`, x, y);
```

### 5. Items Table Not Displaying Correctly

**Symptoms:**
- Items not showing
- Table borders missing
- Columns misaligned
- Item details incomplete

**Solution:**
Create a proper table structure:

```javascript
// ✅ CORRECT - Create proper table
function drawItemsTable(doc, invoice, startY) {
  const tableTop = startY;
  const itemCodeX = 50;
  const itemNameX = 150;
  const qtyX = 300;
  const unitPriceX = 350;
  const taxX = 420;
  const totalX = 480;
  
  // Table Header
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Item', itemNameX, tableTop);
  doc.text('Qty', qtyX, tableTop, { align: 'right' });
  doc.text('Unit Price', unitPriceX, tableTop, { align: 'right' });
  doc.text('Tax %', taxX, tableTop, { align: 'right' });
  doc.text('Total', totalX, tableTop, { align: 'right' });
  
  // Draw header line
  doc.moveTo(itemCodeX, tableTop + 15)
     .lineTo(totalX + 50, tableTop + 15)
     .stroke();
  
  // Table Rows
  let currentY = tableTop + 25;
  doc.font('Helvetica');
  
  invoice.items.forEach((item) => {
    doc.fontSize(9);
    doc.text(item.item_name, itemNameX, currentY);
    doc.text(String(item.quantity), qtyX, currentY, { align: 'right' });
    doc.text(formatCurrency(item.unit_price, invoice.currency), unitPriceX, currentY, { align: 'right' });
    doc.text(`${item.tax_rate || 0}%`, taxX, currentY, { align: 'right' });
    doc.text(formatCurrency(item.total_amount, invoice.currency), totalX, currentY, { align: 'right' });
    
    // Item description if available
    if (item.description) {
      currentY += 12;
      doc.fontSize(8).fillColor('gray');
      doc.text(item.description, itemNameX, currentY);
      doc.fillColor('black');
    }
    
    currentY += 20;
  });
  
  // Draw bottom line
  doc.moveTo(itemCodeX, currentY - 5)
     .lineTo(totalX + 50, currentY - 5)
     .stroke();
  
  return currentY;
}
```

### 6. Amount Calculations Not Matching

**Symptoms:**
- Total amount doesn't match subtotal + tax - discount + shipping
- Incorrect calculations displayed

**Solution:**
Verify calculations match the invoice data:

```javascript
// ✅ CORRECT - Verify calculations
function calculateTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);
  
  const discountAmount = invoice.discount_amount || 0;
  const afterDiscount = subtotal - discountAmount;
  
  const taxAmount = invoice.items.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unit_price;
    const lineDiscount = (lineSubtotal * (item.discount || 0)) / 100;
    const lineAfterDiscount = lineSubtotal - lineDiscount;
    const lineTax = (lineAfterDiscount * (item.tax_rate || 0)) / 100;
    return sum + lineTax;
  }, 0);
  
  const shippingAmount = invoice.shipping_amount || 0;
  const totalAmount = afterDiscount + taxAmount + shippingAmount;
  
  // Verify against invoice data
  if (Math.abs(totalAmount - invoice.total_amount) > 0.01) {
    console.warn('Total amount mismatch!', {
      calculated: totalAmount,
      invoice: invoice.total_amount
    });
  }
  
  return { subtotal, discountAmount, taxAmount, shippingAmount, totalAmount };
}
```

### 7. Missing Company Logo or Branding

**Symptoms:**
- No logo in header
- Missing company information

**Solution:**
Include company logo and branding:

```javascript
// ✅ CORRECT - Add company logo
async function addCompanyHeader(doc, companyInfo) {
  if (companyInfo.logoPath) {
    try {
      doc.image(companyInfo.logoPath, 50, 50, { width: 100 });
    } catch (error) {
      console.warn('Logo not found, using text fallback');
      doc.fontSize(20).text(companyInfo.name, 50, 50);
    }
  } else {
    doc.fontSize(20).text(companyInfo.name, 50, 50);
  }
  
  doc.fontSize(10);
  doc.text(companyInfo.address, 50, 80);
  doc.text(`${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}`, 50, 95);
  doc.text(companyInfo.country, 50, 110);
}
```

### 8. PDF Not Printing Correctly

**Symptoms:**
- Content cut off when printing
- Margins too small
- Text too close to edges

**Solution:**
Use proper page margins and sizes:

```javascript
// ✅ CORRECT - Set proper page margins
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  size: 'LETTER', // or 'A4'
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }
});
```

## Complete PDF Generation Example (Node.js/PDFKit)

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateInvoicePDF(invoice) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  
  // Helper functions
  const formatCurrency = (amount, currency = 'INR') => {
    return `${currency} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  let y = 50;
  const margin = 50;
  const lineHeight = 20;
  
  // Header
  doc.fontSize(24).text('INVOICE', margin, y, { align: 'center' });
  y += 30;
  
  // Invoice Number
  const invoiceNumberText = invoice.invoice_code 
    ? `Invoice #: ${invoice.invoice_number} (${invoice.invoice_code})`
    : `Invoice #: ${invoice.invoice_number}`;
  doc.fontSize(12).text(invoiceNumberText, margin, y, { align: 'center' });
  y += 40;
  
  // Two-column layout
  const rightColumnX = 300;
  
  // Left Column: Invoice Details
  doc.fontSize(10).font('Helvetica-Bold').text('Invoice Details:', margin, y);
  y += lineHeight;
  doc.font('Helvetica');
  doc.text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, margin, y);
  y += lineHeight;
  doc.text(`Due Date: ${formatDate(invoice.due_date)}`, margin, y);
  y += lineHeight;
  doc.text(`Status: ${invoice.status}`, margin, y);
  y += lineHeight;
  doc.text(`Type: ${invoice.invoice_type}`, margin, y);
  if (invoice.po_number) {
    y += lineHeight;
    doc.text(`PO Number: ${invoice.po_number}`, margin, y);
  }
  if (invoice.reference_number) {
    y += lineHeight;
    doc.text(`Reference Number: ${invoice.reference_number}`, margin, y);
  }
  
  // Right Column: Bill To
  y = 90;
  doc.font('Helvetica-Bold').text('Bill To:', rightColumnX, y);
  y += lineHeight;
  doc.font('Helvetica');
  doc.text(invoice.customer_name, rightColumnX, y);
  y += lineHeight;
  if (invoice.customer_address) {
    doc.text(invoice.customer_address, rightColumnX, y);
    y += lineHeight;
  }
  const addressLine = [
    invoice.customer_city,
    invoice.customer_state,
    invoice.customer_postal_code
  ].filter(Boolean).join(', ');
  if (addressLine) {
    doc.text(addressLine, rightColumnX, y);
    y += lineHeight;
  }
  if (invoice.customer_country) {
    doc.text(invoice.customer_country, rightColumnX, y);
    y += lineHeight;
  }
  if (invoice.customer_email) {
    doc.text(`Email: ${invoice.customer_email}`, rightColumnX, y);
    y += lineHeight;
  }
  if (invoice.customer_phone) {
    doc.text(`Phone: ${invoice.customer_phone}`, rightColumnX, y);
    y += lineHeight;
  }
  if (invoice.customer_tax_id) {
    doc.text(`GSTIN: ${invoice.customer_tax_id}`, rightColumnX, y);
  }
  
  // Items Table
  y = 250;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Item', margin, y);
  doc.text('Qty', 300, y, { align: 'right' });
  doc.text('Unit Price', 350, y, { align: 'right' });
  doc.text('Tax %', 420, y, { align: 'right' });
  doc.text('Total', 480, y, { align: 'right' });
  
  doc.moveTo(margin, y + 15)
     .lineTo(530, y + 15)
     .stroke();
  
  y += 25;
  doc.font('Helvetica');
  
  invoice.items.forEach((item) => {
    doc.fontSize(9);
    doc.text(item.item_name, margin, y);
    doc.text(String(item.quantity), 300, y, { align: 'right' });
    doc.text(formatCurrency(item.unit_price, invoice.currency), 350, y, { align: 'right' });
    doc.text(`${item.tax_rate || 0}%`, 420, y, { align: 'right' });
    doc.text(formatCurrency(item.total_amount, invoice.currency), 480, y, { align: 'right' });
    y += 20;
  });
  
  // Amount Summary
  y += 20;
  const summaryX = 350;
  doc.fontSize(10);
  doc.text(`Subtotal:`, summaryX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 480, y, { align: 'right' });
  y += lineHeight;
  
  if (invoice.discount_amount && invoice.discount_amount > 0) {
    doc.text(`Discount:`, summaryX, y, { align: 'right' });
    doc.text(`-${formatCurrency(invoice.discount_amount, invoice.currency)}`, 480, y, { align: 'right' });
    y += lineHeight;
  }
  
  doc.text(`Tax:`, summaryX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.tax_amount, invoice.currency), 480, y, { align: 'right' });
  y += lineHeight;
  
  if (invoice.shipping_amount && invoice.shipping_amount > 0) {
    doc.text(`Shipping:`, summaryX, y, { align: 'right' });
    doc.text(formatCurrency(invoice.shipping_amount, invoice.currency), 480, y, { align: 'right' });
    y += lineHeight;
  }
  
  doc.moveTo(summaryX, y + 5)
     .lineTo(530, y + 5)
     .stroke();
  
  y += 15;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Total Amount:`, summaryX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.total_amount, invoice.currency), 480, y, { align: 'right' });
  
  // Notes & Terms
  y += 40;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Notes & Terms:', margin, y);
  y += lineHeight;
  doc.font('Helvetica');
  if (invoice.notes) {
    doc.fontSize(9).text(invoice.notes, margin, y);
    y += 20;
  }
  if (invoice.terms) {
    doc.text(`Payment Terms: ${invoice.terms}`, margin, y);
  }
  
  return doc;
}

// Usage in Express route:
app.get('/invoices/:id/download', authenticateToken, async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const doc = await generateInvoicePDF(invoice);
    
    // Set headers BEFORE piping
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
```

## Testing Checklist

Before deploying, verify:

- [ ] All invoice fields are displayed (including optional ones like PO Number, Reference Number)
- [ ] Currency amounts are formatted correctly (2 decimal places, thousand separators)
- [ ] Dates are formatted as MM/DD/YYYY
- [ ] Items table displays all items with correct alignment
- [ ] Amount calculations match (subtotal + tax - discount + shipping = total)
- [ ] Layout is clean and professional
- [ ] Text doesn't overlap
- [ ] Margins are appropriate for printing
- [ ] Company logo/branding is included
- [ ] PDF opens correctly in Adobe Reader, Chrome, and other PDF viewers
- [ ] PDF prints correctly without content being cut off

## Quick Debug Tips

1. **Check PDF file size**: Should be > 0 bytes
2. **Verify Content-Type header**: Must be `application/pdf`
3. **Test with curl**: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/invoices/103/download --output test.pdf`
4. **Open PDF in multiple viewers**: Chrome, Adobe Reader, Firefox
5. **Check console logs**: Look for calculation warnings or errors
6. **Verify all fields**: Compare PDF output with invoice data from API

