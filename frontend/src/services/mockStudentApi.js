/**
 * Mock Student API Service
 * Mirrors exact BE-1 contract shapes and provides realistic Barabari Collective UI/UX assignments,
 * submissions, evaluations, re-evaluations, and profile management with localStorage persistence.
 */

const STORAGE_KEYS = {
  SUBMISSIONS: 'barabari_mock_submissions',
  RE_EVALUATIONS: 'barabari_mock_reevaluations',
  PROFILE: 'barabari_mock_profile',
  DRAFTS: 'barabari_mock_drafts_'
};

const defaultStudentProfile = {
  id: 'student-27-01',
  name: 'Ananya Sharma',
  email: 'ananya.sharma@barabaricollective.in',
  phone: '+91 98765 43210',
  college: 'National Institute of Design (NID)',
  cohort: 'Cohort 4',
  specialization: 'UI/UX & Interaction Design',
  location: 'Bengaluru, Karnataka',
  bio: 'Product and interaction design student exploring design systems, generative AI co-design, and friction-free mobile interfaces.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  studentId: 'BC-2026-088',
  currentCourseId: 'course-uiux-101',
  currentUnitId: 'unit-4',
  activeAssignmentId: 'asg-4',
  overallProgress: 60, // 6/10 units
  stats: {
    totalAssignments: 6,
    completed: 3,
    inProgress: 1,
    notStarted: 2,
    underEvaluation: 1,
    publishedResults: 2,
    enrolledCourses: 1,
    completedUnits: 3,
    totalUnits: 10,
    averageScore: 16,
    maxPossibleAverage: 20
  }
};

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...defaultStudentProfile, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse stored profile', e);
  }
  return defaultStudentProfile;
}

function saveStoredProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

