# Profile Update API Documentation

This document provides API documentation for user profile management endpoints.

## Base URL
```
http://localhost:3000/api/v1
```
Or your configured `VITE_API_BASE_URL` environment variable.

---

## 1. Get Current User Profile

**Endpoint**: `GET /users/me`

**Description**: Retrieves the profile information of the currently authenticated user.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "id": "1",
  "email": "admin@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Manager",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "role": "ADMIN",
  "created_at": "2025-01-20T10:00:00.000Z",
  "updated_at": "2025-01-20T10:00:00.000Z"
}
```

**Alternative Response Format**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@aiklisolve.com",
      "first_name": "John",
      "last_name": "Doe",
      "mobile": "+1-555-0100",
      "phone": "+1-555-0101",
      "department": "Finance",
      "designation": "Manager",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "pincode": "10001",
      "role": "ADMIN",
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T10:00:00.000Z"
    }
  }
}
```

---

## 2. Get User Profile by ID

**Endpoint**: `GET /users/:id`

**Description**: Retrieves the profile information of a specific user by ID.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/users/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response** (200 OK):
```json
{
  "id": "1",
  "email": "admin@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Manager",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "role": "ADMIN",
  "created_at": "2025-01-20T10:00:00.000Z",
  "updated_at": "2025-01-20T10:00:00.000Z"
}
```

---

## 3. Update Current User Profile

**Endpoint**: `PATCH /users/me`

**Description**: Updates the profile information of the currently authenticated user.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@aiklisolve.com",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+1-555-0100",
    "phone": "+1-555-0101",
    "department": "Finance",
    "designation": "Senior Manager",
    "address": "123 Main Street, Suite 100",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

**Request Payload** (all fields optional except email):
```json
{
  "email": "john.doe@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Senior Manager",
  "address": "123 Main Street, Suite 100",
  "city": "New York",
  "state": "NY",
  "pincode": "10001"
}
```

**Response** (200 OK):
```json
{
  "id": "1",
  "email": "john.doe@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Senior Manager",
  "address": "123 Main Street, Suite 100",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "role": "ADMIN",
  "created_at": "2025-01-20T10:00:00.000Z",
  "updated_at": "2025-01-20T15:30:00.000Z"
}
```

**Alternative Response Format**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "john.doe@aiklisolve.com",
      "first_name": "John",
      "last_name": "Doe",
      "mobile": "+1-555-0100",
      "phone": "+1-555-0101",
      "department": "Finance",
      "designation": "Senior Manager",
      "address": "123 Main Street, Suite 100",
      "city": "New York",
      "state": "NY",
      "pincode": "10001",
      "role": "ADMIN",
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T15:30:00.000Z"
    }
  }
}
```

---

## 4. Update User Profile by ID

**Endpoint**: `PATCH /users/:id`

**Description**: Updates the profile information of a specific user by ID. (Admin only)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:3000/api/v1/users/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@aiklisolve.com",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+1-555-0100",
    "phone": "+1-555-0101",
    "department": "Finance",
    "designation": "Senior Manager",
    "address": "123 Main Street, Suite 100",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

**Request Payload** (all fields optional):
```json
{
  "email": "john.doe@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Senior Manager",
  "address": "123 Main Street, Suite 100",
  "city": "New York",
  "state": "NY",
  "pincode": "10001"
}
```

**Response** (200 OK):
```json
{
  "id": "1",
  "email": "john.doe@aiklisolve.com",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "+1-555-0100",
  "phone": "+1-555-0101",
  "department": "Finance",
  "designation": "Senior Manager",
  "address": "123 Main Street, Suite 100",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "role": "ADMIN",
  "created_at": "2025-01-20T10:00:00.000Z",
  "updated_at": "2025-01-20T15:30:00.000Z"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please provide a valid authentication token.",
  "error": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden. You do not have permission to perform this action.",
  "error": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found",
  "error": "NOT_FOUND"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "mobile": "Invalid mobile number format"
  }
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

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address (must be unique and valid format) |
| `first_name` | string | No | User's first name |
| `last_name` | string | No | User's last name |
| `mobile` | string | No | User's mobile phone number |
| `phone` | string | No | User's phone number (work phone) |
| `department` | string | No | User's department |
| `designation` | string | No | User's job title/designation |
| `address` | string | No | User's street address |
| `city` | string | No | User's city |
| `state` | string | No | User's state/province |
| `pincode` | string | No | User's postal/zip code |

---

## Notes

1. **Authentication**: All endpoints require a valid Bearer token in the Authorization header.
2. **Email Validation**: Email must be a valid email format and unique across all users.
3. **Phone Validation**: Mobile and phone numbers should follow international format (e.g., +1-555-0100).
4. **Role Field**: The `role` field is read-only and cannot be updated through the profile update endpoint.
5. **Partial Updates**: All fields in the update payload are optional. Only provided fields will be updated.
6. **Response Formats**: The API may return data in different formats:
   - Direct object: `{ id, email, ... }`
   - Wrapped in `data`: `{ success: true, data: { user: {...} } }`
   - Wrapped in `data` with `user` key: `{ success: true, data: { user: {...} } }`

---

## Example: Complete Profile Update Flow

### Step 1: Get Current User Profile
```bash
curl -X GET "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json"
```

### Step 2: Update Profile
```bash
curl -X PATCH "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+1-555-0100",
    "department": "Finance",
    "designation": "Senior Manager",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

### Step 3: Verify Update
```bash
curl -X GET "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json"
```

---

## Frontend Integration

The frontend `ProfileSettingsModal` component:
1. Fetches user details from `/users/me` or `/users/:id` on modal open
2. Displays all user fields in an editable form
3. Calls `PATCH /users/me` or `PATCH /users/:id` to update the profile
4. Updates localStorage with the new user data
5. Reloads the page to reflect changes

The component handles both response formats and falls back to localStorage if the API is unavailable.

