import { useState, useEffect } from 'react'
import { api } from '../api'
import { StatusBadge, StageFlow } from '../components/Modal'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    api.dashboard.summary().then(setData).catch(console.error)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!data) return <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>Loading dashboard...</div>

  const totalRevenue = data.totalRevenue || 0
  const totalCosts = data.totalCosts || 0
  const netProfit = totalRevenue - totalCosts
  const marginPct = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(0) : 0

  const marginZoneData = [
    { name: 'Green 60%+', value: 2, fill: '#00c9a7' },
    { name: 'Orange 40-59%', value: 0, fill: '#ffb347' },
    { name: 'Red <40%', value: 1, fill: '#ff6b6b' },
  ]

  return (
    <div>
      {/* Live Clock */}
      <div className="live-clock">
        <div className="clock-date">{clock.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="clock-time">{clock.toLocaleTimeString('fr-FR')}</div>
        <div className="clock-tz">Franc CFA (FCFA) · UTC+1</div>
      </div>

      {/* KPI Ticker */}
      <div className="kpi-ticker">
        <div className="kpi-ticker-item">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{data.activeProjects}</div>
        </div>
        <div className="kpi-ticker-item">
          <div className="kpi-label">Completed</div>
          <div className="kpi-value" style={{ color: 'var(--blue)' }}>{data.completedProjects}</div>
        </div>
        <div className="kpi-ticker-item">
          <div className="kpi-label">Clients</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>{data.totalClients}</div>
        </div>
        <div className="kpi-ticker-item">
          <div className="kpi-label">Open Leads</div>
          <div className="kpi-value" style={{ color: 'var(--orange)' }}>{data.openLeads}</div>
        </div>
        <div className="kpi-ticker-item">
          <div className="kpi-label">Freelancers</div>
          <div className="kpi-value" style={{ color: 'var(--purple)' }}>{data.activeFreelancers}</div>
        </div>
        <div className="kpi-ticker-item">
          <div className="kpi-label">Avg Margin</div>
          <div className="kpi-value" style={{ color: marginPct >= 60 ? 'var(--green)' : marginPct >= 40 ? 'var(--orange)' : 'var(--red)' }}>{marginPct}%</div>
        </div>
      </div>

      {/* Business Rules Alert */}
      <div className="rules-alert">
        <span className="alert-icon">📋</span>
        <div className="alert-text">
          <strong>Operating Rules:</strong> 50% deposit before work starts · 50% balance before delivery · Max 2 revision rounds · Minimum <strong>60% margin</strong> target · Freelancers paid only after client approval
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-4">
        <div className="chart-card">
          <h4>Recent Activity</h4>
          {data.recentProjects.map(p => {
            const margin = ((p.client_price - p.freelancer_cost) / p.client_price * 100).toFixed(1)
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: p.status === 'Active' ? 'var(--primary-glow)' : p.status === 'Completed' ? 'var(--green-bg)' : 'var(--orange-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                  color: p.status === 'Active' ? 'var(--primary)' : p.status === 'Completed' ? 'var(--green)' : 'var(--orange)'
                }}>{p.project_code?.replace('NI-', '')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.company_name || <span className="text-muted">Unnamed Client</span>}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{p.package || '—'} · {p.project_code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: margin >= 60 ? 'var(--green)' : margin >= 40 ? 'var(--orange)' : 'var(--red)' }}>{margin}%</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            )
          })}
          {data.recentProjects.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>No projects yet</div>}
        </div>

        <div className="chart-card">
          <h4>Margin Zone Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={marginZoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text3)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {marginZoneData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="grid-2">
        <div className="chart-card">
          <h4>Pricing Packages — Quick Reference</h4>
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Client Price</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Starter Brand Kit</td><td>80–150 FCFA</td><td><StatusBadge status="Active" label="60% margin" /></td></tr>
              <tr><td>Business Identity Pack</td><td>150–300 FCFA</td><td><StatusBadge status="Active" label="65% margin" /></td></tr>
              <tr><td>Growth Brand System</td><td>300–700 FCFA</td><td><StatusBadge status="Active" label="70% margin" /></td></tr>
              <tr><td>Premium Strategy Pack</td><td>700–1 500+ FCFA</td><td><StatusBadge status="Active" label="75% margin" /></td></tr>
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <h4>Freelancer Roles — Standard Rates</h4>
          <table>
            <thead>
              <tr><th>Role</th><th>Rate/Task</th></tr>
            </thead>
            <tbody>
              <tr><td>Logo Designer</td><td>30–60 FCFA</td></tr>
              <tr><td>Graphic Designer</td><td>20–50 FCFA</td></tr>
              <tr><td>Motion Designer</td><td>40–100 FCFA</td></tr>
              <tr><td>UI Designer</td><td>50–120 FCFA</td></tr>
              <tr><td>Brand Designer</td><td>40–80 FCFA</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Margin Zone Reference */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="card-title">Margin Zone System</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid rgba(0,201,167,0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4, fontSize: 13 }}>🟢 Green Zone</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', marginBottom: 2 }}>60%–100%</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Healthy. Maintain. Consider premium positioning.</div>
          </div>
          <div style={{ background: 'var(--orange-bg)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid rgba(255,179,71,0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--orange)', marginBottom: 4, fontSize: 13 }}>🟠 Orange Zone</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange)', marginBottom: 2 }}>40%–59%</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Warning. Review freelancer costs or increase pricing.</div>
          </div>
          <div style={{ background: 'var(--red-bg)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid rgba(255,107,107,0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4, fontSize: 13 }}>🔴 Red Zone</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)', marginBottom: 2 }}>0%–39%</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Critical. Immediate review — why is this losing money?</div>
          </div>
        </div>
      </div>
    </div>
  )
}
