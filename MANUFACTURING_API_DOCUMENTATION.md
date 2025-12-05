# Manufacturing Module - Backend API Documentation

Complete API specification for integrating the Manufacturing module with Node.js backend.

---

## 📦 Overview

The Manufacturing module manages Production Orders with full CRUD operations, status workflow, progress tracking, and quality control.

---

## 🎯 API Endpoints

### **1. List Production Orders**

```bash
GET /api/v1/manufacturing/production-orders
```

#### Query Parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number | `1` |
| `limit` | number | Items per page | `100` |
| `status` | string | Filter by status | `IN_PROGRESS` |
| `priority` | string | Filter by priority | `HIGH` |
| `from_date` | string | Start date (YYYY-MM-DD) | `2025-01-01` |
| `to_date` | string | End date (YYYY-MM-DD) | `2025-12-31` |

#### Request Example:

```bash
curl 'http://localhost:3000/api/v1/manufacturing/production-orders?page=1&limit=100' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json'
```

#### Response Example (200 OK):

```json
{
  "success": true,
  "data": {
    "production_orders": [
      {
        "id": 102,
        "po_number": "MFG-PO-100",
        "production_order_number": "MO-2025-001",
        "work_order_number": "WO-2025-001",
        "reference_number": "REF-001",
        "product_id": 109,
        "product_name": "Industrial Pump",
        "product_code": "IP-500",
        "quantity_to_produce": 200,
        "quantity_produced": 0,
        "unit": "Units",
        "start_date": "2025-08-24T18:30:00.000Z",
        "expected_completion_date": "2025-12-05T18:30:00.000Z",
        "actual_completion_date": null,
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "production_type": "MAKE_TO_STOCK",
        "estimated_cost": "50000.00",
        "cost": "0.00",
        "currency": "INR",
        "production_line": "Line-0",
        "shift": "DAY",
        "supervisor_id": 106,
        "quality_status": "OK",
        "notes": "Seed production order 100",
        "created_by": 109,
        "created_at": "2025-12-03T05:15:53.869Z",
        "updated_at": "2025-12-03T05:15:53.869Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 100,
      "items_per_page": 100,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### **2. Create Production Order**

```bash
POST /api/v1/manufacturing/production-orders
```

#### Request Body (Essential Fields Only):

```json
{
  "production_order_number": "MO-2025-006",
  "work_order_number": "WO-2025-006",
  "reference_number": "REF-006",
  "product_name": "Industrial Pump",
  "product_code": "IP-500",
  "planned_qty": 100,
  "unit": "Units",
  "start_date": "2025-01-20",
  "end_date": "2025-02-20",
  "status": "DRAFT",
  "priority": "MEDIUM",
  "production_type": "MAKE_TO_STOCK",
  "estimated_cost": 50000,
  "cost": 0,
  "currency": "INR",
  "notes": "Production order notes"
}
```

**Note:** `product_id` is OPTIONAL. If not provided, backend should handle gracefully.

#### Request Example:

```bash
curl -X POST 'http://localhost:3000/api/v1/manufacturing/production-orders' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "production_order_number": "MO-2025-TEST",
    "product_name": "Test Product",
    "planned_qty": 100,
    "unit": "Units",
    "start_date": "2025-01-20",
    "end_date": "2025-02-20",
    "status": "DRAFT",
    "priority": "MEDIUM",
    "production_type": "MAKE_TO_STOCK",
    "estimated_cost": 10000,
    "cost": 0,
    "currency": "INR"
  }'
```

#### Response Example (201 Created):

```json
{
  "success": true,
  "data": {
    "id": 103,
    "production_order_number": "MO-2025-TEST",
    "product_name": "Test Product",
    "status": "DRAFT",
    "created_at": "2025-01-20T10:00:00Z",
    ...
  },
  "message": "Production order created successfully"
}
```

---

### **3. Update Production Order**

```bash
PUT /api/v1/manufacturing/production-orders/:id
```

#### Request Body (Partial Update):

```json
{
  "status": "IN_PROGRESS",
  "quantity_produced": 50,
  "notes": "Production started"
}
```

#### Request Example:

```bash
curl -X PUT 'http://localhost:3000/api/v1/manufacturing/production-orders/102' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "IN_PROGRESS",
    "notes": "Production started"
  }'
```

---

### **4. Delete Production Order**

```bash
DELETE /api/v1/manufacturing/production-orders/:id
```

#### Request Example:

```bash
curl -X DELETE 'http://localhost:3000/api/v1/manufacturing/production-orders/102' \
  -H 'Authorization: Bearer {JWT_TOKEN}'
