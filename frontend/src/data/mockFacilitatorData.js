/**
 * Barabari Collective - Facilitator Mock Data
 * FE-1 Facilitator Portal Data Foundation
 */

export const mockFacilitatorUser = {
  id: 'fac-001',
  facilitatorId: 'FAC-2026-001',
  name: 'Rohan Mehta',
  email: 'rohan.mehta@barabaricollective.in',
  role: 'Lead Design Facilitator',
  cohort: 'Cohort 4 • UI/UX Product Design',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  bio: 'Product Designer & Design Mentor with 8+ years experience guiding cohorts in auto-layout, micro-interactions, and design systems.',
  stats: {
    totalEvaluated: 142,
    activeReviews: 8,
    averageTurnaroundHours: 18,
    activeCohorts: 2
  }
};

export const mockFacilitatorCourses = [
  {
    id: 'course-uiux-101',
    title: 'UI/UX Product Design',
    code: 'BC-UIUX-101',
    cohort: 'Cohort 4',
    totalUnits: 6,
    units: [
      { id: 'unit-1', unitNumber: 1, title: 'Generative User Research & Problem Discovery' },
      { id: 'unit-2', unitNumber: 2, title: 'Information Architecture & Journey Mapping' },
      { id: 'unit-3', unitNumber: 3, title: 'Visual Design Rigor & Pixel Recreation' },
      { id: 'unit-4', unitNumber: 4, title: 'Interactive Prototyping & Motion Easing' },
      { id: 'unit-5', unitNumber: 5, title: 'Design Systems & Component Libraries' },
      { id: 'unit-6', unitNumber: 6, title: 'AI Product Design & Capstone' },
    ]
  }
];

export const initialFacilitatorAssignments = [
  {
    id: 'asg-1',
    assignmentNumber: 1,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-1',
    unitTitle: 'Generative User Research & Problem Discovery',
    title: 'I Interviewed Two Users and This Surprised Me',
    phase: 'Research & Empathy',
    sprint: 'Sprint 01',
    dueDate: '2026-08-12',
    dueDateFormatted: '12 Aug 2026',
    maxScore: 20,
    status: 'CLOSED',
    totalEnrolled: 28,
    submittedCount: 28,
    pendingReviewCount: 0,
    evaluatedCount: 28,
    description: 'Conduct two qualitative user interviews exploring a real-world task friction. Synthesize unexpected findings and document key behavioral insights.',
    requirements: [
      { id: 'req-1', title: 'Interview Transcripts & Notes', description: 'Raw notes and observations from 2 independent user sessions.', required: true },
      { id: 'req-2', title: 'Synthesized Persona & Empathy Map', description: 'Structured empathy map capturing user pains, gains, and mental models.', required: true },
      { id: 'req-3', title: 'Key Surprise & Insight Summary', description: 'One surprising insight that contradicted your initial hypothesis.', required: true }
    ],
    submissionInstructions: 'Submit a public Notion document or Figma FigJam link containing your synthesized interview findings.',
    figmaGuidance: 'Organize interview notes into structured sticky groups and label each user session.'
  },
  {
    id: 'asg-2',
    assignmentNumber: 2,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    title: 'Friction Map & User Journey Diagram',
    phase: 'Information Architecture',
    sprint: 'Sprint 02',
    dueDate: '2026-08-26',
    dueDateFormatted: '26 Aug 2026',
    maxScore: 20,
    status: 'CLOSED',
    totalEnrolled: 28,
    submittedCount: 28,
    pendingReviewCount: 0,
    evaluatedCount: 28,
    description: 'Map out the complete end-to-end journey of an existing high-friction mobile workflow, highlighting emotional drop-offs and UX bottlenecks.',
    requirements: [
      { id: 'req-1', title: 'End-to-End User Journey Diagram', description: 'Visual mapping of 8+ steps from initial entry to task completion.', required: true },
      { id: 'req-2', title: 'Friction Severity Index', description: 'Categorize identified friction into High, Medium, and Low severity with rationales.', required: true },
      { id: 'req-3', title: 'Opportunity Framing (HMW Statements)', description: 'At least 3 How-Might-We statements addressing primary drop-offs.', required: true }
    ],
    submissionInstructions: 'Submit your FigJam board link with view permissions enabled.',
    figmaGuidance: 'Ensure all flow connections use FigJam connectors and stages are clearly annotated.'
  },
  {
    id: 'asg-3',
    assignmentNumber: 3,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    title: 'Recreated a Real Screen',
    phase: 'Visual Execution',
    sprint: 'Sprint 03',
    dueDate: '2026-09-11',
    dueDateFormatted: '11 Sep 2026',
    maxScore: 20,
    status: 'CLOSED',
    totalEnrolled: 28,
    submittedCount: 28,
    pendingReviewCount: 0,
    evaluatedCount: 28,
    description: 'Deconstruct and replicate a complex production app screen with 100% auto-layout fidelity, pixel-perfect type tokens, and responsive constraints.',
    requirements: [
      { id: 'req-1', title: '100% Auto-Layout Recreation Frame', description: 'Reconstructed screen using only Figma Auto-Layout without detached frames.', required: true },
      { id: 'req-2', title: 'Side-by-Side Original Screenshot Overlay', description: 'Overlay original app screenshot at 50% opacity to verify alignment.', required: true },
      { id: 'req-3', title: 'Color & Typography Token Palette', description: 'Local styles or token list extracted from the recreation.', required: true }
    ],
    submissionInstructions: 'Submit your Figma project URL. Grant view access to facilitator@barabaricollective.in.',
    figmaGuidance: 'Name your primary canvas frame [RECREATION-FINAL]. Zero fixed-width text layers allowed.'
  },
  {
    id: 'asg-4',
    assignmentNumber: 4,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-4',
    unitTitle: 'Interactive Prototyping & Motion Easing',
    title: 'One Clickable Prototype with Motion',
    phase: 'Phase 2 • Interactive Prototyping',
    sprint: 'Sprint 04',
    dueDate: '2026-09-22',
    dueDateFormatted: '22 Sep 2026',
    maxScore: 20,
    status: 'PUBLISHED',
    totalEnrolled: 28,
    submittedCount: 18,
    pendingReviewCount: 6,
    evaluatedCount: 12,
    description: 'Design and prototype a high-fidelity interactive flow with meaningful motion easing, transition logic, and realistic feedback loops in Figma.',
    requirements: [
      { id: 'req-1', title: 'Interactive Flow (5+ Frames)', description: 'A continuous clickable experience spanning 5 connected screens.', required: true },
      { id: 'req-2', title: 'Meaningful Motion & Smart-Animate', description: 'Custom easing curves (Ease Out 300ms) with purposeful transition intent.', required: true },
      { id: 'req-3', title: 'Component States & Micro-interactions', description: 'Interactive components for buttons, toggles, or bottom sheets.', required: true },
      { id: 'req-4', title: 'UX Flow Rationale & Friction Mitigation', description: 'Brief written rationale explaining how motion reduces cognitive load.', required: false }
    ],
    submissionInstructions: 'Provide the Figma prototype share link with "Anyone with link can view prototype" set.',
    figmaGuidance: 'Starting frame must be titled [START-PROTOTYPE]. Ensure starting flow link is active.'
  },
  {
    id: 'asg-5',
    assignmentNumber: 5,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-5',
    unitTitle: 'Design Systems & Component Libraries',
    title: 'Design System & Component Library',
    phase: 'Phase 3 • Design Systems',
    sprint: 'Sprint 05',
    dueDate: '2026-10-05',
    dueDateFormatted: '05 Oct 2026',
    maxScore: 20,
    status: 'PUBLISHED',
    totalEnrolled: 28,
    submittedCount: 2,
    pendingReviewCount: 2,
    evaluatedCount: 0,
    description: 'Establish reusable components, typography scale, semantic token structure, and auto-layout variants for a scalable multi-platform design system.',
    requirements: [
      { id: 'req-1', title: 'Foundational Design Tokens', description: 'Defined color variables (surface, text, brand, border) and typography scale.', required: true },
      { id: 'req-2', title: 'Atomic Components with Variants', description: 'Buttons, inputs, cards, and avatars with complete state matrices.', required: true },
      { id: 'req-3', title: 'Usage Guidelines Documentation', description: 'Do / Do Not rules for component composition and layout grids.', required: true }
    ],
    submissionInstructions: 'Submit the link to your Figma Team Library or standalone component file.',
    figmaGuidance: 'Publish components locally and demonstrate variants using Figma Component Properties.'
  },
  {
    id: 'asg-6',
    assignmentNumber: 6,
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-6',
    unitTitle: 'AI Product Design & Capstone',
    title: "AI Landing Page You'd Ship",
    phase: 'Phase 4 • Product Capstone',
    sprint: 'Sprint 06',
    dueDate: '2026-10-20',
    dueDateFormatted: '20 Oct 2026',
    maxScore: 25,
    status: 'DRAFT',
    totalEnrolled: 28,
    submittedCount: 0,
    pendingReviewCount: 0,
    evaluatedCount: 0,
    description: 'Comprehensive landing page solving an AI workflow problem with high visual polish, proof-of-concept interactions, and clear value proposition.',
    requirements: [
      { id: 'req-1', title: 'Complete Hero Section & Value Prop', description: 'Clear headline, interactive demo preview, and primary CTA.', required: true },
      { id: 'req-2', title: 'AI Feature Walkthrough Section', description: 'Step-by-step visual demonstration of the AI assistant capability.', required: true },
      { id: 'req-3', title: 'Social Proof & Trust Architecture', description: 'Security certifications, testimonial cards, and transparent pricing tier.', required: true }
    ],
    submissionInstructions: 'Submit desktop (1440px) and mobile (390px) responsive breakpoint frames in Figma.',
    figmaGuidance: 'Include responsive auto-layout frames showing container stretching behavior.'
  }
];

const STORAGE_KEY_ASSIGNMENTS = 'barabari_facilitator_assignments_v1';

/**
 * Get all facilitator assignments with persistence
 */
export const getFacilitatorAssignments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading facilitator assignments from storage:', err);
  }
  return initialFacilitatorAssignments;
};

/**
 * Save all facilitator assignments
 */
