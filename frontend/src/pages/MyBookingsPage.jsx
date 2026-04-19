import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { fmt, formatTime, STATUS_COLORS, CATEGORY_ICONS } from '../utils/helpers'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) { 
      navigate('/login')
      return 
    }
    setLoading(true)
    api.get(`/bookings/user/${user._id}`)
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'all' 
    ? bookings.filter(b => b.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : bookings.filter(b => b.status === filter && b.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusCount = (status) => {
    if (status === 'all') return bookings.length
    return bookings.filter(b => b.status === status).length
  }

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <p>Loading your bookings...</p>
        </div>
        <style>{`
          .bookings-loading {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            text-align: center;
          }
          .spinner-ring {
            width: 3rem;
            height: 3rem;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Track and manage all your service bookings</p>
          </div>
          <button onClick={() => navigate('/services')} className="book-new-btn">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book New Service
          </button>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card-mini">
            <span className="stat-emoji">📋</span>
            <div>
              <div className="stat-number">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card-mini">
            <span className="stat-emoji">✅</span>
            <div>
              <div className="stat-number">{bookings.filter(b => b.status === 'completed').length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card-mini">
            <span className="stat-emoji">🕐</span>
            <div>
              <div className="stat-number">{bookings.filter(b => b.status === 'confirmed').length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          <div className="stat-card-mini">
            <span className="stat-emoji">💰</span>
            <div>
              <div className="stat-number">{fmt(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="filter-section">
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by service name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">✕</button>
            )}
          </div>

          <div className="filter-buttons">
            {['all', 'confirmed', 'completed', 'cancelled', 'pending'].map(status => {
              const count = getStatusCount(status)
              const isActive = filter === status
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`filter-chip ${isActive ? 'active' : ''}`}
                >
                  <span className="chip-label">
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="chip-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-animation">📭</div>
            <h3 className="empty-title">No bookings found</h3>
            <p className="empty-text">
              {searchTerm 
                ? `No results found for "${searchTerm}"` 
                : "You haven't made any bookings yet"}
            </p>
            <button onClick={() => navigate('/services')} className="empty-btn">
              Browse Services
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking, idx) => {
              const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.pending
              const icon = CATEGORY_ICONS[booking.serviceId?.category] || '🔨'
              
              return (
                <div key={booking._id} className="booking-card" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="booking-card-inner">
                    {/* Left Section - Icon */}
                    <div className="booking-icon" style={{ background: `${sc.text}15` }}>
                      <span className="icon-emoji">{icon}</span>
                    </div>

                    {/* Middle Section - Details */}
                    <div className="booking-details">
                      <div className="booking-header">
                        <h3 className="booking-title">{booking.serviceId?.name}</h3>
                        <span className="booking-status" style={{ background: sc.bg, color: sc.text }}>
                          <span className="status-dot" style={{ background: sc.text }}></span>
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-info">
                        <div className="info-item">
                          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{booking.date}</span>
                        </div>
                        <div className="info-item">
                          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(booking.timeSlot)}</span>
                        </div>
                        <div className="info-item">
                          <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{booking.address}, {booking.city} - {booking.pincode}</span>
                        </div>
                      </div>

                      <div className="booking-footer">
                        <span className="booking-id">ID: #{booking._id.slice(-8).toUpperCase()}</span>
                        <div className="booking-price">
                          <span className="price-label">Total</span>
                          <span className="price-value">{fmt(booking.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="booking-actions">
                      {booking.status === 'confirmed' && (
                        <button 
                          className="action-btn support"
                          onClick={() => window.location.href = `tel:+919876543210`}
                        >
                          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      )}
                      <button 
                        className="action-btn view"
                        onClick={() => navigate('/confirmation', { state: { booking } })}
                      >
                        <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .bookings-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
        }

        .bookings-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.875rem;
        }

        .book-new-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .book-new-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          gap: 0.75rem;
        }

        /* Stats Summary */
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card-mini {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .stat-card-mini:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-emoji {
          font-size: 2rem;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Filter Section */
        .filter-section {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .search-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-chip:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }

        .filter-chip.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .chip-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 1rem;
          font-size: 0.75rem;
        }

        .filter-chip.active .chip-count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Bookings List */
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .booking-card {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .booking-card-inner {
          display: flex;
          gap: 1rem;
          background: white;
          border-radius: 1.5rem;
          padding: 1.25rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

        .booking-card-inner:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }

        /* Booking Icon */
        .booking-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-emoji {
          font-size: 2rem;
        }

        /* Booking Details */
        .booking-details {
          flex: 1;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .booking-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .booking-status {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .booking-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .info-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #94a3b8;
        }

        .booking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .booking-id {
          font-size: 0.75rem;
          font-family: monospace;
          color: #94a3b8;
        }

        .booking-price {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
        }

        .price-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .price-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        /* Booking Actions */
        .booking-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.support {
          background: #fef3c7;
          color: #d97706;
        }

        .action-btn.support:hover {
          background: #fde68a;
          transform: scale(1.05);
        }

        .action-btn.view {
          background: #e0e7ff;
          color: #667eea;
        }

        .action-btn.view:hover {
          background: #c7d2fe;
          transform: scale(1.05);
        }

        .action-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        .empty-animation {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .empty-btn:hover {
          gap: 0.75rem;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .booking-card-inner {
            flex-direction: column;
          }

          .booking-icon {
            width: 3rem;
            height: 3rem;
          }

          .icon-emoji {
            font-size: 1.5rem;
          }

          .booking-actions {
            flex-direction: row;
            justify-content: flex-end;
          }

          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .book-new-btn {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .booking-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .booking-info {
            flex-direction: column;
            gap: 0.5rem;
          }

          .filter-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}