const mockAssignments = {
  'asg-1': {
    id: 'asg-1',
    assignmentNumber: 1,
    unitId: 'unit-1',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Generative User Research & Problem Discovery',
    title: 'I Interviewed Two Users and This Surprised Me',
    phase: 'Research & Empathy',
    maxScore: 20,
    maxMarks: 20,
    dueDate: '10 Aug 2026',
    deadline: '10 Aug 2026',
    status: 'PUBLISHED',
    description: 'Conduct two 30-minute in-depth qualitative interviews with users attempting a specific digital task. Identify behavioral surprises rather than assumed pain points.',
    objective: 'Learn how to listen without leading, uncover unarticulated friction, and document unexpected behavioral patterns.',
    instructions: [
      'Choose a specific consumer flow (e.g. splitting bills, ordering medication, cancelling a subscription).',
      'Conduct two 1-on-1 interviews with target users.',
      'Highlight at least 2 behavioral surprises that contradicted your initial hypothesis.',
      'Formulate synthesized user persona and insight cards.'
    ],
    requirements: [
      {
        requirementId: 'req-1-1',
        title: 'Interview Depth & Probe Technique',
        description: 'Evidence of open-ended probing, avoidance of leading questions, and uncovering genuine emotional friction.',
        weight: 35,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-1-2',
        title: 'Behavioral Surprises Synthesis',
        description: 'Quality of surprising observations uncovered and clear departure from standard assumptions.',
        weight: 35,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-1-3',
        title: 'Persona Rigor & FigJam Documentation',
        description: 'Clarity and fidelity of persona synthesis and insight documentation in FigJam/Figma.',
        weight: 30,
        priority: 'HIGH',
        completed: true,
        required: true
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Figma / FigJam Board Link', required: true, type: 'url' },
      { key: 'personaDoc', label: 'User Persona Artifact', required: true, type: 'text' },
      { key: 'interviewSurprises', label: 'Documented Surprises & Key Insights', required: true, type: 'textarea' }
    ],
    rubric: [
      { id: 'crit-1-1', name: 'Interview Depth & Inquiry', maxMarks: 7, weight: 35, priority: 'HIGH', description: 'Evidence of open-ended probing and uncovering genuine emotional friction.' },
      { id: 'crit-1-2', name: 'Synthesis & Behavioral Surprises', maxMarks: 7, weight: 35, priority: 'HIGH', description: 'Quality of surprising observations and departure from standard assumptions.' },
      { id: 'crit-1-3', name: 'Artifact Rigor & Empathy Docs', maxMarks: 6, weight: 30, priority: 'HIGH', description: 'Clarity and fidelity of persona synthesis in FigJam/Figma.' }
    ]
  },
  'asg-2': {
    id: 'asg-2',
    assignmentNumber: 2,
    unitId: 'unit-2',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Information Architecture & Journey Mapping',
    title: 'Friction Map: A Flow You Can Fix',
    phase: 'UX Architecture',
    maxScore: 20,
    maxMarks: 20,
    dueDate: '25 Aug 2026',
    deadline: '25 Aug 2026',
    status: 'PUBLISHED',
    description: 'Map an existing consumer product workflow, plot emotional highs and drop-off friction points, and engineer a high-impact UX intervention.',
    objective: 'Develop rigorous heuristic analysis capabilities and visual journey mapping skills.',
    instructions: [
      'Document all step-by-step screens of an existing mobile or web flow.',
      'Plot user emotion, uncertainty, cognitive load, and friction hotspots.',
      'Propose a revised friction-free flow with wireframe annotations.'
    ],
    requirements: [
      {
        requirementId: 'req-2-1',
        title: 'UX Intervention Viability',
        description: 'Effectiveness, simplicity, and user empathy of the proposed flow fix.',
        weight: 40,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-2-2',
        title: 'Friction Discovery & Heuristic Rigor',
        description: 'Thoroughness of cognitive friction identification across the user journey.',
        weight: 30,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-2-3',
        title: 'Journey Map Precision',
        description: 'Clarity of user steps, pain points, and visual hierarchy of the journey map.',
        weight: 30,
        priority: 'HIGH',
        completed: true,
        required: true
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Figma / FigJam File Link', required: true, type: 'url' },
      { key: 'userFlowDoc', label: 'User Flow Architecture', required: true, type: 'text' },
      { key: 'journeyMapDoc', label: 'Friction Journey Map Artifact', required: true, type: 'text' }
    ],
    rubric: [
      { id: 'crit-2-1', name: 'UX Intervention Viability', maxMarks: 8, weight: 40, priority: 'HIGH', description: 'Effectiveness and user empathy of the proposed flow fix.' },
      { id: 'crit-2-2', name: 'Friction Discovery', maxMarks: 6, weight: 30, priority: 'HIGH', description: 'Thoroughness of cognitive friction identification.' },
      { id: 'crit-2-3', name: 'Journey Map Precision', maxMarks: 6, weight: 30, priority: 'HIGH', description: 'Visual hierarchy and clarity of user steps.' }
    ]
  },
  'asg-3': {
    id: 'asg-3',
    assignmentNumber: 3,
    unitId: 'unit-3',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Visual Design Systems & Auto-Layout in Figma',
    title: 'Recreated a Real Screen in Figma',
    phase: 'UI Fundamentals',
    maxScore: 20,
    maxMarks: 20,
    dueDate: '10 Sep 2026',
    deadline: '10 Sep 2026',
    status: 'PUBLISHED',
    description: 'Select a production application (e.g. Airbnb, Spotify, Linear, Wise) and recreate one complex screen with 100% auto-layout, typographic scale tokens, and precise 8pt spatial grid alignment.',
    objective: 'Achieve mastery over Figma auto-layout, spacing variables, component typography, and pixel fidelity.',
    instructions: [
      'Choose one complex UI screen from a top-tier app.',
      'Build using nested auto-layout (no absolute positioning unless mathematically warranted).',
      'Provide side-by-side screenshot vs recreation comparison in Figma.',
      'Ensure link permissions are set to "Anyone with the link can view".'
    ],
    requirements: [
      {
        requirementId: 'req-3-1',
        title: 'Research & Spatial Hierarchy',
        description: 'Deconstruction of spatial hierarchy, typography relationships, and design tokens.',
        weight: 30,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-3-2',
        title: 'UI Fundamentals & Auto-Layout',
        description: 'Rigor of auto-layout nesting, responsive resizing behavior, and 8px grid discipline.',
        weight: 25,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-3-3',
        title: 'User Flow & State Fidelity',
        description: 'Fidelity of component states and navigation anchors.',
        weight: 25,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-3-4',
        title: 'Canvas Hygiene & Organization',
        description: 'Clean layer naming, side-by-side comparison, and tidy canvas structure.',
        weight: 20,
        priority: 'MEDIUM',
        completed: true,
        required: false
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Figma Design Link (Public)', required: true, type: 'url' },
      { key: 'recreatedScreenName', label: 'Target App & Screen Name', required: true, type: 'text' },
      { key: 'autoLayoutNotes', label: 'Auto-Layout & Spacing Architecture Notes', required: true, type: 'textarea' }
    ],
    rubric: [
      { id: 'crit-3-1', name: 'Research & Insights', maxMarks: 6, weight: 30, priority: 'HIGH', description: 'Deconstruction of spatial hierarchy and tokens.' },
      { id: 'crit-3-2', name: 'UI Fundamentals & Auto-Layout', maxMarks: 5, weight: 25, priority: 'HIGH', description: 'Rigor of auto-layout nesting and 8px grid.' },
      { id: 'crit-3-3', name: 'User Flow & State Fidelity', maxMarks: 5, weight: 25, priority: 'HIGH', description: 'Fidelity of component states and navigation.' },
      { id: 'crit-3-4', name: 'Communication & Organization', maxMarks: 4, weight: 20, priority: 'MEDIUM', description: 'Clean layer naming and canvas structure.' }
    ]
  },
  'asg-4': {
    id: 'asg-4',
    assignmentNumber: 4,
    unitId: 'unit-4',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Interaction Design & Micro-motion',
    title: 'One Clickable Prototype with Motion',
    phase: 'UI Fundamentals',
    maxScore: 20,
    maxMarks: 20,
    dueDate: '22 Sep 2026',
    deadline: '22 Sep 2026',
    status: 'IN_PROGRESS',
    description: 'Build a high-fidelity 2–4 frame clickable prototype in Figma demonstrating one meaningful motion transition, responsive layout stability, and an authentic interactive state.',
    objective: 'Demonstrate functional interaction design, purpose-driven micro-motion, and robust prototype navigation.',
    instructions: [
      'Create 2–4 interconnected Figma frames representing a continuous micro-flow.',
      'Configure bidirectional prototype links with zero dead ends.',
      'Implement at least one meaningful motion transition (Smart Animate with easing curve).',
      'Design at least one genuine interactive component state (active, pressed, or validation error).',
      'Share a public Figma link accessible in presentation mode without login.'
    ],
    requirements: [
      {
        requirementId: 'req-4-1',
        title: 'Prototype Navigation & Flow',
        description: 'Seamless forward and backward navigation with no dead-ends or broken interaction hot-spots.',
        weight: 30,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-4-2',
        title: 'Meaningful Micro-motion',
        description: 'Motion conveys spatial continuity and hierarchy without gratuitous or distracting animation.',
        weight: 25,
        priority: 'HIGH',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-4-3',
        title: 'Interactive State Decision',
        description: 'Genuine interactive states (active, focused, loaded, error) handled convincingly.',
        weight: 20,
        priority: 'MEDIUM',
        completed: true,
        required: true
      },
      {
        requirementId: 'req-4-4',
        title: 'Responsive Layout Stability',
        description: 'Frames retain structural integrity, auto-layout constraints, and typographic rhythm.',
        weight: 15,
        priority: 'MEDIUM',
        completed: false,
        required: false
      },
      {
        requirementId: 'req-4-5',
        title: 'Public Figma Presentation Link',
        description: 'Public link works instantly in presentation mode with clear starting node set.',
        weight: 10,
        priority: 'LOW',
        completed: false,
        required: true
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Public Figma Prototype Link', required: true, type: 'url', placeholder: 'https://www.figma.com/proto/... or https://www.figma.com/design/...' },
      { key: 'prototypeOverview', label: 'Interactive Flow Rationale', required: true, type: 'textarea', placeholder: 'Describe the key transition and how motion aids user comprehension...' },
      { key: 'motionType', label: 'Motion / Transition Technique Used', required: true, type: 'text', placeholder: 'e.g., Smart Animate Ease-Out 300ms on Bottom Sheet' },
      { key: 'interactiveState', label: 'Interactive State Documented', required: true, type: 'text', placeholder: 'e.g., Active tab selection + Disabled submit button validation state' },
      { key: 'figJamUrl', label: 'Optional FigJam Architecture Link', required: false, type: 'url', placeholder: 'https://www.figma.com/board/...' }
    ],
    rubric: [
      { id: 'crit-4-1', name: 'Prototype Navigation', maxMarks: 6, weight: 30, priority: 'HIGH', description: 'Seamless forward and backward navigation with no dead-ends.' },
      { id: 'crit-4-2', name: 'Meaningful Motion', maxMarks: 5, weight: 25, priority: 'HIGH', description: 'Motion conveys spatial continuity without gratuitous animation.' },
      { id: 'crit-4-3', name: 'State Decision', maxMarks: 4, weight: 20, priority: 'MEDIUM', description: 'Genuine interactive states handled thoughtfully.' },
      { id: 'crit-4-4', name: 'Responsive Layout', maxMarks: 3, weight: 15, priority: 'MEDIUM', description: 'Frames retain structural integrity and spatial rhythm.' },
      { id: 'crit-4-5', name: 'Publication & Link', maxMarks: 2, weight: 10, priority: 'LOW', description: 'Public link works instantly in presentation mode.' }
    ]
  },
  'asg-5': {
    id: 'asg-5',
    assignmentNumber: 5,
    unitId: 'unit-5',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Design Systems at Scale & Component Variants',
    title: 'I Designed With AI and Beat It',
    phase: 'AI & Human Co-Design',
    maxScore: 20,
    maxMarks: 20,
    dueDate: '05 Oct 2026',
    deadline: '05 Oct 2026',
    status: 'NOT_STARTED',
    description: 'Use a generative design tool to create an initial interface. Audit its human usability failures, and design a human-centric version that fixes cognitive gaps.',
    objective: 'Learn how to leverage AI as a raw generator while maintaining superior human design taste and usability judgment.',
    instructions: [
      'Generate initial interface concepts using an AI UI prompt generator.',
      'Perform heuristic review documenting AI cognitive gaps and spacing errors.',
      'Design a superior, human-centered version in Figma adhering to Barabari design standards.'
    ],
    requirements: [
      {
        requirementId: 'req-5-1',
        title: 'Human Redesign Superiority',
        description: 'Clear evidence of enhanced clarity, accessibility, and ergonomic usability.',
        weight: 40,
        priority: 'HIGH',
        completed: false,
        required: true
      },
      {
        requirementId: 'req-5-2',
        title: 'Critical AI Evaluation Audit',
        description: 'Depth of heuristic critique identifying where AI failed on real human context.',
        weight: 35,
        priority: 'HIGH',
        completed: false,
        required: true
      },
      {
        requirementId: 'req-5-3',
        title: 'Design System Execution',
        description: 'Figma component structure, variant tokens, and typography fidelity.',
        weight: 25,
        priority: 'HIGH',
        completed: false,
        required: false
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Figma File with Side-by-Side Comparison', required: true, type: 'url' },
      { key: 'aiCritique', label: 'AI Hallucination & Usability Audit', required: true, type: 'textarea' }
    ],
    rubric: [
      { id: 'crit-5-1', name: 'Human Redesign Superiority', maxMarks: 8, weight: 40, priority: 'HIGH', description: 'Enhanced clarity and ergonomic usability.' },
      { id: 'crit-5-2', name: 'Critical AI Evaluation', maxMarks: 7, weight: 35, priority: 'HIGH', description: 'Depth of heuristic critique on AI failures.' },
      { id: 'crit-5-3', name: 'Design System Execution', maxMarks: 5, weight: 25, priority: 'HIGH', description: 'Figma component structure and variant tokens.' }
    ]
  },
  'asg-6': {
    id: 'asg-6',
    assignmentNumber: 6,
    unitId: 'unit-6',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitTitle: 'Production UI/UX: The Shipped Product',
    title: "AI Landing Page You'd Ship",
    phase: 'Capstone & Production UI',
    maxScore: 25,
    maxMarks: 25,
    dueDate: '20 Oct 2026',
    deadline: '20 Oct 2026',
    status: 'NOT_STARTED',
    description: 'Build a production-ready, conversion-optimized marketing landing page for an AI product with full desktop and mobile responsive viewport choreography.',
    objective: 'Master responsive storytelling, value proposition hierarchy, and component production readiness.',
    instructions: [
      'Define clear value proposition hero section with high-contrast primary CTA.',
      'Design responsive layouts for 1440px desktop and 390px mobile viewports.',
      'Incorporate social proof, feature breakdown, and accessible pricing table.'
    ],
    requirements: [
      {
        requirementId: 'req-6-1',
        title: 'Visual Craft & Typography Harmony',
        description: 'Color harmony, typography pairings, micro-interactions, and accessibility contrast.',
        weight: 35,
        priority: 'HIGH',
        completed: false,
        required: true
      },
      {
        requirementId: 'req-6-2',
        title: 'Responsive Choreography (Desktop + Mobile)',
        description: 'Fluid transitions between 1440px desktop and 390px mobile viewports.',
        weight: 35,
        priority: 'HIGH',
        completed: false,
        required: true
      },
      {
        requirementId: 'req-6-3',
        title: 'Value Proposition & Scanning Flow',
        description: 'Clarity of core message, hero scanning flow, and feature value clarity.',
        weight: 30,
        priority: 'HIGH',
        completed: false,
        required: true
      }
    ],
    requiredArtifacts: [
      { key: 'figmaUrl', label: 'Public Figma Prototype (Desktop + Mobile)', required: true, type: 'url' },
      { key: 'designSystemLink', label: 'Design System / Tokens Sheet', required: true, type: 'text' }
    ],
    rubric: [
      { id: 'crit-6-1', name: 'Visual Craft & Typography', maxMarks: 9, weight: 35, priority: 'HIGH', description: 'Color harmony and accessibility contrast.' },
      { id: 'crit-6-2', name: 'Responsive Choreography', maxMarks: 8, weight: 35, priority: 'HIGH', description: 'Fluid desktop and mobile viewports.' },
      { id: 'crit-6-3', name: 'Value Proposition & Flow', maxMarks: 8, weight: 30, priority: 'HIGH', description: 'Hero scanning and feature value clarity.' }
    ]
  }
};

const mockCourses = [
  {
    id: 'course-uiux-101',
    title: 'UI/UX Product Design',
    code: 'UX-PD-2026',
    phase: 'UI Fundamentals',
    description: 'Master human-centered product design, design systems, generative research, and high-fidelity interactive prototyping.',
    progress: 60,
    totalUnits: 10,
    completedUnits: 3,
    currentUnitTitle: 'Week 8 • Interaction Design & Micro-motion',
    facilitator: {
      name: 'Rohan Mehta',
      role: 'Lead Design Facilitator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    units: [
      {
        id: 'unit-1',
        unitNumber: 1,
        title: 'Design Research Foundations',
        shortTitle: 'Generative User Research',
        description: 'Interviewing users, cognitive biases, unearthing root friction, and building actionable personas.',
        objective: 'Learn how to listen without leading, uncover unarticulated friction, and document unexpected behavioral patterns.',
        status: 'COMPLETED',
        assignmentId: 'asg-1',
        assignmentTitle: 'I Interviewed Two Users and This Surprised Me',
        assignmentStatus: 'EVALUATED',
        score: '18/20',
        marks: 20,
        deadline: '10 Aug 2026'
      },
      {
        id: 'unit-2',
        unitNumber: 2,
        title: 'User Flows & Friction',
        shortTitle: 'Information Architecture',
        description: 'User journeys, service blueprints, identifying friction drop-offs, and micro-flows.',
        objective: 'Develop rigorous heuristic analysis capabilities and visual journey mapping skills.',
        status: 'COMPLETED',
        assignmentId: 'asg-2',
        assignmentTitle: 'Friction Map: A Flow You Can Fix',
        assignmentStatus: 'EVALUATED',
        score: '15/20',
        marks: 20,
        deadline: '25 Aug 2026'
      },
      {
        id: 'unit-3',
        unitNumber: 3,
        title: 'UI Fundamentals',
        shortTitle: 'Visual Systems in Figma',
        description: 'Tokens, typography scales, 8pt spatial rhythm, nested auto-layout, and pixel precision.',
        objective: 'Achieve mastery over Figma auto-layout, spacing variables, component typography, and pixel fidelity.',
        status: 'COMPLETED',
        assignmentId: 'asg-3',
        assignmentTitle: 'Recreated a Real Screen in Figma',
        assignmentStatus: 'EVALUATED',
        score: '17/20',
        marks: 20,
        deadline: '10 Sep 2026'
      },
      {
        id: 'unit-4',
        unitNumber: 4,
        title: 'Interaction Design',
        shortTitle: 'Micro-motion & States',
        description: 'State transitions, smart animation, gestures, micro-feedback, and interactive prototype routing.',
        objective: 'Demonstrate functional interaction design, purpose-driven micro-motion, and robust prototype navigation.',
        status: 'CURRENT', // CURRENT / IN_PROGRESS
        assignmentId: 'asg-4',
        assignmentTitle: 'One Clickable Prototype with Motion',
        assignmentStatus: 'IN_PROGRESS',
        score: null,
        marks: 20,
        deadline: '22 Sep 2026'
      },
      {
        id: 'unit-5',
        unitNumber: 5,
        title: 'AI-Native Design',
        shortTitle: 'Component Variants & Systems',
        description: 'Multi-brand component tokens, accessible states, slot architecture, and co-designing with generative AI.',
        objective: 'Learn how to leverage AI as a raw generator while maintaining superior human design taste and usability judgment.',
        status: 'NOT_STARTED',
        assignmentId: 'asg-5',
        assignmentTitle: 'I Designed With AI and Beat It',
        assignmentStatus: 'NOT_STARTED',
        score: null,
        marks: 20,
        deadline: '05 Oct 2026'
      },
      {
        id: 'unit-6',
        unitNumber: 6,
        title: 'Production UI/UX: The Shipped Product',
        shortTitle: 'Production UI/UX',
        description: 'Design hand-off, edge cases, responsive breakpoint choreography, and launch readiness.',
        objective: 'Master responsive storytelling, value proposition hierarchy, and component production readiness.',
        status: 'NOT_STARTED',
        assignmentId: 'asg-6',
        assignmentTitle: "AI Landing Page You'd Ship",
        assignmentStatus: 'NOT_STARTED',
        score: null,
        marks: 25,
        deadline: '20 Oct 2026'
      }
    ]
  }
];

const initialSubmissions = [
  {
    id: 'sub-2026-003',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-3',
    unitTitle: 'Visual Design Systems & Auto-Layout in Figma',
    submittedAt: '2026-09-10T14:22:00Z',
    status: 'PUBLISHED',
    score: 17,
    maxScore: 20,
    completionPercentage: 100,
    completedRequirements: ['Research & Spatial Hierarchy', 'UI Fundamentals & Auto-Layout', 'User Flow & State Fidelity', 'Canvas Hygiene & Organization'],
    incompleteRequirements: [],
    evaluationId: 'eval-asg-3',
    artifacts: {
      figmaUrl: 'https://www.figma.com/file/barabari-screen-recreation-ananya',
      recreatedScreenName: 'Linear Mobile App - Issue Details Screen',
      autoLayoutNotes: 'Built entirely using vertical and horizontal nested auto-layout with min-width constraints on the tag containers. 8px spatial grid enforced throughout.'
    },
    timeline: [
      { step: 'SUBMITTED', title: 'Submission Received', timestamp: '10 Sep 2026, 02:22 PM', completed: true },
      { step: 'PROCESSING', title: 'Figma File Validation & Node Ingestion', timestamp: '10 Sep 2026, 02:23 PM', completed: true },
      { step: 'AUTOMATED_ANALYSIS', title: 'Automated Spatial & Token Analysis', timestamp: '10 Sep 2026, 02:25 PM', completed: true },
      { step: 'FACILITATOR_REVIEW', title: 'Facilitator Assessment & Rubric Scoring', timestamp: '11 Sep 2026, 11:30 AM', completed: true, actor: 'Rohan Mehta' },
      { step: 'PUBLISHED', title: 'Final Evaluation Approved & Published', timestamp: '11 Sep 2026, 04:15 PM', completed: true }
    ]
  },
  {
    id: 'sub-2026-002',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map: A Flow You Can Fix',
    courseId: 'course-uiux-101',
    courseTitle: 'UI/UX Product Design',
    unitId: 'unit-2',
    unitTitle: 'Information Architecture & Journey Mapping',
    submittedAt: '2026-08-25T17:45:00Z',
    status: 'PUBLISHED',
    score: 15,
    maxScore: 20,
    completionPercentage: 100,
    completedRequirements: ['UX Intervention Viability', 'Friction Discovery', 'Journey Map Precision'],
    incompleteRequirements: [],
    evaluationId: 'eval-asg-2',
    artifacts: {
      figmaUrl: 'https://www.figma.com/file/barabari-friction-map-ananya',
      userFlowDoc: 'Spotify Podcast Queue Management',
      journeyMapDoc: 'Friction map plotting 4 critical drop-offs in playlist reorganization',
      interventionSummary: 'Simplified multi-select gesture and added an explicit drag-handle anchor.'
    },
    timeline: [
      { step: 'SUBMITTED', title: 'Submission Received', timestamp: '25 Aug 2026, 05:45 PM', completed: true },
      { step: 'PROCESSING', title: 'File Validation & Check', timestamp: '25 Aug 2026, 05:46 PM', completed: true },
      { step: 'AUTOMATED_ANALYSIS', title: 'UX Flow Continuity Analysis', timestamp: '25 Aug 2026, 05:48 PM', completed: true },
      { step: 'FACILITATOR_REVIEW', title: 'Facilitator Assessment', timestamp: '26 Aug 2026, 02:10 PM', completed: true, actor: 'Rohan Mehta' },
      { step: 'PUBLISHED', title: 'Evaluation Published', timestamp: '26 Aug 2026, 06:00 PM', completed: true }
    ]
  }
];

const mockEvaluations = {
  'eval-asg-3': {
    id: 'eval-asg-3',
    submissionId: 'sub-2026-003',
    assignmentId: 'asg-3',
    assignmentTitle: 'Recreated a Real Screen in Figma',
    courseTitle: 'UI/UX Product Design',
    studentName: 'Ananya Sharma',
    evaluatedAt: '11 Sep 2026, 04:15 PM',
    status: 'PUBLISHED',
    score: 17,
    maxScore: 20,
    percentage: 85,
    gradeBadge: 'Strong Pass',
    facilitator: {
      name: 'Rohan Mehta',
      role: 'Lead Design Facilitator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    criteriaBreakdown: [
      {
        id: 'crit-3-1',
        title: 'Research & Insights',
        score: 5,
        maxScore: 6,
        status: 'Proficient',
        feedback: 'Excellent deconstruction of Linear’s spatial rhythms and dark mode neutral palette tokens.',
        evidence: {
          available: true,
          source: 'Screen 1: Inspection Sheet',
          component: 'Tokens & Color Variables',
          observations: [
            '✓ Color tokens mapped directly to 8 luminance steps',
            '✓ Semantic naming (bg-surface-elevated, text-subtle) matches production standard',
            '⚠ Contrast on disabled badge text is slightly below WCAG AA (3.8:1)'
          ]
        },
        improvementSuggestion: 'Verify text-to-background contrast with Figma Contrast Checker plugin on dimmed badges.'
      },
      {
        id: 'crit-3-2',
        title: 'User Flow & State Fidelity',
        score: 4,
        maxScore: 5,
        status: 'Competent',
        feedback: 'Primary flow accurately mapped, but secondary dismiss routes require clearer visual indicators.',
        evidence: {
          available: true,
          source: 'Screen 3: Sub-issue Drawer',
          component: 'Modal Header / Back Navigation',
          observations: [
            '✓ Primary completion CTA is immediately visible and anchored',
            '✓ Main flow transitions smoothly to ticket overview',
            '⚠ Secondary flow lacks a clear return path or keyboard escape affordance'
          ]
        },
        improvementSuggestion: 'Add an explicit visible close/back button in the top left header bar.'
      },
      {
        id: 'crit-3-3',
        title: 'UI Fundamentals & Auto-Layout',
        score: 4,
        maxScore: 5,
        status: 'Proficient',
        feedback: 'Auto-layout is applied consistently. Small variance in corner radiuses across nested cards.',
        evidence: {
          available: true,
          source: 'Screen 2: Task Details View',
          component: 'Metadata Property Row',
          observations: [
            '✓ 8px grid alignment strictly maintained across all vertical gutters',
            '✓ Typography scale conforms to 16px base with 1.4 line-height',
            '⚠ Card corner radius differs between row 1 (12px) and row 2 (8px)'
          ]
        },
        improvementSuggestion: 'Standardize card corner radiuses by using a single shared radius token.'
      },
      {
        id: 'crit-3-4',
        title: 'Communication & Organization',
        score: 4,
        maxScore: 4,
        status: 'Exemplary',
        feedback: 'Flawless Figma page structure and canvas cleanliness. Side-by-side comparison made review efficient.',
        evidence: {
          available: true,
          source: 'Canvas Root',
          component: 'Frame Organization',
          observations: [
            '✓ Frames systematically labelled: 01_Original vs 02_Recreation',
            '✓ All unused temporary layers purged prior to submission'
          ]
        },
        improvementSuggestion: 'Keep maintaining this high standard of canvas hygiene!'
      }
    ],
    feedbackSections: {
      whatWentWell: [
        'Complete user flow with clearly articulated transition states.',
        'Strong component consistency adhering strictly to the 8pt spatial grid system.',
        'Properly nested auto-layout frames across all primary screen variants with no rogue absolute positioning.',
        'Exemplary canvas documentation with side-by-side original screen references.'
      ],
      whatNeedsImprovement: [
        'Make the secondary navigation path clearer in nested screens.',
        'State changes in the CTA button lack a distinct active/pressed micro-interaction.',
        'Inconsistent corner radiuses between metadata property rows (12px vs 8px).'
      ],
      whyItMatters: [
        'Users need an intuitive, effortless way to return to the previous stage of the flow without losing active form inputs.',
        'Corner radius consistency is critical for subconscious visual cohesion in enterprise software.'
      ],
      suggestedImprovements: [
        'Add a clearly visible persistent back button and preserve navigation breadcrumbs.',
        'Create a Figma Component Set with explicit hover, pressed, and disabled states.',
        'Define a single --radius-card token in local Figma variables.'
      ],
      facilitatorComments: 'Great effort on the auto-layout rigor, Ananya! The recreation is over 95% pixel-accurate. Polish the back-stack routing and this is ready for your portfolio showcase.'
    }
  },
  'eval-asg-2': {
    id: 'eval-asg-2',
    submissionId: 'sub-2026-002',
    assignmentId: 'asg-2',
    assignmentTitle: 'Friction Map: A Flow You Can Fix',
    courseTitle: 'UI/UX Product Design',
    studentName: 'Ananya Sharma',
    evaluatedAt: '26 Aug 2026, 06:00 PM',
    status: 'PUBLISHED',
    score: 15,
    maxScore: 20,
    percentage: 75,
    gradeBadge: 'Pass',
    facilitator: {
      name: 'Rohan Mehta',
      role: 'Lead Design Facilitator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    criteriaBreakdown: [
      {
        id: 'crit-2-1',
        title: 'Friction Discovery & Heuristic Rigor',
        score: 4,
        maxScore: 6,
        status: 'Competent',
        feedback: 'Identified the main queue drop-off point, but missed secondary friction in track reordering.',
        evidence: {
          available: true,
          source: 'Journey Flow Sheet',
          component: 'Step 4: Queue Rearrange',
          observations: [
            '✓ Recognized tap target confusion on mobile viewports',
            '⚠ Did not account for lack of undo capability after swipe-to-remove'
          ]
        },
        improvementSuggestion: 'Apply Nielsen’s heuristic #3 (User control and freedom) when auditing swipe deletions.'
      },
      {
        id: 'crit-2-2',
        title: 'Journey Map Precision',
        score: 5,
        maxScore: 6,
        status: 'Proficient',
        feedback: 'Visual journey map is clean, well-segmented, and easy to interpret.',
        evidence: {
          available: true,
          source: 'FigJam Board',
          component: 'Emotion Curve Diagram',
          observations: [
            '✓ Emotion curve mapped to user quotes',
            '✓ Color coding highlights drop-offs clearly'
          ]
        },
        improvementSuggestion: 'Include quantitative metrics (e.g. estimated completion seconds) alongside emotional ratings.'
      },
      {
        id: 'crit-2-3',
        title: 'UX Intervention Viability',
        score: 6,
        maxScore: 8,
        status: 'Proficient',
        feedback: 'The proposed drag handle is viable and intuitive.',
        evidence: {
          available: true,
          source: 'Redesign Wireframe',
          component: 'Queue Reorder List',
          observations: [
            '✓ Dedicated drag affordance on right edge',
            '✓ Clear visual feedback on lift state'
          ]
        },
        improvementSuggestion: 'Consider accessibility for keyboard or voice-activated drag operations.'
      }
    ],
    feedbackSections: {
      whatWentWell: [
        'Clear problem statement focused on real user queue friction.',
        'Thoughtful visual journey map in FigJam with well-annotated user emotional states.',
        'Viable, elegant solution using standard mobile interaction patterns.'
      ],
      whatNeedsImprovement: [
        'Heuristic coverage was somewhat narrow; consider Nielsen Norman 10 heuristics holistically.',
        'Lack of an undo toast or recovery state for accidental playlist deletions.'
      ],
      whyItMatters: [
        'Users experience severe frustration when an accidental destructive action cannot be instantly reversed.'
      ],
      suggestedImprovements: [
        'Add a transient 4-second undo snackbar after removing items from the queue.'
      ],
      facilitatorComments: 'Solid work, Ananya! Your journey map visual communication is improving steadily. Focus next on edge cases and error prevention.'
    }
  }
};

function getStoredSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored submissions', e);
  }
  return initialSubmissions;
}

function saveStoredSubmissions(submissions) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions', e);
  }
}

function getStoredReEvaluations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RE_EVALUATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored re-evaluations', e);
  }
  return {};
}

