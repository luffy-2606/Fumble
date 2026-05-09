import { useEffect, useState } from 'react'
import { playersApi, sportsApi, type Player, type Sport } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, X } from 'lucide-react'
import PageShell from '../components/PageShell'

const SKILLS = ['all', 'beginner', 'intermediate', 'advanced', 'professional']

export default function PlayersPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Player[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [skill, setSkill] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form State
  const [showForm, setShowForm] = useState(false)
  const [sportId, setSportId] = useState('')
  const [skillLevel, setSkillLevel] = useState('beginner')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadPlayers = () => {
    setLoading(true)
    playersApi.list()
      .then(setData)
      .catch(() => setError('Failed to load players.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlayers()
    sportsApi.list().then(setSports).catch(() => {})
  }, [])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !sportId) return
    setSubmitting(true)
    setError('')
    try {
      await playersApi.create({
        user_id: user.user_id,
        sport_id: parseInt(sportId),
        skill_level: skillLevel,
        position,
        bio
      })
      setShowForm(false)
      setSportId('')
      setSkillLevel('beginner')
      setPosition('')
      setBio('')
      loadPlayers()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create profile. You may already have a profile for this sport.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = data
    .filter(p => skill === 'all' || p.skill_level?.toLowerCase() === skill)
    .filter(p =>
      !search ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      p.sport_name?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <PageShell
      title="Players"
      subtitle={`${displayed.length} player${displayed.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
      action={user?.role === 'student' && (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Become a Player'}
        </button>
      )}
    >
      {/* Create Profile Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Create Player Profile</h3>
          <form className="auth-form" onSubmit={handleCreateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Sport</label>
              <select className="form-input" value={sportId} onChange={e => setSportId(e.target.value)} required>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.sport_id} value={s.sport_id}>{s.sport_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <select className="form-input" value={skillLevel} onChange={e => setSkillLevel(e.target.value)} required>
                {SKILLS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Position (Optional)</label>
              <input className="form-input" type="text" placeholder="e.g. Goalkeeper, Forward" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio (Optional)</label>
              <input className="form-input" type="text" placeholder="Short bio..." value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ flex: '1 1 220px', maxWidth: 300 }}
          placeholder="Search by name, roll no, sport…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-bar" style={{ margin: 0 }}>
          {SKILLS.map(s => (
            <button key={s} className={`filter-btn${skill === s ? ' active' : ''}`} onClick={() => setSkill(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">No players match your search.</div>
      ) : (
        <div className="card-grid">
          {displayed.map(p => (
            <div key={p.profile_id} className="player-card card">
              <div className="player-avatar">{`${p.first_name} ${p.last_name}`.charAt(0).toUpperCase()}</div>
              <div className="player-info">
                <div className="fw-700" style={{ color: 'var(--gray-900)' }}>{`${p.first_name} ${p.last_name}`}</div>
                <div className="text-sm text-muted">{p.roll_number}</div>
                {p.position && <div className="text-sm" style={{ color: 'var(--gray-600)' }}>{p.position}</div>}
                <div className="player-tags">
                  <span className="badge badge-blue">{p.sport_name}</span>
                  <span className="badge badge-yellow">{p.skill_level}</span>
                  <span className={`badge ${p.is_available ? 'badge-green' : 'badge-gray'}`}>
                    {p.is_available ? '✓ Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
