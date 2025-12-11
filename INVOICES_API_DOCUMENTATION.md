# Invoice Generation Module API Documentation

This document provides API specifications with curl examples for all Invoice Generation module endpoints. The frontend expects these endpoints to be implemented in the backend.

**Base URL**: `http://localhost:3000/api/v1` (or your API domain)

**Authentication**: All requests require authentication token in the header:
```
Authorization: Bearer <your-auth-token>
```

---

## 1. List Invoices

**Endpoint**: `GET /invoices`

**Description**: Retrieves a list of invoices. Supports filtering by status, invoice type, customer, and date range.

**Query Parameters**:
- `status` (optional): Filter by status (`DRAFT`, `PENDING`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`, `REFUNDED`)
- `invoice_type` (optional): Filter by invoice type (`SALES`, `PURCHASE`, `SERVICE`, `PRODUCT`, `RECURRING`)
- `customer_id` (optional): Filter by customer ID
- `start_date` (optional): Filter invoices created after this date (ISO 8601 format: YYYY-MM-DD)
- `end_date` (optional): Filter invoices created before this date (ISO 8601 format: YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by invoice number, customer name, email, or PO number

**cURL Request**:
```bash
# Get all invoices
curl -X GET "http://localhost:3000/api/v1/invoices" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Get invoices with filters
curl -X GET "http://localhost:3000/api/v1/invoices?status=PAID&invoice_type=SALES&page=1&limit=20" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Search invoices
curl -X GET "http://localhost:3000/api/v1/invoices?search=INV-2025" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK) - Direct Array Format:
```json
[
  {
    "id": "101",
    "invoice_number": "INV-202501-ABC123",
    "invoice_code": "INV-2025-001",
    "invoice_type": "SALES",
    "status": "PAID",
    "customer_id": "45",
    "customer_name": "Acme Corporation",
    "customer_email": "billing@acme.com",
    "customer_phone": "+1-555-0123",
    "customer_address": "123 Business St",
    "customer_city": "New York",
    "customer_state": "NY",
    "customer_postal_code": "10001",
    "customer_country": "USA",
    "customer_tax_id": "TAX-123456",
    "invoice_date": "2025-01-15",
    "due_date": "2025-02-14",
    "paid_date": "2025-01-20",
    "subtotal": 10000.00,
    "tax_amount": 1800.00,
    "discount_amount": 500.00,
    "shipping_amount": 200.00,
    "total_amount": 11500.00,
    "paid_amount": 11500.00,
    "balance_amount": 0.00,
    "currency": "INR",
    "items": [
      {
        "id": "1",
        "item_name": "Web Development Service",
        "description": "Custom website development",
        "quantity": 1,
        "unit_price": 10000.00,
        "tax_rate": 18,
        "discount": 5,
        "line_total": 10000.00,
        "tax_amount": 1710.00,
        "total_amount": 11710.00
      }
    ],
    "payment_method": "BANK_TRANSFER",
    "payment_reference": "TXN-20250120-001",
    "payment_notes": "Payment received via bank transfer",
    "notes": "Thank you for your business",
    "terms": "Net 30",
    "po_number": "PO-2025-001",
    "reference_number": "REF-2025-001",
    "order_id": "123",
    "project_id": "456",
    "is_recurring": false,
    "created_by": "112",
    "created_by_name": "John Doe",
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-20T14:30:00.000Z"
  }
]
```

**Response** (200 OK) - Paginated Format:
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "101",
        "invoice_number": "INV-202501-ABC123",
        "invoice_type": "SALES",
        "status": "PAID",
        "customer_name": "Acme Corporation",
        "total_amount": 11500.00,
        "currency": "INR",
        "invoice_date": "2025-01-15",
        "due_date": "2025-02-14"
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

## 2. Get Invoice by ID

**Endpoint**: `GET /invoices/:id`

