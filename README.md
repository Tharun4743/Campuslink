# CampusLink – Internal Learning and Talent Ecosystem

![CampusLink Banner](https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200&h=400)

## 📖 Project Overview
**CampusLink** is a centralized, full-stack student development platform designed exclusively for college environments. It bridges the gap between academic learning and practical application by integrating video learning, peer tutoring, skill tracking, and project team formation into a single, cohesive ecosystem.

This platform empowers students to learn at their own pace, seek help from peers, showcase their portfolios, and recruit teammates for projects. Simultaneously, it provides teachers and administrators with powerful tools to monitor student progress, manage content, and moderate campus collaborations.

---

## 👥 User Roles & Permissions

The system is strictly role-based, ensuring secure and relevant experiences for different users.

### 1. Student
*   **Dashboard:** Access to all learning and collaboration modules.
*   **Capabilities:** Watch lessons, take quizzes, request peer tutoring, build a skill portfolio, and create project hiring posts.
*   **Profile Data:** Full Name, Email, Department, Year, Skills, Weak Subjects.

### 2. Teacher / Admin
*   **Dashboard:** Access to analytics, content management, and moderation tools.
*   **Capabilities:** Upload video lessons, create quizzes, view student analytics, monitor peer sessions, and approve/reject project hiring posts.
*   **Profile Data:** Full Name, Email, Department, Subjects Teaching, Experience.

---

## 🧩 Core Modules (The 6 Pillars)

### 1. VideoLearner 📚
A dedicated video-on-demand learning module.
*   Students can browse subjects, watch concept videos, and learn at their own pace.
*   Teachers can upload and categorize new educational content.

### 2. TestArena 🎯
An assessment and evaluation center.
*   Students attempt quizzes and coding tests related to their video lessons.
*   Automatic evaluation provides instant scores and feedback.

### 3. BuddyUp 🤝
A peer-to-peer tutoring system.
*   Students mark their "Strong" and "Weak" subjects.
*   Students struggling with a topic can request help.
*   Stronger students can accept requests and schedule peer-tutoring sessions.

### 4. SkillSync 💼
A talent hub and portfolio showcase.
*   Students build profiles highlighting their skills, proficiency levels, and completed projects.
*   Acts as an internal LinkedIn for the college, allowing students to search for others based on specific technical skills.

### 5. LearnTracker 📈
An analytics dashboard for tracking progress.
*   Visualizes student activities across all modules using interactive charts (Chart.js/Recharts).
*   Tracks quiz scores, learning progress, and participation in peer tutoring.

### 6. Project Hiring Board 🚀
A recruitment board for student projects and hackathons.
*   Students create "Hiring Posts" (e.g., "Looking for a React Developer for a Final Year Project").
*   Specifies required skills, team size, and deadlines.
*   **Moderation:** Posts must be approved by a Teacher before becoming visible to the student body.

---

## 🔄 System Workflow (Step-by-Step User Journey)

This is the exact flow of how a student interacts with the CampusLink ecosystem:

1.  **Learn:** The student watches a concept video in **VideoLearner**.
2.  **Practice:** The student tests their knowledge by taking a quiz in **TestArena**.
3.  **Track:** The system logs the score. The student views their progress and identifies weak areas in **LearnTracker**.
4.  **Improve:** The student requests help for their weak areas using **BuddyUp** and gets tutored by a peer.
5.  **Showcase:** After mastering the skill, the student adds it to their portfolio in **SkillSync**.
6.  **Collaborate:** The student decides to build a project but needs a team. They create a post on the **Project Hiring Board**.
7.  **Approve:** A Teacher receives a real-time notification, reviews the post, and clicks **Approve**.
8.  **Notify:** All students receive a real-time in-app notification and an Email alerting them of the new project opportunity.

---

## 🔔 Notification & Communication System

*   **Real-Time In-App Notifications (Socket.io):** A bell icon in the navigation bar updates instantly without refreshing the page. Used for post approvals, rejections, and peer requests.
*   **Email Notifications (Nodemailer):** Sends official emails to the student body when major events occur (e.g., a new Project Hiring post is approved).
*   **SMS Notifications (Twilio):** Configured to send text messages for critical alerts (e.g., quiz completions or parent notifications).

---

## 💻 Technology Stack

**Frontend:**
*   **React.js (v18)** - UI Library
*   **Tailwind CSS** - Utility-first styling and responsive design
*   **Lucide React** - Iconography
*   **Recharts** - Data visualization and analytics charts
*   **React Router** - Client-side routing and protected routes

**Backend:**
*   **Node.js & Express.js** - RESTful API architecture
*   **Socket.io** - WebSocket connections for real-time notifications
*   **Nodemailer** - SMTP Email service integration

**Database:**
*   **SQLite (`better-sqlite3`)** - Relational database for local, zero-config data persistence. (Easily migratable to PostgreSQL or MySQL).

---

## 🗄️ Database Schema Overview

The relational database consists of the following core tables:
*   `users`: Stores both Students and Teachers (distinguished by a `role` column).
*   `lessons`: Stores video lesson metadata.
*   `quizzes` & `quiz_results`: Stores questions and student attempt scores.
*   `peer_requests`: Tracks BuddyUp tutoring requests and their status (pending, accepted, completed).
*   `skills` & `projects`: Stores user portfolio data for SkillSync.
*   `hiring_posts`: Stores project recruitment posts, including the approval `status`.
*   `notifications`: Stores user-specific alerts and their `is_read` status.

---

## 🚀 Setup & Installation Instructions

Follow these steps to run the CampusLink platform locally:

### 1. Prerequisites
*   Node.js (v18 or higher)
*   npm (Node Package Manager)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. Add your SMTP credentials for Nodemailer and Twilio credentials (optional):
```env
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_test_email@ethereal.email
SMTP_PASS=your_test_password

# SMS Configuration (Twilio - Optional)
TWILIO_ACCOUNT_SID=AC_your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Start the Application
Run the full-stack application (this starts both the Express backend and the Vite frontend):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 5. Demo Accounts
The SQLite database automatically seeds itself on the first run. You can log in immediately using:
*   **Student:** `student@campuslink.com` / `password`
*   **Teacher:** `teacher@campuslink.com` / `password`

---

## 💡 Guide for your PPT Presentation

If you are building a PowerPoint presentation based on this README, here is a recommended slide structure:

*   **Slide 1: Title Slide** - CampusLink: Internal Learning & Talent Ecosystem.
*   **Slide 2: Problem Statement** - Disconnected learning, lack of peer collaboration, hard to find project teammates in college.
*   **Slide 3: The Solution (CampusLink)** - A unified platform for learning, tracking, and collaborating.
*   **Slide 4: User Roles** - Briefly explain Student vs. Teacher capabilities.
*   **Slide 5: The 6 Core Modules** - List VideoLearner, TestArena, BuddyUp, SkillSync, LearnTracker, Project Hiring Board.
*   **Slide 6: System Workflow** - Use the 8-step journey (Learn -> Practice -> Track -> Improve -> Showcase -> Collaborate -> Approve -> Notify). *This is your most important slide!*
*   **Slide 7: The Approval & Notification Engine** - Explain how Teachers moderate posts and how Socket.io/Nodemailer alert students.
*   **Slide 8: Tech Stack** - Show logos for React, Node.js, Express, SQLite, Socket.io.
*   **Slide 9: Conclusion / Q&A** - Summary of impact.
