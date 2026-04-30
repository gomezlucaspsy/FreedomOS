import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Auto show the popup when the app loads, as requested by the user
      setTimeout(() => setShowInstallPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div 
          className="pwa-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="pwa-popup-card"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="pwa-popup-title">
              <Download size={24} color="var(--accent-cyan)" />
              Instalar FreedomOS Engine
            </div>
            <p className="pwa-popup-desc">
              Instala el Motor de Migración Demográfica en tu dispositivo para un rendimiento nativo, análisis offline y acceso directo.
            </p>
            <button onClick={handleInstall} className="pwa-button">
              Instalar Aplicación
            </button>
            <button onClick={handleDismiss} className="pwa-button-secondary">
              Continuar en el navegador
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