export const saveFacilitatorAssignments = (assignments) => {
  try {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
  } catch (err) {
    console.error('Error saving facilitator assignments to storage:', err);
  }
};

/**
 * Create a new assignment
 */
export const createFacilitatorAssignment = (data) => {
  const assignments = getFacilitatorAssignments();
  const nextNum = assignments.length + 1;
  const newAssignment = {
    ...data,
    id: data.id || `asg-${Date.now()}`,
    assignmentNumber: nextNum,
    sprint: data.sprint || `Sprint 0${nextNum}`,
    phase: data.phase || 'Studio Sprint',
    dueDateFormatted: data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending',
    totalEnrolled: 28,
    submittedCount: 0,
    pendingReviewCount: 0,
    evaluatedCount: 0,
    status: data.status || 'DRAFT'
  };
  const updated = [newAssignment, ...assignments];
  saveFacilitatorAssignments(updated);
  return newAssignment;
};

/**
 * Update an existing assignment
 */
export const updateFacilitatorAssignment = (id, data) => {
  const assignments = getFacilitatorAssignments();
  const index = assignments.findIndex(a => a.id === id);
  if (index === -1) return null;

  const existing = assignments[index];
  const updated = {
    ...existing,
    ...data,
    dueDateFormatted: data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : existing.dueDateFormatted
  };

  assignments[index] = updated;
  saveFacilitatorAssignments(assignments);
  return updated;
};

/**
 * Toggle status of an assignment (e.g. DRAFT <-> PUBLISHED <-> CLOSED)
 */
export const toggleAssignmentStatus = (id, nextStatus) => {
  return updateFacilitatorAssignment(id, { status: nextStatus });
};

/**
 * Delete an assignment
 */
export const deleteFacilitatorAssignment = (id) => {
  const assignments = getFacilitatorAssignments();
  const filtered = assignments.filter(a => a.id !== id);
  saveFacilitatorAssignments(filtered);
  return filtered;
};

// Re-export initial array for components using it as default
export const mockFacilitatorAssignments = initialFacilitatorAssignments;

export const mockFacilitatorMetrics = [
  { label: 'Total Assignments', value: 6, sublabel: 'Curriculum sprints', color: 'text-brand-text-primary' },
  { label: 'Active Assignments', value: 2, sublabel: 'Open for submissions', color: 'text-brand-blue' },
  { label: 'Pending Reviews', value: 8, sublabel: 'Awaiting mentor grading', color: 'text-brand-warning' },
  { label: 'Evaluated Submissions', value: 24, sublabel: 'Published outcomes', color: 'text-brand-success' },
  { label: 'Enrolled Students', value: 28, sublabel: 'Cohort 4 Studio', color: 'text-brand-text-primary' },
  { label: 'Cohort Average', value: '84.2%', sublabel: 'Overall grade trend', color: 'text-brand-blue' },
];

export const mockRecentSubmissions = [
  {
    id: 'sub-004',
    studentId: 'BC-2026-088',
    studentName: 'Ananya Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignmentId: 'asg-4',
    assignmentTitle: 'One Clickable Prototype with Motion',
    submittedAt: '20 Sep 2026, 09:45 AM',
    relativeTime: '2 hours ago',
    status: 'PENDING_REVIEW',
    figmaLink: 'https://figma.com/design/sample-ananya-sprint4',
    deliverablesCount: 4,
    hasUxArtifacts: true
  },
  {
    id: 'sub-005',
    studentId: 'BC-2026-042',
    studentName: 'Kabir Sen',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignmentId: 'asg-4',
    assignmentTitle: 'One Clickable Prototype with Motion',
    submittedAt: '20 Sep 2026, 07:15 AM',
    relativeTime: '4 hours ago',
    status: 'PENDING_REVIEW',
    figmaLink: 'https://figma.com/design/sample-kabir-sprint4',
    deliverablesCount: 3,
    hasUxArtifacts: false
  },
  {
    id: 'sub-006',
    studentId: 'BC-2026-019',
    studentName: 'Devika Nair',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    assignmentId: 'asg-4',
    assignmentTitle: 'One Clickable Prototype with Motion',
    submittedAt: '19 Sep 2026, 06:30 PM',
    relativeTime: 'Yesterday',
    status: 'IN_REVIEW',
    figmaLink: 'https://figma.com/design/sample-devika-sprint4',
    deliverablesCount: 4,
    hasUxArtifacts: true
  },
  {
    id: 'sub-003',
    studentId: 'BC-2026-088',
    studentName: 'Ananya Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen',
    submittedAt: '10 Sep 2026, 04:20 PM',
    relativeTime: 'Evaluated',
    status: 'EVALUATED',
    score: 18,
    maxScore: 20,
    figmaLink: 'https://figma.com/design/sample-ananya-sprint3',
    deliverablesCount: 4,
    hasUxArtifacts: true
  },
  {
    id: 'sub-002',
    studentId: 'BC-2026-007',
    studentName: 'Aarav Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen',
    submittedAt: '10 Sep 2026, 02:15 PM',
    relativeTime: 'Evaluated',
    status: 'EVALUATED',
    score: 19,
    maxScore: 20,
    figmaLink: 'https://figma.com/design/sample-aarav-sprint3',
    deliverablesCount: 4,
    hasUxArtifacts: true
  }
];

export const mockUpcomingMilestones = [
  {
    id: 'mile-1',
    title: 'Sprint 04 Prototype Submission Cutoff',
    course: 'Cohort 4 • UI/UX Design',
    date: '22 Sep 2026, 11:59 PM',
    type: 'DEADLINE',
    badgeVariant: 'warning'
  },
  {
    id: 'mile-2',
    title: 'Live Studio Critique & Motion Review',
    course: 'Cohort 4 Studio',
    date: '23 Sep 2026, 03:00 PM',
    type: 'STUDIO_HOURS',
    badgeVariant: 'blue'
  },
  {
    id: 'mile-3',
    title: 'Publish Sprint 05 Rubric Guidelines',
    course: 'Curriculum Ops',
    date: '28 Sep 2026, 05:00 PM',
    type: 'RUBRIC_PREVIEW',
    badgeVariant: 'neutral'
  }
];

export const mockRubricCriteriaHealth = [
  { name: 'Prototype Interaction & Logic', averageScore: 82, weight: '30%' },
  { name: 'Motion Polish & Easing', averageScore: 78, weight: '25%' },
  { name: 'Auto-Layout Rigor & Constraints', averageScore: 88, weight: '25%' },
  { name: 'Design System Documentation', averageScore: 85, weight: '20%' }
];

