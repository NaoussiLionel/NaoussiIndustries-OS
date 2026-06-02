import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup, StatusBadge } from '../components/Modal'

const empty = { invoice_number: '', project_id: '', client_id: '', type: 'Deposit', amount: 0, deposit_paid: 0, status: 'Draft', issued_date: new Date().toISOString().split('T')[0], due_date: '', notes: '' }

const emptyState = (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📄</div>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>No invoices yet</div>
    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
      Invoices follow the 50/50 payment rule.<br />
      Create a deposit invoice to kick off a project, then a balance invoice before delivery.
    </div>
  </div>
)

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [detail, setDetail] = useState(null)

  function load() {
    api.invoices.list().then(setInvoices)
    api.clients.list().then(setClients)
    api.projects.list().then(setProjects)
  }
  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(empty)
    setModal('create')
  }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    const data = {
      ...form,
      project_id: Number(form.project_id) || null,
      client_id: Number(form.client_id) || null,
      amount: Number(form.amount),
      deposit_paid: Number(form.deposit_paid) || 0,
    }
    if (modal === 'create') await api.invoices.create(data)
    else await api.invoices.update(form.id, data)
    setModal(null); load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return
    await api.invoices.delete(id); load()
  }

  async function viewDetail(id) {
    const inv = await api.invoices.get(id)
    setDetail(inv)
  }

  function printInvoice(inv) {
    const w = window.open('', '_blank')
    const balance = Number(inv.amount) - Number(inv.deposit_paid || 0)
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Invoice ${inv.invoice_number}</title>
      <style>
        @page { margin: 20mm; }
        body { font-family: 'Helvetica', Arial, sans-serif; color: #222; font-size: 12px; line-height: 1.5; padding: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .brand h1 { font-size: 28px; color: #6c5ce7; margin: 0; }
        .brand p { font-size: 10px; color: #888; margin: 2px 0; }
        .title { text-align: right; }
        .title h2 { font-size: 22px; margin: 0; }
        .title p { font-size: 11px; color: #666; margin: 2px 0; }
        hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
        .section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section div { width: 48%; }
        .section h3 { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .section p { margin: 2px 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
        .total { text-align: right; margin-top: 20px; font-size: 16px; font-weight: bold; }
        .footer { margin-top: 60px; text-align: center; font-size: 9px; color: #aaa; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .badge-green { background: #e6f9f4; color: #00c9a7; }
        .badge-red { background: #ffe8e8; color: #ff6b6b; }
      </style>
    </head><body>
      <div class="header">
        <div class="brand">
          <h1>NAOUSSI INDUSTRIES</h1>
          <p>Design & Brand Strategy</p>
          <p>invoice@naoussi.com</p>
        </div>
        <div class="title">
          <h2>INVOICE</h2>
          <p># ${inv.invoice_number}</p>
          <p><span class="badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-red'}">${inv.status}</span></p>
        </div>
      </div>
      <hr>
      <div class="section">
        <div>
          <h3>Bill To</h3>
          <p><strong>${inv.company_name || 'Client'}</strong></p>
          <p>${inv.contact_name || ''}</p>
          <p>${inv.client_email || ''}</p>
        </div>
        <div>
          <h3>Invoice Details</h3>
          <p><strong>Issue Date:</strong> ${inv.issued_date || '-'}</p>
          <p><strong>Due Date:</strong> ${inv.due_date || '-'}</p>
          <p><strong>Type:</strong> ${inv.type === 'Deposit' ? '50% Deposit' : inv.type === 'Balance' ? '50% Balance' : 'Full Payment'}</p>
          <p><strong>Project:</strong> ${inv.project_code || '-'}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Project</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr>
            <td>${inv.project_desc || inv.package || inv.type + ' Payment'}</td>
            <td>${inv.project_code || '-'}</td>
            <td>${inv.type === 'Deposit' ? '50% Deposit' : inv.type === 'Balance' ? '50% Balance' : 'Full Payment'}</td>
            <td style="text-align:right">$${Number(inv.amount).toLocaleString()}</td>
          </tr>
          ${inv.deposit_paid > 0 ? `<tr><td></td><td></td><td>Deposit Received</td><td style="text-align:right">-$${Number(inv.deposit_paid).toLocaleString()}</td></tr>` : ''}
        </tbody>
      </table>
      <hr>
      <div class="total">Total Due: $${balance.toLocaleString()}</div>
      <div class="footer">
        Naoussi Industries &middot; Payment Terms: 50% deposit before work, 50% balance before delivery &middot; Thank you for your business!
      </div>
      <script>window.print()</script>
    </body></html>`)
    w.document.close()
  }

  const totalOutstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + Number(i.amount) - Number(i.deposit_paid || 0), 0)
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0)

  function generateInvoiceNumber() {
    const prefix = 'NI-INV-'
    const date = new Date()
    const seq = String(invoices.length + 1).padStart(3, '0')
    return `${prefix}${date.getFullYear()}-${seq}`
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value" style={{ color: 'var(--orange)' }}>${totalOutstanding.toLocaleString()}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length} unpaid</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Collected</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>${totalPaid.toLocaleString()}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === 'Paid').length} paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{invoices.filter(i => i.status === 'Overdue').length}</div>
        </div>
      </div>

      <div className="rules-alert">
        <span className="alert-icon">💳</span>
        <div className="alert-text">
          <strong>Payment Policy:</strong> 50% deposit <strong>before</strong> any work starts — 50% balance <strong>before</strong> final delivery. No exceptions without written approval. Use <strong>Deposit</strong> invoices at Stage 1 and <strong>Balance</strong> invoices at Stage 7.
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          {invoices.length > 0 ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} total` : ''}
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ ...empty, invoice_number: generateInvoiceNumber() }); setModal('create') }}>+ New Invoice</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th><th>Client</th><th>Project</th><th>Type</th><th>Amount</th><th>Balance Due</th><th>Issued</th><th>Due</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const balance = Number(inv.amount) - Number(inv.deposit_paid || 0)
                return (
                  <tr key={inv.id}>
                    <td><span style={{ fontWeight: 600, fontSize: 12 }}>{inv.invoice_number}</span></td>
                    <td>{inv.company_name || <span className="text-muted">—</span>}</td>
                    <td>{inv.project_code || <span className="text-muted">—</span>}</td>
                    <td><StatusBadge status={inv.type} /></td>
                    <td><span style={{ fontWeight: 600 }}>${Number(inv.amount).toLocaleString()}</span></td>
                    <td style={{ fontWeight: 600, color: balance > 0 ? 'var(--orange)' : 'var(--green)' }}>
                      ${balance.toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12 }}>{inv.issued_date ? new Date(inv.issued_date).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-xs btn-ghost" onClick={() => viewDetail(inv.id)}>View</button>
                        <button className="btn btn-xs btn-ghost" onClick={() => printInvoice(inv)}>PDF</button>
                        <button className="btn btn-xs btn-ghost btn-ghost-danger" onClick={() => handleDelete(inv.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {invoices.length === 0 && <tr><td colSpan={10}>{emptyState}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <Modal title={`Invoice #${detail.invoice_number}`} subtitle={detail.company_name || ''} onClose={() => setDetail(null)} wide>
          <div className="grid-3 mb-4" style={{ gap: 12 }}>
            <div className="detail-panel">
              <div className="detail-panel-header">Client</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Name</span><span className="value">{detail.contact_name || '—'}</span></div>
                <div className="detail-row"><span className="label">Email</span><span className="value">{detail.client_email || '—'}</span></div>
                <div className="detail-row"><span className="label">Company</span><span className="value">{detail.company_name || '—'}</span></div>
              </div>
            </div>
            <div className="detail-panel">
              <div className="detail-panel-header">Details</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Project</span><span className="value">{detail.project_code || '—'}</span></div>
                <div className="detail-row"><span className="label">Package</span><span className="value">{detail.package || '—'}</span></div>
                <div className="detail-row"><span className="label">Type</span><span className="value"><StatusBadge status={detail.type} /></span></div>
              </div>
            </div>
            <div className="detail-panel">
              <div className="detail-panel-header">Financial</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Amount</span><span className="value" style={{ fontWeight: 700 }}>${Number(detail.amount).toLocaleString()}</span></div>
                <div className="detail-row"><span className="label">Deposit Paid</span><span className="value" style={{ color: 'var(--green)' }}>${Number(detail.deposit_paid).toLocaleString()}</span></div>
                <div className="detail-row"><span className="label">Balance Due</span><span className="value" style={{ color: 'var(--orange)', fontWeight: 700 }}>${(Number(detail.amount) - Number(detail.deposit_paid)).toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="grid-2 mb-4" style={{ gap: 12 }}>
            <div className="detail-panel">
              <div className="detail-panel-header">Dates</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Issued</span><span className="value">{detail.issued_date ? new Date(detail.issued_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-row"><span className="label">Due</span><span className="value">{detail.due_date ? new Date(detail.due_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-row"><span className="label">Paid</span><span className="value">{detail.paid_date ? new Date(detail.paid_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-row"><span className="label">Status</span><span className="value"><StatusBadge status={detail.status} /></span></div>
              </div>
            </div>
            <div className="detail-panel">
              <div className="detail-panel-header">Notes</div>
              <div className="detail-panel-body">
                <p style={{ fontSize: 13, color: detail.notes ? 'var(--text)' : 'var(--text3)' }}>{detail.notes || 'No notes added'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button className="btn btn-primary" onClick={() => { printInvoice(detail); setDetail(null) }}>📥 Download PDF</button>
            <button className="btn btn-ghost" onClick={() => {
              setForm(detail)
              setDetail(null)
              setModal('edit')
            }}>Edit</button>
            <button className="btn btn-ghost" onClick={() => setDetail(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'New Invoice' : 'Edit Invoice'} subtitle={modal === 'create' ? 'Follow the 50/50 payment rule' : ''} onClose={() => setModal(null)}>
          <div className="form-row">
            <FormGroup label="Invoice Number"><input name="invoice_number" value={form.invoice_number} onChange={handleChange} /></FormGroup>
            <FormGroup label="Type">
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Deposit</option><option>Balance</option><option>Full</option>
              </select>
            </FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Client">
              <select name="client_id" value={form.client_id} onChange={handleChange}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Project">
              <select name="project_id" value={form.project_id} onChange={handleChange}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.package}</option>)}
              </select>
            </FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Amount ($)"><input type="number" name="amount" value={form.amount} onChange={handleChange} /></FormGroup>
            <FormGroup label="Deposit Already Paid ($)"><input type="number" name="deposit_paid" value={form.deposit_paid} onChange={handleChange} placeholder="0" /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Status">
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option><option>Cancelled</option>
              </select>
            </FormGroup>
            <FormGroup label="Due Date"><input type="date" name="due_date" value={form.due_date} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Payment terms, notes..." /></FormGroup>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{modal === 'create' ? 'Create Invoice' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