**Description**: Retrieves detailed information about a specific invoice.

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/invoices/101" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "invoice_code": "INV-2025-001",
      "invoice_type": "SALES",
      "status": "PAID",
      "customer_id": "45",
      "customer_name": "Acme Corporation",
      "customer_email": "billing@acme.com",
      "customer_phone": "+1-555-0123",
      "customer_address": "123 Business St",
      "customer_city": "New York",
      "customer_state": "NY",
      "customer_postal_code": "10001",
      "customer_country": "USA",
      "customer_tax_id": "TAX-123456",
      "invoice_date": "2025-01-15",
      "due_date": "2025-02-14",
      "paid_date": "2025-01-20",
      "subtotal": 10000.00,
      "tax_amount": 1800.00,
      "discount_amount": 500.00,
      "shipping_amount": 200.00,
      "total_amount": 11500.00,
      "paid_amount": 11500.00,
      "balance_amount": 0.00,
      "currency": "INR",
      "items": [
        {
          "id": "1",
          "item_name": "Web Development Service",
          "description": "Custom website development",
          "quantity": 1,
          "unit_price": 10000.00,
          "tax_rate": 18,
          "discount": 5,
          "line_total": 10000.00,
          "tax_amount": 1710.00,
          "total_amount": 11710.00
        }
      ],
      "payment_method": "BANK_TRANSFER",
      "payment_reference": "TXN-20250120-001",
      "payment_notes": "Payment received via bank transfer",
      "notes": "Thank you for your business",
      "terms": "Net 30",
      "po_number": "PO-2025-001",
      "reference_number": "REF-2025-001",
      "order_id": "123",
      "project_id": "456",
      "is_recurring": false,
      "created_by": "112",
      "created_by_name": "John Doe",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-20T14:30:00.000Z"
    }
  }
}
```

---

## 3. Create Invoice

**Endpoint**: `POST /invoices`

**Description**: Creates a new invoice.

**Request Body**:
```json
{
  "invoice_number": "INV-202501-ABC123",
  "invoice_type": "SALES",
  "status": "DRAFT",
  "customer_id": "45",
  "customer_name": "Acme Corporation",
  "customer_email": "billing@acme.com",
  "customer_phone": "+1-555-0123",
  "customer_address": "123 Business St",
  "customer_city": "New York",
  "customer_state": "NY",
  "customer_postal_code": "10001",
  "customer_country": "USA",
  "customer_tax_id": "TAX-123456",
  "invoice_date": "2025-01-15",
  "due_date": "2025-02-14",
  "items": [
    {
      "item_name": "Web Development Service",
      "description": "Custom website development",
      "quantity": 1,
      "unit_price": 10000.00,
      "tax_rate": 18,
      "discount": 5
    },
    {
      "item_name": "Hosting Service",
      "description": "Monthly hosting",
      "quantity": 12,
      "unit_price": 500.00,
      "tax_rate": 18,
      "discount": 0
    }
  ],
  "subtotal": 16000.00,
  "tax_amount": 2880.00,
  "discount_amount": 500.00,
  "shipping_amount": 200.00,
  "total_amount": 18580.00,
  "currency": "INR",
  "notes": "Thank you for your business",
  "terms": "Net 30",
  "po_number": "PO-2025-001",
  "reference_number": "REF-2025-001",
  "order_id": "123",
  "project_id": "456"
}
```

**cURL Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/invoices" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "invoice_number": "INV-202501-ABC123",
    "invoice_type": "SALES",
    "status": "DRAFT",
    "customer_id": "45",
    "customer_name": "Acme Corporation",
    "customer_email": "billing@acme.com",
    "customer_phone": "+1-555-0123",
    "invoice_date": "2025-01-15",
    "due_date": "2025-02-14",
    "items": [
      {
        "item_name": "Web Development Service",
        "description": "Custom website development",
        "quantity": 1,
        "unit_price": 10000.00,
        "tax_rate": 18,
        "discount": 5
      }
    ],
    "subtotal": 10000.00,
    "tax_amount": 1710.00,
    "discount_amount": 500.00,
    "total_amount": 11210.00,
    "currency": "INR",
    "notes": "Thank you for your business",
    "terms": "Net 30"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "invoice_code": "INV-2025-001",
      "invoice_type": "SALES",
      "status": "DRAFT",
      "customer_id": "45",
      "customer_name": "Acme Corporation",
      "customer_email": "billing@acme.com",
      "customer_phone": "+1-555-0123",
      "invoice_date": "2025-01-15",
      "due_date": "2025-02-14",
      "subtotal": 10000.00,
      "tax_amount": 1710.00,
      "discount_amount": 500.00,
      "total_amount": 11210.00,
      "currency": "INR",
      "items": [
        {
          "id": "1",
          "item_name": "Web Development Service",
          "description": "Custom website development",
          "quantity": 1,
          "unit_price": 10000.00,
          "tax_rate": 18,
          "discount": 5,
          "line_total": 10000.00,
          "tax_amount": 1710.00,
          "total_amount": 11210.00
        }
      ],
      "notes": "Thank you for your business",
      "terms": "Net 30",
      "created_by": "112",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

---

## 4. Update Invoice

**Endpoint**: `PATCH /invoices/:id`

**Description**: Updates an existing invoice. Only provided fields will be updated.

**Request Body** (all fields optional):
```json
{
  "status": "SENT",
  "customer_email": "newemail@acme.com",
  "due_date": "2025-03-14",
  "items": [
    {
      "item_name": "Updated Service",
      "quantity": 2,
      "unit_price": 12000.00,
      "tax_rate": 18,
      "discount": 10
    }
  ],
  "notes": "Updated notes",
  "terms": "Net 45"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:3000/api/v1/invoices/101" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "status": "SENT",
    "due_date": "2025-03-14",
    "notes": "Updated notes"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "status": "SENT",
      "due_date": "2025-03-14",
      "notes": "Updated notes",
      "updated_at": "2025-01-16T09:00:00.000Z"
    }
  }
}
```

---

## 5. Delete Invoice

**Endpoint**: `DELETE /invoices/:id`

**Description**: Deletes an invoice. Only invoices with status DRAFT or CANCELLED can be deleted.

**cURL Request**:
```bash
curl -X DELETE "http://localhost:3000/api/v1/invoices/101" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

