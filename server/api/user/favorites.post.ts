import { createError, readBody } from "h3";
import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type FavoritesBody = {
  listingId?: unknown;
  saved?: unknown;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<FavoritesBody>(event);
  const listingId =
    typeof body.listingId === "string" ? body.listingId.trim() : "";
  const saved = body.saved === true;

  if (!listingId || listingId.length > 64) {
    throw createError({
      statusCode: 400,
      statusMessage: "listingId must be a non-empty string",
    });
  }

  await ensureSchema();
  const user = await requireUser(event);
  const db = getDb();

  if (saved) {
    await db`
      INSERT INTO user_housing_favorites (user_id, listing_id)
      VALUES (${user.id}, ${listingId})
      ON CONFLICT (user_id, listing_id) DO NOTHING
    `;
  } else {
    await db`
      DELETE FROM user_housing_favorites
      WHERE user_id = ${user.id} AND listing_id = ${listingId}
    `;
  }

  return {
    ok: true,
  };
});
