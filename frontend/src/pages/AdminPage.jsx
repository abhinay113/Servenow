import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { fmt } from '../utils/helpers'
import AdminBookingTable from '../components/AdminBookingTable'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    duration: 60, 
    category: 'cleaning' 
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (!user || user.role !== 'admin') { 
      navigate('/')
      return 
    }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [b, s, svc] = await Promise.all([
        api.get('/bookings'),
        api.get('/admin/stats'),
        api.get('/services')
      ])
      setBookings(b.data)
      setStats(s.data)
      setServices(svc.data)
      
      // Generate recent activity
      const recent = b.data.slice(0, 5).map(booking => ({
        id: booking._id,
        action: `New booking from ${booking.userId?.name || 'Customer'}`,
        time: new Date(booking.createdAt).toLocaleTimeString(),
        status: booking.status,
        amount: booking.totalAmount
      }))
      setRecentActivity(recent)
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const addService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await api.post('/services', newService)
      toast.success('Service added successfully')
      setShowAddService(false)
      setNewService({ name: '', description: '', price: '', duration: 60, category: 'cleaning' })
      fetchAll()
    } catch {
      toast.error('Failed to add service')
    }
  }

  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}`)
        toast.success('Service deleted')
        fetchAll()
      } catch {
        toast.error('Failed to delete service')
      }
    }
  }

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings || 0, icon: '📋', color: 'from-blue-500 to-cyan-500', change: '+12%', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: stats.confirmed || 0, icon: '✅', color: 'from-green-500 to-emerald-500', change: '+8%', bg: 'bg-green-50' },
    { label: 'Revenue', value: fmt(stats.revenue || 0), icon: '💰', color: 'from-purple-500 to-pink-500', change: '+23%', bg: 'bg-purple-50' },
    { label: 'Active Services', value: stats.activeServices || services.length, icon: '🛠', color: 'from-orange-500 to-red-500', change: '+5%', bg: 'bg-orange-50' },
  ]

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <p className="loading-text">Loading admin dashboard...</p>
        </div>
        <style>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
          .loading-text {
            color: #64748b;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage bookings, services, and monitor platform activity</p>
          </div>
          <div className="admin-badge">
            <span className="badge-dot"></span>
            Admin Access
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`stat-icon-wrapper ${stat.bg}`}>
                <span className="stat-icon">{stat.icon}</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change positive">
                  <svg className="trend-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            All Bookings
            <span className="tab-count">{bookings.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Manage Services
            <span className="tab-count">{services.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <AdminBookingTable bookings={bookings} onUpdate={fetchAll} />
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="tab-content">
            <div className="content-header">
              <h2 className="content-title">Service Management</h2>
              <button onClick={() => setShowAddService(true)} className="add-service-btn">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Service
              </button>
            </div>

            <div className="services-grid-admin">
              {services.map((service, idx) => (
                <div key={service._id} className="service-card-admin" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="service-icon">
                    {service.category === 'salon' ? '💇' : 
                     service.category === 'cleaning' ? '🧹' : 
                     service.category === 'repair' ? '🔧' :
                     service.category === 'plumbing' ? '🚰' : '⚡'}
                  </div>
                  <div className="service-info">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-desc">{service.description?.slice(0, 60)}...</p>
                    <div className="service-meta">
                      <span className="service-price">{fmt(service.price)}</span>
                      <span className="service-duration">⏱ {service.duration} min</span>
                      <span className="service-category">{service.category}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteService(service._id)} className="delete-service-btn">
                    <svg className="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3 className="analytics-title">Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-dot ${activity.status}`}></div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.action}</p>
                        <div className="activity-meta">
                          <span className="activity-time">{activity.time}</span>
                          <span className="activity-amount">{fmt(activity.amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="analytics-card">
                <h3 className="analytics-title">Quick Stats</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="quick-label">Completion Rate</span>
                    <span className="quick-value">78%</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-label">Avg. Booking Value</span>
                    <span className="quick-value">{fmt(stats.averageValue || 499)}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-label">Customer Satisfaction</span>
                    <span className="quick-value">4.8 ★</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-label">Total Customers</span>
                    <span className="quick-value">{stats.totalCustomers || 156}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="modal-overlay" onClick={() => setShowAddService(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Service</h3>
              <button onClick={() => setShowAddService(false)} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Premium Hair Cut"
                  value={newService.name}
                  onChange={e => setNewService({ ...newService, name: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  placeholder="Describe the service..."
                  rows={3}
                  value={newService.description}
                  onChange={e => setNewService({ ...newService, description: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="modal-row">
                <div className="input-group">
                  <label className="input-label">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="499"
                    value={newService.price}
                    onChange={e => setNewService({ ...newService, price: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={newService.duration}
                    onChange={e => setNewService({ ...newService, duration: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  value={newService.category}
                  onChange={e => setNewService({ ...newService, category: e.target.value })}
                  className="modal-input"
                >
                  <option value="salon">Salon & Beauty</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="repair">Repair</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddService(false)} className="modal-cancel">Cancel</button>
              <button onClick={addService} className="modal-submit">Add Service</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
        }

        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.25rem;
        }

        .admin-subtitle {
          color: #64748b;
          font-size: 0.875rem;
        }

        .admin-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #667eea;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
        }

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

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
          border-color: #e2e8f0;
        }

        .stat-icon-wrapper {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          padding: 0.125rem 0.375rem;
          border-radius: 1rem;
        }

        .stat-change.positive {
          background: #d1fae5;
          color: #059669;
        }

        .trend-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        /* Tabs */
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: #f1f5f9;
          color: #667eea;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .tab-icon {
          width: 1rem;
          height: 1rem;
        }

        .tab-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 1rem;
          font-size: 0.75rem;
        }

        .tab-btn.active .tab-count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Tab Content */
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .content-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .content-filters {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .search-wrapper {
          position: relative;
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
          padding: 0.5rem 1rem 0.5rem 2.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          width: 200px;
        }

        /* Services Grid Admin */
        .services-grid-admin {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .service-card-admin {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
          border: 1px solid #f1f5f9;
        }

        .service-card-admin:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }

        .service-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
        }

        .service-name {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .service-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .service-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .service-price {
          font-weight: 700;
          color: #667eea;
          font-size: 0.875rem;
        }

        .service-duration, .service-category {
          font-size: 0.75rem;
          color: #64748b;
        }

        .delete-service-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }

        .delete-service-btn:hover {
          background: #fee2e2;
          transform: scale(1.05);
        }

        .delete-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #ef4444;
        }

        /* Analytics */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .analytics-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #f1f5f9;
        }

        .analytics-title {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 0.5rem;
        }

        .activity-dot.confirmed { background: #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }
        .activity-dot.completed { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
        .activity-dot.cancelled { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
        .activity-dot.pending { background: #3b82f6; box-shadow: 0 0 0 3px #dbeafe; }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 0.875rem;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
        }

        .activity-time {
          color: #94a3b8;
        }

        .activity-amount {
          color: #667eea;
          font-weight: 600;
        }

        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .quick-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .quick-value {
          font-weight: 700;
          color: #1e293b;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 1.5rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #94a3b8;
          transition: color 0.3s ease;
        }

        .modal-close:hover {
          color: #ef4444;
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
        }

        .modal-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .modal-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .modal-cancel, .modal-submit {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-cancel {
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
        }

        .modal-cancel:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .modal-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
        }

        .modal-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        .add-service-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-service-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          gap: 0.75rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .tabs-container {
            flex-direction: column;
          }
          
          .content-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .content-filters {
            flex-direction: column;
          }
          
          .search-input {
            width: 100%;
          }
          
          .modal-row {
            grid-template-columns: 1fr;
          }
          
          .services-grid-admin {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}