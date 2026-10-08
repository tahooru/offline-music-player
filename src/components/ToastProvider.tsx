"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-0 md:right-4 z-[9999] flex flex-col gap-2 w-full md:w-auto md:min-w-[320px] max-w-sm pointer-events-none px-4 md:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-xl ${
              toast.type === 'success' ? 'bg-status-mint/90 dark:bg-status-success/20 border-status-success/30 text-status-success' :
              toast.type === 'error' ? 'bg-status-soft-red/90 dark:bg-status-error/20 border-status-error/30 text-status-error' :
              'bg-brand-light/90 dark:bg-primary/20 border-primary/30 text-primary'
            } dark:text-text-white`}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} className="flex-shrink-0" />}
            {toast.type === 'error' && <XCircle size={20} className="flex-shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="flex-shrink-0" />}
            
            <span className="flex-1 text-toast font-bold leading-tight">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="opacity-50 hover:opacity-100 transition-opacity p-1 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
