import { createError, getRouterParam, readBody } from "h3";
import type postgres from "postgres";
import { requireUser } from "../../../utils/auth";
import { ensureSchema, getDb } from "../../../utils/db";
import {
  canCompleteStep,
  computeUnlockedStepIds,
  parseExternalLinksText,
  parseListText,
  type RoadmapStep,
  type StepStatus,
} from "../../../utils/roadmap";

type UpdateBody = {
  status?: unknown;
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

const toStatus = (value: unknown): StepStatus => {
  if (
    value === "blocked" ||
    value === "pending" ||
    value === "in-progress" ||
    value === "completed"
  ) {
    return value;
  }

  return "pending";
};

const mapStepRow = (row: StepRow): RoadmapStep => ({
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

const fetchSteps = async (
  sql: postgres.Sql,
  userId: string,
): Promise<RoadmapStep[]> => {
  const rows = await sql<StepRow[]>`
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
    WHERE user_id = ${userId}
    ORDER BY step_order ASC
  `;

  return rows.map(mapStepRow);
};

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  await ensureSchema();

  const stepId = getRouterParam(event, "stepId")?.trim();
  if (!stepId) {
    throw createError({
      statusCode: 400,
      statusMessage: "stepId is required",
    });
  }

  const body = await readBody<UpdateBody>(event);
  const nextStatus = toStatus(body.status);

  if (nextStatus !== "completed" && nextStatus !== "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only completed or pending status updates are allowed",
    });
  }

  const db = getDb();
  const steps = await fetchSteps(db, user.id);
  const targetStep = steps.find((step) => step.id === stepId);

  if (!targetStep) {
    throw createError({
      statusCode: 404,
      statusMessage: "Roadmap step not found",
    });
  }

  if (nextStatus === "completed") {
    const completionCheck = canCompleteStep(targetStep, steps);
    if (!completionCheck.allowed) {
      throw createError({
        statusCode: 409,
        statusMessage: "Step is blocked by unmet dependencies",
        data: {
          missingDependencies: completionCheck.missingDependencies,
        },
      });
    }
  }

  await db.begin(async (transaction) => {
    await transaction`
      UPDATE user_roadmap_steps
      SET
        status = ${nextStatus},
        completed_at = ${nextStatus === "completed" ? new Date().toISOString() : null},
        updated_at = NOW()
      WHERE user_id = ${user.id}
        AND step_id = ${stepId}
    `;

    const refreshedSteps = await fetchSteps(transaction, user.id);
    const unlockedIds = computeUnlockedStepIds(refreshedSteps);

    if (unlockedIds.length > 0) {
      await transaction`
        UPDATE user_roadmap_steps
        SET
          status = 'pending',
          updated_at = NOW()
        WHERE user_id = ${user.id}
          AND step_id = ANY(${unlockedIds})
          AND status = 'blocked'
      `;
    }
  });

  const nextSteps = await fetchSteps(db, user.id);
  const updated = nextSteps.find((step) => step.id === stepId) ?? null;
  const newlyUnlocked = nextSteps.filter((step) => step.status === "pending");

  return {
    step: updated,
    nextPendingStepIds: newlyUnlocked.map((step) => step.id),
  };
});
