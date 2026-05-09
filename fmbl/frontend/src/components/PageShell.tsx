import type { ReactNode } from 'react'
import './PageShell.css'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  loading?: boolean
  error?: string
}

export default function PageShell({ title, subtitle, action, children, loading, error }: Props) {
  return (
    <div className="page-shell page-wrapper">
      <div className="container">
        <div className="ps-header">
          <div>
            <h1 className="ps-title">{title}</h1>
            {subtitle && <p className="ps-sub">{subtitle}</p>}
          </div>
          {action && <div className="ps-action">{action}</div>}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div className="ps-loading">
            <div className="spinner" />
            <span>Loading…</span>
          </div>
        ) : children}
      </div>
    </div>
  )
}
