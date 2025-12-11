# Invoice PDF Alignment & Formatting Quick Fix Guide

## ⚠️ URGENT: Fix These Issues Immediately

Based on the PDF output showing incorrect currency symbols and misaligned columns, here are the exact fixes needed:

### 1. Currency Symbol Fix (Showing as "1")

**Current Problem:** All amounts show `1 11,970.00` instead of `₹ 11,970.00` or `INR 11,970.00`

**Fix:**
```javascript
// ❌ CURRENT (WRONG) - Shows "1" prefix
doc.text(`1 ${amount.toLocaleString()}`, x, y);

// ✅ FIXED - Use text-based currency
function formatCurrency(amount, currency = 'INR') {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${currency} ${formatted}`;
  // Result: "INR 11,970.00" ✅
}

// Usage everywhere:
doc.text(`Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}`, x, y);
doc.text(`Tax: ${formatCurrency(invoice.tax_amount, invoice.currency)}`, x, y);
doc.text(`Total: ${formatCurrency(invoice.total_amount, invoice.currency)}`, x, y);
```

### 2. Column Alignment Fix

**Current Problem:** Columns not aligned, numbers not right-aligned

**Fix - Use Fixed X Coordinates:**
```javascript
// Define fixed column positions (DO NOT CHANGE)
const COLS = {
  ITEM: 50,      // Item name starts here
  QTY: 300,      // Quantity column (right-align)
  PRICE: 350,    // Unit price column (right-align)
  TAX: 420,      // Tax % column (right-align)
  TOTAL: 480     // Total column (right-align)
};

// Table Header - All aligned
doc.font('Helvetica-Bold').fontSize(10);
doc.text('Item', COLS.ITEM, y);
doc.text('Qty', COLS.QTY, y, { align: 'right' });
doc.text('Unit Price', COLS.PRICE, y, { align: 'right' });
doc.text('Tax %', COLS.TAX, y, { align: 'right' });
doc.text('Total', COLS.TOTAL, y, { align: 'right' });

// Table Rows - All aligned to same columns
invoice.items.forEach((item) => {
  doc.font('Helvetica').fontSize(9);
  doc.text(item.item_name, COLS.ITEM, y);
  doc.text(String(item.quantity), COLS.QTY, y, { align: 'right' });
  doc.text(formatCurrency(item.unit_price, invoice.currency), COLS.PRICE, y, { align: 'right' });
  doc.text(`${item.tax_rate || 0}%`, COLS.TAX, y, { align: 'right' });
  doc.text(formatCurrency(item.total_amount, invoice.currency), COLS.TOTAL, y, { align: 'right' });
  y += 20;
});
```

### 3. Amount Summary Alignment Fix

**Current Problem:** Amounts not aligned, inconsistent positioning

**Fix:**
```javascript
// Fixed positions for amount summary
const AMOUNT_LABEL_X = 350;  // Labels align here (right-align)
const AMOUNT_VALUE_X = 480;  // Values align here (right-align)

// Amount Summary - All right-aligned
doc.fontSize(10);
doc.text('Subtotal:', AMOUNT_LABEL_X, y, { align: 'right' });
doc.text(formatCurrency(invoice.subtotal, invoice.currency), AMOUNT_VALUE_X, y, { align: 'right' });
y += 20;

if (invoice.discount_amount > 0) {
  doc.text('Discount:', AMOUNT_LABEL_X, y, { align: 'right' });
  doc.text(`-${formatCurrency(invoice.discount_amount, invoice.currency)}`, AMOUNT_VALUE_X, y, { align: 'right' });
  y += 20;
}

doc.text('Tax:', AMOUNT_LABEL_X, y, { align: 'right' });
doc.text(formatCurrency(invoice.tax_amount, invoice.currency), AMOUNT_VALUE_X, y, { align: 'right' });
y += 20;

if (invoice.shipping_amount > 0) {
  doc.text('Shipping:', AMOUNT_LABEL_X, y, { align: 'right' });
  doc.text(formatCurrency(invoice.shipping_amount, invoice.currency), AMOUNT_VALUE_X, y, { align: 'right' });
  y += 20;
}

// Separator line
doc.moveTo(AMOUNT_LABEL_X - 50, y + 5)
   .lineTo(AMOUNT_VALUE_X, y + 5)
   .stroke();

