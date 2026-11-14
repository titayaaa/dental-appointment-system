# SmileSync: System-Level Software Design Specification (SDS)
## Part C: Architecture, Data Model, API Design, and Security

### 1. Technology Stack & Component Responsibilities
* **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
  - Role-based routing: `/staff/*` restricted to staff, `/booking` and `/my-appointments` for patients.
  - State management and API integration with safe empty/loading/error boundaries.
* **Backend:** Node.js 24 + Express + TypeScript
  - Modular routers: `/api/auth`, `/api/admin`, `/api/slots`, `/api/appointments`.
  - Layered architecture: Controllers (HTTP parsing) -> Services (Business rules) -> Prisma ORM (Data persistence).
* **Database:** PostgreSQL with Prisma ORM
  - Strong schema constraints, transactional booking operations, and foreign keys.

### 2. Entity-Relationship Model (5 Entities)

```mermaid
erDiagram
    USERS ||--o{ APPOINTMENTS : "books"
    DENTISTS ||--o{ DENTIST_SCHEDULES : "has"
    DENTISTS ||--o{ APPOINTMENTS : "assigned_to"
    DENTIST_SCHEDULES ||--o{ TIME_SLOTS : "generates"
    TIME_SLOTS ||--o| APPOINTMENTS : "reserved_for"

    USERS {
        string id PK
        string email UK
        string password_hash
        string full_name
        string phone_number
        string role "CUSTOMER | STAFF"
    }

    DENTISTS {
        string id PK
        string name
        string specialty
        boolean is_active
    }

    DENTIST_SCHEDULES {
        string id PK
        string dentist_id FK
        datetime work_date
        datetime start_time
        datetime end_time
        string status "ACTIVE | CANCELLED"
    }

    TIME_SLOTS {
        string id PK
        string schedule_id FK
        datetime slot_start
        datetime slot_end
        string status "AVAILABLE | BOOKED | BLOCKED"
    }

    APPOINTMENTS {
        string id PK
        string appointment_code UK
        string customer_id FK
        string dentist_id FK
        string time_slot_id FK,UK
        string service_type
        string reason_for_visit
        string status "PENDING_REVIEW | CONFIRMED | CANCELLED_CONFLICT | CANCELLED_BY_CUSTOMER | COMPLETED"
        string staff_notes
        datetime created_at
        datetime updated_at
    }
```

### 3. Role & Permission Matrix

| Operation / Endpoint | Public | CUSTOMER | STAFF |
| :--- | :---: | :---: | :---: |
| `POST /api/auth/login` | Yes | Yes | Yes |
| `GET /api/auth/me` | No | Yes | Yes |
| `GET /api/dentists` | Yes | Yes | Yes |
| `GET /api/slots/available` | No | Yes | Yes |
| `POST /api/appointments` (Book) | No | **Yes** | No |
| `GET /api/my-appointments` | No | **Yes (Own only)** | No |
| `PATCH /api/my-appointments/:id/cancel` | No | **Yes (Own only)** | No |
| `POST /api/admin/schedules` | No | No | **Yes** |
| `GET /api/admin/schedules` | No | No | **Yes** |
| `GET /api/admin/appointments` | No | No | **Yes (All)** |
| `PATCH /api/admin/appointments/:id/status` | No | No | **Yes** |

### 4. API Response Conventions & Error Codes
* Standard Success Envelope:
  ```json
  { "success": true, "data": { ... } }
  ```
* Standard Error Envelope:
  ```json
  { "success": false, "error": "Human-readable error description" }
  ```
* Status Codes:
  - `200 OK` / `201 Created`: Request succeeded.
  - `400 Bad Request`: Input validation failed (e.g. past dates, negative slot length).
  - `401 Unauthorized`: Missing or malformed Bearer token.
  - `403 Forbidden`: Authenticated user lacks permission for the resource.
  - `404 Not Found`: Target entity not found.
  - `409 Conflict`: Slot is already occupied (double booking prevented).
