import { useEffect, useState } from 'react'
import { teamsApi, sportsApi, type Team, type Sport } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { Plus, X, Users, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function TeamsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [data, setData] = useState<Team[]>([])
  const [pendingTeams, setPendingTeams] = useState<Team[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [sportId, setSportId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    const listPromise = isAdmin
      ? teamsApi.list()           // admin sees all
      : teamsApi.list()           // students see only approved (backend filters)

    listPromise
      .then(teams => {
        setData(teams.filter(t => t.status === 'approved' || !isAdmin ? t.status === 'approved' : true))
        if (isAdmin) {
          // show pending separately
          setData(teams.filter(t => t.status === 'approved'))
          setPendingTeams(teams.filter(t => t.status === 'pending'))
        } else {
          setData(teams)
        }
      })
      .catch(() => setError('Failed to load teams.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    sportsApi.list().then(setSports).catch(() => { })
    if (isAdmin) {
      // admin: fetch all, then pending separately
      Promise.all([teamsApi.list(), teamsApi.list('pending')])
        .then(([all, pending]) => {
          setData(all.filter(t => t.status === 'approved'))
          setPendingTeams(pending)
        })
        .catch(() => setError('Failed to load teams.'))
        .finally(() => setLoading(false))
    } else {
      teamsApi.list()
        .then(setData)
        .catch(() => setError('Failed to load teams.'))
        .finally(() => setLoading(false))
    }
  }, [isAdmin])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName || !sportId || !user) return
    setSubmitting(true)
    setError('')
    try {
      await teamsApi.create({
        team_name: teamName,
        sport_id: parseInt(sportId),
        captain_id: user.user_id,
      })
      setShowForm(false)
      setTeamName(''); setSportId('')
      setSuccess(isAdmin ? 'Team created successfully!' : ' Team submitted for admin approval.')
      setTimeout(() => setSuccess(''), 5000)
      if (isAdmin) {
        // Reload admin view
        Promise.all([teamsApi.list(), teamsApi.list('pending')])
          .then(([all, pending]) => {
            setData(all.filter(t => t.status === 'approved'))
            setPendingTeams(pending)
          })
      }
    } catch {
      setError('Failed to create team.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: number, status: string) => {
    try {
      await teamsApi.approve(id, status)
      setSuccess(`Team ${status} successfully.`)
      setTimeout(() => setSuccess(''), 3000)
      Promise.all([teamsApi.list(), teamsApi.list('pending')])
        .then(([all, pending]) => {
          setData(all.filter(t => t.status === 'approved'))
          setPendingTeams(pending)
        })
    } catch {
      setError('Failed to update team status.')
    }
  }

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
  const getColor = (sport: string) => sportColors[sport?.toLowerCase()] ?? sportColors.default
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <PageShell
      title="Teams"
      subtitle={`${displayed.length} approved team${displayed.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
      action={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Create Team'}
        </button>
      }
    >
      {success && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>
      )}

      {/* Create Team Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">Create New Team</h3>
          {!isAdmin && (
            <p className="text-sm text-muted" style={{ margin: '8px 0 0' }}>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Your team will be submitted for admin approval before it appears publicly.
            </p>
          )}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Team Name</label>
              <input className="form-input" value={teamName} onChange={e => setTeamName(e.target.value)} required placeholder="e.g. Thunder FC" />
            </div>
            <div className="form-group">
              <label className="form-label">Sport</label>
              <select className="form-input" value={sportId} onChange={e => setSportId(e.target.value)} required>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.sport_id} value={s.sport_id}>{s.sport_name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting…' : isAdmin ? 'Create Team' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin: Pending Approvals */}
      {isAdmin && pendingTeams.length > 0 && (
        <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warning-bg, #fffbeb)' }}>
            <Clock size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
              Pending Approval ({pendingTeams.length})
            </span>
          </div>
          <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Sport</th>
                  <th>Captain</th>
                  <th>Roll #</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeams.map(t => (
                  <tr key={t.team_id}>
                    <td className="fw-600">{t.team_name}</td>
                    <td>{t.sport_name}</td>
                    <td>{t.captain_name}</td>
                    <td className="text-muted text-sm">{t.captain_roll}</td>
                    <td className="text-sm">{fmtDate(t.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleApprove(t.team_id, 'approved')}
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}
                          onClick={() => handleApprove(t.team_id, 'rejected')}
                        >
                          <XCircle size={13} /> Reject
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

      {/* Search */}
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
        <div className="empty-state">No approved teams found.</div>
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
