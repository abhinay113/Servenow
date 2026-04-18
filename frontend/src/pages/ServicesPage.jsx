import { useEffect, useState } from 'react'
import api from '../utils/api'
import ServiceCard from '../components/ServiceCard'
import { CATEGORY_ICONS } from '../utils/helpers'

const CATS = ['all', 'salon', 'cleaning', 'repair', 'plumbing', 'electrical']

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setLoading(true)
    const query = filter !== 'all' ? `?category=${filter}` : ''
    api.get(`/services${query}`)
      .then(r => setServices(r.data))
      .finally(() => setLoading(false))
  }, [filter])

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryCount = (cat) => {
    if (cat === 'all') return services.length
    return services.filter(s => s.category === cat).length
  }

  return (
    <div className="services-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Premium Services</span>
            <span className="hero-emoji">✨</span>
          </h1>
          <p className="hero-subtitle">
            Professional home services delivered with excellence
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{services.length}</span>
          <span className="stat-label">Total Services</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-value">{filteredServices.length}</span>
          <span className="stat-label">Available Now</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-title">
            <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Category
          </span>
          <span className="filter-result">{filteredServices.length} services found</span>
        </div>
        
        <div className="filter-buttons">
          {CATS.map(c => {
            const isActive = filter === c
            const count = getCategoryCount(c)
            const displayName = c === 'all' ? 'All Services' : 
              `${CATEGORY_ICONS[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`
            
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
              >
                <span className="btn-content">
                  {displayName}
                  <span className="btn-count">{count}</span>
                </span>
                {isActive && <div className="btn-active-indicator" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner-large">
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading amazing services for you...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No services found</h3>
          <p className="empty-text">
            We couldn't find any services matching your criteria.
            Try adjusting your search or filter.
          </p>
          <button onClick={() => { setFilter('all'); setSearchTerm('') }} className="reset-btn">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service, index) => (
            <div key={service._id} className="grid-item" style={{ animationDelay: `${index * 100}ms` }}>
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .services-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 4rem 2rem;
          overflow: hidden;
        }

        .hero-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.1;
          animation: slide 20s linear infinite;
        }

        @keyframes slide {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(-50%) translateY(-50%);
          }
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          z-index: 1;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-emoji {
          font-size: 3rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        /* Search Bar */
        .search-container {
          max-width: 500px;
          margin: 0 auto;
        }

        .search-wrapper {
          position: relative;
          background: white;
          border-radius: 3rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .search-wrapper:focus-within {
          transform: scale(1.02);
          box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.2);
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 1rem 3rem;
          border: none;
          border-radius: 3rem;
          font-size: 0.875rem;
          outline: none;
          background: transparent;
        }

        .clear-search {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          transition: color 0.3s ease;
        }

        .clear-search:hover {
          color: #ef4444;
        }

        /* Stats Bar */
        .stats-bar {
          max-width: 1200px;
          margin: -1.5rem auto 2rem auto;
          padding: 1rem 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 2rem;
          background: #e2e8f0;
        }

        /* Filter Section */
        .filter-section {
          max-width: 1200px;
          margin: 0 auto 2rem auto;
          padding: 0 2rem;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .filter-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #667eea;
        }

        .filter-result {
          font-size: 0.875rem;
          color: #64748b;
        }

        .filter-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          position: relative;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 3rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-count {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 1rem;
        }

        .filter-btn.active .btn-count {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-active-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: white;
          border-radius: 3px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        /* Services Grid */
        .services-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 4rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .grid-item {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
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

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-spinner-large {
          display: inline-block;
          position: relative;
          width: 4rem;
          height: 4rem;
        }

        .spinner-ring {
          width: 100%;
          height: 100%;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          margin-top: 1rem;
          color: #64748b;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
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

        .reset-btn {
          padding: 0.625rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-emoji {
            font-size: 2rem;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
            padding: 0 1rem 2rem 1rem;
          }
          
          .filter-buttons {
            justify-content: center;
          }
          
          .stats-bar {
            margin: -1rem 1rem 1.5rem 1rem;
            padding: 0.75rem 1rem;
          }
          
          .filter-section {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  )
}