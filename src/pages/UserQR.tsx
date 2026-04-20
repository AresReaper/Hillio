import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Trip } from '../types';
import { Share2, MapPin, Ticket as TicketIcon, XCircle, Clock, AlertTriangle, CheckCircle2, Cloud, Sun, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import SmartTicket from '../components/SmartTicket';
import DigitalSouvenir from '../components/DigitalSouvenir';
import { toPng } from 'html-to-image';
import LeafletMap from '../components/LeafletMap';
import { cn } from '../lib/utils';

export default function UserQR() {
  const { tripId, userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [sosLoading, setSosLoading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // New Features State
  const [weather, setWeather] = useState<{temp: number, condition: string} | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (!trip?.destination) return;
    
    // Fetch Weather Sentinel Data (Open-Meteo)
    const fetchWeather = async () => {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip.destination!)}&count=1`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          if (weatherData.current_weather) {
            const code = weatherData.current_weather.weathercode;
            let condition = 'Clear / Varies';
            if (code <= 3) condition = 'Clear / Cloudy';
            else if (code <= 48) condition = 'Foggy';
            else if (code <= 69) condition = 'Rainy';
            else if (code <= 79) condition = 'Snowy';
            else condition = 'Stormy';
            
            setWeather({
              temp: Math.round(weatherData.current_weather.temperature),
              condition
            });
          }
        }
      } catch (e) {
        console.warn("Weather Sentinel failed to load", e);
      }
    };
    
    // Only fetch weather if we haven't already
    if (!weather) {
      fetchWeather();
    }
  }, [trip?.destination, weather]);

  const loadSmartGuide = async () => {
    if (!trip?.destination) return;
    if (tips.length > 0) {
      setShowTips(!showTips);
      return;
    }
    
    setLoadingTips(true);
    try {
      const res = await fetch('/api/smart-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: trip.destination })
      });
      const data = await res.json();
      if (data.tips) {
        setTips(data.tips);
        setShowTips(true);
      }
    } catch (e) {
      console.error(e);
      alert('AI Guide could not be loaded right now (Server disconnected/No AI key).');
    } finally {
      setLoadingTips(false);
    }
  };

  useEffect(() => {
    if (!trip?.tripDate) return;

    const calculateTimeLeft = () => {
      const expiryTime = trip.tripDate.toDate().getTime() + (24 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [trip]);

  useEffect(() => {
    if (!tripId || !userId) return;

    // Listen to Trip details for real-time updates (destination, name, etc.)
    const tripUnsub = onSnapshot(doc(db, 'trips', tripId), (doc) => {
      if (doc.exists()) {
        setTrip({ id: doc.id, ...doc.data() } as Trip);
      }
    });

    const userUnsub = onSnapshot(doc(db, 'trips', tripId, 'users', userId), (doc) => {
      if (doc.exists()) {
        const userData = { id: doc.id, ...doc.data() } as User;
        setUser(userData);
        
        // Generate QR code with tripId and userId
        const qrData = JSON.stringify({ t: tripId, u: userData.id });
        QRCode.toDataURL(qrData, {
          width: 400,
          margin: 1,
          color: {
            dark: '#064e3b', // emerald-900 for high contrast
            light: '#ffffff'
          }
        }).then(url => setQrUrl(url));
      }
      setLoading(false);
    });

    return () => {
      tripUnsub();
      userUnsub();
    };
  }, [tripId, userId]);

  if (loading) return <div className="p-6 text-center text-white/50">Loading your smart ticket...</div>;
  if (!user) return <div className="p-6 text-center text-white/50">User not found.</div>;

  const isExpired = trip?.tripDate ? (new Date().getTime() > trip.tripDate.toDate().getTime() + (24 * 60 * 60 * 1000)) : false;

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 pt-20 flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-8 border border-red-500/30 backdrop-blur-md">
          <XCircle className="text-red-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4 tracking-tight text-red-400">Ticket Expired</h1>
        <p className="text-white/60 mb-8 max-w-[280px]">
          This boarding pass for <span className="text-white font-bold">{trip?.name}</span> is no longer valid as the trip date has passed.
        </p>
        <div className="text-[10px] text-white/20 uppercase tracking-widest">
          Security Protocol Active
        </div>
      </motion.div>
    );
  }

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
    
    // Fallback to internal shortener if TinyURL fails
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

  const handleShare = async () => {
    if (isSharing || !ticketRef.current) return;
    setIsSharing(true);

    try {
      // 1. URL Generation
      const publicOrigin = window.location.origin.replace('ais-dev', 'ais-pre');
      const longUrl = `${publicOrigin}/trip/${tripId}/user/${userId}`;
      let finalUrl = longUrl;
      
      try {
        const result = await generateShortLink(longUrl);
        if (result.startsWith('http')) {
          // It's a TinyURL
          finalUrl = result;
        } else {
          // It's an internal short code mapped to the domain
          finalUrl = `${publicOrigin}/s/${result}`;
        }
      } catch (e) {
        console.warn('Failed to shorten entirely', e);
      }

      // Capture the ticket as a PNG image
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#020617',
        width: 400,
        height: 600,
        style: {
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'smart-ticket.png', { type: 'image/png' });

      const shareData: ShareData = {
        title: `Smart Ticket - ${user?.name}`,
        text: `Here is my smart ticket for ${trip?.name || 'the trip'}.`,
        url: finalUrl,
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(finalUrl);
        alert('Link copied to clipboard: ' + finalUrl);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const publicUrl = window.location.href.replace('ais-dev', 'ais-pre');
        await navigator.clipboard.writeText(publicUrl);
        alert('Sharing failed. Long link copied to clipboard.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleSOS = async () => {
    if (!tripId || !userId) return;
    
    if (user?.sos?.active) {
      const confirm = window.confirm("Are you safe now? This will deactivate the SOS alert.");
      if (!confirm) return;
      
      setSosLoading(true);
      try {
        await updateDoc(doc(db, 'trips', tripId, 'users', userId), {
          'sos.active': false
        });
      } catch (e) {
        console.error(e);
      } finally {
        setSosLoading(false);
      }
      return;
    }

    const confirm = window.confirm("⚠️ EMERGENCY: Are you sure you want to send an SOS alert? This will send your current location to the trip organizers immediately.");
    if (!confirm) return;

    setSosLoading(true);
    try {
      let location = null;
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              timeout: 10000,
              enableHighAccuracy: true 
            });
          });
          location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
        } catch (geoError) {
          console.warn("Geolocation failed:", geoError);
        }
      }

      await updateDoc(doc(db, 'trips', tripId, 'users', userId), {
        sos: {
          active: true,
          location,
          timestamp: serverTimestamp(),
          message: "I need help / I am lost"
        }
      });
      alert("🆘 SOS Alert Sent! Stay where you are. The organizers have been notified and can see your location.");
    } catch (error) {
      console.error("SOS Error:", error);
      alert("Failed to send SOS. Please try to call the organizer or emergency services directly.");
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12 flex flex-col items-center min-h-screen bg-[#161917] text-white"
    >
      <div className="w-full flex justify-center items-center mb-8">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <TicketIcon className="text-[#bbff4d]" size={20} />
          Smart Ticket
        </h1>
      </div>

      <div ref={ticketRef}>
        <SmartTicket user={user} trip={trip} qrUrl={qrUrl} />
      </div>

      {trip?.tripDate && !isExpired && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#bbff4d]/10 border border-[#bbff4d]/20 rounded-full">
          <Clock className="text-[#bbff4d]" size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#bbff4d]/80">
            Valid for: <span className="text-white">{timeLeft}</span>
          </span>
        </div>
      )}

      {trip?.destination && (
        <div className="mt-6 w-full max-w-sm space-y-4">
          <div className="bg-[#2A2E2B] border border-white/5 rounded-[32px] p-4 text-left shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#bbff4d] font-bold">
                <MapPin size={18} />
                <span>Meeting Point</span>
              </div>
              {weather && (
                <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full text-xs font-bold border border-sky-500/20">
                  {weather.condition.includes('Clear') ? <Sun size={14} /> : <Cloud size={14} />}
                  {weather.temp}°C • {weather.condition}
                </div>
              )}
            </div>
            
            <div className="rounded-xl overflow-hidden mb-3 border border-white/10">
              <LeafletMap address={trip.destination} height="150px" />
            </div>
            <a
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(trip.destination)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation size={16} />
              Navigate
            </a>
          </div>

          <div className="bg-[#2A2E2B] border border-white/5 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02)] transition-all">
            <button 
              onClick={loadSmartGuide}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  {loadingTips ? <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> : <Sparkles size={20} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">AI Smart Guide</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Local tips for {trip.destination}</div>
                </div>
              </div>
            </button>
            <AnimatePresence>
              {showTips && tips.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 border-t border-white/5"
                >
                  <ul className="mt-4 space-y-3">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-white/70 leading-relaxed flex items-start gap-3 bg-white/5 p-3 rounded-2xl">
                        <span className="text-purple-400 font-black mt-0.5">{idx + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4 w-full max-w-sm">
        <button 
          onClick={handleSOS} 
          disabled={sosLoading}
          className={cn(
            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
            user?.sos?.active 
              ? "bg-[#bbff4d]/20 border border-[#bbff4d]/50 text-[#bbff4d]" 
              : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
          )}
        >
          {sosLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : user?.sos?.active ? (
            <>
              <CheckCircle2 size={20} />
              I am Safe Now
            </>
          ) : (
            <>
              <AlertTriangle size={20} />
              Emergency SOS
            </>
          )}
        </button>

        <button onClick={handleShare} className="w-full py-4 bg-white hover:bg-gray-100 text-[#161917] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
          <Share2 size={18} />
          Share Ticket
        </button>
        <p className="text-[10px] text-white/20 leading-relaxed text-center px-8">
          This is your unique boarding pass. Please keep it ready for scanning at the meeting point.
        </p>

        {/* Sponsor / Ad Banner Space */}
        <div className="w-full mt-6 bg-[#2A2E2B] border border-white/5 rounded-[24px] p-4 text-center">
          <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Advertisement / Sponsored</div>
          <a href="#" className="block w-full h-20 bg-white/5 rounded-xl border-2 border-dashed border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center flex-col">
            <span className="text-white/60 font-bold text-sm">Your Ad Here</span>
            <span className="text-white/40 text-[10px] mt-1">Contact admin to place an ad</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
