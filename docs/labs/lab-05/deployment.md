# SmileSync — Lab 5 Deployment Specification

**Course:** CPE 334 Introduction to Software Engineering (Semester 1/2026)  
**Project:** SmileSync Dental Clinic Appointment & Scheduling System  
**Repository:** `titayaaa/dental-appointment-system`  
**Group Prefix:** `s719900af`  
**GCP Project ID:** `cpe-se-course-2026`  
**Region:** `asia-southeast1`  

---

## 1. Tech Stack & Architecture

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind/CSS | Single Page Application (SPA) |
| **Backend API** | Node.js 24 Alpine, Express, TypeScript | RESTful API server |
| **ORM & Database** | Prisma ORM, PostgreSQL 16 | Relational data persistence |
| **Packaging** | Docker (Multi-stage build) | Production container serving API + SPA on port 3000 |
| **Cloud Hosting** | Google Cloud Run | Serverless container execution |
| **Cloud Database** | Google Cloud SQL (PostgreSQL 16) | Managed database instance (`s719900af-pg`) |
| **CI/CD Pipeline** | GitHub Actions + Workload Identity Federation | Automated build, test, and zero-key deploy |

---

## 2. Environment Variables

All settings are configured through environment variables. **No hardcoded secrets or production passwords are committed to Git.**

| Variable | Type | Purpose | Secret? | Source (Local / Cloud) |
|---|---|---|---|---|
| `PORT` | Number | Port the Express server listens on (default `3000`) | No | Injected by Cloud Run / `docker-compose.yml` |
| `NODE_ENV` | String | Runtime mode (`development` / `production`) | No | System environment |
| `CLIENT_URL` | String | Allowed CORS origin for frontend | No | `.env` or defaults to same origin |
| `DATABASE_URL` | String | PostgreSQL connection string | **Yes** | Local `.env` / Cloud Run Secret Manager (`s719900af-database-url`) |
| `JWT_SECRET` | String | Secret key for signing authentication JWTs | **Yes** | Local `.env` / Cloud Run Environment Variable |
| `ADMIN_PASSWORD` | String | Initial password for administrative staff seed | **Yes** | Secret Manager (`s719900af-admin-password`) |
| `DEMO_USER_PASSWORD` | String | Initial password for demo customer seed | **Yes** | Secret Manager (`s719900af-demo-password`) |
| `SEED_DEMO_DATA` | Boolean | Whether migration job seeds baseline data | No | Job Environment Variable |

---

## 3. Local Execution & Docker Commands

### 3.1 Local Development (with Node.js)
```bash
# Server
cd server
npm ci
npx prisma generate
npm run dev

# Client
cd ../client
npm ci
npm run dev
```

### 3.2 Automated Tests
```bash
# Backend test suite (Vitest, 45 tests)
cd server
npm test

# Deploy scripts offline regression tests
cd ..
bash deploy/tests/test_deploy_stub.sh
bash deploy/tests/test_release_stub.sh
python3 -m unittest discover -s deploy/tests -p 'test_smoke.py'
```

### 3.3 Docker Compose Local Orchestration
```bash
# Start all services (db, migrate, server, client)
docker compose up --build

# Stop services
docker compose down
```

### 3.4 Production Docker Build
```bash
# Build unified production container
docker build -t smilesync:latest .

# Run production container
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." smilesync:latest
```

---

## 4. Google Cloud Platform (GCP) Resources

| Resource | Name / Value | Description |
|---|---|---|
| **GCP Project** | `cpe-se-course-2026` | Dedicated course project |
| **Region** | `asia-southeast1` | Primary region (Singapore) |
| **Cloud Run Service** | `s719900af` | Serves API and React SPA on HTTPS |
| **Migration Job** | `s719900af-migrate` | Cloud Run job executing `prisma migrate deploy && prisma:seed` |
| **Cloud SQL Instance** | `s719900af-pg` | PostgreSQL 16 database (`db-f1-micro`) |
| **Artifact Registry** | `s719900af` | Container image repository |
| **Image URI** | `asia-southeast1-docker.pkg.dev/cpe-se-course-2026/s719900af/s719900af:<SHA>` | Tagged with 40-character commit SHA |
| **Runtime Service Account** | `s719900af-runner@cpe-se-course-2026.iam.gserviceaccount.com` | Unprivileged service runtime identity |
| **Deployer Service Account** | `s719900af-deployer@cpe-se-course-2026.iam.gserviceaccount.com` | CD deployment identity for GitHub Actions |
| **Database URL Secret** | `s719900af-database-url` | Secret Manager secret containing `DATABASE_URL` |
| **Admin Password Secret** | `s719900af-admin-password` | Secret Manager secret for staff password |
| **Demo Password Secret** | `s719900af-demo-password` | Secret Manager secret for demo user password |

---

## 5. Release Procedure (Git Flow & CI/CD)

1. **Issue Creation:** Every change begins with a GitHub Issue tagged with `lab5`.
2. **Feature Branch:** Development occurs on a dedicated branch created from `staging` (e.g. `feature/...`).
3. **Pull Request to `staging`:** PR opened targeting `staging`. Automated CI runs build and test checks. Teammate performs peer review and explicitly approves.
4. **Release PR to `main`:** When ready for release, a Release PR from `staging` into `main` is created, reviewed, and approved.
5. **Automated Continuous Deployment:** Merging into `main` triggers `.github/workflows/deploy.yml`:
   - Authenticates to GCP via Workload Identity Federation (no service account keys stored).
   - Builds and tags the Docker image with `${{ github.sha }}`.
   - Pushes image to Artifact Registry and resolves immutable digest `@sha256:...`.
   - Executes non-destructive migration job (`s719900af-migrate`).
   - Updates Cloud Run service traffic to the new revision.
   - Runs automated post-deployment smoke test (`deploy/smoke_test.py`) against live service URL.
