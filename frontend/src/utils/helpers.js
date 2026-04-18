export const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

export const today = () => new Date().toISOString().split('T')[0]

export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export const CATEGORY_ICONS = {
  salon: '✂️', cleaning: '🧹', repair: '🔧', plumbing: '🚿', electrical: '⚡'
}

export const CATEGORY_COLORS = {
  salon: '#7C3AED', cleaning: '#0EA5E9', repair: '#F59E0B',
  plumbing: '#10B981', electrical: '#F97316'
}

export const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  completed: { bg: '#DBEAFE', text: '#1E40AF' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' }
}