export const initialFacilitatorRubrics = [
  {
    id: 'rubric-asg-4',
    title: 'Prototype Motion & Interaction Evaluation Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-4',
    unitTitle: 'Interactive Prototyping & Motion Easing',
    assignmentId: 'asg-4',
    assignmentTitle: 'One Clickable Prototype with Motion',
    description: 'Assessment framework evaluating screen flow continuity, smart-animate transition easing, component states, and UX friction reduction.',
    totalMarks: 20,
    status: 'PUBLISHED',
    lastUpdated: '15 Sep 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Prototype Flow Continuity & Logic',
        description: 'Screen routing, primary action feedback, and back-stack integrity without dead-ends.',
        marks: 6,
        weight: '30%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5-6', text: 'All 5 screens navigate with seamless back-navigation, realistic state preservation, and zero dead ends.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Flow functions well with minor routing ambiguities or slightly disjointed secondary transitions.' },
          { level: 'Developing', scoreRange: '1-2', text: 'Missing links, broken back-navigation, or orphan frames.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'Meaningful Motion & Smart-Animate Easing',
        description: 'Easing curves, duration pacing (200-400ms), and purposeful transition intent.',
        marks: 5,
        weight: '25%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5', text: 'Purposeful smart-animate easing (Ease Out 300ms) that clarifies spatial relationships and reduces cognitive load.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Consistent transitions with minor pacing mismatches or default bezier curves.' },
          { level: 'Developing', scoreRange: '1-2', text: 'Distracting, overly long, or jarring instant cuts.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Component States & Micro-interactions',
        description: 'Interactive button states, form focus transitions, and toggles.',
        marks: 5,
        weight: '25%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5', text: 'All interactive controls demonstrate hover, active, pressed, and disabled states.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Primary buttons interactive; secondary controls lack micro-interaction polish.' },
          { level: 'Developing', scoreRange: '1-2', text: 'Static frames with no component-level interactivity.' }
        ]
      },
      {
        id: 'crit-4',
        name: 'UX Flow Rationale & Friction Mitigation',
        description: 'Justification of interaction architecture and user cognitive load reduction.',
        marks: 4,
        weight: '20%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '4', text: 'Insightful written rationale tying motion and interaction directly to user delight and friction mitigation.' },
          { level: 'Proficient', scoreRange: '2-3', text: 'Basic explanation provided with moderate connection to user needs.' },
          { level: 'Developing', scoreRange: '1', text: 'Superficial rationale with no mention of usability principles.' }
        ]
      }
    ]
  },
  {
    id: 'rubric-asg-3',
    title: 'Visual Design Rigor & Pixel Recreation Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen',
    description: 'Rigorous grading standard evaluating auto-layout precision, typography tokens, color fidelity, and overlay accuracy against production apps.',
    totalMarks: 20,
    status: 'PUBLISHED',
    lastUpdated: '02 Sep 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Auto-Layout Rigor & Constraints',
        description: 'Zero detached or absolute elements; dynamic resizing fidelity across responsive widths.',
        marks: 8,
        weight: '40%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '7-8', text: '100% nested Auto-Layout rigor with hug/fill constraints behaving correctly.' },
          { level: 'Proficient', scoreRange: '5-6', text: 'Auto-layout mostly applied with 1-2 minor fixed-width workarounds.' },
          { level: 'Developing', scoreRange: '1-4', text: 'Multiple absolute elements or detached groups.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'Pixel Accuracy & Overlay Fidelity',
        description: 'Alignment and visual matching against original production screenshot at 50% opacity.',
        marks: 6,
        weight: '30%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6', text: '95%+ visual match on paddings, corner radii, and elevation shadows.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Solid visual similarity with small spacing discrepancies.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Noticeable proportion distortion or misaligned assets.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Typography & Color Token Discipline',
        description: 'Correct type scale hierarchy, line-heights, letter-spacing, and hex code values.',
        marks: 6,
        weight: '30%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6', text: 'Extracted semantic styles and exact type tokens applied consistently.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Font families match with minor tracking or line-height drifts.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Unformatted text styles and inconsistent palette colors.' }
        ]
      }
    ]
  },
  {
    id: 'rubric-asg-2',
    title: 'Information Architecture & Journey Mapping Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map & User Journey Diagram',
    description: 'Evaluates the depth of user journey mapping, friction diagnosis, emotion curve realism, and opportunity framing.',
    totalMarks: 20,
    status: 'PUBLISHED',
    lastUpdated: '18 Aug 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Journey Step Comprehensiveness',
        description: 'Granular breakdown of user actions across full flow.',
        marks: 7,
        weight: '35%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6-7', text: 'Covers 8+ realistic steps with touchpoints, thoughts, and user emotions.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Covers main happy path with light edge case coverage.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Shallow 3-4 step overview missing key interaction steps.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'Friction Severity & Evidence',
        description: 'Clear categorization of friction with objective rationale.',
        marks: 7,
        weight: '35%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6-7', text: 'Deep diagnosis of drop-offs categorized by cognitive and physical friction.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Identified friction is relevant but lacks root-cause explanation.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Vague complaints without actionable friction mapping.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Opportunity Framing (HMW Statements)',
        description: 'Actionable How-Might-We statements addressing identified drop-offs.',
        marks: 6,
        weight: '30%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5-6', text: 'Inspiring, generative HMW statements directly actionable for design.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Solves the issue but frames statements somewhat narrowly.' },
          { level: 'Developing', scoreRange: '1-2', text: 'Overly generic or prescriptive statements.' }
        ]
      }
    ]
  },
  {
    id: 'rubric-asg-1',
    title: 'Generative User Research & Empathy Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-1',
    unitTitle: 'Generative User Research & Problem Discovery',
    assignmentId: 'asg-1',
    assignmentTitle: 'I Interviewed Two Users and This Surprised Me',
    description: 'Evaluation criteria assessing qualitative interview depth, synthesis rigor, empathy mapping, and counter-intuitive insights.',
    totalMarks: 20,
    status: 'PUBLISHED',
    lastUpdated: '04 Aug 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Interview Quality & Raw Notes',
        description: 'Authentic dialogue documentation from 2 distinct users.',
        marks: 7,
        weight: '35%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6-7', text: 'Extensive verbatim quotes and observed behaviors from 2 complete sessions.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Adequate notes covering core interview prompt questions.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Sparse notes or leading interview questions.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'Empathy Map Synthesis',
        description: 'Structured mapping of user says, does, thinks, and feels.',
        marks: 7,
        weight: '35%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6-7', text: 'Thoughtful empathy map revealing underlying mental models.' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Standard empathy map populated correctly.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Superficial bullet points repeating obvious feedback.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Counter-Intuitive Insight Framing',
        description: 'Articulation of surprising insight challenging the designer hypothesis.',
        marks: 6,
        weight: '30%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5-6', text: 'Compelling revelation that significantly reshapes problem definition.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Valid insight identified, though mildly predictable.' },
          { level: 'Developing', scoreRange: '1-2', text: 'No surprising takeaway identified.' }
        ]
      }
    ]
  },
  {
    id: 'rubric-asg-5',
    title: 'Design System Token Structure & Variants Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-5',
    unitTitle: 'Design Systems & Component Libraries',
    assignmentId: 'asg-5',
    assignmentTitle: 'Design System & Component Library',
    description: 'Measures design token semantic naming, component state completeness, Auto-Layout modularity, and usage documentation.',
    totalMarks: 20,
    status: 'PUBLISHED',
    lastUpdated: '18 Sep 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Semantic Token Architecture',
        description: 'Scalable color and typography token naming conventions.',
        marks: 7,
        weight: '35%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '6-7', text: 'Clear multi-tier token hierarchy (Global -> Alias -> Component).' },
          { level: 'Proficient', scoreRange: '4-5', text: 'Well-structured styles with occasional raw hex references.' },
          { level: 'Developing', scoreRange: '1-3', text: 'Flat color palette without semantic abstraction.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'Component State Variants & Modularity',
        description: 'Button and form control variant matrices.',
        marks: 8,
        weight: '40%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '7-8', text: 'Robust Figma Component Properties with full boolean/instance swap options.' },
          { level: 'Proficient', scoreRange: '5-6', text: 'Clean variants covering primary and secondary interaction states.' },
          { level: 'Developing', scoreRange: '1-4', text: 'Detached components or incomplete variant sets.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Usage Guidelines Documentation',
        description: 'Do/Don\'t specifications for system consumers.',
        marks: 5,
        weight: '25%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '5', text: 'Thorough component documentation explaining anatomy and spacing.' },
          { level: 'Proficient', scoreRange: '3-4', text: 'Helpful basic instructions provided beside components.' },
          { level: 'Developing', scoreRange: '1-2', text: 'Minimal or absent guidelines.' }
        ]
      }
    ]
  },
  {
    id: 'rubric-asg-6',
    title: 'AI Product Capstone & Landing Page Rubric',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-6',
    unitTitle: 'AI Product Design & Capstone',
    assignmentId: 'asg-6',
    assignmentTitle: "AI Landing Page You'd Ship",
    description: 'Holistic grading rubric evaluating high-conversion visual design, AI product value messaging, responsive auto-layout, and interaction polish.',
    totalMarks: 25,
    status: 'DRAFT',
    lastUpdated: '19 Sep 2026',
    criteria: [
      {
        id: 'crit-1',
        name: 'Value Proposition & Visual Hierarchy',
        description: 'Hero clarity, compelling copywriting, and visual focal points.',
        marks: 8,
        weight: '32%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '7-8', text: 'Stunning visual hierarchy with instant value proposition clarity.' },
          { level: 'Proficient', scoreRange: '5-6', text: 'Clean structure with readable typography and clear primary CTA.' },
          { level: 'Developing', scoreRange: '1-4', text: 'Cluttered hero or confusing product premise.' }
        ]
      },
      {
        id: 'crit-2',
        name: 'AI Feature Walkthrough & Polish',
        description: 'Interactive demonstration of the AI assistant experience.',
        marks: 9,
        weight: '36%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '8-9', text: 'Novel, intuitive presentation of AI capabilities with micro-animations.' },
          { level: 'Proficient', scoreRange: '6-7', text: 'Clear feature breakdown using standard modern card patterns.' },
          { level: 'Developing', scoreRange: '1-5', text: 'Generic stock imagery with vague feature descriptions.' }
        ]
      },
      {
        id: 'crit-3',
        name: 'Responsive Breakpoints & Trust Architecture',
        description: 'Desktop (1440px) and Mobile (390px) adaptation and social proof.',
        marks: 8,
        weight: '32%',
        descriptors: [
          { level: 'Exemplary', scoreRange: '7-8', text: 'Flawless responsive auto-layout across mobile and desktop breakpoints.' },
          { level: 'Proficient', scoreRange: '5-6', text: 'Mobile version provided with minor spacing scaling hiccups.' },
          { level: 'Developing', scoreRange: '1-4', text: 'Missing mobile layout or non-responsive fixed artboards.' }
        ]
      }
    ]
  }
];

const STORAGE_KEY_RUBRICS = 'barabari_facilitator_rubrics_v1';

/**
 * Get all facilitator rubrics with persistence
 */
export const getFacilitatorRubrics = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RUBRICS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading facilitator rubrics from storage:', err);
  }
  return initialFacilitatorRubrics;
};

/**
 * Save all facilitator rubrics
 */
export const saveFacilitatorRubrics = (rubrics) => {
  try {
    localStorage.setItem(STORAGE_KEY_RUBRICS, JSON.stringify(rubrics));
  } catch (err) {
    console.error('Error saving facilitator rubrics to storage:', err);
  }
};

/**
 * Create a new rubric
 */
export const createFacilitatorRubric = (data) => {
  const rubrics = getFacilitatorRubrics();
  const newRubric = {
    ...data,
    id: data.id || `rubric-${Date.now()}`,
    status: data.status || 'DRAFT',
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };
  const updated = [newRubric, ...rubrics];
  saveFacilitatorRubrics(updated);
  return newRubric;
};

/**
 * Update an existing rubric
 */
