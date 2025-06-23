'use client';

import { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsVisible(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-[200] flex items-center gap-4 rounded-lg border bg-destructive p-4 text-destructive-foreground shadow-lg"
        >
          <WifiOff className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">أنت غير متصل بالإنترنت</h3>
            <p className="text-sm">يرجى التحقق من اتصالك.</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 rounded-full border border-destructive bg-destructive-foreground p-1 text-destructive transition-colors hover:bg-destructive-foreground/80"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
