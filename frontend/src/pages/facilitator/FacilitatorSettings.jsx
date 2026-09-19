import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import { profileApi } from '../../api/profileApi';
import {
  getFacilitatorSettings,
  saveFacilitatorSettings,
  resetFacilitatorSettings
} from '../../data/mockFacilitatorData';
import {
  User,
  Award,
  Bell,
  Sliders,
  Shield,
  LogOut,
  HelpCircle,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Save,
  BookOpen,
  Mail,
  Building,
  CheckCircle2
} from 'lucide-react';

export const FacilitatorSettings = () => {
  const navigate = useNavigate();
  const { facilitator, logout, updateProfile } = useFacilitatorAuth();

  // Settings state initialized from localStorage/API
  const [settings, setSettings] = useState(getFacilitatorSettings);

  useEffect(() => {
    let isMounted = true;
    profileApi.getSettings().then(data => {
      if (isMounted && data) setSettings(data);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'evaluation', 'notifications', 'interface', 'security', 'help'
  const [isSavedNoticeVisible, setIsSavedNoticeVisible] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    name: settings.profile?.name || facilitator?.name || 'Rohan Mehta',
    email: settings.profile?.email || facilitator?.email || 'rohan.mehta@barabaricollective.in',
    role: settings.profile?.role || facilitator?.role || 'Lead Design Facilitator',
    cohort: settings.profile?.cohort || facilitator?.cohort || 'Cohort 4 • UI/UX Product Design',
    organization: settings.profile?.organization || 'Barabari Collective Design Studio',
    bio: settings.profile?.bio || facilitator?.bio || '',
    officeHours: settings.profile?.officeHours || 'Tuesdays & Thursdays, 4:00 PM – 6:00 PM IST',
    avatar: settings.profile?.avatar || facilitator?.avatar || ''
  }));

  // Flash saved feedback
  const triggerSavedFeedback = () => {
    setIsSavedNoticeVisible(true);
    setTimeout(() => {
      setIsSavedNoticeVisible(false);
    }, 2800);
  };

  // Update evaluation settings
  const handleToggleEvaluation = (key) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        evaluation: {
          ...prev.evaluation,
          [key]: !prev.evaluation[key]
        }
      };
      saveFacilitatorSettings(updated);
      triggerSavedFeedback();
      return updated;
    });
  };

  const handleChangeEvaluationView = (view) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        evaluation: {
          ...prev.evaluation,
          defaultView: view
        }
      };
      saveFacilitatorSettings(updated);
      triggerSavedFeedback();
      return updated;
    });
  };

  // Update notification settings
  const handleToggleNotification = (key) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !prev.notifications[key]
        }
      };
      saveFacilitatorSettings(updated);
      triggerSavedFeedback();
      return updated;
    });
  };

  // Update interface settings
  const handleChangeInterface = (key, value) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        interface: {
          ...prev.interface,
          [key]: value
        }
      };
      saveFacilitatorSettings(updated);
      triggerSavedFeedback();
      return updated;
    });
  };

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedSettings = {
      ...settings,
      profile: {
        ...profileForm
      }
    };
    saveFacilitatorSettings(updatedSettings);
    setSettings(updatedSettings);
    if (updateProfile) {
      updateProfile(profileForm);
    }
    triggerSavedFeedback();
  };

  // Handle Reset Preferences
  const handleConfirmReset = () => {
    const resetted = resetFacilitatorSettings();
    setSettings(resetted);
    setProfileForm({
      name: resetted.profile.name,
      email: resetted.profile.email,
      role: resetted.profile.role,
      cohort: resetted.profile.cohort,
      organization: resetted.profile.organization,
      bio: resetted.profile.bio,
      officeHours: resetted.profile.officeHours,
      avatar: resetted.profile.avatar
    });
    if (updateProfile) {
      updateProfile(resetted.profile);
    }
    setIsResetConfirmOpen(false);
    triggerSavedFeedback();
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    navigate('/login?role=facilitator');
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'evaluation', label: 'Evaluation & AI Rules', icon: Award },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'interface', label: 'Display & Density', icon: Sliders },
    { id: 'security', label: 'Security & Session', icon: Shield },
    { id: 'help', label: 'Workflow Guide & Help', icon: HelpCircle }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              Facilitator Preferences & Studio Config
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Settings & Account
          </h1>
          <p className="text-sm text-brand-text-secondary mt-1">
            Manage your facilitator profile, grading environment preferences, alert triggers, and workflow settings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSavedNoticeVisible && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences Saved</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-xs font-semibold text-brand-text-secondary hover:text-brand-error hover:border-brand-error/30"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Preferences
          </Button>
        </div>
      </div>

      {/* Human Assessment Authority Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-start gap-3.5 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shrink-0 mt-0.5 text-white shadow-soft">
          <Sparkles className="w-4 h-4 text-brand-yellow" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-brand-blue uppercase tracking-wide text-[11px]">
              AI Advisory Boundary & Human Grading Authority
            </span>
            <Badge variant="blue" size="sm">Strict Policy</Badge>
          </div>
          <p className="text-brand-text-primary leading-relaxed">
            AI may assist with evidence checks, completeness checks, and constructive feedback suggestions, 
            but the <strong>facilitator independently determines scores, feedback, and final assessment results</strong>. 
            Autonomous grading, automatic score alteration, and non-facilitator finalization are disabled across all modules.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-brand-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Account */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1 p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {profileForm.avatar ? (
                  <img
                    src={profileForm.avatar}
                    alt={profileForm.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-yellow shadow-soft"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-brand-blue text-white font-black text-2xl flex items-center justify-center border-2 border-brand-yellow shadow-soft">
                    {profileForm.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" title="Active Mentor" />
              </div>

              <h2 className="text-lg font-black text-brand-text-primary mt-3">
                {profileForm.name}
              </h2>
              <p className="text-xs font-semibold text-brand-blue mt-0.5">
                {profileForm.role}
              </p>
              <p className="text-xs text-brand-text-secondary mt-1">
                {profileForm.organization}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-brand-border text-xs">
              <div className="flex items-center gap-2 text-brand-text-secondary">
                <Mail className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span className="truncate">{profileForm.email}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-text-secondary">
                <Building className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span className="truncate">{profileForm.cohort}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-text-secondary">
                <BookOpen className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span>Office Hours: {profileForm.officeHours}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border text-xs text-brand-text-secondary leading-relaxed">
              <span className="font-bold text-brand-text-primary block mb-1">Mentor Bio</span>
              {profileForm.bio || 'No bio provided yet.'}
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-brand-text-primary">
                  Edit Facilitator Profile
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Update your contact details, studio affiliation, and office hours.
                </p>
              </div>
              <Badge variant="neutral" size="sm">Persisted in Local Storage</Badge>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Assigned Cohort
                  </label>
                  <input
                    type="text"
                    value={profileForm.cohort}
                    onChange={(e) => setProfileForm({ ...profileForm, cohort: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Organization / Studio
                  </label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-text-primary block mb-1.5">
                    Weekly Studio / Office Hours
                  </label>
                  <input
                    type="text"
                    value={profileForm.officeHours}
                    onChange={(e) => setProfileForm({ ...profileForm, officeHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-text-primary block mb-1.5">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="font-bold text-brand-text-primary block mb-1.5">
                  Facilitator Bio & Focus Areas
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Describe your design background, mentoring philosophy, and design systems focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfileForm({
                    name: settings.profile?.name || '',
                    email: settings.profile?.email || '',
                    role: settings.profile?.role || '',
                    cohort: settings.profile?.cohort || '',
                    organization: settings.profile?.organization || '',
                    bio: settings.profile?.bio || '',
                    officeHours: settings.profile?.officeHours || '',
                    avatar: settings.profile?.avatar || ''
                  })}
                >
                  Discard Edits
                </Button>
                <Button type="submit" variant="primary">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tab 2: Evaluation Preferences & AI Rules */}
      {activeTab === 'evaluation' && (
        <Card className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-black text-brand-text-primary">
                Evaluation & AI Assistant Preferences
              </h2>
              <Badge variant="blue" size="sm">UI Controls Only</Badge>
            </div>
            <p className="text-xs text-brand-text-secondary">
              Configure how AI advisory indicators and rubric evidence are presented in your grading queue.
            </p>
          </div>

          <div className="divide-y divide-brand-border">
            {/* Toggle 1: Show AI Advisory */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-text-primary">
                    Show AI Advisory Pre-Review Suggestions
                  </span>
                  <Badge variant="soft" size="sm">Advisory</Badge>
                </div>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Displays AI-generated deliverable completeness checks, evidence flags, and coaching prompts in the submission review modal and batch evaluation assistant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleEvaluation('showAiAdvisorySuggestions')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.evaluation.showAiAdvisorySuggestions ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.evaluation.showAiAdvisorySuggestions ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Show Rubric Evidence */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-text-primary">
                    Show Rubric Evidence Indicators
                  </span>
                </div>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Highlights matched keywords and evidence tags (e.g., &quot;8pt Grid&quot;, &quot;Interactive Prototype&quot;) inside attached submission artifacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleEvaluation('showRubricEvidenceIndicators')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.evaluation.showRubricEvidenceIndicators ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.evaluation.showRubricEvidenceIndicators ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Evaluation History */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-text-primary">
                    Show Evaluation Version History By Default
                  </span>
                </div>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Automatically expands previous evaluation iterations (e.g. Version 1 vs Version 2) when opening re-evaluated submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleEvaluation('showEvaluationHistoryByDefault')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.evaluation.showEvaluationHistoryByDefault ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.evaluation.showEvaluationHistoryByDefault ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Confirmation Prompt */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-text-primary">
                    Require Confirmation Before Finalizing Scores
                  </span>
                </div>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Prevents accidental grading submission by requiring explicit facilitator confirmation before saving immutable evaluation records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleEvaluation('confirmBeforeFinalizing')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.evaluation.confirmBeforeFinalizing ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.evaluation.confirmBeforeFinalizing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Select: Default View */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-brand-text-primary block">
                  Default Queue View Style
                </span>
                <p className="text-[11px] text-brand-text-secondary">
                  Choose the default visualization for Submissions and Completed Evaluations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleChangeEvaluationView('table')}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    settings.evaluation.defaultView === 'table'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-[#FBFBFA] text-brand-text-secondary border-brand-border hover:text-brand-text-primary'
                  }`}
                >
                  Compact Table
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeEvaluationView('cards')}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    settings.evaluation.defaultView === 'cards'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-[#FBFBFA] text-brand-text-secondary border-brand-border hover:text-brand-text-primary'
                  }`}
                >
                  Visual Cards
                </button>
              </div>
            </div>
          </div>

          {/* Hard AI Boundary Warning Box */}
          <div className="p-3.5 bg-[#FFFBEB] rounded-xl border border-brand-warning/30 flex items-start gap-2.5 text-xs text-[#92400E]">
            <AlertCircle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Non-Negotiable Assessment Governance</span>
              Autonomous grading is permanently disabled. AI is restricted to advisory pre-review flags. No toggle or configuration setting may grant AI the ability to publish or alter final student grades.
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Notifications & Alerts */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Facilitator Alerts & Notification Triggers
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Control which cohort activities and grading events generate dashboard badges and alerts.
            </p>
          </div>

          <div className="divide-y divide-brand-border">
            {/* Alert 1 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-text-primary block">
                  New Student Submission Alerts
                </span>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Display real-time queue notifications and badge counter increments when students upload new sprint deliverables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('newSubmissionAlerts')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.notifications.newSubmissionAlerts ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.newSubmissionAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Alert 2 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-text-primary block">
                  Re-Evaluation Request Priority Alerts
                </span>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Highlight urgent notifications when a student files a formal grade appeal or rubric re-evaluation request.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('reEvaluationAlerts')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.notifications.reEvaluationAlerts ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.reEvaluationAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Alert 3 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-text-primary block">
                  Batch Evaluation Completion Notifications
                </span>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Notify upon completion of simulated AI pre-review sweeps across candidate batch queues.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('batchCompletionAlerts')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.notifications.batchCompletionAlerts ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.batchCompletionAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Alert 4 */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-text-primary block">
                  Assignment Deadline Reminders
                </span>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Alert facilitator 24 hours prior to sprint closing timestamps to prepare cohort rubric benchmarks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('assignmentDeadlineReminders')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.notifications.assignmentDeadlineReminders ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.assignmentDeadlineReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Display & Density */}
      {activeTab === 'interface' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Interface & Display Density
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Customize the UI layout spacing and default display modes for your grading workflow.
            </p>
          </div>

          <div className="divide-y divide-brand-border">
            {/* Density */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-brand-text-primary block">
                  Table & Queue Density
                </span>
                <p className="text-[11px] text-brand-text-secondary">
                  Choose between comfortable spacing or high-density rows for quick scanning.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleChangeInterface('density', 'comfortable')}
                  className={`px-3.5 py-2 rounded-xl font-bold border transition-all ${
                    settings.interface.density === 'comfortable'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-[#FBFBFA] text-brand-text-secondary border-brand-border hover:text-brand-text-primary'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeInterface('density', 'compact')}
                  className={`px-3.5 py-2 rounded-xl font-bold border transition-all ${
                    settings.interface.density === 'compact'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-[#FBFBFA] text-brand-text-secondary border-brand-border hover:text-brand-text-primary'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Rubric notes */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-text-primary block">
                  Auto-Expand Rubric Criterion Guidance
                </span>
                <p className="text-[11px] text-brand-text-secondary max-w-xl">
                  Keep criterion guidance notes fully expanded rather than collapsible inside the grading modal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChangeInterface('autoExpandRubricNotes', !settings.interface.autoExpandRubricNotes)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.interface.autoExpandRubricNotes ? 'bg-brand-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.interface.autoExpandRubricNotes ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Security & Session */}
      {activeTab === 'security' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Security & Active Session
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Review current authentication state and active facilitator session details.
            </p>
          </div>

          <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-brand-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-black">
                  RM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text-primary">
                    {profileForm.name}
                  </h3>
                  <span className="text-xs text-brand-text-secondary">
                    {profileForm.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">Active Session</Badge>
                <Badge variant="soft" size="sm">Demo Environment</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-brand-border text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">
                  Session Type
                </span>
                <span className="font-semibold text-brand-text-primary">
                  Local Facilitator Mock Auth
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">
                  Storage Namespace
                </span>
                <span className="font-mono text-xs text-brand-text-primary">
                  barabari_facilitator_*
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">
                  Security Boundary
                </span>
                <span className="font-semibold text-emerald-600">
                  Client-side Mock Isolated
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-1">Demo Environment Notice</span>
            This session runs in offline mock demonstration mode for the Barabari Collective UI/UX Assignment Evaluation Platform. All actions, edits, and rubric submissions are kept safely isolated in browser local storage.
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-brand-border">
            <span className="text-xs text-brand-text-secondary">
              Need to switch facilitator persona or end review shift?
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out of Facilitator Session
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 6: Help & Workflow Guidance */}
      {activeTab === 'help' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Facilitator Evaluation Workflow & Guidance
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Standard operating procedures for grading submissions, handling appeals, and utilizing AI advisory checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-2">
              <div className="w-7 h-7 rounded-lg bg-brand-yellow flex items-center justify-center font-black text-xs text-brand-text-primary">
                1
              </div>
              <h3 className="text-xs font-bold text-brand-text-primary">
                1. Queue & Deliverables Audit
              </h3>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Review incoming submissions in the grading queue. Verify student deliverables including Figma links, token libraries, and responsive case studies.
              </p>
            </div>

            <div className="p-4 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-2">
              <div className="w-7 h-7 rounded-lg bg-brand-yellow flex items-center justify-center font-black text-xs text-brand-text-primary">
                2
              </div>
              <h3 className="text-xs font-bold text-brand-text-primary">
                2. Advisory Pre-Review Inspection
              </h3>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Examine advisory flags such as missing responsive breakpoints or Figma permissions. Use AI prompts as inspiration, but apply independent human judgment.
              </p>
            </div>

            <div className="p-4 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-2">
              <div className="w-7 h-7 rounded-lg bg-brand-yellow flex items-center justify-center font-black text-xs text-brand-text-primary">
                3
              </div>
              <h3 className="text-xs font-bold text-brand-text-primary">
                3. Rubric Scoring & Finalization
              </h3>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Score each rubric criterion manually, compose constructive qualitative feedback, and finalize the evaluation. Once finalized, records are immutable unless appealed.
              </p>
            </div>
          </div>

          {/* Re-evaluation Guidance */}
          <div className="p-4 rounded-xl border border-brand-border space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">Re-Evaluation Policy</Badge>
              <h4 className="text-xs font-bold text-brand-text-primary">
                Managing Student Grade Appeals
              </h4>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              When a student requests re-evaluation, examine their stated appeal rationale. You may approve the request to open Version 2 for revisions or decline the request with clear resolution notes. The original Version 1 remains preserved for audit compliance.
            </p>
          </div>

          {/* Contact Support */}
          <div className="p-4 bg-[#FBFBFA] rounded-xl border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-brand-text-primary block">
                Barabari Facilitator Support & Feedback
              </span>
              <span className="text-brand-text-secondary">
                Questions or feature requests? Reach out to the studio coordinator team.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="mailto:support@barabaricollective.in"
                className="px-3 py-1.5 rounded-xl border border-brand-border bg-white font-semibold text-brand-blue hover:bg-[#F7F7F4] transition-all"
              >
                support@barabaricollective.in
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Reset Preferences Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-text-primary">
                  Reset Facilitator Preferences?
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Restore default UI, alert, and profile preferences.
                </p>
              </div>
            </div>

            <p className="text-xs text-brand-text-secondary leading-relaxed bg-[#FBFBFA] p-3 rounded-xl border border-brand-border">
              <strong className="text-brand-text-primary">Safe Action:</strong> This action only resets settings preferences. Your assignments, rubrics, submissions, evaluated student scores, batch runs, and student data will <strong>NOT</strong> be deleted.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReset}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Yes, Reset Preferences
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FacilitatorSettings;
