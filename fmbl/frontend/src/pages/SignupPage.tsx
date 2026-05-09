import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { authApi, type MeUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function SignupPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [rollNumber, setRollNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const nuEmailRegex = /^[^\s@]+@[^\s@]+\.nu\.edu\.pk$/i

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!rollNumber || !firstName || !lastName || !normalizedEmail || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (!nuEmailRegex.test(normalizedEmail)) {
      setError('Only emails matching *@*.nu.edu.pk are allowed.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await authApi.register({
        roll_number: rollNumber.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: normalizedEmail,
        phone: phone.trim() || undefined,
        role: role,
        password,
      })
      const meUser: MeUser = {
        user_id: data.user_id,
        roll_number: data.roll_number,
        first_name: data.first_name,
        last_name: data.last_name,
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
      setError(msg || 'Registration failed. Please try again.')
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
          <p className="auth-brand-sub">Join the campus sports community.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="s-roll">Roll Number <span className="req">*</span></label>
              <input
                id="s-roll"
                className="form-input"
                type="text"
                placeholder="e.g. 21L-5001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="s-fname">First Name <span className="req">*</span></label>
                <input
                  id="s-fname"
                  className="form-input"
                  type="text"
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="s-lname">Last Name <span className="req">*</span></label>
                <input
                  id="s-lname"
                  className="form-input"
                  type="text"
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="s-role">Register As</label>
            <select 
              id="s-role" 
              className="form-input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="s-email">Email <span className="req">*</span></label>
            <input
              id="s-email"
              className="form-input"
              type="email"
              placeholder="you@lhr.nu.edu.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              pattern="^[^\s@]+@[^\s@]+\.nu\.edu\.pk$"
              title="Use an email like [rollnumber]@lhr.nu.edu.pk"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="s-phone">Phone (optional)</label>
            <input
              id="s-phone"
              className="form-input"
              type="tel"
              placeholder="+92 300 0000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="s-pass">Password <span className="req">*</span></label>
              <input
                id="s-pass"
                className="form-input"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-confirm">Confirm Password <span className="req">*</span></label>
              <input
                id="s-confirm"
                className="form-input"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-switch-btn">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