---

## 6. Send Invoice

**Endpoint**: `POST /invoices/:id/send`

**Description**: Marks an invoice as sent and optionally sends it via email to the customer.

**cURL Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/invoices/101/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "status": "SENT",
      "updated_at": "2025-01-16T10:00:00.000Z"
    }
  },
  "message": "Invoice sent successfully"
}
```

---

## 7. Mark Invoice as Paid

**Endpoint**: `POST /invoices/:id/pay`

**Description**: Records a payment for an invoice. Can be used for full or partial payments.

**Request Body**:
```json
{
  "payment_amount": 11500.00,
  "payment_method": "BANK_TRANSFER",
  "payment_reference": "TXN-20250120-001",
  "payment_date": "2025-01-20",
  "notes": "Payment received via bank transfer"
}
```

**cURL Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/invoices/101/pay" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "payment_amount": 11500.00,
    "payment_method": "BANK_TRANSFER",
    "payment_reference": "TXN-20250120-001",
    "payment_date": "2025-01-20",
    "notes": "Payment received via bank transfer"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "status": "PAID",
      "paid_amount": 11500.00,
      "balance_amount": 0.00,
      "paid_date": "2025-01-20",
      "payment_method": "BANK_TRANSFER",
      "payment_reference": "TXN-20250120-001",
      "updated_at": "2025-01-20T14:30:00.000Z"
    }
  },
  "message": "Payment recorded successfully"
}
```

**Partial Payment Example**:
```bash
curl -X POST "http://localhost:3000/api/v1/invoices/101/pay" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "payment_amount": 5000.00,
    "payment_method": "CREDIT_CARD",
    "payment_reference": "CC-20250120-001",
    "payment_date": "2025-01-20",
    "notes": "Partial payment"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "status": "PARTIALLY_PAID",
      "paid_amount": 5000.00,
      "balance_amount": 6500.00,
      "payment_method": "CREDIT_CARD",
      "updated_at": "2025-01-20T14:30:00.000Z"
    }
  },
  "message": "Partial payment recorded successfully"
}
```

---

## 8. Download Invoice PDF

**Endpoint**: `GET /invoices/:id/download`

**Description**: Downloads the invoice as a PDF file. The backend MUST generate a professional, company-branded PDF invoice.

**CRITICAL REQUIREMENTS**:
1. The backend MUST return a **valid PDF file** (not JSON, not HTML, not empty)
2. The backend MUST set `Content-Type: application/pdf` header
3. The backend MUST include `Content-Disposition: attachment; filename="invoice-<number>.pdf"` header
4. The PDF MUST start with `%PDF` magic bytes
5. The PDF MUST be readable by standard PDF viewers (Adobe Reader, Chrome, etc.)

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/invoices/101/download" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: */*" \
  --output invoice.pdf
