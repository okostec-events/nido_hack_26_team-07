import { createError, readBody } from "h3";
import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type ChecklistBody = {
  itemIndex?: unknown;
  done?: unknown;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<ChecklistBody>(event);
  const itemIndex = Number(body.itemIndex);
  const done = body.done === true;

  if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "itemIndex must be a valid integer",
    });
  }

  await ensureSchema();
  const user = await requireUser(event);
  const db = getDb();

  if (done) {
    await db`
      INSERT INTO user_checklist_items (user_id, item_index)
      VALUES (${user.id}, ${itemIndex})
      ON CONFLICT (user_id, item_index) DO NOTHING
    `;
  } else {
    await db`
      DELETE FROM user_checklist_items
      WHERE user_id = ${user.id} AND item_index = ${itemIndex}
    `;
  }

  return {
    ok: true,
  };
});
