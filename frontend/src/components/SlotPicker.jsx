import { formatTime } from '../utils/helpers'

export default function SlotPicker({ slots, selected, onSelect }) {
  if (!slots.length) return (
    <div className="no-slots-container">
      <div className="no-slots-card">
        <div className="no-slots-icon">⏰</div>
        <p className="no-slots-text">No slots available for this date.</p>
        <p className="no-slots-subtext">Try selecting a different date</p>
      </div>
    </div>
  )

  return (
    <div className="slot-picker-container">
      {/* Floating Orbs Background */}
      <div className="slots-bg-orb slots-bg-orb-1"></div>
      <div className="slots-bg-orb slots-bg-orb-2"></div>

      <div className="slots-grid">
        {slots.map(({ time, available }) => (
          <button
            key={time}
            disabled={!available}
            onClick={() => available && onSelect(time)}
            className={`slot-button ${!available ? 'slot-disabled' : selected === time ? 'slot-selected' : 'slot-available'}`}
          >
            <div className="slot-time">{formatTime(time)}</div>
            {selected === time && (
              <div className="slot-checkmark">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {!available && (
              <div className="slot-unavailable-overlay">
                <span className="unavailable-text">Booked</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <style>{`
        .slot-picker-container {
          position: relative;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .slots-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          animation: float 6s ease-in-out infinite;
        }

        .slots-bg-orb-1 {
          width: 120px;
          height: 120px;
          background: rgba(99, 102, 241, 0.1);
          top: -20px;
          right: -20px;
          animation-delay: 0s;
        }

        .slots-bg-orb-2 {
          width: 80px;
          height: 80px;
          background: rgba(168, 85, 247, 0.1);
          bottom: -15px;
          left: -15px;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        .slots-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .slot-button {
          position: relative;
          padding: 1rem 0.75rem;
          border-radius: 0.75rem;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          min-height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.25rem;
        }

        .slot-button:hover:not(.slot-disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.15);
        }

        .slot-available {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        }

        .slot-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transform: scale(1.02);
        }

        .slot-disabled {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .slot-time {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }

        .slot-checkmark {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 1rem;
          height: 1rem;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .slot-checkmark svg {
          width: 0.6rem;
          height: 0.6rem;
        }

        .slot-unavailable-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
        }

        .unavailable-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .no-slots-container {
          padding: 2rem;
          display: flex;
          justify-content: center;
        }

        .no-slots-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 300px;
        }

        .no-slots-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.7;
        }

        .no-slots-text {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .no-slots-subtext {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .slots-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.5rem;
          }

          .slot-button {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
            min-height: 2.5rem;
          }
        }
      `}</style>
    </div>
  )
}