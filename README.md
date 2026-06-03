
# 🏢 Multi-Tenant SaaS CRM System

A full-stack MERN application that allows multiple companies (tenants) to manage their leads, deals, and team members within a single platform — with completely isolated data per tenant.

---
## Live Demo

Frontend: https://crmfrntend.vercel.app/ 
Backend API: https://crmbackend-yxzh.onrender.com


## 📁 Project Structure

```
root/
├── TENANTBCK/                  # Backend (Node.js + Express + MongoDB)
│   ├── controller/
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   ├── dealController.js
│   │   ├── leadController.js
│   │   └── teamController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Company.js
│   │   ├── Deal.js
│   │   ├── Lead.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── dealRoutes.js
│   │   ├── leadRoutes.js
│   │   └── teamRoutes.js
│   ├── utils/
│   │   └── db.js
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
└── TENANTFE/ (tenantcrm)       # Frontend (React.js)
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        │   ├── Company.jsx
        │   ├── Modal.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── Sidebar.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Deals.jsx
        │   ├── Leads.jsx
        │   ├── Login.jsx
        │   ├── Sdashboard.jsx
        │   ├── Signup.jsx
        │   ├── SuperSubscription.jsx
        │   ├── Superusers.jsx
        │   ├── Team.jsx
        │   └── Udashboard.jsx
        ├── services/
        │   └── api.js
        ├── App.css
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## ✨ Features

### 🔐 Authentication
- User Signup and Login with JWT tokens
- Password hashing using **bcrypt**
- Protected routes for authenticated users only

### 🏗️ Multi-Tenancy
- Each user belongs to a **Company (Tenant)**
- All data (leads, deals, teams) is strictly **isolated per company**
- `companyId` is attached to every record to enforce tenant boundaries
- Middleware automatically filters data based on the authenticated user's company

* **Clone Frontend**
git clone[https://github.com/shaznashafi12/crmfrntend]

* **Clone Backend**
git clone[https://github.com/shaznashafi12/crmbackend]

### 👥 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **User** | Create & manage leads, convert leads to deals, view activity |
| **Admin** | All User permissions + Add/remove team members, assign roles, manage sales pipelines |
| **Super Admin** | Create/manage companies, assign subscription plans, monitor platform usage |

### 📊 Core Modules
- **Leads Management** — Create, update, delete, and convert leads
- **Deals Management** — Track deals through the sales pipeline
- **Team Management** — Admin-level member and role management
- **Company Management** — Super Admin controls for tenant administration
- **Subscription Plans** — Super Admin assigns and manages plan tiers

---

## 🛠️ Tech Stack

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose** — ODM for MongoDB
- **JWT (jsonwebtoken)** — Authentication tokens
- **bcryptjs** — Password hashing
- **dotenv** — Environment variable management
- **cors** — Cross-origin resource sharing

### Frontend
- **React.js** — UI library
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client for API calls
- **Context API** — Global auth state management

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)
- [Git](https://git-scm.com/)

---

## 🔧 Backend Setup

### 1. Navigate to the backend directory

```bash
cd TENANTBCK
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `TENANTBCK` root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tenantcrm
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

> ⚠️ Replace `your_super_secret_jwt_key_here` with a strong random secret.
> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 4. Start the backend server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will run on: `http://localhost:5000`

---

## 💻 Frontend Setup

### 1. Navigate to the frontend directory

```bash
cd TENANTFE/tenantcrm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API base URL

In `src/services/api.js`, make sure the base URL points to your backend:

```js
const API_BASE_URL = "http://localhost:5000/api";
```

### 4. Start the frontend development server

```bash
npm run dev
```

The frontend will run on: `http://localhost:5173`

---

## 🌐 API Reference

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login and receive JWT | Public |

### Leads

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/leads` | Get all leads (tenant-scoped) | User, Admin |
| `POST` | `/api/leads` | Create a new lead | User, Admin |
| `PUT` | `/api/leads/:id` | Update a lead | User, Admin |
| `DELETE` | `/api/leads/:id` | Delete a lead | User, Admin |

### Deals

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/deals` | Get all deals (tenant-scoped) | User, Admin |
| `POST` | `/api/deals` | Create a new deal | User, Admin |
| `PUT` | `/api/deals/:id` | Update a deal | User, Admin |
| `DELETE` | `/api/deals/:id` | Delete a deal | Admin |

