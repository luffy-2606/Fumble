import { useEffect, useState } from 'react'
import { matchesApi, tournamentsApi, teamsApi, type Match, type Tournament, type Team } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X } from 'lucide-react'

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed']

export default function MatchesPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form State
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
    if (user?.role === 'admin') {
      tournamentsApi.list().then(setTournaments).catch(() => {})
      teamsApi.list().then(setTeams).catch(() => {})
    }
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentId || !teamAId || !teamBId || !matchDate || !matchTime) return
    if (teamAId === teamBId) { setError('Teams must be different!'); return }
    setSubmitting(true)
    try {
      await matchesApi.create({
        tournament_id: parseInt(tournamentId),
        team_a_id: parseInt(teamAId),
        team_b_id: parseInt(teamBId),
        match_date: matchDate,
        match_time: matchTime
      })
      setShowForm(false)
      load()
    } catch {
      setError('Failed to schedule match.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = filter === 'all' ? data : data.filter(m => m.status.toLowerCase() === filter)

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Matches"
      subtitle={`${displayed.length} match${displayed.length !== 1 ? 'es' : ''}`}
      loading={loading}
      error={error}
      action={user?.role === 'admin' && (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'Schedule Match'}
        </button>
      )}
    >
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">Schedule New Match</h3>
          <form className="auth-form" onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
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
                {submitting ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}
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

      {displayed.length === 0 ? (
        <div className="empty-state">No matches found.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tournament</th>
                <th>Team A</th>
                <th>vs</th>
                <th>Team B</th>
                <th>Date</th>
                <th>Time</th>
                <th>Winner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((m, i) => (
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
