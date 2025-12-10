# Internal Task Management Module API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. List Tasks

### GET `/tasks`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)
- `status` (optional): Filter by status (`NEW`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`)
- `priority` (optional): Filter by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `task_type` (optional): Filter by task type (`BUG`, `FEATURE`, `SUPPORT`, `MAINTENANCE`, `DOCUMENTATION`, `RESEARCH`, `OTHER`)
- `assigned_to_id` (optional): Filter by assigned user ID
- `search` (optional): Search by title, description, or task number

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/tasks?page=1&limit=100&status=IN_PROGRESS&priority=HIGH' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "1",
        "task_number": "TSK-2025-001",
        "title": "Update Finance Module Documentation",
        "description": "Review and update the Finance module documentation with new features and workflows",
        "task_type": "DOCUMENTATION",
        "priority": "MEDIUM",
        "status": "IN_PROGRESS",
        "assigned_to_id": "2",
        "assigned_to_name": "Mike Wilson",
        "assigned_to_email": "mike.wilson@erp.local",
        "assigned_to_role": "FINANCE_MANAGER",
        "assigned_by": "Sarah Johnson",
        "assigned_by_id": "1",
        "assigned_date": "2025-01-10",
        "start_date": "2025-01-10",
        "due_date": "2025-01-25",
        "completed_date": null,
        "progress_percentage": 60,
        "estimated_hours": 16,
        "actual_hours": 10,
        "tags": ["documentation", "finance"],
        "notes": "Focus on new transaction approval workflow",
        "attachments": [],
        "created_at": "2025-01-10T00:00:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Tasks retrieved successfully"
}
```

---

## 2. Create Task

### POST `/tasks`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Payload:**
```json
{
  "task_number": "TSK-2025-010",
  "title": "Implement User Authentication Enhancement",
  "description": "Add two-factor authentication and password reset functionality to improve security",
  "task_type": "FEATURE",
  "priority": "HIGH",
  "status": "NEW",
  "assigned_to_id": "3",
  "assigned_to_name": "Lisa Anderson",
  "assigned_to_email": "lisa.anderson@erp.local",
  "assigned_to_role": "IT",
  "assigned_by": "Sarah Johnson",
  "assigned_by_id": "1",
  "assigned_date": "2025-01-20",
  "start_date": "2025-01-22",
  "due_date": "2025-02-05",
  "progress_percentage": 0,
  "estimated_hours": 40,
  "actual_hours": null,
  "tags": ["feature", "security", "authentication"],
  "notes": "High priority security enhancement",
  "attachments": []
}
```

**Example cURL Request:**
```bash
curl -X POST 'http://localhost:3000/api/v1/tasks' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "title": "Implement User Authentication Enhancement",
    "description": "Add two-factor authentication and password reset functionality to improve security",
    "task_type": "FEATURE",
    "priority": "HIGH",
    "status": "NEW",
    "assigned_to_id": "3",
    "assigned_to_name": "Lisa Anderson",
    "assigned_to_email": "lisa.anderson@erp.local",
    "assigned_to_role": "IT",
    "assigned_by": "Sarah Johnson",
    "assigned_by_id": "1",
    "start_date": "2025-01-22",
    "due_date": "2025-02-05",
    "estimated_hours": 40,
    "tags": ["feature", "security", "authentication"],
    "notes": "High priority security enhancement"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "10",
      "task_number": "TSK-2025-010",
      "title": "Implement User Authentication Enhancement",
      "description": "Add two-factor authentication and password reset functionality to improve security",
      "task_type": "FEATURE",
      "priority": "HIGH",
      "status": "NEW",
      "assigned_to_id": "3",
      "assigned_to_name": "Lisa Anderson",
      "assigned_to_email": "lisa.anderson@erp.local",
      "assigned_to_role": "IT",
      "assigned_by": "Sarah Johnson",
      "assigned_by_id": "1",
      "assigned_date": "2025-01-20",
      "start_date": "2025-01-22",
      "due_date": "2025-02-05",
      "completed_date": null,
      "progress_percentage": 0,
      "estimated_hours": 40,
      "actual_hours": null,
      "tags": ["feature", "security", "authentication"],
      "notes": "High priority security enhancement",
      "attachments": [],
      "created_at": "2025-01-20T10:30:00.000Z",
      "updated_at": "2025-01-20T10:30:00.000Z"
    }
  },
  "message": "Task created successfully"
}
```

**Error Response (Validation Error):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "assigned_to_id",
        "message": "Assigned to ID is required"
      },
      {
        "field": "task_type",
        "message": "Task type must be one of: BUG, FEATURE, SUPPORT, MAINTENANCE, DOCUMENTATION, RESEARCH, OTHER"
      }
    ]
  }
}
```

---

## 3. Update Task

### PATCH `/tasks/:id`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): Task ID

**Request Payload (Partial Update - only include fields to update):**
```json
{
  "status": "IN_PROGRESS",
  "progress_percentage": 45,
  "actual_hours": 18,
  "notes": "Authentication module completed, working on password reset flow"
}
```

**Example cURL Request:**
```bash
curl -X PATCH 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "status": "IN_PROGRESS",
    "progress_percentage": 45,
    "actual_hours": 18,
    "notes": "Authentication module completed, working on password reset flow"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "10",
      "task_number": "TSK-2025-010",
      "title": "Implement User Authentication Enhancement",
      "description": "Add two-factor authentication and password reset functionality to improve security",
      "task_type": "FEATURE",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "assigned_to_id": "3",
      "assigned_to_name": "Lisa Anderson",
      "assigned_to_email": "lisa.anderson@erp.local",
      "assigned_to_role": "IT",
      "assigned_by": "Sarah Johnson",
      "assigned_by_id": "1",
      "assigned_date": "2025-01-20",
      "start_date": "2025-01-22",
      "due_date": "2025-02-05",
      "completed_date": null,
      "progress_percentage": 45,
      "estimated_hours": 40,
      "actual_hours": 18,
      "tags": ["feature", "security", "authentication"],
      "notes": "Authentication module completed, working on password reset flow",
      "attachments": [],
      "created_at": "2025-01-20T10:30:00.000Z",
      "updated_at": "2025-01-25T14:20:00.000Z"
    }
  },
  "message": "Task updated successfully"
}
```

**Error Response (Task Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

## 4. Get Single Task

### GET `/tasks/:id`

**URL Parameters:**
- `id` (required): Task ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "10",
      "task_number": "TSK-2025-010",
      "title": "Implement User Authentication Enhancement",
      "description": "Add two-factor authentication and password reset functionality to improve security",
      "task_type": "FEATURE",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "assigned_to_id": "3",
      "assigned_to_name": "Lisa Anderson",
      "assigned_to_email": "lisa.anderson@erp.local",
      "assigned_to_role": "IT",
      "assigned_by": "Sarah Johnson",
      "assigned_by_id": "1",
      "assigned_date": "2025-01-20",
      "start_date": "2025-01-22",
      "due_date": "2025-02-05",
      "completed_date": null,
      "progress_percentage": 45,
      "estimated_hours": 40,
      "actual_hours": 18,
      "tags": ["feature", "security", "authentication"],
      "notes": "Authentication module completed, working on password reset flow",
      "attachments": [],
      "created_at": "2025-01-20T10:30:00.000Z",
      "updated_at": "2025-01-25T14:20:00.000Z"
    }
  },
  "message": "Task retrieved successfully"
}
```

