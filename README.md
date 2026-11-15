# SmileSync – Dental Clinic Appointment & Scheduling System

> **CPE 334 Introduction to Software Engineering (Semester 1/2026) — Project Deliverable 1 (`v0.1.0-sprint1`)**  
> **Team Members:**  
> - **ฑิตญา ผ่องสกุล (`@titayaaa`)** — Staff Domain & Database Lead  
> - **พัฒนาวดี แสงเงินยอด (`@jejaebubu`)** — Customer Domain, Auth & QA Lead  

---

## 1. Project Overview

**SmileSync** is a full-stack dental clinic appointment and duty scheduling system engineered as a complete working vertical slice for Sprint 1:
- **Role-Based Access Control (`F-01`):** Stateless JWT authentication (`HS256`) and strict backend middleware guards (`requireAuth` returning `401`, `requireRole` returning `403`) separating `CUSTOMER` and `STAFF` operations.
- **Staff Duty Roster & 30-Minute Slot Generator (`F-03`):** Clinic staff register dentist shifts (`POST /api/admin/schedules`), automatically slicing duty hours into discrete 30-minute `AVAILABLE` time slots, accompanied by an interactive Roster Calendar View and Procedure Catalog Manager.
- **Patient Slot Discovery & Atomic Booking (`F-02`):** Patients browse dental services, filter available future slots (`GET /api/slots/available`), and book appointments (`POST /api/appointments`) inside an atomic transaction (`prisma.$transaction`) that enforces a maximum quota of 2 active appointments (`BR-03`) and rejects concurrent double-bookings with `HTTP 409 Conflict` (`BR-01`, proven via TDD).
- **Appointment Lifecycle & Automatic Slot Recycling (`F-04`, `F-05`):** Patients can view and cancel their own bookings (`BR-04`), while staff review all clinic appointments (`GET /api/admin/appointments`) to confirm (`CONFIRMED`) or reject conflicts (`CANCELLED_CONFLICT` with mandatory `staffNotes`), atomically releasing the `TimeSlot` back to `AVAILABLE` (`BR-06`).

---

## 2. Engineering Documentation (Parts A–E)

All engineering specifications are versioned in the [`docs/`](./docs) directory:
- **Part A (SRS & Scope):** [`docs/srs.md`](./docs/srs.md)
- **Part B (Feature Inventory & Traceability):** [`docs/features.md`](./docs/features.md) & [`docs/traceability.md`](./docs/traceability.md)
- **Part C (System-Level SDS):** [`docs/system-sds.md`](./docs/system-sds.md)
- **Part D (Three-Sprint Plan):** [`docs/sprints/plan.md`](./docs/sprints/plan.md)
- **Part E (Sprint 1 Engineering Contracts & STS):**
  - Customer Domain (`F-02` & `F-05`): [`docs/sprints/sprint-1/feature-f02.md`](./docs/sprints/sprint-1/feature-f02.md) & [`docs/sprints/sprint-1/sts-f02.md`](./docs/sprints/sprint-1/sts-f02.md)
  - Staff Domain (`F-03` & `F-04`): [`docs/sprints/sprint-1/feature-f03.md`](./docs/sprints/sprint-1/feature-f03.md) & [`docs/sprints/sprint-1/sts-f03.md`](./docs/sprints/sprint-1/sts-f03.md)

---

## 3. Prerequisites & Dependencies

- **Node.js:** v20+ (tested on v24.14.0) and **npm**
- **Database:** PostgreSQL 15+ (for live database persistence)
- **Tech Stack:**
  - **Frontend (`client/`):** React 18, TypeScript, Vite
  - **Backend (`server/`):** Express.js, TypeScript, Prisma ORM, `bcryptjs`, `jsonwebtoken`
  - **Testing (`server/tests/`):** Vitest, Supertest

---

## 4. Environment Variables Setup

Copy the example environment file in `server/` before starting the backend:

```bash
cd server
cp .env.example .env
```

Example `server/.env` configuration (no production secrets are stored in Git):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smilesync_db?schema=public"
JWT_SECRET="smilesync-super-secret-jwt-key-cpe334-2026"
JWT_EXPIRES_IN="24h"
```

---

## 5. Database Setup, Migrations & Reproducible Seed

From the `server/` directory, run Prisma migrations and seed the reproducible demo dataset:

```bash
cd server
npm install

# 1. Generate Prisma Client
npx prisma generate

# 2. Apply schema migrations to PostgreSQL
npx prisma migrate dev --name init

# 3. Seed synthetic demo accounts, dentists, schedules, and 30-min slots
npm run prisma:seed
```

---

## 6. Safe Local Demo Accounts (Seeded via `prisma/seed.ts`)

| Role | Email | Password (Local Seed Only) | Description |
| :--- | :--- | :--- | :--- |
| **`STAFF`** | `reception@smilesync.local` | `Password123!` | Clinic Receptionist — manages schedules, pricing, and master appointment approvals |
| **`CUSTOMER`** | `patient1@smilesync.local` | `Password123!` | Patient 1 — browses available slots, books visits, and manages own appointments |
| **`CUSTOMER`** | `patient2@smilesync.local` | `Password123!` | Patient 2 — used for competing double-booking (`409`) and data isolation (`403`) tests |

---

## 7. Running, Building & Testing the Application

### 7.1 Run Automated Test Suite (45 Integration & TDD Tests)

```bash
cd server
npm test
```
*Executes `auth.test.ts` (11 tests), `booking.test.ts` (20 tests), and `staff.test.ts` (14 tests) — **45/45 passing (100% Green)**.*

### 7.2 Production Build Verification

```bash
# Build Backend TypeScript
cd server && npm run build

# Build Frontend React + Vite Bundle
cd ../client && npm install && npm run build
```

### 7.3 Start Local Development Servers

```bash
# Terminal 1: Start Express API Server (http://localhost:5000)
cd server
npm run dev

# Terminal 2: Start React Vite Client (http://localhost:5173)
cd client
npm run dev
```
