
# Microservices Event Ticketing Platform // SHOWTIME

A high-performance, multi-tenant digital box office platform built with a decoupled MERN microservices architecture. The system features a premium, brutalist editorial user interface design, client-side binary-to-Base64 media streaming, and cryptographically verified live payment processing via Razorpay.

---

## 🏗️ System Architecture & Ports Matrix

The platform is engineered as a decoupled monorepo composed of autonomous backend engines interacting with a unified React presentation layer using explicit tenant identification boundaries (`x-tenant-id`).

```text
ticketing-monorepo/
├── backend/
│   ├── auth-service/       # Port 5001 -> Secure session cookies & Google OAuth
│   ├── tenant-service/     # Port 5002 -> Corporate metrics, profile verification & event factory
│   └── ticket-service/     # Port 5003 -> Razorpay order compilation & verification loops
└── frontend/               # Port 3000 -> Brutalist React + Tailwind UI Matrix

```

---

## ⚡ Core Operational Features

### 1. Multi-Tenant Isolation

* Seamless scope containment using an incoming custom router header (`x-tenant-id: production-main`).
* Dynamic configuration resolution maps that alter brand name layouts, taglines, and payment routing coordinates on the fly.

### 2. High-End Organizer Workflow

* **Corporate Profile Verification Matrix:** Organizers must fulfill bank tracking numbers and contact validation fields before the system lifts listing restrictions.
* **Manifest Factory:** Allows immediate event publishing. Features a native binary file input system that translates graphics into Base64 Data URLs on the client side, bypassing default body-parser restrictions.
* **Drill-Down Control Surface:** Grid-based layout cards tracking real-time data metrics (Gross Revenue, Capacity Weights, Booking Density Ratios) complete with an automated execution toggle to cancel active listings and freeze further ticket sales instantly.
* **Data Visualizations:** Dynamic bar charts tracking performance variables vs. incoming cash flow, and unified categorization allocation pie charts.

### 3. Audience Explorer & Reservation Loop

* Standardized vertical layout cards designed for dual-use compatibility across tracking grids.
* Split-screen reservation terminals with interactive volume counter arithmetic.
* Dynamic runtime script injection connecting directly to the Razorpay checkout overlay sheet, backed by backend HMAC SHA256 cryptographic signature validation.

---

## 🛠️ Installation & Boot Sequences

### Pre-Requisites

Ensure your system paths have **Node.js (v24+)** installed and an accessible **MongoDB Atlas Cluster** configured.

### 1. Environmental Configuration Setup

Ensure each local directory contains its isolated `.env` configuration file:

**`backend/tenant-service/.env`**

```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000

```

**`backend/ticket-service/.env`**

```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_SymOmUg6RB2DZr
RAZORPAY_KEY_SECRET=2JDsx14p6q53YZeSwa4UP2nD

```

---

### 2. Booting the Ecosystem

Open individual terminal panels for each standalone service or configure your workspace runner to boot concurrently:

```bash
# Terminal 1: Launch Authentication Node
cd backend/auth-service
npm install
npm run dev

# Terminal 2: Launch Customization Engine
cd backend/tenant-service
npm install
npm run dev

# Terminal 3: Launch Payment & Checkout Node
cd backend/ticket-service
npm install
npm run dev

# Terminal 4: Launch the Brutalist User Interface
cd frontend
npm install
npm run dev

```

---

## 📐 Technology Stack Designations

* **Frontend:** React, React Router DOM, Tailwind CSS (Brutalist Variant UI), Axios (Pre-configured Interceptors)
* **Backend:** Node.js, Express, Mongoose (MongoDB ODM Matrix), Razorpay Node SDK, Crypto (Native Hash Validation)
* **Data Transport:** Custom HTTP Header Context Mapping (`x-tenant-id`), Base64 Streaming Data Structures

---

## ⚖️ License

Distributed under a closed proprietary structure for demo presentation deployment. Developed in 2026.

