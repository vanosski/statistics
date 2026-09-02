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
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'privacy') setView('privacy');
      else if (hash === 'terms') setView('terms');
      else setView('login');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeView = (newView: 'login' | 'privacy' | 'terms') => {
    window.location.hash = newView === 'login' ? 'login' : newView;
    setView(newView);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#login`,
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError('Google login failed: ' + (err.message || String(err)));
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

    try {
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
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0',
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
          {view === 'privacy' && <PrivacyPolicy onBack={() => changeView('login')} />}
          {view === 'terms' && <TermsOfService onBack={() => changeView('login')} />}
          
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 10px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '24px', height: '24px' }} />
                    {loading ? 'Authenticating...' : 'Continue with Google'}
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
                <button onClick={() => changeView('privacy')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</button>
                <span style={{ color: '#334155' }}>|</span>
                <button onClick={() => changeView('terms')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