```

**Response** (200 OK):
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="invoice-INV-202501-ABC123.pdf"`
- **Body**: Valid PDF binary content

**PDF Requirements**:

**Layout & Structure:**
1. **Header Section** (Top of page):
   - Company logo (centered or left-aligned)
   - Company name and address
   - "INVOICE" title prominently displayed
   - Invoice number: `{invoice_number}` (and `{invoice_code}` if available)
   - Format: "Invoice #: {invoice_number} ({invoice_code})" if both exist

2. **Invoice Details Section** (Left column or top section):
   - **Invoice Date**: `{invoice_date}` (formatted as MM/DD/YYYY)
   - **Due Date**: `{due_date}` (formatted as MM/DD/YYYY)
   - **Status**: `{status}` (DRAFT, PENDING, SENT, PAID, etc.)
   - **Type**: `{invoice_type}` (SALES, PURCHASE, SERVICE, PRODUCT, RECURRING)
   - **Project**: `{project_id}` (if available, show project name/code)
   - **PO Number**: `{po_number}` (if available)
   - **Reference Number**: `{reference_number}` (if available)

3. **Bill To Section** (Right column or below invoice details):
   - **Customer Name**: `{customer_name}`
   - **Address**: `{customer_address}` (if available)
   - **City, State, Postal Code**: `{customer_city}, {customer_state}, {customer_postal_code}`
   - **Country**: `{customer_country}`
   - **Email**: `{customer_email}` (if available)
   - **Phone**: `{customer_phone}` (if available)
   - **Tax ID/GSTIN**: `{customer_tax_id}` (if available, label as "GSTIN:" or "Tax ID:")

4. **Items Table** (Main section):
   - **Table Headers**: Item | Qty | Unit Price | Tax % | Total
   - **For each item in `{items}` array**:
     - Item name: `{item.item_name}`
     - Description: `{item.description}` (if available, below item name)
     - Quantity: `{item.quantity}` (formatted with 2 decimal places)
     - Unit Price: `{currency} {item.unit_price}` (formatted with 2 decimal places, e.g., "INR 1,970.00")
     - Tax %: `{item.tax_rate}%` (if available)
     - Total: `{currency} {item.total_amount}` (formatted with 2 decimal places)
   - **Items Summary** (below table):
     - List all item names
     - Total Items: Count of items
     - Total Quantity: Sum of all quantities

5. **Amount Summary Section** (Right side or bottom):
   - **Subtotal**: `{currency} {subtotal}` (formatted with 2 decimal places)
   - **Discount**: `{currency} {discount_amount}` (if `discount_amount > 0`, show with minus sign)
   - **Tax**: `{currency} {tax_amount}` (formatted with 2 decimal places)
   - **Shipping**: `{currency} {shipping_amount}` (if `shipping_amount > 0`)
   - **Total Amount**: `{currency} {total_amount}` (formatted with 2 decimal places, bold/larger font)
   - **Paid Amount**: `{currency} {paid_amount}` (if `paid_amount > 0`)
   - **Balance Amount**: `{currency} {balance_amount}` (if `balance_amount > 0`)

6. **Notes & Terms Section** (Bottom):
   - **Notes**: `{notes}` (if available)
   - **Payment Terms**: `{terms}` (if available)

**Design Requirements:**
- **Professional Layout**: Use a clean, modern design with proper spacing
- **Typography**: Use readable fonts (Arial, Helvetica, or similar sans-serif)
- **Colors**: Use black text on white background for printing
- **Borders**: Use subtle borders/separators between sections
- **Alignment**: Left-align text, right-align numbers
- **Currency Formatting**: Format all amounts with 2 decimal places and thousand separators (e.g., "INR 1,970.00")
- **Date Formatting**: Use MM/DD/YYYY format (e.g., "12/11/2025")
- **Page Numbers**: Include page numbers if invoice spans multiple pages
- **Margins**: Use standard margins (0.5-1 inch) for printing
- **Table Styling**: Use alternating row colors or clear borders for readability

**Common Design Issues to Avoid:**
1. ❌ Missing fields (PO Number, Reference Number, Project, etc.)
2. ❌ Incorrect currency formatting (missing decimals, no thousand separators)
3. ❌ Poor alignment (numbers not right-aligned)
4. ❌ Missing borders/separators between sections
5. ❌ Overlapping text or sections
6. ❌ Incorrect date formatting
7. ❌ Missing item descriptions or details
8. ❌ Amount calculations not matching (subtotal + tax - discount + shipping should equal total)
9. ❌ Poor spacing or cramped layout
10. ❌ Missing company logo or branding