export const updateFacilitatorRubric = (id, data) => {
  const rubrics = getFacilitatorRubrics();
  const index = rubrics.findIndex(r => r.id === id);
  if (index === -1) return null;

  const existing = rubrics[index];
  const updated = {
    ...existing,
    ...data,
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  rubrics[index] = updated;
  saveFacilitatorRubrics(rubrics);
  return updated;
};

/**
 * Toggle rubric status (DRAFT <-> PUBLISHED)
 */
export const toggleRubricStatus = (id, nextStatus) => {
  return updateFacilitatorRubric(id, { status: nextStatus });
};

/**
 * Delete a rubric
 */
export const deleteFacilitatorRubric = (id) => {
  const rubrics = getFacilitatorRubrics();
  const filtered = rubrics.filter(r => r.id !== id);
  saveFacilitatorRubrics(filtered);
  return filtered;
};

// =========================================================================
// FACILITATOR SUBMISSIONS & EVALUATIONS MOCK DATA & STORAGE
// =========================================================================

export const initialFacilitatorSubmissions = [
  {
    id: 'sub-fac-001',
    studentId: 'stu-001',
    studentName: 'Ananya Sharma',
    studentEmail: 'ananya.s@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-4',
    assignmentTitle: 'Figma Prototype: 3 Micro-interactions',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Interactive Prototyping & Motion Easing',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-17T15:45:00Z',
    submittedAtFormatted: '17 Sep 2026, 03:45 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'IN_REVIEW',
    score: null,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: null,
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Focus on the swipe-to-archive interaction on Screen 3. I spent extra time fine-tuning the cubic bezier curve to match iOS system haptics.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Public Figma Prototype Link',
        type: 'figma',
        url: 'https://www.figma.com/proto/bc-micro-interactions-ananya',
        isSubmitted: true,
        submittedAt: '17 Sep 2026, 03:40 PM'
      },
      {
        id: 'del-2',
        name: 'Interactive Flow Rationale',
        type: 'file',
        url: 'https://barabari.internal/docs/ananya-flow-rationale.pdf',
        contentPreview: 'Smart-animate ease-out on bottom sheet navigation; spring physics on card swipe delete to reduce perceived latency.',
        isSubmitted: true,
        submittedAt: '17 Sep 2026, 03:42 PM'
      },
      {
        id: 'del-3',
        name: 'FigJam Architecture Board',
        type: 'figjam',
        url: 'https://www.figma.com/board/bc-figjam-ananya',
        isSubmitted: true,
        submittedAt: '17 Sep 2026, 03:44 PM'
      },
      {
        id: 'del-4',
        name: 'Screen Recording Demo (MP4)',
        type: 'video',
        url: '',
        isSubmitted: false,
        submittedAt: null
      }
    ],
    evaluation: {
      status: 'IN_REVIEW',
      criterionScores: {
        'crit-1': 5,
        'crit-2': 5,
        'crit-3': 4,
        'crit-4': 3
      },
      criterionFeedback: {
        'crit-1': 'Transitions feel natural and responsive across all 5 screens with consistent navigation.',
        'crit-2': 'Ease-out curve on bottom sheet feels authentic to native mobile guidelines.',
        'crit-3': 'Good active and hover states. Remember to test disabled states on empty input.',
        'crit-4': 'Clear written explanation connecting motion to friction mitigation.'
      },
      generalFeedback: 'High quality prototyping work. Clean auto-layout integration with smart animate transitions.',
      strengths: 'Physics-based micro-interactions and rigorous Figma component auto-layout hygiene.',
      growthAreas: 'Include complete video walk-through and explicit disabled states.',
      totalScore: 17,
      draftSavedAt: '18 Sep 2026, 11:20 AM'
    }
  },
  {
    id: 'sub-fac-002',
    studentId: 'stu-002',
    studentName: 'Vikram Malhotra',
    studentEmail: 'vikram.m@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-4',
    assignmentTitle: 'Figma Prototype: 3 Micro-interactions',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Interactive Prototyping & Motion Easing',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-16T09:12:00Z',
    submittedAtFormatted: '16 Sep 2026, 09:12 AM',
    status: 'SUBMITTED',
    evaluationStatus: 'PENDING_REVIEW',
    score: null,
    maxScore: 20,
    reviewer: null,
    evaluatedAt: null,
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Created an onboarding slider with parallax image easing and interactive button states.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Public Figma Prototype Link',
        type: 'figma',
        url: 'https://www.figma.com/proto/bc-prototype-vikram-flow',
        isSubmitted: true,
        submittedAt: '16 Sep 2026, 09:10 AM'
      },
      {
        id: 'del-2',
        name: 'Interactive Flow Rationale',
        type: 'file',
        url: 'https://barabari.internal/docs/vikram-flow.pdf',
        contentPreview: 'Documented 3 state changes with cubic-bezier easing parameters.',
        isSubmitted: true,
        submittedAt: '16 Sep 2026, 09:11 AM'
      },
      {
        id: 'del-3',
        name: 'FigJam Architecture Board',
        type: 'figjam',
        url: 'https://www.figma.com/board/bc-flow-vikram',
        isSubmitted: true,
        submittedAt: '16 Sep 2026, 09:12 AM'
      }
    ],
    evaluation: {
      status: 'NOT_STARTED',
      criterionScores: {},
      criterionFeedback: {},
      generalFeedback: '',
      strengths: '',
      growthAreas: '',
      totalScore: 0,
      draftSavedAt: null
    }
  },
  {
    id: 'sub-fac-003',
    studentId: 'stu-003',
    studentName: 'Priya Nair',
    studentEmail: 'priya.n@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-08T18:15:00Z',
    submittedAtFormatted: '08 Sep 2026, 06:15 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'EVALUATED',
    score: 18,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: '10 Sep 2026, 04:30 PM',
    hasReEvaluationRequest: true,
    reEvaluationStatus: 'PENDING_FACILITATOR_REVIEW',
    reEvaluationNote: 'Student requested review on Criterion 1 (Auto-Layout Rigor). Notes: "I updated the nested container constraints which were previously flagged as fixed width."',
    studentNotes: 'Recreated the Linear mobile task detail view. Enforced strict 8pt grid tokens.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Figma Screen Recreation File',
        type: 'figma',
        url: 'https://www.figma.com/file/priya-screen-recreation-linear',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:10 PM'
      },
      {
        id: 'del-2',
        name: 'Side-by-Side Comparison Overlay',
        type: 'file',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        contentPreview: '98% overlay alignment against production Linear screen.',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:12 PM'
      },
      {
        id: 'del-3',
        name: 'Auto-Layout & Typography Tokens Notes',
        type: 'file',
        url: 'https://barabari.internal/docs/priya-tokens.pdf',
        contentPreview: 'Detailed documentation of vertical scale and border-radius tokens.',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:14 PM'
      }
    ],
    evaluation: {
      status: 'EVALUATED',
      criterionScores: {
        'crit-1': 7,
        'crit-2': 6,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Excellent nested auto-layout with dynamic resizing behavior across viewports.',
        'crit-2': 'Outstanding pixel alignment and 50% opacity overlay match.',
        'crit-3': 'Typography tokens and font weights cleanly match the source app.'
      },
      generalFeedback: 'Exemplary pixel recreation. Outstanding spatial grid alignment and clean Figma layer hygiene.',
      strengths: 'Layer naming discipline, typography tokens, auto-layout responsiveness.',
      growthAreas: 'Double check tag badge line-height on smaller screen widths.',
      totalScore: 18,
      evaluatedAt: '10 Sep 2026, 04:30 PM'
    }
  },
  {
    id: 'sub-fac-004',
    studentId: 'stu-004',
    studentName: 'Arjun Patel',
    studentEmail: 'arjun.p@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-4',
    assignmentTitle: 'Figma Prototype: 3 Micro-interactions',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Interactive Prototyping & Motion Easing',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-17T23:10:00Z',
    submittedAtFormatted: '17 Sep 2026, 11:10 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'RETURNED',
    score: null,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: '18 Sep 2026, 09:40 AM',
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Attached Figma link for interactive interactions.',
    returnReason: 'Figma file permissions restricted to private invitees. Please adjust link sharing to "Anyone with link can view" and include the required interactive flow rationale document.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Public Figma Prototype Link',
        type: 'figma',
        url: 'https://www.figma.com/proto/arjun-restricted-prototype',
        isSubmitted: true,
        submittedAt: '17 Sep 2026, 11:05 PM'
      },
      {
        id: 'del-2',
        name: 'Interactive Flow Rationale',
        type: 'file',
        url: '',
        isSubmitted: false,
        submittedAt: null
      }
    ],
    evaluation: {
      status: 'RETURNED',
      criterionScores: {},
      criterionFeedback: {},
      generalFeedback: 'Figma prototype link is locked with private permissions and required flow rationale is missing. Please resolve permissions and resubmit.',
      strengths: '',
      growthAreas: 'Ensure public share link is enabled before resubmitting.',
      totalScore: 0,
      draftSavedAt: null
    }
  },
  {
    id: 'sub-fac-005',
    studentId: 'stu-005',
    studentName: 'Sneha Rao',
    studentEmail: 'sneha.r@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map & User Journey Diagram',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-08-18T13:20:00Z',
    submittedAtFormatted: '18 Aug 2026, 01:20 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'EVALUATED',
    score: 19,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: '20 Aug 2026, 05:10 PM',
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Analyzed food delivery checkout drop-off across 9 distinct user actions.',
    deliverables: [
      {
        id: 'del-1',
        name: 'FigJam Journey & Friction Diagram',
        type: 'figjam',
        url: 'https://www.figma.com/board/sneha-dropoff-map',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:15 PM'
      },
      {
        id: 'del-2',
        name: 'Friction Audit Synthesis Document',
        type: 'file',
        url: 'https://barabari.internal/docs/sneha-friction-audit.pdf',
        contentPreview: 'Deep categorization of physical and cognitive friction points.',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:18 PM'
      },
      {
        id: 'del-3',
        name: 'How-Might-We Generative Statements Deck',
        type: 'file',
        url: 'https://barabari.internal/docs/sneha-hmw-deck.pdf',
        contentPreview: 'Generative HMW statements directly actionable for wireframing.',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:19 PM'
      }
    ],
    evaluation: {
      status: 'EVALUATED',
      criterionScores: {
        'crit-1': 7,
        'crit-2': 6,
        'crit-3': 6
      },
      criterionFeedback: {
        'crit-1': 'Exceptional granular breakdown of 9 distinct user actions with clear emotional curves.',
        'crit-2': 'Root-cause analysis clearly identifies payment method selection ambiguity.',
        'crit-3': 'HMW statements are expansive and inspire novel solutions.'
      },
      generalFeedback: 'Top-tier analysis. The synthesis demonstrates sharp human observation of real user hesitation.',
      strengths: 'Analytical depth, clear diagrammatic storytelling, actionable opportunity framing.',
      growthAreas: 'Consider adding quantitative drop-off benchmarks in future discovery work.',
      totalScore: 19,
      evaluatedAt: '20 Aug 2026, 05:10 PM'
    }
  },
  {
    id: 'sub-fac-006',
    studentId: 'stu-006',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.v@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-4',
    assignmentTitle: 'Figma Prototype: 3 Micro-interactions',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Interactive Prototyping & Motion Easing',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-18T08:30:00Z',
    submittedAtFormatted: '18 Sep 2026, 08:30 AM',
    status: 'SUBMITTED',
    evaluationStatus: 'PENDING_REVIEW',
    score: null,
    maxScore: 20,
    reviewer: null,
    evaluatedAt: null,
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Modeled financial transaction confirmation with biometric trigger and particle burst.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Public Figma Prototype Link',
        type: 'figma',
        url: 'https://www.figma.com/proto/rahul-fintech-microinteractions',
        isSubmitted: true,
        submittedAt: '18 Sep 2026, 08:25 AM'
      },
      {
        id: 'del-2',
        name: 'Interactive Flow Rationale',
        type: 'file',
        url: 'https://barabari.internal/docs/rahul-rationale.pdf',
        contentPreview: 'Exploration of haptic confirmation and reassuring success states.',
        isSubmitted: true,
        submittedAt: '18 Sep 2026, 08:28 AM'
      },
      {
        id: 'del-3',
        name: 'FigJam Architecture Board',
        type: 'figjam',
        url: '',
        isSubmitted: false,
        submittedAt: null
      }
    ],
    evaluation: {
      status: 'NOT_STARTED',
      criterionScores: {},
      criterionFeedback: {},
      generalFeedback: '',
      strengths: '',
      growthAreas: '',
      totalScore: 0,
      draftSavedAt: null
    }
  },
  {
    id: 'sub-fac-007',
    studentId: 'stu-007',
    studentName: 'Meera Iyer',
    studentEmail: 'meera.i@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-1',
    assignmentTitle: 'I Interviewed Two Users and This Surprised Me',
    unitId: 'unit-1',
    unitTitle: 'Generative User Research & Problem Discovery',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-08-11T16:00:00Z',
    submittedAtFormatted: '11 Aug 2026, 04:00 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'EVALUATED',
    score: 17,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: '13 Aug 2026, 02:15 PM',
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Interviews focused on first-time budget app setup anxiety.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Verbatim Interview Transcripts',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-interviews.pdf',
        contentPreview: 'Comprehensive transcripts from 2 complete 30-minute user sessions.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:50 PM'
      },
      {
        id: 'del-2',
        name: 'Empathy Map Grid',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-empathy.pdf',
        contentPreview: 'Says, Does, Thinks, and Feels synthesis.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:55 PM'
      },
      {
        id: 'del-3',
        name: 'Counter-Intuitive Insight Deck',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-insight.pdf',
        contentPreview: 'Key surprise: Users avoided automated categorization due to lack of control.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:58 PM'
      }
    ],
    evaluation: {
      status: 'EVALUATED',
      criterionScores: {
        'crit-1': 6,
        'crit-2': 6,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Raw interview quotes capture authentic hesitation and language.',
        'crit-2': 'Empathy map effectively highlights unspoken mental friction.',
        'crit-3': 'Surprising insight is well-reasoned and grounded in interview evidence.'
      },
      generalFeedback: 'Solid generative research foundation. Well-conducted interviews with compelling behavioral observations.',
      strengths: 'Active listening rigor, authentic dialogue capture, clear empathy mapping.',
      growthAreas: 'Push deeper into probing on why automated features trigger anxiety.',
      totalScore: 17,
      evaluatedAt: '13 Aug 2026, 02:15 PM'
    }
  },
  {
    id: 'sub-fac-008',
    studentId: 'stu-008',
    studentName: 'Karan Johar',
    studentEmail: 'karan.j@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-5',
    assignmentTitle: 'Design System & Component Library',
    unitId: 'unit-5',
    unitTitle: 'Design Systems & Component Libraries',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAt: '2026-09-19T19:15:00Z',
    submittedAtFormatted: '19 Sep 2026, 07:15 PM',
    status: 'SUBMITTED',
    evaluationStatus: 'IN_REVIEW',
    score: null,
    maxScore: 20,
    reviewer: 'Rohan Mehta',
    evaluatedAt: null,
    hasReEvaluationRequest: false,
    reEvaluationNote: null,
    studentNotes: 'Implemented token naming following W3C design tokens standard.',
    deliverables: [
      {
        id: 'del-1',
        name: 'Figma Component Library Link',
        type: 'figma',
        url: 'https://www.figma.com/file/karan-tokens-system',
        isSubmitted: true,
        submittedAt: '19 Sep 2026, 07:10 PM'
      },
      {
        id: 'del-2',
        name: 'Variant State Matrix Canvas',
        type: 'file',
        url: 'https://barabari.internal/docs/karan-variants.pdf',
        contentPreview: 'Buttons, Inputs, Checkboxes across default, hover, focus, disabled states.',
        isSubmitted: true,
        submittedAt: '19 Sep 2026, 07:12 PM'
      },
      {
        id: 'del-3',
        name: 'Usage Guidelines Frame',
        type: 'file',
        url: 'https://barabari.internal/docs/karan-guidelines.pdf',
        contentPreview: 'Do/Don\'t specifications with spacing rules.',
        isSubmitted: true,
        submittedAt: '19 Sep 2026, 07:14 PM'
      }
    ],
    evaluation: {
      status: 'IN_REVIEW',
      criterionScores: {
        'crit-1': 6,
        'crit-2': 7,
        'crit-3': 4
      },
      criterionFeedback: {
        'crit-1': 'Good semantic tokens structure separating global and alias layers.',
        'crit-2': 'Extensive component state variants using Figma Component Properties.',
        'crit-3': 'Helpful guidelines frame with clear visual dos and donts.'
      },
      generalFeedback: 'Very strong design system execution with high attention to component properties.',
      strengths: 'Variant completeness, semantic naming clarity.',
      growthAreas: 'Add dark mode token aliases to test token swap capabilities.',
      totalScore: 17,
      draftSavedAt: '19 Sep 2026, 10:15 PM'
    }
  }
];

