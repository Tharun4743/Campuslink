import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "campuslink.db");
const db = new Database(dbPath);

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      full_name TEXT,
      role TEXT, -- 'student' or 'teacher'
      parent_phone TEXT,
      department TEXT,
      year_level TEXT,
      subjects_teaching TEXT,
      years_of_experience INTEGER
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      video_url TEXT,
      topic TEXT,
      teacher_id INTEGER,
      FOREIGN KEY(teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER,
      question TEXT,
      options TEXT, -- JSON string
      correct_answer TEXT,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      quiz_id INTEGER,
      is_correct BOOLEAN,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      skill_name TEXT,
      proficiency TEXT,
      FOREIGN KEY(student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      title TEXT,
      description TEXT,
      link TEXT,
      FOREIGN KEY(student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS peer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      topic TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'completed'
      tutor_id INTEGER,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(tutor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS peer_request_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      student_id INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES peer_requests(id),
      FOREIGN KEY(student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hiring_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      title TEXT,
      description TEXT,
      required_skills TEXT,
      project_type TEXT,
      team_size INTEGER,
      deadline TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hiring_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      applicant_id INTEGER,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES hiring_posts(id),
      FOREIGN KEY(applicant_id) REFERENCES users(id),
      UNIQUE(post_id, applicant_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      message TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Insert some seed data if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    const insertUser = db.prepare(
      "INSERT INTO users (email, password, full_name, role, parent_phone, department, year_level, subjects_teaching, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    insertUser.run("student@campuslink.com", "password", "Demo Student", "student", "+1234567890", "Computer Science", "3rd Year", null, null);
    const teacherInfo = insertUser.run("teacher@campuslink.com", "password", "Demo Teacher", "teacher", null, "Computer Science", null, "Web Development", 5);

    const insertLesson = db.prepare(
      "INSERT INTO lessons (title, content, video_url, topic, teacher_id) VALUES (?, ?, ?, ?, ?)",
    );
    const lessonInfo = insertLesson.run(
      "Photosynthesis",
      "Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.",
      "https://www.youtube.com/watch?v=sQK3Yr4Sc_k",
      "Biology",
      teacherInfo.lastInsertRowid
    );

    const insertQuiz = db.prepare(
      "INSERT INTO quizzes (lesson_id, question, options, correct_answer) VALUES (?, ?, ?, ?)",
    );
    insertQuiz.run(
      lessonInfo.lastInsertRowid,
      "What do plants use to make food?",
      JSON.stringify(["Sunlight", "Moonlight", "Fire", "Electricity"]),
      "Sunlight",
    );
    insertQuiz.run(
      lessonInfo.lastInsertRowid,
      "Which gas do plants absorb during photosynthesis?",
      JSON.stringify(["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"]),
      "Carbon Dioxide",
    );
  }
}

export default db;
