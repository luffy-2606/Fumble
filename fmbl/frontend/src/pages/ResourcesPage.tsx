import { useEffect, useMemo, useState } from 'react'
import { Building2, Trophy, Package, MapPin, Users, Boxes } from 'lucide-react'
import PageShell from '../components/PageShell'
import { itemsApi, sportsApi, venuesApi, type Item, type Sport, type Venue } from '../services/api'
import './ResourcesPage.css'

type Tab = 'all' | 'sports' | 'venues' | 'equipment'

export default function ResourcesPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([sportsApi.list(), venuesApi.list(), itemsApi.list()])
      .then(([sportsData, venuesData, itemsData]) => {
        setSports(sportsData)
        setVenues(venuesData)
        setItems(itemsData)
      })
      .catch(() => setError('Failed to load resource data.'))
      .finally(() => setLoading(false))
  }, [])

  const query = search.trim().toLowerCase()

  const filteredSports = useMemo(
    () =>
      sports.filter(
        (s) =>
          !query ||
          s.sport_name.toLowerCase().includes(query) ||
          String(s.max_team_size).includes(query)
      ),
    [sports, query]
  )

  const filteredVenues = useMemo(
    () =>
      venues.filter(
        (v) =>
          !query ||
          v.venue_name.toLowerCase().includes(query) ||
          v.location?.toLowerCase().includes(query) ||
          v.sport_name?.toLowerCase().includes(query)
      ),
    [venues, query]
  )

  const filteredItems = useMemo(
    () =>
      items.filter(
        (i) =>
          !query ||
          i.item_name.toLowerCase().includes(query) ||
          i.sport_name?.toLowerCase().includes(query) ||
          i.condition?.toLowerCase().includes(query)
      ),
    [items, query]
  )

  const totalAvailable = items.reduce((sum, i) => sum + (i.available_qty || 0), 0)
  const totalStock = items.reduce((sum, i) => sum + (i.total_qty || 0), 0)

  return (
    <PageShell
      title="Resources"
      subtitle="Unified management for sports, venues, and equipment"
      loading={loading}
      error={error}
      action={
        <div className="resources-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setTab('sports')}>Sports</button>
          <button className="btn btn-outline btn-sm" onClick={() => setTab('venues')}>Venues</button>
          <button className="btn btn-primary btn-sm" onClick={() => setTab('equipment')}>Equipment</button>
        </div>
      }
    >
      <div className="resources-top-grid">
        <div className="resource-stat card">
          <div className="resource-stat-icon"><Trophy size={18} /></div>
          <div className="resource-stat-value">{sports.length}</div>
          <div className="resource-stat-label">Sports</div>
        </div>
        <div className="resource-stat card">
          <div className="resource-stat-icon"><Building2 size={18} /></div>
          <div className="resource-stat-value">{venues.length}</div>
          <div className="resource-stat-label">Venues</div>
        </div>
        <div className="resource-stat card">
          <div className="resource-stat-icon"><Package size={18} /></div>
          <div className="resource-stat-value">{items.length}</div>
          <div className="resource-stat-label">Equipment Types</div>
        </div>
        <div className="resource-stat card">
          <div className="resource-stat-icon"><Boxes size={18} /></div>
          <div className="resource-stat-value">{totalAvailable} / {totalStock}</div>
          <div className="resource-stat-label">Available Stock</div>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
        <button className={`filter-btn ${tab === 'sports' ? 'active' : ''}`} onClick={() => setTab('sports')}>Sports</button>
        <button className={`filter-btn ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>Venues</button>
        <button className={`filter-btn ${tab === 'equipment' ? 'active' : ''}`} onClick={() => setTab('equipment')}>Equipment</button>
        <input
          className="form-input resources-search"
          placeholder="Search across resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {(tab === 'all' || tab === 'sports') && (
        <section className="resources-section">
          <h2 className="section-title">Sports</h2>
          {filteredSports.length === 0 ? (
            <div className="empty-state">No sports found.</div>
          ) : (
            <div className="card-grid">
              {filteredSports.map((s) => (
                <div key={s.sport_id} className="card resource-card">
                  <div className="resource-card-head">
                    <span className="resource-badge"><Trophy size={14} /> Sport</span>
                  </div>
                  <h3 className="resource-card-title">{s.sport_name}</h3>
                  <p className="resource-card-sub">Max team size: {s.max_team_size}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(tab === 'all' || tab === 'venues') && (
        <section className="resources-section">
          <h2 className="section-title">Venues</h2>
          {filteredVenues.length === 0 ? (
            <div className="empty-state">No venues found.</div>
          ) : (
            <div className="card-grid">
              {filteredVenues.map((v) => (
                <div key={v.venue_id} className="card resource-card">
                  <div className="resource-card-head">
                    <span className="resource-badge"><MapPin size={14} /> Venue</span>
                    <span className={`badge ${v.is_available ? 'badge-green' : 'badge-gray'}`}>
                      {v.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <h3 className="resource-card-title">{v.venue_name}</h3>
                  <p className="resource-card-sub">{v.location || 'No location'} • {v.sport_name}</p>
                  <p className="resource-card-sub"><Users size={12} /> Capacity: {v.capacity ?? 0}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(tab === 'all' || tab === 'equipment') && (
        <section className="resources-section">
          <h2 className="section-title">Equipment</h2>
          {filteredItems.length === 0 ? (
            <div className="empty-state">No equipment found.</div>
          ) : (
            <div className="card-grid">
              {filteredItems.map((i) => (
                <div key={i.item_id} className="card resource-card">
                  <div className="resource-card-head">
                    <span className="resource-badge"><Package size={14} /> Equipment</span>
                    <span className="badge badge-blue">{i.condition || 'Unknown'}</span>
                  </div>
                  <h3 className="resource-card-title">{i.item_name}</h3>
                  <p className="resource-card-sub">{i.sport_name || 'Unassigned sport'}</p>
                  <p className="resource-card-sub">Stock: {i.available_qty} / {i.total_qty}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  )
}
