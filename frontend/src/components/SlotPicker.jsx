import { formatTime } from '../utils/helpers'

export default function SlotPicker({ slots, selected, onSelect }) {
  if (!slots.length) return (
    <p className="text-slate-400 text-sm">No slots available for this date.</p>
  )

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(({ time, available }) => (
        <button
          key={time}
          disabled={!available}
          onClick={() => available && onSelect(time)}
          className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all
            ${!available
              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
              : selected === time
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-violet-400 hover:text-violet-600'
            }`}
        >
          {formatTime(time)}
        </button>
      ))}
    </div>
  )
}