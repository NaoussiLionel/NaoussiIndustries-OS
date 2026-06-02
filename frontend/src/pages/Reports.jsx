import { useState, useEffect } from 'react'
import { api } from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Reports() {
  const [kpi, setKpi] = useState(null)

  useEffect(() => { api.reports.kpi().then(setKpi).catch(console.error) }, [])

  if (!kpi) return <div className="card">Loading...</div>

  const marginPie = [
    { name: 'Green (60%+)', value: kpi.marginZones.green, fill: '#00b894' },
    { name: 'Orange (40-59%)', value: kpi.marginZones.orange, fill: '#fdcb6e' },
    { name: 'Red (<40%)', value: kpi.marginZones.red, fill: '#e17055' },
  ]

  const kpiData = [
    { metric: 'Conversion Rate', value: `${kpi.conversionRate}%` },
    { metric: 'Leads This Month', value: kpi.leadsThisMonth },
    { metric: 'Pipeline Value', value: `$${kpi.pipelineValue.toLocaleString()}` },
    { metric: 'Avg Delivery (Days)', value: kpi.avgDeliveryDays },
    { metric: 'Avg Revisions', value: kpi.avgRevisions },
    { metric: 'On-Time Rate', value: `${kpi.onTimeRate}%` },
    { metric: 'Active Projects', value: kpi.activeProjects },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Reports & KPIs</h2>
      </div>

      <div className="grid-4">
        {kpiData.map((d, i) => {
          const val = typeof d.value === 'string' && d.value.endsWith('%') ? parseInt(d.value) : typeof d.value === 'number' ? d.value : null
          let color = ''
          if (val !== null) {
            if (d.metric.includes('On-Time') || d.metric.includes('Conversion')) color = val >= 80 ? 'var(--green)' : val >= 50 ? 'var(--orange)' : 'var(--red)'
            else if (d.metric.includes('Revisions')) color = val <= 2 ? 'var(--green)' : 'var(--orange)'
          }
          return (
            <div className="stat-card" key={i}>
              <div className="label">{d.metric}</div>
              <div className="value" style={color ? { color } : {}}>{d.value}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="chart-container">
          <h3>Margin Zone Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={marginPie} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {marginPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>KPI Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData.filter(d => typeof d.value === 'number')}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#6c5ce7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Business Rules Summary</h3>
        <table>
          <thead>
            <tr><th>Rule</th><th>Policy</th></tr>
          </thead>
          <tbody>
            <tr><td>Payment</td><td>50% deposit before work starts — 50% balance before final delivery</td></tr>
            <tr><td>Revisions</td><td>Max 2 revision rounds per package — additional changes = new quote</td></tr>
            <tr><td>Margin</td><td>Minimum target: 60% — Below 40% = stop and review</td></tr>
            <tr><td>Freelancer</td><td>Paid ONLY after client approval — No direct client contact — All work reviewed internally</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
