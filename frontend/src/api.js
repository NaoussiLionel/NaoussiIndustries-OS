import db from './db.js'

function toList(fn) {
  const result = fn()
  return result
}

function toObj(fn) {
  const result = fn()
  return result
}

export const api = {
  dashboard: {
    summary: () => Promise.resolve(db.dashboardSummary()),
  },

  clients: {
    list: () => Promise.resolve(db.getAll('clients').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))),
    get: (id) => Promise.resolve(db.getById('clients', id)),
    create: (data) => Promise.resolve(db.insert('clients', data)),
    update: (id, data) => Promise.resolve(db.update('clients', id, data)),
    delete: (id) => { db.delete('clients', id); return Promise.resolve({ success: true }) },
  },

  leads: {
    list: () => Promise.resolve(db.getAll('leads').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))),
    get: (id) => Promise.resolve(db.getById('leads', id)),
    create: (data) => Promise.resolve(db.insert('leads', data)),
    update: (id, data) => Promise.resolve(db.update('leads', id, data)),
    delete: (id) => { db.delete('leads', id); return Promise.resolve({ success: true }) },
  },

  freelancers: {
    list: () => Promise.resolve(db.getAll('freelancers').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))),
    get: (id) => Promise.resolve(db.getById('freelancers', id)),
    create: (data) => Promise.resolve(db.insert('freelancers', data)),
    update: (id, data) => Promise.resolve(db.update('freelancers', id, data)),
    delete: (id) => { db.delete('freelancers', id); return Promise.resolve({ success: true }) },
  },

  projects: {
    list: () => Promise.resolve(db.projectsAll()),
    get: (id) => Promise.resolve(db.projectById(id)),
    create: (data) => Promise.resolve(db.projectCreate(data)),
    update: (id, data) => Promise.resolve(db.update('projects', id, data)),
    delete: (id) => {
      db.delete('project_stages', id, 'project_id') // delete stages manually via query
      const stages = db.query('project_stages', s => s.project_id === Number(id))
      stages.forEach(s => db.delete('project_stages', s.id))
      db.delete('projects', id)
      return Promise.resolve({ success: true })
    },
    updateStage: (projectId, stageId, data) => Promise.resolve(db.projectUpdateStage(projectId, stageId, data)),
  },

  contracts: {
    list: () => Promise.resolve(db.contractsAll()),
    get: (id) => Promise.resolve(db.getById('contracts', id)),
    create: (data) => Promise.resolve(db.insert('contracts', data)),
    update: (id, data) => Promise.resolve(db.update('contracts', id, data)),
    delete: (id) => { db.delete('contracts', id); return Promise.resolve({ success: true }) },
  },

  transactions: {
    list: () => Promise.resolve(db.transactionsAll()),
    create: (data) => Promise.resolve(db.insert('transactions', data)),
  },

  financial: {
    summary: () => Promise.resolve(db.financialSummary()),
  },

  packages: {
    list: () => Promise.resolve(db.getAll('pricing_packages')),
    update: (id, data) => Promise.resolve(db.update('pricing_packages', id, data)),
  },

  invoices: {
    list: () => Promise.resolve(db.invoicesAll()),
    get: (id) => Promise.resolve(db.invoiceById(id)),
    create: (data) => Promise.resolve(db.insert('invoices', data)),
    update: (id, data) => Promise.resolve(db.update('invoices', id, data)),
    delete: (id) => { db.delete('invoices', id); return Promise.resolve({ success: true }) },
    pdfUrl: (id) => `#/invoice-pdf/${id}`,
  },

  reports: {
    kpi: () => Promise.resolve(db.kpiReport()),
  },
}
