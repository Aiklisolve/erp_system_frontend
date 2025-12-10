# Projects Module API Documentation

This document provides API documentation for project management endpoints with only necessary database fields.

## Base URL
```
http://localhost:3000/api/v1
```
Or your configured `VITE_API_BASE_URL` environment variable.

---

## 1. List Projects

**Endpoint**: `GET /projects`

**Description**: Retrieves a list of all projects.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters** (optional):
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `status` (string): Filter by project status
- `project_type` (string): Filter by project type
- `priority` (string): Filter by priority

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "1",
        "project_code": "PROJ-2025-001",
        "name": "Manufacturing ERP System Implementation",
        "description": "Complete Manufacturing ERP system implementation",
        "client": "Acme Manufacturing Corporation",
        "client_id": "crm-001",
        "client_contact_person": "John Smith",
        "client_email": "john.smith@acmemfg.com",
        "client_phone": "+1 555-0101",
        "project_type": "IMPLEMENTATION",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "budget": 125000,
        "currency": "USD",
        "project_manager": "Sarah Johnson",
        "contract_number": "CNT-2025-001",
        "created_at": "2025-01-20T10:00:00.000Z",
        "updated_at": "2025-01-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 2. Get Project by ID

**Endpoint**: `GET /projects/:id`

**Description**: Retrieves a specific project by ID.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "1",
      "project_code": "PROJ-2025-001",
      "name": "Manufacturing ERP System Implementation",
      "description": "Complete Manufacturing ERP system implementation",
      "client": "Acme Manufacturing Corporation",
      "client_id": "crm-001",
      "client_contact_person": "John Smith",
      "client_email": "john.smith@acmemfg.com",
      "client_phone": "+1 555-0101",
      "project_type": "IMPLEMENTATION",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "budget": 125000,
      "currency": "USD",
      "project_manager": "Sarah Johnson",
      "contract_number": "CNT-2025-001",
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T10:00:00.000Z"
    }
  }
}
```

---

## 3. Create Project

**Endpoint**: `POST /projects`

**Description**: Creates a new project.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/projects" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing ERP System Implementation",
    "description": "Complete Manufacturing ERP system implementation",
    "client": "Acme Manufacturing Corporation",
    "client_id": "crm-001",
    "client_contact_person": "John Smith",
    "client_email": "john.smith@acmemfg.com",
    "client_phone": "+1 555-0101",
    "project_type": "IMPLEMENTATION",
    "status": "PLANNING",
    "priority": "HIGH",
    "start_date": "2025-01-01",
    "end_date": "2025-06-30",
    "budget": 125000,
    "currency": "USD",
    "project_manager": "Sarah Johnson",
    "contract_number": "CNT-2025-001"
  }'
```

**Request Payload** (Required fields only):
```json
{
  "name": "Manufacturing ERP System Implementation",
  "client": "Acme Manufacturing Corporation",
  "project_type": "IMPLEMENTATION",
  "status": "PLANNING",
  "start_date": "2025-01-01",
  "budget": 125000
}
```

**Request Payload** (All available fields):
```json
{
  "name": "Manufacturing ERP System Implementation",
  "description": "Complete Manufacturing ERP system implementation",
  "client": "Acme Manufacturing Corporation",
  "client_id": "crm-001",
  "client_contact_person": "John Smith",
  "client_email": "john.smith@acmemfg.com",
  "client_phone": "+1 555-0101",
  "project_type": "IMPLEMENTATION",
  "status": "PLANNING",
  "priority": "HIGH",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "budget": 125000,
  "currency": "USD",
  "project_manager": "Sarah Johnson",
  "contract_number": "CNT-2025-001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "1",
      "project_code": "PROJ-2025-001",
      "name": "Manufacturing ERP System Implementation",
      "description": "Complete Manufacturing ERP system implementation",
      "client": "Acme Manufacturing Corporation",
      "client_id": "crm-001",
      "client_contact_person": "John Smith",
      "client_email": "john.smith@acmemfg.com",
      "client_phone": "+1 555-0101",
      "project_type": "IMPLEMENTATION",
      "status": "PLANNING",
      "priority": "HIGH",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "budget": 125000,
      "currency": "USD",
      "project_manager": "Sarah Johnson",
      "contract_number": "CNT-2025-001",
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T10:00:00.000Z"
    }
  }
}
```

---

## 4. Update Project

**Endpoint**: `PATCH /projects/:id`

**Description**: Updates an existing project. Only provided fields will be updated.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "CRITICAL",
    "end_date": "2025-07-30",
    "budget": 150000
  }'
