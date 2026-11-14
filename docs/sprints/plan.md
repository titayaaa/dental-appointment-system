# SmileSync: Three-Sprint Development Plan
## Part D: Roadmap, Sprint Goals, Dependencies, and Allocation

### 1. Three-Sprint Roadmap Table

| Sprint | Goal & Focus | Included Features | Dependencies | Deliverable & Checkpoint |
| :---: | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Working Vertical Slice & Baseline:** Establish authentication, role segregation, provider schedule & slot creation, patient slot discovery, atomic booking with 409 double-booking rejection, and appointment status transitions. | F-01, F-02, F-03, F-04, F-05 | None (Foundation) | **Deliverable 1 (8 Nov / 15 Nov):** Tested local full-stack increment, git reviews, and complete Parts A-F PDF report. |
| **Sprint 2** | **Core Expansion & Rescheduling:** Implement appointment rescheduling without full cancellation (F-06), specialty search & dentist filtering (F-07), and refined cancellation business rules. | F-06, F-07 | Sprint 1 Baseline (F-02, F-04, F-05) | **Deliverable 2 (29 Nov):** Expanded feature contracts, regression suites, and cloud staging readiness. |
| **Sprint 3** | **Product Hardening & Cloud Delivery:** Analytics dashboard for clinic utilization (F-08), automated in-app reminder notices (F-09), cloud deployment on GCP (Cloud Run + Cloud SQL), and final demonstration video. | F-08, F-09 | Sprint 2 Expansion | **Final Delivery (13 Dec):** Fully deployed production system, acceptance test evidence, and live video walkthrough. |

### 2. Scope and Boundaries of Sprint 1
* **Why this Vertical Slice:** Sprint 1 intentionally implements a thin, complete end-to-end user journey touching all tiers: from patient/staff UI to REST APIs, transactional business rules, and PostgreSQL persistence. This proves the architecture works as an integrated system early in the lifecycle.
* **Core Value Delivered:** Staff can publish availability, and patients can reserve that availability with guaranteed concurrency protection (no duplicate bookings). Both roles can track the lifecycle of the resulting appointments.
* **Deferrals to Later Sprints:** Rescheduling (F-06), doctor specialty filtering (F-07), clinic utilization dashboards (F-08), and in-app automated reminders (F-09) are explicitly deferred to Sprints 2 and 3 to maintain a feasible, high-quality engineering scope for Deliverable 1.
