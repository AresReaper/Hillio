import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  QrCode, ShieldAlert, Shield, Mountain, Compass, Globe, Activity, 
  RefreshCw, Zap, Calendar, Users, MessageCircle, AlertTriangle, Play,
  Signal, Wifi, Battery, Bell, Target, Wind, Sun, CloudRain, Check, 
  AlertCircle, X, ChevronRight, ShieldCheck, MapPin, Mail, ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  // Scroll parallax perspective elements
  const mockupContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mockupContainerRef,
    offset: ["start end", "end start"]
  });

  // Dynamic 3D tilt values synced to scroll position
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 25]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-12, -22]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-1.5, -4.5]);

  // Mobile/desktop adaptive state
  const [activeTab, setActiveTab] = useState<'ticket' | 'monitor' | 'sos' | 'meteo'>('sos');
  
  // Simulator: Smart Ticket State
  const [selectedPassenger, setSelectedPassenger] = useState('Marcus Chen');
  const [boardingStatus, setBoardingStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [checkedInList, setCheckedInList] = useState<string[]>([
    'Alice Smith', 'Bob Johnson', 'Claire Thompson', 'David Miller', 
    'Emma Davis', 'Frank Wilson', 'Grace Martinez', 'Henry Taylor', 'Isabella Anderson'
  ]);
  
  // Simulator: SOS Map State
  const [sosResolved, setSosResolved] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'notified' | 'enroute' | 'resolved'>('idle');
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    '10:14:02 AM - SOS Trigger received from distress beacon.',
    '10:14:15 AM - Automated response link generated.',
    '10:15:00 AM - Sat-comm lock finalized on Summit Ridge Trail.'
  ]);

  // Simulator: Weather alert state
  const [weatherAlertActive, setWeatherAlertActive] = useState(true);

  // SOS Communication & Trail Planner States
  const [broadcastMessage, setBroadcastMessage] = useState('Status: Moving steady. Continuing to high camp.');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedSummit, setSelectedSummit] = useState('Mont Blanc');
  const [backpackWeight, setBackpackWeight] = useState(12);
  const [climbingGroupSize, setClimbingGroupSize] = useState(6);

  const handleSendSatelliteBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setSimulatedLogs(prev => [
      `10:18:04 AM - SATELLITE BROADCAST: "${broadcastMessage}" successfully relayed to group screens.`,
      ...prev
    ]);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 4000);
  };

  // ROI Calculator State
  const [expeditions, setExpeditions] = useState(8);
  const [passengers, setPassengers] = useState(15);
  const [overheadTime, setOverheadTime] = useState(6); // minutes saved per passenger

  // Scroll popup notification state
  const [showPopup, setShowPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);

  // Triggering the scroll popup alarm
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !popupDismissed && !sosResolved) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popupDismissed, sosResolved]);

  // Simulate boarding QR scan
  const triggerScan = () => {
    if (boardingStatus !== 'idle') return;
    setBoardingStatus('scanning');
    
    setTimeout(() => {
      setBoardingStatus('success');
      if (!checkedInList.includes(selectedPassenger)) {
        setCheckedInList(prev => [...prev, selectedPassenger]);
      }
      setTimeout(() => {
        setBoardingStatus('idle');
      }, 2000);
    }, 1500);
  };

  // Dispatch response team handler
  const handleDispatch = (action: 'notify' | 'send' | 'resolve') => {
    if (action === 'notify') {
      setDispatchStatus('notified');
      setSimulatedLogs(prev => [
        `10:17:34 AM - Alpine Backcountry Ranger unit notified.`,
        ...prev
      ]);
    } else if (action === 'send') {
      setDispatchStatus('enroute');
      setSimulatedLogs(prev => [
        `10:18:12 AM - Rescue chopper Wayfarer One en route to coordinates.`,
        ...prev
      ]);
    } else if (action === 'resolve') {
      setDispatchStatus('resolved');
      setSosResolved(true);
      setSimulatedLogs(prev => [
        `10:19:45 AM - Rescue team arrived. Signal marked as safe and resolved.`,
        ...prev
      ]);
      setShowPopup(false);
    }
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mathematical variables for ROI calculator
  const hourlyRate = 45; // USD/hour standard guide rates
  const manualHoursSpent = (expeditions * passengers * overheadTime) / 60;
  const automatedHoursSpent = (expeditions * passengers * 0.1) / 60; // 6 seconds per QR boarding check
  const hoursSaved = Math.max(0, manualHoursSpent - automatedHoursSpent);
  const moneySaved = Math.round(hoursSaved * hourlyRate);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-[#D8FF3E]/30 selection:text-white">
      
      {/* Cinematic Ambient Background Blur and Glow Effects */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#D8FF3E]/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* STICKY GLASS HEADBAR */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-4 backdrop-blur-md bg-[#050505]/60 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#D8FF3E]/10 flex items-center justify-center text-[#D8FF3E] border border-[#D8FF3E]/20 transition-all duration-300 group-hover:scale-105 group-hover:border-[#D8FF3E]/40">
              <Mountain size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-black text-sm tracking-wide text-white uppercase block leading-none">Hillo</span>
              <span className="font-mono text-[8px] tracking-widest text-[#D8FF3E]/60 uppercase">Travel Sync</span>
            </div>
          </Link>

          {/* Navigation / Control buttons */}
          <div className="flex items-center gap-2.5">
            {/* Goal/Aim Button */}
            <button
              onClick={() => setIsGoalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/5 cursor-pointer"
            >
              Aim &amp; Goal
            </button>

            {/* Launch App Button */}
            <a
              href="https://hillio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#D8FF3E] text-black hover:bg-[#cbf239] transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(216,255,62,0.4)] flex items-center gap-1 cursor-pointer"
            >
              Launch App
              <ArrowUpRight size={13} className="stroke-[2.5]" />
            </a>
          </div>
          
        </div>
      </header>

      {/* GOAL AND AIM POPUP MODAL */}
      <AnimatePresence>
        {isGoalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-[24px] p-6 sm:p-8 border border-white/[0.08] bg-[#0c0e12]/95 backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] z-10"
            >
              {/* Highlight bar header */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#D8FF3E] to-transparent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setIsGoalOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D8FF3E]/10 rounded-xl flex items-center justify-center text-[#D8FF3E] border border-[#D8FF3E]/20">
                    <Target size={20} className="stroke-[2]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-sans font-extrabold text-white text-base">Our Perspective &amp; Focus</h3>
                    <p className="font-mono text-[9px] tracking-widest text-[#D8FF3E]/70 uppercase">Why we built Hillo</p>
                  </div>
                </div>

                {/* Beginner-style simple words text content */}
                <div className="space-y-4 font-sans text-sm text-[#f5f5f7]/90 leading-relaxed text-left">
                  <p>
                    Hey there! Let’s be honest: planning group mountain trips is incredibly fun, but organizing them is a total mess. People get lost, keeping track of who showed up is a head-scratcher, and safety is always a worry. 
                  </p>
                  <p>
                    That's why we created <strong className="text-[#D8FF3E]">Hillo</strong>. We wanted to build something super-simple that solves three big headaches:
                  </p>
                  
                  <ul className="space-y-2.5 pl-1 pt-1">
                    <li className="flex gap-2">
                      <span className="text-[#D8FF3E] font-bold">●</span>
                      <span><strong>Fast Entry:</strong> Everyone gets a simple QR code on their phone, so organizers can check travelers in with one tap.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#D8FF3E] font-bold">●</span>
                      <span><strong>No One Gets Lost:</strong> Real-time distance and altitude tracking, so the group stays connected on the trail.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#D8FF3E] font-bold">●</span>
                      <span><strong>Always Safe:</strong> Smart hazard alerts and a quick SOS trigger to summon rangers if anything goes south.</span>
                    </li>
                  </ul>

                  <p className="text-xs text-white/50 pt-2 border-t border-white/[0.05]">
                    At the end of the day, our mission is simple: less screen time tracking spreadsheets, and more worry-free face time enjoying the summits together. 🌄
                  </p>
                </div>

                {/* Understood Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsGoalOpen(false)}
                    className="w-full py-3 rounded-xl bg-[#D8FF3E] hover:bg-[#cbf239] text-black font-extrabold text-xs transition-colors shadow-[0_4px_20px_-4px_rgba(216,255,62,0.3)] font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Awesome, Let’s Explore!
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 1. HERO SECTION (Exactly the requested high-fidelity layout with Premium Scroll / Load Reveal) */}
      <main className="w-full max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-16 flex-1 flex flex-col items-center justify-start text-center z-10">
        
        {/* Headline Section */}
        <motion.div 
          className="space-y-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[52px] sm:text-[76px] md:text-[100px] lg:text-[118px] font-black tracking-[-0.045em] leading-[0.93] text-white">
            <span className="block">Group Travel,</span>
            <span className="block mt-1">
              Finally <span className="text-[#D8FF3E] drop-shadow-[0_0_40px_rgba(216,255,62,0.22)]">Sorted.</span>
            </span>
          </h1>
        </motion.div>

        {/* Subheadline bar */}
        <motion.p 
          className="text-base sm:text-lg md:text-[21px] text-[#8a8a93] font-normal leading-relaxed max-w-2xl mt-10 md:mt-11 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          QR boarding, live tracking, and emergency SOS — <br className="hidden sm:inline" />
          all from one link. No app downloads needed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-row items-center justify-center gap-4 mt-11 w-full max-w-md px-4"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => scrollToSection('roi-calculator')}
            className="flex-1 sm:flex-initial px-8 py-4 sm:px-10 sm:py-4.5 bg-[#D8FF3E] hover:bg-[#c9ed2b] hover:shadow-[0_0_35px_rgba(216,255,62,0.35)] hover:scale-[1.02] active:scale-95 text-[#050505] font-black text-sm sm:text-base rounded-xl transition-all duration-300 text-center uppercase tracking-wide cursor-pointer"
          >
            Start Free
          </button>
          <button
            onClick={() => {
              setActiveTab('sos');
              scrollToSection('interactive-demo');
            }}
            className="flex-1 sm:flex-initial px-6 py-4 sm:px-9 sm:py-4.5 bg-[#0e1012]/80 hover:bg-white/[0.05] border border-white/10 rounded-xl text-sm sm:text-base font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95"
          >
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-white ml-0.5" />
            Watch Demo
          </button>
        </motion.div>

        {/* 3D Landscape Phone Mockup Section */}
        <motion.div 
          ref={mockupContainerRef}
          className="w-full max-w-[760px] mt-20 md:mt-24 relative px-4 flex items-center justify-center"
          initial={{ opacity: 0, y: 55 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          
          {/* Enhanced Neon Lime Bloom / Underglow Effect using Layered SVG Filters */}
          <div className="absolute -inset-24 pointer-events-none select-none z-0 overflow-visible flex items-center justify-center">
            {/* SVG Defs for organic, non-uniform layered gaussian blurs */}
            <svg className="absolute w-[140%] h-[140%] overflow-visible">
              <defs>
                {/* Wide soft-edged horizontal bloom filter */}
                <filter id="cinematic-bloom-wide" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="110" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                {/* Intense central hot-spot filter */}
                <filter id="cinematic-bloom-hotspot" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
                </filter>
              </defs>

              {/* Central high-intensity core glow */}
              <motion.ellipse
                cx="50%"
                cy="50%"
                rx="240"
                ry="85"
                fill="#D8FF3E"
                className="fill-[#D8FF3E]"
                fillOpacity="0.25"
                filter="url(#cinematic-bloom-hotspot)"
                animate={{
                  rx: [220, 260, 220],
                  ry: [75, 100, 75],
                  opacity: [0.8, 1.0, 0.8]
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Ultra-wide organic ambient dispersal field */}
              <motion.ellipse
                cx="50%"
                cy="48%"
                rx="380"
                ry="150"
                fill="#D8FF3E"
                className="fill-[#D8FF3E]"
                fillOpacity="0.10"
                filter="url(#cinematic-bloom-wide)"
                animate={{
                  rx: [350, 410, 350],
                  ry: [130, 170, 130],
                  opacity: [0.75, 1.0, 0.75]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Inner focus accent shape following the tilted perspective of the bottom of the device */}
              <motion.path
                d="M 150 250 Q 380 320 610 240"
                stroke="#D8FF3E"
                strokeWidth="20"
                strokeLinecap="round"
                fill="none"
                opacity="0.18"
                filter="url(#cinematic-bloom-hotspot)"
                className="origin-center translate-y-12"
                animate={{
                  opacity: [0.14, 0.22, 0.14],
                  scaleX: [0.96, 1.04, 0.96]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>

          {/* Perspective rotated wrapper container */}
          <motion.div
            className="relative w-full aspect-[16/10] select-none cursor-default"
            style={{
              perspective: "1600px",
            }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            
            {/* Phone Body with Realistic 3D rotation, metallic reflection & shadows */}
            <motion.div 
              className="w-full h-full rounded-[44px] sm:rounded-[52px] p-[3px] bg-gradient-to-b from-[#3a3f44] via-[#24272b] to-[#121315] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] border border-white/[0.08] relative overflow-hidden"
              style={{
                rotateX,
                rotateY,
                rotateZ,
                transformStyle: "preserve-3d" as any
              }}
            >
              
              {/* Glass Glare Reflective Coat overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.07] pointer-events-none z-30" />
              
              {/* Bezel structure (screen offset border) */}
              <div className="w-full h-full rounded-[41px] sm:rounded-[49px] p-2.5 sm:p-3.5 bg-black flex flex-col justify-between relative overflow-hidden">
                
                {/* Status Bar */}
                <div className="px-5 py-2.5 flex items-center justify-between text-white/95 text-[11px] sm:text-[12px] font-sans font-medium relative z-20">
                  <span className="tracking-tight">9:41</span>
                  
                  {/* iPhone Dynamic Island */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-[85px] h-[19px] sm:w-[100px] sm:h-[22px] bg-[#0c0c0e] rounded-full border border-white/[0.04] flex items-center justify-center shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1b1c24] ml-auto mr-3 border border-indigo-950/20" />
                  </div>

                  {/* Right Status Indicators */}
                  <div className="flex items-center gap-1.5">
                    <Signal size={12} className="stroke-[2.5]" />
                    <span className="text-[10px] font-bold tracking-tighter">5G</span>
                    <Wifi size={12} className="stroke-[2.5]" />
                    <div className="w-5 h-2.5 border border-white/40 rounded-sm p-0.5 flex items-center bg-transparent">
                      <div className="h-full w-4/5 bg-[#D8FF3E] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Hillo App Screen Workspace inside viewport */}
                <div className="flex-1 px-4 sm:px-6 py-2.5 space-y-4 overflow-hidden flex flex-col justify-start text-left">
                  
                  {/* Phone App Navbar Area */}
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 z-10">
                    <button className="flex flex-col gap-1 hover:opacity-80 transition-opacity">
                      <div className="h-[2px] w-4 bg-white/90 rounded" />
                      <div className="h-[2px] w-3 bg-white/90 rounded" />
                    </button>
                    
                    <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-white select-none">
                      <Mountain size={15} className="text-[#D8FF3E] fill-[#D8FF3E]" />
                      <span>Hillo</span>
                    </div>

                    <div className="relative hover:opacity-80 transition-opacity">
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <Bell size={14} className="text-white/80" />
                    </div>
                  </div>

                  {/* Trip details container */}
                  <div className="flex flex-row items-center justify-between mt-1">
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        Bali Getaway <span className="text-[14px] sm:text-[18px]">🌴</span>
                      </h4>
                      <p className="text-[9px] sm:text-[10.5px] font-mono tracking-wider uppercase text-white/40 font-bold">24 – 31 May 2025 • 12 People</p>
                    </div>

                    <div className="px-3 py-1 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span className="text-[9px] sm:text-[10px] text-[#10b981] font-black uppercase tracking-wider">On Track</span>
                    </div>
                  </div>

                  {/* Group Action Cards List */}
                  <div className="space-y-2.5">
                    
                    {/* Card 1: QR Boarding Pass */}
                    <div className="p-3 sm:p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-2xl flex items-center justify-between transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#D8FF3E] flex items-center justify-center text-black shadow-inner">
                          <QrCode size={18} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-[13.5px] font-bold text-white tracking-tight">QR Boarding Pass</h5>
                          <p className="text-[10px] text-white/40">Available for 12 people</p>
                        </div>
                      </div>
                      <span className="text-[10.5px] sm:text-xs font-bold text-[#D8FF3E] flex items-center hover:underline cursor-pointer group">
                        View QR <span className="ml-[1px] transition-transform group-hover:translate-x-0.5">&gt;</span>
                      </span>
                    </div>

                    {/* Card 2: Live Tracking map */}
                    <div className="p-3 sm:p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-2xl flex items-center justify-between transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Target size={18} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-[13.5px] font-bold text-white tracking-tight">Live Trip Tracking</h5>
                          <p className="text-[10px] text-white/40">All members accounted for</p>
                        </div>
                      </div>
                      <span className="text-[10.5px] sm:text-xs font-bold text-[#D8FF3E] flex items-center hover:underline cursor-pointer group">
                        View Map <span className="ml-[1px] transition-transform group-hover:translate-x-0.5">&gt;</span>
                      </span>
                    </div>

                    {/* Card 3: Emergency SOS */}
                    <div className="p-3 sm:p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] rounded-2xl flex items-center justify-between transition-all duration-300">
                      <div className="flex items-center gap-3">
                        {/* Custom visual matching screenshot for red SOS block */}
                        <div className="w-9 h-9 bg-red-950/20 border border-red-500/35 rounded-xl flex items-center justify-center text-red-500 font-bold text-xs tracking-wide">
                          SOS
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-[13.5px] font-bold text-white tracking-tight">Emergency SOS</h5>
                          <p className="text-[10px] text-white/40 font-normal">If you need help, we're here.</p>
                        </div>
                      </div>
                      <span className="text-[10.5px] sm:text-xs font-bold text-[#D8FF3E] flex items-center hover:underline cursor-pointer group">
                        Open SOS <span className="ml-[1px] transition-transform group-hover:translate-x-0.5">&gt;</span>
                      </span>
                    </div>

                  </div>

                </div>

                {/* App Screen Tab Bottom Bar */}
                <div className="bg-[#080a0c] border-t border-white/[0.04] py-2 px-3 sm:px-5 flex items-center justify-between select-none rounded-b-[32px]">
                  
                  <div className="flex flex-col items-center flex-1 cursor-pointer transition-colors text-[#D8FF3E]">
                    <Mountain size={14} className="mb-0.5 stroke-[2.5]" />
                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider">Overview</span>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 cursor-pointer hover:text-white/80 transition-colors text-white/40">
                    <Calendar size={14} className="mb-0.5" />
                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider">Itinerary</span>
                  </div>

                  <div className="flex flex-col items-center flex-1 cursor-pointer hover:text-white/80 transition-colors text-white/40">
                    <Users size={14} className="mb-0.5" />
                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider">People</span>
                  </div>

                  <div className="flex flex-col items-center flex-1 cursor-pointer hover:text-white/80 transition-colors text-white/40">
                    <MessageCircle size={14} className="mb-0.5" />
                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider">Updates</span>
                  </div>

                  <div className="flex flex-col items-center flex-1 cursor-pointer hover:text-white/80 transition-colors text-white/40">
                    <div className="flex gap-[1.5px] mb-1.5 mt-1">
                      <div className="w-[3px] h-[3px] bg-current rounded-full" />
                      <div className="w-[3px] h-[3px] bg-current rounded-full" />
                      <div className="w-[3px] h-[3px] bg-current rounded-full" />
                    </div>
                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider leading-none">More</span>
                  </div>

                </div>

              </div>
            </motion.div>

          </motion.div>
        </motion.div>



      </main>

      {/* 2. COMMAND CENTER SIMULATOR SECTION (Exactly styled like the reference tagged screen) */}
      <section id="interactive-demo" className="py-20 px-6 max-w-7xl mx-auto w-full text-center relative z-20">
        
        {/* Animated header introduction */}
        <div className="max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D8FF3E]/10 border border-[#D8FF3E]/25 text-[#D8FF3E] text-[10px] font-black uppercase tracking-widest mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF3E] animate-pulse" />
            Live Cockpit System
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Interactive <span className="text-[#D8FF3E] drop-shadow-[0_0_20px_rgba(216,255,62,0.15)]">Command Center</span>
          </h2>
          <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-xl mx-auto">
            Experience our simulated satellite telemetry cockpit. Toggle terminals, scan digital boarding passes, and try resolving the Alpine wilderness SOS trigger!
          </p>
        </div>

        {/* The Window Terminal wrapper */}
        <div className="max-w-4xl mx-auto w-full relative">
          
          {/* Ambient terminal shadows & underglows */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-[#D8FF3E]/5 to-[#10b981]/5 rounded-[40px] filter blur-3xl opacity-30 pointer-events-none" />

          {/* Realistic Mac OS style terminal window */}
          <div className="relative border border-white/[0.08] bg-[#0c1013] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:h-[590px]">
            
            {/* Window title bar header */}
            <div className="px-6 py-4.5 bg-[#070a0c]/90 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Traffic light circular buttons */}
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-red-500/10 cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-amber-500/10 cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-emerald-500/10 cursor-pointer" />
                </div>
                {/* Monospace version identity */}
                <div className="font-mono text-[10px] tracking-wider text-white/40 block sm:hidden uppercase">
                  HILLO SIMULATOR CORE V1.2
                </div>
              </div>

              {/* Monospace version identity for desktop */}
              <div className="hidden sm:block font-mono text-[11px] tracking-widest text-white/50 font-bold uppercase">
                HILLO SIMULATOR CORE V1.2
              </div>

              {/* Status pill right side */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-emerald-400 font-extrabold px-2.5 py-1 bg-emerald-500/10 rounded-lg">
                  LIVE TELEMETRY
                </span>
              </div>

            </div>

            {/* Simulated Desktop tab selection bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.04]">
              
              {/* Tab 1: Smart Ticket */}
              <button
                onClick={() => setActiveTab('ticket')}
                className={`py-4 px-4 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all duration-300 ${
                  activeTab === 'ticket' 
                    ? 'border-[#D8FF3E] text-[#D8FF3E] bg-white/[0.01]' 
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.005]'
                }`}
              >
                <QrCode size={13} className={activeTab === 'ticket' ? 'text-[#D8FF3E]' : 'text-white/45'} />
                <span>1. Smart Ticket</span>
              </button>

              {/* Tab 2: Monitoring Log / Members */}
              <button
                onClick={() => setActiveTab('monitor')}
                className={`py-4 px-4 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all duration-300 ${
                  activeTab === 'monitor' 
                    ? 'border-[#D8FF3E] text-[#D8FF3E] bg-white/[0.01]' 
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.005]'
                }`}
              >
                <Users size={13} className={activeTab === 'monitor' ? 'text-[#D8FF3E]' : 'text-white/45'} />
                <span>2. Monitor</span>
              </button>

              {/* Tab 3: SOS EMERGENCY Map - Highlighted by beacon color if active */}
              <button
                onClick={() => setActiveTab('sos')}
                className={`py-4 px-4 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all duration-300 relative ${
                  activeTab === 'sos' 
                    ? 'border-[#D8FF3E] text-[#D8FF3E] bg-white/[0.01]' 
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.005]'
                }`}
              >
                {!sosResolved && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                )}
                <ShieldAlert size={13} className={activeTab === 'sos' ? 'text-[#D8FF3E]' : 'text-red-500'} />
                <span className={!sosResolved ? 'text-red-500' : ''}>3. SOS Map</span>
              </button>

              {/* Tab 4: Altitude & Trail Sync */}
              <button
                onClick={() => setActiveTab('meteo')}
                className={`py-4 px-4 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all duration-300 ${
                  activeTab === 'meteo' 
                    ? 'border-[#D8FF3E] text-[#D8FF3E] bg-white/[0.01]' 
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.005]'
                }`}
              >
                <Compass size={13} className={activeTab === 'meteo' ? 'text-[#D8FF3E]' : 'text-white/45'} />
                <span>4. Trail &amp; Gear</span>
              </button>

            </div>

            {/* TAB CONTENT SPACE */}
            <div className="flex-1 p-5 md:p-7 relative overflow-y-auto bg-black/40 text-left">
              
              <AnimatePresence mode="wait">
                
                {/* 1. SMART TICKET SUBTERMINAL */}
                {activeTab === 'ticket' && (
                  <motion.div 
                    key="tab-ticket"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Ticket selector */}
                      <div className="md:col-span-7 bg-[#12161a] border border-white/[0.05] p-5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="text-[#D8FF3E]" size={18} />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Simulate Boarding Pass Generator</h4>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Before boarding a helicopter or Alpine trek, the tour operator generates an offline-compatible link. Test how Hillo handles camera verification:
                        </p>
                        
                        <div className="space-y-3 pt-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Select Active Passenger:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Julian Vance', 'Sophia Alvarez', 'Marcus Chen'].map(name => (
                              <button
                                key={name}
                                onClick={() => setSelectedPassenger(name)}
                                className={`px-2.5 py-2 rounded-xl text-center font-mono text-[10px] sm:text-xs font-bold uppercase transition-all ${
                                  selectedPassenger === name
                                    ? 'bg-[#D8FF3E] text-black shadow-lg shadow-[#D8FF3E]/10'
                                    : 'bg-[#1b2126] hover:bg-[#232a30] text-white/60 hover:text-white'
                                }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-black/45 p-3 rounded-xl border border-white/[0.03] space-y-2 mt-4">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/40 uppercase">Assigned Flight/Trip</span>
                            <span className="text-white font-bold">BALI-GETAWAY-2025</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/40 uppercase">Status</span>
                            <span className={checkedInList.includes(selectedPassenger) ? 'text-emerald-400 font-extrabold' : 'text-amber-400 font-extrabold animate-pulse'}>
                              {checkedInList.includes(selectedPassenger) ? 'CHECKED IN (OK)' : 'NOT YET SCAN'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={triggerScan}
                          disabled={boardingStatus !== 'idle'}
                          className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                            boardingStatus === 'scanning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : boardingStatus === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white hover:bg-white/90 text-black shadow-md'
                          }`}
                        >
                          {boardingStatus === 'scanning' && '⚡ Real-time Scanner Scanning...'}
                          {boardingStatus === 'success' && '✨ Validation Passed Successfully.'}
                          {boardingStatus === 'idle' && `Scan Boarding Card for ${selectedPassenger}`}
                        </button>
                      </div>

                      {/* Ticket mockup */}
                      <div className="md:col-span-5 bg-[#0a0d10] border border-dashed border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D8FF3E]/50">PASSENGER TICKET QR</span>
                        
                        <div className="bg-white p-3 rounded-2xl shadow-inner relative group select-none">
                          <QrCode size={135} className="text-[#050505]" />
                          {boardingStatus === 'scanning' && (
                            <div className="absolute inset-x-0 h-1 bg-amber-500/80 animate-[bounce_2s_infinite] shadow-lg shadow-amber-500" />
                          )}
                        </div>

                        <div className="font-mono text-xs text-white/50 space-y-1">
                          <div className="text-white font-black">{selectedPassenger}</div>
                          <div className="text-[10px]">Pass ID: HILLO-938-KLY2</div>
                          <div className="text-[9px] text-[#D8FF3E]/70 font-bold uppercase tracking-wider bg-[#D8FF3E]/5 px-2 py-0.5 rounded-full mt-2 w-max mx-auto">
                            Universal Offline Pass Link
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 2. LIVE MONITOR LIST */}
                {activeTab === 'monitor' && (
                  <motion.div 
                    key="tab-monitor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Left: Checked-in members dashboard */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="bg-[#12161a] border border-white/[0.05] p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="text-[#D8FF3E]" size={18} />
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Expedition Boarding State</h4>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#D8FF3E] bg-[#D8FF3E]/10 px-2 py-1 rounded-md">
                              {checkedInList.length} / 12 Checkins
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-[#D8FF3E] transition-all duration-500"
                                style={{ width: `${(checkedInList.length / 12) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-white/30 tracking-wide block text-right">
                              {Math.round((checkedInList.length / 12) * 100)}% Complete
                            </span>
                          </div>

                          {/* Passenger Grid */}
                          <div className="grid grid-cols-2 gap-2 mt-4 max-h-[195px] overflow-y-auto pr-1">
                            {['Alice Smith', 'Bob Johnson', 'Claire Thompson', 'David Miller', 'Emma Davis', 'Frank Wilson', 'Grace Martinez', 'Henry Taylor', 'Isabella Anderson', 'Julian Vance', 'Sophia Alvarez', 'Marcus Chen'].map(name => {
                              const checked = checkedInList.includes(name);
                              return (
                                <div 
                                  key={name}
                                  className={`p-2 rounded-xl flex items-center justify-between font-mono text-[10px] sm:text-xs tracking-tight border transition-colors ${
                                    checked 
                                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-[#f5f5f7]'
                                      : 'bg-white/[0.01] border-white/[0.03] text-white/40'
                                  }`}
                                >
                                  <span>{name}</span>
                                  {checked ? (
                                    <Check className="text-emerald-400 stroke-[3]" size={12} />
                                  ) : (
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Live log ticker */}
                      <div className="md:col-span-5 bg-[#0a0d10] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D8FF3E]/80">System Activity Stream</span>
                          <div className="space-y-3 font-mono text-[11px] leading-relaxed select-text mt-2 max-h-[200px] overflow-y-auto">
                            <div className="text-emerald-400 font-bold">&gt; System initialized on AWS US-East.</div>
                            <div className="text-white/40">10:13 AM - Comm lock secured with Sat-Hillo #4.</div>
                            <div className="text-emerald-400">&gt; 9 Passenger coordinates synced stream.</div>
                            <div className="text-[#D8FF3E] font-bold">10:14 AM - GPS fence active; standard monitoring.</div>
                            {checkedInList.includes('Marcus Chen') && (
                              <div className="text-sky-400 font-bold">&gt; Marcus Chen boarding validation: SUCCESS.</div>
                            )}
                            <div className="text-red-400 font-bold animate-pulse">10:14:02 AM - SOS SIGNAL INITIATED BY JULIAN VANCE.</div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/[0.03] text-[9px] text-white/30 font-mono flex items-center justify-between">
                          <span>Node-ID: hill_v12_active</span>
                          <span>Port: 3000 (Proxy in)</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 3. SOS EMERGENCY ACTIVE RESCUE (Recreating the reference image pixel-per-pixel) */}
                {activeTab === 'sos' && (
                  <motion.div 
                    key="tab-sos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    
                    {/* Danger notification bar overlay (Matches the red color border from screen) */}
                    <div className="rounded-[18px] p-4.5 sm:p-5 bg-red-950/15 border border-red-500/25 flex items-start gap-4 shadow-[0_12px_24px_rgba(239,68,68,0.05)]">
                      
                      {/* Left Shield alarm icon */}
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
                        <ShieldAlert size={20} className="stroke-[2] animate-pulse" />
                      </div>

                      {/* Right notification message */}
                      <div className="space-y-1 my-auto flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-red-400 tracking-wider uppercase font-mono">
                          ACTIVE SOS PULSE BEACON
                        </h4>
                        <p className="text-xs text-white/80 leading-relaxed font-sans">
                          {sosResolved ? (
                            <span className="text-emerald-400 font-bold">SUCCESS: Julian Vance located & emergency marked as resolved. Ranger chopper returned.</span>
                          ) : (
                            <>Passenger <strong className="text-white font-extrabold select-text">Julian Vance</strong> triggered SOS at 10:14 AM. Location locked.</>
                          )}
                        </p>
                        <p className="text-xs font-mono text-red-400/80 font-bold mt-1 tracking-wide select-text">
                          Coordinates: 45.8327° N, 6.8651° E (Summit Ridge Trail)
                        </p>
                      </div>

                    </div>

                    {/* Interactive map visualization grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      
                      {/* Live satellite map mockup */}
                      <div className="md:col-span-8 bg-[#0a0f12]/80 border border-white/[0.06] rounded-2xl h-[230px] p-4 relative overflow-hidden flex flex-col justify-between">
                        
                        {/* Fake topographic map grid background */}
                        <div 
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage: `
                              radial-gradient(rgba(216,255,62,0.1) 1.5px, transparent 1.5px),
                              linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px, 40px 40px, 40px 40px'
                          }}
                        />

                        {/* Summit pass vector contour mockup */}
                        <svg className="absolute inset-x-0 bottom-0 top-0 w-full h-full stroke-white/[0.04] fill-none stroke-[1] pointer-events-none">
                          <path d="M-50,200 C150,150 250,50 450,150 C650,250 750,130 950,180" />
                          <path d="M-50,100 C180,80 320,120 480,40 C640,-40 780,90 950,110" strokeDasharray="4 4" />
                          <path d="M-50,50 C120,40 220,-20 520,30 C820,80 880,10 950,20" />
                        </svg>

                        {/* Top banner overlay */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 z-10 select-none">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-red-500" />
                            SATELLITE BEACON SYNCHRONIZED
                          </span>
                          <span>ZOOM: 18x HILO_SAT</span>
                        </div>

                        {/* Interactive pulsating target overlay */}
                        <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                          {sosResolved ? (
                            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500 px-3 py-1.5 rounded-full select-none text-[11px] text-emerald-400 font-mono font-bold animate-[pulse_1.5s_infinite]">
                              <ShieldCheck size={12} />
                              RESOLVED CLOUD SYNC
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <span className="absolute h-12 w-12 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
                              <span className="absolute h-7 w-7 rounded-full bg-red-500/40 animate-pulse pointer-events-none" />
                              <div className="relative w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white pointer-events-none" />
                            </div>
                          )}
                        </div>

                        {/* Bottom overlay pill (matches VANCE LOCK: TRAIL #4) */}
                        <div className="bg-[#0b0f12]/93 border border-white/[0.08] rounded-xl px-3 py-1.5 w-max text-[11px] font-mono font-bold text-white z-10 flex items-center gap-1.5 select-none shadow-md">
                          <Activity size={10} className={sosResolved ? 'text-emerald-400' : 'text-red-500 animate-pulse'} />
                          <span>VANCE LOCK: TRAIL #4</span>
                        </div>

                      </div>

                      {/* Right panel: Active SOS & Trip Contact Relay */}
                      <div className="md:col-span-4 bg-[#0a0d10] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between h-auto min-h-[230px]">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D8FF3E] block mb-2 font-extrabold">SOS Group Contact Relay</span>
                          
                          <div className="space-y-2 mt-1">
                            {/* Trip Organizer */}
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-left">
                              <div>
                                <span className="text-[9px] font-mono text-white/30 uppercase block font-medium">Trip Organizer</span>
                                <span className="text-xs font-sans font-bold text-white block">Marcus Chen</span>
                                <span className="text-[9.5px] font-mono text-[#D8FF3E] block mt-0.5">VHF Ch. 12 • +33 6 45 92 10 99</span>
                              </div>
                              <a href="tel:+33645921099" className="px-2 py-1 bg-[#D8FF3E]/10 hover:bg-[#D8FF3E]/20 text-[#D8FF3E] rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer">
                                Call
                              </a>
                            </div>

                            {/* Base Operations */}
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-left">
                              <div>
                                <span className="text-[9px] font-mono text-white/30 uppercase block font-medium">Alpine Base Ops</span>
                                <span className="text-xs font-sans font-bold text-white block">Mont Blanc Guide HQ</span>
                                <span className="text-[9.5px] font-mono text-white/60 block mt-0.5">Line 2 • +33 4 50 53 12 08</span>
                              </div>
                              <a href="tel:+33450531208" className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/80 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer">
                                Call
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Broadcast Input Form */}
                        <div className="mt-3.5 pt-3.5 border-t border-white/[0.04] space-y-2">
                          <span className="text-[9.5px] font-mono text-white/40 block uppercase select-none">Send Broadcast Relay to Group:</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={broadcastMessage}
                              onChange={(e) => setBroadcastMessage(e.target.value)}
                              placeholder="Type message to relay..."
                              className="bg-black/30 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#D8FF3E]/50 font-sans"
                            />
                            <button
                              onClick={handleSendSatelliteBroadcast}
                              disabled={!broadcastMessage.trim()}
                              className="px-2.5 py-1.5 bg-[#D8FF3E] hover:bg-[#cbf239] disabled:bg-white/5 disabled:text-white/20 text-black text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0"
                            >
                              Relay
                            </button>
                          </div>
                          {broadcastSent && (
                            <p className="text-[9.5px] font-mono text-emerald-400 font-bold leading-none animate-[pulse_1s_infinite] select-none text-left">
                              ✓ Broadcast synced to all 12 group screens!
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 4. ALTITUDE & TRAIL PLANNING / TOPOGRAPHIC SYNC */}
                {activeTab === 'meteo' && (
                  <motion.div 
                    key="tab-meteo"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left"
                  >
                    
                    {/* Left: Dynamic climb configuration metrics */}
                    <div className="md:col-span-7 bg-[#12161a] border border-white/[0.05] p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="text-[#D8FF3E]" size={18} />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Dynamic Altitude &amp; Trail Planner</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#D8FF3E] font-extrabold bg-[#D8FF3E]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          OFFLINE SYNC: SYNCED
                        </span>
                      </div>

                      <p className="text-xs text-white/50 leading-relaxed font-sans">
                        Select a planned peak trail sector to automatically sync topographic layouts, oxygen density curves, and real-time gear lists directly to group members' devices offline.
                      </p>

                      {/* Summit Selector Buttons */}
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { name: 'Mont Blanc', elev: '15,777 ft', country: 'FR' },
                          { name: 'Matterhorn', elev: '14,692 ft', country: 'CH' },
                          { name: 'Gran Paradiso', elev: '13,323 ft', country: 'IT' }
                        ].map(summit => (
                          <button
                            key={summit.name}
                            type="button"
                            onClick={() => setSelectedSummit(summit.name)}
                            className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                              selectedSummit === summit.name
                                ? 'bg-[#D8FF3E]/10 border-[#D8FF3E] text-white'
                                : 'bg-white/[0.01] border-white/5 text-white/40 hover:bg-[#1c2126] hover:text-white/70'
                            }`}
                          >
                            <span className="text-[9px] font-mono opacity-60 block">{summit.country}</span>
                            <span className="text-xs font-sans font-black block mt-0.5">{summit.name}</span>
                            <span className="text-[9.5px] font-mono text-[#D8FF3E] block mt-0.5">{summit.elev}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom dynamic parameters */}
                      <div className="pt-3.5 border-t border-white/[0.04] grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-white/40 uppercase block">Group Sizing</span>
                            <span className="text-xs font-mono font-bold text-[#D8FF3E]">{climbingGroupSize} PAX</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="24"
                            value={climbingGroupSize}
                            onChange={(e) => setClimbingGroupSize(parseInt(e.target.value))}
                            className="w-full accent-[#D8FF3E] h-1 bg-white/10 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-white/40 uppercase block">Backpack Load</span>
                            <span className="text-xs font-mono font-bold text-[#D8FF3E]">{backpackWeight} KG</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="35"
                            value={backpackWeight}
                            onChange={(e) => setBackpackWeight(parseInt(e.target.value))}
                            className="w-full accent-[#D8FF3E] h-1 bg-white/10 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Right: Calculated Metrics & Gear Recommendations */}
                    <div className="md:col-span-5 bg-[#0a0d10] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-3.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D8FF3E]/80 block">Calculated Topo Safety Index</span>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-black/30 border border-white/5 p-2 rounded-xl">
                            <span className="text-[8.5px] font-mono text-white/40 block uppercase">Est. Ascent Speed</span>
                            <span className="text-sm font-mono font-bold text-white block mt-0.5">
                              {selectedSummit === 'Mont Blanc' 
                                ? Math.max(150, 350 - backpackWeight * 4 - climbingGroupSize * 2) 
                                : selectedSummit === 'Matterhorn' 
                                ? Math.max(180, 400 - backpackWeight * 5 - climbingGroupSize * 2) 
                                : Math.max(220, 450 - backpackWeight * 3 - climbingGroupSize * 1.5)
                              } m/h
                            </span>
                          </div>

                          <div className="bg-black/30 border border-white/5 p-2 rounded-xl">
                            <span className="text-[8.5px] font-mono text-white/40 block uppercase">O₂ Atmosphere</span>
                            <span className="text-sm font-mono font-bold text-sky-400 block mt-0.5 font-extrabold">
                              {selectedSummit === 'Mont Blanc' ? '54%' : selectedSummit === 'Matterhorn' ? '58%' : '63%'}
                            </span>
                          </div>
                        </div>

                        {/* Prescribed equipment layout */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">Required Pack Load-Outs:</span>
                          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                            {[
                              { label: 'Thermal layering', ok: backpackWeight >= 10 },
                              { label: 'Sat-Beacon tracker', ok: true },
                              { label: 'Crampons & ice axe', ok: selectedSummit !== 'Gran Paradiso' },
                              { label: 'VHF Backup Radio', ok: climbingGroupSize >= 6 }
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10.5px] font-mono text-white/70">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-white/10'}`} />
                                <span className={item.ok ? '' : 'text-white/30 line-through'}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Synced to 12 screens</span>
                        <span className="text-[#D8FF3E] font-bold">ALPS_SYNC</span>
                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>

        </div>

      </section>

      {/* 3. INTERACTIVE SAVINGS & ROI CALCULATOR WIDGET (Preserved from original design) */}
      <section id="roi-calculator" className="py-24 border-t border-b border-white/[0.03] bg-gradient-to-b from-[#070b0e] to-[#0c1317]">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#D8FF3E] uppercase block">
              ESTIMATE BACKCOUNTRY SAVINGS
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
              Operator <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D8FF3E]">Savings ROI</span>
            </h2>
            <p className="text-sm md:text-base text-white/50 leading-relaxed font-semibold">
              Slide the knobs below to check how many operational hours and overhead costs disappear when using automated secure web tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
            
            {/* Range interactive knobs */}
            <div className="lg:col-span-7 bg-[#12161a] border border-white/[0.05] p-6 sm:p-8 rounded-[24px] space-y-6">
              
              {/* Metric Card 1: Expeditions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50 uppercase font-black uppercase">Expeditions per Month</span>
                  <span className="font-mono text-sm font-bold text-[#D8FF3E]">{expeditions} Trips</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="40" 
                  value={expeditions}
                  onChange={(e) => setExpeditions(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#D8FF3E]"
                />
                <div className="flex justify-between font-mono text-[9px] text-[#8a8a93]/40 font-bold uppercase">
                  <span>2 Trips</span>
                  <span>40 Trips</span>
                </div>
              </div>

              {/* Metric Card 2: Crew Passengers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50 uppercase font-black uppercase">Average Group Members</span>
                  <span className="font-mono text-sm font-bold text-[#D8FF3E]">{passengers} Passengers</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="60" 
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#D8FF3E]"
                />
                <div className="flex justify-between font-mono text-[9px] text-[#8a8a93]/40 font-bold uppercase">
                  <span>4 Pass</span>
                  <span>60 Pass</span>
                </div>
              </div>

              {/* Metric Card 3: Saved overhead duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50 uppercase font-black uppercase">Manual Checkin Friction Per Person</span>
                  <span className="font-mono text-sm font-bold text-[#D8FF3E]">{overheadTime} Minutes</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="15" 
                  value={overheadTime}
                  onChange={(e) => setOverheadTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#D8FF3E]"
                />
                <div className="flex justify-between font-mono text-[9px] text-[#8a8a93]/40 font-bold uppercase">
                  <span>2 Min</span>
                  <span>15 Min</span>
                </div>
              </div>

            </div>

            {/* Visual breakdown box displaying money & time saved */}
            <div className="lg:col-span-5 bg-[#0a0d10] border border-white/[0.06] p-6 sm:p-8 rounded-[24px] flex flex-col justify-between text-center relative overflow-hidden h-full">
              
              {/* Glassmorphic border glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#D8FF3E]/[0.02] rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-1 z-10">
                <span className="text-[10px] font-mono tracking-widest text-[#D8FF3E] font-bold uppercase block">
                  ANNUALIZED REDUCTION
                </span>
                <div className="text-5xl sm:text-6xl font-black text-white py-4 font-mono">
                  ${(moneySaved * 12).toLocaleString()}
                </div>
                <p className="text-xs text-[#8a8a93]/80 leading-relaxed font-sans max-w-xs mx-auto">
                  Estimated value of operator time saved per year assuming a standard backcountry escort rate score of <strong className="text-white">${hourlyRate}/hr</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-6 mt-6 z-10">
                <div className="text-left">
                  <span className="text-[9px] font-mono text-[#8a8a93]/50 block uppercase">Hours Saved / Mo</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {Math.round(hoursSaved)} hrs
                  </span>
                </div>
                <div className="text-left pl-4 border-l border-white/[0.04]">
                  <span className="text-[9px] font-mono text-[#8a8a93]/50 block uppercase">Friction Offset</span>
                  <span className="text-xl font-bold font-mono text-[#D8FF3E] mt-1 block">
                    -92%
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER: Frosted Glass Copyright & Contact Branding with Scrolling Effects */}
      <footer className="w-full relative mt-24 pb-16 px-4 md:px-8 z-10">
        {/* Cinematic neon ambient back-glow in footer */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[80%] h-48 bg-gradient-to-t from-[#D8FF3E]/[0.03] to-transparent rounded-full blur-[80px] pointer-events-none select-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto w-full glass-card !rounded-[32px] p-8 md:p-12 relative overflow-hidden group border border-white/[0.04] bg-[#0b0e11]/60 backdrop-blur-2xl"
        >
          {/* Neon lime accent line at the top with glowing transition */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8FF3E]/30 to-transparent group-hover:via-[#D8FF3E]/60 transition-all duration-700" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left Block: Logo, Brand & Copyright */}
            <div className="md:col-span-6 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-9 h-9 bg-[#D8FF3E]/10 rounded-xl flex items-center justify-center text-[#D8FF3E] border border-[#D8FF3E]/20">
                  <Mountain size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-display font-black text-lg tracking-wide text-white uppercase block leading-none">Hillo</span>
                  <span className="font-mono text-[9px] tracking-widest text-[#D8FF3E]/60 uppercase">Travel Sync</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-[#8a8a93] font-sans font-medium leading-relaxed max-w-sm">
                  Smart decentralized group boarding, status telemetry dashboard, and automated mountain trail warning structures. All right inside the pocket.
                </p>
                <div className="text-[10px] font-mono text-white/30 pt-2 tracking-wider">
                  © {new Date().getFullYear()} Hillo Inc. All rights reserved.
                </div>
              </div>
            </div>

            {/* Right Block: Instant Contact Controls */}
            <div className="md:col-span-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
              
              {/* WhatsApp Frost Button */}
              <motion.a
                href="https://wa.me/917903965482"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between gap-4 p-4.5 bg-white/[0.02] hover:bg-[#D8FF3E]/10 border border-white/5 hover:border-[#D8FF3E]/30 rounded-2xl transition-all duration-300 group/wa min-w-[220px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#25D366]/10 group-hover/wa:bg-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366] transition-colors">
                    <MessageCircle size={20} className="fill-[#25D366]/20" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">WhatsApp Me</span>
                    <span className="block text-xs font-bold text-white group-hover/wa:text-[#D8FF3E] transition-colors font-mono">+91 7903965482</span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-white/20 group-hover/wa:text-[#D8FF3E] transition-transform group-hover/wa:translate-x-0.5 group-hover/wa:-translate-y-0.5" />
              </motion.a>

              {/* Email Frost Button */}
              <motion.a
                href="mailto:neelrj104@gmail.com"
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between gap-4 p-4.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 group/mail min-w-[220px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 group-hover/mail:bg-white/10 rounded-xl flex items-center justify-center text-white/60 group-hover/mail:text-white transition-all">
                    <Mail size={18} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">Direct Mail</span>
                    <span className="block text-xs font-bold text-white group-hover/mail:text-brand-primary transition-colors font-mono font-sans">neelrj104@gmail.com</span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-white/20 group-hover/mail:text-white transition-transform group-hover/mail:translate-x-0.5 group-hover/mail:-translate-y-0.5" />
              </motion.a>

            </div>

          </div>

          {/* Micro telemetry footer badge */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-mono text-white/20 tracking-wider">
            <span>VERSION 1.4-LIVEDEBUG</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#D8FF3E] animate-ping" />
              <span>SECURE END-TO-END LANDING TELEMETRY LOCK</span>
            </span>
          </div>

        </motion.div>
      </footer>

      {/* 4. REAL-TIME SCROLLING FLOATING ALARM NOTIFICATION (Like an iOS popup) */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[340px] px-4"
          >
            <div className="bg-[#0b0e11]/90 backdrop-blur-xl border border-red-500/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-red-500/5 relative overflow-hidden flex flex-col gap-3">
              
              {/* Pulsing red laser bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-red-500 to-amber-500" />
              
              {/* Notification Header */}
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/50">
                <div className="flex items-center gap-1.5 text-red-400">
                  <ShieldAlert size={12} className="stroke-[2.5]" />
                  <span className="uppercase tracking-widest font-black">Emergency Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>now</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupDismissed(true);
                      setShowPopup(false);
                    }}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Notification Body */}
              <div className="space-y-1">
                <h5 className="text-xs font-extrabold text-white">Distress Beacon Triggered!</h5>
                <p className="text-[11px] text-white/70 leading-normal font-sans">
                  Crew member <strong>Julian Vance</strong> triggered a satellite rescue pulse on Summit Ridge Trail.
                </p>
              </div>

              {/* Interactive buttons */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => {
                    setActiveTab('sos');
                    scrollToSection('interactive-demo');
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-505 text-white font-mono text-[9.5px] uppercase font-bold rounded-lg transition-colors text-center cursor-pointer"
                >
                  Locate on map
                </button>
                <button
                  onClick={() => {
                    setPopupDismissed(true);
                    setShowPopup(false);
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-[9.5px] uppercase font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              {/* Small simulated text tag below */}
              <span className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest text-center block mt-1">
                SIMULATOR CONTROLLER WIDGET
              </span>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
