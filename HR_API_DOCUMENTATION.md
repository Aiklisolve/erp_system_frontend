# HR Management Module API Documentation

## Base URL
```
http://localhost:3000/api/v1/hr
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. List Employees

### GET `/hr/employees`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100)
- `status` (optional): Filter by status (`ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`, `RESIGNED`, `RETIRED`)
- `department` (optional): Filter by department (`IT`, `FINANCE`, `OPERATIONS`, `SALES`, `HR`, `WAREHOUSE`, `PROCUREMENT`, `MANUFACTURING`, `CUSTOMER_SERVICE`, `ADMINISTRATION`, `MARKETING`, `OTHER`)
- `employment_type` (optional): Filter by employment type (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `INTERN`, `CONSULTANT`)
- `search` (optional): Search by name, email, or employee number

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/hr/employees?page=1&limit=100&status=ACTIVE&department=FINANCE' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "emp-1",
        "employee_number": "EMP-2022-PRI001",
        "employee_id": "emp-1",
        "first_name": "Priya",
        "last_name": "Sharma",
        "full_name": "Priya Sharma",
        "email": "priya.sharma@erp.local",
        "phone": "+1 555-0101",
        "date_of_birth": "1990-05-15",
        "gender": "FEMALE",
        "marital_status": "MARRIED",
        "national_id": "SSN-123-45-6789",
        "address": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA",
        "role": "Finance Manager",
        "erp_role": "FINANCE_MANAGER",
        "department": "FINANCE",
        "employment_type": "FULL_TIME",
        "status": "ACTIVE",
        "join_date": "2022-04-01",
        "probation_end_date": "2022-07-01",
        "manager_name": "CEO",
        "reporting_manager": "CEO",
        "salary": 75000,
        "hourly_rate": null,
        "currency": "USD",
        "pay_frequency": "MONTHLY",
        "bonus": 5000,
        "commission_rate": null,
        "skills": ["Financial Analysis", "Budgeting", "ERP Systems"],
        "certifications": ["CPA", "CFA"],
        "education_level": "MASTER",
        "education_field": "Finance",
        "years_of_experience": 8,
        "performance_rating": 4.7,
        "last_review_date": "2024-12-01",
        "next_review_date": "2025-06-01",
        "annual_leave_balance": 15,
        "sick_leave_balance": 10,
        "other_leave_balance": 0,
        "notes": "Excellent performance, leading finance team",
        "created_at": "2022-04-01T00:00:00.000Z",
        "updated_at": "2024-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Employees retrieved successfully"
}
```

---

## 2. Create Employee

