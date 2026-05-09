import { Link } from 'react-router-dom'
import { Trophy, Users, Calendar, MapPin, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './HomePage.css'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-blob hero-blob-1" />
        <div className="hero-bg-blob hero-blob-2" />
        <div className="container hero-content">
          <div className="hero-badge">
            <Trophy size={14} />
            <span>University Sports Platform</span>
          </div>
          <h1 className="hero-title">
            Your Campus.<br />
            <span className="hero-title-accent">Your Game.</span>
          </h1>
          <p className="hero-subtitle">
            Fumble brings together FAST-NUCES athletes, teams, and tournaments in one streamlined platform.
            Track matches, discover players, and compete at the next level.
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-section container">
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}>
              <Trophy size={22} color="var(--primary)" />
            </div>
            <div>
              <div className="stat-value">Active Tournaments</div>
              <div className="stat-label">Track every bracket</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#fce4ec' }}>
              <Users size={22} color="#e91e63" />
            </div>
            <div>
              <div className="stat-value">Player Profiles</div>
              <div className="stat-label">Find teammates &amp; rivals</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}>
              <Calendar size={22} color="#388e3c" />
            </div>
            <div>
              <div className="stat-value">Live Match Schedule</div>
              <div className="stat-label">Never miss a game</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}>
              <MapPin size={22} color="#f57c00" />
            </div>
            <div>
              <div className="stat-value">Court Bookings</div>
              <div className="stat-label">Reserve your spot</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section container">
        <h2 className="section-heading">Everything you need to compete</h2>
        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon">
              <Trophy size={28} color="var(--primary)" />
            </div>
            <h3>Tournaments</h3>
            <p>Browse ongoing and upcoming university tournaments. Stay updated on brackets, fixtures, and results.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">
              <Users size={28} color="#e91e63" />
            </div>
            <h3>Teams &amp; Players</h3>
            <p>Discover student athletes, form teams, and build your roster for the season ahead.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">
              <Calendar size={28} color="#388e3c" />
            </div>
            <h3>Match Schedule</h3>
            <p>View upcoming matches, scores, and standings - all in real time.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">
              <Shield size={28} color="#f57c00" />
            </div>
            <h3>Secure & Fast</h3>
            <p>JWT-authenticated accounts secured to your university roll number. Your data, protected.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section className="cta-section container">
          <div className="cta-card">
            <div className="cta-bg-blob" />
            <h2 className="cta-title">Ready to play?</h2>
            <p className="cta-sub">Create a free account with your FAST roll number and join the action today.</p>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
              Create Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <p>© 2026 Fumble | FAST-NUCES Sports Platform</p>
      </footer>
    </div>
  )
}
