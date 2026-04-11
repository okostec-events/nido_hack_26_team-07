import { getQuery } from "h3";
import { requireUser } from "../../../utils/auth";
import { ensureSchema, getDb } from "../../../utils/db";
import {
  canCompleteStep,
  parseExternalLinksText,
  parseListText,
  type RoadmapStep,
  type StepStatus,
} from "../../../utils/roadmap";

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

const toStatus = (value: string): StepStatus => {
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

const toStep = (row: StepRow): RoadmapStep => ({
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
  status: toStatus(row.status),
  completedAt: row.completed_at,
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  await ensureSchema();

  const db = getDb();
  const rows = await db<StepRow[]>`
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

  const steps = rows.map(toStep);
  const query = getQuery(event);
  const targetStepId =
    typeof query.stepId === "string" && query.stepId.trim().length > 0
      ? query.stepId.trim()
      : null;

  const targetSteps = targetStepId
    ? steps.filter((step) => step.id === targetStepId)
    : steps.filter((step) => step.status !== "completed");

  const warnings = targetSteps
    .map((step) => {
      const completion = canCompleteStep(step, steps);
      return {
        stepId: step.id,
        title: step.title,
        blocked: !completion.allowed,
        missingDependencies: completion.missingDependencies,
        warning: step.warning,
      };
    })
    .filter((entry) => entry.blocked || Boolean(entry.warning));

  return {
    warnings,
  };
});
