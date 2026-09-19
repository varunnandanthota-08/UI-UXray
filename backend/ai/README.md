# AI Evaluation Layer

## Purpose

The `backend/ai` layer prepares assignment submissions and rubric context for future AI-assisted evaluation of UI/UX and product design work.

The rubric and facilitator-defined assignment requirements are the primary basis for evaluation. The AI layer is advisory only. A facilitator must review the output and confirm final marks.

## Current status

- Submission normalization is available.
- Rubric evaluation and feedback service interfaces are available.
- Reusable rubric and feedback prompt builders are available.
- Structured response parsing is available.
- No AI provider is configured or called.
- No routes or controllers are included.
- No database access occurs in this layer.

The current service functions return empty or explicitly insufficient-evidence structures so they do not pretend that an AI evaluation has happened.

## Planned services

- `services/submissionAnalyzer.js`: normalize submitted URLs and supporting UX/product design text.
- `services/rubricChecker.js`: evaluate normalized submissions against supplied rubric criteria through a future provider.
- `services/feedbackGenerator.js`: generate strengths, missing requirements, improvements, and criterion observations through a future provider.
- `prompts/`: build provider-neutral prompts that prohibit invented evidence, cross-student comparison, and automatic final scoring.
- `utils/aiResponseParser.js`: parse and validate structured JSON responses safely.

## Expected input/output

Services will receive assignment data, requirements, facilitator-defined rubric data, and normalized submission data. Rubric results use these statuses:

- `PASS`
- `PARTIAL`
- `MISSING`
- `INSUFFICIENT_EVIDENCE`

Feedback uses this shape:

```json
{
  "strengths": [],
  "missingRequirements": [],
  "improvements": [],
  "criterionObservations": []
}
```

AI output must never automatically become `finalMarks`. The facilitator remains responsible for reviewing and approving the final evaluation.

No mock data or seed data is created by this layer, and no records are inserted into MongoDB.
