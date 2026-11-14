# SmileSync: Software Requirements Specification (SRS)
## Part A: Product Scope, Actors, and Requirements

### 1. Stakeholders and Chosen Context
* **Product Name:** SmileSync – Dental Clinic Appointment & Scheduling System
* **Stakeholder Problem:** Patients struggle to find available dates and times for specialized dental procedures (e.g., orthodontics, root canal, scaling), causing friction and redundant phone inquiries. The clinic suffers from scheduling conflicts (double bookings), missed communications, and lack of a structured status tracking system.
* **Clinic Context:** SmileSync Dental Clinic operates multiple operatories with general dentists and dental specialists. Staff manage provider schedules and oversee appointments, while patients register, browse real-time availability, and request bookings.

### 2. Actors and Responsibilities
* **CUSTOMER (Patient):**
  - Authenticates securely.
  - Explores dental specialists and real-time available time slots.
  - Books an appointment for a specific dental service and provides reason for visit.
  - Views their own appointment history and real-time status.
  - Cancels their own active appointment when necessary.
* **STAFF (Clinic Receptionist / Dental Assistant):**
  - Authenticates securely with elevated administrative privileges.
  - Manages provider duty schedules and generates service time slots.
  - Monitors clinic-wide appointment requests in a master dashboard.
  - Reviews, confirms (`CONFIRMED`), or rejects (`CANCELLED_CONFLICT`) appointment requests with mandatory staff notes.

### 3. Product Scope & Explicit Exclusions
* **In Scope (Sprint 1):**
  - Full-stack vertical slice: UI (React), API (Express/TypeScript), Database (PostgreSQL/Prisma).
  - Role-based access control (`CUSTOMER` vs `STAFF`).
  - Provider schedule creation and automatic slot generation.
  - Patient slot discovery and atomic booking with double-booking concurrency rejection (HTTP 409).
  - Appointment lifecycle transitions: `PENDING_REVIEW` -> `CONFIRMED` / `CANCELLED_CONFLICT` / `CANCELLED_BY_CUSTOMER`.
  - Automated testing suites (Unit, Integration, TDD).
* **Explicit Exclusions (Sprint 1):**
  - Live electronic payment processing (settled in-person at clinic).
  - External SMS or real email dispatch (in-app notifications and status badges only).
  - Self-service password recovery (seed test accounts used).

### 4. Functional Requirements (FR)
* **FR-01 (Authentication & Session):** The system shall allow users to log in with email and password, returning a signed JWT token containing user identity and role.
* **FR-02 (Dentist & Schedule Management):** The system shall allow staff to register duty schedules for dentists and automatically split them into discrete time slots.
* **FR-03 (Available Slot Discovery):** The system shall allow authenticated users to retrieve unreserved future time slots filtered by dentist and date.
* **FR-04 (Appointment Booking):** The system shall allow patients to reserve an available time slot with selected dental service and reason for visit.
* **FR-05 (Master Clinic Overview & Review):** The system shall allow staff to view all clinic appointments and update status to `CONFIRMED` or `CANCELLED_CONFLICT` with explanatory notes.
* **FR-06 (Personal Appointment Tracking & Cancellation):** The system shall allow patients to view their own appointments and cancel active bookings, releasing the reserved time slot.

### 5. Business Rules (BR)
* **BR-01 (Exclusive Slot / No Double Booking):** An exclusive time slot can hold at most one active appointment. Any competing booking request for an already booked slot must be rejected with HTTP 409 Conflict.
* **BR-02 (Future Slot Enforcement):** Appointment bookings and slot generation must only be permitted for future timestamps (`slotStart > current_time`).
* **BR-03 (Active Booking Quota):** A single patient may have at most two concurrent appointments in `PENDING_REVIEW` or `CONFIRMED` status to prevent slot hoarding.
* **BR-04 (Customer Data Isolation):** Patients may strictly inspect and modify only their own appointments (`customerId == current_user.id`). Cross-customer inspection is rejected with HTTP 403 Forbidden.
* **BR-05 (Administrative Authority):** Administrative operations (schedule creation, clinic-wide appointment retrieval, staff status overrides) are strictly restricted to users with `STAFF` role.
* **BR-06 (Slot Release on Cancellation):** When an appointment transitions to `CANCELLED_CONFLICT` or `CANCELLED_BY_CUSTOMER`, its associated time slot status must immediately revert to `AVAILABLE`.

### 6. Non-Functional Requirements (NFR)
* **NFR-01 (Security & Authorization):** Unauthenticated requests to protected resources must return HTTP 401. Unauthorized role access must return HTTP 403 without leaking entity metadata.
* **NFR-02 (Concurrency & Data Consistency):** Concurrent booking requests for the last available slot must guarantee exactly one successful reservation via database transaction and unique constraints.
* **NFR-03 (Response Time):** API response times for slot availability and booking requests shall be under 500ms under standard local execution.

### 7. Assumptions, Design Decisions, and Questions & Resolutions
* **Assumption 1 (Fixed Operatory Slots):** Standard dental procedures are planned around discrete 30-minute blocks, allowing staff to schedule predictable consultation rounds.
* **Assumption 2 (In-Person Payment):** Medical insurance verification and payment settling occur on-site upon patient arrival; online transaction gateways are purposefully omitted to reduce complexity and avoid mock financial charges.
* **Decision 1 (Stateless JWT over Stateful Session Tables):** Chose JSON Web Tokens stored in client-side headers with 24-hour expiration. This simplifies backend scaling on Cloud Run without needing session store synchronization across container instances.
* **Decision 2 (Database-Level Concurrency Constraint):** Placed a `UNIQUE` constraint on `Appointment.timeSlotId` alongside Prisma atomic transactions. Even if two concurrent HTTP requests pass the application-level check simultaneously, the PostgreSQL unique index guarantees exactly one reservation succeeds while the second fails gracefully with HTTP 409.
* **Decision 3 (Explicit Cancellation State Transitions):** Rather than deleting appointment records, cancellations transition the status to `CANCELLED_BY_CUSTOMER` or `CANCELLED_CONFLICT` while releasing the `TimeSlot.status` back to `AVAILABLE`. This maintains a full audit log for clinic reporting.
* **Question & Resolution 1:** *Should patients be allowed to book unlimited appointments across multiple dates?*  
  **Resolution:** Implemented BR-03 limiting active uncompleted bookings to 2 per patient to prevent booking hoarding and ensure equitable access to specialist slots.
