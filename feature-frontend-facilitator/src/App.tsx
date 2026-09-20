import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import api from './lib/api'
import { useAuth } from './context/AuthContext'

type Assignment = {
  _id: string
  title: string
  description: string
  instructions?: string
  totalMarks?: number
  deadline?: string
  status?: 'draft' | 'active' | 'closed'
  requirements?: string[]
  createdAt?: string
}

type RubricCriterion = {
  _id?: string
  name: string
  description?: string
  maxMarks: number
  weightage: number
  checks?: string[]
}

type Rubric = {
  _id?: string
  criteria: RubricCriterion[]
  totalMarks?: number
  totalWeightage?: number
}

type Submission = {
  _id: string
  assignmentId?: { _id?: string; title?: string; description?: string; deadline?: string; totalMarks?: number; status?: string }
  studentId?: { _id?: string; name?: string; email?: string }
  figmaUrl?: string
  figjamUrl?: string
  canvaUrl?: string
  prototypeUrl?: string
  researchNotes?: string
  persona?: string
  userFlow?: string
  additionalNotes?: string
  status?: string
  submittedAt?: string
}

type Evaluation = {
  _id?: string
  submissionId?: string
  assignmentId?: string
  status?: string
  aiSuggestedMarks?: number
  finalMarks?: number
  facilitatorComments?: string
  criteriaResults?: Array<{ criterionName?: string; maxMarks?: number; awardedMarks?: number; automatedStatus?: string; automatedNotes?: string; facilitatorComment?: string }>
  aiFeedback?: {
    strengths?: string[]
    missingRequirements?: string[]
    improvements?: string[]
    criterionObservations?: Array<{ criterionName?: string; status?: string; observations?: string[]; missing?: string[]; suggestions?: string[] }>
  }
}

function formatDate(value?: string) {
  if (!value) return 'No deadline'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatStatus(value?: string) {
  if (!value) return 'unknown'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function statusClasses(value?: string) {
  const map: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-200 text-slate-700',
    evaluated: 'bg-violet-100 text-violet-700',
    approved: 'bg-emerald-100 text-emerald-700',
    published: 'bg-emerald-100 text-emerald-700',
    under_evaluation: 'bg-amber-100 text-amber-700',
    ai_review_complete: 'bg-indigo-100 text-indigo-700',
    facilitator_review: 'bg-amber-100 text-amber-700',
    partial: 'bg-yellow-100 text-yellow-700',
    missing: 'bg-red-100 text-red-700',
    pass: 'bg-emerald-100 text-emerald-700',
    insufficient_evidence: 'bg-orange-100 text-orange-700',
    pending: 'bg-amber-100 text-amber-700',
  }
  const normalized = (value ?? 'pending').toLowerCase()
  return map[normalized] ?? 'bg-slate-100 text-slate-700'
}

function LoadingState({ label }: { label: string }) {
  return <div className="card p-6"><p className="text-sm text-slate-500">{label}</p></div>
}

function SummaryCard({ title, value, subtitle, tone }: { title: string; value: string; subtitle: string; tone: 'indigo' | 'emerald' | 'amber' | 'violet' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  }

  return (
    <div className="card p-5">
      <div className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{title}</div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="card p-8 text-center"><h3 className="text-lg font-semibold text-slate-700">{title}</h3><p className="mt-2 text-sm text-slate-500">{message}</p></div>
}

function AuthScreen({ mode }: { mode: 'student' | 'facilitator' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password })
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: mode,
        })
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to complete the request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className={mode === 'student' ? 'bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white' : 'bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white'}>
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">B</div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">Barabari</p>
              <h1 className="text-2xl font-bold">{mode === 'student' ? 'Student Portal' : 'Facilitator Portal'}</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/75">Access</p>
              <h2 className="mt-3 text-4xl font-bold">{mode === 'student' ? 'Track your challenge progress.' : 'Manage evaluations and mentoring.'}</h2>
            </div>
            <p className="max-w-md text-sm text-white/80">{mode === 'student' ? 'Review active assignments, submit your designs, and access evaluation feedback.' : 'Create assignments, review student submissions, and publish final assessments.'}</p>
            <div className="grid gap-3 text-sm text-white/90">
              <div className="rounded-xl bg-white/10 p-3">Real backend authentication</div>
              <div className="rounded-xl bg-white/10 p-3">Assignment management</div>
              <div className="rounded-xl bg-white/10 p-3">Live evaluation workflow</div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Login</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Mentor" required />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white ${mode === 'student' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-70`}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="page-shell flex items-center justify-center"><p className="text-slate-500">Loading session...</p></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}

