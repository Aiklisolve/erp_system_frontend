# Shift Payload Requirements for Edit Form

## Expected Backend API Response Structure

When loading a shift for editing, the backend API should return the shift data in one of the following formats:

### Option 1: Direct Properties (Preferred)
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "123",
      "shift_number": "SHF-2025-ABC123",
      "employee_id": "emp-1",
      "employee_name": "John Doe",
      "employee_email": "john@example.com",
      "date": "2025-01-08",
      "start_time": "08:00",
      "end_time": "16:00",
      "role": "Warehouse Associate",
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      "job_title": "Warehouse Operator",
      "location": "Main Warehouse",
      "shift_type": "REGULAR",
      "status": "SCHEDULED",
      ...
    }
  }
}
```

### Option 2: Nested in data.shift
```json
{
  "success": true,
  "data": {
    "shift": {
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      ...
    }
  }
}
```

### Option 3: Direct Array Response
```json
[
  {
    "id": "123",
    "erp_role": "WAREHOUSE_OPERATOR",
    "department": "WAREHOUSE",
    ...
  }
]
```

## Required Fields for Dropdowns

### ERP Role Field
- **Field Name**: `erp_role` (or `erp_role_name` as fallback)
- **Expected Values**: Must match one of these exact strings:
  - `"ADMIN"`
  - `"FINANCE_MANAGER"`
  - `"INVENTORY_MANAGER"`
  - `"PROCUREMENT_OFFICER"`
  - `"HR_MANAGER"`
  - `"SALES_MANAGER"`
  - `"WAREHOUSE_OPERATOR"`
  - `"VIEWER"`

### Department Field
- **Field Name**: `department`
- **Expected Values**: Must match one of these exact strings:
  - `"IT"`
  - `"FINANCE"`
  - `"OPERATIONS"`
  - `"SALES"`
  - `"HR"`
  - `"WAREHOUSE"`
  - `"PROCUREMENT"`
  - `"MANUFACTURING"`
  - `"CUSTOMER_SERVICE"`
  - `"ADMINISTRATION"`
  - `"OTHER"`

## Important Notes

1. **Case Sensitivity**: Values must match exactly (uppercase with underscores)
2. **Null/Undefined Handling**: If `erp_role` or `department` is `null` or `undefined`, the dropdown will show "Select..." placeholder
3. **Data Mapping**: The frontend `mapBackendShift` function maps:
   - `backendShift.erp_role` OR `backendShift.erp_role_name` → `shift.erp_role`
   - `backendShift.department` → `shift.department`

## Example cURL Request

```bash
curl -X GET "http://localhost:3000/api/v1/workforce/shifts/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Example Response (What Backend Should Return)

```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "123",
      "shift_number": "SHF-2025-ABC123",
      "employee_id": "emp-1",
      "employee_name": "John Doe",
      "employee_email": "john@example.com",
      "date": "2025-01-08",
      "start_time": "08:00",
      "end_time": "16:00",
      "break_duration_minutes": 30,
      "role": "Warehouse Associate",
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      "job_title": "Warehouse Operator",
      "location": "Main Warehouse",
      "shift_type": "REGULAR",
      "status": "SCHEDULED",
      "is_overtime": false,
      "created_at": "2025-01-05T10:00:00.000Z",
      "updated_at": "2025-01-05T10:00:00.000Z"
    }
  }
}
```

## Debugging

If the dropdowns are not showing the selected values, check the browser console for:
- `🔍 ShiftForm initial prop received:` - Shows the full initial object structure
- `📋 Extracted values:` - Shows what values were extracted
- `🔧 Processed values:` - Shows the processed values and whether they match available options

The form will log warnings if:
- `erp_role` value doesn't match available options
- `department` value doesn't match available options

