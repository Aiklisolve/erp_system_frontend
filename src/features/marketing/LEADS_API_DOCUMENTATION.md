# Marketing Leads API Documentation

This document describes the REST API endpoints for managing Marketing Leads in the ERP system.

## Base URL
```
http://localhost:3000/api/v1/marketing/leads
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. List Leads

Retrieve a list of marketing leads, optionally filtered by campaign.

### Endpoint
```
GET /api/v1/marketing/leads
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | No | Filter leads by campaign ID |

### cURL Example
```bash
# Get all leads
curl -X GET "http://localhost:3000/api/v1/marketing/leads" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# Get leads for a specific campaign
curl -X GET "http://localhost:3000/api/v1/marketing/leads?campaign_id=camp-1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "lead_code": "LEAD-2025-000001",
      "campaign_id": "camp-1",
      "campaign_name": "Q1 Product Launch",
      "source": "Website Form",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0101",
      "company": "Acme Corp",
      "job_title": "CTO",
      "status": "NEW",
      "score": 75,
      "notes": "Interested in enterprise features",
      "created_at": "2025-01-05T10:00:00.000Z",
      "updated_at": "2025-01-05T10:00:00.000Z"
    },
    {
      "id": "2",
      "lead_code": "LEAD-2025-000002",
      "campaign_id": "camp-1",
      "campaign_name": "Q1 Product Launch",
      "source": "Social Media",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0102",
      "company": "Tech Solutions Inc",
      "job_title": "Marketing Manager",
      "status": "CONTACTED",
      "score": 60,
      "notes": "Follow up scheduled",
      "created_at": "2025-01-06T10:00:00.000Z",
      "updated_at": "2025-01-07T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

### Alternative Response Format (Array)
```json
[
  {
    "id": "1",
    "lead_code": "LEAD-2025-000001",
    "campaign_id": "camp-1",
    "campaign_name": "Q1 Product Launch",
    "source": "Website Form",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "company": "Acme Corp",
    "job_title": "CTO",
    "status": "NEW",
    "score": 75,
    "notes": "Interested in enterprise features",
    "created_at": "2025-01-05T10:00:00.000Z",
    "updated_at": "2025-01-05T10:00:00.000Z"
  }
]
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error",
  "error_code": "42P01",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

---

## 2. Get Single Lead

Retrieve a single marketing lead by ID.

### Endpoint
```
GET /api/v1/marketing/leads/:id
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Lead ID |

### cURL Example
```bash
curl -X GET "http://localhost:3000/api/v1/marketing/leads/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "1",
    "lead_code": "LEAD-2025-000001",
    "campaign_id": "camp-1",
    "campaign_name": "Q1 Product Launch",
    "source": "Website Form",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "company": "Acme Corp",
    "job_title": "CTO",
    "status": "NEW",
    "score": 75,
    "notes": "Interested in enterprise features",
    "created_at": "2025-01-05T10:00:00.000Z",
    "updated_at": "2025-01-05T10:00:00.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Lead not found",
  "error_code": "LEAD_NOT_FOUND",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

---

## 3. Create Lead

Create a new marketing lead.

### Endpoint
```
POST /api/v1/marketing/leads
```

### Request Body
```json
{
  "campaign_id": "camp-1",
  "campaign_name": "Q1 Product Launch",
  "source": "Website Form",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "company": "Acme Corp",
  "job_title": "CTO",
  "status": "NEW",
  "score": 75,
  "notes": "Interested in enterprise features"
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `campaign_id` | string | No | Associated campaign ID (foreign key to `marketing_campaigns.id`) |
| `campaign_name` | string | No | Campaign name (can be auto-populated from campaign_id) |
| `source` | string | No | Lead source (e.g., "Website Form", "Social Media", "Referral") |
| `first_name` | string | No | Lead's first name (max 100 characters) |
| `last_name` | string | No | Lead's last name (max 100 characters) |
| `email` | string | No | Lead's email address (max 255 characters) |
| `phone` | string | No | Lead's phone number (max 20 characters) |
| `company` | string | No | Lead's company name (max 255 characters) |
| `job_title` | string | No | Lead's job title (max 255 characters) |
| `status` | string | No | Lead status: `NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `LOST` (default: `NEW`) |
| `score` | number | No | Lead score (0-100, default: 0) |
| `notes` | string | No | Additional notes about the lead (TEXT) |

**Note:** `lead_code` is auto-generated by the backend if not provided.

