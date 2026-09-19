import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const initialRole = (paramRole || '').toLowerCase() === 'facilitator' ? 'facilitator' : 'student';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState(() => 
    initialRole === 'facilitator' ? 'rohan.mehta@barabaricollective.in' : 'ananya.sharma@barabaricollective.in'
  );
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const { login: studentLogin } = useAuth();
  const { login: facilitatorLogin } = useFacilitatorAuth();
  const navigate = useNavigate();

  // Handle role switch
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrors({});
    setGeneralError(null);
    if (selectedRole === 'student') {
      setEmail('ananya.sharma@barabaricollective.in');
      setPassword('password123');
    } else {
      setEmail('rohan.mehta@barabaricollective.in');
      setPassword('password123');
    }
  };

  // Form validation
  const validate = () => {
    const errs = {};
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    if (!role) {
      errs.role = 'Please select your account role.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Authenticate via unified auth service
      const authenticatedUser = await authService.login({ email, password, role });

      // Synchronize role session and execute role-based redirection
      if (role === 'student') {
        await studentLogin(email, password, authenticatedUser);
        navigate('/student/dashboard');
      } else {
        await facilitatorLogin(email, password, authenticatedUser);
        navigate('/facilitator/dashboard');
      }
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    if (role === 'student') {
      setEmail('ananya.sharma@barabaricollective.in');
      setPassword('password123');
    } else {
      setEmail('rohan.mehta@barabaricollective.in');
      setPassword('password123');
    }
    setErrors({});
    setGeneralError(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between border-b border-brand-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-black text-brand-text-primary text-lg shadow-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-brand-blue leading-none">
              Barabari Collective
            </span>
            <span className="text-[11px] font-medium text-brand-text-secondary mt-0.5">
              UI/UX Evaluation & Mentorship Platform
            </span>
          </div>
        </div>

        <Link
          to={`/signup?role=${role}`}
          className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
        >
          <span>Create an account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 my-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-6">
          {/* Header Title */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue-light/70 rounded-full border border-brand-blue/15 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Unified Access Portal</span>
            </div>
            <h1 className="text-2xl font-black text-brand-text-primary tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Select your role to access your personalized LMS dashboard.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
              I am signing in as:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-brand-bg rounded-2xl border border-brand-border">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'student'
                    ? 'bg-white text-brand-text-primary shadow-xs border border-brand-border/80'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-brand-yellow' : 'text-brand-text-secondary'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('facilitator')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'facilitator'
                    ? 'bg-white text-brand-text-primary shadow-xs border border-brand-border/80'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${role === 'facilitator' ? 'text-brand-blue' : 'text-brand-text-secondary'}`} />
                <span>Facilitator</span>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-brand-error font-medium">{errors.role}</p>
            )}
          </div>

          {/* Quick Demo Persona Helper */}
          <div className="p-3 bg-brand-blue-light/50 rounded-2xl border border-brand-blue/15 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-brand-blue block">
                {role === 'student' ? 'Demo Student Profile' : 'Demo Facilitator Profile'}
              </span>
              <span className="text-[11px] text-brand-text-secondary">
                {role === 'student' ? 'Ananya Sharma (Cohort 4)' : 'Rohan Mehta (Lead Mentor)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-[11px] font-bold text-brand-blue bg-white hover:bg-brand-blue-light px-2.5 py-1.5 rounded-lg border border-brand-blue/20 transition-colors"
            >
              Autofill
            </button>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white text-brand-text-primary placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-brand-error focus:ring-brand-error/20' 
                      : 'border-brand-border focus:border-brand-blue focus:ring-brand-blue/15'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-brand-error font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm bg-white text-brand-text-primary placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-brand-error focus:ring-brand-error/20' 
                      : 'border-brand-border focus:border-brand-blue focus:ring-brand-blue/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-brand-error font-medium">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant={role === 'student' ? 'primary' : 'secondary'}
              size="lg"
              className="w-full shadow-sm mt-2"
              isLoading={isLoading}
            >
              Sign In as {role === 'student' ? 'Student' : 'Facilitator'}
            </Button>
          </form>

          {/* Bottom Link to Signup */}
          <div className="pt-2 border-t border-brand-border text-center">
            <p className="text-xs text-brand-text-secondary">
              Don't have an account?{' '}
              <Link
                to={`/signup?role=${role}`}
                className="font-bold text-brand-blue hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-brand-border/40 text-xs text-brand-text-secondary">
        Barabari Collective • Educational Design Studio Platform
      </footer>
    </div>
  );
};

export default Login;
