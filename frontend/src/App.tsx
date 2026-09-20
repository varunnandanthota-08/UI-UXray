import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
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
  assignmentId?: string
  criteria: RubricCriterion[]
  totalMarks?: number
  totalWeightage?: number
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
    pending: 'bg-amber-100 text-amber-700',
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
  }
  const normalized = (value ?? 'pending').toLowerCase()
  return map[normalized] ?? 'bg-slate-100 text-slate-700'
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  )
}

function AuthScreen({ mode }: { mode: 'student' | 'facilitator' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const title = mode === 'student' ? 'Student Portal' : 'Facilitator Portal'
  const description = mode === 'student' ? 'Access your assignments, submissions, and evaluation feedback.' : 'Review submissions, assign rubrics, and finalize evaluations.'

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
      navigate(mode === 'student' ? '/dashboard' : '/dashboard')
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
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/75">Welcome</p>
              <h2 className="mt-3 text-4xl font-bold">{mode === 'student' ? 'Design, submit, and learn.' : 'Mentor the challenge with confidence.'}</h2>
            </div>
            <p className="max-w-md text-sm text-white/80">{description}</p>
            <div className="grid gap-3 text-sm text-white/90">
              <div className="rounded-xl bg-white/10 p-3">Assignments and due dates</div>
              <div className="rounded-xl bg-white/10 p-3">Submissions and feedback loops</div>
              <div className="rounded-xl bg-white/10 p-3">Real evaluation workflow</div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              Login
            </button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
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

function StudentLayout() {
  const { user, logout } = useAuth()
  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Courses', to: '/courses' },
    { label: 'Units', to: '/units' },
    { label: 'Assignments', to: '/assignments' },
    { label: 'Submissions', to: '/submissions' },
    { label: 'Evaluations', to: '/evaluations' },
    { label: 'Profile', to: '/profile' },
  ]

  return (
    <div className="page-shell flex min-h-screen">
      <aside className="w-full max-w-[260px] border-r border-slate-200 bg-white p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">B</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Barabari</p>
            <h1 className="text-lg font-bold text-slate-800">Student Portal</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}> {item.label} </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl bg-indigo-50 p-3 text-sm text-indigo-700">
          <p className="font-semibold">Signed in as</p>
          <p className="mt-1">{user?.name || 'Student'}</p>
        </div>

        <button type="button" onClick={logout} className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Logout</button>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      try {
        const [assignmentsResponse, submissionsResponse] = await Promise.all([
          api.get('/api/assignments'),
          api.get('/api/submissions/student/mine'),
        ])

        setAssignments((assignmentsResponse.data?.data ?? assignmentsResponse.data ?? []) as Assignment[])
        setSubmissions((submissionsResponse.data?.data ?? submissionsResponse.data ?? []) as Submission[])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length
  const submittedCount = submissions.filter((submission) => submission.status === 'submitted' || submission.status === 'evaluated').length
  const pending = submissions.filter((submission) => !submission.status || submission.status === 'submitted').length

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{user?.name || 'Student'}</h2>
        </div>
        <Link to="/assignments" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">View assignments</Link>
      </header>

      {loading ? <LoadingState label="Loading dashboard..." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Assigned courses" value={String(assignments.length || 0)} subtitle="Active challenge tracks" tone="indigo" />
          <SummaryCard title="Active assignments" value={String(activeAssignments)} subtitle="Currently live" tone="emerald" />
          <SummaryCard title="Submitted" value={String(submittedCount)} subtitle="Designs submitted" tone="amber" />
          <SummaryCard title="Pending evaluations" value={String(pending)} subtitle="Awaiting feedback" tone="violet" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-800">Current assignments</h3>
            <Link to="/assignments" className="text-sm font-semibold text-indigo-600">Open all</Link>
          </div>
          {assignments.length === 0 ? <EmptyState title="No assignments found" message="The facilitator has not published any active assignments yet." /> : (
            <div className="space-y-3">
              {assignments.slice(0, 4).map((assignment) => (
                <Link key={assignment._id} to={`/assignments/${assignment._id}`} className="block rounded-2xl border border-slate-200 p-4 hover:border-indigo-200 hover:bg-indigo-50/40">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{assignment.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{assignment.description}</p>
                    </div>
                    <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Deadline: {formatDate(assignment.deadline)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-800">Submission status</h3>
          {submissions.length === 0 ? <div className="mt-4"><EmptyState title="No submissions found" message="Submit an assignment to track progress here." /></div> : (
            <div className="mt-4 space-y-3">
              {submissions.slice(0, 4).map((submission) => (
                <div key={submission._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-800">{submission.assignmentId?.title || 'Assignment'}</p>
                    <span className={`badge ${statusClasses(submission.status)}`}>{formatStatus(submission.status)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Submitted: {formatDate(submission.submittedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CoursesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/assignments')
        setAssignments((response.data?.data ?? response.data ?? []) as Assignment[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Courses</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Challenge tracks</h2>
      </header>

      {loading ? <LoadingState label="Loading courses..." /> : assignments.length === 0 ? <EmptyState title="No assignments found" message="There are no active course assignments available right now." /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">{assignment.title}</h3>
                <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{assignment.description}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>Deadline: {formatDate(assignment.deadline)}</p>
                <p>Total marks: {assignment.totalMarks ?? 0}</p>
              </div>
              <Link to={`/assignments/${assignment._id}`} className="mt-5 inline-flex rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open assignment</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UnitsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/assignments')
        setAssignments((response.data?.data ?? response.data ?? []) as Assignment[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Units</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Learning units</h2>
      </header>

      {loading ? <LoadingState label="Loading units..." /> : assignments.length === 0 ? <EmptyState title="No units found" message="The current challenge does not have any published units yet." /> : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{assignment.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{assignment.description}</p>
                </div>
                <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
              </div>
              {assignment.instructions && <p className="mt-4 text-sm text-slate-600">{assignment.instructions}</p>}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                {assignment.requirements?.length ? assignment.requirements.map((req) => <span key={req} className="rounded-full bg-slate-100 px-2.5 py-1">{req}</span>) : <span className="rounded-full bg-slate-100 px-2.5 py-1">No extra requirements listed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/assignments')
        setAssignments((response.data?.data ?? response.data ?? []) as Assignment[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Assignments</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Design assignment board</h2>
        </div>
      </header>

      {loading ? <LoadingState label="Loading assignments..." /> : assignments.length === 0 ? <EmptyState title="No assignments found" message="There are no active challenge assignments to display." /> : (
        <div className="grid gap-5">
          {assignments.map((assignment) => (
            <Link key={assignment._id} to={`/assignments/${assignment._id}`} className="card p-5 transition hover:shadow-md">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Assignment</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-800">{assignment.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{assignment.totalMarks ?? 0} marks</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{assignment.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Deadline: {formatDate(assignment.deadline)}</span>
                <span>Instructions: {assignment.instructions ? 'Available' : 'Not provided'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AssignmentDetailPage() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [rubric, setRubric] = useState<Rubric | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const [assignmentResponse, rubricResponse, submissionResponse] = await Promise.all([
          api.get(`/api/assignments/${id}`),
          api.get(`/api/assignments/${id}/rubric`).catch(() => ({ data: { data: null } })),
          api.get(`/api/assignments/${id}/my-submission`).catch(() => ({ data: { data: null } })),
        ])

        setAssignment((assignmentResponse.data?.data ?? assignmentResponse.data ?? null) as Assignment | null)
        setRubric((rubricResponse.data?.data ?? rubricResponse.data ?? null) as Rubric | null)
        setSubmission((submissionResponse.data?.data ?? submissionResponse.data ?? null) as Submission | null)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load assignment details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <LoadingState label="Loading assignment details..." />
  if (!assignment) return <EmptyState title="Assignment not found" message={error || 'This assignment is unavailable.'} />

  return (
    <div className="space-y-6">
      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Assignment</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{assignment.title}</h2>
          </div>
          <span className={`badge ${statusClasses(assignment.status)}`}>{formatStatus(assignment.status)}</span>
        </div>
        <p className="mt-4 text-slate-600">{assignment.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>Deadline: {formatDate(assignment.deadline)}</span>
          <span>Total marks: {assignment.totalMarks ?? 0}</span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-slate-800">Instructions</h3>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{assignment.instructions || 'No instructions listed for this assignment.'}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-slate-800">Rubric</h3>
            {rubric && rubric.criteria?.length ? (
              <div className="mt-4 space-y-4">
                {rubric.criteria.map((criterion) => (
                  <div key={criterion._id || criterion.name} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">{criterion.name}</p>
                      <span className="text-xs font-medium text-slate-500">{criterion.maxMarks} marks / {criterion.weightage}%</span>
                    </div>
                    {criterion.description && <p className="mt-2 text-sm text-slate-600">{criterion.description}</p>}
                    {criterion.checks?.length ? <div className="mt-3 flex flex-wrap gap-2">{criterion.checks.map((check) => <span key={check} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{check}</span>)}</div> : null}
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">No rubric has been published yet for this assignment.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-800">Submission</h3>
          {message && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}
          {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <SubmissionForm assignmentId={assignment._id} defaultValues={submission ?? undefined} onSubmitted={(notice) => { setMessage(notice); setSubmission({ ...submission, status: 'submitted' } as Submission) }} />

          {submission && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Current submission status</p>
              <p className="mt-2 text-sm text-slate-600">{formatStatus(submission.status)}</p>
              <div className="mt-3 text-xs text-slate-500">Submitted on: {formatDate(submission.submittedAt)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SubmissionForm({ assignmentId, defaultValues, onSubmitted }: { assignmentId: string; defaultValues?: Submission; onSubmitted: (message: string) => void }) {
  const [form, setForm] = useState({
    figmaUrl: defaultValues?.figmaUrl ?? '',
    figjamUrl: defaultValues?.figjamUrl ?? '',
    canvaUrl: defaultValues?.canvaUrl ?? '',
    prototypeUrl: defaultValues?.prototypeUrl ?? '',
    researchNotes: defaultValues?.researchNotes ?? '',
    persona: defaultValues?.persona ?? '',
    userFlow: defaultValues?.userFlow ?? '',
    additionalNotes: defaultValues?.additionalNotes ?? '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (defaultValues?._id) {
        await api.put(`/api/submissions/${defaultValues._id}`, form)
        onSubmitted('Your submission was updated successfully.')
      } else {
        await api.post(`/api/assignments/${assignmentId}/submissions`, form)
        onSubmitted('Your design submission was created successfully.')
      }
    } catch (err: any) {
      onSubmitted(err?.response?.data?.message || 'Submission failed. Please check the required fields and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Figma URL"><input value={form.figmaUrl} onChange={(e) => setForm({ ...form, figmaUrl: e.target.value })} className="input" placeholder="https://figma.com/..." /></Field>
        <Field label="FigJam URL"><input value={form.figjamUrl} onChange={(e) => setForm({ ...form, figjamUrl: e.target.value })} className="input" placeholder="https://figma.com/..." /></Field>
        <Field label="Canva URL"><input value={form.canvaUrl} onChange={(e) => setForm({ ...form, canvaUrl: e.target.value })} className="input" placeholder="https://canva.com/..." /></Field>
        <Field label="Prototype URL"><input value={form.prototypeUrl} onChange={(e) => setForm({ ...form, prototypeUrl: e.target.value })} className="input" placeholder="https://..." /></Field>
      </div>

      <Field label="Research notes"><textarea value={form.researchNotes} onChange={(e) => setForm({ ...form, researchNotes: e.target.value })} className="input h-24" placeholder="Research insights, findings, and notes." /></Field>
      <Field label="Persona"><textarea value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })} className="input h-24" placeholder="Key persona summary" /></Field>
      <Field label="User flow"><textarea value={form.userFlow} onChange={(e) => setForm({ ...form, userFlow: e.target.value })} className="input h-24" placeholder="Primary flow and decisions" /></Field>
      <Field label="Additional notes"><textarea value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} className="input h-24" placeholder="Any extra context or notes" /></Field>

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Submitting...' : defaultValues?._id ? 'Update submission' : 'Submit design'}</button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}

function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/submissions/student/mine')
        setSubmissions((response.data?.data ?? response.data ?? []) as Submission[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Submission status</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">My submissions</h2>
      </header>

      {loading ? <LoadingState label="Loading submissions..." /> : submissions.length === 0 ? <EmptyState title="No submissions found" message="You have not submitted any assignments yet." /> : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="card p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{submission.assignmentId?.title || 'Assignment'}</h3>
                  <p className="text-sm text-slate-500">Submitted: {formatDate(submission.submittedAt)}</p>
                </div>
                <span className={`badge ${statusClasses(submission.status)}`}>{formatStatus(submission.status)}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {submission.figmaUrl && <a href={submission.figmaUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">Figma URL</a>}
                {submission.figjamUrl && <a href={submission.figjamUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">FigJam URL</a>}
                {submission.canvaUrl && <a href={submission.canvaUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">Canva URL</a>}
                {submission.prototypeUrl && <a href={submission.prototypeUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">Prototype URL</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StudentEvaluationsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/submissions/student/mine')
        const studentSubmissions = (response.data?.data ?? response.data ?? []) as Submission[]
        setSubmissions(studentSubmissions)

        const settled = await Promise.all(
          studentSubmissions.map(async (submission) => {
            try {
              const evaluationResponse = await api.get(`/api/submissions/${submission._id}/evaluation`)
              return [submission._id, evaluationResponse.data?.data ?? evaluationResponse.data ?? null] as const
            } catch {
              return [submission._id, null] as const
            }
          }),
        )

        const nextEvaluations: Record<string, Evaluation> = {}
        for (const [submissionId, evaluation] of settled) {
          if (evaluation) nextEvaluations[submissionId] = evaluation as Evaluation
        }
        setEvaluations(nextEvaluations)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Evaluations</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">My feedback</h2>
      </header>

      {loading ? <LoadingState label="Loading evaluation data..." /> : submissions.length === 0 ? <EmptyState title="No evaluations available" message="You do not have any published evaluations yet." /> : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const evaluation = evaluations[submission._id]
            return (
              <div key={submission._id} className="card p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{submission.assignmentId?.title || 'Assignment'}</h3>
                    <p className="text-sm text-slate-500">Status: {formatStatus(submission.status)}</p>
                  </div>
                  {evaluation && <span className={`badge ${statusClasses(evaluation.status)}`}>{formatStatus(evaluation.status)}</span>}
                </div>

                {!evaluation ? (
                  <p className="mt-4 text-sm text-slate-500">Evaluation pending. The facilitator has not published a final review yet.</p>
                ) : (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-2xl bg-indigo-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-800">Final score</p>
                        <span className="text-xl font-bold text-indigo-700">{evaluation.finalMarks ?? evaluation.aiSuggestedMarks ?? 0} / {submission.assignmentId?.totalMarks ?? 0}</span>
                      </div>
                    </div>

                    {evaluation.criteriaResults?.length ? (
                      <div className="space-y-3">
                        {evaluation.criteriaResults.map((criterion) => (
                          <div key={`${criterion.criterionName}-${criterion.maxMarks}`} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-slate-800">{criterion.criterionName}</p>
                              <span className={`badge ${statusClasses(criterion.automatedStatus)}`}>{criterion.automatedStatus || 'Pending'}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">Awarded {criterion.awardedMarks ?? 0} / {criterion.maxMarks ?? 0}</p>
                            {criterion.facilitatorComment && <p className="mt-2 text-sm text-slate-600">{criterion.facilitatorComment}</p>}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {evaluation.aiFeedback?.strengths?.length ? (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="font-semibold text-slate-800">Strengths</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                          {evaluation.aiFeedback.strengths.map((point) => <li key={point}>{point}</li>)}
                        </ul>
                      </div>
                    ) : null}

                    {evaluation.facilitatorComments && (
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="font-semibold text-slate-800">Facilitator feedback</p>
                        <p className="mt-2 text-sm text-slate-600">{evaluation.facilitatorComments}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StudentProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Profile</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Account settings</h2>
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

function ReEvaluationPage() {
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-slate-900">Re-evaluation</h2>
      <p className="mt-3 text-slate-600">This API route is not currently exposed by the backend, so re-evaluation requests are unavailable from the frontend until the backend adds support.</p>
    </div>
  )
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

function StudentAppShell() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthScreen mode="student" />} />
        <Route path="/signup" element={<AuthScreen mode="student" />} />
        <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/units" element={<UnitsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="/submissions" element={<StudentSubmissionsPage />} />
          <Route path="/evaluations" element={<StudentEvaluationsPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
          <Route path="/re-evaluation" element={<ReEvaluationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default StudentAppShell
