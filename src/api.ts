import { Router } from "express";
import { Server } from "socket.io";
import db from "./db.js";
import { askTutor, getRecommendations } from "./ai.js";
import { sendParentNotification } from "./twilio.js";
import { sendEmailToAllStudents, sendOTPEmail, sendEmailToUser } from "./email.js";

const router = Router();
let io: Server;

export const setIo = (socketIo: Server) => {
  io = socketIo;
};

// Memory store for OTPs
const otps = new Map<string, { otp: string, expires: number }>();

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existingUser) return res.status(400).json({ error: "Email already registered" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  const sent = await sendOTPEmail(email, otp);
  if (sent) res.json({ success: true });
  else res.status(500).json({ error: "Failed to send OTP email" });
});

// Auth
router.post("/signup/student", (req, res) => {
  const { full_name, email, password, department, year_level, otp } = req.body;

  const storedOtpData = otps.get(email);
  if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const insert = db.prepare('INSERT INTO users (email, password, full_name, role, department, year_level) VALUES (?, ?, ?, ?, ?, ?)');
    const info = insert.run(email, password, full_name, 'student', department, year_level);
    otps.delete(email);
    res.json({ id: info.lastInsertRowid, email, full_name, role: 'student' });
  } catch (error: any) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

router.post("/signup/teacher", (req, res) => {
  const { full_name, email, password, department, subjects_teaching, years_of_experience, otp } = req.body;

  const storedOtpData = otps.get(email);
  if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const insert = db.prepare('INSERT INTO users (email, password, full_name, role, department, subjects_teaching, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = insert.run(email, password, full_name, 'teacher', department, subjects_teaching, years_of_experience);
    otps.delete(email);
    res.json({ id: info.lastInsertRowid, email, full_name, role: 'teacher' });
  } catch (error: any) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND password = ? AND role = ?")
    .get(email, password, role) as any;
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      parent_phone: user.parent_phone,
    });
  } else {
    res.status(401).json({ error: "Invalid credentials or role" });
  }
});
// Forgot Password Auth endpoints
router.post("/forgot-password/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!existingUser) return res.status(404).json({ error: "Email not registered" });

  // Add OTP logic
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  const sent = await sendOTPEmail(email, otp);
  if (sent) res.json({ success: true });
  else res.status(500).json({ error: "Failed to send OTP email" });
});