### cURL Example
```bash
curl -X POST "http://localhost:3000/api/v1/marketing/leads" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "camp-1",
    "source": "Website Form",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "company": "Acme Corp",
    "job_title": "CTO",
    "status": "NEW",
    "score": 75,
    "notes": "Interested in enterprise features"
  }'
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "3",
    "lead_code": "LEAD-2025-000003",
    "campaign_id": "camp-1",
    "campaign_name": "Q1 Product Launch",
    "source": "Website Form",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "company": "Acme Corp",
    "job_title": "CTO",
    "status": "NEW",
    "score": 75,
    "notes": "Interested in enterprise features",
    "created_at": "2025-01-10T10:00:00.000Z",
    "updated_at": "2025-01-10T10:00:00.000Z"
  }
}
```

### Alternative Response Format (Direct Object)
```json
{
  "id": "3",
  "lead_code": "LEAD-2025-000003",
  "campaign_id": "camp-1",
  "campaign_name": "Q1 Product Launch",
  "source": "Website Form",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "company": "Acme Corp",
  "job_title": "CTO",
  "status": "NEW",
  "score": 75,
  "notes": "Interested in enterprise features",
  "created_at": "2025-01-10T10:00:00.000Z",
  "updated_at": "2025-01-10T10:00:00.000Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format",
    "score": "Score must be between 0 and 100"
  },
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error",
  "error_code": "DATABASE_ERROR",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

---

## 4. Update Lead

Update an existing marketing lead.

### Endpoint
```
PATCH /api/v1/marketing/leads/:id
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Lead ID |

### Request Body
All fields are optional. Only include fields that need to be updated.
```json
{
  "status": "QUALIFIED",
  "score": 85,
  "notes": "Qualified lead, ready for sales follow-up"
}
```

### cURL Example
```bash
curl -X PATCH "http://localhost:3000/api/v1/marketing/leads/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED",
    "score": 85,
    "notes": "Qualified lead, ready for sales follow-up"
  }'
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "1",
    "lead_code": "LEAD-2025-000001",
    "campaign_id": "camp-1",
    "campaign_name": "Q1 Product Launch",
    "source": "Website Form",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "company": "Acme Corp",
    "job_title": "CTO",
    "status": "QUALIFIED",
    "score": 85,
    "notes": "Qualified lead, ready for sales follow-up",
    "created_at": "2025-01-05T10:00:00.000Z",
    "updated_at": "2025-01-10T11:00:00.000Z"
  }
}
```

### Alternative Response Format (Direct Object)
```json
{
  "id": "1",
  "lead_code": "LEAD-2025-000001",
  "campaign_id": "camp-1",
  "campaign_name": "Q1 Product Launch",
  "source": "Website Form",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "company": "Acme Corp",
  "job_title": "CTO",
  "status": "QUALIFIED",
  "score": 85,
  "notes": "Qualified lead, ready for sales follow-up",
  "created_at": "2025-01-05T10:00:00.000Z",
  "updated_at": "2025-01-10T11:00:00.000Z"
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Lead not found",
  "error_code": "LEAD_NOT_FOUND",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "score": "Score must be between 0 and 100"
  },
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

---

## 5. Delete Lead

Delete a marketing lead.

### Endpoint
```
DELETE /api/v1/marketing/leads/:id
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Lead ID |

### cURL Example
```bash
curl -X DELETE "http://localhost:3000/api/v1/marketing/leads/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### Alternative Success Response (204 No Content)
```
(No response body)
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Lead not found",
  "error_code": "LEAD_NOT_FOUND",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error",
  "error_code": "DATABASE_ERROR",
  "timestamp": "2025-01-10T10:41:50.953Z"
}
```

---

## Data Types

### Lead Object
```typescript
{
  id: string;                    // Auto-generated lead ID (BIGSERIAL)
  lead_code?: string;           // Auto-generated lead code (e.g., "LEAD-2025-000001")
  campaign_id?: string;         // Foreign key to marketing_campaigns.id (nullable)
  campaign_name?: string;        // Campaign name (max 255 chars)
  source?: string;              // Lead source (max 255 chars)
  first_name?: string;          // First name (max 100 chars)
  last_name?: string;           // Last name (max 100 chars)
  email?: string;               // Email address (max 255 chars)
  phone?: string;               // Phone number (max 20 chars)
  company?: string;             // Company name (max 255 chars)
  job_title?: string;           // Job title (max 255 chars)
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';  // Lead status (default: 'NEW')
  score?: number;               // Lead score (0-100, default: 0)
  notes?: string;              // Additional notes (TEXT)
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // ISO 8601 timestamp
}
```

### Lead Status Enum
- `NEW` - Newly created lead (default)
- `CONTACTED` - Lead has been contacted
- `QUALIFIED` - Lead has been qualified
- `CONVERTED` - Lead has been converted to customer
- `LOST` - Lead is lost/no longer interested

---

## Response Format Notes

The frontend is flexible and can handle multiple response formats:

1. **Wrapped Response:**
   ```json
   {
     "success": true,
     "data": [...]
   }
   ```

2. **Direct Array/Object:**
   ```json
   [...]
   ```
   or
   ```json
   { "id": "...", ... }
   ```

3. **Alternative Wrapped:**
   ```json
   {
     "leads": [...]
   }
   ```

The frontend will automatically parse and normalize these formats.

---

## CORS Configuration

The backend must handle CORS preflight (OPTIONS) requests. See `BACKEND_CORS_CONFIG.md` for details.

### Expected OPTIONS Response Headers
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

## Database Schema Reference

The `marketing_leads` table structure:

```sql
CREATE TABLE public.marketing_leads (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  lead_code VARCHAR(50) UNIQUE,
  campaign_id BIGINT,
  campaign_name VARCHAR(255),
  source VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  job_title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'NEW',
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT marketing_leads_campaign_id_fkey 
    FOREIGN KEY (campaign_id) 
    REFERENCES marketing_campaigns(id) 
    ON DELETE SET NULL
);

