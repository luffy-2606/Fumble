import { useEffect, useState } from 'react'
import { issuanceApi, itemsApi, usersApi, type Issuance, type Item, type User } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X } from 'lucide-react'

const FILTERS = ['all', 'issued', 'overdue', 'returned']

export default function IssuancePage() {
  const { user } = useAuth()
  const [data, setData] = useState<Issuance[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [returning, setReturning] = useState<number | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [targetId, setTargetId] = useState('')
  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    issuanceApi.list(filter === 'all' ? undefined : filter)
      .then(setData)
      .catch(() => setError('Failed to load issuances.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    if (user?.role === 'admin') {
      itemsApi.list().then(setItems).catch(() => {})
      usersApi.list().then(setUsers).catch(() => {})
    }
  }, [user])

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId || !itemId || !quantity || !dueDate) return
    setSubmitting(true)
    try {
      await issuanceApi.create({
        user_id: parseInt(targetId),
        item_id: parseInt(itemId),
        quantity: parseInt(quantity),
        due_date: dueDate
      })
      setShowForm(false)
      setTargetId(''); setItemId(''); setQuantity('1'); setDueDate('')
      load()
    } catch {
      setError('Failed to issue item. Check stock.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async (id: number) => {
    setReturning(id)
    try {
      await issuanceApi.return(id)
      load()
    } catch {
      setError('Failed to process return.')
    } finally {
      setReturning(null)
    }
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'

  const isOverdue = (due: string, status: string) =>
    status !== 'returned' && new Date(due) < new Date()

  return (
    <PageShell
      title="Equipment Issuance"
      subtitle={`${data.length} record${data.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
      action={user?.role === 'admin' && (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'Issue Equipment'}
        </button>
      )}
    >
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">New Issuance</h3>
          <form className="auth-form" onSubmit={handleIssue} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Member</label>
              <select className="form-input" value={targetId} onChange={e => setTargetId(e.target.value)} required>
                <option value="">Select Member</option>
                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.roll_number})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment</label>
              <select className="form-input" value={itemId} onChange={e => setItemId(e.target.value)} required>
                <option value="">Select Item</option>
                {items.filter(i => i.available_qty > 0).map(i => <option key={i.item_id} value={i.item_id}>{i.item_name} (Avail: {i.available_qty})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Issuing...' : 'Issue Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state">No issuance records found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Roll #</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Issued At</th>
                <th>Due Date</th>
                <th>Returned At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item.issuance_id} className={isOverdue(item.due_date, item.status) ? 'row-overdue' : ''}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td className="fw-600">{item.first_name} {item.last_name}</td>
                  <td className="text-sm text-muted">{item.roll_number}</td>
                  <td>{item.item_name}</td>
                  <td className="text-sm">{item.quantity}</td>
                  <td className="text-sm">{fmtDate(item.issued_at)}</td>
                  <td className={`text-sm ${isOverdue(item.due_date, item.status) ? 'text-error fw-600' : ''}`}>
                    {fmtDate(item.due_date)}
                  </td>
                  <td className="text-sm text-muted">{fmtDate(item.returned_at)}</td>
                  <td>
                    <StatusBadge status={isOverdue(item.due_date, item.status) ? 'overdue' : item.status} />
                  </td>
                  <td>
                    {item.status !== 'returned' && (
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                        disabled={returning === item.issuance_id}
                        onClick={() => handleReturn(item.issuance_id)}
                      >
                        {returning === item.issuance_id ? '…' : 'Return'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
