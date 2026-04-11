import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type FavoriteRow = {
  listing_id: string;
};

export default defineEventHandler(async (event) => {
  await ensureSchema();
  const user = await requireUser(event);
  const db = getDb();

  const rows = await db<FavoriteRow[]>`
    SELECT listing_id
    FROM user_housing_favorites
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;

  return {
    listingIds: rows.map((row) => row.listing_id),
  };
});
