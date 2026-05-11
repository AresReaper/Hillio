import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, collection, onSnapshot, query, orderBy, addDoc, setDoc, serverTimestamp, deleteDoc, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trip, User } from '../types';
import { Users, CheckCircle2, XCircle, Share2, FileUp, MapPin, MessageCircle, Bell, BellRing, Trash2, PlusCircle, LogOut, AlertTriangle, Calendar, MoreVertical, ScanLine, ShieldCheck, Home, Map as MapIcon, Sun, Moon, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { toPng } from 'html-to-image';
import SmartTicket from '../components/SmartTicket';
import QRCode from 'qrcode';
import { useAdminAuth } from '../context/AdminAuthContext';
import LeafletMap from '../components/LeafletMap';
import AccessHub from '../components/AccessHub';

export default function TripDashboard() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { logout, admin, setLastTripId } = useAdminAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      setLastTripId(tripId);
    }
  }, [tripId, setLastTripId]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showAccessHub, setShowAccessHub] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'status'>('name-asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [filterTab, setFilterTab] = useState<'all' | 'missing' | 'boarded' | 'sos' | 'nophone'>('all');
  
  // State for image generation
  const [sharingUser, setSharingUser] = useState<User | null>(null);
  const [sharingQrUrl, setSharingQrUrl] = useState('');
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDeleteTrip = async () => {
    if (!tripId) return;
    setIsDeleting(true);
    try {
      // 1. Delete all users in the subcollection
      const usersRef = collection(db, 'trips', tripId, 'users');
      const usersSnap = await getDocs(usersRef);
      const batch = writeBatch(db);
      usersSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Delete the trip document itself
      await deleteDoc(doc(db, 'trips', tripId));
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting trip:', error);
      handleFirestoreError(error, OperationType.DELETE, `trips/${tripId}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !manualName.trim()) return;

    setIsAddingManual(true);
    try {
      const docRef = await addDoc(collection(db, 'trips', tripId, 'users'), {
        name: manualName.trim(),
        phone: manualPhone.trim(),
        email: manualEmail.trim(),
        status: 'Not Boarded',
        joinedAt: serverTimestamp(),
      });
      
      const newUsers = [{
        id: docRef.id,
        name: manualName.trim(),
        phone: manualPhone.trim(),
        email: manualEmail.trim(),
        tripId
      }];

      if (manualEmail.trim()) {
        try {
          const res = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: newUsers, tripName: trip?.name || 'Your Trip' })
          });
          const result = await res.json();
          if (result.missingKeys) {
            alert(`Passenger added successfully, but email skipped because SMTP credentials are missing.\n\nDebug Info:\nSMTP_USER Configured: ${result.debug?.SMTP_USER_present}\nSMTP_PASS Configured: ${result.debug?.SMTP_PASS_present}`);
          } else if (result.results && result.results[0]?.error) {
            alert(`Passenger added, but email failed: ${result.results[0].error}`);
          } else {
            alert(`Passenger added successfully! Email notification sent.`);
          }
        } catch (e) {
          console.error("Failed to send notification:", e);
        }
      }

      setManualName('');
      setManualPhone('');
      setManualEmail('');
      setShowManualAdd(false);
    } catch (error) {
      console.error('Error adding passenger:', error);
      handleFirestoreError(error, OperationType.WRITE, `trips/${tripId}/users`);
    } finally {
      setIsAddingManual(false);
    }
  };

  const handleResolveSOS = async (userId: string) => {
    if (!tripId) return;
    try {
      await updateDoc(doc(db, 'trips', tripId, 'users', userId), {
        'sos.active': false
      });
    } catch (error) {
      console.error("Error resolving SOS:", error);
    }
  };

  const getCountdown = () => {
    if (!trip?.tripDate) return null;
    const now = new Date();
    const tripDate = trip.tripDate.toDate();
    const diff = tripDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Trip Passed';
    if (days === 0) return 'Trip Today!';
    return `${days} Days to Go`;
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive alerts when passengers are boarded.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const generateShortLink = async (targetUrl: string) => {
    try {
      const response = await fetch(`/api/shorten?url=${encodeURIComponent(targetUrl)}`);
      if (response.ok) {
        const data = await response.json();
        return data.shortUrl;
      }
    } catch (e) {
      console.warn("TinyURL failed", e);
    }

    // Fallback to internal
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortId = '';
    for (let i = 0; i < 6; i++) {
        shortId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    await setDoc(doc(db, 'short_links', shortId), {
        shortId,
        targetUrl: targetUrl.split(window.location.host)[1] || targetUrl,
        createdAt: serverTimestamp()
    });
    
    return shortId;
  };

  const shareToWhatsApp = async (user: User) => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      // 1. Generate short URL
      const publicOrigin = window.location.origin.replace('ais-dev', 'ais-pre');
      const longUrl = `${publicOrigin}/trip/${tripId}/user/${user.id}`;
      let passUrl = longUrl;
      
      try {
        const result = await generateShortLink(longUrl);
        if (result.startsWith('http')) {
          passUrl = result;
        } else {
          passUrl = `${publicOrigin}/s/${result}`;
        }
      } catch (e) {
        console.warn('Failed to generate short link, falling back to long url', e);
      }

      // 2. Generate QR code for this user
      const qrData = JSON.stringify({ t: tripId, u: user.id });
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 1,
        color: { dark: '#064e3b', light: '#ffffff' }
      });

      // 3. Set state to render the hidden ticket
      setSharingUser(user);
      setSharingQrUrl(qrUrl);

      // 4. Wait for React to render the component
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!ticketRef.current) throw new Error('Ticket element not found');

      // 5. Capture the ticket as a PNG image
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#020617', // Match App background
        width: 400,
        height: 600,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      });

      // 6. Convert to File for sharing
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `ticket-${user.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      const text = `Hi ${user.name}, here is your Smart Ticket for ${trip?.name}!\n\nView Online: ${passUrl}`;
      const phone = user.phone?.replace(/\D/g, '') || '';

      // 7. Share or Fallback
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${trip?.name} Smart Ticket`,
          text: text,
          files: [file]
        });
      } else {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          alert('Smart Ticket image copied to clipboard!\n\nWhen WhatsApp opens, just PASTE (Ctrl+V) the image into the chat.');
        } catch (e) {
          console.warn('Clipboard failed', e);
        }
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to generate ticket image. Sending link instead.');
      const phone = user.phone?.replace(/\D/g, '') || '';
      const publicOrigin = window.location.origin.replace('ais-dev', 'ais-pre');
      const fallbackUrl = `${publicOrigin}/trip/${tripId}/user/${user.id}`;
      const text = `Hi ${user.name}, here is your Smart Ticket for ${trip?.name}!\n\nView Online: ${fallbackUrl}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } finally {
      setSharingUser(null);
      setSharingQrUrl('');
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (!tripId) return;

    const tripUnsub = onSnapshot(doc(db, 'trips', tripId), (docSnap) => {
      if (docSnap.exists()) {
        const tripData = { id: docSnap.id, ...docSnap.data() } as Trip;
        // Verify ownership/admin rights
        const isCreator = tripData.creatorId === admin?.uid;
        const isAdminMember = tripData.admins?.includes(admin?.uid || '');
        
        if (admin && !isCreator && !isAdminMember) {
          navigate('/', { replace: true });
          return;
        }
        setTrip(tripData);
      } else {
        navigate('/', { replace: true });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `trips/${tripId}`);
    });

    return () => {
      tripUnsub();
    };
  }, [tripId, admin, navigate]);

  useEffect(() => {
    if (!tripId || !trip) return;
    
    const usersUnsub = onSnapshot(
      collection(db, 'trips', tripId, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `trips/${tripId}/users`);
      }
    );

    return () => {
      usersUnsub();
    };
  }, [tripId, trip]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tripId || !trip) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        
        // Filter out empty rows
        const validData = data.filter(row => row.Name);
        
        if (validData.length > 0) {
          // Filter out duplicates
          const existingPhones = new Set(users.map(u => u.phone).filter(Boolean));
          const existingEmails = new Set(users.map(u => u.email).filter(Boolean));
          
          const uniqueNewUsers = validData.filter(row => {
            const phone = row.Phone ? String(row.Phone) : '';
            const email = row.Email ? String(row.Email) : '';
            
            if (phone && existingPhones.has(phone)) return false;
            if (email && existingEmails.has(email)) return false;
            
            return true;
          });

          if (uniqueNewUsers.length === 0) {
            alert('All users in this file have already been imported!');
          } else {
            setPreviewData(uniqueNewUsers);
            setSkippedCount(validData.length - uniqueNewUsers.length);
          }
        } else {
          alert('No valid users found in the Excel file. Please ensure there is a "Name" column.');
        }
      } catch (error) {
        console.error('Excel parse error:', error);
        alert('Failed to parse Excel file.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!previewData || !tripId || !trip) return;

    setImporting(true);
    setImportStatus(`Adding ${previewData.length} new users to database...`);
    
    try {
      const newUsers = [];

      for (const row of previewData) {
        const docRef = await addDoc(collection(db, 'trips', tripId, 'users'), {
          name: row.Name,
          phone: row.Phone ? String(row.Phone) : '',
          email: row.Email ? String(row.Email) : '',
          status: 'Not Boarded',
          joinedAt: serverTimestamp(),
        });
        newUsers.push({
          id: docRef.id,
          name: row.Name,
          phone: row.Phone ? String(row.Phone) : '',
          email: row.Email ? String(row.Email) : '',
          tripId
        });
      }

      setImportStatus('Sending QR codes via Email...');
      
      // Call backend to send notifications
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: newUsers, tripName: trip.name })
      });
      
      const result = await response.json();
      
      const skippedMsg = skippedCount > 0 ? `\n\nSkipped ${skippedCount} duplicate users.` : '';

      if (result.missingKeys) {
        alert(`Successfully imported ${newUsers.length} new users!${skippedMsg}\n\nNote: Automatic Email notifications were skipped because SMTP credentials are not configured.\n\nDebug Info: \nUser Configured: ${result.debug?.SMTP_USER_present}\nPass Configured: ${result.debug?.SMTP_PASS_present}`);
      } else {
        const errors = result.results?.filter((r: any) => r.error) || [];
        if (errors.length > 0) {
          alert(`Successfully imported ${newUsers.length} new users!${skippedMsg}\n\nWARNING: ${errors.length} emails failed to send. Example error: ${errors[0].error}`);
        } else {
          alert(`Successfully imported ${newUsers.length} new users!${skippedMsg}\n\nEmails sent successfully to passengers with configured email addresses.`);
        }
      }
    } catch (error) {
      console.error('Excel import error:', error);
      handleFirestoreError(error, OperationType.WRITE, `trips/${tripId}/users`);
    } finally {
      setImporting(false);
      setImportStatus('');
      setPreviewData(null);
      setSkippedCount(0);
    }
  };

  const cancelImport = () => {
    setPreviewData(null);
  };

  if (loading) return <div className="p-6 text-center text-white/50">Loading trip details...</div>;
  if (!trip) return <div className="p-6 text-center text-white/50">Trip not found.</div>;

  const boardedCount = users.filter(u => u.status === 'Boarded').length;
  const missingCount = users.length - boardedCount;
  const progressPercent = users.length === 0 ? 0 : Math.round((boardedCount / users.length) * 100);

  const filteredUsers = users.filter(u => {
    if (filterTab === 'missing') return u.status !== 'Boarded';
    if (filterTab === 'boarded') return u.status === 'Boarded';
    if (filterTab === 'sos') return u.sos?.active;
    if (filterTab === 'nophone') return !u.phone;
    return true; // 'all'
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (sortOption === 'status') {
      if (a.status === b.status) {
        return a.name.localeCompare(b.name);
      }
      return a.status === 'Boarded' ? -1 : 1;
    }
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <AnimatePresence>
        {showAccessHub && (
          <AccessHub trip={trip} onClose={() => setShowAccessHub(false)} />
        )}
      </AnimatePresence>
      {/* Header Section */}
      <div className="relative h-64 rounded-b-[48px] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden rounded-b-[48px]">
          {trip.destination ? (
            <div className="absolute inset-0 opacity-40 grayscale group">
              <LeafletMap address={trip.destination} height="100%" adminName={admin?.username || 'GP'} />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
            </div>
          ) : (
            <div className="absolute inset-0 premium-gradient opacity-20" />
          )}
        </div>
        
        <div className="relative h-full flex flex-col justify-end p-8 gap-1 pointer-events-none">
          {/* We've removed the cross, bell, and three dots buttons here to keep map visible */}
          
          <motion.h1 
            layoutId={`trip-title-${trip.id}`}
            className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-1 leading-tight"
          >
            {trip.name}
          </motion.h1>
          <div className="flex items-center gap-3">
            {trip.destination && (
              <div className="flex items-center gap-1.5 text-brand-primary text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                <MapPin size={12} />
                <span>{trip.destination}</span>
              </div>
            )}
            {trip.tripDate && (
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-black uppercase tracking-widest">
                <Calendar size={12} />
                <span>{trip.tripDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-white/10">•</span>
                <span className="text-brand-primary/60">{getCountdown()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 -mt-10 relative z-10 space-y-8">
        
        {/* Progress Bar Section */}
        <div className="brand-panel p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Boarding Progress</div>
              <div className="text-2xl font-bold font-display text-white">
                <span className="text-brand-primary">{boardedCount}</span> <span className="text-white/30">/</span> {users.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-display text-brand-primary drop-shadow-[0_0_10px_rgba(187,255,77,0.3)]">{progressPercent}%</div>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-brand-primary rounded-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
            </motion.div>
          </div>
        </div>
        {/* SOS Grid */}
        {users.filter(u => u.sos?.active).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 pl-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              Critical Alerts
            </h3>
            {users.filter(u => u.sos?.active).map(u => (
              <motion.div 
                key={u.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-5 bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-[32px] flex items-center justify-between shadow-lg shadow-red-500/5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20 animate-pulse relative">
                    <AlertTriangle size={24} />
                    <div className="absolute -inset-1 bg-red-500/20 blur-lg rounded-full" />
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-widest text-red-400">SOS: {u.name}</div>
                    <div className="text-xs text-white/50">{u.sos?.message || 'Emergency assistance requested'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {u.sos?.location && (
                    <a 
                      href={`https://www.google.com/maps?q=${u.sos.location.lat},${u.sos.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 glass rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <MapPin size={20} />
                    </a>
                  )}
                  <button 
                    onClick={() => handleResolveSOS(u.id)}
                    className="w-10 h-10 glass rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center rounded-[28px] border-white/5 shadow-xl shadow-white/5">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3 mx-auto text-white/40">
              <Users size={18} />
            </div>
            <div className="text-2xl font-black font-display text-white">{users.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mt-1">Passengers</div>
          </div>
          <div className="glass-card p-4 text-center rounded-[28px] border-brand-primary/20 shadow-xl shadow-brand-primary/5">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-3 mx-auto text-brand-primary">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-2xl font-black font-display text-brand-primary">{boardedCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-primary/40 font-bold mt-1">Boarded</div>
          </div>
          <div className="glass-card p-4 text-center rounded-[28px] border-red-500/10 shadow-xl shadow-red-500/5">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-3 mx-auto text-red-400">
              <XCircle size={18} />
            </div>
            <div className="text-2xl font-black font-display text-red-400">{missingCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-red-400/40 font-bold mt-1">Missing</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-6 px-6 gap-2 no-scrollbar justify-start sm:justify-center">
          {[
            { id: 'all', label: 'All' },
            { id: 'missing', label: 'Missing' },
            { id: 'boarded', label: 'Boarded' },
            { id: 'sos', label: 'SOS Alerts' },
            { id: 'nophone', label: 'No Phone' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                filterTab === tab.id 
                  ? "bg-brand-primary text-night-ink" 
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Management Controls</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowManualAdd(true)}
              className="flex items-center justify-center gap-3 p-4 glass-card rounded-[24px] border-white/5 hover:border-brand-primary/30 transition-all text-sm font-bold text-white group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-slate-900 transition-all">
                <PlusCircle size={18} />
              </div>
              <span>Add Guest</span>
            </button>
            <label className="cursor-pointer flex items-center justify-center gap-3 p-4 glass-card rounded-[24px] border-white/5 hover:border-brand-primary/30 transition-all text-sm font-bold text-white group">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-slate-900 transition-all">
                <FileUp size={18} />
              </div>
              <span>Import Manifest</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} disabled={importing} />
            </label>
            {missingCount > 0 && (
              <button
                onClick={() => {
                  const unboarded = users.filter(u => u.status !== 'Boarded');
                  const names = unboarded.map(u => u.name).join(', ');
                  const text = `⚠️ *FINAL CALL* ⚠️\n\nHi everyone, the trip to ${trip?.destination || trip?.name} is boarding NOW. \n\nWe are waiting for: ${names}.\n\nPlease head to the boarding gate immediately.`;
                  navigator.clipboard.writeText(text);
                  alert('Final Call message copied to clipboard!\n\nPaste it into your WhatsApp Group to alert the missing passengers.');
                }}
                className="col-span-2 flex items-center justify-center gap-3 p-4 bg-[#bbff4d]/10 border border-[#bbff4d]/30 hover:bg-[#bbff4d]/20 rounded-[24px] transition-all text-sm font-bold text-[#bbff4d] group"
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span>Broadcast Final Call ({missingCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Add Form */}
        <AnimatePresence>
          {showManualAdd && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 border-brand-primary/20 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle size={16} className="text-brand-primary" />
                <span className="text-sm font-bold uppercase tracking-widest text-white/60">New Passenger</span>
              </div>
              <form onSubmit={handleManualAdd} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="input-field w-full"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Connection"
                    className="input-field w-full"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="input-field w-full"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isAddingManual} className="btn-primary flex-1 py-4">
                    {isAddingManual ? 'Registering...' : 'Complete Registration'}
                  </button>
                  <button type="button" onClick={() => setShowManualAdd(false)} className="px-6 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-white/40">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Excel Preview Modal */}
        <AnimatePresence>
          {previewData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 border-brand-primary/20"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                <FileUp size={16} />
                Verify Import Log ({previewData.length})
              </h3>
              {skippedCount > 0 && (
                <p className="text-[10px] text-brand-primary/60 mb-3 font-bold uppercase tracking-widest">
                  Skipping {skippedCount} duplicate identities
                </p>
              )}
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {previewData.map((row, i) => (
                  <div key={i} className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <span className="font-bold text-white/80">{row.Name}</span>
                    <span className="text-white/30">{row.Phone || 'No contact'}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={confirmImport} disabled={importing} className="btn-primary flex-1 py-4">
                  {importing ? importStatus || 'Syncing...' : 'Confirm manifest'}
                </button>
                <button onClick={cancelImport} disabled={importing} className="px-6 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-white/40">
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participant List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Passenger Manifest ({users.length})</h2>
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-brand-primary outline-none cursor-pointer"
            >
              <option value="name-asc" className="bg-slate-900">A-Z</option>
              <option value="name-desc" className="bg-slate-900">Z-A</option>
              <option value="status" className="bg-slate-900">Status</option>
            </select>
          </div>

          <div className="space-y-3">
            {sortedUsers.length === 0 ? (
              <div className="py-16 glass-card rounded-[32px] text-center text-white/10 flex flex-col items-center gap-4 border-dashed border-white/5">
                <Users size={48} className="opacity-10" />
                <span className="text-sm font-medium tracking-wide">Manifest is currently empty</span>
              </div>
            ) : (
              sortedUsers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedUser(user)}
                  className="p-4 glass-card rounded-[28px] border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                      user.status === 'Boarded' 
                        ? "bg-brand-primary text-slate-950 shadow-brand-primary/20" 
                        : "bg-white/5 text-white/20 border border-white/10"
                    )}>
                      {user.status === 'Boarded' ? <CheckCircle2 size={24} /> : <Users size={20} />}
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-white group-hover:text-brand-primary transition-colors">{user.name}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{user.phone || 'No direct dial'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToWhatsApp(user);
                        }}
                        disabled={isSharing}
                        className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <MessageCircle size={18} />
                      </button>
                    )}
                    <div className={cn(
                      "status-badge",
                      user.status === 'Boarded' 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      {user.status}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hidden Components */}
      <div className="fixed -left-[9999px] top-0">
        {sharingUser && (
          <div ref={ticketRef} className="bg-slate-950 p-10">
            <SmartTicket user={sharingUser} trip={trip} qrUrl={sharingQrUrl} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card p-10 border-red-500/30 text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-red-500/30">
                <AlertTriangle className="text-red-400" size={40} />
              </div>
              <h3 className="text-2xl font-black font-display text-white mb-2">Final Archive?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed px-4">
                This will permanently remove <span className="text-white font-bold">"{trip.name}"</span> and all historical passenger logs.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteTrip}
                  disabled={isDeleting}
                  className="w-full py-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-500/20"
                >
                  {isDeleting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Erase Trip</span>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-4 glass text-white/40 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors hover:text-white"
                >
                  Keep Journey
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-10 w-full max-w-sm border-brand-primary/20 text-center"
            >
              <div className={cn(
                "w-24 h-24 rounded-[32px] flex items-center justify-center mb-6 mx-auto transition-all shadow-2xl",
                selectedUser.status === 'Boarded' 
                  ? "bg-brand-primary text-slate-950 shadow-brand-primary/20" 
                  : "bg-white/5 text-white/20 border border-white/10"
              )}>
                {selectedUser.status === 'Boarded' ? <CheckCircle2 size={48} /> : <Users size={40} />}
              </div>

              <h3 className="text-2xl font-black font-display text-white mb-2">{selectedUser.name}</h3>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">{selectedUser.phone || 'No contact credentials'}</div>
              
              <div className="space-y-10">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</div>
                    <div className={cn(
                      "status-badge",
                      selectedUser.status === 'Boarded' 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      {selectedUser.status}
                    </div>
                  </div>
                  {selectedUser.boardedAt && (
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Boarded At</div>
                      <div className="text-xs font-bold text-white/80">
                        {selectedUser.boardedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedUser.phone && (
                  <button
                    onClick={() => {
                      window.location.href = `tel:${selectedUser.phone}`;
                      setSelectedUser(null);
                    }}
                    className="w-full py-5 bg-brand-primary text-slate-950 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Phone size={20} />
                    <span>Call via Phone</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-4 glass text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors hover:text-white"
                >
                  Dismiss Intel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] pointer-events-auto bg-black/5" 
              onClick={() => setShowMoreMenu(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed right-6 bottom-24 w-56 glass-card p-2 z-[70] shadow-2xl backdrop-blur-3xl border-brand-primary/20 pointer-events-auto origin-bottom-right"
            >
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowAccessHub(true);
                }}
                className="flex items-center gap-3 w-full p-4 text-sm text-white hover:bg-[#bbff4d]/10 hover:text-[#bbff4d] rounded-2xl transition-colors group"
              >
                <ShieldCheck size={18} className="text-[#bbff4d] group-hover:scale-110 transition-transform" />
                <span>Manage Access</span>
              </button>
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center gap-3 w-full p-4 text-sm text-red-100 hover:bg-red-500/10 rounded-2xl transition-colors group"
              >
                <Trash2 size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                <span>Archive Trip</span>
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full p-4 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-colors"
              >
                <LogOut size={18} />
                <span>End Session</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Embedded Bottom Navigation for TripDashboard */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center gap-4 pointer-events-none">
        {admin && (
          <div className="brand-panel bg-card-forest !rounded-full px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest pointer-events-auto shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(187,255,77,0.8)]" />
            {admin.username}
          </div>
        )}
        <nav className="brand-panel bg-card-forest !rounded-full px-6 py-3 flex items-center gap-6 sm:gap-8 shadow-2xl pointer-events-auto transition-colors duration-300 relative">
           <Link to="/" className="text-white/40 hover:text-white flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95 cursor-pointer">
             <Home size={22} />
           </Link>
           <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white/40 hover:text-white flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95 cursor-pointer">
             <MapIcon size={22} />
           </button>
           
           <Link to={`/trip/${tripId}/scanner`} className="relative -mt-8 flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10 mx-2">
             <div className="w-16 h-16 rounded-full bg-brand-primary text-night-ink flex items-center justify-center shadow-[0_0_30px_rgba(187,255,77,0.4)] border-[6px] border-deep-forest">
                <ScanLine size={28} />
             </div>
           </Link>
           
           <button 
             onClick={requestNotificationPermission}
             className={cn(
               "flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95 cursor-pointer",
               notificationsEnabled ? 'text-info-sky drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-white/40 hover:text-white'
             )}
           >
             {notificationsEnabled ? <BellRing size={22} /> : <Bell size={22} />}
           </button>
           <button 
             onClick={() => setShowMoreMenu(!showMoreMenu)}
             className="text-white/40 hover:text-white flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95 cursor-pointer"
           >
             <MoreVertical size={22} />
           </button>
        </nav>
      </div>
    </motion.div>
  );
}
