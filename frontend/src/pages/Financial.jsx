import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup } from '../components/Modal'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const txnEmpty = { project_id: '', client_id: '', freelancer_id: '', type: 'Client Payment', amount: 0, description: '' }

export default function Financial() {
  const [summary, setSummary] = useState(null)
  const [txns, setTxns] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(txnEmpty)

  function load() { api.financial.summary().then(setSummary); api.transactions.list().then(setTxns) }
  useEffect(() => { load() }, [])

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    await api.transactions.create({ ...form, amount: Number(form.amount), project_id: Number(form.project_id) || null, client_id: Number(form.client_id) || null, freelancer_id: Number(form.freelancer_id) || null })
    setModal(null); load()
  }

  if (!summary) return <div className="card">Loading...</div>

  const pieData = [
    { name: 'Revenue', value: summary.totals.revenue + summary.totals.deposits + summary.totals.balances },
    { name: 'Costs', value: summary.totals.costs },
  ]
  const COLORS = ['#00b894', '#e17055']

  const marginZoneData = [
    { name: 'Green (60%+)', value: summary.projects.filter(p => p.margin_pct >= 60).length, fill: '#00b894' },
    { name: 'Orange (40-59%)', value: summary.projects.filter(p => p.margin_pct >= 40 && p.margin_pct < 60).length, fill: '#fdcb6e' },
    { name: 'Red (<40%)', value: summary.projects.filter(p => p.margin_pct < 40).length, fill: '#e17055' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Financial Dashboard</h2>
        <button className="btn btn-primary" onClick={() => { setForm(txnEmpty); setModal('create') }}>+ Add Transaction</button>
      </div>

      <div className="grid-4">
        <div className="stat-card"><div className="label">Revenue</div><div className="value green">${(summary.totals.revenue + summary.totals.deposits + summary.totals.balances).toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Costs</div><div className="value red">${summary.totals.costs.toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Net Profit</div><div className="value blue">${((summary.totals.revenue + summary.totals.deposits + summary.totals.balances) - summary.totals.costs).toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Overall Margin</div><div className="value" style={{ color: summary.totals.marginPct >= 60 ? 'var(--green)' : summary.totals.marginPct >= 40 ? 'var(--orange)' : 'var(--red)' }}>{summary.totals.marginPct}%</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="chart-container">
          <h3>Revenue vs Costs</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Project Margins</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={marginZoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" name="Projects">
                {marginZoneData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="section-title">Transactions</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Amount</th><th>Project</th><th>Client</th><th>Description</th></tr>
          </thead>
          <tbody>
            {txns.map(t => (
              <tr key={t.id}>
                <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                <td><span className={`status-badge ${t.type.includes('Client') || t.type === 'Deposit' || t.type === 'Balance' ? 'status-active' : 'status-on_hold'}`}>{t.type}</span></td>
                <td style={{ fontWeight: 600, color: t.type === 'Freelancer Payment' ? 'var(--red)' : 'var(--green)' }}>${t.amount}</td>
                <td>{t.project_code || '-'}</td>
                <td>{t.client_name || '-'}</td>
                <td>{t.description || '-'}</td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Transaction" onClose={() => setModal(null)}>
          <div className="form-row">
            <FormGroup label="Type">
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Client Payment</option><option>Deposit</option><option>Balance</option><option>Freelancer Payment</option><option>Other</option>
              </select>
            </FormGroup>
            <FormGroup label="Amount ($)"><input type="number" name="amount" value={form.amount} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="Description"><input name="description" value={form.description} onChange={handleChange} /></FormGroup>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Add</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
