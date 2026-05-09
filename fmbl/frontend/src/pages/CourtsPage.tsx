import { useEffect, useState } from 'react'
import { courtsApi, venuesApi, type Booking, type Venue } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Calendar, Plus, X } from 'lucide-react'

const FILTERS = ['all', 'pending', 'confirmed', 'cancelled']

export default function CourtsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Booking[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Booking Form State
  const [showForm, setShowForm] = useState(false)
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]) // Default to today
  const [startHour, setStartHour] = useState('09:00')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    courtsApi.list(filter === 'all' ? undefined : filter)
      .then(setData)
      .catch(() => setError('Failed to load court bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])
  
  useEffect(() => {
    venuesApi.list().then(setVenues).catch(() => {})
  }, [])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueId || !date || !startHour) return
    if (!user) return

    setSubmitting(true)
    setError('')
    
    // Calculate end time
    const [hour] = startHour.split(':')
    const endHour = `${parseInt(hour, 10) + 1}:00`

    try {
      await courtsApi.create({
        user_id: user.user_id,
        venue_id: parseInt(venueId),
        booking_date: date,
        start_time: startHour,
        end_time: endHour
      })
      setShowForm(false)
      setVenueId('')
      setStartHour('09:00')
      load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking. Venue might be busy.')
    } finally {
      setSubmitting(false)
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Court Bookings"
      subtitle={`${data.length} booking${data.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
      action={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Book a Court'}
        </button>
      }
    >
      {/* Booking Form Overlay/Section */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>New Booking</h3>
          <form className="auth-form" onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Venue</label>
              <select className="form-input" value={venueId} onChange={e => setVenueId(e.target.value)} required>
                <option value="">Choose a venue</option>
                {venues.map(v => (
                  <option key={v.venue_id} value={v.venue_id}>{v.venue_name} ({v.sport_name})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date (Today only)</label>
              <input className="form-input" type="date" value={date} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Time Slot (1 Hour)</label>
              <select className="form-input" value={startHour} onChange={e => setStartHour(e.target.value)} required>
                {[9, 10, 11, 12, 13, 14, 15, 16].map(h => {
                  const start = `${h.toString().padStart(2, '0')}:00`
                  const end = `${(h + 1).toString().padStart(2, '0')}:00`
                  return <option key={start} value={start}>{start} - {end}</option>
                })}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Creating Booking...' : 'Confirm Booking'}
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
        <div className="empty-state">No bookings for this status.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Roll #</th>
                <th>Venue</th>
                <th>Sport</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b, i) => (
                <tr key={b.booking_id}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td className="fw-600">{b.first_name} {b.last_name}</td>
                  <td className="text-sm text-muted">{b.roll_number}</td>
                  <td>{b.venue_name}</td>
                  <td><span className="badge badge-blue">{b.sport_name}</span></td>
                  <td className="text-sm">{fmtDate(b.booking_date)}</td>
                  <td className="text-sm text-muted">{b.start_time} – {b.end_time}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    {user?.role === 'admin' && b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn btn-sm btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          onClick={() => {
                            courtsApi.updateStatus(b.booking_id, 'confirmed').then(load)
                          }}
                        >
                          Confirm
                        </button>
                        <button 
                          className="btn btn-sm btn-outline" 
                          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          onClick={() => {
                            courtsApi.updateStatus(b.booking_id, 'cancelled').then(load)
                          }}
                        >
                          Reject
                        </button>
                      </div>
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
