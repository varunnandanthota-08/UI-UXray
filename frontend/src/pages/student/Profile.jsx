import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  Check, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const Profile = () => {
  const { student, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: student?.name || 'Ananya Sharma',
    email: student?.email || 'ananya.sharma@barabaricollective.in',
    phone: student?.phone || '+91 98765 43210',
    college: student?.college || 'National Institute of Design (NID)',
    specialization: student?.specialization || 'UI/UX & Interaction Design',
    location: student?.location || 'Bengaluru, Karnataka',
    bio: student?.bio || 'Product and interaction design student exploring design systems, generative AI co-design, and friction-free mobile interfaces.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: student?.name || 'Ananya Sharma',
      email: student?.email || 'ananya.sharma@barabaricollective.in',
      phone: student?.phone || '+91 98765 43210',
      college: student?.college || 'National Institute of Design (NID)',
      specialization: student?.specialization || 'UI/UX & Interaction Design',
      location: student?.location || 'Bengaluru, Karnataka',
      bio: student?.bio || 'Product and interaction design student exploring design systems, generative AI co-design, and friction-free mobile interfaces.'
    });
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue-light text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Account</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Profile Settings
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1">
            Manage your personal and learning information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="blue" size="md" dot>
            Enrolled Student • Active
          </Badge>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-brand-success-bg border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-brand-success animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-brand-error-bg border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-brand-error animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Overview Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center space-y-5">
            <div className="relative w-28 h-28 mx-auto">
              <img
                src={student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={formData.name}
                className="w-full h-full rounded-full object-cover ring-4 ring-brand-yellow shadow-md"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-text-primary">
                {formData.name}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                {student?.studentId || 'BC-2026-088'}
              </p>
              <div className="mt-2.5">
                <span className="inline-block px-3 py-1 bg-brand-yellow text-brand-text-primary text-xs font-bold rounded-full">
                  {student?.cohort || 'Cohort 4'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#F8F9F8] rounded-2xl border border-brand-border/80 text-left space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Program</span>
                <span className="font-semibold text-brand-text-primary">UI/UX Product Design</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Specialization</span>
                <span className="font-semibold text-brand-text-primary">{formData.specialization}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Location</span>
                <span className="font-semibold text-brand-text-primary">{formData.location}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-brand-text-secondary">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              <span>Verified Barabari Collective Student</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <h3 className="text-base font-bold text-brand-text-primary">
                  Personal & Academic Details
                </h3>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Update your contact preferences and design studio profile.
                </p>
              </div>
              <span className="text-[11px] text-brand-text-secondary italic">
                * Required fields
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Full Name & Student ID (Read-only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    Full Name <span className="text-brand-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-brand-text-secondary">
                      Student ID
                    </label>
                    <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-light px-1.5 py-0.5 rounded">
                      Read-only
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value={student?.studentId || 'BC-2026-088'}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border/60 bg-[#F0F0EB] text-brand-text-secondary cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    Email Address <span className="text-brand-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>
              </div>

              {/* Row 3: College & Cohort (Read-only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-brand-text-secondary">
                      Cohort
                    </label>
                    <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-light px-1.5 py-0.5 rounded">
                      Read-only
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value={student?.cohort || 'Cohort 4'}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border/60 bg-[#F0F0EB] text-brand-text-secondary cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Specialization & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    Design Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                  />
                </div>
              </div>

              {/* Row 5: Bio */}
              <div>
                <label className="block text-xs font-semibold text-brand-text-primary mb-1">
                  Design Bio / Statement
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
