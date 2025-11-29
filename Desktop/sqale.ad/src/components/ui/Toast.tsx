import React from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Toast as ToastType } from '../../hooks/useToast'

interface ToastProps {
  toasts: ToastType[]
  removeToast: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slideIn ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-900 border border-red-200'
              : toast.type === 'warning'
              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}

          <span className="text-sm font-medium">{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
