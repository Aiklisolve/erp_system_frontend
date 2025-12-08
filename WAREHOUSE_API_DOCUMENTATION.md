# Warehouse Module API Documentation

## Base URL
```
http://localhost:3000/api/v1/warehouse
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. List Stock Movements

### GET `/warehouse/stock-movements`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)
- `movement_type` (optional): Filter by type (`TRANSFER`, `RECEIPT`, `SHIPMENT`, `ADJUSTMENT`, `RETURN`, `CYCLE_COUNT`)
- `status` (optional): Filter by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `from_location` (optional): Filter by source location
- `to_location` (optional): Filter by destination location
- `item_id` (optional): Filter by item ID
- `reference_number` (optional): Filter by reference number
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/warehouse/stock-movements?page=1&limit=100&movement_type=TRANSFER&status=COMPLETED' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock_movements": [
      {
        "id": "1",
        "movement_number": "MV-2025-ABC123",
        "item_id": "SKU-2005",
        "item_name": "Barcode Scanner",
        "item_sku": "SKU-2005",
        "movement_type": "TRANSFER",
        "status": "COMPLETED",
        "movement_date": "2025-01-04T00:00:00.000Z",
        "completed_date": "2025-01-04T00:00:00.000Z",
        "from_location": "WH-01-A",
        "from_zone": "STORAGE",
        "from_bin": "BIN-01",
        "to_location": "WH-01-B",
        "to_zone": "PICKING",
        "to_bin": "BIN-02",
        "quantity": 10,
        "unit": "pcs",
        "available_quantity": 50,
        "received_quantity": 10,
        "reference_number": "TRF-001",
        "reference_type": "TRANSFER_ORDER",
        "batch_number": null,
        "lot_number": null,
        "serial_numbers": null,
        "assigned_to": "John Doe",
        "operator_name": "John Doe",
        "supervisor": null,
        "quality_check_required": true,
        "quality_check_passed": true,
        "inspected_by": "Jane Smith",
        "inspection_date": "2025-01-04T00:00:00.000Z",
        "carrier": null,
        "tracking_number": null,
        "expected_arrival_date": null,
        "actual_arrival_date": null,
        "unit_cost": 25.50,
        "total_cost": 255.00,
        "currency": "INR",
        "reason": "Restocking picking area",
        "notes": "Standard transfer",
        "internal_notes": null,
        "tags": null,
        "created_at": "2025-01-04T10:30:00.000Z",
        "updated_at": "2025-01-04T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 100,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

## 2. Create Stock Movement

### POST `/warehouse/stock-movements`

**Request Payload:**
```json
{
  "movement_number": "MV-2025-ABC123",
  "item_id": "SKU-2005",
  "item_name": "Barcode Scanner",
  "item_sku": "SKU-2005",
  "movement_type": "TRANSFER",
  "status": "PENDING",
  "movement_date": "2025-01-10",
  "completed_date": null,
  "from_location": "WH-01-A",
  "from_zone": "STORAGE",
  "from_bin": "BIN-01",
  "to_location": "WH-01-B",
  "to_zone": "PICKING",
  "to_bin": "BIN-02",
  "quantity": 10,
  "unit": "pcs",
  "available_quantity": 50,
  "received_quantity": null,
  "reference_number": "TRF-001",
  "reference_type": "TRANSFER_ORDER",
  "batch_number": null,
  "lot_number": null,
  "serial_numbers": null,
  "assigned_to": "John Doe",
  "operator_name": "John Doe",
  "supervisor": null,
  "quality_check_required": true,
  "quality_check_passed": false,
  "inspected_by": null,
  "inspection_date": null,
  "carrier": null,
  "tracking_number": null,
  "expected_arrival_date": null,
  "actual_arrival_date": null,
  "unit_cost": 25.50,
  "total_cost": 255.00,
  "currency": "INR",
  "reason": "Restocking picking area",
  "notes": "Standard transfer",
  "internal_notes": null,
  "tags": null
}
```

**Required Fields:**
- `item_id` (string): Item identifier
- `movement_type` (string): One of `TRANSFER`, `RECEIPT`, `SHIPMENT`, `ADJUSTMENT`, `RETURN`, `CYCLE_COUNT`
- `status` (string): One of `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `movement_date` (string): Date in YYYY-MM-DD format
- `from_location` (string): Source location
- `to_location` (string): Destination location
- `quantity` (number): Movement quantity

