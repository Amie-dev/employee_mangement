
# 🚀 Employee Management Backend

A complete backend system for managing **employees, projects, tasks, and notes**, built with **Node.js, Express, and MongoDB**.  
This project focuses on **scalability, modularity, and security** with features like **JWT authentication, RBAC, file uploads, and clean API structure**.

---

## ✨ Features

### 🔹 Authentication & Authorization

- JWT-based authentication for secure access.
- Role-Based Access Control (**RBAC**) with roles:  
  - `ADMIN`  
  - `PROJECT_ADMIN`  
  - `USER`

### 🔹 User Management

- User registration with validation and avatar upload (Multer + Cloudinary).
- Secure login, logout, refresh tokens, and password change support.
- Fetch current logged-in user info.

### 🔹 Project Management

- Create, update, delete, and fetch projects.
- Add/remove project members with role control.
- Scalable API structure for collaboration features.

### 🔹 Task Management

- Create, update, assign, and delete tasks.
- Track task status updates.
- Fetch all tasks assigned to a user in a project.
- Role-based restrictions for assignments.

### 🔹 Notes Management

- Add, update, and delete project notes.
- Collaboration-ready notes linked with projects.

---

## ⚡ Tech Stack

- **Node.js** + **Express.js** – Backend framework
- **MongoDB + Mongoose** – Database & ODM
- **JWT** – Authentication
- **Multer + Cloudinary** – File uploads (avatars, attachments)
- **Nodemailer + Mailgen** – Email notifications
- **Express Validator** – Request validation
- **Bcrypt.js** – Password hashing
- **CORS & Cookie-Parser** – Security and session handling

---

## 📂 Project Structure

```

src/
│── index.js          # Entry point
│── routes/           # Express routers (User, Project, Task, Note)
│── controllers/      # Business logic
│── models/           # Mongoose schemas
│── middlewares/      # Auth, validation, file upload
│── utils/            # Constants, helpers

```

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/Amie-dev/employee_mangement.git
cd employee_mangement
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Set environment variables

Create a `.env` file in the root with the following:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=xxx
EMAIL_PASS=xxx
```

### 4️⃣ Run the server

```bash
npm run dev   # Development with nodemon
npm start     # Production
```

---

## 📌 API Highlights

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Projects

* `POST /api/projects`
* `GET /api/projects/:id`
* `PUT /api/projects/:id`
* `DELETE /api/projects/:id`

### Tasks

* `POST /api/tasks`
* `GET /api/projects/:id/tasks`
* `PUT /api/tasks/:id`
* `DELETE /api/tasks/:id`

### Notes

* `POST /api/projects/:id/notes`
* `PUT /api/notes/:id`
* `DELETE /api/notes/:id`

---

## 🛡️ Security

* Passwords hashed with **bcrypt.js**
* JWT tokens for authentication
* Role-Based Access Control (**RBAC**)
* Input validation with **express-validator**

---

## 📧 Contact

👨‍💻 Developed by [**Aminul Islam**](https://www.linkedin.com/in/aminul-dev/)
🔗 GitHub: [amie-dev](https://github.com/amie-dev)

---

## ⭐ Contribute

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a PR.

---

## 📜 License

This project is licensed under the **MIT License**.