const STORAGE_KEY_SUBMISSIONS = 'barabari_facilitator_submissions_v1';

/**
 * Get all facilitator submissions with persistence
 */
export const getFacilitatorSubmissions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading facilitator submissions from storage:', err);
  }
  return initialFacilitatorSubmissions;
};

/**
 * Save all facilitator submissions
 */
export const saveFacilitatorSubmissions = (submissions) => {
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  } catch (err) {
    console.error('Error saving facilitator submissions to storage:', err);
  }
};

/**
 * Get a single submission by ID
 */
export const getFacilitatorSubmissionById = (id) => {
  const submissions = getFacilitatorSubmissions();
  return submissions.find(s => s.id === id) || null;
};

/**
 * Save an evaluation draft
 */
export const saveEvaluationDraft = (submissionId, draftData) => {
  const submissions = getFacilitatorSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) return null;

  const current = submissions[index];
  const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
    ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updatedEvaluation = {
    ...(current.evaluation || {}),
    ...draftData,
    status: 'IN_REVIEW',
    draftSavedAt: nowFormatted
  };

  const updatedSubmission = {
    ...current,
    evaluationStatus: 'IN_REVIEW',
    reviewer: 'Rohan Mehta',
    evaluation: updatedEvaluation
  };

  submissions[index] = updatedSubmission;
  saveFacilitatorSubmissions(submissions);
  return updatedSubmission;
};

/**
 * Finalize an evaluation
 */
export const finalizeEvaluation = (submissionId, evaluationData) => {
  const submissions = getFacilitatorSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) return null;

  const current = submissions[index];
  const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
    ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const finalScore = evaluationData.score !== undefined 
    ? evaluationData.score 
    : (evaluationData.totalScore !== undefined ? evaluationData.totalScore : (current.score || 0));
  const maxScore = evaluationData.maxScore || current.maxScore || 20;

  const updatedEvaluation = {
    ...(current.evaluation || {}),
    ...evaluationData,
    score: finalScore,
    totalScore: finalScore,
    maxScore: maxScore,
    status: 'EVALUATED',
    evaluatedAt: nowFormatted
  };

  const updatedSubmission = {
    ...current,
    evaluationStatus: 'EVALUATED',
    score: finalScore,
    maxScore: maxScore,
    reviewer: 'Rohan Mehta',
    evaluatedAt: nowFormatted,
    evaluation: updatedEvaluation
  };

  submissions[index] = updatedSubmission;
  saveFacilitatorSubmissions(submissions);

  // Cross-module sync: Also record into evaluations storage
  try {
    const allEvaluations = getFacilitatorEvaluations();
    const evalIndex = allEvaluations.findIndex(e => e.submissionId === submissionId);
    const evalRecord = {
      id: evalIndex !== -1 ? allEvaluations[evalIndex].id : `eval-fac-${Date.now()}`,
      submissionId: current.id,
      studentId: current.studentId,
      studentName: current.studentName,
      studentEmail: current.studentEmail,
      studentAvatar: current.studentAvatar,
      studentCohort: current.studentCohort,
      assignmentId: current.assignmentId,
      assignmentTitle: current.assignmentTitle,
      unitId: current.unitId,
      unitTitle: current.unitTitle,
      courseId: current.courseId,
      courseTitle: current.courseTitle,
      score: finalScore,
      maxScore: maxScore,
      percentage: Math.round((finalScore / maxScore) * 100),
      evaluationDate: nowFormatted,
      reviewer: 'Rohan Mehta',
      status: 'FINALIZED',
      versions: [
        {
          versionNumber: 1,
          versionLabel: 'Version 1 (Finalized)',
          evaluatedAt: nowFormatted,
          evaluatedBy: 'Rohan Mehta',
          score: finalScore,
          maxScore: maxScore,
          percentage: Math.round((finalScore / maxScore) * 100),
          criterionScores: evaluationData.criterionScores || {},
          criterionFeedback: evaluationData.criterionFeedback || {},
          strengths: evaluationData.strengths || '',
          growthAreas: evaluationData.growthAreas || '',
          generalFeedback: evaluationData.generalFeedback || ''
        }
      ],
      currentEvaluation: {
        criterionScores: evaluationData.criterionScores || {},
        criterionFeedback: evaluationData.criterionFeedback || {},
        strengths: evaluationData.strengths || '',
        growthAreas: evaluationData.growthAreas || '',
        generalFeedback: evaluationData.generalFeedback || ''
      },
      deliverables: current.deliverables || []
    };

    if (evalIndex !== -1) {
      allEvaluations[evalIndex] = evalRecord;
    } else {
      allEvaluations.unshift(evalRecord);
    }
    saveFacilitatorEvaluations(allEvaluations);
  } catch (err) {
    console.error('Error syncing evaluation record:', err);
  }

  return updatedSubmission;
};

/**
 * Return a submission for revision
 */
export const returnSubmissionForRevision = (submissionId, reason) => {
  const submissions = getFacilitatorSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) return null;

  const current = submissions[index];
  const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
    ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updatedSubmission = {
    ...current,
    evaluationStatus: 'RETURNED',
    returnReason: reason,
    reviewer: 'Rohan Mehta',
    evaluatedAt: nowFormatted,
    score: null,
    evaluation: {
      ...(current.evaluation || {}),
      status: 'RETURNED',
      generalFeedback: reason,
      evaluatedAt: nowFormatted
    }
  };

  submissions[index] = updatedSubmission;
  saveFacilitatorSubmissions(submissions);
  return updatedSubmission;
};