**Example PDF Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]  Company Name                                    │
│          123 Business St, City, State, ZIP               │
│                                                          │
│                    INVOICE                               │
│          Invoice #: INV-202512-DX55A5                    │
│                                                          │
├──────────────────────┬──────────────────────────────────┤
│ Invoice Details:     │ Bill To:                         │
│ Date: 12/11/2025      │ Customer Name                     │
│ Due: 12/18/2025      │ Address                          │
│ Status: DRAFT         │ City, State, ZIP                 │
│ Type: SALES          │ Country                          │
│ Project: Project Name │ Email: customer@example.com      │
│ PO #: PO-123         │ Phone: +1-555-0123               │
│                      │ GSTIN: 29GST0000003Z5            │
├──────────────────────┴──────────────────────────────────┤
│ Items Table:                                             │
│ ┌──────────┬──────┬───────────┬───────┬──────────┐    │
│ │ Item     │ Qty  │ Unit Price│ Tax % │ Total    │    │
│ ├──────────┼──────┼───────────┼───────┼──────────┤    │
│ │ Item 1   │  1   │ INR 1,970 │  18%  │ INR 2,325│    │
│ └──────────┴──────┴───────────┴───────┴──────────┘    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Amount Summary:                                          │
│ Subtotal:        INR 1,970.00                           │
│ Tax:             INR 354.60                             │
│ Shipping:        INR 46.00                              │
│ ─────────────────────────────────────                  │
│ Total Amount:    INR 2,370.60                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Notes & Terms:                                           │
│ Notes: Payment terms and additional information         │
│ Payment Terms: Net 30                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Field Descriptions

### Invoice Object

#### Basic Information
- `id`: string (required) - Unique invoice identifier
- `invoice_number`: string (required) - Human-readable invoice number (e.g., "INV-202501-ABC123")
- `invoice_code`: string (optional) - Auto-generated invoice code (e.g., "INV-2025-001")
- `invoice_type`: InvoiceType (required) - Type of invoice (`SALES`, `PURCHASE`, `SERVICE`, `PRODUCT`, `RECURRING`)
- `status`: InvoiceStatus (required) - Current status (`DRAFT`, `PENDING`, `SENT`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED`, `REFUNDED`)

#### Customer Information
- `customer_id`: string (optional) - ID of the customer from CRM module
- `customer_name`: string (required) - Customer's full name or company name
- `customer_email`: string (optional) - Customer's email address
- `customer_phone`: string (optional) - Customer's phone number
- `customer_address`: string (optional) - Customer's street address
- `customer_city`: string (optional) - Customer's city
- `customer_state`: string (optional) - Customer's state/province
- `customer_postal_code`: string (optional) - Customer's postal/ZIP code
- `customer_country`: string (optional) - Customer's country
- `customer_tax_id`: string (optional) - Customer's tax identification number

#### Invoice Dates
- `invoice_date`: string (required) - Date when invoice was created (ISO 8601 date format: YYYY-MM-DD)
- `due_date`: string (required) - Date when payment is due (ISO 8601 date format: YYYY-MM-DD)
- `paid_date`: string (optional) - Date when invoice was fully paid (ISO 8601 date format: YYYY-MM-DD)

#### Financial Information
- `subtotal`: number (required) - Sum of all line items before tax and discounts
- `tax_amount`: number (required) - Total tax amount
- `discount_amount`: number (optional) - Total discount amount
- `shipping_amount`: number (optional) - Shipping/handling charges
- `total_amount`: number (required) - Final total amount (subtotal - discount + tax + shipping)
- `paid_amount`: number (optional) - Amount paid so far
- `balance_amount`: number (optional) - Remaining balance (total_amount - paid_amount)
- `currency`: string (required) - Currency code (e.g., "INR", "USD", "EUR")

#### Invoice Items
- `items`: InvoiceItem[] (required) - Array of invoice line items
  - `id`: string (optional) - Item identifier
  - `item_name`: string (required) - Name/description of the item
  - `description`: string (optional) - Detailed description
  - `quantity`: number (required) - Quantity ordered
  - `unit_price`: number (required) - Price per unit
  - `tax_rate`: number (optional) - Tax rate percentage (e.g., 18 for 18%)
  - `discount`: number (optional) - Discount percentage (e.g., 5 for 5%)
  - `line_total`: number (required) - Line subtotal (quantity × unit_price)
  - `tax_amount`: number (optional) - Tax amount for this line
  - `total_amount`: number (required) - Line total including tax and discount

#### Payment Information
- `payment_method`: PaymentMethod (optional) - Method of payment (`CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `DEBIT_CARD`, `CHEQUE`, `ONLINE_PAYMENT`, `OTHER`)
- `payment_reference`: string (optional) - Payment transaction reference number
- `payment_notes`: string (optional) - Additional payment notes

