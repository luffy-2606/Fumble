import { useEffect, useState } from 'react'
import { usersApi, type User } from '../services/api'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Trash2, ShieldCheck, Mail, Phone } from 'lucide-react'

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    usersApi.list()
      .then(setData)
      .catch(() => setError('Failed to load users. Admin clearance required.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await usersApi.delete(id)
      load()
    } catch {
      setError('Failed to delete user.')
    }
  }

  const displayed = data.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="User Management"
      subtitle={`${data.length} total members registered`}
      loading={loading}
      error={error}
    >
      <div style={{ marginBottom: 20 }}>
        <input 
          className="form-input" 
          style={{ maxWidth: 350 }}
          placeholder="Search by name, roll no, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">No users found matching search.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roll Number</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="player-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {`${u.first_name} ${u.last_name}`.charAt(0)}
                      </div>
                      <span className="fw-600">{`${u.first_name} ${u.last_name}`}</span>
                    </div>
                  </td>
                  <td><code style={{ fontSize: '0.8rem' }}>{u.roll_number}</code></td>
                  <td>
                    <div className="text-sm text-muted" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12}/> {u.email}</span>
                       {u.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {u.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'organizer' ? 'badge-yellow' : 'badge-green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {u.role === 'admin' && <ShieldCheck size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{fmtDate(u.created_at)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u.user_id)} style={{ color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
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
