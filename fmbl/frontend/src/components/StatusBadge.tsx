interface Props { status: string }

const MAP: Record<string, string> = {
  ongoing:          'badge badge-blue',
  active:           'badge badge-blue',
  scheduled:        'badge badge-blue',
  approved:         'badge badge-green',
  confirmed:        'badge badge-green',
  returned:         'badge badge-green',
  available:        'badge badge-green',
  upcoming:         'badge badge-yellow',
  pending:          'badge badge-yellow',
  proposed:         'badge badge-yellow',
  pending_approval: 'badge badge-yellow',
  issued:           'badge badge-yellow',
  completed:        'badge badge-gray',
  cancelled:        'badge badge-gray',
  rejected:         'badge badge-red',
  overdue:          'badge badge-red',
  unavailable:      'badge badge-red',
}

const LABEL: Record<string, string> = {
  pending_approval: 'Pending',
  proposed:         'Proposed',
}

export default function StatusBadge({ status }: Props) {
  const cls = MAP[status?.toLowerCase()] ?? 'badge badge-gray'
  const label = LABEL[status?.toLowerCase()] ?? status
  return <span className={cls}>{label}</span>
}