router.post("/forgot-password/reset", (req, res) => {
  const { email, otp, newPassword } = req.body;

  const storedOtpData = otps.get(email);
  if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const update = db.prepare("UPDATE users SET password = ? WHERE email = ?");
    update.run(newPassword, email);
    otps.delete(email); // clean up otp
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});
// User Profile / Settings
router.get("/users/:id", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (user) {
    if ((user as any).password) delete (user as any).password;
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, department, year_level, subjects_teaching, years_of_experience, parent_phone } = req.body;
  try {
    const update = db.prepare(`
      UPDATE users SET 
        full_name = COALESCE(?, full_name),
        department = COALESCE(?, department),
        year_level = COALESCE(?, year_level),
        subjects_teaching = COALESCE(?, subjects_teaching),
        years_of_experience = COALESCE(?, years_of_experience),
        parent_phone = COALESCE(?, parent_phone)
      WHERE id = ?
    `);

    update.run(
      full_name || null,
      department || null,
      year_level || null,
      subjects_teaching || null,
      years_of_experience || null,
      parent_phone || null,
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get all students for teacher dashboard
router.get("/teacher/students", (req, res) => {
  const students = db.prepare("SELECT id, full_name, email, department, year_level FROM users WHERE role = 'student'").all();
  res.json(students);
});

// Lessons
router.get("/lessons", (req, res) => {
  const lessons = db.prepare("SELECT * FROM lessons").all();
  res.json(lessons);
});

router.post("/lessons", async (req, res) => {
  const { title, content, video_url, topic, teacher_id, quiz } = req.body;

  try {
    const insert = db.prepare(
      "INSERT INTO lessons (title, content, video_url, topic, teacher_id) VALUES (?, ?, ?, ?, ?)",
    );
    const info = insert.run(title, content, video_url, topic, teacher_id);
    const lessonId = info.lastInsertRowid;

    if (quiz && quiz.question) {
      const insertQuiz = db.prepare(
        "INSERT INTO quizzes (lesson_id, question, options, correct_answer) VALUES (?, ?, ?, ?)"
      );
      insertQuiz.run(lessonId, quiz.question, JSON.stringify(quiz.options), quiz.correct_answer);
    }

    // Notify all students
    const user = db.prepare("SELECT full_name FROM users WHERE id = ?").get(teacher_id) as any;
    const authorName = user ? user.full_name : 'A teacher';

    // Create notifications for all students
    const students = db.prepare("SELECT id FROM users WHERE role = 'student'").all() as any[];
    const insertNotification = db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)");

    for (const student of students) {
      const message = `New lesson posted: "${title}" by ${authorName}`;
      insertNotification.run(student.id, 'new_lesson', message);
      if (io) io.to(`user_${student.id}`).emit('notification', { message });
    }

    // Send bulk email
    await sendEmailToAllStudents(
      `New CampusLink Lesson: ${title}`,
      `A new lesson has been posted!\n\nTitle: ${title}\nTopic: ${topic}\nTeacher: ${authorName}\n\nLog in to CampusLink to view the lesson and complete any assigned quizzes.`
    );

    res.json({ id: lessonId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

// Quizzes
router.get("/quizzes/:lessonId", (req, res) => {
  const quizzes = db
    .prepare("SELECT * FROM quizzes WHERE lesson_id = ?")
    .all(req.params.lessonId);
  res.json(quizzes);
});

router.post("/quiz-results", async (req, res) => {
  const { student_id, quiz_id, is_correct } = req.body;
  const insert = db.prepare(
    "INSERT INTO quiz_results (student_id, quiz_id, is_correct) VALUES (?, ?, ?)",
  );
  insert.run(student_id, quiz_id, is_correct ? 1 : 0);

  // Notify parent if quiz completed
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(student_id) as any;
  if (user && user.parent_phone) {
    const lesson = db
      .prepare(
        "SELECT l.title FROM quizzes q JOIN lessons l ON q.lesson_id = l.id WHERE q.id = ?",
      )
      .get(quiz_id) as any;
    const message = `CampusLink Update: Your child ${user.full_name} just completed a quiz for "${lesson?.title || "a lesson"}" and got it ${is_correct ? "right" : "wrong"}.`;
    // Fire and forget notification
    sendParentNotification(user.parent_phone, message).catch(console.error);
  }

  res.json({ success: true });
});

// Sync offline results
router.post("/sync", (req, res) => {
  const { results } = req.body;
  if (Array.isArray(results)) {
    const insert = db.prepare(
      "INSERT INTO quiz_results (student_id, quiz_id, is_correct, timestamp) VALUES (?, ?, ?, ?)",
    );
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.student_id,
          item.quiz_id,
          item.is_correct ? 1 : 0,
          item.timestamp || new Date().toISOString(),
        );
      }
    });
    insertMany(results);
  }

  // Log sync
  db.prepare("INSERT INTO sync_logs (status) VALUES (?)").run("Success");
  res.json({ success: true, synced: results?.length || 0 });
});

// AI Tutor
router.post("/ai/ask", async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await askTutor(question);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/ai/recommendations/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const results = db
      .prepare(
        `
      SELECT q.topic, qr.is_correct 
      FROM quiz_results qr 
      JOIN quizzes qz ON qr.quiz_id = qz.id 
      JOIN lessons q ON qz.lesson_id = q.id 
      WHERE qr.student_id = ?
    `,
      )
      .all(studentId);

    const recommendations = await getRecommendations(results);
    res.json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher Dashboard Stats
router.get("/teacher/dashboard-stats", (req, res) => {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any;
    const lessonsCompletedQuery = db.prepare("SELECT SUM(total_attempts) as sums FROM analytics").get() as any;
    res.json({
      totalStudents: totalStudents.count || 0,
      lessonsCompleted: lessonsCompletedQuery.sums || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Teacher Analytics
router.get("/analytics", (req, res) => {
  const stats = db
    .prepare(
      `
    SELECT 
      l.topic, 
      COUNT(qr.id) as total_attempts, 
      SUM(qr.is_correct) as correct_answers
    FROM quiz_results qr
    JOIN quizzes qz ON qr.quiz_id = qz.id
    JOIN lessons l ON qz.lesson_id = l.id
    GROUP BY l.topic
  `,
    )
    .all();
  res.json(stats);
});

// Student Analytics
router.get("/analytics/:studentId", (req, res) => {
  const stats = db
    .prepare(
      `
    SELECT 
      l.topic, 
      COUNT(qr.id) as total_attempts, 
      SUM(qr.is_correct) as correct_answers
    FROM quiz_results qr
    JOIN quizzes qz ON qr.quiz_id = qz.id
    JOIN lessons l ON qz.lesson_id = l.id
    WHERE qr.student_id = ?
    GROUP BY l.topic
  `,
    )
    .all(req.params.studentId);
  res.json(stats);
});

// Skills
router.get("/skills/:studentId", (req, res) => {
  const skills = db.prepare("SELECT * FROM skills WHERE student_id = ?").all(req.params.studentId);
  res.json(skills);
});

router.post("/skills", (req, res) => {
  const { student_id, skill_name, proficiency } = req.body;
  const insert = db.prepare("INSERT INTO skills (student_id, skill_name, proficiency) VALUES (?, ?, ?)");
  const info = insert.run(student_id, skill_name, proficiency);
  res.json({ id: info.lastInsertRowid });
});

// Projects
router.get("/projects/:studentId", (req, res) => {
  const projects = db.prepare("SELECT * FROM projects WHERE student_id = ?").all(req.params.studentId);
  res.json(projects);
});

router.post("/projects", (req, res) => {
  const { student_id, title, description, link } = req.body;
  const insert = db.prepare("INSERT INTO projects (student_id, title, description, link) VALUES (?, ?, ?, ?)");
  const info = insert.run(student_id, title, description, link);
  res.json({ id: info.lastInsertRowid });
});

// Peer Requests (BuddyUp)
router.get("/peer-requests", (req, res) => {
  const requests = db.prepare(`
    SELECT pr.*, u.full_name as student_name 
    FROM peer_requests pr 
    JOIN users u ON pr.student_id = u.id 
    ORDER BY pr.id DESC
  `).all();
  res.json(requests);
});

router.post("/peer-requests", (req, res) => {
  const { student_id, topic, description } = req.body;
  const insert = db.prepare("INSERT INTO peer_requests (student_id, topic, description) VALUES (?, ?, ?)");
  const info = insert.run(student_id, topic, description);
  res.json({ id: info.lastInsertRowid });
});

router.put("/peer-requests/:id/accept", (req, res) => {
  const { tutor_id } = req.body;
  db.prepare("UPDATE peer_requests SET status = 'accepted', tutor_id = ? WHERE id = ?").run(tutor_id, req.params.id);
  res.json({ success: true });
});

router.put("/peer-requests/:id/complete", (req, res) => {
  db.prepare("UPDATE peer_requests SET status = 'completed' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/peer-requests/:id/comments", (req, res) => {
  const comments = db.prepare(`
    SELECT prc.*, u.full_name as author_name
    FROM peer_request_comments prc
    JOIN users u ON prc.student_id = u.id
    WHERE prc.request_id = ?
    ORDER BY prc.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

router.post("/peer-requests/:id/comments", (req, res) => {
  const { student_id, comment } = req.body;
  const insert = db.prepare("INSERT INTO peer_request_comments (request_id, student_id, comment) VALUES (?, ?, ?)");
  const info = insert.run(req.params.id, student_id, comment);

  const request = db.prepare("SELECT student_id, topic FROM peer_requests WHERE id = ?").get(req.params.id) as any;
  if (request && request.student_id !== student_id) {
    const commenter = db.prepare("SELECT full_name FROM users WHERE id = ?").get(student_id) as any;
    db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)").run(
      request.student_id, 'peer_request_comment', `${commenter.full_name} commented on your BuddyUp request for "${request.topic}".`
    );
  }

  res.json({ id: info.lastInsertRowid });
});


// Hiring Posts
router.get("/hiring-posts", (req, res) => {
  const posts = db.prepare(`
    SELECT hp.*, u.full_name as student_name 
    FROM hiring_posts hp 
    JOIN users u ON hp.student_id = u.id 
    WHERE hp.status = 'approved'
    ORDER BY hp.created_at DESC
  `).all();
  res.json(posts);
});

router.get("/hiring-posts/all", (req, res) => {
  const posts = db.prepare(`
    SELECT hp.*, u.full_name as student_name 
    FROM hiring_posts hp 
    JOIN users u ON hp.student_id = u.id 
    ORDER BY hp.created_at DESC
  `).all();
  res.json(posts);
});

router.post("/hiring-posts", (req, res) => {
  const { student_id, title, description, required_skills, project_type, team_size, deadline } = req.body;
  const insert = db.prepare(`
    INSERT INTO hiring_posts (student_id, title, description, required_skills, project_type, team_size, deadline) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(student_id, title, description, required_skills, project_type, team_size, deadline);

  // Notify all teachers about the new pending post
  const teachers = db.prepare("SELECT id FROM users WHERE role = 'teacher'").all() as any[];
  const insertNotification = db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)");
  for (const teacher of teachers) {
    insertNotification.run(teacher.id, 'hiring_post_pending', `New hiring post "${title}" requires approval.`);
    if (io) {
      io.to(`user_${teacher.id}`).emit('notification', { message: `New hiring post "${title}" requires approval.` });
    }
  }

  res.json({ id: info.lastInsertRowid });
});

router.put("/hiring-posts/:id/approve", async (req, res) => {
  const postId = req.params.id;
  db.prepare("UPDATE hiring_posts SET status = 'approved' WHERE id = ?").run(postId);

  const post = db.prepare(`
    SELECT hp.*, u.full_name as student_name 
    FROM hiring_posts hp 
    JOIN users u ON hp.student_id = u.id 
    WHERE hp.id = ?
  `).get(postId) as any;

  if (post) {
    // Notify all students
    const students = db.prepare("SELECT id, email FROM users WHERE role = 'student'").all() as any[];
    const insertNotification = db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)");

    for (const student of students) {
      insertNotification.run(student.id, 'hiring_post_approved', `New project hiring post: "${post.title}" by ${post.student_name}`);
      if (io) {
        io.to(`user_${student.id}`).emit('notification', { message: `New project hiring post: "${post.title}" by ${post.student_name}` });
      }
    }

    // Send email to all students
    await sendEmailToAllStudents(
      `New Project Hiring: ${post.title}`,
      `A new project hiring post has been approved on CampusLink.\n\nTitle: ${post.title}\nBy: ${post.student_name}\nDescription: ${post.description}\nRequired Skills: ${post.required_skills}\n\nLog in to CampusLink to view more details and apply.`
    );
  }

  res.json({ success: true });
});

router.put("/hiring-posts/:id/reject", (req, res) => {
  const postId = req.params.id;
  db.prepare("UPDATE hiring_posts SET status = 'rejected' WHERE id = ?").run(postId);

  const post = db.prepare("SELECT student_id, title FROM hiring_posts WHERE id = ?").get(postId) as any;
  if (post) {
    db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)").run(
      post.student_id, 'hiring_post_rejected', `Your hiring post "${post.title}" was rejected.`
    );
    if (io) {
      io.to(`user_${post.student_id}`).emit('notification', { message: `Your hiring post "${post.title}" was rejected.` });
    }
  }

  res.json({ success: true });
});

// Notifications
router.get("/hiring-posts/my-posts/:studentId", (req, res) => {
  const posts = db.prepare(`
    SELECT hp.*, 
      (SELECT COUNT(*) FROM hiring_applications ha WHERE ha.post_id = hp.id) as applicant_count
    FROM hiring_posts hp 
    WHERE hp.student_id = ?
    ORDER BY hp.created_at DESC
  `).all(req.params.studentId);
  res.json(posts);
});

router.get("/hiring-posts/:postId/applicants", (req, res) => {
  const applicants = db.prepare(`
    SELECT ha.*, u.full_name, u.email, u.department, u.year_level
    FROM hiring_applications ha
    JOIN users u ON ha.applicant_id = u.id
    WHERE ha.post_id = ?
  `).all(req.params.postId);
  res.json(applicants);
});

router.post("/hiring-posts/:postId/apply", async (req, res) => {
  const { applicant_id } = req.body;
  const postId = req.params.postId;

  try {
    const insert = db.prepare("INSERT INTO hiring_applications (post_id, applicant_id) VALUES (?, ?)");
    insert.run(postId, applicant_id);

    const postInfo = db.prepare(`
      SELECT hp.title, u.id as owner_id, u.email as owner_email, u.full_name as owner_name 
      FROM hiring_posts hp JOIN users u ON hp.student_id = u.id WHERE hp.id = ?
    `).get(postId) as any;

    const applicantInfo = db.prepare("SELECT full_name FROM users WHERE id = ?").get(applicant_id) as any;

    if (postInfo && applicantInfo) {
      const message = `${applicantInfo.full_name} applied to your hiring post "${postInfo.title}"`;
      db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)").run(postInfo.owner_id, 'new_applicant', message);
      if (io) io.to(`user_${postInfo.owner_id}`).emit('notification', { message });

      await sendEmailToUser(
        postInfo.owner_email,
        "New Applicant for Your Project!",
        `Hello ${postInfo.owner_name},\n\nGreat news! ${applicantInfo.full_name} has applied to your hiring post: "${postInfo.title}".\n\nLog in to CampusLink to review their application.`
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Already applied or invalid request" });
  }
});

router.put("/hiring-posts/applications/:id/update", async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const applicationId = req.params.id;

  db.prepare("UPDATE hiring_applications SET status = ? WHERE id = ?").run(status, applicationId);

  const applicationInfo = db.prepare(`
    SELECT ha.status, u.id as applicant_id, u.email as applicant_email, u.full_name as applicant_name,
      hp.title as post_title, hp.student_id as post_owner_id, owner.full_name as owner_name
    FROM hiring_applications ha
    JOIN users u ON ha.applicant_id = u.id
    JOIN hiring_posts hp ON ha.post_id = hp.id
    JOIN users owner ON hp.student_id = owner.id
    WHERE ha.id = ?
  `).get(applicationId) as any;

  if (applicationInfo) {
    const message = `Your application for "${applicationInfo.post_title}" was ${status}.`;
    db.prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)").run(applicationInfo.applicant_id, `application_${status}`, message);
    if (io) io.to(`user_${applicationInfo.applicant_id}`).emit('notification', { message });

    await sendEmailToUser(
      applicationInfo.applicant_email,
      `Application ${status.charAt(0).toUpperCase() + status.slice(1)}: ${applicationInfo.post_title}`,
      `Hello ${applicationInfo.applicant_name},\n\nYour application for the project "${applicationInfo.post_title}" (posted by ${applicationInfo.owner_name}) has been ${status}.`
    );
  }

  res.json({ success: true });
});

// Notifications
router.get("/notifications/:userId", (req, res) => {
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.params.userId);
  res.json(notifications);
});

router.put("/notifications/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
