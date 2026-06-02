const STORE_KEY = 'ni_os_db'

function genId() {
  return Date.now() + Math.floor(Math.random() * 10000)
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function save(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data))
}

const defaultData = {
  clients: [],
  leads: [],
  freelancers: [],
  projects: [],
  contracts: [],
  transactions: [],
  project_stages: [],
  invoices: [],
  pricing_packages: [
    { id: 1, name: 'Starter Brand Kit', client_price_min: 80, client_price_max: 150, freelancer_cost_min: 30, freelancer_cost_max: 60, target_margin_pct: 60, description: 'Basic logo and brand identity starter', created_at: now(), updated_at: now() },
    { id: 2, name: 'Business Identity Pack', client_price_min: 150, client_price_max: 300, freelancer_cost_min: 60, freelancer_cost_max: 120, target_margin_pct: 65, description: 'Full business identity suite', created_at: now(), updated_at: now() },
    { id: 3, name: 'Growth Brand System', client_price_min: 300, client_price_max: 700, freelancer_cost_min: 120, freelancer_cost_max: 250, target_margin_pct: 70, description: 'Comprehensive brand system', created_at: now(), updated_at: now() },
    { id: 4, name: 'Premium Strategy Pack', client_price_min: 700, client_price_max: 1500, freelancer_cost_min: 250, freelancer_cost_max: 500, target_margin_pct: 75, description: 'Strategic brand development', created_at: now(), updated_at: now() },
  ]
}

function getDB() {
  let data = load()
  if (!data) {
    data = JSON.parse(JSON.stringify(defaultData))
    save(data)
  }
  return data
}

