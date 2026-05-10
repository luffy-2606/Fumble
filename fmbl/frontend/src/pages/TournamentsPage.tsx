import { useEffect, useState } from 'react'
import { tournamentsApi, sportsApi, venuesApi, type Tournament, type Sport, type Venue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X, Clock, CheckCircle, XCircle } from 'lucide-react'

const FILTERS = ['all', 'proposed', 'approved', 'ongoing', 'completed']

export default function TournamentsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [data, setData] = useState<Tournament[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [sportId, setSportId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    // Students only see approved/ongoing/completed; admins see all
    const statusParam = !isAdmin
      ? (filter === 'all' ? 'approved' : filter)
      : (filter === 'all' ? undefined : filter)

    tournamentsApi.list(statusParam)
      .then(setData)
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, isAdmin])

  useEffect(() => {
    sportsApi.list().then(setSports).catch(() => {})
    venuesApi.list().then(setVenues).catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !sportId || !user) return
    setSubmitting(true)
    setError('')
    try {
      await tournamentsApi.create({
        name,
        sport_id: parseInt(sportId),
        organizer_id: user.user_id,
        start_date: startDate,
        end_date: endDate,
        venue_id: venueId ? parseInt(venueId) : undefined
      })
      setShowForm(false)
      setName(''); setSportId(''); setVenueId(''); setStartDate(''); setEndDate('')
      setSuccess(isAdmin
        ? 'Tournament created successfully!'
        : '✅ Tournament proposal submitted for admin approval.')
      setTimeout(() => setSuccess(''), 5000)
      load()
    } catch {
      setError('Failed to create tournament.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: number, status: string) => {
    try {
      await tournamentsApi.updateStatus(id, status)
      setSuccess(`Tournament ${status === 'approved' ? 'approved' : status} successfully.`)
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch {
      setError('Failed to update tournament status.')
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  // For students, hide the 'proposed' filter option
  const visibleFilters = isAdmin ? FILTERS : FILTERS.filter(f => f !== 'proposed')

  const pendingTournaments = isAdmin ? data.filter(t => t.status === 'proposed') : []
  const displayedTournaments = isAdmin
    ? data.filter(t => t.status !== 'proposed')
    : data

  return (
    <PageShell
      title="Tournaments"
      subtitle={`${displayedTournaments.length} tournament${displayedTournaments.length !== 1 ? 's' : ''} found`}
      loading={loading}
      error={error}
      action={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'Propose Tournament'}
        </button>
      }
    >
      {success && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">Propose New Tournament</h3>
          {!isAdmin && (
            <p className="text-sm text-muted" style={{ margin: '8px 0 0' }}>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }}/>
              Your proposal will be reviewed by an admin before being listed publicly.
            </p>
          )}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Tournament Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Summer Cricket League" />
            </div>
            <div className="form-group">
              <label className="form-label">Sport</label>
              <select className="form-input" value={sportId} onChange={e => setSportId(e.target.value)} required>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.sport_id} value={s.sport_id}>{s.sport_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Venue (Optional)</label>
              <select className="form-input" value={venueId} onChange={e => setVenueId(e.target.value)}>
                <option value="">Select Venue</option>
                {venues.map(v => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting…' : isAdmin ? 'Create Tournament' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin: Pending Proposals */}
      {isAdmin && pendingTournaments.length > 0 && (
        <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warning-bg, #fffbeb)' }}>
            <Clock size={16} style={{ color: '#f59e0b' }}/>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
              Pending Proposals ({pendingTournaments.length})
            </span>
          </div>
          <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Sport</th><th>Organizer</th><th>Venue</th><th>Start</th><th>End</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTournaments.map(t => (
                  <tr key={t.tournament_id}>
                    <td className="fw-700">{t.name}</td>
                    <td>{t.sport_name}</td>
                    <td>{t.organizer_name}</td>
                    <td>{t.venue_name || '—'}</td>
                    <td className="text-sm">{fmtDate(t.start_date)}</td>
                    <td className="text-sm">{fmtDate(t.end_date)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleApprove(t.tournament_id, 'approved')}
                        >
                          <CheckCircle size={13}/> Approve
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleApprove(t.tournament_id, 'cancelled')}
                        >
                          <XCircle size={13}/> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        {visibleFilters.map(f => (
          <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {displayedTournaments.length === 0 ? (
        <div className="empty-state">No tournaments match this filter.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Sport</th><th>Organizer</th><th>Venue</th>
                <th>Start Date</th><th>End Date</th><th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayedTournaments.map((t, i) => (
                <tr key={t.tournament_id}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td className="fw-700 text-primary">{t.name}</td>
                  <td>{t.sport_name}</td>
                  <td>{t.organizer_name}</td>
                  <td>{t.venue_name || '—'}</td>
                  <td className="text-sm">{fmtDate(t.start_date)}</td>
                  <td className="text-sm">{fmtDate(t.end_date)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  {isAdmin && (
                    <td>
                      {t.status !== 'completed' && t.status !== 'cancelled' && (
                        <select
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', width: 'auto' }}
                          value={t.status}
                          onChange={e => handleApprove(t.tournament_id, e.target.value)}
                        >
                          <option value="approved">Approved</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