### POST `/hr/employees`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Payload:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@erp.local",
  "phone": "+1 555-0105",
  "date_of_birth": "1992-03-20",
  "gender": "MALE",
  "marital_status": "SINGLE",
  "national_id": "SSN-987-65-4321",
  "passport_number": "P1234567",
  "address": "456 Oak Avenue",
  "city": "Los Angeles",
  "state": "CA",
  "postal_code": "90001",
  "country": "USA",
  "alternate_phone": "+1 555-0106",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1 555-0107",
  "emergency_contact_relationship": "Sister",
  "role": "Software Developer",
  "erp_role": "IT",
  "department": "IT",
  "employment_type": "FULL_TIME",
  "status": "ACTIVE",
  "join_date": "2025-01-15",
  "probation_end_date": "2025-04-15",
  "contract_start_date": "2025-01-15",
  "contract_end_date": null,
  "manager_id": "emp-1",
  "manager_name": "Tech Lead",
  "reporting_manager": "Tech Lead",
  "team": "Development Team",
  "salary": 85000,
  "hourly_rate": null,
  "currency": "USD",
  "pay_frequency": "MONTHLY",
  "bonus": 0,
  "commission_rate": null,
  "benefits": ["Health Insurance", "Dental", "401k"],
  "insurance_policy_number": "INS-12345",
  "insurance_expiry": "2025-12-31",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "certifications": ["AWS Certified Developer"],
  "education_level": "BACHELOR",
  "education_field": "Computer Science",
  "years_of_experience": 5,
  "performance_rating": null,
  "last_review_date": null,
  "next_review_date": "2025-07-15",
  "annual_leave_balance": 20,
  "sick_leave_balance": 10,
  "other_leave_balance": 0,
  "notes": "New hire, excellent technical skills",
  "internal_notes": "Pending background check",
  "tags": ["Senior", "Full-Stack"]
}
```

**Example cURL Request:**
```bash
curl -X POST 'http://localhost:3000/api/v1/hr/employees' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@erp.local",
    "phone": "+1 555-0105",
    "date_of_birth": "1992-03-20",
    "gender": "MALE",
    "marital_status": "SINGLE",
    "national_id": "SSN-987-65-4321",
    "address": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "postal_code": "90001",
    "country": "USA",
    "role": "Software Developer",
    "erp_role": "IT",
    "department": "IT",
    "employment_type": "FULL_TIME",
    "status": "ACTIVE",
    "join_date": "2025-01-15",
    "probation_end_date": "2025-04-15",
    "manager_name": "Tech Lead",
    "reporting_manager": "Tech Lead",
    "salary": 85000,
    "currency": "USD",
    "pay_frequency": "MONTHLY",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "education_level": "BACHELOR",
    "education_field": "Computer Science",
    "years_of_experience": 5,
    "annual_leave_balance": 20,
    "sick_leave_balance": 10,
    "notes": "New hire, excellent technical skills"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp-5",
      "employee_number": "EMP-2025-JOH005",
      "employee_id": "emp-5",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@erp.local",
      "phone": "+1 555-0105",
      "date_of_birth": "1992-03-20",
      "gender": "MALE",
      "marital_status": "SINGLE",
      "national_id": "SSN-987-65-4321",
      "passport_number": "P1234567",
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "postal_code": "90001",
      "country": "USA",
      "alternate_phone": "+1 555-0106",
      "emergency_contact_name": "Jane Doe",
      "emergency_contact_phone": "+1 555-0107",
      "emergency_contact_relationship": "Sister",
      "role": "Software Developer",
      "erp_role": "IT",
      "department": "IT",
      "employment_type": "FULL_TIME",
      "status": "ACTIVE",
      "join_date": "2025-01-15",
      "probation_end_date": "2025-04-15",
      "contract_start_date": "2025-01-15",
      "contract_end_date": null,
      "manager_id": "emp-1",
      "manager_name": "Tech Lead",
      "reporting_manager": "Tech Lead",
      "team": "Development Team",
      "salary": 85000,
      "hourly_rate": null,
      "currency": "USD",
      "pay_frequency": "MONTHLY",
      "bonus": 0,
      "commission_rate": null,
      "benefits": ["Health Insurance", "Dental", "401k"],
      "insurance_policy_number": "INS-12345",
      "insurance_expiry": "2025-12-31",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "certifications": ["AWS Certified Developer"],
      "education_level": "BACHELOR",
      "education_field": "Computer Science",
      "years_of_experience": 5,
      "performance_rating": null,
      "last_review_date": null,
      "next_review_date": "2025-07-15",
      "annual_leave_balance": 20,
      "sick_leave_balance": 10,
      "other_leave_balance": 0,
      "notes": "New hire, excellent technical skills",
      "internal_notes": "Pending background check",
      "tags": ["Senior", "Full-Stack"],
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  },
  "message": "Employee created successfully"
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
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "first_name",
        "message": "First name is required"
      },
      {
        "field": "last_name",
        "message": "Last name is required"
      }
    ]
  }
}
```

**Error Response (Duplicate Email):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Employee with this email already exists"
  }
}
```

---

## 3. Update Employee

### PATCH `/hr/employees/:id`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): Employee ID

**Request Payload (Partial Update - only include fields to update):**
```json
{
  "salary": 90000,
  "performance_rating": 4.5,
  "last_review_date": "2025-01-20",
  "next_review_date": "2025-07-20",
  "status": "ACTIVE",
  "annual_leave_balance": 18,
  "sick_leave_balance": 8,
  "notes": "Performance review completed. Exceeded expectations.",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"]
}
```

