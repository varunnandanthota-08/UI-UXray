import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

export const FacilitatorLogin = () => {
  const [email, setEmail] = useState('rohan.mehta@barabaricollective.in');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const { login } = useFacilitatorAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/facilitator/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between border-b border-brand-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-bold text-brand-text-primary text-lg shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-brand-blue leading-none">
              Barabari LMS
            </span>
            <span className="text-[11px] font-medium text-brand-text-secondary mt-0.5">
              Facilitator Portal
            </span>
          </div>
        </div>

        <Link
          to="/student/login"
          className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
        >
          <span>Student Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow-light rounded-full border border-amber-200 text-xs font-bold text-[#946F00] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mentor & Lead Facilitator Access</span>
            </div>
            <h1 className="text-2xl font-black text-brand-text-primary tracking-tight">
              Facilitator Sign In
            </h1>
            <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
              Access rubric grading, assignment design, and studio cohort submission reviews.
            </p>
          </div>

          {/* Quick Demo Credential Banner */}
          <div className="p-3.5 bg-brand-blue-light/60 rounded-2xl border border-brand-blue/15 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-brand-blue">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                Demo Mentor Profile
              </span>
              <Badge variant="blue" size="sm">
                Cohort 4
              </Badge>
            </div>
            <p className="text-[11px] text-brand-text-secondary">
              Logged in as <strong>Rohan Mehta</strong> (Lead Design Facilitator).
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-2.5 font-bold shadow-sm"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Mentor Dashboard
            </Button>
          </form>

          {/* Academic Boundary Guarantee */}
          <div className="pt-4 border-t border-brand-border text-left space-y-2">
            <p className="text-[11px] font-semibold text-brand-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0" />
              <span>Facilitator Responsibilities</span>
            </p>
            <ul className="text-[10px] text-brand-text-secondary space-y-1 pl-5 list-disc">
              <li>Formulate and publish criteria-based rubrics.</li>
              <li>Perform holistic studio grading on Figma submissions.</li>
              <li>Mentors retain final evaluation authority.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 text-center text-xs text-brand-text-secondary border-t border-brand-border/60">
        <span>© 2026 Barabari Collective • UI/UX Assignment Evaluation Platform</span>
      </footer>
    </div>
  );
};

export default FacilitatorLogin;