```

**Request Payload** (all fields optional - only send fields to update):
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "client": "Updated Client Name",
  "client_id": "crm-002",
  "client_contact_person": "Jane Doe",
  "client_email": "jane.doe@example.com",
  "client_phone": "+1 555-9999",
  "project_type": "TIME_MATERIALS",
  "status": "IN_PROGRESS",
  "priority": "CRITICAL",
  "start_date": "2025-02-01",
  "end_date": "2025-07-30",
  "budget": 150000,
  "currency": "EUR",
  "project_manager": "John Doe",
  "contract_number": "CNT-2025-002"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "id": "1",
      "project_code": "PROJ-2025-001",
      "name": "Updated Project Name",
      "description": "Updated description",
      "client": "Updated Client Name",
      "client_id": "crm-002",
      "client_contact_person": "Jane Doe",
      "client_email": "jane.doe@example.com",
      "client_phone": "+1 555-9999",
      "project_type": "TIME_MATERIALS",
      "status": "IN_PROGRESS",
      "priority": "CRITICAL",
      "start_date": "2025-02-01",
      "end_date": "2025-07-30",
      "budget": 150000,
      "currency": "EUR",
      "project_manager": "John Doe",
      "contract_number": "CNT-2025-002",
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T15:30:00.000Z"
    }
  }
}
```

---

## 5. Delete Project

**Endpoint**: `DELETE /projects/:id`

**Description**: Deletes a project by ID.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Field Descriptions

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Project name (required) |
| `client` | string | Client name (required) |
| `project_type` | string | Project type: `FIXED_PRICE`, `TIME_MATERIALS`, `HYBRID`, `SUPPORT`, `CONSULTING`, `IMPLEMENTATION`, `OTHER` (required) |
| `status` | string | Project status: `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`, `ARCHIVED` (required) |
| `start_date` | string | Project start date in `YYYY-MM-DD` format (required) |
| `budget` | number | Project budget amount (required) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `project_code` | string | Auto-generated project code (e.g., "PROJ-2025-001") |
| `description` | string | Project description |
| `client_id` | string | Link to CRM customer ID |
| `client_contact_person` | string | Client contact person name |
| `client_email` | string | Client contact email |
| `client_phone` | string | Client contact phone number |
| `priority` | string | Project priority: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `end_date` | string | Project end date in `YYYY-MM-DD` format |
| `currency` | string | Currency code (default: "USD") |
| `project_manager` | string | Project manager name |
| `contract_number` | string | Contract number |

---

## Enumerations

### Project Type
- `FIXED_PRICE` - Fixed price project
- `TIME_MATERIALS` - Time and materials billing
- `HYBRID` - Hybrid billing model
- `SUPPORT` - Support project
- `CONSULTING` - Consulting project
- `IMPLEMENTATION` - Implementation project
- `OTHER` - Other project type

### Project Status
- `PLANNING` - Project in planning phase
- `IN_PROGRESS` - Project currently in progress
- `ON_HOLD` - Project on hold
- `COMPLETED` - Project completed
- `CANCELLED` - Project cancelled
- `ARCHIVED` - Project archived

### Project Priority
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority
- `CRITICAL` - Critical priority

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "VALIDATION_ERROR",
  "details": {
    "name": "Project name is required",
    "budget": "Budget must be a positive number"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please provide a valid authentication token.",
  "error": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Project not found",
  "error": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "INTERNAL_SERVER_ERROR"
}
```

---

## Notes

1. **Authentication**: All endpoints require a valid Bearer token in the Authorization header.
2. **Project Code**: If not provided, the system will auto-generate a project code in the format `PROJ-YYYY-XXXXXX`.
3. **Dates**: All date fields should be in `YYYY-MM-DD` format.
4. **Budget**: Budget must be a positive number.
5. **Partial Updates**: For PATCH requests, only include fields that need to be updated. Omitted fields will remain unchanged.
6. **Currency**: Default currency is "USD" if not specified.
7. **Status Transitions**: Ensure status transitions are valid (e.g., cannot change from COMPLETED to PLANNING).

---

## Example: Complete Project Lifecycle

### Step 1: Create Project
```bash
curl -X POST "http://localhost:3000/api/v1/projects" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New ERP Implementation",
    "client": "ABC Corporation",
    "project_type": "IMPLEMENTATION",
    "status": "PLANNING",
    "start_date": "2025-02-01",
    "budget": 100000,
    "currency": "USD"
  }'
```

### Step 2: Update Project Status
```bash
curl -X PATCH "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "project_manager": "John Doe"
  }'
```

### Step 3: Get Project Details
```bash
curl -X GET "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json"
```

### Step 4: Complete Project
```bash
curl -X PATCH "http://localhost:3000/api/v1/projects/1" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "end_date": "2025-06-30"
  }'
```

---

## Database Schema (Essential Fields Only)

```sql
CREATE TABLE projects (
  id VARCHAR(255) PRIMARY KEY,
  project_code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client VARCHAR(255) NOT NULL,
  client_id VARCHAR(255),
  client_contact_person VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  project_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  project_manager VARCHAR(255),
  contract_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Frontend Integration

The frontend `ProjectList` and `ProjectForm` components:
1. Fetch projects from `GET /projects` on component mount
2. Create new projects via `POST /projects` with required fields
3. Update projects via `PATCH /projects/:id` with only changed fields
4. Delete projects via `DELETE /projects/:id`
5. Handle pagination, filtering, and search on the frontend

The form validates required fields (`name`, `client`, `project_type`, `status`, `start_date`, `budget`) before submission.

