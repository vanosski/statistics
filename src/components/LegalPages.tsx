import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ color: '#cbd5e1', lineHeight: 1.6, padding: '20px' }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
      <ArrowLeft size={16} /> Back
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <Shield size={24} color="#818cf8" />
      <h2 style={{ margin: 0, color: '#f8fafc' }}>Privacy Policy</h2>
    </div>
    
    <p>Last updated: September 2026</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>1. Information We Collect</h3>
    <p>When you log in using Google OAuth, we collect basic profile information including your email address and name. We also collect the "In-Game Username" and "Reason" you provide when requesting access.</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>2. How We Use Your Information</h3>
    <p>Your email address is strictly used to verify your identity and grant you authorized access to the Last Land Statistics Tracker dashboard. We do not use your information for marketing or sell it to third parties.</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>3. Data Security</h3>
    <p>Your authentication data is securely handled by Google and Supabase. We do not store or have access to your passwords.</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>4. Contact</h3>
    <p>If you have questions about your data or wish to have your access request removed, please contact the site administrator via your alliance discord.</p>
  </div>
);

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ color: '#cbd5e1', lineHeight: 1.6, padding: '20px' }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
      <ArrowLeft size={16} /> Back
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <FileText size={24} color="#818cf8" />
      <h2 style={{ margin: 0, color: '#f8fafc' }}>Terms of Service</h2>
    </div>
    
    <p>Last updated: September 2026</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>1. Acceptance of Terms</h3>
    <p>By accessing the Last Land Statistics Tracker, you agree to be bound by these Terms of Service.</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>2. Access & Authorization</h3>
    <p>Access to the tracker is granted strictly on a per-user basis. Sharing your authenticated session, scraping data, or abusing the platform is prohibited and will result in immediate revocation of your access.</p>
    
    <h3 style={{ color: '#f1f5f9', marginTop: '24px' }}>3. Disclaimer</h3>
    <p>The statistics and metrics provided on this platform are for informational and alliance-management purposes only. We do not guarantee 100% accuracy of all in-game data.</p>
  </div>
);