const db = {
  // ─── Generic Helpers ───
  getAll(table) {
    return getDB()[table] || []
  },

  getById(table, id) {
    return (getDB()[table] || []).find(item => item.id === Number(id)) || null
  },

  insert(table, record) {
    const data = getDB()
    const item = { id: genId(), ...record, created_at: now(), updated_at: now() }
    data[table].push(item)
    save(data)
    return item
  },

  update(table, id, changes) {
    const data = getDB()
    const idx = data[table].findIndex(item => item.id === Number(id))
    if (idx === -1) return null
    data[table][idx] = { ...data[table][idx], ...changes, updated_at: now() }
    save(data)
    return data[table][idx]
  },

  delete(table, id) {
    const data = getDB()
    const idx = data[table].findIndex(item => item.id === Number(id))
    if (idx === -1) return false
    data[table].splice(idx, 1)
    save(data)
    return true
  },

  query(table, fn) {
    return (getDB()[table] || []).filter(fn)
  },

  // ─── Dashboard ───
  dashboardSummary() {
    const data = getDB()
    const activeProjects = data.projects.filter(p => p.status === 'Active').length
    const completedProjects = data.projects.filter(p => p.status === 'Completed').length
    const totalClients = data.clients.filter(c => c.status === 'Active').length
    const openLeads = data.leads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length
    const activeFreelancers = data.freelancers.filter(f => f.status === 'Active').length
    const clientPayments = data.transactions.filter(t => ['Client Payment', 'Deposit', 'Balance'].includes(t.type))
    const freelancerPayments = data.transactions.filter(t => t.type === 'Freelancer Payment')
    const totalRevenue = clientPayments.reduce((s, t) => s + Number(t.amount), 0)
    const totalCosts = freelancerPayments.reduce((s, t) => s + Number(t.amount), 0)

    return {
      activeProjects,
      completedProjects,
      totalClients,
      openLeads,
      activeFreelancers,
      totalRevenue,
      totalCosts,
      avgMargin: 0,
      recentProjects: data.projects.slice(0, 5).map(p => ({
        ...p,
        company_name: (data.clients.find(c => c.id === p.client_id) || {}).company_name || null,
        freelancer_name: (data.freelancers.find(f => f.id === p.freelancer_id) || {}).name || null,
      })),
    }
  },

  // ─── Projects with joins ───
  projectsAll() {
    const data = getDB()
    return data.projects.map(p => ({
      ...p,
      company_name: (data.clients.find(c => c.id === p.client_id) || {}).company_name || null,
      freelancer_name: (data.freelancers.find(f => f.id === p.freelancer_id) || {}).name || null,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  projectById(id) {
    const data = getDB()
    const p = data.projects.find(p => p.id === Number(id))
    if (!p) return null
    return {
      ...p,
      company_name: (data.clients.find(c => c.id === p.client_id) || {}).company_name || null,
      freelancer_name: (data.freelancers.find(f => f.id === p.freelancer_id) || {}).name || null,
      stages: (data.project_stages || []).filter(s => s.project_id === Number(id)).sort((a, b) => a.id - b.id),
    }
  },

  projectCreate(data) {
    const dbData = getDB()
    const project = { id: genId(), ...data, revision_rounds: 0, quality_score: null, created_at: now(), updated_at: now() }
    dbData.projects.push(project)

    const stageNames = ['01_Quote', '02_Brief', '03_Design_Work', '04_Assets', '05_Invoices', '06_Revisions', '07_Final_Delivery']
    stageNames.forEach((name, i) => {
      dbData.project_stages.push({
        id: genId() + i,
        project_id: project.id,
        stage_name: name,
        status: 'Pending',
        notes: null,
        completed_at: null,
        created_at: now(),
      })
    })
    save(dbData)
    return project
  },

  projectUpdateStage(projectId, stageId, data) {
    const dbData = getDB()
    const idx = dbData.project_stages.findIndex(s => s.id === Number(stageId) && s.project_id === Number(projectId))
    if (idx === -1) return null
    const completed_at = data.status === 'Completed' ? new Date().toISOString() : dbData.project_stages[idx].completed_at
    dbData.project_stages[idx] = { ...dbData.project_stages[idx], ...data, completed_at, updated_at: now() }
    save(dbData)
    return dbData.project_stages[idx]
  },

  // ─── Invoices with joins ───
  invoicesAll() {
    const data = getDB()
    return data.invoices.map(inv => ({
      ...inv,
      project_code: (data.projects.find(p => p.id === inv.project_id) || {}).project_code || null,
      company_name: (data.clients.find(c => c.id === inv.client_id) || {}).company_name || null,
      contact_name: (data.clients.find(c => c.id === inv.client_id) || {}).contact_name || null,
      client_email: (data.clients.find(c => c.id === inv.client_id) || {}).email || null,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  invoiceById(id) {
    const data = getDB()
    const inv = data.invoices.find(i => i.id === Number(id))
    if (!inv) return null
    const p = data.projects.find(p => p.id === inv.project_id) || {}
    const c = data.clients.find(cl => cl.id === inv.client_id) || {}
    return {
      ...inv,
      project_code: p.project_code || null,
      package: p.package || null,
      client_price: p.client_price || null,
      project_desc: p.description || null,
      company_name: c.company_name || null,
      contact_name: c.contact_name || null,
      client_email: c.email || null,
      client_phone: c.phone || null,
    }
  },

  // ─── Financial Summary ───
  financialSummary() {
    const data = getDB()
    const byType = {}
    data.transactions.forEach(t => {
      byType[t.type] = (byType[t.type] || 0) + Number(t.amount)
    })
    const totals = {
      revenue: (byType['Client Payment'] || 0),
      costs: (byType['Freelancer Payment'] || 0),
      deposits: (byType['Deposit'] || 0),
      balances: (byType['Balance'] || 0),
    }
    totals.netProfit = totals.revenue + totals.deposits + totals.balances - totals.costs
    const totalRev = totals.revenue + totals.deposits + totals.balances
    totals.marginPct = totalRev > 0 ? Math.round((totalRev - totals.costs) / totalRev * 100) : 0
    const projects = data.projects.filter(p => p.status === 'Active' || p.status === 'Completed').map(p => ({
      project_code: p.project_code,
      client_price: p.client_price,
      freelancer_cost: p.freelancer_cost,
      margin_pct: p.client_price > 0 ? ((p.client_price - p.freelancer_cost) / p.client_price * 100) : 0,
    }))
    return { totals, projects }
  },

  // ─── KPI Reports ───
  kpiReport() {
    const data = getDB()
    const totalLeads = data.leads.length || 1
    const wonLeads = data.leads.filter(l => l.status === 'Closed Won').length
    const pipelineValue = data.leads
      .filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost' && l.budget_range)
      .reduce((s, l) => {
        const num = parseInt(l.budget_range.replace(/[,\s]/g, ''))
        return s + (isNaN(num) ? 0 : num)
      }, 0)

    const avgRevisions = data.projects.length > 0
      ? data.projects.reduce((s, p) => s + (p.revision_rounds || 0), 0) / data.projects.length
      : 0

    const avgOnTime = data.freelancers.length > 0
      ? data.freelancers.reduce((s, f) => s + (f.on_time_pct || 100), 0) / data.freelancers.length
      : 100

    const marginZones = { green: 0, orange: 0, red: 0 }
    data.projects.forEach(p => {
      const m = p.client_price > 0 ? ((p.client_price - p.freelancer_cost) / p.client_price) : 0
      if (m >= 0.6) marginZones.green++
      else if (m >= 0.4) marginZones.orange++
      else marginZones.red++
    })

    return {
      conversionRate: Math.round((wonLeads / totalLeads) * 100),
      leadsThisMonth: data.leads.length,
      pipelineValue,
      avgDeliveryDays: 0,
      avgRevisions: Math.round(avgRevisions),
      onTimeRate: Math.round(avgOnTime),
      activeProjects: data.projects.filter(p => p.status === 'Active').length,
      marginZones,
    }
  },

  // ─── Contracts with joins ───
  contractsAll() {
    const data = getDB()
    return data.contracts.map(c => ({
      ...c,
      client_name: (data.clients.find(cl => cl.id === c.client_id) || {}).company_name || null,
      freelancer_name: (data.freelancers.find(f => f.id === c.freelancer_id) || {}).name || null,
      project_code: (data.projects.find(p => p.id === c.project_id) || {}).project_code || null,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  // ─── Transactions with joins ───
  transactionsAll() {
    const data = getDB()
    return data.transactions.map(t => ({
      ...t,
      client_name: (data.clients.find(c => c.id === t.client_id) || {}).company_name || null,
      freelancer_name: (data.freelancers.find(f => f.id === t.freelancer_id) || {}).name || null,
      project_code: (data.projects.find(p => p.id === t.project_id) || {}).project_code || null,
    })).sort((a, b) => new Date(b.transaction_date || b.created_at) - new Date(a.transaction_date || a.created_at))
  },
}

export default db
