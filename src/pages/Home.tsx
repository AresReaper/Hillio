import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, Timestamp, query, orderBy, limit, onSnapshot, getDocs, writeBatch, deleteDoc, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Mountain, ArrowRight, ScanLine, ShieldCheck, LogIn, Calendar, LogOut, MoreVertical, PlusCircle, LayoutDashboard, History, Clock, Trash2, AlertTriangle, CheckCircle2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cn } from '../lib/utils';

export default function Home() {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, admin, logout, lastTripId } = useAdminAuth();

  const handleJoinTripWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !accessKeyInput.trim() || accessKeyInput.length < 6) return;
    setJoining(true);

    try {
      const q = query(collection(db, 'trips'), where('accessKey', '==', accessKeyInput.trim().toUpperCase()));
      const tripsSnap = await getDocs(q);

      if (tripsSnap.empty) {
        alert('Invalid Access Key. Please check and try again.');
        setJoining(false);
        return;
      }

      const tripDoc = tripsSnap.docs[0];
      
      // Update the trip with arrayUnion
      await updateDoc(tripDoc.ref, {
        admins: arrayUnion(admin?.uid)
      });

      setAccessKeyInput('');
      setShowJoinDialog(false);
      navigate(`/trip/${tripDoc.id}`);
    } catch (error) {
      console.error('Error joining trip:', error);
      handleFirestoreError(error, OperationType.UPDATE, 'trips');
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteAllTrips = async () => {
    setLoading(true);
    setDeleteStatus(null);
    try {
      const q = query(collection(db, 'trips'), where('creatorId', '==', admin?.uid));
      const tripsSnap = await getDocs(q);
      let count = 0;
      
      for (const tripDoc of tripsSnap.docs) {
        // Delete users subcollection
        const usersSnap = await getDocs(collection(db, 'trips', tripDoc.id, 'users'));
        const batch = writeBatch(db);
        usersSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        
        // Delete trip doc
        await deleteDoc(tripDoc.ref);
        count++;
      }
      
      setDeleteStatus({ message: `Successfully deleted ${count} trips and all associated data.`, type: 'success' });
      setShowMoreMenu(false);
      setShowDeleteConfirm(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch (error) {
      console.error('Error deleting all trips:', error);
      setDeleteStatus({ message: 'Error during bulk deletion. Some data may remain.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !admin) {
      setLoadingTrips(false);
      return;
    }

    // Fetch trips where user is creator OR admin
    const qCreator = query(
      collection(db, 'trips'),
      where('creatorId', '==', admin.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const qAdmin = query(
      collection(db, 'trips'),
      where('admins', 'array-contains', admin.uid),
      limit(20)
    );

    const handleSnapshot = (snapshot: any, source: 'creator' | 'admin') => {
      const trips = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        _source: source
      }));
      
      setRecentTrips(prev => {
        const others = prev.filter(t => t._source !== source);
        const merged = [...others, ...trips];
        
        // Remove duplicates (a user could be both creator and in admins)
        const unique = merged.reduce((acc: any[], current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        return unique.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 10);
      });
      setLoadingTrips(false);
    };

    const unsubCreator = onSnapshot(qCreator, (s) => handleSnapshot(s, 'creator'), (err) => {
      console.error("Error creator trips:", err);
      setLoadingTrips(false);
    });

    const unsubAdmin = onSnapshot(qAdmin, (s) => handleSnapshot(s, 'admin'), (err) => {
      console.error("Error admin trips:", err);
      setLoadingTrips(false);
    });

    return () => {
      unsubCreator();
      unsubAdmin();
    };
  }, [isAuthenticated, admin]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!tripName.trim()) return;

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'trips'), {
        name: tripName,
        destination: destination.trim(),
        tripDate: tripDate ? Timestamp.fromDate(new Date(tripDate)) : null,
        createdAt: serverTimestamp(),
        createdBy: admin?.username || 'unknown',
        creatorId: admin?.uid
      });
      navigate(`/trip/${docRef.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      handleFirestoreError(error, OperationType.CREATE, 'trips');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !loading && setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8 text-center border-red-500/30"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Danger Zone</h2>
              <p className="text-white/60 text-sm mb-8">
                Are you absolutely sure you want to delete <span className="text-red-400 font-bold">ALL trips</span> and all passenger data? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteAllTrips}
                  disabled={loading}
                  className="btn-primary bg-red-500 hover:bg-red-600 border-red-400/50 w-full py-4 text-white font-bold"
                >
                  {loading ? 'Deleting Everything...' : 'Yes, Delete All Data'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="text-white/40 hover:text-white text-sm font-medium py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-24 left-6 right-6 z-[100] p-4 rounded-2xl border flex items-center gap-3 shadow-2xl",
              deleteStatus.type === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            {deleteStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-medium">{deleteStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6 pt-8 flex flex-col items-center text-center relative max-w-md mx-auto"
      >
        {isAuthenticated && (
          <div className="w-full flex items-center justify-between mb-10 px-2">
            <div className="text-left">
              <h2 className="text-lg font-bold font-display tracking-tight">Hi, {admin?.username}</h2>
              <p className="text-xs text-white/40">Ready for the next journey?</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-12 h-12 rounded-2xl glass flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <MoreVertical size={20} className="text-white/60" />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowMoreMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-6 top-20 w-56 glass-card p-2 z-[70] shadow-2xl backdrop-blur-3xl text-left"
              >
                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center gap-3 w-full p-4 text-sm text-danger-red hover:text-white hover:bg-danger-red/20 rounded-2xl transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                  <span>Clear All Records</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full p-4 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-colors cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      
        <div className="w-24 h-24 premium-gradient rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-brand-primary/20 rotate-3">
          <Mountain className="text-night-ink" size={48} />
        </div>
        
        <div className="relative mb-6">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-[-0.05em] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10 select-none">
            Hillo
          </h1>
        </div>
        
        {!isAuthenticated && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-wider backdrop-blur-sm">QR Boarding</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-wider backdrop-blur-sm">WhatsApp Tickets</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-wider backdrop-blur-sm">Live SOS</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-wider backdrop-blur-sm">No Passenger App Needed</span>
          </div>
        )}

        <p className="text-white/60 mb-12 max-w-[320px] text-base leading-relaxed">
          {isAuthenticated 
            ? "Create trips, generate smart tickets, and start boarding instantly."
            : "Run safer group trips with QR boarding. Create trips, send smart tickets, scan passengers, and respond to SOS alerts in real time."}
        </p>

        {isAuthenticated ? (
          <div className="w-full space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-0 overflow-hidden flex flex-col sm:flex-row text-left shadow-2xl"
            >
              <div className="flex-1 p-6 sm:p-8 space-y-6 relative">
                
                <h3 className="text-xl font-display font-bold text-white">Create New Trip</h3>
                
                <form onSubmit={handleCreateTrip} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Trip Name (e.g. Alps Expedition)"
                      className="input-field w-full"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Destination"
                      className="input-field w-full"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <div className="relative group">
                      <input
                        type="date"
                        className="input-field w-full pr-12 appearance-none cursor-pointer"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loading || !tripName.trim()}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-night-ink/30 border-t-night-ink rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="uppercase tracking-widest font-black text-xs">Launch Tracking</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            <button 
              onClick={() => setShowJoinDialog(true)}
              className="w-full border border-dashed border-white/20 rounded-[32px] p-6 hover:bg-white/5 transition-colors group cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all shadow-inner">
                <Key size={24} />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">Join an Existing Trip</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Enter a 6-character partner key</div>
              </div>
            </button>

            <div className="w-full space-y-4 text-left pt-4">
              <h3 className="section-heading flex items-center gap-2 pl-2">
                <History size={14} />
                Recent Journeys
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loadingTrips ? (
                  <div className="p-12 col-span-full text-center text-white/10 text-sm italic font-medium animate-pulse">
                    Retrieving trip logs...
                  </div>
                ) : recentTrips.length > 0 ? (
                  recentTrips.map((trip, idx) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        to={`/trip/${trip.id}`}
                        className="w-full h-full flex flex-col p-5 glass-card !rounded-[28px] hover:bg-white/10 transition-all group !border-white/5 hover:!border-white/10 active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20 shrink-0">
                            <Mountain size={20} />
                          </div>
                          <div className="text-base font-bold text-white group-hover:text-brand-primary transition-colors truncate">{trip.name}</div>
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2 truncate">
                          {trip.destination}
                        </div>
                        <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mt-auto flex items-center justify-between">
                          <span>{trip.createdAt?.toDate ? new Date(trip.createdAt.toDate()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'LOGGED'}</span>
                          <ArrowRight size={14} className="text-white/20 group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 col-span-full glass-card !rounded-[32px] text-center text-white/20 text-sm border-dashed flex flex-col items-center gap-3">
                    <History size={32} className="opacity-10" />
                    <span>Your adventure log is empty.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 max-w-xs mx-auto pt-4">
            <Link 
              to="/signup"
              className="btn-primary w-full"
            >
              <PlusCircle size={20} />
              <span className="text-base tracking-wide">Create Operator Account</span>
            </Link>
            
            <Link 
              to="/login"
              className="btn-glass w-full"
            >
              <LogIn size={20} />
              <span className="text-base tracking-wide">Operator Login</span>
            </Link>

            <Link 
              to="/showcase"
              className="btn-secondary !bg-transparent w-full mt-4"
            >
              <LayoutDashboard size={20} />
              <span className="text-sm">View Showcase</span>
            </Link>
          </div>
        )}

      </motion.div>

      {/* Join via Key Dialog */}
      <AnimatePresence>
        {showJoinDialog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !joining && setShowJoinDialog(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8 border-brand-primary/20 shadow-2xl"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-[28px] flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/20 shadow-[0_0_20px_rgba(187,255,77,0.1)]">
                  <Key size={32} />
                </div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">Enter Access Key</h2>
                <p className="text-white/40 text-xs mt-2 text-center leading-relaxed">
                  Join an existing trip created by a partner. Use the 6-character secret key shared with you.
                </p>
              </div>

              <form onSubmit={handleJoinTripWithKey} className="space-y-6">
                <input
                  type="text"
                  placeholder="EX: A1B2C3"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-2xl font-black tracking-[0.3em] uppercase placeholder:text-white/10 placeholder:tracking-normal focus:outline-none focus:border-brand-primary/50 transition-all"
                  value={accessKeyInput}
                  onChange={(e) => setAccessKeyInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={joining || accessKeyInput.length < 6}
                  className="btn-primary w-full py-5 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {joining ? 'Authenticating...' : (
                    <>
                      <span>Join as Administrator</span>
                      <ShieldCheck size={20} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinDialog(false)}
                  disabled={joining}
                  className="w-full py-2 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