// Total - Bold, larger
y += 15;
doc.fontSize(12).font('Helvetica-Bold');
doc.text('Total Amount:', AMOUNT_LABEL_X, y, { align: 'right' });
doc.text(formatCurrency(invoice.total_amount, invoice.currency), AMOUNT_VALUE_X, y, { align: 'right' });
```

### 4. Calculation Verification Fix

**Current Problem:** Total amounts don't match calculations

**Fix - Verify Before Display:**
```javascript
// Calculate correct totals from items
function getCorrectAmounts(invoice) {
  // Subtotal from items
  const subtotal = invoice.items.reduce((sum, item) => 
    sum + (item.quantity * item.unit_price), 0);
  
  // Tax from items
  const tax = invoice.items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unit_price;
    const lineDiscount = (lineTotal * (item.discount || 0)) / 100;
    const lineAfterDiscount = lineTotal - lineDiscount;
    const lineTax = (lineAfterDiscount * (item.tax_rate || 0)) / 100;
    return sum + lineTax;
  }, 0);
  
  const discount = invoice.discount_amount || 0;
  const shipping = invoice.shipping_amount || 0;
  const total = subtotal - discount + tax + shipping;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(tax * 100) / 100,
    discount_amount: discount,
    shipping_amount: shipping,
    total_amount: Math.round(total * 100) / 100
  };
}

