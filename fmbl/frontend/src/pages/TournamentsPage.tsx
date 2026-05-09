import { useEffect, useState } from 'react'
import { tournamentsApi, sportsApi, venuesApi, type Tournament, type Sport, type Venue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X } from 'lucide-react'

const FILTERS = ['all', 'ongoing', 'upcoming', 'completed']

export default function TournamentsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Tournament[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    tournamentsApi.list(filter === 'all' ? undefined : filter)
      .then(setData)
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    if (user?.role === 'admin') {
      sportsApi.list().then(setSports).catch(() => {})
      venuesApi.list().then(setVenues).catch(() => {})
    }
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !sportId || !user) return
    setSubmitting(true)
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
      load()
    } catch {
      setError('Failed to create tournament.')
    } finally {
      setSubmitting(false)
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Tournaments"
      subtitle={`${data.length} tournament${data.length !== 1 ? 's' : ''} found`}
      loading={loading}
      error={error}
      action={user?.role === 'admin' && (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'New Tournament'}
        </button>
      )}
    >
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
           <h3 className="section-title">Create New Tournament</h3>
           <form className="auth-form" onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
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
                  {submitting ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
           </form>
        </div>
      )}
      {/* Filter bar */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state">No tournaments match this filter.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sport</th>
                <th>Organizer</th>
                <th>Venue</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t, i) => (
                <tr key={t.tournament_id}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td className="fw-700 text-primary">{t.name}</td>
                  <td>{t.sport_name}</td>
                  <td>{t.organizer_name}</td>
                  <td>{t.venue_name}</td>
                  <td className="text-sm">{fmtDate(t.start_date)}</td>
                  <td className="text-sm">{fmtDate(t.end_date)}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
