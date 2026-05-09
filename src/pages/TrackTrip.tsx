import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Users, AlertTriangle, ArrowRight, Home, CheckCircle2, XCircle, Mountain } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Trip, User } from '../types';
import LeafletMap from '../components/LeafletMap';

export default function TrackTrip() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(trackingId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { admin } = useAdminAuth();

  useEffect(() => {
    if (trackingId) {
      handleSearch(trackingId);
    }
  }, [trackingId]);

  const handleSearch = async (queryId: string) => {
    if (!queryId.trim()) return;
    setLoading(true);
    setError('');
    setTrip(null);
    setUsers([]);
    
    // Normalize tracking ID
    const normalizedId = queryId.replace(/[^A-Z0-9]/ig, '').toUpperCase();

    try {
      // First try to find by trackingIdNormalized
      let tripDoc = null;
      let q = query(collection(db, 'trips'), where('trackingIdNormalized', '==', normalizedId));
      let snap = await getDocs(q);
      
      if (!snap.empty) {
        tripDoc = snap.docs[0];
      } else {
        // Fallback: search by id just in case
        q = query(collection(db, 'trips'), where('__name__', '==', queryId));
        snap = await getDocs(q);
        if (!snap.empty) {
          tripDoc = snap.docs[0];
        } else {
          // If fallback fails, throw error
          setError('No trip found. Please check your Tracking ID.');
          setLoading(false);
          return;
        }
      }

      setTrip({ id: tripDoc.id, ...tripDoc.data() } as Trip);
      
      // Fetch public user stats (no phone nums or private details for non-admins to rely on directly, but we only fetch names/status)
      const uq = query(collection(db, 'trips', tripDoc.id, 'users'));
      const usnap = await getDocs(uq);
      const ulist = usnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setUsers(ulist);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim()}`);
    }
  };

  const boardedCount = users.filter(u => u.status === 'Boarded').length;
  const missingCount = users.length - boardedCount;
  const progressPercent = users.length === 0 ? 0 : Math.round((boardedCount / users.length) * 100);
  const sosCount = users.filter(u => u.sos?.active).length;

  const isCompleted = trip?.tripDate && trip.tripDate.toDate().setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  const isLive = trip?.tripDate && trip.tripDate.toDate().setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

  return (
    <div className="min-h-screen bg-deep-forest text-slate-100 selection:bg-brand-primary/30 font-sans relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(187,255,77,0.15),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-map-grid opacity-10 pointer-events-none z-0" />
      
      {/* Header */}
      <nav className="relative z-50 p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl md:text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(187,255,77,0.3)] text-night-ink">
            <Mountain size={20} />
          </div>
          Hillo<span className="text-white/60 font-light ml-1">Track</span>
        </Link>
        <Link to="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-[16px] font-bold text-xs uppercase tracking-widest transition-all text-white border border-white/10 flex items-center gap-2">
          <Home size={16} /> <span className="hidden sm:inline">Return Home</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-12 md:pt-20 px-6 relative z-10 w-full max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Track a Hillo Trip
          </h1>
          <p className="text-white/40 text-sm md:text-base font-medium max-w-lg mx-auto">
            Viewing secure, live telemetry. Enter a Tracking ID below to load current boarding status and alerts.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-lg mx-auto mb-16"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/50" />
            <input 
              type="text" 
              placeholder="Enter Tracking ID (e.g. HLO-8F4K2P)" 
              className="w-full pl-14 pr-32 py-5 bg-card-forest/80 backdrop-blur-xl border border-brand-primary/30 rounded-[28px] focus:outline-none focus:border-brand-primary transition-all text-xl font-black tracking-widest text-white shadow-[0_0_30px_rgba(187,255,77,0.05)] uppercase placeholder:text-white/20 placeholder:tracking-normal placeholder:font-medium placeholder:normal-case focus:shadow-[0_0_40px_rgba(187,255,77,0.1)]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading || !searchInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-brand-primary text-night-ink rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-brand-soft transition-all disabled:opacity-50"
            >
              {loading ? 'Finding...' : 'Track Trip'}
            </button>
          </form>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[28px] max-w-sm mx-auto flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 mb-4">
                <AlertTriangle size={24} />
              </div>
              <div className="text-red-400 font-bold mb-1">Trip Not Found</div>
              <div className="text-red-400/60 text-sm font-medium">{error}</div>
            </motion.div>
          )}

          {!trip && !loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/signup" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all text-white border border-white/10">
                Create a Trip
              </Link>
              <Link to="/login" className="px-6 py-3 bg-transparent hover:bg-white/5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all text-white/60 hover:text-white">
                Operator Login
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {trip && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full grid lg:grid-cols-5 gap-6 md:gap-8 pb-32"
            >
              {/* Trip Left Panel */}
              <div className="lg:col-span-3 space-y-6">
                <div className="brand-panel p-6 sm:p-8 rounded-[32px] border border-white/5 bg-card-forest relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                  
                  <div className="relative z-10 flex flex-wrap gap-3 mb-8">
                    {isCompleted ? (
                      <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/10">Past Trip</div>
                    ) : isLive ? (
                      <div className="px-3 py-1 bg-brand-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" /> Live Now
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20">Upcoming</div>
                    )}
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                      ID: {trip.trackingId || trip.id.substring(0,6)}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight mb-2">{trip.name}</h2>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-white/50 text-sm font-medium mt-6">
                      {trip.destination && (
                        <div className="flex items-center gap-2 text-brand-primary/80">
                          <MapPin size={16} /> <span>{trip.destination}</span>
                        </div>
                      )}
                      {trip.tripDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} /> <span>{trip.tripDate.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={16} /> <span>{users.length} Total Passengers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Panel */}
                <div className="brand-panel p-6 sm:p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden bg-card-forest">
                  <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Boarding Progress</div>
                      <div className="text-4xl font-bold font-display text-white">
                        <span className="text-brand-primary">{boardedCount}</span> <span className="text-white/30 text-2xl">/ {users.length}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black font-display text-brand-primary drop-shadow-[0_0_15px_rgba(187,255,77,0.3)]">{progressPercent}%</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/5 mt-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-brand-primary rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[20px] bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <div className="text-2xl font-black font-display text-white mb-0.5">{boardedCount}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">Boarded</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[20px] bg-white/5 flex items-center justify-center text-white/40">
                        <XCircle size={24} />
                      </div>
                      <div>
                        <div className="text-2xl font-black font-display text-white mb-0.5">{missingCount}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">Missing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Panel */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Admin Quick Action */}
                {admin && (trip.creatorId === admin.uid || trip.admins?.includes(admin.uid)) && (
                   <Link to={`/trip/${trip.id}`} className="block brand-panel p-6 rounded-[24px] border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-center group active:scale-95 cursor-pointer">
                      <div className="text-blue-400 font-bold mb-1 flex items-center justify-center gap-2">
                        Open Main Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-blue-400/50">You have admin access</div>
                   </Link>
                )}

                {/* SOS Status Panel */}
                <div className={`brand-panel p-6 rounded-[32px] border ${sosCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-card-forest border-white/5'} transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${sosCount > 0 ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-white/5 text-white/20'}`}>
                       <AlertTriangle size={28} />
                    </div>
                    <div>
                      <div className={`text-3xl font-display font-black ${sosCount > 0 ? 'text-red-400' : 'text-white'}`}>{sosCount}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${sosCount > 0 ? 'text-red-400/60' : 'text-white/40'}`}>
                        Active SOS Alerts
                      </div>
                      {sosCount > 0 && <div className="text-sm text-red-300 mt-2 font-medium">Emergency assistance is required. Admin action pending.</div>}
                    </div>
                  </div>
                </div>

                {/* Map Panel Preview */}
                {trip.destination && (
                  <div className="brand-panel p-1 rounded-[32px] border border-white/5 bg-card-forest h-64 overflow-hidden relative group">
                    <div className="absolute inset-0 z-10 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[30px]" />
                    <div className="w-full h-full rounded-[28px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                      <LeafletMap address={trip.destination} height="100%" adminName={trip.createdBy || 'Hillo'} />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                      <div className="bg-black/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs font-bold text-white shadow-2xl flex items-center justify-between">
                         <span className="truncate mr-2">{trip.destination}</span>
                         <MapPin size={16} className="text-brand-primary shrink-0" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
