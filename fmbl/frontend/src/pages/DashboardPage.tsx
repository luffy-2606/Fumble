import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Calendar, User, Users, MapPin, Package, ClipboardList, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  tournamentsApi, matchesApi, playersApi, teamsApi,
  courtsApi, itemsApi, issuanceApi,
  type Tournament, type Match, type Player, type Team, type Booking, type Item, type Issuance
} from '../services/api'
import StatusBadge from '../components/StatusBadge'
import './DashboardPage.css'

interface SummaryCard { label: string; value: number; icon: React.ReactNode; color: string; bg: string; to: string }

export default function DashboardPage() {
  const { user } = useAuth()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [matches, setMatches]         = useState<Match[]>([])
  const [players, setPlayers]         = useState<Player[]>([])
  const [teams, setTeams]             = useState<Team[]>([])
  const [bookings, setBookings]       = useState<Booking[]>([])
  const [items, setItems]             = useState<Item[]>([])
  const [issuances, setIssuances]     = useState<Issuance[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      tournamentsApi.list(), matchesApi.list(), playersApi.list(), teamsApi.list(),
      courtsApi.list(), itemsApi.list(), issuanceApi.list(),
    ]).then(([t, m, p, tm, b, it, is]) => {
      setTournaments(t); setMatches(m); setPlayers(p); setTeams(tm)
      setBookings(b); setItems(it); setIssuances(is)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const ongoingTournaments = tournaments.filter(t => t.status?.toLowerCase() === 'ongoing')
  const upcomingMatches    = matches.filter(m => m.status?.toLowerCase() === 'upcoming').slice(0, 5)
  const overdueIssuances   = issuances.filter(i => i.status !== 'returned' && new Date(i.due_date) < new Date())
  const lowStockItems      = items.filter(i => i.available_qty === 0 || (i.total_qty > 0 && i.available_qty / i.total_qty <= 0.25))
  const pendingBookings    = bookings.filter(b => b.status?.toLowerCase() === 'pending')

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })

  const summaryCards: SummaryCard[] = [
    { label: 'Tournaments', value: tournaments.length, icon: <Trophy size={20} />, color: '#1565c0', bg: '#e3f2fd', to: '/tournaments' },
    { label: 'Matches',     value: matches.length,     icon: <Calendar size={20} />, color: '#c62828', bg: '#ffebee', to: '/matches' },
    { label: 'Players',     value: players.length,     icon: <User size={20} />,     color: '#2e7d32', bg: '#e8f5e9', to: '/players' },
    { label: 'Teams',       value: teams.length,       icon: <Users size={20} />,    color: '#e65100', bg: '#fff3e0', to: '/teams' },
    { label: 'Bookings',    value: bookings.length,    icon: <MapPin size={20} />,   color: '#6a1b9a', bg: '#f3e5f5', to: '/courts' },
    { label: 'Equipment',   value: items.length,       icon: <Package size={20} />,  color: '#00695c', bg: '#e0f2f1', to: '/resources' },
    { label: 'Issuances',   value: issuances.length,   icon: <ClipboardList size={20} />, color: '#f57f17', bg: '#fffde7', to: '/issuance' },
  ]

  return (
    <div className="dash-page page-wrapper">
      <div className="container">

        {/* Welcome Banner */}
        <div className="dash-banner">
          <div className="dash-banner-blob" />
          <div>
            <p className="dash-banner-greeting">Good {greeting()},</p>
            <h1 className="dash-banner-name">{`${user?.first_name} ${user?.last_name}`}</h1>
            <p className="dash-banner-meta">{user?.roll_number} · <span className="dash-role-tag">{user?.role}</span></p>
          </div>
          <div className="dash-banner-icon"><TrendingUp size={48} strokeWidth={1.2} /></div>
        </div>

        {/* Summary cards */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="dash-summary-grid">
              {summaryCards.map(c => (
                <Link key={c.label} to={c.to} className="dash-summary-card card">
                  <div className="dash-sc-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                  <div className="dash-sc-num" style={{ color: c.color }}>{c.value}</div>
                  <div className="dash-sc-label">{c.label}</div>
                  <ChevronRight size={14} className="dash-sc-arrow" style={{ color: c.color }} />
                </Link>
              ))}
            </div>

            {/* Alerts row */}
            {(overdueIssuances.length > 0 || lowStockItems.length > 0 || pendingBookings.length > 0) && (
              <div className="dash-alerts">
                {overdueIssuances.length > 0 && (
                  <Link to="/issuance" className="dash-alert dash-alert-red">
                    <ClipboardList size={16} />
                    <span><strong>{overdueIssuances.length}</strong> overdue issuance{overdueIssuances.length !== 1 ? 's' : ''} need returns</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                )}
                {lowStockItems.length > 0 && (
                  <Link to="/resources" className="dash-alert dash-alert-yellow">
                    <Package size={16} />
                    <span><strong>{lowStockItems.length}</strong> item{lowStockItems.length !== 1 ? 's' : ''} low or out of stock</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                )}
                {pendingBookings.length > 0 && (
                  <Link to="/courts" className="dash-alert dash-alert-blue">
                    <MapPin size={16} />
                    <span><strong>{pendingBookings.length}</strong> court booking{pendingBookings.length !== 1 ? 's' : ''} pending approval</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                )}
              </div>
            )}

            <div className="dash-two-col">
              {/* Ongoing tournaments */}
              <div className="card dash-panel">
                <div className="dash-panel-header">
                  <h2 className="section-title"><Trophy size={16} />Ongoing Tournaments</h2>
                  <Link to="/tournaments" className="dash-panel-link">View all →</Link>
                </div>
                {ongoingTournaments.length === 0 ? (
                  <p className="dash-panel-empty">No tournaments currently ongoing.</p>
                ) : (
                  <ul className="dash-list">
                    {ongoingTournaments.map(t => (
                      <li key={t.tournament_id} className="dash-list-item">
                        <div>
                          <div className="fw-600">{t.name}</div>
                          <div className="text-sm text-muted">{t.sport_name} · {t.venue_name}</div>
                        </div>
                        <StatusBadge status={t.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Upcoming matches */}
              <div className="card dash-panel">
                <div className="dash-panel-header">
                  <h2 className="section-title"><Calendar size={16} />Upcoming Matches</h2>
                  <Link to="/matches" className="dash-panel-link">View all →</Link>
                </div>
                {upcomingMatches.length === 0 ? (
                  <p className="dash-panel-empty">No upcoming matches scheduled.</p>
                ) : (
                  <ul className="dash-list">
                    {upcomingMatches.map(m => (
                      <li key={m.match_id} className="dash-list-item">
                        <div>
                          <div className="fw-600">{m.team_a} <span className="text-muted">vs</span> {m.team_b}</div>
                          <div className="text-sm text-muted">{m.tournament_name}</div>
                        </div>
                        <span className="text-sm text-muted">{fmtDate(m.match_date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent issuances */}
            <div className="card dash-panel">
              <div className="dash-panel-header">
                <h2 className="section-title"><ClipboardList size={16} />Recent Issuances</h2>
                <Link to="/issuance" className="dash-panel-link">View all →</Link>
              </div>
              {issuances.length === 0 ? (
                <p className="dash-panel-empty">No issuance records yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Player</th><th>Roll #</th><th>Item</th><th>Qty</th><th>Due Date</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuances.slice(0, 6).map(is => {
                        const overdue = is.status !== 'returned' && new Date(is.due_date) < new Date()
                        return (
                          <tr key={is.issuance_id} className={overdue ? 'row-overdue' : ''}>
                            <td className="fw-600">{is.full_name}</td>
                            <td className="text-sm text-muted">{is.roll_number}</td>
                            <td>{is.item_name}</td>
                            <td>{is.quantity}</td>
                            <td className={`text-sm ${overdue ? 'text-error fw-600' : ''}`}>{fmtDate(is.due_date)}</td>
                            <td><StatusBadge status={overdue ? 'overdue' : is.status} /></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
