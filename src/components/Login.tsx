import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Send, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PrivacyPolicy, TermsOfService } from './LegalPages';

export const Login: React.FC = () => {
  const { session, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'privacy') return 'privacy';
    if (hash === 'terms') return 'terms';
    return 'login';
  };
  
  const [view, setView] = useState<'login' | 'privacy' | 'terms'>(getInitialView());

  React.useEffect(() => {
    window.location.hash = view === 'login' ? '' : view;
  }, [view]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!session?.user?.email || !username) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('access_requests')
      .insert([
        { email: session.user.email, username, reason }
      ]);

    if (error) {
      setError('Failed to submit request: ' + error.message);
    } else {
      setSuccess('Request submitted successfully! The admin will review it shortly. Please refresh the page later to check your status.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-dark)'
    }}>
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          padding: view === 'login' ? '40px 32px' : '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'rgba(236, 72, 153, 0.15)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          {view === 'privacy' && <PrivacyPolicy onBack={() => setView('login')} />}
          {view === 'terms' && <TermsOfService onBack={() => setView('login')} />}
          
          {view === 'login' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Shield size={32} color="#818cf8" style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }} />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                  {!session ? 'Restricted Area' : 'Pending Approval'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {!session ? 'Log in with Google to access statistics.' : 'Your Google account needs admin approval.'}
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
                  {success}
                </div>
              )}

              {!session ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{ width: '100%', background: '#ffffff', color: '#1e293b', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {loading ? 'Authenticating...' : 'Sign in with Google'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '4px' }}>Logged in as:</p>
                    <p style={{ color: '#818cf8', fontWeight: 600 }}>{session.user.email}</p>
                  </div>
                  
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#10b981" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="In-Game Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ width: '100%', background: 'rgba(10, 15, 28, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px 14px 44px', color: '#fff', outline: 'none' }}
                      required
                    />
                  </div>

                  <textarea
                    placeholder="Why do you need access? (e.g. Server, Alliance)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', background: 'rgba(10, 15, 28, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'} <Send size={18} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={signOut}
                    style={{ width: '100%', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    Sign out of Google <LogOut size={16} />
                  </button>
                </form>
              )}
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => setView('privacy')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</button>
                <span style={{ color: '#334155' }}>|</span>
                <button onClick={() => setView('terms')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
