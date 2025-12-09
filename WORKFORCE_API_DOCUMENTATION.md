# Workforce Module API Documentation

## Base URL
```
http://localhost:3000/api/v1/workforce
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. List Shifts

### GET `/workforce/shifts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)
- `status` (optional): Filter by status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
- `shift_type` (optional): Filter by type (`REGULAR`, `OVERTIME`, `HOLIDAY`, `ON_CALL`, `TRAINING`, `MEETING`)
- `department` (optional): Filter by department (`IT`, `FINANCE`, `OPERATIONS`, `SALES`, `HR`, `WAREHOUSE`, `PROCUREMENT`, `MANUFACTURING`, `CUSTOMER_SERVICE`, `ADMINISTRATION`, `OTHER`)
- `employee_id` (optional): Filter by employee ID
- `employee_name` (optional): Filter by employee name (partial match)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `is_overtime` (optional): Filter by overtime status (true/false)
- `attendance_status` (optional): Filter by attendance (`PRESENT`, `ABSENT`, `LATE`, `EARLY_LEAVE`, `ON_TIME`)

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts?page=1&limit=100&status=IN_PROGRESS&department=WAREHOUSE' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": "sh-1",
        "shift_number": "SHF-2025-ABC123",
        "employee_id": "emp-1",
        "employee_name": "Alex Rivera",
        "employee_email": "alex.rivera@erp.local",
        "date": "2025-01-08",
        "start_time": "08:00",
        "end_time": "16:00",
        "break_duration_minutes": 30,
        "total_hours": 7.5,
        "role": "Warehouse Associate",
        "erp_role": "WAREHOUSE_OPERATOR",
        "department": "WAREHOUSE",
        "job_title": "Warehouse Operator",
        "location": "Main Warehouse",
        "shift_type": "REGULAR",
        "status": "IN_PROGRESS",
        "is_overtime": false,
        "scheduled_by": "HR Manager",
        "approved_by": "Operations Manager",
        "approval_date": "2025-01-05",
        "clock_in_time": "08:05",
        "clock_out_time": null,
        "actual_hours": null,
        "attendance_status": "LATE",
        "late_minutes": 5,
        "early_leave_minutes": null,
        "assigned_tasks": ["Stock receiving", "Inventory count", "Order picking"],
        "task_completion_rate": 75,
        "notes": "Shift in progress",
        "performance_rating": null,
        "quality_score": null,
        "hourly_rate": 18.50,
        "total_pay": null,
        "overtime_hours": null,
        "overtime_rate": null,
        "currency": "USD",
        "tags": ["warehouse", "operations"],
        "internal_notes": null,
        "created_at": "2025-01-05T10:30:00.000Z",
        "updated_at": "2025-01-08T08:05:00.000Z"
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

## 2. Create Shift

### POST `/workforce/shifts`

**Request Payload:**
```json
{
  "employee_id": "emp-1",
  "employee_name": "Alex Rivera",
  "employee_email": "alex.rivera@erp.local",
  "date": "2025-01-15",
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
  "scheduled_by": "HR Manager",
  "hourly_rate": 18.50,
  "currency": "USD",
  "assigned_tasks": ["Stock receiving", "Inventory count"],
  "notes": "Regular shift assignment"
}
```