---

## 5. Delete Task

### DELETE `/tasks/:id`

**URL Parameters:**
- `id` (required): Task ID

**Example Request:**
```bash
curl -X DELETE 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

## Field Descriptions

### Required Fields (Create Task)
- `title` (string): Task title/name
- `assigned_to_id` (string): ID of the user assigned to the task
- `task_type` (enum): Type of task (`BUG`, `FEATURE`, `SUPPORT`, `MAINTENANCE`, `DOCUMENTATION`, `RESEARCH`, `OTHER`)
- `priority` (enum): Priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `status` (enum): Task status (`NEW`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `CANCELLED`)

### Optional Fields
- `task_number` (string): Auto-generated task number (format: `TSK-YYYY-###`)
- `description` (string): Detailed task description
- `assigned_to_name` (string): Name of assigned user
- `assigned_to_email` (string): Email of assigned user
- `assigned_to_role` (string): Role of assigned user
- `assigned_by` (string): Name of person who assigned the task
- `assigned_by_id` (string): ID of person who assigned the task
- `assigned_date` (date): Date when task was assigned (YYYY-MM-DD)
- `start_date` (date): Task start date (YYYY-MM-DD)
- `due_date` (date): Task due date (YYYY-MM-DD)
- `completed_date` (date): Task completion date (YYYY-MM-DD)
- `progress_percentage` (number): Progress percentage (0-100)
- `estimated_hours` (number): Estimated hours to complete
- `actual_hours` (number): Actual hours spent
- `tags` (array): Array of tag strings
- `notes` (string): Additional notes
- `attachments` (array): Array of attachment URLs or file paths

