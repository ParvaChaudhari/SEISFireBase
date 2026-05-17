# SEIS — Student Enrollment Information System

A full-stack academic portal built with **Next.js 14**, **Firebase Firestore**, and **Firebase Authentication**, designed to streamline course enrollment management for both students and faculty administrators.

> Originally developed as a group project (2024). **UI/UX and architecture significantly extended and improved** — modernizing the interface with a premium design system, adding an interactive data visualization layer, CI/CD pipeline, and a recruiter-accessible demo mode.

---

## ✨ Features

### Student Portal
- Authenticated login with Firebase Email/Password
- Enroll in and drop courses with instant **optimistic UI updates**
- Set and manage enrollment **alert notifications** per course
- Academic progress tracker showing degree completion and GPA overview

### Admin / Faculty Dashboard
- Protected admin-only route enforced via **Firebase Custom Claims**
- **Interactive D3.js visualizations** with animated transitions:
  - 📈 **Timeline Graph** — Day-by-day enrollment trend with hover tooltip and vertical tracking line
  - 🍩 **Donut Chart** — Department distribution breakdown with arc hover expansion
  - 📊 **Bar Chart** — Course capacity utilization colored by health metrics
- Segmented visualization control tabs to switch between chart types
- Dynamic course selector dropdown with search filtering
- Live KPI cards (total enrolled, capacity utilization, weekly growth)

### General
- **Demo Mode** — Recruiters can instantly log in as a Demo Student or Demo Admin without creating an account
- Dual-tab login card for Student / Admin / Staff roles
- Firebase Authentication enforced role-based routing (claims-based)
- Glass-morphic design system with smooth micro-animations throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 14 (App Router), React |
| Styling | Vanilla CSS, custom design tokens |
| Database | Cloud Firestore (NoSQL) |
| Auth | Firebase Authentication (Email/Password + Custom Claims) |
| Charts | D3.js (dynamic SVG transitions) |
| Hosting | Firebase Hosting (Static Export, free Spark plan) |
| CI/CD | GitHub Actions (auto-deploy on push to `master`) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Authentication enabled

### 1. Clone & Install

```bash
git clone https://github.com/ParvaChaudhari/SEISFireBase.git
cd SEISFireBase
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with your Firebase project credentials:

```env
NEXT_PUBLIC_apiKey="YOUR_API_KEY"
NEXT_PUBLIC_authDomain="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_projectId="YOUR_PROJECT_ID"
NEXT_PUBLIC_storageBucket="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_messagingSenderId="YOUR_SENDER_ID"
NEXT_PUBLIC_appId="YOUR_APP_ID"
NEXT_PUBLIC_collection="enrollments"
NEXT_PUBLIC_collection_alerts="alerts"
NEXT_PUBLIC_collection_summaire="summary"
```

### 3. Seed the Database (Optional)

To populate the dashboard with realistic enrollment data:

```bash
# First, create a serviceAccountKey.json from Firebase Console > Project Settings > Service Accounts
node init-db.js
node seed_dummy_data.js
```

> ⚠️ `serviceAccountKey.json` is in `.gitignore` and should **never** be committed to version control.

### 4. Promote an Admin User

```bash
node promote_admin.js your@email.com
```

Then sign out and back in to refresh your Firebase token.

### 5. Run Locally

```bash
npm run dev
```

---

## 🌐 Hosting (Firebase Hosting — Free Tier)

This project is configured as a **static HTML export** (`output: 'export'` in `next.config.js`), enabling deployment on Firebase's **free Spark plan** without needing paid cloud functions or App Hosting.

```bash
# Build the static export
npm run build

# Deploy to Firebase Hosting + apply Firestore security rules
firebase deploy --only hosting,firestore:rules
```

A **GitHub Actions CI/CD pipeline** is included (`.github/workflows/`) that automatically builds and deploys the live site every time a PR is merged to `master`.

---

## 🔒 Security

- Firestore security rules (`firestore.rules`) restrict writes to authenticated sessions only
- Admin dashboard summary writes are locked to verified admin accounts
- `serviceAccountKey.json` and all `.env` files are blocked by `.gitignore`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── AdminDashBoard/    # Faculty analytics dashboard + D3 charts
│   ├── CourseManagement/  # Course inventory management
│   ├── Login/             # Auth page with role tabs + demo access
│   ├── SignUp/            # New student registration
│   └── UserDashBoard/     # Student enrollment & alerts view
├── components/
│   └── Navigation.js      # Top nav with active-tab underline indicator
├── context/
│   └── AuthContext.js     # Firebase auth state + admin claim resolution
└── firebase/
    ├── config.js          # Firebase app initialization
    ├── signin.js
    ├── signup.js
    └── firestore/         # Firestore query helpers
```