**Required Fields:**
- `employee_name` (string): Employee full name
- `date` (string): Shift date in YYYY-MM-DD format
- `start_time` (string): Start time in HH:mm format
- `end_time` (string): End time in HH:mm format
- `role` (string): Job role or title
- `shift_type` (string): One of `REGULAR`, `OVERTIME`, `HOLIDAY`, `ON_CALL`, `TRAINING`, `MEETING`
- `status` (string): One of `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

**Optional Fields:**
- `employee_id` (string): Link to employee record (foreign key to `employees` table)
- `employee_email` (string): Employee email
- `break_duration_minutes` (number): Break time in minutes
- `total_hours` (number): Auto-calculated from start/end time and break
- `erp_role` (string): ERP system role (links to `erp_roles` table)
- `department` (string): Department enum value
- `job_title` (string): Job title
- `location` (string): Work location/office
- `is_overtime` (boolean): Whether this is an overtime shift
- `scheduled_by` (string): Who scheduled this shift
- `approved_by` (string): Manager who approved
- `approval_date` (string): Approval date
- `clock_in_time` (string): Actual clock in time
- `clock_out_time` (string): Actual clock out time
- `actual_hours` (number): Actual worked hours
- `attendance_status` (string): Attendance status enum
- `late_minutes` (number): Minutes late
- `early_leave_minutes` (number): Minutes left early
- `assigned_tasks` (array): Array of task strings
- `task_completion_rate` (number): Completion percentage (0-100)
- `notes` (string): Public notes
- `performance_rating` (number): 1-5 rating
- `quality_score` (number): 1-5 quality score
- `hourly_rate` (number): Hourly pay rate
- `total_pay` (number): Auto-calculated total pay
- `overtime_hours` (number): Overtime hours worked
- `overtime_rate` (number): Overtime pay rate
- `currency` (string): Currency code (default: USD)
- `tags` (array): Array of tag strings
- `internal_notes` (string): Internal notes (not visible to employee)

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts' \
  -X 'POST' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "employee_id": "emp-1",
    "employee_name": "Alex Rivera",
    "employee_email": "alex.rivera@erp.local",
    "date": "2025-01-15",
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
    "hourly_rate": 18.50,
    "currency": "USD",
    "assigned_tasks": ["Stock receiving", "Inventory count"],
    "notes": "Regular shift assignment"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "sh-5",
      "shift_number": "SHF-2025-XYZ789",
      "employee_id": "emp-1",
      "employee_name": "Alex Rivera",
      "employee_email": "alex.rivera@erp.local",
      "date": "2025-01-15",
      "start_time": "08:00",
      "end_time": "16:00",
      "break_duration_minutes": 30,
      "total_hours": 7.5,
      "role": "Warehouse Associate",
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      "job_title": "Warehouse Operator",
      "location": "Main Warehouse",
      "shift_type": "REGULAR",
      "status": "SCHEDULED",
      "is_overtime": false,
      "scheduled_by": "HR Manager",
      "approved_by": null,
      "approval_date": null,
      "clock_in_time": null,
      "clock_out_time": null,
      "actual_hours": null,
      "attendance_status": null,
      "late_minutes": null,
      "early_leave_minutes": null,
      "assigned_tasks": ["Stock receiving", "Inventory count"],
      "task_completion_rate": null,
      "notes": "Regular shift assignment",
      "performance_rating": null,
      "quality_score": null,
      "hourly_rate": 18.50,
      "total_pay": 138.75,
      "overtime_hours": null,
      "overtime_rate": null,
      "currency": "USD",
      "tags": null,
      "internal_notes": null,
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T10:30:00.000Z"
    }
  },
  "message": "Shift created successfully"
}
```

---

## 3. Update Shift

### PUT `/workforce/shifts/:id`

**Path Parameters:**
- `id` (string): Shift ID

**Request Payload:**
```json
{
  "status": "IN_PROGRESS",
  "clock_in_time": "08:05",
  "attendance_status": "LATE",
  "late_minutes": 5,
  "notes": "Started shift 5 minutes late"
}
```

**Note:** Only include fields that need to be updated (partial update).

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/sh-1' \
  -X 'PUT' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "status": "IN_PROGRESS",
    "clock_in_time": "08:05",
    "attendance_status": "LATE",
    "late_minutes": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "sh-1",
      "shift_number": "SHF-2025-ABC123",
      "employee_id": "emp-1",
      "employee_name": "Alex Rivera",
      "employee_email": "alex.rivera@erp.local",
      "date": "2025-01-08",
      "start_time": "08:00",
      "end_time": "16:00",
      "break_duration_minutes": 30,
      "total_hours": 7.5,
      "role": "Warehouse Associate",
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      "job_title": "Warehouse Operator",
      "location": "Main Warehouse",
      "shift_type": "REGULAR",
      "status": "IN_PROGRESS",
      "is_overtime": false,
      "scheduled_by": "HR Manager",
      "approved_by": "Operations Manager",
      "approval_date": "2025-01-05",
      "clock_in_time": "08:05",
      "clock_out_time": null,
      "actual_hours": null,
      "attendance_status": "LATE",
      "late_minutes": 5,
      "early_leave_minutes": null,
      "assigned_tasks": ["Stock receiving", "Inventory count", "Order picking"],
      "task_completion_rate": null,
      "notes": "Started shift 5 minutes late",
      "performance_rating": null,
      "quality_score": null,
      "hourly_rate": 18.50,
      "total_pay": null,
      "overtime_hours": null,
      "overtime_rate": null,
      "currency": "USD",
      "tags": ["warehouse", "operations"],
      "internal_notes": null,
      "created_at": "2025-01-05T10:30:00.000Z",
      "updated_at": "2025-01-08T08:05:00.000Z"
    }
  },
  "message": "Shift updated successfully"
}
```

---

## 4. Delete Shift

### DELETE `/workforce/shifts/:id`

**Path Parameters:**
- `id` (string): Shift ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/sh-1' \
  -X 'DELETE' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "message": "Shift deleted successfully"
}
```