// =========================================================================
// FACILITATOR EVALUATION AUDIT & RE-EVALUATION DATA & STORAGE
// =========================================================================

export const initialFacilitatorEvaluations = [
  {
    id: 'eval-fac-001',
    submissionId: 'sub-fac-003',
    studentId: 'stu-003',
    studentName: 'Priya Nair',
    studentEmail: 'priya.n@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAtFormatted: '08 Sep 2026, 06:15 PM',
    evaluationDate: '10 Sep 2026, 04:30 PM',
    evaluatedAt: '2026-09-10T16:30:00Z',
    score: 18,
    maxScore: 20,
    percentage: 90,
    status: 'RE_EVALUATION_REQUESTED',
    reviewer: 'Rohan Mehta',
    reviewerRole: 'Lead Design Facilitator',
    reEvaluation: {
      isRequested: true,
      status: 'REQUESTED',
      requestedAt: '12 Sep 2026, 11:20 AM',
      reason: 'I refined the nested auto-layout constraints in the Linear issue header that were originally docked as fixed width. I also added explicit min/max width tokens and verified fluid resizing behavior.',
      requestedCriteria: ['crit-1'],
      facilitatorNotes: '',
      declineReason: null,
      resolvedAt: null,
      resolutionNotes: null
    },
    versions: [
      {
        versionNumber: 1,
        title: 'Original Finalized Evaluation',
        score: 18,
        maxScore: 20,
        percentage: 90,
        evaluatedAt: '10 Sep 2026, 04:30 PM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 7,
          'crit-2': 6,
          'crit-3': 5
        },
        criterionFeedback: {
          'crit-1': 'Strong nested auto-layout, but header container uses a fixed width instead of fill-container.',
          'crit-2': 'Outstanding pixel alignment and 98% overlay match against production Linear app.',
          'crit-3': 'Typography tokens and font weights adhere strictly to 4px baseline rhythm.'
        },
        strengths: 'Layer naming discipline, typography tokens, auto-layout responsiveness.',
        growthAreas: 'Double check tag badge line-height on smaller screen widths.',
        generalFeedback: 'Exemplary pixel recreation. Outstanding spatial grid alignment and clean Figma layer hygiene.'
      }
    ],
    currentEvaluation: {
      criterionScores: {
        'crit-1': 7,
        'crit-2': 6,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Strong nested auto-layout, but header container uses a fixed width instead of fill-container.',
        'crit-2': 'Outstanding pixel alignment and 98% overlay match against production Linear app.',
        'crit-3': 'Typography tokens and font weights adhere strictly to 4px baseline rhythm.'
      },
      strengths: 'Layer naming discipline, typography tokens, auto-layout responsiveness.',
      growthAreas: 'Double check tag badge line-height on smaller screen widths.',
      generalFeedback: 'Exemplary pixel recreation. Outstanding spatial grid alignment and clean Figma layer hygiene.'
    },
    deliverables: [
      {
        id: 'del-1',
        name: 'Figma Screen Recreation File',
        type: 'figma',
        url: 'https://www.figma.com/file/priya-screen-recreation-linear',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:10 PM'
      },
      {
        id: 'del-2',
        name: 'Side-by-Side Comparison Overlay',
        type: 'file',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        contentPreview: '98% overlay alignment against production Linear screen.',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:12 PM'
      },
      {
        id: 'del-3',
        name: 'Auto-Layout & Typography Tokens Notes',
        type: 'file',
        url: 'https://barabari.internal/docs/priya-tokens.pdf',
        contentPreview: 'Detailed documentation of vertical scale and border-radius tokens.',
        isSubmitted: true,
        submittedAt: '08 Sep 2026, 06:14 PM'
      }
    ]
  },
  {
    id: 'eval-fac-002',
    submissionId: 'sub-fac-005',
    studentId: 'stu-005',
    studentName: 'Sneha Rao',
    studentEmail: 'sneha.r@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map & User Journey Diagram',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAtFormatted: '18 Aug 2026, 01:20 PM',
    evaluationDate: '20 Aug 2026, 05:10 PM',
    evaluatedAt: '2026-08-20T17:10:00Z',
    score: 19,
    maxScore: 20,
    percentage: 95,
    status: 'FINALIZED',
    reviewer: 'Rohan Mehta',
    reviewerRole: 'Lead Design Facilitator',
    reEvaluation: {
      isRequested: false,
      status: 'NONE',
      requestedAt: null,
      reason: null
    },
    versions: [
      {
        versionNumber: 1,
        title: 'Finalized Evaluation',
        score: 19,
        maxScore: 20,
        percentage: 95,
        evaluatedAt: '20 Aug 2026, 05:10 PM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 7,
          'crit-2': 6,
          'crit-3': 6
        },
        criterionFeedback: {
          'crit-1': 'Exceptional granular breakdown of 9 distinct user actions with clear emotional curves.',
          'crit-2': 'Root-cause analysis clearly identifies payment method selection ambiguity.',
          'crit-3': 'HMW statements are expansive and inspire novel solutions.'
        },
        strengths: 'Analytical depth, clear diagrammatic storytelling, actionable opportunity framing.',
        growthAreas: 'Consider adding quantitative drop-off benchmarks in future discovery work.',
        generalFeedback: 'Top-tier analysis. The synthesis demonstrates sharp human observation of real user hesitation.'
      }
    ],
    currentEvaluation: {
      criterionScores: {
        'crit-1': 7,
        'crit-2': 6,
        'crit-3': 6
      },
      criterionFeedback: {
        'crit-1': 'Exceptional granular breakdown of 9 distinct user actions with clear emotional curves.',
        'crit-2': 'Root-cause analysis clearly identifies payment method selection ambiguity.',
        'crit-3': 'HMW statements are expansive and inspire novel solutions.'
      },
      strengths: 'Analytical depth, clear diagrammatic storytelling, actionable opportunity framing.',
      growthAreas: 'Consider adding quantitative drop-off benchmarks in future discovery work.',
      generalFeedback: 'Top-tier analysis. The synthesis demonstrates sharp human observation of real user hesitation.'
    },
    deliverables: [
      {
        id: 'del-1',
        name: 'FigJam Journey & Friction Diagram',
        type: 'figjam',
        url: 'https://www.figma.com/board/sneha-dropoff-map',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:15 PM'
      },
      {
        id: 'del-2',
        name: 'Friction Audit Synthesis Document',
        type: 'file',
        url: 'https://barabari.internal/docs/sneha-friction-audit.pdf',
        contentPreview: 'Deep categorization of physical and cognitive friction points.',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:18 PM'
      },
      {
        id: 'del-3',
        name: 'How-Might-We Generative Statements Deck',
        type: 'file',
        url: 'https://barabari.internal/docs/sneha-hmw-deck.pdf',
        contentPreview: 'Generative HMW statements directly actionable for wireframing.',
        isSubmitted: true,
        submittedAt: '18 Aug 2026, 01:19 PM'
      }
    ]
  },
  {
    id: 'eval-fac-003',
    submissionId: 'sub-fac-007',
    studentId: 'stu-007',
    studentName: 'Meera Iyer',
    studentEmail: 'meera.i@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-1',
    assignmentTitle: 'I Interviewed Two Users and This Surprised Me',
    unitId: 'unit-1',
    unitTitle: 'Generative User Research & Problem Discovery',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAtFormatted: '11 Aug 2026, 04:00 PM',
    evaluationDate: '13 Aug 2026, 02:15 PM',
    evaluatedAt: '2026-08-13T14:15:00Z',
    score: 17,
    maxScore: 20,
    percentage: 85,
    status: 'FINALIZED',
    reviewer: 'Rohan Mehta',
    reviewerRole: 'Lead Design Facilitator',
    reEvaluation: {
      isRequested: false,
      status: 'NONE',
      requestedAt: null,
      reason: null
    },
    versions: [
      {
        versionNumber: 1,
        title: 'Finalized Evaluation',
        score: 17,
        maxScore: 20,
        percentage: 85,
        evaluatedAt: '13 Aug 2026, 02:15 PM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 6,
          'crit-2': 6,
          'crit-3': 5
        },
        criterionFeedback: {
          'crit-1': 'Raw interview quotes capture authentic hesitation and language.',
          'crit-2': 'Empathy map effectively highlights unspoken mental friction.',
          'crit-3': 'Surprising insight is well-reasoned and grounded in interview evidence.'
        },
        strengths: 'Active listening rigor, authentic dialogue capture, clear empathy mapping.',
        growthAreas: 'Push deeper into probing on why automated features trigger anxiety.',
        generalFeedback: 'Solid generative research foundation. Well-conducted interviews with compelling behavioral observations.'
      }
    ],
    currentEvaluation: {
      criterionScores: {
        'crit-1': 6,
        'crit-2': 6,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Raw interview quotes capture authentic hesitation and language.',
        'crit-2': 'Empathy map effectively highlights unspoken mental friction.',
        'crit-3': 'Surprising insight is well-reasoned and grounded in interview evidence.'
      },
      strengths: 'Active listening rigor, authentic dialogue capture, clear empathy mapping.',
      growthAreas: 'Push deeper into probing on why automated features trigger anxiety.',
      generalFeedback: 'Solid generative research foundation. Well-conducted interviews with compelling behavioral observations.'
    },
    deliverables: [
      {
        id: 'del-1',
        name: 'Verbatim Interview Transcripts',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-interviews.pdf',
        contentPreview: 'Comprehensive transcripts from 2 complete 30-minute user sessions.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:50 PM'
      },
      {
        id: 'del-2',
        name: 'Empathy Map Grid',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-empathy.pdf',
        contentPreview: 'Says, Does, Thinks, and Feels synthesis.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:55 PM'
      },
      {
        id: 'del-3',
        name: 'Counter-Intuitive Insight Deck',
        type: 'file',
        url: 'https://barabari.internal/docs/meera-insight.pdf',
        contentPreview: 'Key surprise: Users avoided automated categorization due to lack of control.',
        isSubmitted: true,
        submittedAt: '11 Aug 2026, 03:58 PM'
      }
    ]
  },
  {
    id: 'eval-fac-004',
    submissionId: 'sub-fac-009',
    studentId: 'stu-009',
    studentName: 'Kabir Das',
    studentEmail: 'kabir.d@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-1',
    assignmentTitle: 'I Interviewed Two Users and This Surprised Me',
    unitId: 'unit-1',
    unitTitle: 'Generative User Research & Problem Discovery',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAtFormatted: '10 Aug 2026, 02:40 PM',
    evaluationDate: '15 Aug 2026, 03:10 PM',
    evaluatedAt: '2026-08-15T15:10:00Z',
    score: 18,
    maxScore: 20,
    percentage: 90,
    status: 'RE_EVALUATED',
    reviewer: 'Rohan Mehta',
    reviewerRole: 'Lead Design Facilitator',
    reEvaluation: {
      isRequested: true,
      status: 'COMPLETED',
      requestedAt: '14 Aug 2026, 09:30 AM',
      reason: 'I submitted full raw verbatim quotes in an appendix frame that was initially overlooked during grading.',
      requestedCriteria: ['crit-1'],
      facilitatorNotes: 'Reviewed appendix frame on page 2 of Miro board.',
      resolvedAt: '15 Aug 2026, 03:10 PM',
      resolutionNotes: 'Appendix frame verified. Raw dialogue notes fully satisfy Exemplary tier for Criterion 1 (+2 marks awarded).'
    },
    versions: [
      {
        versionNumber: 1,
        title: 'Original Finalized Evaluation',
        score: 16,
        maxScore: 20,
        percentage: 80,
        evaluatedAt: '12 Aug 2026, 11:30 AM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 5,
          'crit-2': 6,
          'crit-3': 5
        },
        criterionFeedback: {
          'crit-1': 'Quotes appeared abbreviated in primary slide.',
          'crit-2': 'Empathy map captures friction effectively.',
          'crit-3': 'Surprising insight provides good direction.'
        },
        strengths: 'Synthesized problem framing.',
        growthAreas: 'Include complete interview transcript context.',
        generalFeedback: 'Good interview foundation with room for deeper transcription documentation.'
      },
      {
        versionNumber: 2,
        title: 'Re-Evaluation (Resolved)',
        score: 18,
        maxScore: 20,
        percentage: 90,
        evaluatedAt: '15 Aug 2026, 03:10 PM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 7,
          'crit-2': 6,
          'crit-3': 5
        },
        criterionFeedback: {
          'crit-1': 'Full verbatim transcript in appendix frame reviewed. Outstanding capture of authentic vocal pauses and unarticulated hesitation.',
          'crit-2': 'Empathy map captures friction effectively.',
          'crit-3': 'Surprising insight provides good direction.'
        },
        strengths: 'Comprehensive raw transcripts, authentic listening rigor.',
        growthAreas: 'Ensure appendix links are explicitly referenced in primary submission table of contents.',
        generalFeedback: 'Re-evaluation confirmed: appendix transcripts demonstrate exemplary active listening rigor. Score adjusted from 16 to 18.'
      }
    ],
    currentEvaluation: {
      criterionScores: {
        'crit-1': 7,
        'crit-2': 6,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Full verbatim transcript in appendix frame reviewed. Outstanding capture of authentic vocal pauses and unarticulated hesitation.',
        'crit-2': 'Empathy map captures friction effectively.',
        'crit-3': 'Surprising insight provides good direction.'
      },
      strengths: 'Comprehensive raw transcripts, authentic listening rigor.',
      growthAreas: 'Ensure appendix links are explicitly referenced in primary submission table of contents.',
      generalFeedback: 'Re-evaluation confirmed: appendix transcripts demonstrate exemplary active listening rigor. Score adjusted from 16 to 18.'
    },
    deliverables: [
      {
        id: 'del-1',
        name: 'Verbatim Transcripts & Appendix Frame',
        type: 'file',
        url: 'https://barabari.internal/docs/kabir-transcripts.pdf',
        contentPreview: '2 complete user transcripts + 8 audio timestamp snippets.',
        isSubmitted: true,
        submittedAt: '10 Aug 2026, 02:30 PM'
      },
      {
        id: 'del-2',
        name: 'Empathy Map Matrix',
        type: 'file',
        url: 'https://barabari.internal/docs/kabir-empathy.pdf',
        contentPreview: 'Heuristic quadrant synthesis.',
        isSubmitted: true,
        submittedAt: '10 Aug 2026, 02:35 PM'
      }
    ]
  },
  {
    id: 'eval-fac-005',
    submissionId: 'sub-fac-010',
    studentId: 'stu-010',
    studentName: 'Tanya Sen',
    studentEmail: 'tanya.s@barabari.edu.in',
    studentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    studentCohort: 'Cohort 4 • UI/UX',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    submittedAtFormatted: '09 Sep 2026, 07:10 PM',
    evaluationDate: '11 Sep 2026, 05:40 PM',
    evaluatedAt: '2026-09-11T17:40:00Z',
    score: 16,
    maxScore: 20,
    percentage: 80,
    status: 'FINALIZED',
    reviewer: 'Rohan Mehta',
    reviewerRole: 'Lead Design Facilitator',
    reEvaluation: {
      isRequested: false,
      status: 'NONE',
      requestedAt: null,
      reason: null
    },
    versions: [
      {
        versionNumber: 1,
        title: 'Finalized Evaluation',
        score: 16,
        maxScore: 20,
        percentage: 80,
        evaluatedAt: '11 Sep 2026, 05:40 PM',
        evaluatedBy: 'Rohan Mehta',
        criterionScores: {
          'crit-1': 6,
          'crit-2': 5,
          'crit-3': 5
        },
        criterionFeedback: {
          'crit-1': 'Good nested auto-layout with slight padding misalignment on floating action button.',
          'crit-2': 'Solid 92% overlay match.',
          'crit-3': 'Color tokens match production palette.'
        },
        strengths: 'Auto-layout structure and clear color token variables.',
        growthAreas: 'Ensure floating action button respects bottom safe-area margin.',
        generalFeedback: 'Well-executed recreation meeting professional design standards.'
      }
    ],
    currentEvaluation: {
      criterionScores: {
        'crit-1': 6,
        'crit-2': 5,
        'crit-3': 5
      },
      criterionFeedback: {
        'crit-1': 'Good nested auto-layout with slight padding misalignment on floating action button.',
        'crit-2': 'Solid 92% overlay match.',
        'crit-3': 'Color tokens match production palette.'
      },
      strengths: 'Auto-layout structure and clear color token variables.',
      growthAreas: 'Ensure floating action button respects bottom safe-area margin.',
      generalFeedback: 'Well-executed recreation meeting professional design standards.'
    },
    deliverables: [
      {
        id: 'del-1',
        name: 'Figma File Recreation Link',
        type: 'figma',
        url: 'https://www.figma.com/file/tanya-screen-recreation',
        isSubmitted: true,
        submittedAt: '09 Sep 2026, 07:05 PM'
      }
    ]
  }
];

