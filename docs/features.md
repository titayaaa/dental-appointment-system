# SmileSync: Feature Inventory
## Part B: Product Baseline Features Across Sprints

| Feature ID | Feature Name | Description | Target Sprint | Primary Actors | Related FR / BR |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **F-01** | **User Authentication & Role Session** | User login, JWT token generation, role verification, and route guards. | **Sprint 1** | Everyone | FR-01, BR-05, NFR-01 |
| **F-02** | **Patient Slot Discovery & Booking** | Browse dentists, view available time slots, submit booking, and prevent double-booking. | **Sprint 1** | Customer | FR-03, FR-04, BR-01, BR-02, BR-03, NFR-02 |
| **F-03** | **Dentist Schedule & Slot Generation** | Staff registers provider duty hours and auto-generates 30-min time slots. | **Sprint 1** | Staff | FR-02, BR-02, BR-05 |
| **F-04** | **Master Appointment Review & Status** | Staff reviews clinic appointments, confirms or rejects with notes. | **Sprint 1** | Staff | FR-05, BR-05, BR-06 |
| **F-05** | **Patient Appointment History & Cancel** | Patient views personal bookings with status badges and can cancel active bookings. | **Sprint 1** | Customer | FR-06, BR-04, BR-06 |
| **F-06** | **Appointment Rescheduling Flow** | Patients or staff request date/time modification without full cancellation. | **Sprint 2** | Customer, Staff | FR-04, BR-01, BR-02 |
| **F-07** | **Dentist Specialty Filtering & Profiles** | Rich filtering by dental specialty (orthodontics, prosthodontics) and doctor bio. | **Sprint 2** | Customer | FR-03 |
| **F-08** | **Clinic Appointment Analytics Dashboard** | Monthly patient volume metrics, slot utilization rates, and cancellation breakdown. | **Sprint 3** | Staff | FR-05 |
| **F-09** | **Automated In-App Reminders & Notices** | Visual alerts for upcoming visits and status changes within the portal. | **Sprint 3** | Customer | FR-06 |