CREATE INDEX idx_marketing_leads_campaign_id ON public.marketing_leads(campaign_id);
CREATE INDEX idx_marketing_leads_status ON public.marketing_leads(status);
CREATE INDEX idx_marketing_leads_email ON public.marketing_leads(email);

-- Trigger to auto-generate lead_code
CREATE TRIGGER trigger_generate_lead_code
  BEFORE INSERT ON marketing_leads
  FOR EACH ROW
  WHEN (NEW.lead_code IS NULL OR NEW.lead_code::text = ''::text)
  EXECUTE FUNCTION generate_lead_code();

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_marketing_leads_updated_at
  BEFORE UPDATE ON marketing_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_campaigns_updated_at();
```

---

## Example Workflows

### Create Lead from Campaign
```bash
# 1. Create lead
curl -X POST "http://localhost:3000/api/v1/marketing/leads" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "camp-5",
    "source": "Website Form",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@example.com",
    "phone": "+1-555-0200",
    "company": "Tech Innovations",
    "job_title": "VP of Sales",
    "status": "NEW",
    "score": 80,
    "notes": "High-value prospect from enterprise page"
  }'

# 2. List leads for campaign
curl -X GET "http://localhost:3000/api/v1/marketing/leads?campaign_id=camp-5" \
  -H "Authorization: Bearer <token>"
```

### Update Lead Status
```bash
curl -X PATCH "http://localhost:3000/api/v1/marketing/leads/10" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED",
    "score": 90,
    "notes": "Qualified after demo call, ready for proposal"
  }'
```

### Convert Lead to Customer
```bash
curl -X PATCH "http://localhost:3000/api/v1/marketing/leads/10" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONVERTED",
    "notes": "Converted to customer on 2025-01-15"
  }'
```

---

## Error Codes

| Error Code | Description |
|------------|-------------|
| `LEAD_NOT_FOUND` | Lead with the given ID does not exist |
| `VALIDATION_ERROR` | Request validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `FOREIGN_KEY_VIOLATION` | Invalid campaign_id reference |
| `UNIQUE_VIOLATION` | Duplicate lead_code |
| `42P01` | Relation (table) does not exist |

---

## Notes

1. **Auto-generated Fields:**
   - `id` - Auto-generated by database (BIGSERIAL)
   - `lead_code` - Auto-generated by trigger if not provided (format: `LEAD-YYYY-NNNNNN`)
   - `created_at` - Auto-set on creation
   - `updated_at` - Auto-updated on modification

2. **Foreign Key:**
   - `campaign_id` references `marketing_campaigns.id`
   - On campaign deletion, `campaign_id` is set to NULL (ON DELETE SET NULL)

3. **Nullable Fields:**
   - All fields except `id` are nullable
   - Frontend handles null values gracefully

4. **Default Values:**
   - `status` defaults to `'NEW'` if not provided
   - `score` defaults to `0` if not provided

5. **Lead Scoring:**
   - Score range: 0-100
   - Frontend validates score range
   - Higher scores indicate better quality leads

6. **Campaign Name:**
   - Can be provided directly or auto-populated from `campaign_id`
   - Backend should populate `campaign_name` from campaign if only `campaign_id` is provided