---

## 5. Get Single Shift

### GET `/workforce/shifts/:id`

**Path Parameters:**
- `id` (string): Shift ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/sh-1' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "sh-1",
      "shift_number": "SHF-2025-ABC123",
      "employee_id": "emp-1",
      "employee_name": "Alex Rivera",
      "employee_email": "alex.rivera@erp.local",
      "date": "2025-01-08",
      "start_time": "08:00",
      "end_time": "16:00",
      "break_duration_minutes": 30,
      "total_hours": 7.5,
      "role": "Warehouse Associate",
      "erp_role": "WAREHOUSE_OPERATOR",
      "department": "WAREHOUSE",
      "job_title": "Warehouse Operator",
      "location": "Main Warehouse",
      "shift_type": "REGULAR",
      "status": "COMPLETED",
      "is_overtime": false,
      "scheduled_by": "HR Manager",
      "approved_by": "Operations Manager",
      "approval_date": "2025-01-05",
      "clock_in_time": "08:05",
      "clock_out_time": "16:10",
      "actual_hours": 7.75,
      "attendance_status": "LATE",
      "late_minutes": 5,
      "early_leave_minutes": null,
      "assigned_tasks": ["Stock receiving", "Inventory count", "Order picking"],
      "task_completion_rate": 100,
      "notes": "Completed all assigned tasks",
      "performance_rating": 4.5,
      "quality_score": 4.7,
      "hourly_rate": 18.50,
      "total_pay": 143.38,
      "overtime_hours": null,
      "overtime_rate": null,
      "currency": "USD",
      "tags": ["warehouse", "operations"],
      "internal_notes": null,
      "created_at": "2025-01-05T10:30:00.000Z",
      "updated_at": "2025-01-08T16:10:00.000Z"
    }
  }
}
```

---

## 6. Get Shift Metrics/Statistics

### GET `/workforce/shifts/metrics`

**Query Parameters:**
- `start_date` (optional): Start date for metrics (YYYY-MM-DD)
- `end_date` (optional): End date for metrics (YYYY-MM-DD)
- `department` (optional): Filter by department
- `employee_id` (optional): Filter by employee

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/metrics?start_date=2025-01-01&end_date=2025-01-31' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_shifts": 150,
      "scheduled_shifts": 45,
      "in_progress_shifts": 12,
      "completed_shifts": 88,
      "cancelled_shifts": 5,
      "total_hours": 1125.5,
      "total_overtime_hours": 125.25,
      "total_pay": 20822.50,
      "average_hours_per_shift": 7.5,
      "attendance_issues": 8,
      "late_shifts": 5,
      "absent_shifts": 3,
      "on_time_rate": 94.3,
      "completion_rate": 95.7,
      "by_department": {
        "WAREHOUSE": {
          "total_shifts": 50,
          "total_hours": 375.0,
          "total_pay": 6937.50
        },
        "SALES": {
          "total_shifts": 30,
          "total_hours": 225.0,
          "total_pay": 7875.00
        }
      },
      "by_status": {
        "SCHEDULED": 45,
        "IN_PROGRESS": 12,
        "COMPLETED": 88,
        "CANCELLED": 5
      },
      "by_type": {
        "REGULAR": 130,
        "OVERTIME": 15,
        "HOLIDAY": 5
      }
    }
  }
}
```

