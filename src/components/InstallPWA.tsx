'use client';

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

const REMIND_INSTALL_KEY = 'freedomos.pwa.remindUntil';

function isStandaloneMode() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function canShowInstallPopupNow() {
  const remindUntilRaw = localStorage.getItem(REMIND_INSTALL_KEY);
  const remindUntil = Number(remindUntilRaw ?? 0);
  return Number.isFinite(remindUntil) ? Date.now() >= remindUntil : true;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) return;

    if (canShowInstallPopupNow()) {
      const popupTimer = window.setTimeout(() => setShowInstallPrompt(true), 900);
      return () => window.clearTimeout(popupTimer);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (!isStandaloneMode() && canShowInstallPopupNow()) {
        setShowInstallPrompt(true);
      }
    };

    const onInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
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

  const handleRemindIn24Hours = () => {
    const remindUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(REMIND_INSTALL_KEY, String(remindUntil));
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
              Instalar FreedomOS
            </div>
            <p className="pwa-popup-desc">
              Instala FreedomOS en tu dispositivo para tener acceso directo, mejor rendimiento y experiencia tipo app.
            </p>
            {deferredPrompt ? (
              <button onClick={handleInstall} className="pwa-button">
                Instalar aplicación
              </button>
            ) : (
              <div className="pwa-install-hint" role="note">
                Si no aparece el instalador automático en tu teléfono, abre Chrome y usa el menú ⋮, luego toca
                "Instalar app" o "Agregar a pantalla principal".
              </div>
            )}
            <button onClick={handleRemindIn24Hours} className="pwa-button-secondary">
              Recuérdame en 24 horas
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
