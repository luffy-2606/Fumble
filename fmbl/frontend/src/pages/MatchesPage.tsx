import { useEffect, useState } from 'react'
import { matchesApi, tournamentsApi, teamsApi, type Match, type Tournament, type Team } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X, Clock, CheckCircle, XCircle } from 'lucide-react'

const FILTERS = ['all', 'scheduled', 'ongoing', 'completed']

export default function MatchesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [data, setData] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [tournamentId, setTournamentId] = useState('')
  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    matchesApi.list()
      .then(setData)
      .catch(() => setError('Failed to load matches.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    tournamentsApi.list('approved').then(setTournaments).catch(() => {})
    teamsApi.list().then(setTeams).catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentId || !teamAId || !teamBId || !matchDate || !matchTime) return
    if (teamAId === teamBId) { setError('Teams must be different!'); return }
    setSubmitting(true)
    setError('')
    try {
      await matchesApi.create({
        tournament_id: parseInt(tournamentId),
        team_a_id: parseInt(teamAId),
        team_b_id: parseInt(teamBId),
        match_date: matchDate,
        match_time: matchTime
      })
      setShowForm(false)
      setTournamentId(''); setTeamAId(''); setTeamBId(''); setMatchDate(''); setMatchTime('')
      setSuccess(isAdmin
        ? 'Match scheduled successfully!'
        : '✅ Match request submitted for admin approval.')
      setTimeout(() => setSuccess(''), 5000)
      load()
    } catch {
      setError('Failed to schedule match.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveMatch = async (id: number) => {
    try {
      await matchesApi.updateResult(id, 0, 'scheduled')
      setSuccess('Match approved and scheduled!')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch {
      setError('Failed to approve match.')
    }
  }

  const handleRejectMatch = async (id: number) => {
    try {
      await matchesApi.updateResult(id, 0, 'cancelled')
      setSuccess('Match request rejected.')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch {
      setError('Failed to reject match.')
    }
  }

  const pendingMatches = data.filter(m => m.status === 'pending_approval')
  const displayedMatches = filter === 'all'
    ? data.filter(m => m.status !== 'pending_approval')
    : data.filter(m => m.status === filter)

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Matches"
      subtitle={`${displayedMatches.length} match${displayedMatches.length !== 1 ? 'es' : ''}`}
      loading={loading}
      error={error}
      action={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'Request Match'}
        </button>
      }
    >
      {success && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>
      )}

      {/* Create Match Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">{isAdmin ? 'Schedule New Match' : 'Request a Match'}</h3>
          {!isAdmin && (
            <p className="text-sm text-muted" style={{ margin: '8px 0 0' }}>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }}/>
              Your match request will be reviewed and approved by an admin.
            </p>
          )}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Tournament</label>
              <select className="form-input" value={tournamentId} onChange={e => setTournamentId(e.target.value)} required>
                <option value="">Select Tournament</option>
                {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team A</label>
              <select className="form-input" value={teamAId} onChange={e => setTeamAId(e.target.value)} required>
                <option value="">Select Team A</option>
                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.sport_name})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team B</label>
              <select className="form-input" value={teamBId} onChange={e => setTeamBId(e.target.value)} required>
                <option value="">Select Team B</option>
                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.sport_name})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting…' : isAdmin ? 'Confirm Schedule' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin: Pending Match Requests */}
      {isAdmin && pendingMatches.length > 0 && (
        <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb' }}>
            <Clock size={16} style={{ color: '#f59e0b' }}/>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
              Pending Match Requests ({pendingMatches.length})
            </span>
          </div>
          <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tournament</th><th>Team A</th><th>vs</th><th>Team B</th>
                  <th>Date</th><th>Time</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMatches.map(m => (
                  <tr key={m.match_id}>
                    <td>{m.tournament_name || '—'}</td>
                    <td className="fw-600">{m.team_a}</td>
                    <td className="text-muted text-sm" style={{ textAlign: 'center' }}>vs</td>
                    <td className="fw-600">{m.team_b}</td>
                    <td className="text-sm">{fmtDate(m.match_date)}</td>
                    <td className="text-sm text-muted">{m.match_time}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleApproveMatch(m.match_id)}
                        >
                          <CheckCircle size={13}/> Approve
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleRejectMatch(m.match_id)}
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
        {FILTERS.map(f => (
          <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {displayedMatches.length === 0 ? (
        <div className="empty-state">No matches found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Tournament</th><th>Team A</th><th>vs</th><th>Team B</th>
                <th>Date</th><th>Time</th><th>Winner</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedMatches.map((m, i) => (
                <tr key={m.match_id}>
                  <td className="text-muted text-sm">{i + 1}</td>
                  <td>{m.tournament_name}</td>
                  <td className="fw-600">{m.team_a}</td>
                  <td className="text-muted text-sm" style={{ textAlign: 'center' }}>vs</td>
                  <td className="fw-600">{m.team_b}</td>
                  <td className="text-sm">{fmtDate(m.match_date)}</td>
                  <td className="text-sm text-muted">{m.match_time}</td>
                  <td>{m.winner ? <span className="fw-600 text-primary">{m.winner}</span> : <span className="text-muted">N/A</span>}</td>
                  <td><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
