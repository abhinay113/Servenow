export default function BookingSteps({ current }) {
  const steps = ['Select Slot', 'Your Details', 'Payment']

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const step   = i + 1
        const done   = step < current
        const active = step === current

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done   ? 'bg-green-500 text-white' :
                  active ? 'bg-violet-600 text-white' :
                           'bg-slate-100 text-slate-400'}`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 font-medium
                ${active ? 'text-violet-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 h-0.5 mb-4 mx-1 transition-all
                ${done ? 'bg-green-400' : 'bg-slate-200'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}