**Example cURL Request:**
```bash
curl -X PATCH 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "salary": 90000,
    "performance_rating": 4.5,
    "last_review_date": "2025-01-20",
    "next_review_date": "2025-07-20",
    "status": "ACTIVE",
    "annual_leave_balance": 18,
    "sick_leave_balance": 8,
    "notes": "Performance review completed. Exceeded expectations.",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp-5",
      "employee_number": "EMP-2025-JOH005",
      "employee_id": "emp-5",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@erp.local",
      "phone": "+1 555-0105",
      "date_of_birth": "1992-03-20",
      "gender": "MALE",
      "marital_status": "SINGLE",
      "national_id": "SSN-987-65-4321",
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "postal_code": "90001",
      "country": "USA",
      "role": "Software Developer",
      "erp_role": "IT",
      "department": "IT",
      "employment_type": "FULL_TIME",
      "status": "ACTIVE",
      "join_date": "2025-01-15",
      "probation_end_date": "2025-04-15",
      "manager_name": "Tech Lead",
      "reporting_manager": "Tech Lead",
      "salary": 90000,
      "currency": "USD",
      "pay_frequency": "MONTHLY",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"],
      "education_level": "BACHELOR",
      "education_field": "Computer Science",
      "years_of_experience": 5,
      "performance_rating": 4.5,
      "last_review_date": "2025-01-20",
      "next_review_date": "2025-07-20",
      "annual_leave_balance": 18,
      "sick_leave_balance": 8,
      "other_leave_balance": 0,
      "notes": "Performance review completed. Exceeded expectations.",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-20T14:45:00.000Z"
    }
  },
  "message": "Employee updated successfully"
}
```

**Error Response (Employee Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
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
        "field": "salary",
        "message": "Salary must be a positive number"
      }
    ]
  }
}
```

---

## 4. Get Single Employee

### GET `/hr/employees/:id`

**URL Parameters:**
- `id` (required): Employee ID

**Example Request:**
```bash
curl 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp-5",
      "employee_number": "EMP-2025-JOH005",
      "employee_id": "emp-5",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@erp.local",
      "phone": "+1 555-0105",
      "date_of_birth": "1992-03-20",
      "gender": "MALE",
      "marital_status": "SINGLE",
      "national_id": "SSN-987-65-4321",
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "postal_code": "90001",
      "country": "USA",
      "role": "Software Developer",
      "erp_role": "IT",
      "department": "IT",
      "employment_type": "FULL_TIME",
      "status": "ACTIVE",
      "join_date": "2025-01-15",
      "probation_end_date": "2025-04-15",
      "manager_name": "Tech Lead",
      "reporting_manager": "Tech Lead",
      "salary": 90000,
      "currency": "USD",
      "pay_frequency": "MONTHLY",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"],
      "education_level": "BACHELOR",
      "education_field": "Computer Science",
      "years_of_experience": 5,
      "performance_rating": 4.5,
      "last_review_date": "2025-01-20",
      "next_review_date": "2025-07-20",
      "annual_leave_balance": 18,
      "sick_leave_balance": 8,
      "notes": "Performance review completed. Exceeded expectations.",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-20T14:45:00.000Z"
    }
  },
  "message": "Employee retrieved successfully"
}
```

---

## 5. Delete Employee

### DELETE `/hr/employees/:id`

**URL Parameters:**
- `id` (required): Employee ID

**Example Request:**
```bash
curl -X DELETE 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Authorization: Bearer <token>'
```

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
}
```

---

## Field Descriptions

