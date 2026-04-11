import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";
import {
  parseExternalLinksText,
  parseListText,
  sanitizeOnboardingInput,
  type OnboardingInput,
  type RoadmapStep,
  type StepStatus,
} from "../../utils/roadmap";

type OnboardingRow = {
  country_of_origin: string;
  immigration_status: string;
  primary_goal: string;
  timeline_weeks: number;
  needs_housing: boolean;
  needs_paperwork: boolean;
  needs_bookings: boolean;
  profile_json: string;
};

type StepRow = {
  step_id: string;
  title: string;
  category: string;
  goal: string;
  requirements_text: string;
  explanation: string;
  external_links_text: string;
  dependency_ids_text: string;
  warning_text: string | null;
  step_order: number;
  status: string;
  completed_at: string | null;
};

const toOnboardingInput = (row: OnboardingRow): OnboardingInput => {
  try {
    const parsed = JSON.parse(row.profile_json);
    if (typeof parsed === "object" && parsed !== null) {
      return sanitizeOnboardingInput(parsed as Record<string, unknown>);
    }
  } catch {
    // Fallback to legacy columns if JSON payload is not available.
  }

  return {
    countryOfOrigin: row.country_of_origin,
    immigrationStatus: row.immigration_status,
    primaryGoal: row.primary_goal,
    timelineWeeks: Number(row.timeline_weeks),
    needsHousing: row.needs_housing,
    needsPaperwork: row.needs_paperwork,
    needsBookings: row.needs_bookings,
  };
};

const toStepStatus = (value: string): StepStatus => {
  if (
    value === "blocked" ||
    value === "pending" ||
    value === "in-progress" ||
    value === "completed"
  ) {
    return value;
  }

  return "blocked";
};

const toRoadmapStep = (row: StepRow): RoadmapStep => ({
  id: row.step_id,
  title: row.title,
  category: row.category,
  goal: row.goal,
  requirements: parseListText(row.requirements_text),
  explanation: row.explanation,
  externalLinks: parseExternalLinksText(row.external_links_text),
  dependencyIds: parseListText(row.dependency_ids_text),
  warning: row.warning_text,
  order: Number(row.step_order),
  status: toStepStatus(row.status),
  completedAt: row.completed_at,
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  await ensureSchema();
  const db = getDb();

  const onboardingRows = await db<OnboardingRow[]>`
    SELECT
      country_of_origin,
      immigration_status,
      primary_goal,
      timeline_weeks,
      needs_housing,
      needs_paperwork,
      needs_bookings,
      profile_json
    FROM user_onboarding
    WHERE user_id = ${user.id}
    LIMIT 1
  `;

  const stepRows = await db<StepRow[]>`
    SELECT
      step_id,
      title,
      category,
      goal,
      requirements_text,
      explanation,
      external_links_text,
      dependency_ids_text,
      warning_text,
      step_order,
      status,
      completed_at
    FROM user_roadmap_steps
    WHERE user_id = ${user.id}
    ORDER BY step_order ASC
  `;

  const steps = stepRows.map(toRoadmapStep);
  const completedCount = steps.filter(
    (step) => step.status === "completed",
  ).length;

  return {
    onboarding: onboardingRows[0] ? toOnboardingInput(onboardingRows[0]) : null,
    steps,
    summary: {
      total: steps.length,
      completed: completedCount,
      remaining: Math.max(steps.length - completedCount, 0),
    },
  };
});
