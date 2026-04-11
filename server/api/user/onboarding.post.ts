import { createError, readBody } from "h3";
import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";
import {
  generateRoadmapSteps,
  sanitizeOnboardingInput,
  stringifyExternalLinksText,
  stringifyListText,
} from "../../utils/roadmap";

type OnboardingBody = Record<string, unknown>;

export default defineEventHandler(async (event) => {
  const body = await readBody<OnboardingBody>(event);
  const user = await requireUser(event);
  await ensureSchema();

  const input = sanitizeOnboardingInput(body);
  const { steps, housing, generation } = await generateRoadmapSteps(input);

  if (steps.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Could not build roadmap for this profile",
    });
  }

  const db = getDb();

  await db.begin(async (transaction) => {
    await transaction`
      INSERT INTO user_onboarding (
        user_id,
        country_of_origin,
        immigration_status,
        primary_goal,
        timeline_weeks,
        needs_housing,
        needs_paperwork,
        needs_bookings,
        profile_json,
        generation_meta_json,
        housing_json,
        updated_at
      )
      VALUES (
        ${user.id},
        ${input.countryOfOrigin},
        ${input.immigrationStatus},
        ${input.primaryGoal},
        ${input.timelineWeeks},
        ${input.needsHousing},
        ${input.needsPaperwork},
        ${input.needsBookings},
        ${JSON.stringify(input)},
        ${JSON.stringify(generation)},
        ${JSON.stringify(housing ?? {})},
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        country_of_origin = EXCLUDED.country_of_origin,
        immigration_status = EXCLUDED.immigration_status,
        primary_goal = EXCLUDED.primary_goal,
        timeline_weeks = EXCLUDED.timeline_weeks,
        needs_housing = EXCLUDED.needs_housing,
        needs_paperwork = EXCLUDED.needs_paperwork,
        needs_bookings = EXCLUDED.needs_bookings,
        profile_json = EXCLUDED.profile_json,
        generation_meta_json = EXCLUDED.generation_meta_json,
        housing_json = EXCLUDED.housing_json,
        updated_at = NOW()
    `;

    await transaction`
      DELETE FROM user_roadmap_steps
      WHERE user_id = ${user.id}
    `;

    for (const step of steps) {
      await transaction`
        INSERT INTO user_roadmap_steps (
          user_id,
          step_id,
          title,
          category,
          goal,
          requirements_text,
          explanation,
          external_links_text,
          dependency_ids_text,
          warning_text,
          step_data_json,
          step_order,
          status,
          completed_at,
          updated_at
        )
        VALUES (
          ${user.id},
          ${step.id},
          ${step.title},
          ${step.category},
          ${step.goal},
          ${stringifyListText(step.requirements)},
          ${step.explanation},
          ${stringifyExternalLinksText(step.externalLinks)},
          ${stringifyListText(step.dependencyIds)},
          ${step.warning},
          ${JSON.stringify(step.data ?? {})},
          ${step.order},
          ${step.status},
          ${step.completedAt},
          NOW()
        )
      `;
    }
  });

  return {
    onboarding: input,
    steps,
  };
});
