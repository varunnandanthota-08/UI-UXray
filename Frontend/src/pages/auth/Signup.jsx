import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') || '').toLowerCase() === 'facilitator' ? 'facilitator' : 'student';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const { login: studentLogin } = useAuth();
  const { login: facilitatorLogin } = useFacilitatorAuth();
  const navigate = useNavigate();

  // Frontend validation
  const validate = () => {
    const errs = {};
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameTrimmed) {
      errs.name = 'Full name is required.';
    } else if (nameTrimmed.length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!emailTrimmed) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!role) {
      errs.role = 'Please select your role.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Register through auth service
      const newUser = await authService.signup({
        name,
        email,
        password,
        role
      });

      // Automatically sign in the new account and redirect to role dashboard
      if (role === 'student') {
        await studentLogin(newUser.email, password, newUser);
        navigate('/student/dashboard');
      } else {
        await facilitatorLogin(newUser.email, password, newUser);
        navigate('/facilitator/dashboard');
      }
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
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
          to={`/login?role=${role}`}
          className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
        >
          <span>Already have an account? Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 my-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-5">
          {/* Header Title */}
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-yellow-light rounded-full border border-amber-200 text-xs font-bold text-[#946F00] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Create Account</span>
            </div>
            <h1 className="text-2xl font-black text-brand-text-primary tracking-tight">
              Get Started with Barabari
            </h1>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Register as a student or facilitator to start your learning journey.
            </p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Role Selection */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Account Role <span className="text-brand-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-brand-bg rounded-2xl border border-brand-border">
                <button
                  type="button"
                  onClick={() => {
                    setRole('student');
                    if (errors.role) setErrors(prev => ({ ...prev, role: null }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
                  onClick={() => {
                    setRole('facilitator');
                    if (errors.role) setErrors(prev => ({ ...prev, role: null }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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

            {/* Name Field */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Full Name <span className="text-brand-error">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Pooja Verma"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white text-brand-text-primary placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.name 
                      ? 'border-brand-error focus:ring-brand-error/20' 
                      : 'border-brand-border focus:border-brand-blue focus:ring-brand-blue/15'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-brand-error font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Email Address <span className="text-brand-error">*</span>
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
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Password <span className="text-brand-error">*</span>
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-brand-text-primary uppercase tracking-wider block">
                Confirm Password <span className="text-brand-error">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm bg-white text-brand-text-primary placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword 
                      ? 'border-brand-error focus:ring-brand-error/20' 
                      : 'border-brand-border focus:border-brand-blue focus:ring-brand-blue/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary p-1 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-brand-error font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              variant={role === 'student' ? 'primary' : 'secondary'}
              size="lg"
              className="w-full shadow-sm mt-3"
              isLoading={isLoading}
            >
              Create {role === 'student' ? 'Student' : 'Facilitator'} Account
            </Button>
          </form>

          {/* Bottom Link to Login */}
          <div className="pt-2 border-t border-brand-border text-center">
            <p className="text-xs text-brand-text-secondary">
              Already have an account?{' '}
              <Link
                to={`/login?role=${role}`}
                className="font-bold text-brand-blue hover:underline"
              >
                Login
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

export default Signup;
