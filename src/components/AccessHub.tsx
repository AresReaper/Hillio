import React, { useState } from 'react';
import { Trip } from '../types';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, ShieldCheck, UserPlus, Trash2, Copy, Check, Info, AlertCircle, Zap, Shield } from 'lucide-react';

interface AccessHubProps {
  trip: Trip;
  onClose: () => void;
}

export default function AccessHub({ trip, onClose }: AccessHubProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'key'>('invite');

  const handleAddByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      // 1. Find user by email in 'admins' collection
      const q = query(collection(db, 'admins'), where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No user found with this email. Ask them to sign up for Hillo first.');
        setLoading(false);
        return;
      }

      const adminUser = querySnapshot.docs[0];
      const adminId = adminUser.id;

      if (trip.creatorId === adminId || trip.admins?.includes(adminId)) {
        setError('This user is already an admin.');
        setLoading(false);
        return;
      }

      // 2. Add to trip.admins
      await updateDoc(doc(db, 'trips', trip.id), {
        admins: arrayUnion(adminId)
      });

      setEmail('');
      setLoading(false);
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setError('Failed to add admin. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        admins: arrayRemove(id)
      });
    } catch (err) {
      console.error('Error removing admin:', err);
    }
  };

  const toggleAccessKey = async () => {
    const newKey = trip.accessKey ? null : Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        accessKey: newKey
      });
    } catch (err) {
      console.error('Error toggling access key:', err);
    }
  };

  const copyKey = () => {
    if (!trip.accessKey) return;
    navigator.clipboard.writeText(trip.accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTrackingId = () => {
    if (!trip.trackingId) return;
    navigator.clipboard.writeText(trip.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-card p-0 overflow-hidden border-white/5"
      >
        {/* Header Tabs */}
        <div className="flex border-b border-white/5 bg-white/5">
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 flex items-center justify-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'invite' ? 'text-[#bbff4d] bg-white/5' : 'text-white/40 hover:text-white'
            }`}
          >
            <Shield size={16} />
            Email Invite
          </button>
          <button
            onClick={() => setActiveTab('key')}
            className={`flex-1 flex items-center justify-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'key' ? 'text-[#bbff4d] bg-white/5' : 'text-white/40 hover:text-white'
            }`}
          >
            <Zap size={16} />
            Access Key
          </button>
        </div>

        <div className="p-8">
          {trip.trackingId && (
            <div className="mb-6 p-4 brand-panel border-brand-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 justify-center text-center sm:text-left">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Public Tracking ID</div>
                <div className="text-lg font-black font-display tracking-widest text-[#bbff4d] select-all">{trip.trackingId}</div>
              </div>
              <button onClick={copyTrackingId} className="flex shrink-0 items-center gap-2 px-4 py-2 border border-[#bbff4d]/30 text-[#bbff4d] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#bbff4d] hover:text-black transition-all">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {activeTab === 'invite' ? (
              <motion.div
                key="invite-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="glass p-4 rounded-2xl border-white/5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                    <Info size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">High Security</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Syncs with specific identities. Admins must have an account first. Best for permanent partners.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddByEmail} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bbff4d]/50 transition-all text-sm"
                    />
                  </div>
                  {error && (
                    <div className="text-[10px] text-red-400 font-bold flex items-center gap-2 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full btn-primary py-4"
                  >
                    {loading ? 'Searching...' : 'Add Co-Admin'}
                  </button>
                </form>

                {/* Admin List */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Current Team</h4>
                  {trip.admins?.length ? trip.admins.map(id => (
                    <div key={id} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-bold text-xs uppercase">
                          {id.substring(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-white/80">{id.substring(0, 10)}...</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveAdmin(id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-white/10 text-xs font-medium">No co-admins added yet</div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="key-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass p-4 rounded-2xl border-white/5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">High Speed Access</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Anyone with this code can manage this trip. Best for temporary volunteers. Codes can be revoked anytime.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center py-8">
                  {trip.accessKey ? (
                    <div className="space-y-6 w-full text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bbff4d]">ACTIVE SECRET KEY</div>
                      <div className="flex items-center justify-center gap-2">
                        {trip.accessKey.split('').map((char, i) => (
                          <div key={i} className="w-12 h-16 glass rounded-2xl flex items-center justify-center text-3xl font-black text-white border border-white/10 shadow-2xl">
                            {char}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={copyKey}
                          className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#bbff4d] hover:text-black transition-all"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied' : 'Copy Key'}
                        </button>
                        <button
                          onClick={toggleAccessKey}
                          className="flex items-center gap-2 px-6 py-3 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={toggleAccessKey}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-white/20 group-hover:text-[#bbff4d] group-hover:bg-[#bbff4d]/10 transition-all border border-dashed border-white/10 group-hover:border-[#bbff4d]/40 shadow-inner">
                        <Key size={40} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white mb-1">Generate Access Key</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest">Enable temporary admin access</div>
                      </div>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onClose}
          className="w-full py-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors"
        >
          Close Access Hub
        </button>
      </motion.div>
    </div>
  );
}