const STORAGE_KEY_EVALUATIONS = 'barabari_facilitator_evaluations_v1';

/**
 * Get all facilitator evaluations with persistence
 */
export const getFacilitatorEvaluations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading facilitator evaluations from storage:', err);
  }
  return initialFacilitatorEvaluations;
};

/**
 * Save all facilitator evaluations
 */
export const saveFacilitatorEvaluations = (evaluations) => {
  try {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
  } catch (err) {
    console.error('Error saving facilitator evaluations to storage:', err);
  }
};

/**
 * Get evaluation by evaluationId or submissionId
 */
export const getEvaluationById = (id) => {
  const evaluations = getFacilitatorEvaluations();
  return evaluations.find(e => e.id === id || e.submissionId === id) || null;
};

/**
 * Get active re-evaluation requests
 */
export const getReEvaluationRequests = () => {
  const evaluations = getFacilitatorEvaluations();
  return evaluations.filter(e => e.reEvaluation?.isRequested && e.reEvaluation.status !== 'COMPLETED');
};

/**
 * Approve re-evaluation request and start review
 */
export const approveReEvaluation = (evaluationId, facilitatorNotes = '') => {
  const evaluations = getFacilitatorEvaluations();
  const index = evaluations.findIndex(e => e.id === evaluationId || e.submissionId === evaluationId);
  if (index === -1) return null;

  const current = evaluations[index];
  const updated = {
    ...current,
    status: 'UNDER_REVIEW',
    reEvaluation: {
      ...current.reEvaluation,
      status: 'UNDER_REVIEW',
      facilitatorNotes
    }
  };

  evaluations[index] = updated;
  saveFacilitatorEvaluations(evaluations);
  return updated;
};

/**
 * Reject / Decline re-evaluation request
 */
export const rejectReEvaluation = (evaluationId, declineReason) => {
  const evaluations = getFacilitatorEvaluations();
  const index = evaluations.findIndex(e => e.id === evaluationId || e.submissionId === evaluationId);
  if (index === -1) return null;

  const current = evaluations[index];
  const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
    ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updated = {
    ...current,
    status: 'FINALIZED',
    reEvaluation: {
      ...current.reEvaluation,
      status: 'REJECTED',
      resolvedAt: nowFormatted,
      declineReason
    }
  };

  evaluations[index] = updated;
  saveFacilitatorEvaluations(evaluations);
  return updated;
};

/**
 * Finalize revised evaluation (Re-evaluation) creating Version 2 while preserving Version 1
 */