---

## 7. Clock In

### POST `/workforce/shifts/:id/clock-in`

**Path Parameters:**
- `id` (string): Shift ID

**Request Payload:**
```json
{
  "clock_in_time": "08:05",
  "location": "Main Warehouse",
  "notes": "Starting shift"
}
```

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/sh-1/clock-in' \
  -X 'POST' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "clock_in_time": "08:05",
    "location": "Main Warehouse"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "sh-1",
      "status": "IN_PROGRESS",
      "clock_in_time": "08:05",
      "attendance_status": "LATE",
      "late_minutes": 5,
      "updated_at": "2025-01-08T08:05:00.000Z"
    }
  },
  "message": "Clock in recorded successfully"
}
```

---

## 8. Clock Out

### POST `/workforce/shifts/:id/clock-out`

**Path Parameters:**
- `id` (string): Shift ID

**Request Payload:**
```json
{
  "clock_out_time": "16:10",
  "notes": "Shift completed"
}
```

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/workforce/shifts/sh-1/clock-out' \
  -X 'POST' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "clock_out_time": "16:10",
    "notes": "Shift completed"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "sh-1",
      "status": "COMPLETED",
      "clock_out_time": "16:10",
      "actual_hours": 7.75,
      "total_pay": 143.38,
      "updated_at": "2025-01-08T16:10:00.000Z"
    }
  },
  "message": "Clock out recorded successfully"
}
```

---

## Field Descriptions

### Shift Types
- `REGULAR`: Regular scheduled shift
- `OVERTIME`: Overtime shift
- `HOLIDAY`: Holiday shift (usually with premium pay)
- `ON_CALL`: On-call shift
- `TRAINING`: Training session
- `MEETING`: Meeting or conference

### Shift Status
- `SCHEDULED`: Shift is scheduled but not started
- `IN_PROGRESS`: Shift is currently active
- `COMPLETED`: Shift has been completed
- `CANCELLED`: Shift was cancelled
- `NO_SHOW`: Employee did not show up

### Attendance Status
- `PRESENT`: Employee is present
- `ON_TIME`: Employee arrived on time
- `LATE`: Employee arrived late
- `EARLY_LEAVE`: Employee left early
- `ABSENT`: Employee is absent

### Departments
- `IT`: Information Technology
- `FINANCE`: Finance Department
- `OPERATIONS`: Operations Department
- `SALES`: Sales Department
- `HR`: Human Resources
- `WAREHOUSE`: Warehouse Operations
- `PROCUREMENT`: Procurement Department
- `MANUFACTURING`: Manufacturing Department
- `CUSTOMER_SERVICE`: Customer Service
- `ADMINISTRATION`: Administration
- `OTHER`: Other departments

---

## Database Schema & Table Relationships

### Shifts Table