function saveStoredReEvaluations(reEvaluations) {
  try {
    localStorage.setItem(STORAGE_KEYS.RE_EVALUATIONS, JSON.stringify(reEvaluations));
  } catch (e) {
    console.error('Failed to save re-evaluations', e);
  }
}

export const mockStudentService = {
  getStudentProfile: async () => {
    return { success: true, data: getStoredProfile() };
  },

  updateStudentProfile: async (profileData) => {
    const current = getStoredProfile();
    const updated = {
      ...current,
      ...profileData,
      // Ensure system fields remain immutable
      studentId: current.studentId,
      cohort: current.cohort
    };
    saveStoredProfile(updated);
    return { success: true, data: updated, message: 'Profile updated successfully.' };
  },

  getCourses: async () => {
    return { success: true, data: mockCourses };
  },

  getCourse: async (courseId) => {
    const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
    return { success: true, data: course };
  },

  getUnit: async (unitId) => {
    for (const course of mockCourses) {
      const unitIndex = course.units.findIndex((u) => u.id === unitId);
      if (unitIndex !== -1) {
        const unit = course.units[unitIndex];
        const prevUnit = unitIndex > 0 ? course.units[unitIndex - 1] : null;
        const nextUnit = unitIndex < course.units.length - 1 ? course.units[unitIndex + 1] : null;
        const isLastUnit = unitIndex === course.units.length - 1;

        return {
          success: true,
          data: {
            ...unit,
            courseId: course.id,
            courseTitle: course.title,
            coursePhase: course.phase,
            associatedAssignment: mockAssignments[unit.assignmentId] || null,
            previousUnit: prevUnit ? { id: prevUnit.id, unitNumber: prevUnit.unitNumber, title: prevUnit.title } : null,
            nextUnit: nextUnit ? { id: nextUnit.id, unitNumber: nextUnit.unitNumber, title: nextUnit.title } : null,
            isLastUnit
          }
        };
      }
    }
    // Fallback to unit-4
    const course = mockCourses[0];
    return {
      success: true,
      data: {
        ...course.units[3],
        courseId: course.id,
        courseTitle: course.title,
        coursePhase: course.phase,
        associatedAssignment: mockAssignments['asg-4'],
        previousUnit: { id: 'unit-3', unitNumber: 3, title: 'UI Fundamentals' },
        nextUnit: { id: 'unit-5', unitNumber: 5, title: 'AI-Native Design' },
        isLastUnit: false
      }
    };
  },

  getAssignment: async (assignmentId) => {
    const asg = mockAssignments[assignmentId] || mockAssignments['asg-4'];
    return { success: true, data: asg };
  },

  getAssignmentRubric: async (assignmentId) => {
    const asg = mockAssignments[assignmentId] || mockAssignments['asg-4'];
    return {
      success: true,
      data: {
        assignmentId: asg?.id || assignmentId,
        assignmentTitle: asg?.title || 'Assignment',
        maxScore: asg?.maxMarks || asg?.maxScore || 20,
        criteria: asg?.rubric || []
      }
    };
  },

  getStudentAssignments: async () => {
    return { success: true, data: Object.values(mockAssignments) };
  },

  saveDraft: async (assignmentId, draftData) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.DRAFTS}${assignmentId}`, JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString()
      }));
      return { success: true, message: 'Draft saved successfully.' };
    } catch (e) {
      console.error('Failed to save draft', e);
      return { success: false, message: 'Could not save draft.' };
    }
  },

  getDraft: async (assignmentId) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.DRAFTS}${assignmentId}`);
      if (raw) return { success: true, data: JSON.parse(raw) };
    } catch (e) {
      console.error('Failed to get draft', e);
    }
    return { success: true, data: null };
  },

  submitAssignment: async (payload) => {
    const submissions = getStoredSubmissions();
    const assignment = mockAssignments[payload.assignmentId] || mockAssignments['asg-4'];

    const newSubmissionId = `sub-${Date.now().toString().slice(-6)}`;
    const newSubmission = {
      id: newSubmissionId,
      assignmentId: payload.assignmentId,
      assignmentTitle: assignment.title,
      courseId: assignment.courseId,
      courseTitle: assignment.courseTitle,
      unitId: assignment.unitId,
      unitTitle: assignment.unitTitle,
      submittedAt: new Date().toISOString(),
      status: 'PROCESSING', // PROCESSING / UNDER_REVIEW
      score: null,
      maxScore: assignment.maxScore,
      completedRequirements: payload.completedRequirements || ['Prototype Navigation', 'Meaningful Micro-motion', 'Interactive State Decision'],
      incompleteRequirements: payload.incompleteRequirements || ['Responsive Layout Stability', 'Public Figma Presentation Link'],
      completionPercentage: payload.completionPercentage ?? 60,
      isPartial: (payload.completionPercentage ?? 100) < 100,
      artifacts: {
        figmaUrl: payload.figmaUrl,
        ...payload.artifacts
      },
      timeline: [
        {
          step: 'SUBMITTED',
          title: 'Submission Received',
          timestamp: 'Just now',
          completed: true
        },
        {
          step: 'PROCESSING',
          title: 'Figma File Validation & Node Ingestion',
          timestamp: 'In progress',
          completed: false
        },
        {
          step: 'AUTOMATED_ANALYSIS',
          title: 'Automated Spatial & Token Analysis',
          timestamp: 'Queued',
          completed: false
        },
        {
          step: 'FACILITATOR_REVIEW',
          title: 'Facilitator Assessment & Rubric Scoring',
          timestamp: 'Pending facilitator',
          completed: false,
          actor: 'Rohan Mehta'
        },
        {
          step: 'PUBLISHED',
          title: 'Final Evaluation Approved & Published',
          timestamp: 'Pending approval',
          completed: false
        }
      ]
    };

    const updated = [newSubmission, ...submissions];
    saveStoredSubmissions(updated);
    // Clear draft after submit
    try {
      localStorage.removeItem(`${STORAGE_KEYS.DRAFTS}${payload.assignmentId}`);
    } catch (_) {}

    return {
      success: true,
      data: newSubmission,
      message: 'Assignment submitted successfully.'
    };
  },

  getSubmission: async (submissionId) => {
    const submissions = getStoredSubmissions();
    let sub = submissions.find((s) => s.id === submissionId);
    if (!sub) {
      sub = submissions[0];
    }
    return { success: true, data: sub };
  },

  getStudentSubmissions: async () => {
    const submissions = getStoredSubmissions();
    return { success: true, data: submissions };
  },

  getEvaluation: async (evaluationId) => {
    const evaluation = mockEvaluations[evaluationId] || mockEvaluations['eval-asg-3'];
    return { success: true, data: evaluation };
  },

  requestReEvaluation: async (payload) => {
    const reEvaluations = getStoredReEvaluations();
    const reEvaluationId = `reeval-${Date.now().toString().slice(-6)}`;
    const record = {
      id: reEvaluationId,
      evaluationId: payload.evaluationId,
      assignmentId: payload.assignmentId || 'asg-3',
      requestedAt: new Date().toISOString(),
      reason: payload.reason,
      status: 'REQUESTED',
      facilitatorNotes: null,
      submittedDateDisplay: 'Just now'
    };
    reEvaluations[payload.evaluationId] = record;
    saveStoredReEvaluations(reEvaluations);

    return {
      success: true,
      data: record,
      message: 'Re-evaluation request submitted successfully.'
    };
  },

  getReEvaluation: async (evaluationId) => {
    const reEvaluations = getStoredReEvaluations();
    const record = reEvaluations[evaluationId] || null;
    return { success: true, data: record };
  }
};

export default mockStudentService;
