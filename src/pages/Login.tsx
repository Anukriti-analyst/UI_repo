import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<'Admin' | 'General' | null>(null);
  const [loggingIn, setLoggingIn] = useState<'Admin' | 'General' | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = (role: 'Admin' | 'General') => {
    setLoggingIn(role);
    setTimeout(() => {
      login(role);
      navigate('/', { replace: true });
    }, 400);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0D102B 0%, #1a2a6c 50%, #0057CA 100%)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-10" style={{ background: '#0073E6' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: '#FF5100' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-5" style={{ background: '#ffffff' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-base">FM</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">FM Essentials</span>
        </div>

        {/* Hero text */}
        <div className="z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Policy Proposal<br />
            <span style={{ color: '#60A5FA' }}>Intake Manager</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Streamline your insurance proposal workflow with smart forms, real-time tracking, and seamless collaboration.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              { icon: '📋', text: 'Dynamic multi-step form builder' },
              { icon: '🔒', text: 'Role-based access & audit trail' },
              { icon: '📊', text: 'Real-time submission tracking' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs z-10">© 2024 FM Global. All rights reserved.</p>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: 'var(--rds-background-color-app, #F2F0E9)' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #0057CA, #0073E6)' }}>
              <span className="text-white font-bold text-xl">FM</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#0D102B' }}>FM Essentials</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#E0E0E5] p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#0D102B' }}>Welcome back</h2>
              <p className="text-sm" style={{ color: '#666' }}>Select your role to access the platform</p>
            </div>

            <div className="space-y-3">
              {/* Admin button */}
              <button
                onClick={() => handleLogin('Admin')}
                onMouseEnter={() => setHoveredRole('Admin')}
                onMouseLeave={() => setHoveredRole(null)}
                disabled={loggingIn !== null}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderColor: hoveredRole === 'Admin' || loggingIn === 'Admin' ? '#0057CA' : '#E0E0E5',
                  background: hoveredRole === 'Admin' || loggingIn === 'Admin' ? '#EFF6FF' : '#FAFAFA',
                  transform: hoveredRole === 'Admin' ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: hoveredRole === 'Admin' ? '0 4px 12px rgba(0,87,202,0.15)' : 'none',
                }}
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl text-white shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #0057CA, #0073E6)' }}
                >
                  {loggingIn === 'Admin' ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm" style={{ color: hoveredRole === 'Admin' ? '#0057CA' : '#0D102B' }}>
                    Admin User
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                    Form management, categories & reporting
                  </p>
                </div>
                <svg className="w-4 h-4 transition-transform duration-200" style={{ color: '#0057CA', transform: hoveredRole === 'Admin' ? 'translateX(2px)' : 'translateX(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* General button */}
              <button
                onClick={() => handleLogin('General')}
                onMouseEnter={() => setHoveredRole('General')}
                onMouseLeave={() => setHoveredRole(null)}
                disabled={loggingIn !== null}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderColor: hoveredRole === 'General' || loggingIn === 'General' ? '#383B54' : '#E0E0E5',
                  background: hoveredRole === 'General' || loggingIn === 'General' ? '#F5F5F8' : '#FAFAFA',
                  transform: hoveredRole === 'General' ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: hoveredRole === 'General' ? '0 4px 12px rgba(56,59,84,0.15)' : 'none',
                }}
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl text-white shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #383B54, #4B4F6E)' }}
                >
                  {loggingIn === 'General' ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm" style={{ color: hoveredRole === 'General' ? '#383B54' : '#0D102B' }}>
                    General User
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                    Submit proposals &amp; track submissions
                  </p>
                </div>
                <svg className="w-4 h-4 transition-transform duration-200" style={{ color: '#383B54', transform: hoveredRole === 'General' ? 'translateX(2px)' : 'translateX(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="mt-7 pt-5 border-t border-[#F0F0F0]">
              <p className="text-xs text-center" style={{ color: '#AAA' }}>
                🔧 Development mode — select a role to simulate authentication
              </p>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-xs text-center mt-5" style={{ color: '#999' }}>
            FM Global · Secure Internal Platform
          </p>
        </div>
      </div>
    </div>
  );
}