#### Additional Information
- `notes`: string (optional) - General notes or comments
- `terms`: string (optional) - Payment terms (e.g., "Net 30", "Due on receipt")
- `po_number`: string (optional) - Purchase Order number
- `reference_number`: string (optional) - Reference number for tracking

#### Related Entities
- `order_id`: string (optional) - Related sales order ID
- `project_id`: string (optional) - Related project ID
- `quote_id`: string (optional) - Related quote ID

#### Recurring Invoice
- `is_recurring`: boolean (optional) - Whether this is a recurring invoice
- `recurring_frequency`: string (optional) - Frequency (`DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`)
- `recurring_end_date`: string (optional) - End date for recurring invoices (ISO 8601 date format)

#### Metadata
- `created_by`: string (optional) - User ID who created the invoice
- `created_by_name`: string (optional) - Name of user who created the invoice
- `updated_by`: string (optional) - User ID who last updated the invoice
- `created_at`: string (required) - Creation timestamp (ISO 8601)
- `updated_at`: string (required) - Last update timestamp (ISO 8601)

---

## Invoice Status Flow

```
DRAFT → PENDING → SENT → PAID
                ↓
            OVERDUE
                ↓
            PARTIALLY_PAID → PAID
                ↓
            CANCELLED
                ↓
            REFUNDED
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid invoice data or missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Invoice not found"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid invoice data",
  "errors": {
    "invoice_number": ["Invoice number is required"],
    "customer_name": ["Customer name is required"],
    "items": ["At least one item is required"]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to process invoice"
}
```

---

## Example: Complete Invoice Creation Flow

### Step 1: Create Invoice
```bash
curl -X POST "http://localhost:3000/api/v1/invoices" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "invoice_number": "INV-202501-ABC123",
    "invoice_type": "SALES",
    "status": "DRAFT",
    "customer_id": "45",
    "customer_name": "Acme Corporation",
    "customer_email": "billing@acme.com",
    "customer_phone": "+1-555-0123",
    "customer_address": "123 Business St",
    "customer_city": "New York",
    "customer_state": "NY",
    "customer_postal_code": "10001",
    "customer_country": "USA",
    "invoice_date": "2025-01-15",
    "due_date": "2025-02-14",
    "items": [
      {
        "item_name": "Web Development Service",
        "description": "Custom website development",
        "quantity": 1,
        "unit_price": 10000.00,
        "tax_rate": 18,
        "discount": 5
      }
    ],
    "subtotal": 10000.00,
    "tax_amount": 1710.00,
    "discount_amount": 500.00,
    "total_amount": 11210.00,
    "currency": "INR",
    "notes": "Thank you for your business",
    "terms": "Net 30"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "invoice_number": "INV-202501-ABC123",
      "status": "DRAFT",
      "total_amount": 11210.00,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Step 2: Send Invoice
```bash
curl -X POST "http://localhost:3000/api/v1/invoices/101/send" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "status": "SENT",
      "updated_at": "2025-01-15T10:05:00.000Z"
    }
  },
  "message": "Invoice sent successfully"
}
```

### Step 3: Record Payment
```bash
curl -X POST "http://localhost:3000/api/v1/invoices/101/pay" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "payment_amount": 11210.00,
    "payment_method": "BANK_TRANSFER",
    "payment_reference": "TXN-20250120-001",
    "payment_date": "2025-01-20",
    "notes": "Payment received"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "101",
      "status": "PAID",
      "paid_amount": 11210.00,
      "balance_amount": 0.00,
      "paid_date": "2025-01-20",
      "updated_at": "2025-01-20T14:30:00.000Z"
    }
  },
  "message": "Payment recorded successfully"
}
```

### Step 4: Download Invoice PDF
```bash
curl -X GET "http://localhost:3000/api/v1/invoices/101/download" \
  -H "Authorization: Bearer <token>" \
  --output invoice-INV-202501-ABC123.pdf
