# CRM API Mapping Reference

This document maps the current Supabase implementation to REST API endpoints for backend integration reference.

## Current Implementation (Supabase Direct)

The frontend currently uses Supabase client directly:
- Table: `customers` → REST: `GET/POST/PATCH/DELETE /customers`
- Table: `erp_users` → REST: `GET/POST/PATCH/DELETE /erp-users`
- Table: `employee_leaves` → REST: `GET/POST/PATCH/DELETE /leaves`
- Table: `tasks` → REST: `GET/POST/PATCH/DELETE /tasks`

## Function to Endpoint Mapping

### Customers
| Frontend Function | Supabase Table | REST Endpoint | Method |
|------------------|----------------|---------------|--------|
| `listCustomers()` | `customers` | `/customers` | GET |
| `createCustomer()` | `customers` | `/customers` | POST |
| `updateCustomer(id, changes)` | `customers` | `/customers/:id` | PATCH |
| `deleteCustomer(id)` | `customers` | `/customers/:id` | DELETE |

### ERP Users
| Frontend Function | Supabase Table | REST Endpoint | Method |
|------------------|----------------|---------------|--------|
| `listErpUsers()` | `erp_users` | `/erp-users` | GET |
| `createErpUser()` | `erp_users` | `/erp-users` | POST |
| `updateErpUser(id, changes)` | `erp_users` | `/erp-users/:id` | PATCH |
| `deleteErpUser(id)` | `erp_users` | `/erp-users/:id` | DELETE |

### Leaves
| Frontend Function | Supabase Table | REST Endpoint | Method |
|------------------|----------------|---------------|--------|
| `listLeaves()` | `employee_leaves` | `/leaves` | GET |
| `createLeave()` | `employee_leaves` | `/leaves` | POST |
| `updateLeave(id, changes)` | `employee_leaves` | `/leaves/:id` | PATCH |
| `deleteLeave(id)` | `employee_leaves` | `/leaves/:id` | DELETE |

### Tasks
| Frontend Function | Supabase Table | REST Endpoint | Method |
|------------------|----------------|---------------|--------|
| `listTasks()` | `tasks` | `/tasks` | GET |
| `createTask()` | `tasks` | `/tasks` | POST |
| `updateTask(id, changes)` | `tasks` | `/tasks/:id` | PATCH |
| `deleteTask(id)` | `tasks` | `/tasks/:id` | DELETE |

## Expected Response Formats

All endpoints should return JSON responses matching the TypeScript interfaces defined in `src/features/crm/types.ts`.

See `API_DOCUMENTATION.md` for detailed curl examples and request/response payloads.