```sql
CREATE TABLE shifts (
  id VARCHAR(50) PRIMARY KEY,
  
  -- Shift Identification
  shift_number VARCHAR(50) UNIQUE, -- Auto-generated: SHF-YYYY-XXXXXX
  
  -- Employee Relationship (Foreign Key)
  employee_id VARCHAR(50), -- Links to employees.id or hr_employees.id
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255),
  
  -- Shift Details
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5, 2), -- Auto-calculated: (end_time - start_time - break) / 60
  
  -- Role & Department (Foreign Key Relationships)
  role VARCHAR(255) NOT NULL, -- Job title/role name
  erp_role VARCHAR(50), -- Links to erp_roles.role_name (e.g., 'WAREHOUSE_OPERATOR', 'SALES_MANAGER')
  department VARCHAR(50), -- Enum: Links to departments table or enum values
  job_title VARCHAR(255),
  location VARCHAR(255), -- Work location/office
  
  -- Shift Classification
  shift_type VARCHAR(20) NOT NULL, -- Enum: REGULAR, OVERTIME, HOLIDAY, ON_CALL, TRAINING, MEETING
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- Enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  is_overtime BOOLEAN DEFAULT FALSE,
  
  -- Scheduling & Approval
  scheduled_by VARCHAR(255), -- User who scheduled (links to users.username or users.id)
  approved_by VARCHAR(255), -- Manager who approved (links to users.username or users.id)
  approval_date DATE,
  
  -- Time Tracking
  clock_in_time TIME, -- Actual clock in time
  clock_out_time TIME, -- Actual clock out time
  actual_hours DECIMAL(5, 2), -- Auto-calculated from clock_in/out
  
  -- Attendance
  attendance_status VARCHAR(20), -- Enum: PRESENT, ABSENT, LATE, EARLY_LEAVE, ON_TIME
  late_minutes INTEGER,
  early_leave_minutes INTEGER,
  
  -- Tasks & Performance
  assigned_tasks TEXT[], -- Array of task strings
  task_completion_rate DECIMAL(5, 2), -- Percentage 0-100
  performance_rating DECIMAL(3, 2), -- 1-5 rating
  quality_score DECIMAL(3, 2), -- 1-5 quality score
  
  -- Cost & Payroll
  hourly_rate DECIMAL(10, 2), -- Links to employees.hourly_rate or default rate
  total_pay DECIMAL(10, 2), -- Auto-calculated: (total_hours * hourly_rate) + (overtime_hours * overtime_rate)
  overtime_hours DECIMAL(5, 2),
  overtime_rate DECIMAL(10, 2), -- Usually 1.5x hourly_rate
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Additional
  notes TEXT,
  internal_notes TEXT, -- Not visible to employee
  tags TEXT[], -- Array of tag strings for categorization
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_shift_type CHECK (shift_type IN ('REGULAR', 'OVERTIME', 'HOLIDAY', 'ON_CALL', 'TRAINING', 'MEETING')),
  CONSTRAINT check_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  CONSTRAINT check_attendance_status CHECK (attendance_status IN ('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'ON_TIME') OR attendance_status IS NULL),
  CONSTRAINT check_department CHECK (department IN ('IT', 'FINANCE', 'OPERATIONS', 'SALES', 'HR', 'WAREHOUSE', 'PROCUREMENT', 'MANUFACTURING', 'CUSTOMER_SERVICE', 'ADMINISTRATION', 'OTHER') OR department IS NULL)
);

-- Indexes
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_shift_type ON shifts(shift_type);
CREATE INDEX idx_shifts_department ON shifts(department);
CREATE INDEX idx_shifts_erp_role ON shifts(erp_role);
CREATE INDEX idx_shifts_date_range ON shifts(date, start_time, end_time);

-- Foreign Key Relationships (if tables exist)
-- ALTER TABLE shifts ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
-- ALTER TABLE shifts ADD CONSTRAINT fk_erp_role FOREIGN KEY (erp_role) REFERENCES erp_roles(role_name) ON DELETE SET NULL;
-- ALTER TABLE shifts ADD CONSTRAINT fk_scheduled_by FOREIGN KEY (scheduled_by) REFERENCES users(username) ON DELETE SET NULL;
-- ALTER TABLE shifts ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(username) ON DELETE SET NULL;
```

### Table Relationships

#### 1. **Employee Relationship**
- `shifts.employee_id` → `employees.id` (or `hr_employees.id`)
- `shifts.employee_name` → Denormalized from `employees.first_name + employees.last_name`
- `shifts.employee_email` → Denormalized from `employees.email`
- **Purpose**: Links shift to employee record for payroll, attendance tracking, and employee history

#### 2. **ERP Role Relationship**
- `shifts.erp_role` → `erp_roles.role_name` (e.g., 'WAREHOUSE_OPERATOR', 'SALES_MANAGER')
- **Purpose**: Links shift to ERP system role for permissions and access control
- **Values**: ADMIN, FINANCE_MANAGER, INVENTORY_MANAGER, PROCUREMENT_OFFICER, HR_MANAGER, SALES_MANAGER, WAREHOUSE_OPERATOR, VIEWER

#### 3. **Department Relationship**
- `shifts.department` → `departments.name` (or enum values)
- **Purpose**: Groups shifts by department for reporting and scheduling
- **Values**: IT, FINANCE, OPERATIONS, SALES, HR, WAREHOUSE, PROCUREMENT, MANUFACTURING, CUSTOMER_SERVICE, ADMINISTRATION, OTHER

