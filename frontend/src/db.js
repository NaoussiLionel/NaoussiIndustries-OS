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
    {
      id: 1, name: 'Starter Brand Kit', client_price: 80, freelancer_cost: 30, target_margin_pct: 60,
      description: [
        '3 unique logo concepts (full revisions until approval)',
        'Color palette — 5 professional colors with HEX/RGB codes',
        'Typography selection — 2 complementary fonts with usage rules',
        'Brand guidelines — 1-page quick reference PDF',
        'Logo file pack — PNG, SVG, EPS, AI formats',
        'Business card mockup — print-ready template',
        '14-day delivery',
      ].join('\n'),
      use_case: [
        'New startups launching their very first brand identity',
        'Freelancers and solopreneurs wanting a polished, professional look',
        'Local small businesses — restaurants, boutiques, clinics, salons',
      ].join('\n'),
      client_advantage: [
        'Your brand is the first impression you make. In the first 7 seconds, people decide if they trust you.',
        'Don\'t let a DIY logo cost you customers before you even get a chance. A professional identity tells the world: "I\'m serious about what I do."',
        'For the price of a dinner out, you get a brand that works for you every single day — on your website, your business card, your social media. It\'s the easiest investment you\'ll ever make in your business.',
        '',
        '👉 Ready to look professional? Contact us today and let\'s build your brand in 14 days.',
      ].join('\n'),
      created_at: now(), updated_at: now()
    },
    {
      id: 2, name: 'Business Identity Pack', client_price: 150, freelancer_cost: 60, target_margin_pct: 65,
      description: [
        'Everything in Starter Brand Kit, plus:',
        'Custom logo — unlimited concepts until perfect',
        'Full color system — primary, secondary, accent, neutral palettes',
        'Typography scaling guide — headings, body, captions, hierarchy',
        'Business card template — print-ready (front + back)',
        'Letterhead template — A4, Word + InDesign formats',
        'Email signature design — professional HTML signature',
        'Social media kit — profile picture, cover photo, post templates (3)',
        'Brand guidelines — complete PDF (10+ pages)',
        '21-day delivery',
      ].join('\n'),
      use_case: [
        'Growing SMEs that need a consistent identity across every client touchpoint',
        'Service businesses — agencies, consultancies, law firms, medical practices',
        'E-commerce brands selling across website, social media, and marketplaces',
      ].join('\n'),
      client_advantage: [
        'Every time your brand looks different — different colors here, wrong font there — you lose a little bit of trust. Inconsistency is expensive.',
        'This pack makes you look professional everywhere, automatically. Your business card matches your website matches your email matches your Instagram. No design skills required. No second-guessing.',
        'Your clients will feel it: "These people have their act together." And when they trust you, they buy from you.',
        '',
        '👉 Make every impression count. Let\'s unify your brand across every channel.',
      ].join('\n'),
      created_at: now(), updated_at: now()
    },
    {
      id: 3, name: 'Growth Brand System', client_price: 300, freelancer_cost: 120, target_margin_pct: 70,
      description: [
        'Everything in Business Identity Pack, plus:',
        'Brand strategy workshop — half-day session with your team',
        'Competitor analysis report — market positioning, gaps, opportunities',
        'Brand voice & tone guide — how your brand speaks (words, phrases, tone rules)',
        'Marketing template toolkit — flyers, ads, presentations, proposals, brochures',
        'Iconography system — 20+ custom icons for web and print',
        'Packaging design guidelines — labels, boxes, bags',
        'Brand photography direction — mood board, lighting, composition guide',
        '30-day delivery',
      ].join('\n'),
      use_case: [
        'Scaling businesses preparing for investment, partnerships, or new markets',
        'Companies with multiple product lines, services, or sub-brands',
        'Brands launching a new offering and needing a coordinated go-to-market identity',
      ].join('\n'),
      client_advantage: [
        'A logo alone won\'t grow your business. You need a system.',
        'This is the operating system for your brand\'s growth. Every piece works together — from your website to your packaging to your sales deck. Your team can execute without you in the room. Your brand doesn\'t break when someone new joins.',
        'While your competitors are figuring out their colors, you\'ll be dominating your market with a brand that\'s strategic, scalable, and impossible to ignore.',
        '',
        '👉 Scale with confidence. Let\'s build the system that grows your brand.',
      ].join('\n'),
      created_at: now(), updated_at: now()
    },
    {
      id: 4, name: 'Premium Strategy Pack', client_price: 700, freelancer_cost: 250, target_margin_pct: 75,
      description: [
        'Everything in Growth Brand System, plus:',
        'Deep market research — consumer surveys, trend analysis, audience segmentation',
        'Brand architecture — masterbrand vs sub-brands, naming, hierarchy',
        'Positioning strategy — differentiation map, competitive landscape, messaging hierarchy',
        'Complete visual identity — unlimited applications across all media',
        'Campaign concept — visual identity + copy for a 90-day launch campaign',
        '3 months of brand advisory — monthly strategy check-ins, performance reviews, course correction',
        'Brand launch playbook — step-by-step rollout plan for internal and external launch',
        '45-day delivery',
      ].join('\n'),
      use_case: [
        'Established enterprises undergoing a major rebrand or brand refresh',
        'High-growth startups preparing for Series A+ fundraising and rapid scaling',
        'Companies experiencing brand stagnation, market erosion, or losing to newer competitors',
      ].join('\n'),
      client_advantage: [
        'Your brand is your most valuable asset. It\'s either working for you or against you.',
        'This is not a design project. It\'s a business transformation. We\'ll research your market, position you to win, build a visual identity that commands premium prices, and stay with you for 3 months to make sure it actually works.',
        'When you walk into your next investor meeting, when you launch your next product, when a potential client compares you to the competition — you won\'t just look better. You\'ll be unstoppable.',
        '',
        '👉 Transform your business. Let\'s build a brand that leads your market.',
      ].join('\n'),
      created_at: now(), updated_at: now()
    },
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
