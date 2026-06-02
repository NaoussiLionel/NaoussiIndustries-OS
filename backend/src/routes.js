const express = require('express');
const db = require('./database');

const router = express.Router();

function jsonResponse(res, data, status = 200) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(data);
}

function handleError(res, err, status = 500) {
  console.error(err);
  res.status(status).json({ error: err.message });
}

function wrapAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}

// ─── Dashboard Summary ───────────────────────────────────────────────
router.get('/dashboard/summary', wrapAsync(async (req, res) => {
  const activeProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('Active');
  const completedProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('Completed');
  const totalClients = db.prepare('SELECT COUNT(*) as count FROM clients WHERE status = ?').get('Active');
  const openLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status NOT IN (?,?)').get('Closed Won', 'Closed Lost');
  const activeFreelancers = db.prepare('SELECT COUNT(*) as count FROM freelancers WHERE status = ?').get('Active');

  const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type IN ('Client Payment','Deposit','Balance')").get();
  const costs = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type = 'Freelancer Payment'").get();

  const avgMargin = db.prepare('SELECT AVG((client_price - freelancer_cost) * 1.0 / client_price * 100) as avg_margin FROM projects').get();

  const projects = db.prepare(`
    SELECT p.*, c.company_name, f.name as freelancer_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN freelancers f ON p.freelancer_id = f.id
    ORDER BY p.created_at DESC LIMIT 5
  `).all();

  jsonResponse(res, {
    activeProjects: activeProjects.count,
    completedProjects: completedProjects.count,
    totalClients: totalClients.count,
    openLeads: openLeads.count,
    activeFreelancers: activeFreelancers.count,
    totalRevenue: revenue.total,
    totalCosts: costs.total,
    avgMargin: Math.round(avgMargin.avg_margin || 0),
    recentProjects: projects
  });
}));

// ─── Clients ──────────────────────────────────────────────────────────
router.get('/clients', wrapAsync(async (req, res) => {
  const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  jsonResponse(res, clients);
}));

router.get('/clients/:id', wrapAsync(async (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return jsonResponse(res, { error: 'Not found' }, 404);
  jsonResponse(res, client);
}));