```

---

## 📋 Essential Fields for Frontend Form

### **Required Fields (Must be in form):**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `production_order_number` | string | Unique MO number | "MO-2025-001" |
| `product_name` | string | Product name | "Industrial Pump" |
| `planned_qty` | number | Quantity to produce | 100 |
| `unit` | string | Unit of measure | "Units", "Pcs", "Kg" |
| `start_date` | date | Production start date | "2025-01-20" |
| `end_date` | date | Expected completion | "2025-02-20" |
| `status` | enum | Order status | "DRAFT" |
| `priority` | enum | Priority level | "MEDIUM" |
| `production_type` | enum | Production type | "MAKE_TO_STOCK" |
| `estimated_cost` | number | Estimated cost | 50000 |
| `currency` | enum | Currency code | "INR" |

### **Optional Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `work_order_number` | string | Work order reference |
| `reference_number` | string | External reference |
| `product_code` | string | Product SKU/code |
| `product_id` | number | Product ID (if exists) |
| `cost` | number | Actual cost (default: 0) |
| `notes` | text | Additional notes |

---

## 💾 Database Schema (PostgreSQL)

```sql
CREATE TABLE production_orders (
  id SERIAL PRIMARY KEY,
  
  -- Order Identification
  production_order_number VARCHAR(50) UNIQUE NOT NULL,
  po_number VARCHAR(50),  -- Alternative field name
  work_order_number VARCHAR(50),
  reference_number VARCHAR(50),
  sales_order_number VARCHAR(50),
  
  -- Product Information
  product_id INTEGER,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  product_description TEXT,
  bom_number VARCHAR(50),
  bom_version VARCHAR(20),
  
  -- Quantity & Units
  planned_qty INTEGER NOT NULL,
  quantity_to_produce INTEGER,  -- Alternative field name
  produced_qty INTEGER DEFAULT 0,
  quantity_produced INTEGER DEFAULT 0,  -- Alternative field name
  good_qty INTEGER DEFAULT 0,
  scrap_qty INTEGER DEFAULT 0,
  rework_qty INTEGER DEFAULT 0,
  pending_qty INTEGER,
  unit VARCHAR(20) NOT NULL DEFAULT 'Units',
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  expected_completion_date DATE,  -- Alternative field name
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  actual_completion_date DATE,  -- Alternative field name
  
  -- Status & Priority
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  production_type VARCHAR(30) NOT NULL DEFAULT 'MAKE_TO_STOCK',
  
  -- Cost & Financial
  estimated_cost DECIMAL(15, 2) DEFAULT 0,
  actual_cost DECIMAL(15, 2) DEFAULT 0,
  material_cost DECIMAL(15, 2) DEFAULT 0,
  labor_cost DECIMAL(15, 2) DEFAULT 0,
  overhead_cost DECIMAL(15, 2) DEFAULT 0,
  cost DECIMAL(15, 2) DEFAULT 0,
  total_cost DECIMAL(15, 2) DEFAULT 0,  -- Alternative field name
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Production Details
  batch_number VARCHAR(50),
  lot_number VARCHAR(50),
  shift VARCHAR(20),
  production_line VARCHAR(50),
  work_center VARCHAR(50),
  machine_id VARCHAR(50),
  
  -- Progress & Efficiency
  progress_percentage DECIMAL(5, 2),
  completion_percentage DECIMAL(5, 2),
  efficiency_percentage DECIMAL(5, 2),
  yield_percentage DECIMAL(5, 2),
  
  -- Time Tracking
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  
  -- People
  supervisor_id INTEGER,
  supervisor_name VARCHAR(100),
  
  -- Quality
  quality_check_required BOOLEAN DEFAULT FALSE,
  quality_status VARCHAR(20),
  inspected_by VARCHAR(100),
  inspection_date DATE,
  
  -- Customer & Project
  customer_id INTEGER,
  customer_name VARCHAR(255),
  project_id INTEGER,
  department VARCHAR(100),
  
  -- Additional
  description TEXT,
  notes TEXT,
  special_instructions TEXT,
  tags TEXT[],
  
  -- Meta
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_status CHECK (status IN ('DRAFT', 'PLANNED', 'SCHEDULED', 'RELEASED', 'IN_PROGRESS', 'ON_HOLD', 'PAUSED', 'COMPLETED', 'CANCELLED', 'CLOSED')),
  CONSTRAINT check_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  CONSTRAINT check_production_type CHECK (production_type IN ('MAKE_TO_STOCK', 'MAKE_TO_ORDER', 'ASSEMBLY', 'BATCH', 'CONTINUOUS', 'JOB_SHOP'))
);

-- Indexes
CREATE INDEX idx_production_order_number ON production_orders(production_order_number);
CREATE INDEX idx_po_number ON production_orders(po_number);
CREATE INDEX idx_production_status ON production_orders(status);
CREATE INDEX idx_production_priority ON production_orders(priority);
CREATE INDEX idx_production_dates ON production_orders(start_date, end_date);
CREATE INDEX idx_production_product ON production_orders(product_id);