---

## Common Use Cases

### 1. Create a New Bug Task
```bash
curl -X POST 'http://localhost:3000/api/v1/tasks' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "title": "Fix Login Page CSS Issue",
    "description": "Login button alignment is broken on mobile devices",
    "task_type": "BUG",
    "priority": "HIGH",
    "status": "NEW",
    "assigned_to_id": "5",
    "assigned_to_name": "John Doe",
    "start_date": "2025-01-25",
    "due_date": "2025-01-27",
    "estimated_hours": 4,
    "tags": ["bug", "frontend", "mobile"]
  }'
```

### 2. Update Task Progress
```bash
curl -X PATCH 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "status": "IN_PROGRESS",
    "progress_percentage": 75,
    "actual_hours": 30
  }'
```

### 3. Complete a Task
```bash
curl -X PATCH 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "status": "COMPLETED",
    "progress_percentage": 100,
    "completed_date": "2025-02-03",
    "actual_hours": 38
  }'
```

### 4. Reassign Task
```bash
curl -X PATCH 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "assigned_to_id": "7",
    "assigned_to_name": "Jane Smith",
    "assigned_to_email": "jane.smith@erp.local",
    "assigned_date": "2025-01-26"
  }'
```

### 5. Put Task On Hold
```bash
curl -X PATCH 'http://localhost:3000/api/v1/tasks/10' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "status": "ON_HOLD",
    "notes": "Waiting for client approval on design mockups"
  }'
```

---

## Notes

1. **Task Number**: Auto-generated if not provided (format: `TSK-YYYY-###`)
2. **Date Format**: All dates should be in `YYYY-MM-DD` format
3. **Arrays**: Tags and attachments should be provided as JSON arrays
4. **Progress Percentage**: Should be between 0 and 100
5. **Status Transitions**: 
   - `NEW` → `IN_PROGRESS` → `COMPLETED`
   - Can also transition to `ON_HOLD` or `CANCELLED` from any status
6. **Partial Updates**: PATCH endpoint accepts partial updates - only include fields you want to change
7. **Validation**: All required fields must be provided for creation
8. **Assignment**: When assigning a task, ensure `assigned_to_id` matches a valid user ID

---

## Task Status Workflow

```
NEW → IN_PROGRESS → COMPLETED
  ↓         ↓
ON_HOLD  CANCELLED
```

**Status Descriptions:**
- **NEW**: Task has been created but not started
- **IN_PROGRESS**: Task is currently being worked on
- **COMPLETED**: Task has been finished
- **ON_HOLD**: Task is temporarily paused
- **CANCELLED**: Task has been cancelled and will not be completed

---

## Task Priority Levels

- **LOW**: Can be done when time permits
- **MEDIUM**: Normal priority, should be completed within deadline
- **HIGH**: Important, requires attention soon
- **URGENT**: Critical, needs immediate attention

---

## Task Types

- **BUG**: Bug fix or issue resolution
- **FEATURE**: New feature development
- **SUPPORT**: Customer or internal support request
- **MAINTENANCE**: System maintenance or updates
- **DOCUMENTATION**: Documentation creation or updates
- **RESEARCH**: Research or investigation task
- **OTHER**: Other types of tasks

