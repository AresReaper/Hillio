import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Scanner as QrScanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ScanLine, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function UniversalScanner() {
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'already', name?: string, tripName?: string, message?: string } | null>(null);
  const [scanning, setScanning] = useState(true);

  const handleCameraError = (error: any) => {
    console.error("Scanner Camera Error:", error);
    setScanResult({
      status: 'error',
      message: 'Camera access denied or unavailable. Please enable camera permissions in your browser.'
    });
    setScanning(false);
  };

  async function handleScan(detectedCodes: IDetectedBarcode[]) {
    if (!scanning || detectedCodes.length === 0) return;

    const decodedText = detectedCodes[0].rawValue;
    setScanning(false);
    
    try {
      let tripId = '';
      let userId = '';

      // Try parsing as JSON (new format)
      try {
        const data = JSON.parse(decodedText);
        if (data.t && data.u) {
          tripId = data.t;
          userId = data.u;
        } else if (data.tripId && data.userId) {
          tripId = data.tripId;
          userId = data.userId;
        }
      } catch (e) {
        // Not JSON, maybe old format? We can't handle old format without tripId.
        setScanResult({ status: 'error', message: 'Invalid or outdated QR Code format.' });
        return;
      }

      if (!tripId || !userId) {
        setScanResult({ status: 'error', message: 'Invalid QR Code data.' });
        return;
      }

      // Fetch Trip Name
      const tripDocRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripDocRef);
      const tripName = tripSnap.exists() ? tripSnap.data().name : 'Unknown Trip';

      // Fetch User
      const userDocRef = doc(db, 'trips', tripId, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setScanResult({ status: 'error', message: 'User not found in this trip.' });
      } else {
        const userData = userSnap.data();
        if (userData.status === 'Boarded') {
          setScanResult({ status: 'already', name: userData.name, tripName });
        } else {
          await updateDoc(userDocRef, {
            status: 'Boarded',
            boardedAt: serverTimestamp()
          });
          setScanResult({ status: 'success', name: userData.name, tripName });
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Passenger Boarded', {
              body: `${userData.name} has been successfully boarded for ${tripName}.`,
              icon: '/icon.png'
            });
          }
        }
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setScanResult({ status: 'error', message: 'Failed to process scan' });
    }
  }

  const resetScanner = () => {
    setScanResult(null);
    setScanning(true);
  };

  useEffect(() => {
    if (scanResult && (scanResult.status === 'success' || scanResult.status === 'already')) {
      const timer = setTimeout(() => {
        resetScanner();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pt-12 flex flex-col items-center min-h-screen bg-[#161917]"
    >
      <div className="w-full flex justify-between items-center mb-8">
        <Link to="/" className="p-3 bg-[#2A2E2B] rounded-2xl text-white/50 border border-white/5">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-11" /> {/* Spacer */}
      </div>

      <div className="w-full bg-[#2A2E2B] rounded-[32px] overflow-hidden relative p-0 aspect-square flex items-center justify-center border border-[#bbff4d]/30 shadow-[0_0_30px_rgba(187,255,77,0.1)]">
        {scanning ? (
          <QrScanner
            onScan={handleScan}
            onError={handleCameraError}
            components={{
              onOff: false,
              torch: true,
              zoom: false,
              finder: true,
            }}
            styles={{
              container: { width: '100%', height: '100%' },
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#161917]/50" />
        )}
        
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl",
                scanResult.status === 'success' ? "bg-[#bbff4d]/95 text-[#161917]" : 
                scanResult.status === 'already' ? "bg-amber-500/95 text-[#161917]" : "bg-red-500/95 text-white"
              )}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                {scanResult.status === 'success' ? (
                  <CheckCircle2 size={80} className="mb-6 drop-shadow-lg" />
                ) : scanResult.status === 'already' ? (
                  <RefreshCw size={80} className="mb-6 drop-shadow-lg" />
                ) : (
                  <XCircle size={80} className="mb-6 drop-shadow-lg" />
                )}
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-2 drop-shadow-md"
              >
                {scanResult.status === 'success' ? 'Boarded!' : 
                 scanResult.status === 'already' ? 'Already Boarded' : 'Scan Failed'}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "mb-8 text-lg font-medium",
                  scanResult.status === 'error' ? "text-white/90" : "text-[#161917]/90"
                )}
              >
                {scanResult.status === 'success' ? scanResult.name :
                 scanResult.status === 'already' ? scanResult.name :
                 scanResult.message}
                {scanResult.tripName && <span className="block mt-2 text-sm font-bold opacity-75">Trip: {scanResult.tripName}</span>}
              </motion.p>

              {scanResult.status === 'error' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={resetScanner}
                  className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full shadow-xl active:scale-95 transition-all"
                >
                  Scan Next
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-3 text-white/40 text-sm">
        <ScanLine size={18} className="animate-pulse text-[#bbff4d]" />
        <span>Align any valid boarding pass QR code</span>
      </div>

      <div className="mt-auto pt-12 text-center text-[10px] text-white/20 uppercase tracking-widest">
        Universal Admin Mode
      </div>
    </motion.div>
  );
}
