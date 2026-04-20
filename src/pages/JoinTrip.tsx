import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserPlus, Mountain } from 'lucide-react';
import { motion } from 'motion/react';

export default function JoinTrip() {
  const { tripId } = useParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripName, setTripName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!tripId) return;

    // Check if user already joined this trip on this device
    const savedUserId = localStorage.getItem(`trip_${tripId}_user`);
    if (savedUserId) {
      navigate(`/trip/${tripId}/user/${savedUserId}`);
      return;
    }

    // Fetch trip name
    const fetchTrip = async () => {
      const docRef = doc(db, 'trips', tripId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTripName(docSnap.data().name);
      }
    };
    fetchTrip();
  }, [tripId, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tripId) return;

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'trips', tripId, 'users'), {
        name: name.trim(),
        phone: phone.trim() || '',
        status: 'Not Boarded',
        joinedAt: serverTimestamp(),
      });
      localStorage.setItem(`trip_${tripId}_user`, docRef.id);
      navigate(`/trip/${tripId}/user/${docRef.id}`);
    } catch (error) {
      console.error('Error joining trip:', error);
      alert('Failed to join trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative flex flex-col items-center bg-slate-950 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 premium-gradient opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-sm px-8 pt-20 pb-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-24 h-24 glass rounded-[32px] flex items-center justify-center mb-10 shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <Mountain className="text-brand-primary relative z-10" size={48} />
        </motion.div>
        
        <div className="space-y-4 mb-20 text-center">
          <div className="inline-block px-3 py-1 glass rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Terminal ID: {tripId?.slice(-6).toUpperCase()}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            {tripName || 'Boarding'}<br />
            <span className="text-white/20">Sequence</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] pt-4">Hillo Manifest</p>
        </div>

        <form onSubmit={handleJoin} className="w-full space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Official Name"
                className="input-field w-full pl-6 pr-6"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                placeholder="WhatsApp Connection"
                className="input-field w-full pl-6 pr-6"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-5 flex items-center justify-center gap-4 group active:scale-95 transition-all shadow-2xl shadow-brand-primary/20"
            disabled={loading || !name.trim()}
          >
            <span className="text-lg font-black uppercase tracking-widest">
              {loading ? 'Initializing...' : 'Get Boarding Pass'}
            </span>
            <UserPlus className="group-hover:translate-x-1 transition-transform" size={24} />
          </button>
        </form>

        <div className="mt-16 glass-card p-6 rounded-[32px] border-white/5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Protocol Information</p>
          <p className="text-xs text-white/40 leading-relaxed font-medium">
            A secure digital manifest entry will be generated. Present your encrypted ticket during boarding for verification by the expedition Lead.
          </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-auto pb-12 opacity-10">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Hillo Protocol</div>
      </div>
    </motion.div>
  );
}