**Optional Fields:**
- All other fields are optional

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/warehouse/stock-movements' \
  -X 'POST' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "item_id": "SKU-2005",
    "movement_type": "TRANSFER",
    "status": "PENDING",
    "movement_date": "2025-01-10",
    "from_location": "WH-01-A",
    "to_location": "WH-01-B",
    "quantity": 10,
    "unit": "pcs",
    "currency": "INR"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock_movement": {
      "id": "1",
      "movement_number": "MV-2025-ABC123",
      "item_id": "SKU-2005",
      "item_name": "Barcode Scanner",
      "item_sku": "SKU-2005",
      "movement_type": "TRANSFER",
      "status": "PENDING",
      "movement_date": "2025-01-10T00:00:00.000Z",
      "completed_date": null,
      "from_location": "WH-01-A",
      "from_zone": "STORAGE",
      "from_bin": "BIN-01",
      "to_location": "WH-01-B",
      "to_zone": "PICKING",
      "to_bin": "BIN-02",
      "quantity": 10,
      "unit": "pcs",
      "available_quantity": 50,
      "received_quantity": null,
      "reference_number": "TRF-001",
      "reference_type": "TRANSFER_ORDER",
      "batch_number": null,
      "lot_number": null,
      "serial_numbers": null,
      "assigned_to": "John Doe",
      "operator_name": "John Doe",
      "supervisor": null,
      "quality_check_required": true,
      "quality_check_passed": false,
      "inspected_by": null,
      "inspection_date": null,
      "carrier": null,
      "tracking_number": null,
      "expected_arrival_date": null,
      "actual_arrival_date": null,
      "unit_cost": 25.50,
      "total_cost": 255.00,
      "currency": "INR",
      "reason": "Restocking picking area",
      "notes": "Standard transfer",
      "internal_notes": null,
      "tags": null,
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T10:30:00.000Z"
    }
  }
}
```

---

## 3. Update Stock Movement

### PUT `/warehouse/stock-movements/:id`

**Path Parameters:**
- `id` (string): Stock movement ID

**Request Payload:**
```json
{
  "status": "COMPLETED",
  "completed_date": "2025-01-10",
  "received_quantity": 10,
  "quality_check_passed": true,
  "inspected_by": "Jane Smith",
  "inspection_date": "2025-01-10",
  "notes": "Transfer completed successfully"
}
```

**Note:** Only include fields that need to be updated (partial update).

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/warehouse/stock-movements/1' \
  -X 'PUT' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "status": "COMPLETED",
    "completed_date": "2025-01-10",
    "received_quantity": 10,
    "quality_check_passed": true,
    "inspected_by": "Jane Smith",
    "inspection_date": "2025-01-10"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock_movement": {
      "id": "1",
      "movement_number": "MV-2025-ABC123",
      "item_id": "SKU-2005",
      "item_name": "Barcode Scanner",
      "item_sku": "SKU-2005",
      "movement_type": "TRANSFER",
      "status": "COMPLETED",
      "movement_date": "2025-01-10T00:00:00.000Z",
      "completed_date": "2025-01-10T00:00:00.000Z",
      "from_location": "WH-01-A",
      "from_zone": "STORAGE",
      "from_bin": "BIN-01",
      "to_location": "WH-01-B",
      "to_zone": "PICKING",
      "to_bin": "BIN-02",
      "quantity": 10,
      "unit": "pcs",
      "available_quantity": 50,
      "received_quantity": 10,
      "reference_number": "TRF-001",
      "reference_type": "TRANSFER_ORDER",
      "batch_number": null,
      "lot_number": null,
      "serial_numbers": null,
      "assigned_to": "John Doe",
      "operator_name": "John Doe",
      "supervisor": null,
      "quality_check_required": true,
      "quality_check_passed": true,
      "inspected_by": "Jane Smith",
      "inspection_date": "2025-01-10T00:00:00.000Z",
      "carrier": null,
      "tracking_number": null,
      "expected_arrival_date": null,
      "actual_arrival_date": null,
      "unit_cost": 25.50,
      "total_cost": 255.00,
      "currency": "INR",
      "reason": "Restocking picking area",
      "notes": "Transfer completed successfully",
      "internal_notes": null,
      "tags": null,
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T15:45:00.000Z"
    }
  }
}
```

