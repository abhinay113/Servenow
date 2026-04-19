import { fmt, formatDate, formatTime, STATUS_COLORS } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { CalendarIcon, MapPinIcon, CurrencyRupeeIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function AdminBookingTable({ bookings, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const update = async (id, status) => {
    setLoadingId(id)
    try {
      await api.patch(`/bookings/${id}`, { status })
      toast.success(`Booking ${status === 'completed' ? '✅ Completed' : '❌ Cancelled'}`, {
        style: { background: '#10B981', color: '#fff', borderRadius: '12px' },
        iconTheme: { primary: '#fff', secondary: '#10B981' }
      })
      onUpdate()
    } catch {
      toast.error('Failed to update booking', {
        style: { background: '#EF4444', color: '#fff', borderRadius: '12px' }
      })
    } finally {
      setLoadingId(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.userId?.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!bookings.length) return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <svg className="w-24 h-24 text-slate-300 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-slate-400 text-lg font-medium mt-6">No bookings yet</p>
      <p className="text-slate-300 text-sm mt-1">New bookings will appear here</p>
    </div>
  )

  return (
    <div className="booking-table-container">
      {/* Filters Bar */}
      <div className="booking-filters">
        <div className="filter-row">
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, service or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="status-filters">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`status-btn ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="booking-stats">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: CalendarIcon, color: 'from-blue-500 to-cyan-500' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: ClockIcon, color: 'from-orange-500 to-red-500' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircleIcon, color: 'from-green-500 to-emerald-500' },
          { label: 'Revenue', value: `₹${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'from-purple-500 to-pink-500' }
        ].map((stat, idx) => (
          <div key={idx} className="booking-stat-card" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="stat-icon-wrapper">
              <stat.icon className="stat-icon" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="booking-table-wrapper">
        <div className="booking-table-scroll">
          <table className="booking-table">
            <thead>
              <tr className="booking-table-header">
                {['Customer', 'Service', 'Date & Time', 'Address', 'Amount', 'Status', 'Actions'].map((h, idx) => (
                  <th key={idx} className="booking-table-th">
                    <span className="table-header-text">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="booking-table-body">
              {filteredBookings.map((b, idx) => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending
                return (
                  <tr
                    key={b._id}
                    className="booking-table-row"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="booking-table-td">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {b.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="customer-details">
                          <p className="customer-name">{b.userId?.name || 'N/A'}</p>
                          <p className="customer-phone">{b.userId?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="booking-table-td">
                      <div className="service-info">
                        <div className="service-icon-small">
                          <svg className="service-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="service-name">{b.serviceId?.name}</span>
                      </div>
                    </td>
                    <td className="booking-table-td">
                      <div className="datetime-info">
                        <p className="date-text">
                          <CalendarIcon className="datetime-icon" />
                          {b.date}
                        </p>
                        <p className="time-text">
                          <ClockIcon className="datetime-icon" />
                          {b.timeSlot}
                        </p>
                      </div>
                    </td>
                    <td className="booking-table-td">
                      <div className="address-info">
                        <MapPinIcon className="address-icon" />
                        <p className="address-text" title={b.address}>
                          {b.address}
                        </p>
                      </div>
                    </td>
                    <td className="booking-table-td">
                      <p className="amount-text">
                        <CurrencyRupeeIcon className="amount-icon" />
                        {b.totalAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="booking-table-td">
                      <span
                        className="status-badge"
                        style={{ background: sc.bg + '20', color: sc.text, border: `1px solid ${sc.text}30` }}
                      >
                        <span className="status-dot" style={{ background: sc.text }}></span>
                        {b.status}
                      </span>
                    </td>
                    <td className="booking-table-td">
                      <div className="action-buttons">
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => update(b._id, 'completed')}
                            disabled={loadingId === b._id}
                            className="action-btn complete-btn"
                          >
                            {loadingId === b._id ? (
                              <div className="btn-spinner"></div>
                            ) : (
                              <>
                                <span>Complete</span>
                              </>
                            )}
                          </button>
                        )}
                        {!['cancelled', 'completed'].includes(b.status) && (
                          <button
                            onClick={() => update(b._id, 'cancelled')}
                            disabled={loadingId === b._id}
                            className="action-btn cancel-btn"
                          >
                            {loadingId === b._id ? (
                              <div className="btn-spinner"></div>
                            ) : (
                              <>
                                <span>Cancel</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="booking-table-footer">
          <div className="footer-info">
            <p>Showing {filteredBookings.length} of {bookings.length} bookings</p>
            <div className="pagination">
              <button className="pagination-btn">Previous</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">Next</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-table-container {
          animation: fadeIn 0.3s ease-out;
        }

        /* Filters */
        .booking-filters {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

        .filter-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 1rem 0.5rem 2.25rem;
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

        .status-filters {
          display: flex;
          gap: 0.5rem;
        }

        .status-btn {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: capitalize;
        }

        .status-btn:hover {
          background: #e2e8f0;
          color: #667eea;
        }

        .status-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Stats */
        .booking-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .booking-stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

        .booking-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: #e2e8f0;
        }

        .stat-icon-wrapper {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: white;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        /* Table */
        .booking-table-wrapper {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

        .booking-table-scroll {
          overflow-x: auto;
        }

        .booking-table {
          width: 100%;
          border-collapse: collapse;
        }

        .booking-table-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
        }

        .booking-table-th {
          padding: 1rem;
          text-align: left;
        }

        .table-header-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .booking-table-body {
          background: white;
        }

        .booking-table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }

        .booking-table-row:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%);
        }

        .booking-table-td {
          padding: 1rem;
          vertical-align: top;
        }

        /* Customer Info */
        .customer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .customer-avatar {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .customer-details {
          min-width: 0;
        }

        .customer-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.125rem;
        }

        .customer-phone {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Service Info */
        .service-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .service-icon-small {
          width: 1.75rem;
          height: 1.75rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .service-svg {
          width: 0.875rem;
          height: 0.875rem;
          color: #64748b;
        }

        .service-name {
          font-weight: 500;
          color: #1e293b;
        }

        /* DateTime Info */
        .datetime-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-text, .time-text {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
        }

        .date-text {
          color: #1e293b;
          font-weight: 500;
        }

        .time-text {
          color: #64748b;
        }

        .datetime-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: #94a3b8;
        }

        /* Address Info */
        .address-info {
          display: flex;
          align-items: flex-start;
          gap: 0.375rem;
          max-width: 180px;
        }

        .address-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: #94a3b8;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .address-text {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Amount */
        .amount-text {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: bold;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .amount-icon {
          width: 1rem;
          height: 1rem;
          color: #667eea;
        }

        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }

        .status-dot {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .complete-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .complete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .cancel-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .cancel-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Footer */
        .booking-table-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 1rem;
        }

        .footer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-info p {
          font-size: 0.875rem;
          color: #64748b;
        }

        .pagination {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-btn {
          padding: 0.375rem 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .pagination-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrapper {
            min-width: auto;
          }

          .status-filters {
            justify-content: center;
          }

          .booking-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .booking-table-th,
          .booking-table-td {
            padding: 0.75rem 0.5rem;
          }

          .customer-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .datetime-info {
            flex-direction: row;
            gap: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .footer-info {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .pagination {
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .booking-table-th:nth-child(4),
          .booking-table-td:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}