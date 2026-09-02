import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Mail, KeyRound, Send, ArrowRight, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !username) {
      setError('Email and Username are required');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('access_requests')
      .insert([
        { email, username, reason }
      ]);

    if (error) {
      setError('Failed to submit request: ' + error.message);
    } else {
      setSuccess('Request submitted successfully! The admin will review it shortly.');
      setEmail('');
      setUsername('');
      setReason('');
      setIsRequesting(false);
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
          maxWidth: '420px',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(50px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'rgba(236, 72, 153, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }} />
        
        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Shield size={32} color="#818cf8" style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            {isRequesting ? 'Request Access' : 'Restricted Area'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isRequesting ? 'Submit your details for admin approval.' : 'Log in to view Last Land statistics.'}
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

        {!isRequesting ? (
          <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#818cf8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(10, 15, 28, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px 14px 44px', color: '#fff', outline: 'none', transition: 'all 0.2s' }}
                required
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#818cf8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: 'rgba(10, 15, 28, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px 14px 44px', color: '#fff', outline: 'none', transition: 'all 0.2s' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)' }}
            >
              {loading ? 'Authenticating...' : 'Login to Dashboard'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestAccess} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#10b981" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => { setIsRequesting(!isRequesting); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            {isRequesting ? 'Back to Login' : 'No account? Request access here.'}
          </button>
        </div>
      </div>
    </div>
  );
};