#### 4. **User Relationships (Scheduling)**
- `shifts.scheduled_by` → `users.username` or `users.id`
- `shifts.approved_by` → `users.username` or `users.id`
- **Purpose**: Tracks who scheduled and approved the shift for audit trail

#### 5. **Payroll Integration**
- `shifts.hourly_rate` → Can be pulled from `employees.hourly_rate` or `employees.salary` / standard_hours
- `shifts.total_pay` → Calculated from hours and rates
- **Purpose**: Links to payroll system for wage calculation

#### 6. **Location Relationship** (if locations table exists)
- `shifts.location` → `locations.name` or `warehouses.name`
- **Purpose**: Links shift to physical work location (warehouse, office, etc.)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "employee_name": "Employee name is required",
    "date": "Date must be in YYYY-MM-DD format",
    "start_time": "Start time must be in HH:mm format",
    "shift_type": "Shift type must be one of: REGULAR, OVERTIME, HOLIDAY, ON_CALL, TRAINING, MEETING"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Shift not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Shift number already exists"
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

1. **Shift Number**: Auto-generated by backend if not provided. Format: `SHF-YYYY-XXXXXX` (e.g., `SHF-2025-ABC123`)

2. **Total Hours Calculation**: 
   - `total_hours = ((end_time - start_time) in minutes - break_duration_minutes) / 60`
   - Example: 08:00 to 16:00 with 30 min break = 7.5 hours

3. **Total Pay Calculation**:
   - Regular: `total_pay = total_hours * hourly_rate`
   - With Overtime: `total_pay = (regular_hours * hourly_rate) + (overtime_hours * overtime_rate)`
   - Overtime rate is typically 1.5x hourly rate

4. **Attendance Status Auto-Calculation**:
   - If `clock_in_time > start_time`: Set `attendance_status = 'LATE'` and calculate `late_minutes`
   - If `clock_in_time <= start_time`: Set `attendance_status = 'ON_TIME'`
   - If `clock_out_time < end_time`: Set `attendance_status = 'EARLY_LEAVE'` and calculate `early_leave_minutes`

5. **Employee ID**: Optional but recommended. If provided, backend should validate existence in employees table. If not provided, employee_name is sufficient.

6. **Currency**: Default is `USD`. Can be changed per shift or pulled from employee record.

7. **Dates & Times**: 
   - Dates: YYYY-MM-DD format (ISO 8601)
   - Times: HH:mm format (24-hour)
   - All timestamps in responses are ISO 8601 format with timezone

8. **Arrays**: `assigned_tasks` and `tags` are stored as PostgreSQL arrays (TEXT[])

9. **Status Workflow**:
   - `SCHEDULED` → `IN_PROGRESS` (on clock in) → `COMPLETED` (on clock out)
   - Can be set to `CANCELLED` at any time
   - `NO_SHOW` is set if employee doesn't clock in by a certain time

10. **Foreign Key Handling**: 
    - If `employee_id` is provided but doesn't exist, backend should either:
      - Return 400 error with validation message
      - OR allow creation but log warning
    - If employee is deleted, shifts can either be:
      - Set to NULL (ON DELETE SET NULL)
      - OR kept with employee_id for historical records

---

## Frontend Integration Notes

### Expected Response Structure
All endpoints return responses in this format:
```json
{
  "success": boolean,
  "data": {
    "shift" | "shifts": object | array,
    "pagination"?: object
  },
  "message"?: string
}
```

### Field Mapping
Frontend should handle these field name variations:
- `shift_number` = `id` (if shift_number is null, use id)
- `total_hours` = calculated from `start_time`, `end_time`, `break_duration_minutes`
- `total_pay` = calculated from `total_hours`, `hourly_rate`, `overtime_hours`, `overtime_rate`

### Date/Time Formatting
- Backend accepts: `date: "2025-01-15"`, `start_time: "08:00"`
- Backend returns: ISO 8601 timestamps for `created_at`, `updated_at`
- Frontend should format dates/times for display as needed

### Array Fields
- `assigned_tasks`: Array of strings - display as list or comma-separated
- `tags`: Array of strings - display as badges/chips

---

**Status**: ✅ Workforce module API documentation complete!

This documentation provides all necessary information for backend implementation and frontend integration. 🎉✨🚀

