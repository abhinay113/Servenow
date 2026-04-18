import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { fmt, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/helpers'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get(`/services/${id}`)
      .then(r => setService(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <p className="loading-text">Loading service details...</p>
        </div>
        <style>{`
          .loading-container {
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
            width: 4rem;
            height: 4rem;
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

  if (!service) return null

  const icon = CATEGORY_ICONS[service.category] || '🔨'
  const color = CATEGORY_COLORS[service.category] || '#7C3AED'
  
  // Sample images - replace with actual images from your API
  const images = [
    service.imageUrl || `https://placehold.co/600x400/${color.slice(1)}/white?text=${service.name}`,
    `https://placehold.co/600x400/${color.slice(1)}/white?text=Service+Process`,
    `https://placehold.co/600x400/${color.slice(1)}/white?text=Quality+Work`
  ]

  const features = [
    'Professional & Certified Experts',
    'Quality Assurance Guaranteed',
    'On-Time Service Delivery',
    '100% Customer Satisfaction',
    'Affordable Pricing',
    'Safety Measures Followed'
  ]

  return (
    <div className="service-detail-page">
      <div className="page-container">
        {/* Back Button */}
        <button onClick={() => navigate('/services')} className="back-button">
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Services
        </button>

        {/* Main Content */}
        <div className="detail-grid">
          {/* Left Column - Images */}
          <div className="image-gallery">
            <div className="main-image">
              <img src={images[selectedImage]} alt={service.name} />
              <div className="category-badge" style={{ background: color }}>
                {icon} {service.category}
              </div>
            </div>
            <div className="thumbnail-grid">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="details-content">
            <div className="service-header">
              <h1 className="service-title">{service.name}</h1>
              
              <div className="rating-section">
                <div className="stars">
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star half">★</span>
                </div>
                <span className="rating-value">{service.rating || 4.8}</span>
                <span className="review-count">({service.reviewCount || 128} reviews)</span>
              </div>

              <div className="meta-info">
                <div className="meta-item">
                  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{service.duration} minutes</span>
                </div>
                <div className="meta-item">
                  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Service at your location</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3 className="section-title">About this service</h3>
              <p className="service-description">{service.description}</p>
            </div>

            <div className="features-section">
              <h3 className="section-title">Why choose us?</h3>
              <div className="features-grid">
                {features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <svg className="feature-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Booking Card */}
            <div className="booking-card">
              <div className="price-section">
                <div>
                  <p className="price-label">Starting from</p>
                  <p className="price-value">{fmt(service.price)}</p>
                  <p className="price-note">Inclusive of all taxes</p>
                </div>
                <div className="guarantee-badge">
                  <svg className="guarantee-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Best Price Guarantee</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/book/${service._id}`)}
                className="book-now-btn"
              >
                <span>Book Now</span>
                <svg className="btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .service-detail-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
        }

        .page-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Back Button */
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 2rem;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }

        .back-button:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateX(-4px);
        }

        .back-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Grid Layout */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        /* Image Gallery */
        .image-gallery {
          position: sticky;
          top: 2rem;
        }

        .main-image {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
          background: white;
          box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }

        .main-image img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .main-image:hover img {
          transform: scale(1.05);
        }

        .category-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .thumbnail {
          border-radius: 1rem;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thumbnail img {
          width: 100%;
          height: 100px;
          object-fit: cover;
        }

        .thumbnail.active {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .thumbnail:hover {
          transform: translateY(-2px);
        }

        /* Details Content */
        .details-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .service-header {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .service-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .star {
          color: #fbbf24;
          font-size: 1rem;
        }

        .star.half {
          position: relative;
          overflow: hidden;
          width: 0.75rem;
        }

        .rating-value {
          font-weight: 700;
          color: #1e293b;
        }

        .review-count {
          color: #64748b;
          font-size: 0.875rem;
        }

        .meta-info {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .meta-icon {
          width: 1rem;
          height: 1rem;
          color: #667eea;
        }

        /* Sections */
        .description-section, .features-section {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .service-description {
          color: #475569;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .feature-check {
          width: 1rem;
          height: 1rem;
          color: #10b981;
        }

        /* Booking Card */
        .booking-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          border-radius: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: 0 20px 35px -8px rgba(102, 126, 234, 0.3);
        }

        .price-section {
          flex: 1;
        }

        .price-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          line-height: 1;
          margin: 0.25rem 0;
        }

        .price-note {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .guarantee-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .guarantee-icon {
          width: 1rem;
          height: 1rem;
        }

        .book-now-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: white;
          border: none;
          border-radius: 1rem;
          font-weight: 700;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .book-now-btn:hover {
          transform: translateY(-2px);
          gap: 0.75rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .btn-arrow {
          width: 1rem;
          height: 1rem;
          transition: transform 0.3s ease;
        }

        .book-now-btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Responsive */
        @media (max-width: 968px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .image-gallery {
            position: relative;
            top: 0;
          }

          .main-image img {
            height: 300px;
          }

          .service-title {
            font-size: 1.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .service-detail-page {
            padding: 1rem;
          }

          .booking-card {
            flex-direction: column;
            text-align: center;
          }

          .price-section {
            text-align: center;
          }

          .guarantee-badge {
            justify-content: center;
          }

          .book-now-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}