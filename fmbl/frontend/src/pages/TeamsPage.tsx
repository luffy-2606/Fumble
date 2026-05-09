import { useEffect, useState } from 'react'
import { teamsApi, type Team } from '../services/api'
import PageShell from '../components/PageShell'
import { Users } from 'lucide-react'

export default function TeamsPage() {
  const [data, setData] = useState<Team[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    teamsApi.list()
      .then(setData)
      .catch(() => setError('Failed to load teams.'))
      .finally(() => setLoading(false))
  }, [])

  const displayed = data.filter(t =>
    !search ||
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    t.sport_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.captain_name?.toLowerCase().includes(search.toLowerCase())
  )

  const sportColors: Record<string, string> = {
    cricket: '#d32f2f', football: '#388e3c', basketball: '#f57c00',
    badminton: '#7b1fa2', volleyball: '#1976d2', default: 'var(--primary-dark)',
  }

  const getColor = (sport: string) =>
    sportColors[sport?.toLowerCase()] ?? sportColors.default

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Teams"
      subtitle={`${displayed.length} team${displayed.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
    >
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search by team, sport, or captain…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">No teams found.</div>
      ) : (
        <div className="card-grid">
          {displayed.map(t => (
            <div key={t.team_id} className="team-card card">
              <div className="team-card-top" style={{ borderTopColor: getColor(t.sport_name) }}>
                <div className="team-icon" style={{ background: getColor(t.sport_name) + '20', color: getColor(t.sport_name) }}>
                  <Users size={20} />
                </div>
                <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{t.sport_name}</span>
              </div>
              <div className="team-card-body">
                <h3 className="team-name">{t.team_name}</h3>
                <div className="team-meta">
                  <span className="text-sm text-muted">Captain</span>
                  <span className="fw-600" style={{ color: 'var(--gray-800)' }}>{t.captain_name}</span>
                </div>
                <div className="team-meta">
                  <span className="text-sm text-muted">Roll</span>
                  <span className="text-sm">{t.captain_roll}</span>
                </div>
                <div className="team-meta">
                  <span className="text-sm text-muted">Founded</span>
                  <span className="text-sm">{fmtDate(t.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
