# Software Test Specification (STS): Feature F-03
## Sprint 1 Test Plan & Acceptance Mapping (Part E - Staff Domain)

| Attribute | Specification Details |
| :--- | :--- |
| **Feature ID** | **F-03: Staff Schedule Planner & Master Appointment Management** |
| **Test Owner** | `titayaaa` (Staff Domain Lead) |
| **Test Suite Location** | `server/tests/staff.test.ts` |
| **Test Runner** | Vitest + Supertest |

---

## 1. Acceptance Criteria to Test Mapping Matrix

| Test ID | Linked AC | Test Level | Precondition / Input | Action | Expected Result |
| :---: | :---: | :---: | :--- | :--- | :--- |
| **TEST-STAFF-01** | `AC-08` | Security (RBAC) | User authenticated as `CUSTOMER`. | Call `GET /api/admin/appointments` or `POST /api/admin/schedules`. | **Rejection:** Returns **HTTP 403 Forbidden** ("Forbidden: Access restricted to [STAFF]"). |
| **TEST-STAFF-02** | `AC-08` | Security (Auth) | No Authorization header provided. | Call `GET /api/admin/appointments`. | **Rejection:** Returns **HTTP 401 Unauthorized** ("Unauthorized: Access token is missing or malformed"). |
| **TEST-STAFF-03** | `AC-09` | Integration (API + DB) | Staff authenticated. Valid future shift: 09:00 - 12:00. | `POST /api/admin/schedules` with dentistId and hours. | Returns **HTTP 201 Created**. Automatically generates exactly **6 discrete 30-min time slots** with status `AVAILABLE`. |
| **TEST-STAFF-04** | `AC-10` | Integration (API) | Staff authenticated. Multiple appointments exist in DB. | `GET /api/admin/appointments?status=PENDING_REVIEW` | Returns **HTTP 200 OK** with array of appointments filtered by `PENDING_REVIEW` including patient name and slot. |
| **TEST-STAFF-05** | `AC-11` | Integration (Lifecycle) | Appointment in `PENDING_REVIEW` status. | `PATCH /api/admin/appointments/:id/status` with `status: "CONFIRMED"`. | Returns **HTTP 200 OK**. Appointment status updates to `CONFIRMED`. Associated slot remains `BOOKED`. |
| **TEST-STAFF-06** ⭐ | `AC-12` | Integration (BR-06 Slot Recycle) | Appointment in `PENDING_REVIEW` status and slot is `BOOKED`. | `PATCH /api/admin/appointments/:id/status` with `status: "CANCELLED_CONFLICT"` and `staffNotes`. | Returns **HTTP 200 OK**. Appointment status transitions to `CANCELLED_CONFLICT` and associated TimeSlot is **atomically released back to `AVAILABLE`** (BR-06). |

---

## 2. Test Execution Verification Checklist (Part F Evidence Preparation)

- [ ] Automated tests implemented in `server/tests/staff.test.ts`
- [ ] 100% passing tests reported by Vitest runner
- [ ] Role guard (403) verified for patient accounts attempting staff actions
- [ ] Slot recycle (BR-06) verified with database assertion