### Team

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/team` | Get all team members | Admin |
| `POST` | `/api/team` | Add a team member | Admin |
| `PUT` | `/api/team/:id` | Update member role | Admin |
| `DELETE` | `/api/team/:id` | Remove a team member | Admin |

### Companies (Super Admin)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/companies` | List all companies | Super Admin |
| `POST` | `/api/companies` | Create a new company | Super Admin |
| `PUT` | `/api/companies/:id` | Update company / subscription | Super Admin |
| `DELETE` | `/api/companies/:id` | Delete a company | Super Admin |

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "String (user | admin | superadmin)",
  "companyId": "ObjectId (ref: Companies)",
  "createdAt": "Date"
}
```

### Companies Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "subscriptionPlan": "String (free | basic | premium)",
  "isActive": "Boolean",
  "createdAt": "Date"
}
```

### Leads Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "phone": "String",
  "status": "String (new | contacted | qualified | converted)",
  "companyId": "ObjectId (ref: Companies)",
  "createdBy": "ObjectId (ref: Users)",
  "createdAt": "Date"
}
```

### Deals Collection
```json
{
  "_id": "ObjectId",
  "title": "String",
  "value": "Number",
  "stage": "String (prospect | proposal | negotiation | closed-won | closed-lost)",
  "companyId": "ObjectId (ref: Companies)",
  "leadId": "ObjectId (ref: Leads)",
  "assignedTo": "ObjectId (ref: Users)",
  "createdAt": "Date"
}
```

---

## 🔒 Middleware

### `auth.js` — JWT Verification
Validates the Bearer token from the `Authorization` header and attaches the decoded user (with `companyId` and `role`) to `req.user`.

```
Authorization: Bearer <your_jwt_token>
```

### Tenant Filtering
All database queries in controllers are automatically scoped using `req.user.companyId`, ensuring users can only ever access their own company's data.

### Role Guard
Route-level middleware checks `req.user.role` and rejects unauthorized access with a `403 Forbidden` response.

---

## 🖥️ Frontend Pages

| Page | Route | Description | Role Access |
|------|-------|-------------|-------------|
| Login | `/login` | User authentication | Public |
| Signup | `/signup` | New user registration | Public |
| Dashboard | `/dashboard` | Overview and stats | User, Admin |
| User Dashboard | `/udashboard` | Personal activity view | User |
| Super Dashboard | `/sdashboard` | Platform-wide overview | Super Admin |
| Leads | `/leads` | Lead management table | User, Admin |
| Deals | `/deals` | Deal pipeline view | User, Admin |
| Team | `/team` | Team member management | Admin |
| Super Users | `/superusers` | All users across tenants | Super Admin |
| Super Subscriptions | `/supersubscriptions` | Manage subscription plans | Super Admin |

---

## 🚀 Deployment

### Backend (e.g., Render / Railway)

1. Push `TENANTBCK` to a GitHub repository
2. Connect to [Render](https://render.com)  
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`)
4. Set build command: `npm install`
5. Set start command: `npm start`

### Frontend (e.g., Vercel / Netlify)

1. Push `TENANTFE` to a GitHub repository
2. Connect to [Vercel](https://vercel.com)  
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Update `src/services/api.js` with the deployed backend URL

---

## 🧪 Testing the App Locally

### Create a Super Admin (manually via MongoDB or a seed script)

```js
// Example seed entry in MongoDB Compass or mongosh
db.users.insertOne({
  name: "Super Admin",
  email: "superadmin@example.com",
  password: "<bcrypt-hashed-password>",
  role: "superadmin",
  companyId: null
});
```

### Sample Login Flow

1. Super Admin logs in → creates a Company → creates an Admin user for that company
2. Admin logs in → adds team members → manages leads and deals
3. Regular User logs in → creates and manages their own leads and deals

---

## 🤝 Contributing

This project was built as part of an internship evaluation task for **4Hand Studio**.

---

## 📬 Contact

For any queries related to this submission:
- **Email:** info@4handstudio.in
- **CC:** nikhilrajk@4handstudio.in

---

## 📄 License

This project is submitted for evaluation purposes only.