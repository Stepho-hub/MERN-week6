export function getUserById(db, id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

export function getAllUsers(db) {
  const stmt = db.prepare('SELECT * FROM users');
  return stmt.all();
}

export function createUser(db, name, email) {
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  return stmt.run(name, email);
}