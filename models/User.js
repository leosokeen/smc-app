const db = require('../database/db');

class User {
  static findByUsername(username, callback) {
    db.get('SELECT * FROM users WHERE username = ?', [username], callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  }
}

module.exports = User;