# Walkthrough - Rumana's Kitchen Full-Stack Migration

We have successfully migrated the single-page HTML website into an extraordinary, state-of-the-art **React + Vite + TypeScript (Frontend)** and **Python Flask (Backend)** web application!

---

## 🏗️ Architecture Overview

- **Frontend (Vercel or GitHub Pages):** A modern Single Page Application (SPA) styled with custom premium variables, Outfit/Playfair typography, Ken Burns transition slideshows, and smooth micro-animations. It automatically interacts with the Render backend API.
- **Backend (Render):** A Flask API server that manages the menu catalog, availability states, and dinner slot controls using a lightweight JSON database file (`menu_db.json`).

---

## 🛠️ Key Features Built

### 1. ⚙️ Hidden Secure Admin Dashboard
- **Completely Hidden from Customers:** Removed any public "Admin Dashboard" buttons from the homepage.
- **URL Hash Routing:** Access to the management screen is only possible by explicitly visiting the URL with the hash appended:
  `https://firojinfinity.github.io/rumanaskitchen/#admin`
  *(Or `http://localhost:5174/#admin` locally)*
- **Interactive Controls:**
  - **Live Inventory Toggle:** Toggle an item between **Available** (green ✅ tag visible to customers) and **Sold Out** (image blurred, "+" button hidden, shows red ❌ tag).
  - **Bulk Toggles:** Added **"Mark All Available"** and **"Mark All Sold Out"** buttons to toggle all items in a single click.
  - **Editable Fields:** Update item names, prices, and quantity descriptions on the fly.
  - **Publish Changes:** Instantly write and deploy updates back to the Render database without code deploys.
  - **Dinner Mode Switch:** Toggle `BIRIYANI_ONLY_MODE` globally from the dashboard.

### 2. 🍽️ Premium Customer Interface & Failsafe Fallback
- **Menu Visibility Failsafe:** Hardcoded a static copy of all 22 default items in the React frontend. If the Render backend server is not running or takes time to respond, the menu will still display instantly instead of showing "No items match your search".
- **Dynamic Search & Category Filters:** Instantly filters catalog cards as you type or switch categories.
- **Responsive Layout:** Adaptive styling for desktop, tablet, and mobile screens.
- **Interactive Cart & WhatsApp Checkout:** Adds items to cart, updates totals, and formats a WhatsApp reservation message with correct price items on checkout click.
- **Image Fallback Mechanism:** All cards loading external links feature an `onerror` handler pointing to local assets (`veg.jpg`, `mutton.jpg`, `biriyani.jpg`, etc.) if network connectivity goes offline.

---

## 📂 Project Structure

```
rumanaskitchen/
├── backend/
│   ├── app.py             # Python Flask API server (running on port 5050)
│   ├── menu_db.json       # JSON Local Database seed file
│   ├── .gitignore         # Ignores virtual env and caches
│   └── requirements.txt   # Backend dependencies
├── public/                # Static food image assets (biriyani.jpg, mutton.jpg, etc.)
├── src/
│   ├── App.tsx            # Main React routing and state logic
│   ├── index.css          # Core custom design styling rules
│   └── main.tsx           # Entry React mounting module
├── package.json           # Frontend dependency config
└── index.html             # Entry HTML root document
```

---

## 🚀 How to Run Locally

### 1. Run the Python Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   ./venv/bin/pip install -r requirements.txt
   ```
3. Run the Flask API server:
   ```bash
   ./venv/bin/python app.py
   ```
   *The backend will boot up at `http://localhost:5050`.*

### 2. Run the React Frontend Server
1. Navigate back to the root of the project.
2. Install node packages:
   ```bash
   npm install
   ```
3. Boot the development dev server:
   ```bash
   npm run dev
   ```
   *The React App will open at `http://localhost:5174/` (or `http://localhost:5173/`) and connect to `http://localhost:5050`.*

---

## ☁️ Deployment Guide (Single Repository Setup)

Since both the React frontend and Python backend live in the **same** repository (`firojinfinity/rumanaskitchen`), deployment is extremely clean and straightforward.

---

### Step 1: Commit and Push Changes to GitHub
From the project folder, run these commands in your terminal to push all the code to your repository:
```bash
git add .
git commit -m "Migrate to full-stack React and Python backend in single repo"
git push origin main
```

---

### Step 2: Deploy Backend to Render (For your Sir)
Your sir can deploy the backend directly from the repository settings:
1. Go to the [Render Dashboard](https://render.com/) and click **"New"** > **"Web Service"**.
2. Select the `firojinfinity/rumanaskitchen` repository.
3. Configure the settings:
   - **Root Directory:** **`backend`** (Crucial: tells Render the Python backend code is in the backend folder).
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt` (Render will build this inside the backend folder).
   - **Start Command:** `gunicorn app:app` (Render will start the app inside the backend folder).
4. Add the environment variable **`ADMIN_PASSWORD`** (e.g., set to `rumana123` or your sir's custom passcode).
5. Deploy. Copy the resulting **Render Web Service URL** (e.g. `https://rumanas-backend.onrender.com`).

---

### Step 3: Link Backend URL on the Frontend
Now, tell the frontend React app where to locate the Render backend. You have two options:

#### Option A: Set Vercel Env Variable (Recommended)
1. Go to the [Vercel Dashboard](https://vercel.com/) and import the `rumanaskitchen` repository.
2. Under **Environment Variables**, add `VITE_API_URL` and paste your sir's **Render Web Service URL** (e.g. `https://rumanas-backend.onrender.com`).
3. Deploy the project.

#### Option B: Hardcode it in the Code
If you are deploying to GitHub Pages or prefer not to configure Vercel env vars:
1. Open [src/App.tsx](file:///Users/fazal/Documents/firojsir/rumanaskitchen/src/App.tsx) around line 22:
   ```typescript
   const API_BASE = import.meta.env.VITE_API_URL || (
     window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
       ? 'http://localhost:5050' 
       : 'https://YOUR_BACKEND_RENDER_URL_HERE.onrender.com' // <-- Paste Render URL here
   );
   ```
2. Replace `https://YOUR_BACKEND_RENDER_URL_HERE.onrender.com` with the actual Render link.
3. Commit and push the code back to GitHub.
