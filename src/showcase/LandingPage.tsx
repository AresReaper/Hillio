import React from 'react';
import { motion } from 'motion/react';
import { QrCode, ShieldAlert, Smartphone, Zap, Globe, Users, ArrowRight, CheckCircle2, MapPin, MessageCircle, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const features = [
    {
      icon: <QrCode className="text-emerald-400" size={32} />,
      title: "QR Boarding System",
      description: "Eliminate paper lists. Check in passengers in seconds using a lightning-fast QR scanner on your phone."
    },
    {
      icon: <ShieldAlert className="text-red-400" size={32} />,
      title: "Emergency SOS Tracking",
      description: "Safety first. Passengers can trigger an SOS with one click, sending their live GPS location to your dashboard."
    },
    {
      icon: <Smartphone className="text-blue-400" size={32} />,
      title: "Smart WhatsApp Tickets",
      description: "Automated ticket generation. Send beautiful, branded digital passes directly to passenger WhatsApp numbers."
    },
    {
      icon: <Globe className="text-purple-400" size={32} />,
      title: "Real-Time Dashboard",
      description: "Monitor your entire trip from one place. See who's boarded, who's missing, and who needs help instantly."
    }
  ];

  const pricing = [
    {
      name: "Trip Pass",
      price: "$29",
      period: "per trip",
      description: "Pay as you go for occasional or seasonal trip usage.",
      features: ["Up to 50 Passengers", "QR Boarding", "Basic SOS Alerts", "Email Support"],
      recommended: false
    },
    {
      name: "Operator Pro",
      price: "$99",
      period: "per month",
      description: "Unlimited usage for active tour operators and agencies.",
      features: ["Unlimited Trips", "Unlimited Passengers", "Real-time GPS SOS", "WhatsApp Tickets", "Priority Support"],
      recommended: true
    },
    {
      name: "Agency",
      price: "Custom",
      period: "annual",
      description: "Custom deployments for large-scale enterprise operations.",
      features: ["White-label Branding", "Multi-Admin Support", "API Access", "Dedicated Manager"],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen brand-surface text-slate-100 selection:bg-brand-primary/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-forest/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-extrabold text-2xl tracking-tighter">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(187,255,77,0.3)] text-night-ink">
              <Mountain size={18} />
            </div>
            Hillo
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-white/60 uppercase tracking-widest">
            <Link to="/track" className="hover:text-brand-primary transition-colors">Track Trip</Link>
            <a href="#features" className="hover:text-brand-primary transition-colors">Features</a>
            <a href="#tech" className="hover:text-brand-primary transition-colors">Technology</a>
            <a href="#pricing" className="hover:text-brand-primary transition-colors">Pricing</a>
          </div>
          <Link 
            to="/" 
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-soft text-night-ink rounded-[16px] font-black tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(187,255,77,0.2)]"
          >
            Try Yourself
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(187,255,77,0.15),transparent_50%)] z-0" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-8">
              <Zap size={14} />
              The Future of Tour Management
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60" style={{ fontFamily: 'Courier New', fontSize: '82px', textDecorationLine: 'none' }}>
              Manage Trips with <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(187,255,77,0.5)]">Zero Friction.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Hillo is a specialized SaaS solution for tour operators. From QR boarding to real-time SOS safety, we handle the logistics so you can focus on the adventure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/" 
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-soft text-night-ink rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(187,255,77,0.3)] flex items-center justify-center gap-2 group tracking-wide uppercase"
              >
                View Admin Demo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-8 py-4 bg-card-forest hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-white uppercase tracking-wide"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 brand-surface">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4 tracking-tighter">Engineered for the Field</h2>
            <p className="text-white/40">Everything you need to orchestrate a safe and seamless group expedition.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] brand-panel border-white/5 hover:border-brand-primary/30 transition-all group shadow-[0_0_50px_rgba(255,255,255,0.02)]"
              >
                <div className="mb-6 p-4 bg-deep-forest rounded-2xl inline-block group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-24">
        <div className="container mx-auto px-6 relative">
          <div className="brand-panel bg-card-forest rounded-[32px] p-12 border border-brand-primary/20 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -mr-32 -mt-32" />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl font-display font-black mb-6 tracking-tight">Why Hillo System?</h2>
                <div className="space-y-6">
                  {[
                    "Accelerate boarding sequences by up to 80%",
                    "Real-time emergency telemetry and GPS mapping",
                    "Elevated, unified branding for passengers",
                    "Frictionless onboarding: zero app installs"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-white/80 font-bold">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-3xl bg-deep-forest border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center relative brand-glow">
                   <div className="text-center p-8 relative z-10">
                      <Smartphone className="mx-auto mb-4 text-brand-primary" size={48} />
                      <div className="text-lg font-bold mb-2">Built for the Field</div>
                      <p className="text-sm text-white/40 font-medium">Fully optimized for expedition leaders on mobile devices.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-24 bg-deep-forest/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto brand-panel rounded-[32px] p-12 border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-display font-black mb-8 text-center tracking-tight" style={{ color: '#81cd81', borderColor: '#90abc5', fontFamily: 'Courier New', fontSize: '36px' }}>Enterprise Infrastructure</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-brand-primary font-black text-2xl mb-1 font-display" style={{ fontFamily: 'Times New Roman' }}>React 19</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Frontend</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-black text-2xl mb-1 font-display" style={{ fontFamily: 'Times New Roman' }}>Firebase</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Backend & DB</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-black text-2xl mb-1 font-display" style={{ fontFamily: 'Courier New' }}>Tailwind v4</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Architecture</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-black text-2xl mb-1 font-display" style={{ fontFamily: 'Courier New', borderStyle: 'outset' }}>Vite</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Pipeline</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4 tracking-tighter">Plans built for every tour operator</h2>
            <p className="text-white/40">Start with one trip, upgrade when your operations grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((p, i) => (
              <div 
                key={i}
                className={cn(
                  "p-8 rounded-[32px] border transition-all relative overflow-hidden flex flex-col",
                  p.recommended ? "brand-panel bg-card-forest border-brand-primary/30 shadow-[0_0_30px_rgba(187,255,77,0.1)]" : "bg-white/5 border-white/10"
                )}
              >
                {p.recommended && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[50px] -mr-16 -mt-16" />
                )}
                {p.recommended && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-primary text-night-ink text-[10px] font-black uppercase tracking-widest rounded-b-xl shadow-lg">
                    Recommended
                  </div>
                )}
                <div className="text-xl font-bold pt-4 text-white/90">{p.name}</div>
                <div className="text-sm text-white/40 mb-4 h-10">{p.description}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-display font-black">{p.price}</span>
                  <span className="text-white/40 text-sm font-bold">/{p.period}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                      <CheckCircle2 size={16} className="text-brand-primary flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors mt-auto",
                  p.recommended ? "bg-brand-primary text-night-ink hover:bg-brand-soft" : "bg-white/10 text-white hover:bg-white/20"
                )}>
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 text-sm text-white/40 italic">
            {/* TODO: Add billing provider integration here (e.g. Stripe Checkout) */}
            Payment processing is securely handled via our billing partners.
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5 brand-glow pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-display font-black mb-8 tracking-tighter">Ready to modernize your tours?</h2>
          <p className="text-white/40 mb-12 max-w-xl mx-auto text-lg font-medium">
            Join the next generation of tour operators using technology to provide safer, smoother experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center w-full sm:w-auto gap-3 px-12 py-6 bg-brand-primary hover:bg-brand-soft text-night-ink rounded-[24px] font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(187,255,77,0.3)] hover:scale-105 active:scale-95"
            >
              getr started with Hiilio
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/track" 
              className="inline-flex items-center justify-center w-full sm:w-auto gap-3 px-12 py-6 bg-card-forest border border-white/10 hover:bg-white/10 text-white rounded-[24px] font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95"
            >
              Track a Trip
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-xs font-bold uppercase tracking-widest font-sans bg-deep-forest">
        &copy; 2026 Hillo Operations. All rights reserved.
      </footer>
    </div>
  );
}
