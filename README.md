# Showtime // Microservices Event Ticketing Platform

A modern, clean online movie ticket booking platform. It allows organizers to create movie events with photos and lets users securely buy tickets using Razorpay.

---

## 🏗️ Project Structure (Where things are)

The project is split into separate independent pieces (microservices) that talk to each other:

* `backend/auth-service` (Port 5001) – Handles user login and Google Sign-in.
* `backend/tenant-service` (Port 5002) – Manages organizer profiles and movie creations.
* `backend/ticket-service` (Port 5003) – Handles payments and generates ticket codes.
* `frontend` (Port 3000) – The beautiful website you see in the browser.

---

## ⚡ Key Features

1.  **Organizer Profile Lock:** Organizers must fill out their business and bank details before they can publish movies. This keeps the data clean.
2.  **Easy Image Uploads:** Upload posters and logos directly from your computer. The system automatically handles large files flawlessly.
3.  **Organizer Dashboard:** Displays simple stats (money made, tickets sold) and has a quick button to **Cancel** any movie, which instantly freezes ticket sales.
4.  **Audience Explorer:** A premium view for users to browse live movies, choose ticket quantities, and pay using the native Razorpay checkout window.

---

## 🛠️ How to Setup and Run

### 1. Environment Files (.env)
Make sure you have your config files inside the backend folders:

**In `backend/tenant-service/.env`:**
```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000

```

**In `backend/ticket-service/.env`:**

```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_SymOmUg6RB2DZr
RAZORPAY_KEY_SECRET=2JDsx14p6q53YZeSwa4UP2nD

```

---

### 2. Run the App

Open a separate terminal window for each service and run these commands:

```bash
# Terminal 1: Auth Service
cd backend/auth-service
npm install
npm run dev

# Terminal 2: Tenant Service
cd backend/tenant-service
npm install
npm run dev

# Terminal 3: Ticket Service
cd backend/ticket-service
npm install
npm run dev

# Terminal 4: Frontend Website
cd frontend
npm install
npm run dev

```

---


## 🛠️ Tech Stack Used

* **Frontend:** React, Tailwind CSS, Axios
* **Backend:** Node.js, Express, MongoDB (Mongoose), Razorpay Payment Gateway
