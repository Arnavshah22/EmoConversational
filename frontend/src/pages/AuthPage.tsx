import React, { useState } from 'react';
import '../styles/auth.css';

import BrandPanel from "../components/BrandPanel";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
/*
  Tab states:
    'login'   → Sign in form
    'signup'  → Create account form
    'forgot'  → Forgot password (no tab active)
*/

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'

  const goLogin  = () => setTab('login');
  const goSignup = () => setTab('signup');
  const goForgot = () => setTab('forgot');

  const showTabs = tab !== 'forgot';

  return (
    <div className="auth-layout">
      {/* ── LEFT: Branding ── */}
      <BrandPanel />

      {/* ── RIGHT: Forms ── */}
      <div className="auth-right">
        <div className="auth-box">

          {/* Tab switcher (hidden on forgot screen) */}
          {showTabs && (
            <div className="tab-switcher">
              <button
                className={`tab-btn${tab === 'login'  ? ' active' : ''}`}
                onClick={goLogin}
              >
                Sign in
              </button>
              <button
                className={`tab-btn${tab === 'signup' ? ' active' : ''}`}
                onClick={goSignup}
              >
                Create account
              </button>
            </div>
          )}

          {/* Form panels */}
          {tab === 'login'  && <LoginForm  onForgot={goForgot} />}
          {tab === 'signup' && <SignupForm />}
          {tab === 'forgot' && <ForgotPasswordForm onBack={goLogin} />}

        </div>
      </div>
    </div>
  );
}