export const finalizeReEvaluation = (evaluationId, revisionData) => {
  const evaluations = getFacilitatorEvaluations();
  const index = evaluations.findIndex(e => e.id === evaluationId || e.submissionId === evaluationId);
  if (index === -1) return null;

  const current = evaluations[index];
  const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
    ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const revisedTotalScore = Number(revisionData.revisedTotalScore);
  const maxScore = current.maxScore || 20;
  const revisedPercentage = Math.round((revisedTotalScore / maxScore) * 100);

  const newVersion = {
    versionNumber: (current.versions?.length || 1) + 1,
    title: 'Re-Evaluation (Resolved)',
    score: revisedTotalScore,
    maxScore: maxScore,
    percentage: revisedPercentage,
    evaluatedAt: nowFormatted,
    evaluatedBy: 'Rohan Mehta',
    criterionScores: revisionData.revisedScores || {},
    criterionFeedback: revisionData.revisedCriterionFeedback || {},
    strengths: revisionData.revisedStrengths || '',
    growthAreas: revisionData.revisedGrowthAreas || '',
    generalFeedback: revisionData.revisedGeneralFeedback || '',
    resolutionNotes: revisionData.reEvaluationResolutionNotes || ''
  };

  const updated = {
    ...current,
    score: revisedTotalScore,
    percentage: revisedPercentage,
    evaluationDate: nowFormatted,
    evaluatedAt: new Date().toISOString(),
    status: 'RE_EVALUATED',
    reEvaluation: {
      ...current.reEvaluation,
      status: 'COMPLETED',
      resolvedAt: nowFormatted,
      resolutionNotes: revisionData.reEvaluationResolutionNotes || ''
    },
    versions: [...(current.versions || []), newVersion],
    currentEvaluation: {
      criterionScores: revisionData.revisedScores || {},
      criterionFeedback: revisionData.revisedCriterionFeedback || {},
      strengths: revisionData.revisedStrengths || '',
      growthAreas: revisionData.revisedGrowthAreas || '',
      generalFeedback: revisionData.revisedGeneralFeedback || ''
    }
  };

  evaluations[index] = updated;
  saveFacilitatorEvaluations(evaluations);

  // Sync back to submission record if present
  try {
    const subs = getFacilitatorSubmissions();
    const subIdx = subs.findIndex(s => s.id === current.submissionId);
    if (subIdx !== -1) {
      subs[subIdx].score = revisedTotalScore;
      subs[subIdx].hasReEvaluationRequest = false;
      subs[subIdx].evaluationStatus = 'EVALUATED';
      saveFacilitatorSubmissions(subs);
    }
  } catch (err) {
    console.error('Error syncing re-evaluation to submissions:', err);
  }

  return updated;
};

// =========================================================================
// FACILITATOR BATCH EVALUATION ASSISTANT DATA & STORAGE
// =========================================================================

export const initialFacilitatorBatches = [
  {
    id: 'batch-2026-001',
    batchName: 'Sprint 03 • Pixel Recreation Cohort Batch',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Rigor & Pixel Recreation',
    courseId: 'course-uiux-101',
    rubricId: 'rubric-asg-3',
    rubricTitle: 'Visual Design Rigor & Pixel Recreation Rubric',
    createdAt: '11 Sep 2026, 02:15 PM',
    status: 'COMPLETED',
    totalSelected: 4,
    processedCount: 4,
    reviewRequiredCount: 2,
    completedCount: 2,
    flaggedCount: 1,
    items: [
      {
        submissionId: 'sub-fac-003',
        studentId: 'stu-003',
        studentName: 'Priya Nair',
        studentEmail: 'priya.n@barabari.edu.in',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        submittedAt: '08 Sep 2026, 06:15 PM',
        deliverablesCompleteness: '3/3 Items Available',
        missingCount: 0,
        batchStatus: 'REVIEW_REQUIRED',
        aiPreReview: {
          completeness: 'COMPLETE',
          confidenceScore: '96% Evidence Match',
          evidenceDetected: [
            'Figma public file link accessible with view permissions',
            'Side-by-side overlay match against Linear verified at 98%',
            '8pt spatial rhythm tokens present in layout grid'
          ],
          flags: [
            'Criterion 1: Container header uses fixed width on 360px viewport'
          ],
          suggestedPrompts: [
            'Review nested auto-layout constraints on mobile breakpoint',
            'Verify typography scale hierarchy'
          ],
          rubricCoverage: 'High coverage on Criterion 1, 2, and 3.'
        }
      },
      {
        id: 'item-2',
        submissionId: 'sub-fac-010',
        studentId: 'stu-010',
        studentName: 'Tanya Sen',
        studentEmail: 'tanya.s@barabari.edu.in',
        studentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        submittedAt: '09 Sep 2026, 07:10 PM',
        deliverablesCompleteness: '1/1 Items Available',
        missingCount: 0,
        batchStatus: 'COMPLETED',
        aiPreReview: {
          completeness: 'COMPLETE',
          confidenceScore: '92% Evidence Match',
          evidenceDetected: [
            'Figma recreation file detected with layer grouping',
            'Color styles match source application hex values'
          ],
          flags: [],
          suggestedPrompts: [
            'Check floating action button bottom margin'
          ],
          rubricCoverage: 'All 3 criteria addressed.'
        }
      }
    ]
  },
  {
    id: 'batch-2026-002',
    batchName: 'Sprint 02 • Journey Mapping Heuristics Batch',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map & User Journey Diagram',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    courseId: 'course-uiux-101',
    rubricId: 'rubric-asg-2',
    rubricTitle: 'Information Architecture & Journey Mapping Rubric',
    createdAt: '21 Aug 2026, 10:45 AM',
    status: 'COMPLETED',
    totalSelected: 3,
    processedCount: 3,
    reviewRequiredCount: 1,
    completedCount: 2,
    flaggedCount: 0,
    items: [
      {
        submissionId: 'sub-fac-005',
        studentId: 'stu-005',
        studentName: 'Sneha Rao',
        studentEmail: 'sneha.r@barabari.edu.in',
        studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        submittedAt: '18 Aug 2026, 01:20 PM',
        deliverablesCompleteness: '3/3 Items Available',
        missingCount: 0,
        batchStatus: 'COMPLETED',
        aiPreReview: {
          completeness: 'COMPLETE',
          confidenceScore: '98% Evidence Match',
          evidenceDetected: [
            '9 distinct user flow steps visual diagram in FigJam',
            'Friction audit synthesis document categorizing drop-offs',
            'Actionable How-Might-We statements'
          ],
          flags: [],
          suggestedPrompts: ['Examine emotional dip alignment at Step 6'],
          rubricCoverage: 'Thorough coverage across all 3 criteria.'
        }
      }
    ]
  }
];

const STORAGE_KEY_BATCHES = 'barabari_facilitator_batches_v1';

/**
 * Get all facilitator batch runs with persistence
 */
export const getFacilitatorBatches = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading facilitator batches from storage:', err);
  }
  return initialFacilitatorBatches;
};

/**
 * Save all facilitator batch runs
 */
export const saveFacilitatorBatches = (batches) => {
  try {
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
  } catch (err) {
    console.error('Error saving facilitator batches to storage:', err);
  }
};

/**
 * Create a new batch run
 */
export const createFacilitatorBatch = (batchData) => {
  const batches = getFacilitatorBatches();
  const newBatch = {
    ...batchData,
    id: batchData.id || `batch-${Date.now()}`,
    createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
      ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };

  const updated = [newBatch, ...batches];
  saveFacilitatorBatches(updated);
  return newBatch;
};

/**
 * Update an existing batch run
 */
export const updateFacilitatorBatch = (batchId, updates) => {
  const batches = getFacilitatorBatches();
  const index = batches.findIndex(b => b.id === batchId);
  if (index === -1) return null;

  const current = batches[index];
  const updated = {
    ...current,
    ...updates
  };

  batches[index] = updated;
  saveFacilitatorBatches(batches);
  return updated;
};

/**
 * ============================================================
 * FACILITATOR SETTINGS & PREFERENCES (FE-1 TASK 7)
 * ============================================================
 */
export const STORAGE_KEY_SETTINGS = 'barabari_facilitator_settings_v1';

export const DEFAULT_FACILITATOR_SETTINGS = {
  profile: {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@barabaricollective.in',
    role: 'Lead Design Facilitator',
    cohort: 'Cohort 4 • UI/UX Product Design',
    organization: 'Barabari Collective Design Studio',
    initials: 'RM',
    bio: 'Product Designer & Mentor guiding cohorts in auto-layout, micro-interactions, and design systems.',
    officeHours: 'Tuesdays & Thursdays, 4:00 PM – 6:00 PM IST',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  evaluation: {
    defaultView: 'table',
    showAiAdvisorySuggestions: true,
    showRubricEvidenceIndicators: true,
    showEvaluationHistoryByDefault: true,
    confirmBeforeFinalizing: true
  },
  notifications: {
    newSubmissionAlerts: true,
    reEvaluationAlerts: true,
    batchCompletionAlerts: true,
    assignmentDeadlineReminders: true
  },
  interface: {
    density: 'comfortable',
    defaultViewMode: 'table',
    autoExpandRubricNotes: false
  }
};

/**
 * Retrieve facilitator settings from localStorage
 */
export const getFacilitatorSettings = () => {
  const getDefault = () => JSON.parse(JSON.stringify(DEFAULT_FACILITATOR_SETTINGS));
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      const initial = getDefault();
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const def = getDefault();
    return {
      profile: { ...def.profile, ...(parsed.profile || {}) },
      evaluation: { ...def.evaluation, ...(parsed.evaluation || {}) },
      notifications: { ...def.notifications, ...(parsed.notifications || {}) },
      interface: { ...def.interface, ...(parsed.interface || {}) }
    };
  } catch (err) {
    console.error('Error reading facilitator settings:', err);
    return getDefault();
  }
};

/**
 * Persist facilitator settings to localStorage
 */
export const saveFacilitatorSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    // Also sync profile updates with auth user object
    if (settings.profile) {
      const storedUserRaw = localStorage.getItem('barabari_facilitator_user');
      if (storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw);
          const updatedUser = {
            ...storedUser,
            name: settings.profile.name || storedUser.name,
            email: settings.profile.email || storedUser.email,
            role: settings.profile.role || storedUser.role,
            cohort: settings.profile.cohort || storedUser.cohort,
            bio: settings.profile.bio || storedUser.bio,
            avatar: settings.profile.avatar || storedUser.avatar
          };
          localStorage.setItem('barabari_facilitator_user', JSON.stringify(updatedUser));
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error('Error saving facilitator settings:', err);
  }
};

/**
 * Reset settings back to defaults without wiping operational data
 */
export const resetFacilitatorSettings = () => {
  const freshDefaults = JSON.parse(JSON.stringify(DEFAULT_FACILITATOR_SETTINGS));
  saveFacilitatorSettings(freshDefaults);
  return freshDefaults;
};




