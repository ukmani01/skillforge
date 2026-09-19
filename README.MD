# SkillForge

> **Learn. Practice. Assess. Improve.**

A modern full-stack learning platform for mastering web development
through interactive quizzes, real-time progress tracking, and a
supportive learning community.

![Status](https://img.shields.io/badge/status-active-success)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Author](#author)
- [License](#license)

---

## About

SkillForge is a student assessment platform built for educators and
learners. Students can register, take level-based quizzes across
HTML fundamentals and full stack web development, track their
progress over time, compete on a leaderboard, chat with teachers in
real time, and share questions with the community.

The platform is built with vanilla HTML/CSS/JavaScript on the
frontend and Node.js + Express + MongoDB on the backend — no
frameworks, no build steps, just clean, understandable code.

---

## ✨ Features

### For Students
- 🎓 **Secure registration & login** with persistent sessions
- 📚 **80 curated quiz questions** across 2 tracks:
  - **2nd Year** — HTML Fundamentals (40 questions, 2 levels)
  - **3rd Year** — Full Stack Web Development (40 questions, 2 levels)
- 🎯 **Level-based progression** with server-side scoring
- 📊 **Personal dashboard** with quiz history and performance
- 🏆 **Leaderboard** showing best attempt per student
- 💬 **Live teacher chat** via Socket.IO
- 📝 **Post questions** to the community
- ⭐ **Submit feedback** to help shape the platform
- 📱 **Fully responsive** — works on mobile, tablet, desktop

### For Teachers / Admins
- 🔐 **Admin dashboard** with real-time statistics
- 👥 **View all students** and their attempts
- 📈 **Aggregated performance metrics** by year and difficulty
- 🗂️ **Moderate posts** and view all feedback
- 🔄 **Auto-refreshing leaderboard**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES5+ compatible) |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB (Atlas) via Mongoose 7 |
| **Auth** | Cookie-based sessions (express-session) |
| **Password hashing** | bcryptjs |
| **Real-time** | Socket.IO 4 |
| **Config** | dotenv |
| **Deployment** | Render |

**No frontend frameworks. No build tools. No bundlers.**
Just clean, readable code.

---

## 📁 Project Structure
skillforge/
├── backend/
│ ├── config/ # Environment configuration
│ ├── data/ # Quiz question JSON files
│ │ ├── second-year.json
│ │ └── third-year.json
│ ├── db/ # MongoDB connection
│ ├── middleware/ # CORS, session, auth, error handling
│ ├── models/ # Mongoose models
│ │ ├── attempt.js
│ │ ├── student.js
│ │ ├── feedback.js
│ │ ├── post.js
│ │ └── question.js
│ ├── routes/ # Express routes
│ │ ├── health.js
│ │ ├── attempts.js
│ │ ├── leaderboard.js
│ │ ├── dashboard.js
│ │ ├── admin.js
│ │ ├── adminData.js
│ │ ├── students.js
│ │ ├── feedback.js
│ │ ├── posts.js
│ │ └── quiz.js
│ ├── socket/ # Socket.IO server
│ ├── utils/ # Helper utilities
│ ├── index.js # Server entry point
│ ├── package.json
│ └── .env.example
│
├── frontend/
│ ├── css/
│ │ ├── base.css # Design tokens
│ │ ├── home.css # Hero + marketing sections
│ │ └── portal.css # Student portal styles
│ ├── js/
│ │ ├── api.js # Fetch wrapper
│ │ ├── utils.js # Helpers
│ │ ├── auth.js # Student auth state
│ │ ├── questionLoader.js
│ │ ├── quiz.js # Quiz flow
│ │ ├── dashboard.js # Trainer dashboard
│ │ ├── portal.js # Student portal
│ │ └── chat-teacher.js
│ ├── index.html
│ └── README.md
│
├── .gitignore
├── README.md
└── render.yaml (optional)

text

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **MongoDB Atlas** account (free tier works)
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/ukmani01/skillforge.git
cd skillforge
2. Configure the backend
bash
cd backend
npm install
cp .env.example .env
Edit backend/.env with your values (see Environment Variables).

3. Run the backend (serves the frontend too)
bash
npm start
Or with auto-reload during development:

bash
npm run dev
The server starts at http://localhost:5000.

Open http://localhost:5000 in your browser — the frontend is
served by the backend. Everything works from a single origin.