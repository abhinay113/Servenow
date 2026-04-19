import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ServiceCard from '../components/ServiceCard'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({ bookings: 0, experts: 0, customers: 0 })
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.slice(0, 3)))
    // Animate stats on load
    const animateStats = () => {
      const targets = { customers: 10000, experts: 500, bookings: 25000 }
      const duration = 2000
      const stepTime = 20
      const steps = duration / stepTime
      let currentStep = 0
      
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        setStats({
          customers: Math.floor(targets.customers * progress),
          experts: Math.floor(targets.experts * progress),
          bookings: Math.floor(targets.bookings * progress)
        })
        if (currentStep >= steps) clearInterval(interval)
      }, stepTime)
    }
    animateStats()
  }, [])

  const features = [
    { icon: '🔧', title: 'Verified Experts', desc: 'Background-checked professionals' },
    { icon: '💳', title: 'Secure Payments', desc: 'UPI & multiple payment options' },
    { icon: '⭐', title: 'Quality Guarantee', desc: '100% satisfaction assured' },
    { icon: '🚀', title: 'Quick Service', desc: 'Same-day availability' }
  ]

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-animation">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            🚀 Book home services in minutes
          </div>
          
          <h1 className="hero-title">
            Expert Services,
            <span className="gradient-text"> At Your Door</span>
          </h1>
          
          <p className="hero-description">
            From salon to plumbing — book verified professionals with live slots,
            secure UPI payments, and real-time tracking.
          </p>
          
          <div className="hero-buttons">
            <button
              onClick={() => navigate('/services')}
              className="btn-primary"
            >
              <span>Explore Services</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="btn-secondary"
            >
              How It Works
            </button>
          </div>

          {/* Stats Counter */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">{stats.customers.toLocaleString()}+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-value">{stats.experts}+</div>
              <div className="stat-label">Verified Experts</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-value">5★</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Premium Service Experience</h2>
            <p className="section-subtitle">We deliver excellence with every booking</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="howitworks-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to book your service</p>
          </div>
          
          <div className="steps-container">
            {[
              { step: '01', icon: '🔍', title: 'Choose Service', desc: 'Browse 50+ services across categories', color: '#667eea' },
              { step: '02', icon: '📅', title: 'Pick Your Slot', desc: 'Select date, time, and your address', color: '#764ba2' },
              { step: '03', icon: '💳', title: 'Pay & Confirm', desc: 'Instant UPI payment, booking confirmed', color: '#f59e0b' }
            ].map((item, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number" style={{ background: item.color }}>{item.step}</div>
                <div className="step-icon">{item.icon}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
                {idx < 2 && <div className="step-connector">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Popular Services</span>
            <h2 className="section-title">Featured Services</h2>
            <p className="section-subtitle">Most booked services this week</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, idx) => (
              <div key={service._id} className="service-card-wrapper" style={{ animationDelay: `${idx * 100}ms` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
          
          <div className="view-all-container">
            <button onClick={() => navigate('/services')} className="view-all-btn">
              View All Services
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show when user is logged out */}
      {!user && (
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to book your service?</h2>
              <p className="cta-description">Join thousands of happy customers who trust ServeNow</p>
              <button 
                type="button"
                onClick={() => navigate('/login')} 
                className="cta-button"
              >
                Get Started Now
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="cta-bg-animation"></div>
          </div>
        </section>
      )}

      <style>{`
        .homepage {
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          padding: 6rem 2rem 8rem;
          overflow: hidden;
        }

        .hero-bg-animation {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(118,75,162,0.4) 0%, transparent 70%);
          bottom: -250px;
          right: -250px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(102, 126, 234, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(102, 126, 234, 0.3);
          padding: 0.5rem 1.5rem;
          border-radius: 3rem;
          color: #a78bfa;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .badge-pulse {
          position: absolute;
          left: 1rem;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 4rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
          gap: 0.75rem;
        }

        .btn-secondary {
          padding: 0.875rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Stats Container */
        .stats-container {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-card {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .stat-divider {
          width: 1px;
          height: 3rem;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Common Section Styles */
        .features-section, .howitworks-section, .services-section {
          padding: 5rem 2rem;
        }

        .features-section {
          background: white;
        }

        .howitworks-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .services-section {
          background: white;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-badge {
          display: inline-block;
          padding: 0.25rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 2rem;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #64748b;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .feature-desc {
          color: #64748b;
          font-size: 0.875rem;
        }

        /* Steps Container */
        .steps-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .step-card {
          position: relative;
          flex: 1;
          min-width: 250px;
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          position: absolute;
          top: -1rem;
          left: -1rem;
          width: 3rem;
          height: 3rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 1.25rem;
        }

        .step-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .step-desc {
          color: #64748b;
          font-size: 0.875rem;
        }

        .step-connector {
          position: absolute;
          right: -2rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 2rem;
          color: #cbd5e1;
        }

        /* Services Grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .service-card-wrapper {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .view-all-container {
          text-align: center;
        }

        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          border-color: #667eea;
          gap: 0.75rem;
          transform: translateY(-2px);
        }

        /* CTA Section */
        .cta-section {
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .cta-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          overflow: hidden;
          border-radius: 2rem;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .cta-content {
          position: relative;
          z-index: 10;
        }

        .cta-bg-animation {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }

        .cta-description {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: white;
          border: none;
          border-radius: 1rem;
          color: #667eea;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          gap: 0.75rem;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 1.875rem;
          }
          
          .step-connector {
            display: none;
          }
          
          .stats-container {
            gap: 1rem;
          }
          
          .stat-value {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}