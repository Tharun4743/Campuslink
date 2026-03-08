import Database from "better-sqlite3";
const db = new Database("campuslink.db");
db.exec(`
   CREATE TABLE IF NOT EXISTS peer_request_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      student_id INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES peer_requests(id),
      FOREIGN KEY(student_id) REFERENCES users(id)
    );
`);
console.log("Done");
