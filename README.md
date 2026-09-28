# 🏪 Store Rating Platform

The **Store Rating Platform** is a full-stack web application designed for registering stores, submitting and modifying store ratings, and viewing performance dashboards. The application organizes users into three specific roles—System Administrator, Normal User, and Store Owner—each accessing a customized dashboard layout.

This project implements client and server-side data validations, JWT token authentication, and cascading database deletions. It is built to run cleanly both on a developer's local machine and on serverless cloud platforms. The frontend features a **premium, animated user interface** with a built-in Command Palette for fast navigation.

**This project was developed as part of a Full Stack Intern Coding Challenge.**

---

## 🌐 Live Demo

*   🚀 **Frontend**: [https://store-rating-platform-wpv6.vercel.app](https://store-rating-platform-wpv6.vercel.app)

---

## 🔐 Demo Credentials

Use these pre-configured accounts to test role-based dashboard screens and permissions:

### 👑 Administrator
*   **Email**: `admin@example.com`
*   **Password**: `Admin@123`

### 🧑 Normal User
*   **Email**: `user@gmail.com`
*   **Password**: `User@123`

### 🏪 Store Owner
*   **Email**: `owner@gmail.com`
*   **Password**: `Owner@123`

---

## 🧪 How to Use & Test

To fully evaluate the platform, follow these steps to experience the role-based workflows:

1. **Test the Admin Flow:**
   - Log in using the **Administrator** credentials.
   - Navigate to the **Users** section to see how you can manage all roles. Try creating a new Store Owner.
   - Navigate to the **Stores** section and create a new store, assigning it to the owner you just created.
   - Press `Ctrl + K` (or `Cmd + K`) to try out the quick-navigation Command Palette.

2. **Test the User Flow:**
   - Log out and log back in using the **Normal User** credentials.
   - Browse the list of stores (you can search or sort them).
   - Submit a 1-5 star rating for the store you created in the admin step. 
   - Notice the micro-animations (button ripples, modal scale-ins) when interacting with the UI.

3. **Test the Owner Flow:**
   - Log out and log back in using the **Store Owner** credentials.
   - You will land on the Owner Dashboard.
   - Verify that you can see the average rating update in real-time, along with the detailed review you just submitted as a user.

---

## ✨ Features

### System Administrator Dashboard
*   **Global Overview**: View total counts of users, stores, and ratings.
*   **User Management**: View, detail, add, and delete user accounts. Includes automatic deletion safeguards to block admins from deleting themselves.
*   **Store Management**: Add stores and assign owners.

### Normal User Dashboard
*   **Store Directory**: Search registered stores by name or address, and sort results.
*   **Star Rating Manager**: Submit new ratings (1-5 stars) or edit existing ones. A user can only rate each store once.

### Store Owner Dashboard
*   **Store Metrics**: View average rating score and total rating count for their store.
*   **Reviews Log**: Access a list of customer reviews showing customer name, email contact, star score, and timestamp.

### 🌟 Premium UI & User Experience
*   **Command Palette**: Press `Ctrl + K` (or `Cmd + K`) anywhere in the app to open a searchable navigation menu.
*   **Micro-Animations**: Smooth cascading reveals, slide-up entrances, button ripples, and glow pulses for a modern, responsive feel.
*   **Polished Aesthetics**: Clean dark/light contrast using OKLCH colors, glassmorphism hints, and custom scrollbars.

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 19 + Vite (Chosen for fast hot-module replacement and modern React features)
*   **Routing**: React Router v7 (Handles role-based protected routes seamlessly)
*   **Styling**: Tailwind CSS v4 + Custom CSS Animations (Provides a premium, responsive UI with custom OKLCH color palettes and micro-interactions)
*   **Icons**: Lucide React (Clean, consistent iconography)
*   **State Management**: React Context API (Manages global authentication and toast notification states without Redux bloat)
*   **Form Validation**: Zod (Ensures strict type-safe schema validation before submission)
*   **HTTP Client**: Axios (Configured with interceptors to automatically attach JWT Bearer tokens)

### Backend
*   **Framework**: Node.js + Express.js (Lightweight and highly scalable API architecture)
*   **ORM**: Sequelize (Provides robust relational data modeling and promise-based SQL querying)
*   **Validation Middleware**: Express Validator (Validates incoming request payloads to prevent bad data insertion)
*   **Security Tools**: bcryptjs (Salted password hashing), jsonwebtoken (Stateless JWT authentication)

### Database
*   **Engine**: MySQL (Hosted on TiDB Cloud Serverless for high availability and zero-config deployment)

### Deployment
*   **Frontend**: Vercel (Single Page App routing rule configuration)
*   **Backend**: Vercel (Express routed as serverless endpoints)

---

## 🏗 Architecture Overview

The application is structured around a decoupled **Client-Server-Database** architecture:

```text
+-------------------+
|   React Frontend  |
|                   |
+---------+---------+
          |
          | HTTPS + JWT
          v
+-------------------+
|   Express API     |
|                   |
+---------+---------+
          |
          | Authentication
          | Authorization
          | Validation
          v
+-------------------+
|   Sequelize ORM   |
+---------+---------+
          |
          v
+-------------------+
| MySQL Database    |
| (TiDB Cloud)      |
+-------------------+
```

### Request Flow

1. User interacts with the React frontend.
2. Frontend sends API requests with JWT tokens.
3. Express validates authentication and user roles.
4. Sequelize handles database operations.
5. MySQL stores users, stores, and ratings.
6. Response is returned to the frontend.



## 🗄 Database Design

The database design uses a relational schema with foreign keys, indexes, and transactional cascades.


### Tables

#### Users

| Column   | Type         | Description        |
| -------- | ------------ | ------------------ |
| id       | UUID         | Primary Key        |
| name     | VARCHAR(60)  | User Full Name     |
| email    | VARCHAR(255) | Unique Email       |
| password | VARCHAR(255) | Hashed Password    |
| address  | VARCHAR(400) | User Address       |
| role     | ENUM         | admin, user, owner |

#### Stores

| Column  | Type         | Description           |
| ------- | ------------ | --------------------- |
| id      | UUID         | Primary Key           |
| name    | VARCHAR(60)  | Store Name            |
| email   | VARCHAR(255) | Store Email           |
| address | VARCHAR(400) | Store Address         |
| ownerId | UUID         | Store Owner Reference |

#### Ratings

| Column  | Type    | Description     |
| ------- | ------- | --------------- |
| id      | UUID    | Primary Key     |
| storeId | UUID    | Store Reference |
| userId  | UUID    | User Reference  |
| value   | INTEGER | Rating (1-5)    |

### Relationships

```text
User (Owner)
      |
      | owns
      v
   Stores
      |
      | receives
      v
   Ratings
      ^
      |
      | submits
      |
Normal User
```

### Database Constraints

* One user can submit only one rating per store.
* Ratings must be between 1 and 5.
* Email addresses are unique.
* Passwords are stored as bcrypt hashes.
* Store ownership is maintained through foreign key relationships.




### Key Schema Guidelines
*   **User Deletion Cascade**: Deleting a normal user removes their ratings to keep overall average scores accurate. Deleting an owner changes the store's `ownerId` to `null`, keeping the store intact.
*   **Uniqueness**: A unique composite index on `[storeId, userId]` inside the `Ratings` table restricts rating counts to one per store per user.

---

## 📁 Project Structure

```text
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize database configuration
│   │   ├── controllers/     # Request handlers & dashboard metrics logic
│   │   ├── middleware/      # JWT auth, role validation, & parameter checks
│   │   ├── models/          # User, Store, & Rating table models
│   │   ├── routes/          # REST endpoints mapping
│   │   └── app.js           # Server application setup
│   ├── scripts/             # Seeding scripts (seed-admin.js)
│   ├── package.json
│   └── vercel.json          # Backend Vercel Serverless configuration
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance with Bearer interceptors
│   │   ├── components/      # Common navigation and route-guard wrappers
│   │   ├── context/         # Auth and Toast global context states
│   │   ├── pages/           # Pages (Admin list, Store list, Owner dashboard, Login)
│   │   ├── validations/     # Zod schema checks
│   │   ├── App.jsx          # Route paths configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vercel.json          # SPA routing redirects configurations
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔑 Authentication & Authorization

*   **JWT Sessions**: Users are issued a token containing claims (`id`, `email`, `role`) signed using `HS256`.
*   **Bcrypt Hashing**: User passwords are encrypted using 10 rounds of salt generation.
*   **Role-Based Access Control (RBAC)**: Custom middlewares in the backend (`role.middleware.js`) restrict endpoints, while route guards on the client (`ProtectedRoute.jsx`) control UI view access.

---

## 🔗 Main API Endpoints

### Public / Auth
*   `POST /api/auth/signup` — Register a normal user account.
*   `POST /api/auth/login` — Check credentials and return JWT token.

### Administrators Only
*   `GET /api/admin/stats` — Retrieve total users, stores, and ratings counts.
*   `GET /api/users` — Fetch all users with search filtering and sorting.
*   `POST /api/users` — Add a new user (Admin, User, or Owner role).
*   `DELETE /api/users/:id` — Delete a user. Set store owner to null, delete ratings.
*   `POST /api/stores` — Register a new store and link it to an owner.

### Normal Users Only
*   `GET /api/stores` — Browse stores (includes search by name/address and sorting).
*   `POST /api/ratings` — Submit a rating (1-5 value).
*   `PATCH /api/ratings/:id` — Edit an existing rating.

### Store Owners Only
*   `GET /api/ratings/my-store` — Retrieve owner store reviews and average rating score.

### Profile Settings
*   `PATCH /api/users/password` — Reset current user's password.

---

## 🚀 Local Setup

### 1. Database Configuration
Ensure a MySQL instance is running, or create a remote connection.

### 2. Backend Installation
1.  Navigate to the backend directory and install packages:
    ```bash
    cd backend
    npm install
    ```
2.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=3000
    DATABASE_URL=mysql://username:password@localhost:3306/store_ratings
    JWT_SECRET=your_jwt_secret_token
    ```
3.  Run migrations and seed default administrative users:
    ```bash
    npm run seed
    ```
4.  Start development API server:
    ```bash
    npm run dev
    ```

### 3. Frontend Installation
1.  Navigate to the frontend directory and install packages:
    ```bash
    cd ../frontend
    npm install
    ```
2.  Start Vite server:
    ```bash
    npm run dev
    ```
3.  Access the web application by opening `http://localhost:5173`.

---

## 📋 Assignment Requirements Coverage

- [x] **Single Authentication System**: One shared endpoint for all user profiles login.
- [x] **Role-Based Access Control**: Checked client-side and server-side.
- [x] **Store Ratings (1-5)**: Constrained value range.
- [x] **Search**: Search by store name and address.
- [x] **Sorting**: User directories and stores dashboards support sorting.
- [x] **Dashboard Analytics**: Calculated metrics lists for Admin and Store Owners.
- [x] **Password Update**: Users can reset password inside dashboard profile views.
- [x] **User Management**: Admin interface to create and delete users.
- [x] **Store Management**: Admin registry to create stores.

---

## 🚀 Future Improvements

1.  **Paginated Listings**: Introduce pagination limits to store listings and user directories.
2.  **Notification Emails**: Send email alerts to store owners when a review is submitted.
3.  **Performance Caching**: Integrate Redis to cache store average scores.
4.  **Audit Logs**: Add an administrative log table to trace deletions and creations.
5.  **Docker compose**: Add container configs for local development setup.

