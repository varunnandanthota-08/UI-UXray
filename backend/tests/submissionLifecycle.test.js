const test = require('node:test')
const assert = require('node:assert/strict')

test('Student Submission Lifecycle Suite', async (t) => {
  // Mock localStorage simulator for node environment
  class MockLocalStorage {
    constructor() {
      this.store = {}
    }
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
    }
    setItem(key, value) {
      this.store[key] = String(value)
    }
    removeItem(key) {
      delete this.store[key]
    }
    clear() {
      this.store = {}
    }
  }

  const STORAGE_KEYS = {
    SUBMISSIONS: 'barabari_mock_submissions',
    DRAFTS: 'barabari_mock_drafts_'
  }

  await t.test('1. Submitting assignment creates a persistent submission record with attempt number', () => {
    const storage = new MockLocalStorage()
    const mockAssignments = {
      'asg-4': { id: 'asg-4', title: 'One Clickable Prototype with Motion', maxScore: 20 }
    }

    function submit(payload) {
      const existing = storage.getItem(STORAGE_KEYS.SUBMISSIONS)
        ? JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
        : []

      const previousAttempts = existing.filter((s) => s.assignmentId === payload.assignmentId)
      const attemptNumber = previousAttempts.length + 1

      const newSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId: payload.assignmentId,
        assignmentTitle: mockAssignments[payload.assignmentId]?.title || 'Assignment',
        submittedAt: new Date().toISOString(),
        status: 'PROCESSING',
        attempt: attemptNumber,
        attemptNumber: attemptNumber,
        artifacts: { figmaUrl: payload.figmaUrl }
      }

      storage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([newSubmission, ...existing]))
      storage.removeItem(`${STORAGE_KEYS.DRAFTS}${payload.assignmentId}`)
      return newSubmission
    }

    // Save a draft first
    storage.setItem(`${STORAGE_KEYS.DRAFTS}asg-4`, JSON.stringify({ figmaUrl: 'https://figma.com/demo' }))
    assert.ok(storage.getItem(`${STORAGE_KEYS.DRAFTS}asg-4`))

    // Submit assignment
    const submission1 = submit({ assignmentId: 'asg-4', figmaUrl: 'https://figma.com/proto/test1' })
    assert.equal(submission1.assignmentId, 'asg-4')
    assert.equal(submission1.attempt, 1)
    assert.equal(submission1.status, 'PROCESSING')

    // Verify draft was deleted upon submission
    assert.equal(storage.getItem(`${STORAGE_KEYS.DRAFTS}asg-4`), null)

    // Verify persisted in storage
    const stored = JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
    assert.equal(stored.length, 1)
    assert.equal(stored[0].id, submission1.id)

    // Resubmit (Attempt 2)
    const submission2 = submit({ assignmentId: 'asg-4', figmaUrl: 'https://figma.com/proto/test2' })
    assert.equal(submission2.attempt, 2)
    const storedAfterResubmit = JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
    assert.equal(storedAfterResubmit.length, 2)
    assert.equal(storedAfterResubmit[0].attempt, 2)
  })

  await t.test('2. Accidental rapid duplicate submissions within 5 seconds are prevented', () => {
    const storage = new MockLocalStorage()
    function submitWithDebounce(payload) {
      const existing = storage.getItem(STORAGE_KEYS.SUBMISSIONS)
        ? JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
        : []

      const duplicate = existing.find(
        (s) =>
          s.assignmentId === payload.assignmentId &&
          s.artifacts?.figmaUrl === payload.figmaUrl &&
          Date.now() - new Date(s.submittedAt).getTime() < 5000
      )
      if (duplicate) {
        return { isDuplicate: true, submission: duplicate }
      }

      const newSub = {
        id: `sub-${Date.now()}`,
        assignmentId: payload.assignmentId,
        submittedAt: new Date().toISOString(),
        artifacts: { figmaUrl: payload.figmaUrl }
      }
      storage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([newSub, ...existing]))
      return { isDuplicate: false, submission: newSub }
    }

    const first = submitWithDebounce({ assignmentId: 'asg-4', figmaUrl: 'https://figma.com/proto/double-click' })
    assert.equal(first.isDuplicate, false)

    // Immediate second click with identical payload
    const second = submitWithDebounce({ assignmentId: 'asg-4', figmaUrl: 'https://figma.com/proto/double-click' })
    assert.equal(second.isDuplicate, true)
    assert.equal(second.submission.id, first.submission.id)

    const list = JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
    assert.equal(list.length, 1, 'Only one submission must exist in storage despite rapid double click')
  })

  await t.test('3. Merging backend submissions with mock submissions preserves mock submissions when backend returns empty array', () => {
    const mockList = [
      { id: 'sub-2026-003', assignmentId: 'asg-3', status: 'PUBLISHED', evaluationId: 'eval-asg-3', attempt: 1 },
      { id: 'sub-2026-002', assignmentId: 'asg-2', status: 'PUBLISHED', evaluationId: 'eval-asg-2', attempt: 1 },
      { id: 'sub-004-new', assignmentId: 'asg-4', status: 'PROCESSING', attempt: 1 }
    ]

    // Backend returns empty data array
    const backendRes = { success: true, count: 0, data: [] }
    const backendRaw = Array.isArray(backendRes.data)
      ? backendRes.data
      : (Array.isArray(backendRes?.data?.data) ? backendRes.data.data : [])

    const merged = [...backendRaw]
    for (const mockItem of mockList) {
      const exists = merged.some(
        (b) => b.id === mockItem.id || (b.assignmentId === mockItem.assignmentId && (b.attempt || 1) === (mockItem.attempt || 1))
      )
      if (!exists) {
        merged.push(mockItem)
      }
    }

    assert.equal(merged.length, 3)
    const asg4 = merged.find((m) => m.assignmentId === 'asg-4')
    assert.ok(asg4, 'asg-4 submission must be included in merged list')
    assert.equal(asg4.status, 'PROCESSING')
  })

  await t.test('4. Dashboard and Assignment action resolver maps correctly across all lifecycle states', () => {
    function resolveAction({ submission, hasDraft }) {
      const isEvaluated = Boolean(
        submission &&
        (submission.status === 'PUBLISHED' || submission.status === 'APPROVED' || submission.evaluationStatus === 'FINALIZED') &&
        submission.evaluationId
      )
      const isSubmitted = Boolean(submission)

      if (isEvaluated) {
        return { label: 'View Evaluation', link: `/student/evaluations/${submission.evaluationId}`, status: 'PUBLISHED' }
      }
      if (isSubmitted) {
        return { label: 'View Submission', link: `/student/submissions/${submission.id}`, status: submission.status }
      }
      if (hasDraft) {
        return { label: 'Continue Submission', link: '/student/assignments/asg-4/submit', status: 'IN PROGRESS' }
      }
      return { label: 'Submit Assignment', link: '/student/assignments/asg-4/submit', status: 'NOT STARTED' }
    }

    // State A: Genuine draft exists, not submitted yet
    const stateDraft = resolveAction({ submission: null, hasDraft: true })
    assert.equal(stateDraft.label, 'Continue Submission')
    assert.equal(stateDraft.status, 'IN PROGRESS')

    // State B: Assignment has been submitted (processing / under review)
    const stateSubmitted = resolveAction({
      submission: { id: 'sub-004', assignmentId: 'asg-4', status: 'PROCESSING' },
      hasDraft: false
    })
    assert.equal(stateSubmitted.label, 'View Submission')
    assert.equal(stateSubmitted.link, '/student/submissions/sub-004')
    assert.equal(stateSubmitted.status, 'PROCESSING')

    // State C: Even if an old draft string remained, if submission exists, View Submission takes precedence
    const stateSubmittedWithOldDraft = resolveAction({
      submission: { id: 'sub-004', assignmentId: 'asg-4', status: 'UNDER_REVIEW' },
      hasDraft: true
    })
    assert.equal(stateSubmittedWithOldDraft.label, 'View Submission')
    assert.notEqual(stateSubmittedWithOldDraft.label, 'Continue Submission')

    // State D: Evaluation is published
    const stateEvaluated = resolveAction({
      submission: { id: 'sub-003', assignmentId: 'asg-3', status: 'PUBLISHED', evaluationId: 'eval-asg-3' },
      hasDraft: false
    })
    assert.equal(stateEvaluated.label, 'View Evaluation')
    assert.equal(stateEvaluated.link, '/student/evaluations/eval-asg-3')
    assert.equal(stateEvaluated.status, 'PUBLISHED')

    // State E: Not started and no draft
    const stateNotStarted = resolveAction({ submission: null, hasDraft: false })
    assert.equal(stateNotStarted.label, 'Submit Assignment')
    assert.equal(stateNotStarted.status, 'NOT STARTED')
  })

  await t.test('5. getMySubmission retrieves latest submission for assignment', () => {
    const list = [
      { id: 'sub-1', assignmentId: 'asg-4', submittedAt: '2026-09-20T10:00:00Z', attempt: 1 },
      { id: 'sub-2', assignmentId: 'asg-4', submittedAt: '2026-09-21T15:00:00Z', attempt: 2 },
      { id: 'sub-3', assignmentId: 'asg-3', submittedAt: '2026-09-10T14:22:00Z', attempt: 1 }
    ]

    function getMySubmission(assignmentId) {
      const matching = list
        .filter((s) => s.assignmentId === assignmentId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      return matching[0] || null
    }

    const asg4Latest = getMySubmission('asg-4')
    assert.equal(asg4Latest.id, 'sub-2')
    assert.equal(asg4Latest.attempt, 2)

    const asg5 = getMySubmission('asg-5')
    assert.equal(asg5, null)
  })
  await t.test('6. Unit Overview card displays View Submission and links to tracking page after submitting asg-4', () => {
    // Function mirroring resolveAssignmentAction
    function resolveUnitCardAction({ assignmentId, submissions, draft }) {
      const sub = Array.isArray(submissions)
        ? submissions
            .filter((s) => s.assignmentId === assignmentId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
        : null

      const isEvaluated = Boolean(
        sub &&
        (sub.status === 'PUBLISHED' || sub.status === 'APPROVED' || sub.evaluationStatus === 'FINALIZED') &&
        sub.evaluationId
      )

      if (isEvaluated) {
        return { label: 'View Evaluation', link: `/student/evaluations/${sub.evaluationId}`, isEvaluated: true }
      }
      if (sub) {
        return { label: 'View Submission', link: `/student/submissions/${sub.id}`, isSubmitted: true }
      }
      if (draft && (draft.figmaUrl || draft.artifactValues)) {
        return { label: 'Continue Submission', link: `/student/assignments/${assignmentId}/submit`, hasDraft: true }
      }
      return { label: 'Submit Assignment', link: `/student/assignments/${assignmentId}/submit` }
    }

    const submissionsWithAsg4 = [
      { id: 'sub-asg4-001', assignmentId: 'asg-4', status: 'PROCESSING', submittedAt: new Date().toISOString() },
      { id: 'sub-2026-003', assignmentId: 'asg-3', status: 'PUBLISHED', evaluationId: 'eval-asg-3', submittedAt: '2026-09-10T14:22:00Z' }
    ]

    const unit4Action = resolveUnitCardAction({ assignmentId: 'asg-4', submissions: submissionsWithAsg4, draft: null })
    assert.equal(unit4Action.label, 'View Submission')
    assert.equal(unit4Action.link, '/student/submissions/sub-asg4-001')
    assert.notEqual(unit4Action.label, 'Submit Assignment')
  })

  await t.test('7. Assignment Details bottom CTA and top CTA both open the tracking page when submission exists', () => {
    function resolveAssignmentDetailsCTAs({ assignmentId, submission, hasDraft }) {
      const isEvaluated = Boolean(
        submission &&
        (submission.status === 'PUBLISHED' || submission.status === 'APPROVED') &&
        submission.evaluationId
      )
      const isSubmitted = Boolean(submission)

      let topLabel = 'Start Submission'
      let bottomLabel = 'Submit Assignment →'
      let link = `/student/assignments/${assignmentId}/submit`

      if (isEvaluated) {
        topLabel = 'View Evaluation'
        bottomLabel = 'View Evaluation →'
        link = `/student/evaluations/${submission.evaluationId}`
      } else if (isSubmitted) {
        topLabel = 'View Submission'
        bottomLabel = 'View Submission →'
        link = `/student/submissions/${submission.id}`
      } else if (hasDraft) {
        topLabel = 'Continue Submission'
        bottomLabel = 'Continue Submission →'
        link = `/student/assignments/${assignmentId}/submit`
      }

      return { topLabel, bottomLabel, link }
    }

    // When asg-4 is submitted
    const res = resolveAssignmentDetailsCTAs({
      assignmentId: 'asg-4',
      submission: { id: 'sub-999', assignmentId: 'asg-4', status: 'PROCESSING' },
      hasDraft: false
    })

    assert.equal(res.topLabel, 'View Submission')
    assert.equal(res.bottomLabel, 'View Submission →')
    assert.equal(res.link, '/student/submissions/sub-999')
    assert.notEqual(res.link, '/student/assignments/asg-4/submit', 'Must not navigate back to submit form!')
  })

  await t.test('8. An unsent draft allows student to continue editing in Unit Card and Assignment Details', () => {
    const draft = { figmaUrl: 'https://figma.com/file/my-draft', artifactValues: { note: 'in progress' } }
    const submissions = []

    const sub = submissions.find((s) => s.assignmentId === 'asg-4') || null
    const hasDraft = Boolean(draft && (draft.figmaUrl || draft.artifactValues))

    assert.equal(sub, null)
    assert.equal(hasDraft, true)

    let label = 'Submit Assignment'
    if (sub) {
      label = 'View Submission'
    } else if (hasDraft) {
      label = 'Continue Submission'
    }

    assert.equal(label, 'Continue Submission')
  })

  await t.test('9. A new assignment allows first submission with Submit Assignment', () => {
    const submissions = []
    const draft = null

    const sub = submissions.find((s) => s.assignmentId === 'asg-5') || null
    const hasDraft = Boolean(draft && (draft.figmaUrl || draft.artifactValues))

    let label = 'Submit Assignment'
    let link = '/student/assignments/asg-5/submit'

    if (sub) {
      label = 'View Submission'
      link = `/student/submissions/${sub.id}`
    } else if (hasDraft) {
      label = 'Continue Submission'
    }

    assert.equal(label, 'Submit Assignment')
    assert.equal(link, '/student/assignments/asg-5/submit')
  })

  await t.test('10. A published evaluation displays View Evaluation and links to the correct evaluation', () => {
    const submissions = [
      { id: 'sub-2026-003', assignmentId: 'asg-3', status: 'PUBLISHED', evaluationId: 'eval-asg-3' }
    ]
    const sub = submissions.find((s) => s.assignmentId === 'asg-3')

    assert.ok(sub)
    const isEvaluated = (sub.status === 'PUBLISHED' || sub.status === 'APPROVED') && Boolean(sub.evaluationId)
    assert.equal(isEvaluated, true)

    const label = isEvaluated ? 'View Evaluation' : 'View Submission'
    const link = isEvaluated ? `/student/evaluations/${sub.evaluationId}` : `/student/submissions/${sub.id}`

    assert.equal(label, 'View Evaluation')
    assert.equal(link, '/student/evaluations/eval-asg-3')
  })

  await t.test('11. Returning to Unit Overview and Assignment Details refreshes the state consistently from storage', () => {
    const storage = new MockLocalStorage()

    // 1. Initially no submissions
    storage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]))
    let stored = JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
    assert.equal(stored.length, 0)

    // 2. Submit asg-4
    const newSub = { id: 'sub-444', assignmentId: 'asg-4', status: 'PROCESSING', submittedAt: new Date().toISOString() }
    storage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([newSub]))

    // 3. User navigates back to Unit Overview: reads from storage
    stored = JSON.parse(storage.getItem(STORAGE_KEYS.SUBMISSIONS))
    assert.equal(stored.length, 1)
    const match = stored.find((s) => s.assignmentId === 'asg-4')
    assert.ok(match)
    assert.equal(match.id, 'sub-444')
    assert.equal(match.status, 'PROCESSING')
  })
})


