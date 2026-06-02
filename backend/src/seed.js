const db = require('./database');

const hasData = db.prepare('SELECT COUNT(*) as count FROM pricing_packages').get();

if (hasData.count === 0) {
  console.log('Fresh database — ready for use.');
} else {
  console.log('Database already contains data.');
}