-- Update trigger
CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON production_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 Node.js Backend Implementation

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// POST /api/v1/manufacturing/production-orders
router.post('/production-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      production_order_number,
      work_order_number,
      reference_number,
      product_name,
      product_code,
      product_id,  // OPTIONAL - handle null gracefully
      planned_qty,
      unit,
      start_date,
      end_date,
      status,
      priority,
      production_type,
      estimated_cost,
      cost,
      currency,
      notes
    } = req.body;

    // Validate required fields
    if (!production_order_number || !product_name || !planned_qty || !unit || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const query = `
      INSERT INTO production_orders (
        production_order_number,
        work_order_number,
        reference_number,
        product_id,
        product_name,
        product_code,
        planned_qty,
        quantity_to_produce,
        unit,
        start_date,
        end_date,
        expected_completion_date,
        status,
        priority,
        production_type,
        estimated_cost,
        cost,
        currency,
        notes,
        created_by,
        pending_qty
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10, $10, $11, $12, $13, $14, $15, $16, $17, $18, $7)
      RETURNING *
    `;

    const values = [
      production_order_number,
      work_order_number || null,
      reference_number || null,
      product_id || null,  // NULL is OK
      product_name,
      product_code || null,
      planned_qty,
      unit,
      start_date,
      end_date,
      status || 'DRAFT',
      priority || 'MEDIUM',
      production_type || 'MAKE_TO_STOCK',
      estimated_cost || 0,
      cost || 0,
      currency || 'INR',
      notes || null,
      userId
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Production order created successfully'
    });

  } catch (error) {
    console.error('Error creating production order:', error);
    
    // Handle duplicate production order number
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Production order number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create production order',
      error: error.message
    });
  }
});

// GET /api/v1/manufacturing/production-orders
router.get('/production-orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 100, status, priority } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        po.*,
        po.planned_qty as quantity_to_produce,
        po.produced_qty as quantity_produced,
        po.end_date as expected_completion_date
      FROM production_orders po
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND po.status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND po.priority = $${paramIndex++}`;
      params.push(priority);
    }

    query += ` ORDER BY po.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM production_orders');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        production_orders: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching production orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production orders',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 📝 Simplified Frontend Form

Created: `src/features/manufacturing/components/SimpleProductionOrderForm.tsx`

### **Form Sections:**

1. **Basic Information** (3 fields)
   - Production Order Number (required)
   - Work Order Number
   - Reference Number

2. **Product Information** (3 fields)
   - Product Name (required)
   - Product Code
   - Product ID (optional - can be left empty)

3. **Quantity & Timeline** (5 fields)
   - Planned Quantity (required)
   - Unit (required)
   - Currency (required)
   - Start Date (required)
   - Expected End Date (required)

4. **Status & Classification** (3 fields)
   - Status (required)
   - Priority (required)
   - Production Type (required)

5. **Cost Information** (2 fields)
   - Estimated Cost (required)
   - Actual Cost (optional, default: 0)

6. **Additional Notes** (1 field)
   - Notes (optional)

**Total: 17 fields** (down from 80+ in the original form)

---

## 🎨 Form Features:

✅ **Clean, organized layout** with sections
✅ **Only essential fields** matching backend API
✅ **Product ID is optional** - can be left empty
✅ **Smart defaults** for all fields
✅ **Validation** on required fields
✅ **Helper text** for optional fields
✅ **Info banner** explaining simplified form

---

## ✅ Frontend Integration Complete

### Files Updated:
- ✅ `src/features/manufacturing/api/manufacturingApi.ts` - Backend API integration
- ✅ `src/features/manufacturing/components/ManufacturingList.tsx` - Uses simplified form
- ✅ `src/features/manufacturing/components/SimpleProductionOrderForm.tsx` - NEW simplified form

### What's Working:
- ✅ List production orders from backend
- ✅ Create production orders (product_id optional)
- ✅ Update production orders
- ✅ Delete production orders
- ✅ Field mapping handles multiple backend field names
- ✅ On Hold tab shows CANCELLED and ON_HOLD statuses
- ✅ Status badges with proper colors
- ✅ Null/undefined handling (no crashes)

---

## 🧪 Testing

### Test Create Production Order (without product_id):

```bash
curl -X POST 'http://localhost:3000/api/v1/manufacturing/production-orders' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "production_order_number": "MO-2025-TEST",
    "product_name": "Test Widget",
    "product_code": "TW-001",
    "planned_qty": 50,
    "unit": "Units",
    "start_date": "2025-01-20",
    "end_date": "2025-02-20",
    "status": "DRAFT",
    "priority": "MEDIUM",
    "production_type": "MAKE_TO_STOCK",
    "estimated_cost": 25000,
    "cost": 0,
    "currency": "INR",
    "notes": "Test production order"
  }'
```

✅ **Should work without product_id!**

---

## 📊 Backend Field Name Mapping

Your backend can use either naming convention - frontend handles both:

| Standard Name | Alternative Name | Frontend Handles |
|---------------|------------------|------------------|
| `production_order_number` | `po_number` | ✅ Both |
| `planned_qty` | `quantity_to_produce` | ✅ Both |
| `produced_qty` | `quantity_produced` | ✅ Both |
| `end_date` | `expected_completion_date` | ✅ Both |
| `actual_end_date` | `actual_completion_date` | ✅ Both |
| `cost` | `total_cost` | ✅ Both |
| `product_name` | `product` | ✅ Both |

---

**Status**: ✅ Manufacturing module fully integrated with simplified form!

The new form only shows essential fields and handles optional product_id gracefully! 🎉✨🚀

