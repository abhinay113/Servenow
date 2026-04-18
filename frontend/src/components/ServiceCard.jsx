import { useNavigate } from 'react-router-dom'
import { fmt, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/helpers'

export default function ServiceCard({ service }) {
  const navigate = useNavigate()
  const icon  = CATEGORY_ICONS[service.category] || '🔨'
  const color = CATEGORY_COLORS[service.category] || '#7C3AED'

  return (
    <div
      onClick={() => navigate(`/services/${service._id}`)}
      className="bg-white rounded-2xl border border-slate-100 p-6 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>

      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-800 text-base leading-tight pr-2">{service.name}</h3>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
          style={{ background: `${color}18`, color }}
        >
          {service.category}
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-slate-800">{fmt(service.price)}</span>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <span className="text-amber-400">★</span>
          <span>{service.rating}</span>
          <span className="text-slate-300">·</span>
          <span>{service.reviewCount} reviews</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">⏱ {service.duration} min</p>
    </div>
  )
}