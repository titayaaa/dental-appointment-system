# Software Test Specification (STS): Feature F-02
## Sprint 1 Test Plan, Acceptance Mapping & TDD Protocol (Part E)

| Attribute | Specification Details |
| :--- | :--- |
| **Feature ID** | **F-02: Patient Slot Discovery & Booking** |
| **Test Owner** | `jejaebubu` |
| **Test Suite Location** | `server/tests/booking.test.ts` (API/Integration) & `client/src/tests/Booking.test.tsx` (UI) |
| **Test Runner** | Vitest / Jest + Supertest |

---

## 1. Acceptance Criteria to Test Mapping Matrix

| Test ID | Linked AC | Test Level | Precondition / Input | Action | Expected Result |
| :---: | :---: | :---: | :--- | :--- | :--- |
| **TEST-CUST-01** | `AC-01` | Integration (API) | Dentist has 3 future slots: 2 `AVAILABLE`, 1 `BOOKED`. | `GET /api/slots/available?dentistId=...&date=...` | Returns HTTP 200 with an array of exactly 2 available future slots. The booked slot is excluded. |
| **TEST-CUST-02** | `AC-02` | Integration (API + DB) | Patient authenticated as `CUSTOMER`. Slot status is `AVAILABLE` and in future. | `POST /api/appointments` with valid `dentistId`, `timeSlotId`, and `serviceType`. | Returns HTTP 201 Created. An appointment record with status `PENDING_REVIEW` exists in DB. Slot status transitions to `BOOKED`. |
| **TEST-TDD-01** ⭐ | `AC-03` | Integration (TDD Concurrency) | Slot is already `BOOKED` (or Request 1 reserved it 1ms earlier). | Request 2 submits `POST /api/appointments` with the same `timeSlotId`. | **Rejection:** Returns **HTTP 409 Conflict** with clear error message. Zero duplicate appointments created in DB. |
| **TEST-VAL-01** | `AC-04` | Unit / Validation | Slot has `slotStart` in the past (e.g. yesterday). | `POST /api/appointments` with past `timeSlotId`. | **Rejection:** Returns **HTTP 400 Bad Request** ("Cannot reserve slots in the past"). |
| **TEST-VAL-02** | `AC-05` | Integration (Business Rule) | Patient already has 2 active appointments in `PENDING_REVIEW` or `CONFIRMED`. | Patient attempts `POST /api/appointments` for a 3rd booking. | **Rejection:** Returns **HTTP 403 Forbidden** ("Booking quota exceeded: maximum 2 active appointments allowed"). |
| **TEST-UI-01** | `AC-02`, `AC-03` | E2E / Component (UI) | Render `/booking` with mock API returning 1 available slot. | 1. User selects slot, fills form, clicks submit.<br>2. Simulate 409 response. | Form shows loading indicator. On 409 response, displays a prominent error dialog alerting user that the slot was taken. |

---

## 2. Test-Driven Development (TDD) Protocol for TEST-TDD-01

According to the CPE 334 Deliverable 1 requirements, significant domain rules must demonstrate **Test-Driven Development (TDD)** sequence evidence (Red -> Green -> Refactor):

```mermaid
graph LR
    A[Step 1: Write TEST-TDD-01<br>Competing slot reservation test] --> B[Step 2: Run Test Suite<br><b>EXPECTED: RED / FAIL</b><br>(Returns 201 duplicate or 500 unhandled)]
    B --> C[Step 3: Implement atomic transaction<br>prisma.$transaction + Unique check]
    C --> D[Step 4: Re-run Test Suite<br><b>EXPECTED: GREEN / PASS</b><br>(Returns 409 Conflict cleanly)]
    D --> E[Step 5: Record execution output & logs<br>Capture for Deliverable 1 Part F]
```

### 2.1 Concrete TDD Test Code Template (`server/tests/booking.test.ts`)
```typescript
describe('BR-01: Double-Booking & Concurrency Protection (TDD)', () => {
  it('TEST-TDD-01: should reject competing booking for the same slot with 409 Conflict', async () => {
    // 1. Arrange: Create slot and first successful booking
    const slot = await createTestSlot(SlotStatus.AVAILABLE);
    
    // First patient books successfully
    const res1 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        dentistId: testDentist.id,
        timeSlotId: slot.id,
        serviceType: 'ขูดหินปูน',
      });
    expect(res1.status).toBe(201);

    // 2. Act: Second patient attempts to book the EXACT SAME slot
    const res2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        dentistId: testDentist.id,
        timeSlotId: slot.id,
        serviceType: 'อุดฟัน',
      });

    // 3. Assert: Must return 409 Conflict and no duplicate in DB
    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error).toMatch(/no longer available/i);

    const appointmentsCount = await prisma.appointment.count({
      where: { timeSlotId: slot.id },
    });
    expect(appointmentsCount).toBe(1);
  });
});
```

---

## 3. Execution Verification Checklist (Part F Evidence Preparation)

To satisfy **Part F (Working Sprint 1 and Verification)** in the final PDF report:
- [ ] Command line execution: `npm test`
- [ ] Recorded Git commit for Test Failure (Red stage)
- [ ] Recorded Git commit for Implementation & Passing (Green stage)
- [ ] Full assertion logs showing passed count: `TEST-CUST-01`, `TEST-CUST-02`, `TEST-TDD-01`, `TEST-VAL-01`, `TEST-VAL-02`.
