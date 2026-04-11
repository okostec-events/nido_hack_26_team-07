import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";
import type { HousingRecommendations } from "../../utils/housing";

export type { HousingPlatform, HousingRecommendations } from "../../utils/housing";

type OnboardingRow = { housing_json: string };

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  await ensureSchema();
  const db = getDb();

  const rows = await db<OnboardingRow[]>`
    SELECT housing_json
    FROM user_onboarding
    WHERE user_id = ${user.id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return { onboarded: false, recommendations: null };
  }

  try {
    const row = rows[0];
    if (!row) return { onboarded: true, recommendations: null };
    const parsed = JSON.parse(row.housing_json) as HousingRecommendations;
    if (
      parsed &&
      typeof parsed === "object" &&
      (Array.isArray(parsed.shortTerm) || Array.isArray(parsed.longTerm))
    ) {
      return { onboarded: true, recommendations: parsed };
    }
  } catch {
    // fall through
  }

  return { onboarded: true, recommendations: null };
});