function FacilitatorLayout() {
  const { user, logout } = useAuth()
  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Assignments', to: '/assignments' },
    { label: 'Rubrics', to: '/rubrics' },
    { label: 'Submissions', to: '/submissions' },
    { label: 'Evaluations', to: '/evaluations' },
    { label: 'Batch Evaluation', to: '/batch-evaluation' },
    { label: 'Profile', to: '/profile' },
  ]

  return (
    <div className="page-shell flex min-h-screen">
      <aside className="w-full max-w-[260px] border-r border-slate-200 bg-white p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">B</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Barabari</p>
            <h1 className="text-lg font-bold text-slate-800">Mentor Portal</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}> {item.label} </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
          <p className="font-semibold">Signed in as</p>
          <p className="mt-1">{user?.name || 'Mentor'}</p>
        </div>

        <button type="button" onClick={logout} className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Logout</button>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function FacilitatorDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const assignmentsResponse = await api.get('/api/assignments')
        const assignmentsData = (assignmentsResponse.data?.data ?? assignmentsResponse.data ?? []) as Assignment[]
        setAssignments(assignmentsData)

        const allSubmissions: Submission[] = []
        for (const assignment of assignmentsData) {
          try {
            const res = await api.get(`/api/assignments/${assignment._id}/submissions`)
            const data = (res.data?.data ?? res.data ?? []) as Submission[]
            allSubmissions.push(...data)
          } catch {
            // ignore incomplete assignment data
          }
        }
        setSubmissions(allSubmissions)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length
  const pendingSubmissions = submissions.filter((submission) => submission.status === 'submitted').length
  const published = submissions.filter((submission) => submission.status === 'evaluated').length

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Overview</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Facilitator dashboard</h2>
        </div>
        <Link to="/assignments" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Manage assignments</Link>
      </header>

      {loading ? <LoadingState label="Loading dashboard..." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total assignments" value={String(assignments.length)} subtitle="Published and draft" tone="emerald" />
          <SummaryCard title="Active assignments" value={String(activeAssignments)} subtitle="Now accepting submissions" tone="indigo" />
          <SummaryCard title="Submissions" value={String(submissions.length)} subtitle="Student work received" tone="amber" />
          <SummaryCard title="Pending evaluations" value={String(pendingSubmissions)} subtitle="Awaiting review" tone="violet" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-800">Assignments</h3>
          {assignments.length === 0 ? <div className="mt-4"><EmptyState title="No assignments found" message="Create an assignment to start the workflow." /></div> : (
            <div className="mt-4 space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div key={assignment._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">{assignment.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{assignment.description}</p>
                    </div>
                    <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Deadline: {formatDate(assignment.deadline)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-800">Evaluation overview</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pending review</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{pendingSubmissions}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Published evaluations</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{published}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssignmentForm({ initialData, onSubmitSuccess }: { initialData?: Assignment | null; onSubmitSuccess: () => void }) {
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    instructions: initialData?.instructions ?? '',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
    totalMarks: initialData?.totalMarks ?? 100,
    status: initialData?.status ?? 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        instructions: initialData.instructions ?? '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
        totalMarks: initialData.totalMarks ?? 100,
        status: initialData.status ?? 'active',
      })
    }
  }, [initialData])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        instructions: form.instructions,
        totalMarks: Number(form.totalMarks),
        deadline: new Date(form.deadline).toISOString(),
        status: form.status,
      }

      if (initialData?._id) {
        await api.put(`/api/assignments/${initialData._id}`, payload)
      } else {
        await api.post('/api/assignments', payload)
      }
      onSubmitSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save the assignment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 md:col-span-2"><span className="mb-1 block">Assignment title</span><input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2"><span className="mb-1 block">Description</span><textarea className="h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2"><span className="mb-1 block">Instructions</span><textarea className="h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></label>
        <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Deadline</span><input type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required /></label>
        <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Total marks</span><input type="number" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} min={1} required /></label>
        <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Status</span><select className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'active' | 'closed' })}><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></label>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Saving...' : initialData ? 'Update assignment' : 'Create assignment'}</button>
    </form>
  )
}

function FacilitatorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadAssignments() {
    setLoading(true)
    try {
      const response = await api.get('/api/assignments')
      const data = (response.data?.data ?? response.data ?? []) as Assignment[]
      setAssignments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAssignments() }, [])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Assignments</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Manage challenge assignments</h2>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-800">{selectedAssignment ? 'Edit assignment' : 'Create assignment'}</h3>
          <div className="mt-4"><AssignmentForm initialData={selectedAssignment} onSubmitSuccess={() => { setSelectedAssignment(null); void loadAssignments() }} /></div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-800">Current assignments</h3>
          {loading ? <LoadingState label="Loading assignments..." /> : assignments.length === 0 ? <div className="mt-4"><EmptyState title="No assignments found" message="Create your first assignment to begin." /></div> : (
            <div className="mt-4 space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{assignment.title}</p>
                    <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
                  <div className="mt-3 flex justify-between gap-3 text-xs text-slate-500">
                    <span>{formatDate(assignment.deadline)}</span>
                    <span>{assignment.totalMarks ?? 0} pts</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setSelectedAssignment(assignment)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                    <Link to={`/rubrics?assignment=${assignment._id}`} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Rubric</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RubricForm({ assignmentId, initialRubric, onSaved }: { assignmentId: string; initialRubric?: Rubric | null; onSaved: () => void }) {
  const emptyCriterion: RubricCriterion = { name: '', description: '', maxMarks: 10, weightage: 10, checks: [''] }
  const [criteria, setCriteria] = useState<RubricCriterion[]>(initialRubric?.criteria && initialRubric.criteria.length ? initialRubric.criteria : [emptyCriterion])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCriteria(initialRubric?.criteria && initialRubric.criteria.length ? initialRubric.criteria : [emptyCriterion])
  }, [initialRubric])

  function updateCriterion(index: number, field: keyof RubricCriterion, value: string | number | string[]) {
    setCriteria((current) => current.map((criterion, i) => i === index ? { ...criterion, [field]: value } : criterion))
  }

  function addCriterion() {
    setCriteria((current) => [...current, { ...emptyCriterion, name: `Criterion ${current.length + 1}` }])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        criteria: criteria.map((criterion) => ({
          name: criterion.name,
          description: criterion.description ?? '',
          maxMarks: Number(criterion.maxMarks),
          weightage: Number(criterion.weightage),
          checks: (criterion.checks ?? []).filter(Boolean),
        })),
      }

      if (initialRubric?._id) {
        await api.put(`/api/assignments/${assignmentId}/rubric`, payload)
      } else {
        await api.post(`/api/assignments/${assignmentId}/rubric`, payload)
      }
      onSaved()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save rubric.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {criteria.map((criterion, index) => (
        <div key={`${criterion.name}-${index}`} className="rounded-2xl border border-slate-200 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Criterion name</span><input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={criterion.name} onChange={(e) => updateCriterion(index, 'name', e.target.value)} required /></label>
            <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Max marks</span><input type="number" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={criterion.maxMarks} onChange={(e) => updateCriterion(index, 'maxMarks', Number(e.target.value))} min={1} required /></label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2"><span className="mb-1 block">Description</span><textarea className="h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5" value={criterion.description ?? ''} onChange={(e) => updateCriterion(index, 'description', e.target.value)} /></label>
            <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Weightage (%)</span><input type="number" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={criterion.weightage} onChange={(e) => updateCriterion(index, 'weightage', Number(e.target.value))} min={0} max={100} required /></label>
            <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Checks</span><input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={(criterion.checks ?? []).join(', ')} onChange={(e) => updateCriterion(index, 'checks', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={addCriterion} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Add criterion</button>
        <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Saving...' : initialRubric ? 'Update rubric' : 'Create rubric'}</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
    </form>
  )
}

function FacilitatorRubricsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [rubric, setRubric] = useState<Rubric | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/assignments')
        const assignmentList = (response.data?.data ?? response.data ?? []) as Assignment[]
        setAssignments(assignmentList)
        if (assignmentList[0]) {
          setSelectedAssignmentId(assignmentList[0]._id)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedAssignmentId) return
    async function loadRubric() {
      try {
        const response = await api.get(`/api/assignments/${selectedAssignmentId}/rubric`)
        setRubric((response.data?.data ?? response.data ?? null) as Rubric | null)
      } catch {
        setRubric(null)
      }
    }
    loadRubric()
  }, [selectedAssignmentId])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Rubrics</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Assessment criteria</h2>
      </header>

      {loading ? <LoadingState label="Loading rubrics..." /> : (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="card p-6">
            <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Select assignment</span><select className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)}>
              {assignments.map((assignment) => <option key={assignment._id} value={assignment._id}>{assignment.title}</option>)}
            </select></label>
          </div>

          <div className="card p-6">
            {selectedAssignmentId ? <RubricForm assignmentId={selectedAssignmentId} initialRubric={rubric} onSaved={() => { void (async () => { const response = await api.get(`/api/assignments/${selectedAssignmentId}/rubric`); setRubric((response.data?.data ?? response.data ?? null) as Rubric | null) })() }} /> : <EmptyState title="No assignment selected" message="Pick an assignment to manage its rubric." />}
          </div>
        </div>
      )}
    </div>
  )
}

function FacilitatorSubmissionsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAssignments() {
      try {
        const response = await api.get('/api/assignments')
        const list = (response.data?.data ?? response.data ?? []) as Assignment[]
        setAssignments(list)
        if (list[0]) setSelectedAssignmentId(list[0]._id)
      } finally {
        setLoading(false)
      }
    }
    loadAssignments()
  }, [])

  useEffect(() => {
    if (!selectedAssignmentId) return
    async function loadSubmissions() {
      try {
        const response = await api.get(`/api/assignments/${selectedAssignmentId}/submissions`)
        setSubmissions((response.data?.data ?? response.data ?? []) as Submission[])
      } catch {
        setSubmissions([])
      }
    }
    loadSubmissions()
  }, [selectedAssignmentId])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Submissions</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Student submissions</h2>
      </header>

      {loading ? <LoadingState label="Loading submissions..." /> : (
        <div className="space-y-6">
          <div className="card p-4">
            <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Select assignment</span><select className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)}>
              {assignments.map((assignment) => <option key={assignment._id} value={assignment._id}>{assignment.title}</option>)}
            </select></label>
          </div>

          {submissions.length === 0 ? <EmptyState title="No submissions found" message="No student work has been submitted for this assignment yet." /> : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission._id} className="card p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{submission.studentId?.name || 'Student'}</h3>
                      <p className="text-sm text-slate-500">{submission.studentId?.email || 'No email available'}</p>
                    </div>
                    <span className={`badge ${statusClasses(submission.status)}`}>{formatStatus(submission.status)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {submission.figmaUrl && <a className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700" href={submission.figmaUrl} target="_blank" rel="noreferrer">Figma</a>}
                    {submission.figjamUrl && <a className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700" href={submission.figjamUrl} target="_blank" rel="noreferrer">FigJam</a>}
                    {submission.canvaUrl && <a className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700" href={submission.canvaUrl} target="_blank" rel="noreferrer">Canva</a>}
                    {submission.prototypeUrl && <a className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700" href={submission.prototypeUrl} target="_blank" rel="noreferrer">Prototype</a>}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/evaluations?submission=${submission._id}`} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Evaluate</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EvaluationEditor({ submissionId }: { submissionId: string }) {
  const [draft, setDraft] = useState<Evaluation | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [facilitatorComments, setFacilitatorComments] = useState('')
  const [finalMarks, setFinalMarks] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/api/submissions/${submissionId}/evaluation`)
        const data = (response.data?.data ?? response.data ?? null) as Evaluation | null
        setDraft(data)
        setFacilitatorComments(data?.facilitatorComments ?? '')
        setFinalMarks(data?.finalMarks ?? data?.aiSuggestedMarks ?? 0)
        setStatus(data?.status ?? 'draft')
      } catch {
        setDraft(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [submissionId])

  async function generateAiDraft() {
    try {
      const response = await api.post(`/api/submissions/${submissionId}/ai-draft`)
      const data = response.data?.data ?? response.data ?? null
      setDraft(data)
      setFacilitatorComments(data?.facilitatorComments ?? '')
      setFinalMarks(data?.finalMarks ?? data?.aiSuggestedMarks ?? 0)
      setStatus(data?.status ?? 'draft')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to generate the AI draft.')
    }
  }

  async function saveEvaluation() {
    try {
      const payload = {
        finalMarks,
        facilitatorComments,
        status: 'approved',
      }
      if (draft?._id) {
        await api.put(`/api/evaluations/${draft._id}`, payload)
      } else {
        await api.post(`/api/submissions/${submissionId}/evaluation`, payload)
      }
      setError('')
      setStatus('approved')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to finalize the evaluation.')
    }
  }

  if (loading) return <LoadingState label="Loading evaluation" />

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <button type="button" onClick={generateAiDraft} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Generate AI draft</button>
        <button type="button" onClick={saveEvaluation} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Finalize & publish</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Final marks</span><input type="number" value={finalMarks} onChange={(e) => setFinalMarks(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Status: <span className="font-semibold text-slate-800">{status || 'Draft'}</span></div>
      </div>

      <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">Facilitator feedback</span><textarea value={facilitatorComments} onChange={(e) => setFacilitatorComments(e.target.value)} className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>

      {draft?.aiFeedback && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">AI suggested evaluation</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {draft.aiFeedback.strengths?.length ? <div><p className="font-medium text-slate-700">Strengths</p><ul className="list-disc pl-5">{draft.aiFeedback.strengths.map((point) => <li key={point}>{point}</li>)}</ul></div> : null}
            {draft.aiFeedback.missingRequirements?.length ? <div><p className="font-medium text-slate-700">Missing areas</p><ul className="list-disc pl-5">{draft.aiFeedback.missingRequirements.map((point) => <li key={point}>{point}</li>)}</ul></div> : null}
            {draft.aiFeedback.improvements?.length ? <div><p className="font-medium text-slate-700">Suggested improvements</p><ul className="list-disc pl-5">{draft.aiFeedback.improvements.map((point) => <li key={point}>{point}</li>)}</ul></div> : null}
          </div>
        </div>
      )}
    </div>
  )
}

function FacilitatorEvaluationPage() {
  const params = new URLSearchParams(window.location.search)
  const submissionId = params.get('submission') || ''
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(submissionId)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/assignments')
        const assignments = (response.data?.data ?? response.data ?? []) as Assignment[]
        const collected: Submission[] = []
        for (const assignment of assignments) {
          try {
            const subRes = await api.get(`/api/assignments/${assignment._id}/submissions`)
            collected.push(...((subRes.data?.data ?? subRes.data ?? []) as Submission[]))
          } catch {
            /* ignore */
          }
        }
        setSubmissions(collected)
        if (collected[0] && !selectedSubmissionId) setSelectedSubmissionId(collected[0]._id)
      } catch {
        setSubmissions([])
      }
    }
    load()
  }, [selectedSubmissionId])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Evaluation</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Review student work</h2>
      </header>

      {submissions.length === 0 ? <EmptyState title="No submissions found" message="There are no student submissions to evaluate yet." /> : (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="card p-6">
            <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Select submission</span><select className="w-full rounded-xl border border-slate-200 px-3 py-2.5" value={selectedSubmissionId} onChange={(e) => setSelectedSubmissionId(e.target.value)}>
              {submissions.map((submission) => <option key={submission._id} value={submission._id}>{submission.studentId?.name || 'Student'} - {submission.assignmentId?.title || 'Assignment'}</option>)}
            </select></label>
          </div>

          <div className="card p-6">
            {selectedSubmissionId ? <EvaluationEditor submissionId={selectedSubmissionId} /> : <EmptyState title="Choose a submission" message="Select a student submission to review." />}
          </div>
        </div>
      )}
    </div>
  )
}

function FacilitatorBatchEvaluationPage() {
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-slate-900">Batch evaluation</h2>
      <p className="mt-3 text-slate-600">This project exposes the assignment, submission, and evaluation endpoints individually. There is no dedicated batch processing endpoint in the backend, so batch evaluation is handled through the available submission and evaluation routes.</p>
    </div>
  )
}

function FacilitatorProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Profile</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Mentor account</h2>
      </header>

      <div className="card p-6">
        <div className="space-y-4 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-800">Name:</span> {user?.name}</p>
          <p><span className="font-semibold text-slate-800">Email:</span> {user?.email}</p>
          <p><span className="font-semibold text-slate-800">Role:</span> {user?.role}</p>
        </div>

        <button type="button" onClick={logout} className="mt-6 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Logout</button>
      </div>
    </div>
  )
}

function FacilitatorAppShell() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthScreen mode="facilitator" />} />
        <Route path="/signup" element={<AuthScreen mode="facilitator" />} />
        <Route element={<ProtectedRoute><FacilitatorLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<FacilitatorDashboard />} />
          <Route path="/assignments" element={<FacilitatorAssignmentsPage />} />
          <Route path="/rubrics" element={<FacilitatorRubricsPage />} />
          <Route path="/submissions" element={<FacilitatorSubmissionsPage />} />
          <Route path="/evaluations" element={<FacilitatorEvaluationPage />} />
          <Route path="/batch-evaluation" element={<FacilitatorBatchEvaluationPage />} />
          <Route path="/profile" element={<FacilitatorProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default FacilitatorAppShell
