interface Props { status: string }

const MAP: Record<string, string> = {
  ongoing: 'badge badge-blue',
  active: 'badge badge-blue',
  confirmed: 'badge badge-green',
  returned: 'badge badge-green',
  available: 'badge badge-green',
  upcoming: 'badge badge-yellow',
  pending: 'badge badge-yellow',
  issued: 'badge badge-yellow',
  completed: 'badge badge-gray',
  cancelled: 'badge badge-gray',
  overdue: 'badge badge-red',
  unavailable: 'badge badge-red',
}

export default function StatusBadge({ status }: Props) {
  const cls = MAP[status?.toLowerCase()] ?? 'badge badge-gray'
  return <span className={cls}>{status}</span>
}
