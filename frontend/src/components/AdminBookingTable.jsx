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
    <div className="space-y-6">
      {/* Filters Bar - Advanced Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, service or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-2">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: CalendarIcon, color: 'from-blue-500 to-cyan-500' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: ClockIcon, color: 'from-orange-500 to-red-500' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircleIcon, color: 'from-green-500 to-emerald-500' },
          { label: 'Revenue', value: `₹${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'from-purple-500 to-pink-500' }
        ].map((stat, idx) => (
          <div key={idx} className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table with Modern Design */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                {['Customer', 'Service', 'Date & Time', 'Address', 'Amount', 'Status', 'Actions'].map((h, idx) => (
                  <th key={idx} className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b, idx) => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending
                return (
                  <tr 
                    key={b._id} 
                    className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {b.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{b.userId?.name || 'N/A'}</p>
                          <p className="text-slate-400 text-xs">{b.userId?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-700">{b.serviceId?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-slate-700 font-medium flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {b.date}
                        </p>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {b.timeSlot}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1 max-w-[180px]">
                        <MapPinIcon className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-500 text-sm truncate" title={b.address}>
                          {b.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 flex items-center gap-0.5">
                        <CurrencyRupeeIcon className="w-4 h-4" />
                        {b.totalAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
                        style={{ background: sc.bg + '20', color: sc.text, border: `1px solid ${sc.text}30` }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ background: sc.text }}></span>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => update(b._id, 'completed')}
                            disabled={loadingId === b._id}
                            className="relative group/btn px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50"
                          >
                            {loadingId === b._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span>Complete</span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 rounded-lg transition-opacity"></div>
                              </>
                            )}
                          </button>
                        )}
                        {!['cancelled', 'completed'].includes(b.status) && (
                          <button
                            onClick={() => update(b._id, 'cancelled')}
                            disabled={loadingId === b._id}
                            className="relative group/btn px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50"
                          >
                            {loadingId === b._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span>Cancel</span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 rounded-lg transition-opacity"></div>
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
        
        {/* Footer with pagination info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <p>Showing {filteredBookings.length} of {bookings.length} bookings</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}