// Use in PDF generation:
const amounts = getCorrectAmounts(invoice);
// Use amounts.subtotal, amounts.tax_amount, amounts.total_amount instead of invoice values
```

### 5. Complete Working Example

```javascript
const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoice) {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  
  // Fixed column positions
  const COLS = { ITEM: 50, QTY: 300, PRICE: 350, TAX: 420, TOTAL: 480 };
  const AMOUNT_LABEL = 350;
  const AMOUNT_VALUE = 480;
  
  // Currency formatter
  const formatCurrency = (amount, currency = 'INR') => {
    return `${currency} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Date formatter
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  };
  
  // Get correct amounts
  const amounts = getCorrectAmounts(invoice);
  
  let y = 50;
  
  // Header
  doc.fontSize(24).font('Helvetica-Bold')
     .text('INVOICE', 50, y, { width: 500, align: 'center' });
  y += 30;
  
  const invoiceNum = invoice.invoice_code 
    ? `Invoice #: ${invoice.invoice_number} (${invoice.invoice_code})`
    : `Invoice #: ${invoice.invoice_number}`;
  doc.fontSize(12).font('Helvetica')
     .text(invoiceNum, 50, y, { width: 500, align: 'center' });
  y += 40;
  
  // Two columns
  const detailsY = y;
  
  // Left: Invoice Details
  doc.fontSize(10).font('Helvetica-Bold').text('Invoice Details:', 50, y);
  y += 20;
  doc.font('Helvetica');
  doc.text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, 50, y);
  y += 20;
  doc.text(`Due Date: ${formatDate(invoice.due_date)}`, 50, y);
  y += 20;
  doc.text(`Status: ${invoice.status}`, 50, y);
  y += 20;
  doc.text(`Type: ${invoice.invoice_type}`, 50, y);
  if (invoice.po_number) { y += 20; doc.text(`PO Number: ${invoice.po_number}`, 50, y); }
  if (invoice.reference_number) { y += 20; doc.text(`Reference Number: ${invoice.reference_number}`, 50, y); }
  
  // Right: Bill To
  y = detailsY;
  doc.font('Helvetica-Bold').text('Bill To:', 300, y);
  y += 20;
  doc.font('Helvetica');
  doc.text(invoice.customer_name, 300, y);
  y += 20;
  if (invoice.customer_address) { doc.text(invoice.customer_address, 300, y); y += 20; }
  const addr = [invoice.customer_city, invoice.customer_state, invoice.customer_postal_code].filter(Boolean).join(', ');
  if (addr) { doc.text(addr, 300, y); y += 20; }
  if (invoice.customer_country) { doc.text(invoice.customer_country, 300, y); y += 20; }
  if (invoice.customer_email) { doc.text(`Email: ${invoice.customer_email}`, 300, y); y += 20; }
  if (invoice.customer_phone) { doc.text(`Phone: ${invoice.customer_phone}`, 300, y); y += 20; }
  if (invoice.customer_tax_id) { doc.text(`GSTIN: ${invoice.customer_tax_id}`, 300, y); }
  
  // Items Table
  y = Math.max(y, detailsY + 120) + 30;
  
  // Header
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Item', COLS.ITEM, y);
  doc.text('Qty', COLS.QTY, y, { align: 'right' });
  doc.text('Unit Price', COLS.PRICE, y, { align: 'right' });
  doc.text('Tax %', COLS.TAX, y, { align: 'right' });
  doc.text('Total', COLS.TOTAL, y, { align: 'right' });
  
  doc.moveTo(COLS.ITEM, y + 15).lineTo(COLS.TOTAL + 50, y + 15).stroke();
  
  y += 25;
  doc.font('Helvetica');
  
  // Rows
  invoice.items.forEach((item) => {
    doc.fontSize(9);
    doc.text(item.item_name, COLS.ITEM, y);
    doc.text(String(item.quantity), COLS.QTY, y, { align: 'right' });
    doc.text(formatCurrency(item.unit_price, invoice.currency), COLS.PRICE, y, { align: 'right' });
    doc.text(`${item.tax_rate || 0}%`, COLS.TAX, y, { align: 'right' });
    doc.text(formatCurrency(item.total_amount, invoice.currency), COLS.TOTAL, y, { align: 'right' });
    y += 20;
  });
  
  doc.moveTo(COLS.ITEM, y - 5).lineTo(COLS.TOTAL + 50, y - 5).stroke();
  
  // Amount Summary
  y += 20;
  doc.fontSize(10);
  doc.text('Subtotal:', AMOUNT_LABEL, y, { align: 'right' });
  doc.text(formatCurrency(amounts.subtotal, invoice.currency), AMOUNT_VALUE, y, { align: 'right' });
  y += 20;
  
  if (amounts.discount_amount > 0) {
    doc.text('Discount:', AMOUNT_LABEL, y, { align: 'right' });
    doc.text(`-${formatCurrency(amounts.discount_amount, invoice.currency)}`, AMOUNT_VALUE, y, { align: 'right' });
    y += 20;
  }
  
  doc.text('Tax:', AMOUNT_LABEL, y, { align: 'right' });
  doc.text(formatCurrency(amounts.tax_amount, invoice.currency), AMOUNT_VALUE, y, { align: 'right' });
  y += 20;
  
  if (amounts.shipping_amount > 0) {
    doc.text('Shipping:', AMOUNT_LABEL, y, { align: 'right' });
    doc.text(formatCurrency(amounts.shipping_amount, invoice.currency), AMOUNT_VALUE, y, { align: 'right' });
    y += 20;
  }
  
  doc.moveTo(AMOUNT_LABEL - 50, y + 5).lineTo(AMOUNT_VALUE, y + 5).stroke();
  
  y += 15;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total Amount:', AMOUNT_LABEL, y, { align: 'right' });
  doc.text(formatCurrency(amounts.total_amount, invoice.currency), AMOUNT_VALUE, y, { align: 'right' });
  
  // Notes & Terms
  y += 40;
  doc.fontSize(10).font('Helvetica-Bold').text('Notes & Terms:', 50, y);
  y += 20;
  doc.font('Helvetica').fontSize(9);
  if (invoice.notes) { doc.text(invoice.notes, 50, y, { width: 400 }); y += 20; }
  if (invoice.terms) { doc.text(`Payment Terms: ${invoice.terms}`, 50, y); }
  
  return doc;
}

function getCorrectAmounts(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = invoice.items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unit_price;
    const lineDiscount = (lineTotal * (item.discount || 0)) / 100;
    const lineAfterDiscount = lineTotal - lineDiscount;
    return sum + ((lineAfterDiscount * (item.tax_rate || 0)) / 100);
  }, 0);
  const discount = invoice.discount_amount || 0;
  const shipping = invoice.shipping_amount || 0;
  const total = subtotal - discount + tax + shipping;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(tax * 100) / 100,
    discount_amount: discount,
    shipping_amount: shipping,
    total_amount: Math.round(total * 100) / 100
  };
}
```

## Checklist Before Deploying

- [ ] Currency shows as "INR" or "₹" not "1"
- [ ] All numbers are right-aligned in columns
- [ ] Column positions are consistent throughout
- [ ] Amount calculations match (subtotal + tax - discount + shipping = total)
- [ ] All amounts formatted with 2 decimal places
- [ ] Thousand separators present (e.g., "11,970.00")
- [ ] Dates formatted as MM/DD/YYYY
- [ ] Table borders/separators visible
- [ ] Proper spacing between sections
- [ ] Text doesn't overlap

