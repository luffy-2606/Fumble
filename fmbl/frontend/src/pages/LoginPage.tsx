import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { authApi, type MeUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!rollNumber.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await authApi.login({ roll_number: rollNumber.trim(), password })
      const meUser: MeUser = {
        user_id: data.user_id,
        roll_number: data.roll_number,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
      }
      login(data.token, meUser)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
            (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      <div className="auth-card card">
        <div className="auth-brand">
          <Link to="/" className="auth-brand-link">
            <Trophy size={24} color="#1565c0" />
            <span className="brand-text" style={{ fontSize: '1.4rem' }}>Fumble</span>
          </Link>
          <p className="auth-brand-sub">Welcome back! Log in to continue.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="roll">Roll Number</label>
            <input
              id="roll"
              className="form-input"
              type="text"
              placeholder="e.g. 21L-5001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <p className="auth-switch">
            Don't have an account? <Link to="/signup" className="auth-switch-btn">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
