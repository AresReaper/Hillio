import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Scanner as QrScanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ScanLine, CheckCircle2, XCircle, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Scanner() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { logout, admin } = useAdminAuth();
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'already', name?: string, message?: string } | null>(null);
  const [scanning, setScanning] = useState(true);
  const [validTrip, setValidTrip] = useState(false);

  useEffect(() => {
    async function checkOwnership() {
      if (!tripId) return;
      try {
        const tripSnap = await getDoc(doc(db, 'trips', tripId));
        if (tripSnap.exists()) {
          const tripData = tripSnap.data();
          const isCreator = tripData.creatorId === admin?.uid;
          const isAdminMember = tripData.admins?.includes(admin?.uid || '');
          
          if (admin && !isCreator && !isAdminMember) {
            navigate('/', { replace: true });
            return;
          }
          setValidTrip(true);
        } else {
          navigate('/', { replace: true });
        }
      } catch (e) {
        console.error("Ownership check failed:", e);
        navigate('/', { replace: true });
      }
    }
    checkOwnership();
  }, [tripId, admin, navigate]);

  const handleCameraError = (error: any) => {
    console.error("Scanner Camera Error:", error);
    setScanResult({
      status: 'error',
      message: 'Camera access denied or unavailable. Please enable camera permissions in your browser.'
    });
    setScanning(false);
  };

  async function handleScan(detectedCodes: IDetectedBarcode[]) {
    if (!tripId || !scanning || detectedCodes.length === 0 || !validTrip) return;

    const decodedText = detectedCodes[0].rawValue;
    setScanning(false);
    
    try {
      let scannedUserId = decodedText;
      
      // Try parsing as JSON (new format)
      try {
        const data = JSON.parse(decodedText);
        if (data.t && data.u) {
          if (data.t !== tripId) {
            setScanResult({ status: 'error', message: 'This boarding pass is for a different trip!' });
            return;
          }
          scannedUserId = data.u;
        } else if (data.tripId && data.userId) {
          if (data.tripId !== tripId) {
            setScanResult({ status: 'error', message: 'This boarding pass is for a different trip!' });
            return;
          }
          scannedUserId = data.userId;
        }
      } catch (e) {
        // Not JSON, assume it's the old format (just userId)
      }

      const userDocRef = doc(db, 'trips', tripId, 'users', scannedUserId);
      const userSnap = await getDoc(userDocRef);
      const tripSnap = await getDoc(doc(db, 'trips', tripId));

      if (!userSnap.exists() || !tripSnap.exists()) {
        setScanResult({ status: 'error', message: 'Invalid QR Code or User not found' });
      } else {
        const userData = userSnap.data();
        const tripData = tripSnap.data();
        const isExpired = tripData.tripDate ? (new Date().getTime() > tripData.tripDate.toDate().getTime() + (24 * 60 * 60 * 1000)) : false;

        if (isExpired) {
          setScanResult({ status: 'error', message: 'This ticket has expired!' });
        } else if (userData.status === 'Boarded') {
          setScanResult({ status: 'already', name: userData.name });
        } else {
          await updateDoc(userDocRef, {
            status: 'Boarded',
            boardedAt: serverTimestamp()
          });
          setScanResult({ status: 'success', name: userData.name });
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Passenger Boarded', {
              body: `${userData.name} has been successfully boarded.`,
              icon: '/icon.png'
            });
          }
        }
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      handleFirestoreError(error, OperationType.WRITE, `trips/${tripId}/users`);
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
      className="fixed inset-0 flex flex-col bg-slate-950 overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 premium-gradient opacity-10 pointer-events-none" />
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <Link to={`/trip/${tripId}`} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Gate Operations</div>
          <div className="text-sm font-bold text-white tracking-widest uppercase">ID Scanner</div>
        </div>
        <button 
          onClick={logout}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/40 hover:text-red-400 transition-all active:scale-95"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Scanner Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 gap-12">
        <div className="w-full max-w-sm aspect-square relative group">
          <div className="absolute -inset-1 bg-brand-primary/20 blur-2xl rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative w-full h-full glass-card rounded-[48px] border-brand-primary/20 overflow-hidden shadow-2xl shadow-brand-primary/5">
            {scanning ? (
              <>
                <QrScanner
                  onScan={handleScan}
                  onError={handleCameraError}
                  components={{
                    onOff: false,
                    torch: true,
                    zoom: false,
                    finder: false,
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                  }}
                />
                
                {/* Precision Finder */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-4/5 aspect-square relative border border-brand-primary/10 rounded-[32px] overflow-hidden">
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_20px_rgba(187,255,77,1)] z-20"
                    />
                    
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-brand-primary rounded-tl-[32px]" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-brand-primary rounded-tr-[32px]" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-brand-primary rounded-bl-[32px]" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-brand-primary rounded-br-[32px]" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-900/50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-brand-primary rounded-full animate-spin" />
              </div>
            )}
            
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "absolute inset-0 z-30 flex flex-col items-center justify-center p-10 text-center",
                    scanResult.status === 'success' ? "bg-emerald-500/90 text-slate-950" : 
                    scanResult.status === 'already' ? "bg-brand-primary text-slate-950" : "bg-red-500/90 text-white"
                  )}
                >
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="mb-8"
                    >
                      {scanResult.status === 'success' ? (
                        <CheckCircle2 size={96} className="filter drop-shadow-xl" />
                      ) : scanResult.status === 'already' ? (
                        <RefreshCw size={96} className="filter drop-shadow-xl" />
                      ) : (
                        <XCircle size={96} className="filter drop-shadow-xl" />
                      )}
                    </motion.div>

                    <h2 className="text-4xl font-black font-display mb-2">
                      {scanResult.status === 'success' ? 'Validated' : 
                       scanResult.status === 'already' ? 'Boarded' : 'Rejected'}
                    </h2>
                    
                    <p className="text-lg font-bold opacity-80 mb-10 min-h-[1.5em]">
                      {scanResult.status === 'success' ? scanResult.name :
                       scanResult.status === 'already' ? scanResult.name :
                       scanResult.message}
                    </p>

                    {scanResult.status === 'error' && (
                      <button
                        onClick={resetScanner}
                        className="px-10 py-5 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all text-xs"
                      >
                        Retry Authorization
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3 text-brand-primary/60">
            <ScanLine size={20} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scanner Online</span>
          </div>
          <p className="text-white/20 text-xs px-12 leading-relaxed">
            Align the traveler's digital manifest within the frame for authentication
          </p>
        </div>
      </div>

      {/* Trip Quick Stats Footer */}
      <div className="p-8 bg-gradient-to-t from-slate-950/80 to-transparent">
        <div className="glass-card rounded-[32px] p-6 flex justify-around border-white/5">
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Queue</div>
            <div className="text-lg font-bold text-white">Active</div>
          </div>
          <div className="w-px h-10 bg-white/5 self-center" />
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Manifest</div>
            <div className="text-lg font-bold text-brand-primary">Verified</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