### Required Fields (Create Employee)
- `first_name` (string): Employee's first name
- `last_name` (string): Employee's last name
- `email` (string): Employee's email address (must be unique)
- `role` (string): Job title/position
- `employment_type` (enum): `FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `INTERN`, `CONSULTANT`
- `status` (enum): `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`, `RESIGNED`, `RETIRED`
- `join_date` (date): Employee hire date (YYYY-MM-DD)

### Optional Fields
- `employee_number` (string): Auto-generated employee ID
- `date_of_birth` (date): Date of birth (YYYY-MM-DD)
- `gender` (enum): `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`
- `marital_status` (enum): `SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`, `OTHER`
- `national_id` (string): National ID/SSN
- `passport_number` (string): Passport number
- `phone` (string): Primary phone number
- `alternate_phone` (string): Alternate phone number
- `address` (string): Street address
- `city` (string): City
- `state` (string): State/Province
- `postal_code` (string): ZIP/Postal code
- `country` (string): Country
- `emergency_contact_name` (string): Emergency contact name
- `emergency_contact_phone` (string): Emergency contact phone
- `emergency_contact_relationship` (string): Relationship to employee
- `erp_role` (enum): ERP system role (`ADMIN`, `FINANCE_MANAGER`, `INVENTORY_MANAGER`, etc.)
- `department` (enum): Department (`IT`, `FINANCE`, `OPERATIONS`, `SALES`, `HR`, `WAREHOUSE`, etc.)
- `probation_end_date` (date): End date of probation period
- `contract_start_date` (date): Contract start date
- `contract_end_date` (date): Contract end date
- `manager_id` (string): Manager's employee ID
- `manager_name` (string): Manager's name
- `reporting_manager` (string): Reporting manager name
- `team` (string): Team name
- `salary` (number): Annual/monthly salary
- `hourly_rate` (number): Hourly rate (for hourly employees)
- `currency` (string): Currency code (default: "USD")
- `pay_frequency` (enum): `MONTHLY`, `BIWEEKLY`, `WEEKLY`, `DAILY`
- `bonus` (number): Bonus amount
- `commission_rate` (number): Commission rate percentage
- `benefits` (array): List of benefits
- `insurance_policy_number` (string): Insurance policy number
- `insurance_expiry` (date): Insurance expiry date
- `skills` (array): List of skills
- `certifications` (array): List of certifications
- `education_level` (enum): `HIGH_SCHOOL`, `ASSOCIATE`, `BACHELOR`, `MASTER`, `DOCTORATE`, `OTHER`
- `education_field` (string): Field of study
- `years_of_experience` (number): Years of experience
- `performance_rating` (number): Performance rating (1-5)
- `last_review_date` (date): Last performance review date
- `next_review_date` (date): Next performance review date
- `annual_leave_balance` (number): Annual leave balance
- `sick_leave_balance` (number): Sick leave balance
- `other_leave_balance` (number): Other leave balance
- `notes` (string): Public notes
- `internal_notes` (string): Internal/private notes
- `tags` (array): Tags for categorization

---

## Common Use Cases

### 1. Create a New Full-Time Employee
```bash
curl -X POST 'http://localhost:3000/api/v1/hr/employees' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@erp.local",
    "phone": "+1 555-0200",
    "role": "HR Manager",
    "department": "HR",
    "employment_type": "FULL_TIME",
    "status": "ACTIVE",
    "join_date": "2025-02-01",
    "salary": 70000,
    "currency": "USD",
    "pay_frequency": "MONTHLY"
  }'
```

### 2. Update Employee Salary After Promotion
```bash
curl -X PATCH 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "salary": 95000,
    "role": "Senior Software Developer",
    "last_promotion_date": "2025-01-25"
  }'
```

### 3. Update Employee Leave Balance
```bash
curl -X PATCH 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "annual_leave_balance": 15,
    "sick_leave_balance": 7
  }'
```

### 4. Terminate Employee
```bash
curl -X PATCH 'http://localhost:3000/api/v1/hr/employees/emp-5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "status": "TERMINATED",
    "termination_date": "2025-01-30",
    "notes": "Employee terminated due to policy violation"
  }'
```

---

## Notes

1. **Employee Number**: Auto-generated if not provided (format: `EMP-YYYY-XXX###`)
2. **Full Name**: Auto-generated from `first_name` and `last_name` if not provided
3. **Email Uniqueness**: Email must be unique across all employees
4. **Date Format**: All dates should be in `YYYY-MM-DD` format
5. **Arrays**: Skills, certifications, benefits, and tags should be provided as JSON arrays
6. **Partial Updates**: PATCH endpoint accepts partial updates - only include fields you want to change
7. **Validation**: All required fields must be provided for creation
8. **Status Changes**: Status changes may trigger workflow notifications

