import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('ananya.sharma@barabaricollective.in');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login('ananya.sharma@barabaricollective.in', 'password123');
      navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-brand-text-primary font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
            B
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-text-primary tracking-tight">
            Barabari Collective
          </h2>
          <p className="text-xs text-brand-text-secondary">
            Student UI/UX & Product Design Evaluation Platform
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-4 bg-brand-blue-light/60 rounded-2xl border border-brand-blue/15 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue">
            <Sparkles className="w-4 h-4" />
            <span>Hackathon Quick-Access</span>
          </div>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            One-click sign in with our active Cohort 4 student profile to experience the full evaluation flow:
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-brand-border hover:border-brand-blue transition-all group text-left"
          >
            <div className="flex items-center gap-2.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Ananya Sharma"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-yellow"
              />
              <div>
                <p className="text-xs font-bold text-brand-text-primary group-hover:text-brand-blue">
                  Ananya Sharma
                </p>
                <p className="text-[10px] text-brand-text-secondary">
                  Cohort 4 • UI/UX Product Design
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-blue group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-brand-border w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-brand-text-secondary/70 uppercase tracking-wider absolute">
            Or continue with credentials
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-primary mb-1">
              Barabari Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all text-brand-text-primary"
              placeholder="name@barabaricollective.in"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all text-brand-text-primary"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Enter Studio Dashboard
          </Button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-brand-text-secondary">
            Facilitators evaluate submissions. Students view verified outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