---

## 4. Delete Stock Movement

### DELETE `/warehouse/stock-movements/:id`

**Path Parameters:**
- `id` (string): Stock movement ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/warehouse/stock-movements/1' \
  -X 'DELETE' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "message": "Stock movement deleted successfully"
}
```

---

## 5. Get Single Stock Movement

### GET `/warehouse/stock-movements/:id`

**Path Parameters:**
- `id` (string): Stock movement ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/warehouse/stock-movements/1' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock_movement": {
      "id": "1",
      "movement_number": "MV-2025-ABC123",
      "item_id": "SKU-2005",
      "item_name": "Barcode Scanner",
      "item_sku": "SKU-2005",
      "movement_type": "TRANSFER",
      "status": "COMPLETED",
      "movement_date": "2025-01-10T00:00:00.000Z",
      "completed_date": "2025-01-10T00:00:00.000Z",
      "from_location": "WH-01-A",
      "from_zone": "STORAGE",
      "from_bin": "BIN-01",
      "to_location": "WH-01-B",
      "to_zone": "PICKING",
      "to_bin": "BIN-02",
      "quantity": 10,
      "unit": "pcs",
      "available_quantity": 50,
      "received_quantity": 10,
      "reference_number": "TRF-001",
      "reference_type": "TRANSFER_ORDER",
      "batch_number": null,
      "lot_number": null,
      "serial_numbers": null,
      "assigned_to": "John Doe",
      "operator_name": "John Doe",
      "supervisor": null,
      "quality_check_required": true,
      "quality_check_passed": true,
      "inspected_by": "Jane Smith",
      "inspection_date": "2025-01-10T00:00:00.000Z",
      "carrier": null,
      "tracking_number": null,
      "expected_arrival_date": null,
      "actual_arrival_date": null,
      "unit_cost": 25.50,
      "total_cost": 255.00,
      "currency": "INR",
      "reason": "Restocking picking area",
      "notes": "Transfer completed successfully",
      "internal_notes": null,
      "tags": null,
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T15:45:00.000Z"
    }
  }
}
```

---

## Field Descriptions

### Movement Types
- `TRANSFER`: Transfer between warehouse locations
- `RECEIPT`: Receiving goods from supplier
- `SHIPMENT`: Shipping goods to customer
- `ADJUSTMENT`: Inventory adjustment (can be positive or negative)
- `RETURN`: Return from customer
- `CYCLE_COUNT`: Cycle count/stocktaking

### Status Values
- `PENDING`: Movement is pending
- `IN_PROGRESS`: Movement is in progress
- `COMPLETED`: Movement is completed
- `CANCELLED`: Movement is cancelled

### Warehouse Zones
- `RECEIVING`: Receiving area
- `STORAGE`: Storage area
- `PICKING`: Picking area
- `PACKING`: Packing area
- `SHIPPING`: Shipping area
- `QUARANTINE`: Quarantine area

### Reference Types
- `PURCHASE_ORDER`: Related to purchase order
- `SALES_ORDER`: Related to sales order
- `TRANSFER_ORDER`: Related to transfer order
- `ADJUSTMENT`: Related to adjustment
- `OTHER`: Other reference type

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "item_id": "Item ID is required",
    "quantity": "Quantity must be a positive number"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Stock movement not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

1. **Movement Number**: Can be auto-generated by backend if not provided
2. **Currency**: Default is `INR` (Indian Rupee)
3. **Dates**: All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
4. **Quantities**: Must be positive numbers (except for ADJUSTMENT type which can be negative)
5. **Serial Numbers**: Array of strings for serialized items
6. **Tags**: Array of strings for categorization