router.post('/clients', wrapAsync(async (req, res) => {
  const { company_name, contact_name, email, phone, website, industry, notes, status } = req.body;
  const result = db.prepare(
    'INSERT INTO clients (company_name, contact_name, email, phone, website, industry, notes, status) VALUES (?,?,?,?,?,?,?,?)'
  ).run(company_name, contact_name, email, phone, website, industry, notes, status || 'Active');
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/clients/:id', wrapAsync(async (req, res) => {
  const { company_name, contact_name, email, phone, website, industry, notes, status } = req.body;
  db.prepare(
    "UPDATE clients SET company_name=?, contact_name=?, email=?, phone=?, website=?, industry=?, notes=?, status=?, updated_at=datetime('now') WHERE id=?"
  ).run(company_name, contact_name, email, phone, website, industry, notes, status, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/clients/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Leads ────────────────────────────────────────────────────────────
router.get('/leads', wrapAsync(async (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  jsonResponse(res, leads);
}));

router.get('/leads/:id', wrapAsync(async (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return jsonResponse(res, { error: 'Not found' }, 404);
  jsonResponse(res, lead);
}));

router.post('/leads', wrapAsync(async (req, res) => {
  const { company_name, contact_name, email, phone, source, budget_range, status, follow_up_date, notes } = req.body;
  const result = db.prepare(
    'INSERT INTO leads (company_name, contact_name, email, phone, source, budget_range, status, follow_up_date, notes) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(company_name, contact_name, email, phone, source, budget_range, status || 'Cold Lead', follow_up_date, notes);
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/leads/:id', wrapAsync(async (req, res) => {
  const { company_name, contact_name, email, phone, source, budget_range, status, follow_up_date, notes } = req.body;
  db.prepare(
    "UPDATE leads SET company_name=?, contact_name=?, email=?, phone=?, source=?, budget_range=?, status=?, follow_up_date=?, notes=?, updated_at=datetime('now') WHERE id=?"
  ).run(company_name, contact_name, email, phone, source, budget_range, status, follow_up_date, notes, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/leads/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Freelancers ──────────────────────────────────────────────────────
router.get('/freelancers', wrapAsync(async (req, res) => {
  const freelancers = db.prepare('SELECT * FROM freelancers ORDER BY created_at DESC').all();
  jsonResponse(res, freelancers);
}));

router.get('/freelancers/:id', wrapAsync(async (req, res) => {
  const f = db.prepare('SELECT * FROM freelancers WHERE id = ?').get(req.params.id);
  if (!f) return jsonResponse(res, { error: 'Not found' }, 404);
  jsonResponse(res, f);
}));

router.post('/freelancers', wrapAsync(async (req, res) => {
  const { name, email, phone, role, rate_per_task, status, quality_score, on_time_pct, notes } = req.body;
  const result = db.prepare(
    'INSERT INTO freelancers (name, email, phone, role, rate_per_task, status, quality_score, on_time_pct, notes) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(name, email, phone, role, rate_per_task, status || 'Active', quality_score || 5, on_time_pct || 100, notes);
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/freelancers/:id', wrapAsync(async (req, res) => {
  const { name, email, phone, role, rate_per_task, status, quality_score, on_time_pct, notes } = req.body;
  db.prepare(
    "UPDATE freelancers SET name=?, email=?, phone=?, role=?, rate_per_task=?, status=?, quality_score=?, on_time_pct=?, notes=?, updated_at=datetime('now') WHERE id=?"
  ).run(name, email, phone, role, rate_per_task, status, quality_score, on_time_pct, notes, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/freelancers/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM freelancers WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Projects ─────────────────────────────────────────────────────────
router.get('/projects', wrapAsync(async (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, c.company_name, f.name as freelancer_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN freelancers f ON p.freelancer_id = f.id
    ORDER BY p.created_at DESC
  `).all();
  jsonResponse(res, projects);
}));

router.get('/projects/:id', wrapAsync(async (req, res) => {
  const project = db.prepare(`
    SELECT p.*, c.company_name, f.name as freelancer_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN freelancers f ON p.freelancer_id = f.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!project) return jsonResponse(res, { error: 'Not found' }, 404);

  const stages = db.prepare('SELECT * FROM project_stages WHERE project_id = ? ORDER BY id').all(project.id);
  project.stages = stages;

  jsonResponse(res, project);
}));

router.post('/projects', wrapAsync(async (req, res) => {
  const { project_code, client_id, package, description, status, client_price, freelancer_cost, deadline, freelancer_id } = req.body;
  const result = db.prepare(
    `INSERT INTO projects (project_code, client_id, package, description, status, client_price, freelancer_cost, deadline, freelancer_id)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(project_code, client_id, package, description, status || 'Active', client_price, freelancer_cost, deadline, freelancer_id);

  const stages = ['01_Quote', '02_Brief', '03_Design_Work', '04_Assets', '05_Invoices', '06_Revisions', '07_Final_Delivery'];
  const insertStage = db.prepare('INSERT INTO project_stages (project_id, stage_name, status) VALUES (?, ?, ?)');
  stages.forEach(s => insertStage.run(result.lastInsertRowid, s, 'Pending'));

  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/projects/:id', wrapAsync(async (req, res) => {
  const { project_code, client_id, package, description, status, client_price, freelancer_cost, deadline, quality_score, revision_rounds, freelancer_id } = req.body;
  db.prepare(
    `UPDATE projects SET project_code=?, client_id=?, package=?, description=?, status=?, client_price=?, freelancer_cost=?,
     deadline=?, quality_score=?, revision_rounds=?, freelancer_id=?, updated_at=datetime('now') WHERE id=?`
  ).run(project_code, client_id, package, description, status, client_price, freelancer_cost, deadline, quality_score, revision_rounds, freelancer_id, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/projects/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM project_stages WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Project Stages ──────────────────────────────────────────────────
router.put('/projects/:id/stages/:stageId', wrapAsync(async (req, res) => {
  const { status, notes } = req.body;
  const completed_at = status === 'Completed' ? new Date().toISOString() : null;
  db.prepare(
    "UPDATE project_stages SET status=?, notes=?, completed_at=COALESCE(?, completed_at) WHERE id=? AND project_id=?"
  ).run(status, notes, completed_at, req.params.stageId, req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Contracts ────────────────────────────────────────────────────────
router.get('/contracts', wrapAsync(async (req, res) => {
  const contracts = db.prepare(`
    SELECT ct.*, c.company_name as client_name, f.name as freelancer_name, p.project_code
    FROM contracts ct
    LEFT JOIN clients c ON ct.client_id = c.id
    LEFT JOIN freelancers f ON ct.freelancer_id = f.id
    LEFT JOIN projects p ON ct.project_id = p.id
    ORDER BY ct.created_at DESC
  `).all();
  jsonResponse(res, contracts);
}));

router.get('/contracts/:id', wrapAsync(async (req, res) => {
  const contract = db.prepare(`
    SELECT ct.*, c.company_name as client_name, f.name as freelancer_name, p.project_code
    FROM contracts ct
    LEFT JOIN clients c ON ct.client_id = c.id
    LEFT JOIN freelancers f ON ct.freelancer_id = f.id
    LEFT JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = ?
  `).get(req.params.id);
  if (!contract) return jsonResponse(res, { error: 'Not found' }, 404);
  jsonResponse(res, contract);
}));

router.post('/contracts', wrapAsync(async (req, res) => {
  const { contract_type, client_id, freelancer_id, project_id, signed_date, terms, status } = req.body;
  const result = db.prepare(
    'INSERT INTO contracts (contract_type, client_id, freelancer_id, project_id, signed_date, terms, status) VALUES (?,?,?,?,?,?,?)'
  ).run(contract_type, client_id || null, freelancer_id || null, project_id || null, signed_date, terms, status || 'Active');
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/contracts/:id', wrapAsync(async (req, res) => {
  const { contract_type, client_id, freelancer_id, project_id, signed_date, terms, status } = req.body;
  db.prepare(
    "UPDATE contracts SET contract_type=?, client_id=?, freelancer_id=?, project_id=?, signed_date=?, terms=?, status=?, updated_at=datetime('now') WHERE id=?"
  ).run(contract_type, client_id || null, freelancer_id || null, project_id || null, signed_date, terms, status, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/contracts/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Transactions / Financial ─────────────────────────────────────────
router.get('/transactions', wrapAsync(async (req, res) => {
  const txns = db.prepare(`
    SELECT t.*, c.company_name as client_name, f.name as freelancer_name, p.project_code
    FROM transactions t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN freelancers f ON t.freelancer_id = f.id
    LEFT JOIN projects p ON t.project_id = p.id
    ORDER BY t.transaction_date DESC
  `).all();
  jsonResponse(res, txns);
}));

router.post('/transactions', wrapAsync(async (req, res) => {
  const { project_id, client_id, freelancer_id, type, amount, description, transaction_date } = req.body;
  const result = db.prepare(
    'INSERT INTO transactions (project_id, client_id, freelancer_id, type, amount, description, transaction_date) VALUES (?,?,?,?,?,?,?)'
  ).run(project_id || null, client_id || null, freelancer_id || null, type, amount, description, transaction_date || new Date().toISOString());
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.get('/financial/summary', wrapAsync(async (req, res) => {
  const byType = db.prepare("SELECT type, COALESCE(SUM(amount),0) as total FROM transactions GROUP BY type").all();
  const totals = { revenue: 0, costs: 0, deposits: 0, balances: 0 };
  byType.forEach(t => {
    if (t.type === 'Client Payment') totals.revenue += t.total;
    if (t.type === 'Deposit') totals.deposits += t.total;
    if (t.type === 'Balance') totals.balances += t.total;
    if (t.type === 'Freelancer Payment') totals.costs += t.total;
  });
  totals.netProfit = totals.revenue + totals.deposits + totals.balances - totals.costs;
  const totalRevenue = totals.revenue + totals.deposits + totals.balances;
  totals.marginPct = totalRevenue > 0 ? Math.round((totalRevenue - totals.costs) / totalRevenue * 100) : 0;

  const projects = db.prepare("SELECT project_code, client_price, freelancer_cost, (client_price - freelancer_cost) * 1.0 / client_price * 100 as margin_pct FROM projects WHERE status = 'Active' OR status = 'Completed'").all();

  jsonResponse(res, { totals, projects });
}));

// ─── Pricing Packages ────────────────────────────────────────────────
router.get('/pricing-packages', wrapAsync(async (req, res) => {
  const packages = db.prepare('SELECT * FROM pricing_packages ORDER BY client_price_min ASC').all();
  jsonResponse(res, packages);
}));

router.put('/pricing-packages/:id', wrapAsync(async (req, res) => {
  const { name, client_price_min, client_price_max, freelancer_cost_min, freelancer_cost_max, target_margin_pct, description } = req.body;
  db.prepare(
    "UPDATE pricing_packages SET name=?, client_price_min=?, client_price_max=?, freelancer_cost_min=?, freelancer_cost_max=?, target_margin_pct=?, description=?, updated_at=datetime('now') WHERE id=?"
  ).run(name, client_price_min, client_price_max, freelancer_cost_min, freelancer_cost_max, target_margin_pct, description, req.params.id);
  jsonResponse(res, { success: true });
}));

// ─── Invoices ─────────────────────────────────────────────────────────
router.get('/invoices', wrapAsync(async (req, res) => {
  const invoices = db.prepare(`
    SELECT inv.*, p.project_code, c.company_name, c.contact_name, c.email as client_email
    FROM invoices inv
    LEFT JOIN projects p ON inv.project_id = p.id
    LEFT JOIN clients c ON inv.client_id = c.id
    ORDER BY inv.created_at DESC
  `).all();
  jsonResponse(res, invoices);
}));

router.get('/invoices/:id', wrapAsync(async (req, res) => {
  const inv = db.prepare(`
    SELECT inv.*, p.project_code, p.package, p.client_price, p.description as project_desc,
           c.company_name, c.contact_name, c.email as client_email, c.phone as client_phone, c.address
    FROM invoices inv
    LEFT JOIN projects p ON inv.project_id = p.id
    LEFT JOIN clients c ON inv.client_id = c.id
    WHERE inv.id = ?
  `).get(req.params.id);
  if (!inv) return jsonResponse(res, { error: 'Not found' }, 404);
  jsonResponse(res, inv);
}));

router.post('/invoices', wrapAsync(async (req, res) => {
  const { invoice_number, project_id, client_id, type, amount, deposit_paid, status, issued_date, due_date, notes } = req.body;
  const result = db.prepare(
    `INSERT INTO invoices (invoice_number, project_id, client_id, type, amount, deposit_paid, status, issued_date, due_date, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(invoice_number, project_id || null, client_id || null, type, amount, deposit_paid || 0, status || 'Draft', issued_date || new Date().toISOString().split('T')[0], due_date, notes);
  jsonResponse(res, { id: result.lastInsertRowid }, 201);
}));

router.put('/invoices/:id', wrapAsync(async (req, res) => {
  const { invoice_number, project_id, client_id, type, amount, deposit_paid, status, issued_date, due_date, paid_date, notes } = req.body;
  db.prepare(
    `UPDATE invoices SET invoice_number=?, project_id=?, client_id=?, type=?, amount=?, deposit_paid=?, status=?, issued_date=?, due_date=?, paid_date=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(invoice_number, project_id || null, client_id || null, type, amount, deposit_paid || 0, status, issued_date, due_date, paid_date, notes, req.params.id);
  jsonResponse(res, { success: true });
}));

router.delete('/invoices/:id', wrapAsync(async (req, res) => {
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  jsonResponse(res, { success: true });
}));

router.get('/invoices/:id/pdf', wrapAsync(async (req, res) => {
  const inv = db.prepare(`
    SELECT inv.*, p.project_code, p.package, p.client_price, p.description as project_desc,
           c.company_name, c.contact_name, c.email as client_email, c.phone as client_phone
    FROM invoices inv
    LEFT JOIN projects p ON inv.project_id = p.id
    LEFT JOIN clients c ON inv.client_id = c.id
    WHERE inv.id = ?
  `).get(req.params.id);

  if (!inv) return jsonResponse(res, { error: 'Not found' }, 404);

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="INV-${inv.invoice_number}.pdf"`);
  doc.pipe(res);

  const primary = '#6c5ce7';
  const gray = '#888';
  const dark = '#222';

  // Header
  doc.fontSize(28).font('Helvetica-Bold').fillColor(primary).text('NAOUSSI INDUSTRIES', 50, 50);
  doc.fontSize(9).font('Helvetica').fillColor(gray).text('Design & Brand Strategy', 50, 80);
  doc.text('invoice@naoussi.com | naoussi.com', 50, 94);

  // Invoice title
  doc.fontSize(22).font('Helvetica-Bold').fillColor(dark).text('INVOICE', 350, 50, { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor(gray).text(`# ${inv.invoice_number}`, { align: 'right' });

  // Divider
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#eee').lineWidth(1).stroke();

  // Bill To
  doc.fontSize(10).font('Helvetica-Bold').fillColor(dark).text('BILL TO', 50, 135);
  doc.fontSize(10).font('Helvetica').fillColor(dark).text(inv.company_name || 'Client', 50, 152);
  doc.fontSize(9).fillColor(gray).text(inv.contact_name || '', 50, 168);
  doc.text(inv.client_email || '', 50, 182);

  // Invoice details
  const detailsTop = 135;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(dark).text('INVOICE DETAILS', 350, detailsTop);
  doc.fontSize(9).font('Helvetica').fillColor(gray).text('Issue Date:', 350, detailsTop + 18);
  doc.fillColor(dark).text(inv.issued_date || new Date().toISOString().split('T')[0], 430, detailsTop + 18, { width: 115, align: 'right' });
  doc.fillColor(gray).text('Due Date:', 350, detailsTop + 34);
  doc.fillColor(dark).text(inv.due_date || '—', 430, detailsTop + 34, { width: 115, align: 'right' });
  doc.fillColor(gray).text('Status:', 350, detailsTop + 50);
  doc.fillColor(inv.status === 'Paid' ? '#00c9a7' : inv.status === 'Overdue' ? '#ff6b6b' : '#ffb347').text(inv.status, 430, detailsTop + 50, { width: 115, align: 'right' });
  doc.fillColor(gray).text('Invoice Type:', 350, detailsTop + 66);
  doc.fillColor(dark).text(inv.type, 430, detailsTop + 66, { width: 115, align: 'right' });

  // Divider
  doc.moveTo(50, 240).lineTo(545, 240).strokeColor('#eee').lineWidth(1).stroke();

  // Table header
  const tableY = 255;
  doc.rect(50, tableY, 495, 22).fillColor('#f8f9fa').fill();
  doc.fillColor(dark).fontSize(9).font('Helvetica-Bold');
  doc.text('DESCRIPTION', 55, tableY + 6);
  doc.text('PROJECT', 200, tableY + 6);
  doc.text('TYPE', 320, tableY + 6);
  doc.text('AMOUNT', 460, tableY + 6, { width: 85, align: 'right' });

  // Table row
  const rowY = tableY + 28;
  doc.fillColor(dark).fontSize(9).font('Helvetica');
  const description = inv.project_desc ? inv.project_desc : (inv.package ? `${inv.package} — Design & Branding` : `${inv.type} Payment — Design Services`);
  doc.text(description, 55, rowY);
  doc.text(inv.project_code || '—', 200, rowY);
  doc.text(inv.type === 'Deposit' ? '50% Deposit' : inv.type === 'Balance' ? '50% Balance' : 'Full Payment', 320, rowY);
  doc.text(`$${Number(inv.amount).toLocaleString()}`, 460, rowY, { width: 85, align: 'right' });

  if (inv.deposit_paid > 0) {
    const depY = rowY + 20;
    doc.text('Deposit Received', 320, depY);
    doc.text(`-$${Number(inv.deposit_paid).toLocaleString()}`, 460, depY, { width: 85, align: 'right' });
  }

  // Divider
  const totalY = rowY + 50;
  doc.moveTo(350, totalY).lineTo(545, totalY).strokeColor('#eee').lineWidth(1).stroke();

  // Total
  const balanceDue = inv.deposit_paid > 0 ? Number(inv.amount) - Number(inv.deposit_paid) : Number(inv.amount);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(dark);
  doc.text('Total Due:', 350, totalY + 8);
  doc.text(`$${balanceDue.toLocaleString()}`, 460, totalY + 8, { width: 85, align: 'right' });

  // Footer
  doc.moveTo(50, 650).lineTo(545, 650).strokeColor('#eee').lineWidth(1).stroke();
  doc.fontSize(8).font('Helvetica').fillColor(gray).text(
    'Naoussi Industries · Payment Terms: 50% deposit before work, 50% balance before delivery · Thank you for your business!',
    50, 660, { align: 'center' }
  );

  doc.end();
}));

// ─── Reports ──────────────────────────────────────────────────────────
router.get('/reports/kpi', wrapAsync(async (req, res) => {
  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  const leadsThisMonth = db.prepare("SELECT COUNT(*) as count FROM leads WHERE created_at >= date('now','start of month')").get();
  const wonLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Closed Won'").get();
  const totalLeadsCount = totalLeads.count || 1;
  const pipelineValue = db.prepare("SELECT COALESCE(SUM(CAST(REPLACE(REPLACE(budget_range,'$',''),',','') AS INTEGER)),0) as total FROM leads WHERE status NOT IN ('Closed Won','Closed Lost') AND budget_range != ''").get();

  const avgDeliveryDays = db.prepare(`
    SELECT AVG(julianday(COALESCE(completed_at, datetime('now'))) - julianday(created_at)) as avg_days
    FROM project_stages WHERE stage_name = '07_Final_Delivery' AND status = 'Completed'
  `).get();

  const avgRevisions = db.prepare('SELECT AVG(revision_rounds) as avg_rev FROM projects').get();
  const onTimeRate = db.prepare("SELECT AVG(on_time_pct) as rate FROM freelancers").get();

  jsonResponse(res, {
    conversionRate: Math.round((wonLeads.count / totalLeadsCount) * 100),
    leadsThisMonth: leadsThisMonth.count,
    pipelineValue: pipelineValue.total,
    avgDeliveryDays: Math.round(avgDeliveryDays.avg_days || 0),
    avgRevisions: Math.round(avgRevisions.avg_rev || 0),
    onTimeRate: Math.round(onTimeRate.rate || 0),
    activeProjects: db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'Active'").get().count,
    marginZones: {
      green: db.prepare("SELECT COUNT(*) as count FROM projects WHERE (client_price - freelancer_cost) * 1.0 / client_price >= 0.6").get().count,
      orange: db.prepare("SELECT COUNT(*) as count FROM projects WHERE (client_price - freelancer_cost) * 1.0 / client_price BETWEEN 0.4 AND 0.59").get().count,
      red: db.prepare("SELECT COUNT(*) as count FROM projects WHERE (client_price - freelancer_cost) * 1.0 / client_price < 0.4").get().count
    }
  });
}));

module.exports = router;
