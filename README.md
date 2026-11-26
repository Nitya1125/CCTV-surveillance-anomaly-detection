# AI-Powered CCTV Surveillance & Anomaly Detection Platform

[![Platform](https://img.shields.io/badge/Platform-Enterprise_CCTV_SaaS-2563EB.svg)](#)
[![Computer Vision](https://img.shields.io/badge/Computer_Vision-YOLOv8_%2B_DeepSORT-16A36A.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React_19_%7C_Node.js_%7C_FastAPI_%7C_MongoDB-DC4545.svg)](#)
[![License](https://img.shields.io/badge/License-Proprietary-697586.svg)](#)

A production-grade, enterprise physical security SaaS platform engineered for autonomous optical surveillance, multi-camera perimeter defense, and automated anomaly detection.

Designed with a minimal, high-trust light-theme enterprise aesthetic inspired by **Linear**, **Stripe**, and **Vercel**.

---

## 🏛️ System Architecture

```
                       ┌─────────────────────────────────────┐
                       │     Frontend Console (React 19)     │
                       │     Port 5173 (Vite + Tailwind)     │
                       └──────────────────┬──────────────────┘
                                          │ HTTP / Vite Proxy (/api)
                                          ▼
                       ┌─────────────────────────────────────┐
                       │      Backend API (Node/Express)     │
                       │      Port 3000 (JWT, RBAC, Multer)  │
                       └──────────┬───────────────────┬──────┘
                                  │                   │
         MongoDB (Port 27017)     │                   │ Multipart HTTP Stream
         "CVMU_final" Database    ▼                   ▼
                     ┌────────────────┐   ┌───────────────────────────────┐
                     │ MongoDB Cluster│   │ Python AI Microservice        │
                     │  Tenant Data   │   │ Port 8000 (FastAPI + Uvicorn) │
                     │   Isolation    │   ├───────────────────────────────┤
                     └────────────────┘   │ • YOLOv8 Human Detection      │
                                          │ • DeepSORT Optical Tracking   │
                                          │ • Polygon Zone Breach Engine  │
                                          │ • Velocity / Panic Spikes     │
                                          │ • Dwell Time / Loitering      │
                                          │ • H.264 Video Annotation      │
                                          └───────────────────────────────┘
```

---

## 🎯 Core Features

### 1. Minimal Light-Theme Enterprise UX
- Built with a strict **light-theme design system**: Pure White (`#FFFFFF`), Slate Surface (`#F5F7FA`), Deep Slate Text (`#252B36`), Muted Slate (`#697586`), Cobalt Accent (`#2563EB`), Emerald Success (`#16A36A`), and Coral Critical (`#DC4545`).
- Crisp 1px subtle borders (`#E5E9F0`), subtle elevations, responsive sidebar, mobile navigation drawer, and zero neon/purple clutter.

### 2. Autonomous Anomaly Detection Modules
- **Restricted Area Entry**: Point-in-polygon mathematical verification (`cv2.pointPolygonTest`) comparing human coordinate centers against custom interactive ROI bounding zones.
- **Sudden Running**: Measures Euclidean displacement across 10-frame intervals against `RUNNING_SPEED_THRESHOLD = 40` to catch perimeter breaches or panic stampedes.
- **Loitering Detection**: Optical cosine-similarity re-identification tracking dwell times of stationary targets exceeding `LOITERING_TIME_THRESHOLD = 8s`.

### 3. Interactive ROI Zone Calibration Canvas
- Direct video upload with synchronized HTML5 Canvas allowing security operators to click & drag custom polygon coordinates on top of real surveillance footage.

### 4. Enterprise RBAC & Tenant Data Isolation
- Role-based permissions: **Organization Owner**, **Admin**, **Operator**, and **Viewer**.
- **No hardcoded administrative credentials**. Self-service organization registration automatically establishes the creator as the Owner.
- 100% tenant-isolated data structures: all camera networks, video archives, and alert records are strictly bound to `req.user.organization_id`.

### 5. Multi-Camera Network & Telemetry Matrix
- Multi-camera monitoring grid (1x1 Focus, 2x2 Quad, 3x3 Matrix) with simulated live feeds, resolution, FPS telemetry, and real-time bounding polygon overlays.
- Complete Camera CRUD (Name, RTSP URL, Indoor/Outdoor/Perimeter type, FPS, Resolution, Zone tags).
- Incident ticketing, investigator case notes, and CSV export.

---

## 🚀 Step-by-Step Local Setup on Windows

### Prerequisites
1. **Node.js**: v18+ (tested on Node v24)
2. **Python**: v3.10+ (tested on Python 3.14)
3. **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017`

---

### Step 1: Start the Python AI Microservice

Open Terminal 1 (PowerShell or Command Prompt):
```powershell
cd d:\Projects\CCTV-surveillance-anomaly-detection\ai_service

# Activate virtual environment
.\venv\Scripts\activate

# Launch FastAPI Microservice on Port 8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Verification*: Open your browser to `http://127.0.0.1:8000/`. You will see `{"status":"online","service":"AI CCTV Surveillance API","version":"2.0.0"}`.

---

### Step 2: Start the Express Backend API

Open Terminal 2:
```powershell
cd d:\Projects\CCTV-surveillance-anomaly-detection\backend

# Run the backend server on Port 3000
npm start
```
*Verification*: Terminal will print:
`🚀 Surveillance Backend Service operational on port 3000`
`📦 MongoDB connected successfully to mongodb://127.0.0.1:27017/CVMU_final`

---

### Step 3: Start the Vite React Frontend

Open Terminal 3:
```powershell
cd d:\Projects\CCTV-surveillance-anomaly-detection\Frontend\ai-survellance

# Start Vite Development Server on Port 5173
npm run dev
```
*Access the Console*: Open `http://localhost:5173` in your browser.

---

## 🧪 Testing the Complete Workflow

1. **User Registration**:
   - Navigate to `http://localhost:5173/signup`.
   - Register a new operator account (e.g., Name: `Alex Mercer`, Email: `alex@vigilai.internal`, Username: `alex`, Password: `Password123!`).
2. **Organization Onboarding**:
   - Choose **Create New Organization**.
   - Enter your facility name (e.g., `Apex Security Operations HQ`).
   - You are immediately provisioned as the **Organization Owner** and 4 default surveillance cameras are automatically seeded into your network.
3. **Explore the Live Surveillance Matrix**:
   - Navigate to **Live Monitoring** (`/surveillance`) to view your multi-camera grid with live watermarks and optical zone overlays.
4. **Ingest Video & Draw Custom ROI Zone**:
   - Navigate to **Video Upload & ROI** (`/upload`).
   - Select a sample surveillance video from `ai_service/uploads/6387-191695740_medium.mp4`.
   - On the interactive canvas, click and drag a box over the video preview to establish a custom **Restricted Area** zone.
   - Click **Execute Analysis Pipeline**.
   - Watch the AI microservice detect humans, track targets, identify breaches, and stream the annotated output!
5. **Review Alerts & Incident Response**:
   - Navigate to **Alert Feed** (`/alerts`) to inspect the generated anomaly logs, change status to `Resolved`, or export an audit CSV.
   - Navigate to **Reports & Trends** (`/analytics`) to view live Recharts telemetry.

---

## 🔒 Security Highlights

- **No Hardcoded Passwords**: The insecure legacy `superadmin@123` seed has been completely removed.
- **Argon2 / Bcrypt Password Hashing**: Passwords hashed with salt factor 10.
- **Stateless JWT Authentication**: Validated per request via `Authorization: Bearer <token>`.
- **Tenant Isolation**: Every database operation strictly scopes queries to `organization_id: req.user.organization_id`.
