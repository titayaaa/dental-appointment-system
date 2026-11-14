# SmileSync: Requirements Traceability Matrix
## Part B: Traceability from Requirements to Features, Sprints, and Test Cases

| Requirement ID | Requirement Summary | Feature ID | Target Sprint | Planned Verification / Test ID |
| :---: | :--- | :---: | :---: | :---: |
| **FR-01** | User authentication with JWT & role identity | F-01 | Sprint 1 | AC-01 / TEST-AUTH-01, TEST-AUTH-02 |
| **FR-02** | Staff schedule registration & slot generation | F-03 | Sprint 1 | AC-04 / TEST-STAFF-01 |
| **FR-03** | Query available unreserved future slots | F-02 | Sprint 1 | AC-02 / TEST-CUST-01 |
| **FR-04** | Patient booking submission with details | F-02 | Sprint 1 | AC-02 / TEST-CUST-02 |
| **FR-05** | Master clinic overview & status transitions | F-04 | Sprint 1 | AC-05 / TEST-STAFF-02, TEST-STAFF-03 |
| **FR-06** | Personal appointment retrieval & cancellation | F-05 | Sprint 1 | AC-03 / TEST-CUST-03, TEST-CUST-04 |
| **BR-01** | Reject double booking / competing slot reservation | F-02 | Sprint 1 | AC-02 / TEST-TDD-01 (409 Conflict) |
| **BR-02** | Prevent past slot generation & booking | F-02, F-03 | Sprint 1 | AC-02, AC-04 / TEST-VAL-01 (400 Bad Request) |
| **BR-03** | Enforce patient active booking quota (max 2) | F-02 | Sprint 1 | AC-02 / TEST-VAL-02 (400 Bad Request) |
| **BR-04** | Enforce patient data isolation & privacy | F-05 | Sprint 1 | AC-03 / TEST-SEC-01 (403 Forbidden) |
| **BR-05** | Restrict administrative operations to Staff | F-03, F-04 | Sprint 1 | AC-04, AC-05 / TEST-SEC-02 (403 Forbidden) |
| **BR-06** | Automatic slot release on cancellation | F-04, F-05 | Sprint 1 | AC-03, AC-05 / TEST-INTEG-01 |
| **NFR-01** | Protect unauthenticated & unauthorized access | F-01 | Sprint 1 | AC-01 / TEST-SEC-03 (401 Unauthorized) |
| **NFR-02** | Guarantee atomic slot booking under concurrency | F-02 | Sprint 1 | AC-02 / TEST-CONC-01 |
| **NFR-03** | Maintain responsive API execution (< 500ms) | All | Sprint 1 | TEST-PERF-01 |
