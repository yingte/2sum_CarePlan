# CarePlan Generation System — Design Doc

**Version:** 0.2  
**Status:** Draft  
**Last Updated:** 2026-05-01

---

## 1. Background & Problem Statement

A specialty pharmacy (CVS) requires pharmacists to manually create care plans for patients on specialty medications. This process takes **20–40 minutes per patient**, is required for Medicare compliance and pharma reimbursement, and the team is severely understaffed with a growing backlog.

**Goal:** Build a web-based tool that allows CVS medical staff to input patient information and automatically generate a professional care plan using an LLM.

---

## 2. Users

- **Primary user:** CVS medical assistants / pharmacists  
- **Not a user:** Patients (they receive a printed copy of the generated care plan)

---

## 3. Functional Requirements

### 3.1 Web Form (Input)

| Field | Type | Validation |
|---|---|---|
| Patient First Name | string | Required, letters only |
| Patient Last Name | string | Required, letters only |
| Patient MRN | string | Required, unique 6-digit number |
| Patient Date of Birth | date | Required |
| Patient Primary Diagnosis | ICD-10 code | Required, valid ICD-10 format |
| Additional Diagnoses | list of ICD-10 codes | Optional |
| Referring Provider Name | string | Required |
| Referring Provider NPI | string | Required, exactly 10 digits |
| Medication Name | string | Required |
| Medication History | list of strings | Optional |
| Patient Records | string or PDF | Required |

### 3.2 Care Plan Generation

- One care plan per order (one medication)
- Output must include: Problem list, Goals, Pharmacist interventions, Monitoring plan
- User can download the care plan as a text file

### 3.3 Duplicate Detection Rules

| Scenario | Behavior | Reason |
|---|---|---|
| Same patient + same medication + same day | ERROR — block | Definitely duplicate |
| Same patient + same medication + different day | WARNING — confirm to continue | May be refill |
| MRN same + name or DOB different | WARNING — confirm to continue | Possible data entry error |
| Name + DOB same + MRN different | WARNING — confirm to continue | Possibly same person |
| NPI same + Provider name different | ERROR — must correct | NPI is nationally unique |
| NPI same + Provider name same | Reuse existing record | Same provider |
| MRN same + name and DOB same | Reuse existing record | Same patient |

### 3.4 Reporting & Export

- CSV export for pharma reporting

---

## 4. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Input validation | Every field validated before processing |
| Data integrity | DB-level constraints enforce consistency |
| Error safety | No stack traces or PHI exposed to users |
| Modularity | Layered architecture (routes / services / repositories) |
| Test coverage | Critical logic covered by Jest tests |
| Runnable out of the box | `docker compose up` → system running |

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Validation | Zod |
| ORM | Prisma |
| Database | PostgreSQL |
| Async Queue (Day 5) | BullMQ + Redis |
| LLM | Claude API or OpenAI API |
| Containerization | Docker + Docker Compose |
| Cloud (Day 12+) | AWS (Lambda, SQS, RDS, API Gateway) |
| IaC (Day 15) | Terraform |
| Monitoring (Day 11) | Prometheus + Grafana |
| Testing | Jest |

---

## 6. Data Model

```
Patient
  - id, firstName, lastName, mrn (unique), dateOfBirth

Provider
  - id, name, npi (unique)

Order
  - id, patientId (FK), providerId (FK)
  - medicationName, primaryDiagnosis, additionalDiagnoses
  - medicationHistory, patientRecords, createdAt

CarePlan
  - id, orderId (FK)
  - content, status (pending | processing | completed | failed)
  - createdAt
```

---

## 7. API Design

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Submit info, trigger care plan generation |
| GET | `/api/orders/:id` | Get status and care plan content |
| GET | `/api/orders/:id/download` | Download care plan as text file |
| GET | `/api/orders?export=csv` | Export for pharma reporting |

---

## 8. Development Phases

| Phase | Days | Goal |
|---|---|---|
| MVP | Day 2 | Form → LLM → Care plan (sync, in-memory) |
| Database | Day 3 | Add PostgreSQL + Prisma |
| Async | Day 4–5 | BullMQ queue + Worker |
| Realtime | Day 6 | Frontend polling |
| Refactor | Day 7 | Layered architecture |
| Validation | Day 8 | Zod + duplicate detection + Jest |
| Multi-source | Day 9–10 | Adapter pattern |
| Monitoring | Day 11 | Prometheus + Grafana |
| AWS | Day 12–15 | Lambda + SQS + RDS + Terraform |

---

## 9. Open Questions

- [ ] Expected volume? (orders per day / peak load)
- [ ] Required CSV export column format for pharma reporting?
- [ ] Should failed generations retry automatically or manually?
