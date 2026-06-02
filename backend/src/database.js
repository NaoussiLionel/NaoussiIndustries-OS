const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'ni_os.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS pricing_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_price_min REAL NOT NULL,
    client_price_max REAL NOT NULL,
    freelancer_cost_min REAL NOT NULL,
    freelancer_cost_max REAL NOT NULL,
    target_margin_pct REAL NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    industry TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','Past','Archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'Cold Lead' CHECK(status IN ('Cold Lead','Contacted','Qualified','Proposal Sent','Closed Won','Closed Lost')),
    follow_up_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS freelancers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    rate_per_task REAL NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','On Leave','Inactive')),
    quality_score INTEGER DEFAULT 5 CHECK(quality_score BETWEEN 1 AND 10),
    on_time_pct INTEGER DEFAULT 100 CHECK(on_time_pct BETWEEN 0 AND 100),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_code TEXT NOT NULL UNIQUE,
    client_id INTEGER REFERENCES clients(id),
    package TEXT,
    description TEXT,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','Completed','On_Hold')),
    client_price REAL NOT NULL,
    freelancer_cost REAL NOT NULL,
    deadline TEXT,
    quality_score INTEGER CHECK(quality_score BETWEEN 1 AND 10),
    revision_rounds INTEGER DEFAULT 0,
    freelancer_id INTEGER REFERENCES freelancers(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_type TEXT NOT NULL CHECK(contract_type IN ('Client','Freelancer')),
    client_id INTEGER REFERENCES clients(id),
    freelancer_id INTEGER REFERENCES freelancers(id),
    project_id INTEGER REFERENCES projects(id),
    signed_date TEXT,
    terms TEXT,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','Completed','Terminated')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    client_id INTEGER REFERENCES clients(id),
    freelancer_id INTEGER REFERENCES freelancers(id),
    type TEXT NOT NULL CHECK(type IN ('Client Payment','Freelancer Payment','Deposit','Balance','Other')),
    amount REAL NOT NULL,
    description TEXT,
    transaction_date TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    stage_name TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Completed')),
    notes TEXT,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    project_id INTEGER REFERENCES projects(id),
    client_id INTEGER REFERENCES clients(id),
    type TEXT NOT NULL CHECK(type IN ('Deposit','Balance','Full')),
    amount REAL NOT NULL,
    deposit_paid REAL DEFAULT 0,
    status TEXT DEFAULT 'Draft' CHECK(status IN ('Draft','Sent','Paid','Overdue','Cancelled')),
    issued_date TEXT,
    due_date TEXT,
    paid_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