```

---

## Database Schema Recommendations

### invoices Table
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_code VARCHAR(50),
  invoice_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_country VARCHAR(100),
  customer_tax_id VARCHAR(50),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  shipping_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  balance_amount DECIMAL(15, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  payment_method VARCHAR(20),
  payment_reference VARCHAR(100),
  payment_notes TEXT,
  notes TEXT,
  terms TEXT,
  po_number VARCHAR(100),
  reference_number VARCHAR(100),
  order_id INTEGER,
  project_id INTEGER,
  quote_id INTEGER,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20),
  recurring_end_date DATE,
  created_by INTEGER REFERENCES users(id),
  -- Note: updated_by column may not exist in your database
  -- If it doesn't exist, remove it from SELECT queries or add it to the table
  -- updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**IMPORTANT**: If your database doesn't have the `updated_by` column, you have two options:

1. **Add the column** (recommended):
```sql
ALTER TABLE invoices ADD COLUMN updated_by INTEGER REFERENCES users(id);
```

2. **Remove from SELECT queries**: If you don't want to add the column, remove `i.updated_by` or `invoices.updated_by` from your backend SELECT queries.

### invoice_items Table
```sql
CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  line_total DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend SQL Query Fix

**CRITICAL ERROR FIX**: If you're getting an error `column i.updated_by does not exist`, you need to fix your backend SQL query.

### Error Message:
```
error: column i.updated_by does not exist
```

### Solution Options:

#### Option 1: Add the column to your database (Recommended)
```sql
ALTER TABLE invoices ADD COLUMN updated_by INTEGER REFERENCES users(id);
```

#### Option 2: Remove from SELECT query
If you don't want to add the column, update your backend SQL query to exclude `updated_by`:

**Before (causing error)**:
```sql
SELECT 
  i.id,
  i.invoice_number,
  i.updated_by,  -- This column doesn't exist!
  i.created_by,
  i.created_at,
  i.updated_at
FROM invoices i
```

**After (fixed)**:
```sql
SELECT 
  i.id,
  i.invoice_number,
  -- i.updated_by,  -- Removed if column doesn't exist
  i.created_by,
  i.created_at,
  i.updated_at
FROM invoices i
```

#### Option 3: Use COALESCE to handle missing columns
```sql
SELECT 
  i.id,
  i.invoice_number,
  COALESCE(i.updated_by, NULL) as updated_by,  -- Returns NULL if column doesn't exist
  i.created_by,
  i.created_at,
  i.updated_at
FROM invoices i
```

**Note**: The frontend will handle `updated_by` being `null` or `undefined` gracefully, so it's safe to exclude it from the query if the column doesn't exist.

## Notes for Backend Implementation

1. **Invoice Number Generation**: If `invoice_number` is not provided, backend should auto-generate a unique invoice number following a pattern like `INV-YYYYMM-XXXXXX`.

2. **Calculations**: Backend should validate that:
   - `subtotal` = sum of all `line_total` values
   - `tax_amount` = sum of all `tax_amount` values from items
   - `total_amount` = `subtotal` - `discount_amount` + `tax_amount` + `shipping_amount`
   - `balance_amount` = `total_amount` - `paid_amount`

3. **Status Updates**: 
   - When payment is recorded, automatically update status:
     - If `paid_amount` >= `total_amount`: status = `PAID`
     - If `paid_amount` > 0 and < `total_amount`: status = `PARTIALLY_PAID`
   - Check `due_date` and update status to `OVERDUE` if past due and not paid

4. **PDF Generation**: Use proper PDF libraries (PDFKit, jsPDF, reportlab, etc.) to generate valid PDF files with company branding.

5. **Email Integration**: When sending invoice, optionally send email to customer with PDF attachment.

6. **Validation**: Ensure all required fields are present and data types are correct before saving.

7. **Permissions**: Implement role-based access control:
   - Only authorized users can create/edit invoices
   - Only finance/admin users can mark invoices as paid
   - Users can only view invoices they created or have permission for

