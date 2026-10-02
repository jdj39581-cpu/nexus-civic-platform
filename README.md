# NEXUS — Intelligent Community Problem Reporting, Analysis & Resolution Platform

> **"Connect Problems. Coordinate Solutions."**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jdj39581-cpu/nexus-civic-platform)

- **GitHub Repository**: [https://github.com/jdj39581-cpu/nexus-civic-platform](https://github.com/jdj39581-cpu/nexus-civic-platform)
- **1-Click Render Deploy**: [https://render.com/deploy?repo=https://github.com/jdj39581-cpu/nexus-civic-platform](https://render.com/deploy?repo=https://github.com/jdj39581-cpu/nexus-civic-platform)
- **Live Render URL**: `https://nexus-civic-platform.onrender.com`

NEXUS is an intelligent, full-stack community problem reporting and resolution platform engineered for municipal authorities, smart campuses, and civic organizations. Rather than functioning as a simplistic CRUD ticketing board, NEXUS implements an autonomous intelligence pipeline:

```
Report → Understand → Analyze → Detect Similar Issues → Group → Prioritize → Assign → Track → Resolve → Verify → Analyze
```

---

## 🌟 Key Architecture & Capabilities

### 1. Natural Language Problem Understanding (NLP)
- Parses unstructured descriptions to automatically deduce problem type, civic infrastructure category, safety hazards, and physical urgency keywords (e.g., accidents, road cave-ins, dangling live cables, burst water mains).

### 2. Geospatial Similarity & Deduplication Engine
- Uses the **Haversine formula** to measure spatial distance and **Jaccard token set similarity** to compare incoming complaints against existing database records within an 800m radius.
- Identifies potential duplicate reports before submission.

### 3. Community Issue Grouping
- Automatically clusters multiple raw citizen complaints regarding the same underlying defect into a unified **Community Issue**.
- Prevents municipal backlog clutter and aggregates resident impact count.

### 4. Transparent Mathematical Priority Scoring (0–100)
- Computes priority with an auditable formula:
  $$\text{Priority} = f(\text{Safety Risk}, \text{Sensitive Proximity}, \text{Complaint Volume}, \text{Duration})$$
- Displays explicit point breakdown reasons (e.g. `Score 89/100: +22 pts High safety risk, +12 pts Near educational institution, +15 pts Multi-report cluster`).

### 5. Multi-Department Field Dispatch & Operations
- Recommends the responsible municipal department (Public Works, Solid Waste & Sanitation, Water Supply & Sewerage, Electrical Grid & Streetlighting, City Transport).
- Admins can override recommendations or re-assign to specific field engineers.

### 6. Citizen Verification Loop (Guaranteed Ground Truth)
- Prevents false "resolved on paper" closures.
- Once field crews mark a case resolved and upload photo evidence, reporting citizens are prompted:
  - **✓ Yes, Resolved Properly** $\rightarrow$ Advances status to `Citizen Verified`.
  - **✕ No, Problem Still Exists** $\rightarrow$ Rebuttal feedback and dispute photos automatically re-open the issue to `In Progress` and trigger urgent department alerts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet, React-Leaflet, Recharts |
| **Backend** | Node.js, Express.js, Multer, JWT, Bcrypt.js, Cors |
| **Database** | MySQL (with seamless zero-configuration SQLite fallback via built-in `node:sqlite`) |
| **AI Engine** | Local NLP heuristic semantic analysis engine + optional Google Gemini API support |
| **Maps** | Leaflet + OpenStreetMap & CartoDB tiles (zero paid API keys required) |

---

## 👥 Demo Personas & Credentials

For evaluation, presentations, and testing, NEXUS provides instant **1-Click Demo Profiles** in the navigation bar, as well as manual login credentials:

| Role | Persona Name | Demo Email | Password | Responsibilities |
|---|---|---|---|---|
| **Citizen** | Aarav Sharma | `citizen@nexus.demo` | `nexus123` | Submit defects, GPS pin drop, track timeline, verify resolution |
| **Admin** | Dr. Rajesh Kumar | `admin@nexus.demo` | `nexus123` | Command Center, priority queue, cluster grouping, department override |
| **Roads Resolver** | Er. Ramesh Patil | `roads@nexus.demo` | `nexus123` | Public Works: pothole patching, asphalt compaction, repair proofs |
| **Sanitation Resolver**| Priya Sundaram | `sanitation@nexus.demo` | `nexus123` | Solid Waste: garbage blackspots, compactor truck dispatch |
| **Water Resolver** | Anand Murthy | `water@nexus.demo` | `nexus123` | Water Board: pipeline rupture isolation, manhole covers |
| **Electrical Resolver**| Vikram Rao | `electrical@nexus.demo` | `nexus123` | Power & Grid: live wire isolation, streetlight repairs |

---

## 🚀 Getting Started & Running the Project

### Prerequisites
- Node.js v20+ (tested on Node.js v24)
- npm v10+

### Step 1: Start the Backend API Server
```bash
cd backend
npm install
npm start
```
- API will start on: `http://localhost:5000`
- Database: Automatically initializes with SQLite (`nexus.sqlite`) and 20+ realistic Indian community seed reports!
- If connecting to MySQL: Configure `USE_MYSQL=true`, `DB_PASSWORD=...` in `backend/.env`. A full SQL dump is provided at `backend/nexus_mysql.sql`.

### Step 2: Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Application opens at: `http://localhost:5173`

---

## 🗄️ Database Architecture

The schema is normalized across 13 core tables:
1. `roles`: Role definitions (`citizen`, `admin`, `resolver`).
2. `departments`: Civic bodies with contact emails, icons, and resolver counts.
3. `users`: Citizen reporters, administrators, and field engineers.
4. `categories`: Problem modules (Roads, Waste, Water, Electricity, Streetlights, Drainage, Transport, Facilities).
5. `locations`: Geo-coordinates, street addresses, landmarks, and ward numbers.
6. `issues`: Aggregated community issues with priority scores and resolution states.
7. `reports`: Raw submissions from individual citizens with photo evidence.
8. `issue_reports`: Many-to-many linkage between grouped complaints and community issues.
9. `ai_analysis`: NLP classification, detected safety risks, extracted keywords, and confidence ratings.
10. `status_history`: Auditable 7-step lifecycle timeline logs.
11. `progress_updates`: Field notes and evidence photos uploaded by department crews.
12. `notifications`: Real-time user notifications and verification reminders.
13. `feedback`: Citizen verification votes (`Resolved` vs `Disputed`) and rebuttal commentary.

---

## 🧪 Testing Checklist

- [x] Public Landing Page with live metrics and 6-step interactive workflow.
- [x] 1-Click Demo persona switcher and role-based views.
- [x] Multi-step Problem Reporting wizard with interactive map pin-drop.
- [x] Real-time AI Text Understanding and instant duplicate detection preview.
- [x] Automated Community Issue clustering.
- [x] Admin Command Center with Priority Queue, Department Workload, and AI Insights.
- [x] Department Resolver Portal with work order transitions and evidence upload.
- [x] Citizen Verification Loop with dispute rebuttal and re-opening logic.
- [x] Full-screen Interactive Leaflet Map with category markers and preview drawer.
- [x] Recharts Analytics (Trends area chart, category donut, workload bar chart, problem hotspots).
