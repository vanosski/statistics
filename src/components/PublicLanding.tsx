import React from 'react';
import { Shield, BarChart3, Users, Lock, LogIn } from 'lucide-react';

interface PublicLandingProps {
  onLoginClick: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onLoginClick }) => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-dark)',
      color: '#f8fafc',
      fontFamily: "'Space Grotesk', sans-serif",
      overflowX: 'hidden'
    }}>
      {/* Navbar */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} color="#818cf8" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Last Land Stats
          </span>
        </div>
        <button
          onClick={onLoginClick}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
          }}
        >
          Alliance Login <LogIn size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <Lock size={14} /> Internal Alliance Tool
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Advanced Statistics for <br/>
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kingdom Management
            </span>
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            A private, secure dashboard for analyzing alliance power metrics, troop formations, and War of Chaos readiness across the server.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginTop: '80px',
            textAlign: 'left'
          }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <BarChart3 size={24} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Comprehensive Metrics</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Track total power, archer, cavalry, and infantry specializations. Identify weaknesses and optimize rally leaders instantly.</p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users size={24} color="#f472b6" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Server Comparisons</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Compare player rosters against rival kingdoms. Analyze S+ tier distributions and total guard pools for KvK events.</p>
            </div>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Lock size={24} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Secure & Invite Only</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>All intelligence is strictly locked behind a manual admin approval process via Google OAuth. Your data never leaks.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Links for Google */}
      <div style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.85rem' }}>
        <p>© 2026 Last Land Statistics Tracker</p>
      </div>
    </div>
  );
};
